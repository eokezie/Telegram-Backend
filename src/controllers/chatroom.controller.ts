import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import { UserType } from "../types/user";
import { catchAsync } from "../utils/catch-async-error";
import { ChatRoom as ChatRoomTypes } from "../types/chat";
import {
  getChatRoomSummaryForUserService,
  getUserService
} from "../services/chatroom.service";
import AppError from "../utils/req-error";
import ChatRoom from "../models/chat-room.model";

const createChatRoom = async (chatRoomDetails: ChatRoomTypes) =>
  await ChatRoom.create(chatRoomDetails);

const getChatRoom = catchAsync(
  // @ts-ignore
  async (
    req: Request<{ chatRoomId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { chatRoomId } = req.params;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) return next(new AppError(400, "Chat does not exist"));

    res.status(200).json({
      status: "success",
      data: { chatRoom }
    });
  }
);

export const getChatRoomSummaryForUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: UserType | null = await getUserService(req.cookies.userId);

    if (!user) return next(new AppError(400, "User not found"));
    const chatRoomSummary = await getChatRoomSummaryForUserService(user._id);

    res.status(200).json({
      status: "success",
      data: { chatRoomSummary }
    });
  }
);

const pinChatRoom = catchAsync(
  // @ts-ignore
  async (
    req: Request<{ chatRoomId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { chatRoomId } = req.params;
    const user: UserType | null = await getUserService(req.cookies.userId);

    if (!user) return next(new AppError(400, "User not found"));
    if (!chatRoomId) return next(new AppError(400, "Chatroom not found"));

    user.pinnedChatRooms.push(chatRoomId);
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        pinnedChatRooms: user.pinnedChatRooms
      }
    });
  }
);

const unpinChatRoom = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: UserType | null = await getUserService(req.cookies.userId);

    if (!user) return next(new AppError(400, "User not found"));

    user.pinnedChatRooms = user.pinnedChatRooms.filter(
      (chatRoomId) => chatRoomId.toString() !== req.params.chatRoomId
    );
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        pinnedChatRooms: user.pinnedChatRooms
      }
    });
  }
);

const checkIfChatRoomExists = async (
  user: UserType,
  secondaryUser: UserType
) => {
  let chatRoomId;

  /**
   * secondaryUser is the user not performing the action
   * Chat room exists if secondaryUser already has user as a contact
   */

  secondaryUser.contacts.forEach((contact) => {
    if (contact.contactDetails.toString() === user._id.toString()) {
      chatRoomId = contact.chatRoomId;
    }
  });

  return chatRoomId;
};

const deleteChatRoom = async (chatRoomId: Types.ObjectId) => {
  await ChatRoom.findByIdAndDelete(chatRoomId);
};

const clearChatRoom = async ({ chatRoomId }: any) => {
  const chatRoom = await ChatRoom.findById(chatRoomId);

  if (!chatRoom) return new AppError(400, "Chatroom not found");

  chatRoom.messageHistory = [];

  if (chatRoom?.members) {
    for (const memberId of chatRoom.members) {
      const memberModel: UserType | null = await getUserService(
        memberId.toString()
      );

      if (memberModel) {
        memberModel.unreadMessages = memberModel.unreadMessages.filter(
          (data) => data.chatRoomId.toString() !== chatRoom._id.toString()
        );

        memberModel.undeliveredMessages =
          memberModel.undeliveredMessages.filter(
            (data) => data.chatRoomId.toString() !== chatRoom._id.toString()
          );

        await memberModel.save();
      } else {
        return new AppError(400, "Member not found");
      }
    }
  }

  await chatRoom.save();
};

const getAllChatRoomUserIn = async (userId: string) => {
  const user: UserType | null = await getUserService(userId);

  if (!user) return new AppError(400, "User not found");

  return user.chatRooms;
};

const addMessageToChatRoom = async (chatRoomId: string, message: any) => {
  const chatRoom = await ChatRoom.findById(chatRoomId);

  if (!chatRoom) return new AppError(400, "Chatroom not found");

  const lastDayMessage =
    chatRoom.messageHistory[chatRoom.messageHistory.length - 1];

  const dayString = new Date(message.timeSent).toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  });

  const day = new Date(dayString).getTime();

  message.undeliveredMembers = chatRoom.members;
  message.unreadMembers = chatRoom.members.filter(
    (memberId) => memberId.toString() !== message.sender.toString()
  );

  if (lastDayMessage?.day === day) {
    lastDayMessage.messages.push(message);
  } else {
    const newDayObject = {
      day,
      messages: [message]
    };
    chatRoom.messageHistory.push(newDayObject);
  }

  await chatRoom.save();

  const messageObj =
    chatRoom.messageHistory[chatRoom.messageHistory.length - 1].messages[
      chatRoom.messageHistory[chatRoom.messageHistory.length - 1].messages
        .length - 1
    ];

  return { messageObj, chatRoom, day };
};

