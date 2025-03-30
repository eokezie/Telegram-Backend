import { IChatRoomSummary } from "../types/general";
import { ContactType, UserType } from "../types/user";
import { ChatRoom as ChatRoomType } from "../types/chat";
import AppError from "../utils/req-error";
import ChatRoom from "../models/chat-room.model";
import User from "../models/user.model";

const getUserService = async (userId: string) => {
  const user: UserType | null = await User.findById(userId);
  return user;
};

const getUserByUsernameService = async (username: string) => {
  const user: UserType | null = await User.findOne({
    username: username
  });
  return user;
};

const populateUserService = async (userId: string) => {
  const user: UserType | null = await User.findById(userId).populate({
    path: "contacts.contactDetails",
    select: "id username bio avatar status"
  });
  return user;
};

const getChatRoomSummaryForUserService = async (userId: string) => {
  const user = await getUserService(userId);
  if (!user) throw new AppError(404, "User not found");

  let chatRoomSummary: IChatRoomSummary[] = await Promise.all(
    user.chatRooms.map(async (chatRoomId: any) => {
      const outputSummary: Partial<IChatRoomSummary> = {};

      const chatRoom: ChatRoomType | null = await ChatRoom.findById(
        chatRoomId
      ).populate({
        path: "members",
        select: "id username avatar bio status"
      });

      if (!chatRoom) throw new AppError(400, "Chat room can't be found");

      if (chatRoom.messageHistory.length) {
        const lastDay =
          chatRoom.messageHistory[chatRoom.messageHistory.length - 1];
        outputSummary.latestMessage =
          lastDay.messages[lastDay.messages.length - 1];

        outputSummary.unreadMessagesCount = user.unreadMessages.reduce(
          (acc: any, curr: any) =>
            chatRoomId.toString() === curr.chatRoomId.toString()
              ? acc + 1
              : acc,
          0
        );
      } else {
        outputSummary.latestMessage = null;
        outputSummary.unreadMessagesCount = 0;
      }

      outputSummary.chatRoomId = chatRoomId;
      outputSummary.roomType = chatRoom.roomType;
      outputSummary.mode = null;

      if (chatRoom.roomType === "Private") {
        const profile = chatRoom.members.find(
          (member: any) => user._id.toString() !== member._id.toString()
        );

        if (profile) {
          // @ts-ignore
          outputSummary.profile = {
            ...profile,
            name: user.contacts.find(
              (contact: ContactType) =>
                contact.contactDetails.toString() === profile._id.toString()
            )?.name
          };
        }
      }

      outputSummary.pinned = user.pinnedChatRooms.some(
        (pinnedChatRoom: any) =>
          pinnedChatRoom.toString() === chatRoomId.toString()
      );

      return outputSummary as IChatRoomSummary;
    })
  );

  const sortByLatestMessage = (a: IChatRoomSummary, b: IChatRoomSummary) => {
    const latestMessageInATime = new Date(
      a.latestMessage?.timeSent || 0
    ).getTime();
    const latestMessageInBTime = new Date(
      b.latestMessage?.timeSent || 0
    ).getTime();
    return latestMessageInBTime - latestMessageInATime;
  };

  const pinnedChats = chatRoomSummary
    .filter((chatRoom) => chatRoom.pinned)
    .sort(sortByLatestMessage);
  const unpinnedChats = chatRoomSummary
    .filter((chatRoom) => !chatRoom.pinned)
    .sort(sortByLatestMessage);

  return [...pinnedChats, ...unpinnedChats];
};

export {
  getUserByUsernameService,
  getChatRoomSummaryForUserService,
  getUserService,
  populateUserService
};