type GetMessageFromChatRoomType = {
  chatRoomId: string;
  messageId: string;
  day: any;
};

const getMessageFromChatRoom = async ({
  chatRoomId,
  messageId,
  day
}: GetMessageFromChatRoomType) => {
  const chatRoom = await ChatRoom.findById(chatRoomId);
  if (!chatRoom) throw new AppError(400, "Chatroom not found");

  if (!chatRoom.messageHistory.length)
    throw new AppError(404, "No messages found");

  const dayMessage = chatRoom.messageHistory.find(
    (dayMessage: any) => dayMessage.day === day
  );

  if (!dayMessage)
    throw new AppError(404, "Messages for the given day not found");

  const message = dayMessage.messages.find(
    (message: any) => message._id.toString() === messageId.toString()
  );

  if (!message) throw new AppError(404, "Message not found");

  return { message, chatRoom };
};

type CheckMemberOffUndeliveredListMessageType = {
  membersId: string[];
  messageId: string;
  chatRoomId: string;
  day: any;
  io: any;
};

const checkMembersOffUndeliveredListInMessage = async ({
  membersId,
  messageId,
  chatRoomId,
  day,
  io
}: CheckMemberOffUndeliveredListMessageType) => {
  const { message, chatRoom } = await getMessageFromChatRoom({
    day,
    messageId,
    chatRoomId
  });

  if (!message) return;

  message.undeliveredMembers = message.undeliveredMembers.filter(
    (memberId: string) => !membersId.includes(memberId.toString())
  );

  if (!message.undeliveredMembers.length) {
    message.deliveredStatus = true;

    io.to(chatRoomId).emit("user:messageDelivered", {
      messageId: message._id,
      senderId: message.sender,
      chatRoomId,
      day
    });
  }

  await chatRoom.save();

  return {
    undeliveredMembers: message.undeliveredMembers,
    messageDelivered: message.deliveredStatus
  };
};

type AddMessageAsUndeliveredToUserType = {
  undeliveredMembers: string[];
  messageId: string;
  chatRoomId: string;
  day: any;
};

const addMessageAsUndeliveredToUser = async ({
  undeliveredMembers,
  chatRoomId,
  messageId,
  day
}: AddMessageAsUndeliveredToUserType) => {
  for (let memberId of undeliveredMembers) {
    const memberModel: UserType | null = await getUserService(
      memberId.toString()
    );

    if (!memberModel) return new AppError(400, "User not found");

    memberModel.undeliveredMessages.push({
      day,
      chatRoomId,
      messageId
    });

    await memberModel.save();
  }
};

type AddMessageAsUnreadToUserType = {
  unreadMembers: string[];
  messageId: string;
  chatRoomId: string;
  day: any;
};

const addMessageAsUnreadToUser = async ({
  unreadMembers,
  chatRoomId,
  messageId,
  day
}: AddMessageAsUnreadToUserType) => {
  for (let memberId of unreadMembers) {
    const memberModel: UserType | null = await getUserService(
      memberId.toString()
    );

    if (!memberModel) return new AppError(400, "User not found");

    memberModel.unreadMessages.push({
      day,
      chatRoomId,
      messageId
    });

    await memberModel.save();
  }
};

type MarkMessageAsReadByUserType = {
  userId: string;
  messageId: string;
  chatRoomId: string;
  day: any;
  io: any;
};

const markMessageAsReadByUser = async ({
  messageId,
  chatRoomId,
  day,
  userId,
  io
}: MarkMessageAsReadByUserType) => {
  const { message, chatRoom } = await getMessageFromChatRoom({
    messageId,
    chatRoomId,
    day
  });

  if (!message) return;

  const user: UserType | null = await getUserService(userId);

  if (!user) return new AppError(400, "User not found");

  user.unreadMessages = user.unreadMessages.filter(
    (message) => message.messageId.toString() !== messageId.toString()
  );

  message.unreadMembers = message.unreadMembers.filter(
    (memberId: string) => memberId.toString() !== userId.toString()
  );

  if (!message.unreadMembers.length) {
    message.readStatus = true;

    io.to(chatRoomId).emit("user:messageReadByAllMembers", {
      messageId: message._id,
      senderId: message.sender,
      chatRoomId,
      day
    });
  }

  await chatRoom.save();
  await user.save();
};

export {
  createChatRoom,
  getChatRoom,
  pinChatRoom,
  unpinChatRoom,
  checkIfChatRoomExists,
  deleteChatRoom,
  clearChatRoom,
  getAllChatRoomUserIn,
  addMessageToChatRoom,
  getMessageFromChatRoom,
  checkMembersOffUndeliveredListInMessage,
  addMessageAsUndeliveredToUser,
  addMessageAsUnreadToUser,
  markMessageAsReadByUser
};
