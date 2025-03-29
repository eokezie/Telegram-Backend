import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import {
  createChatRoom,
  checkIfChatRoomExists,
  deleteChatRoom
} from "./chatroom.controller";
import { UserType } from "../types/user";
import { catchAsync } from "../utils/catch-async-error";
import AppError from "../utils/req-error";
import {
  getUserService,
  getUserByUsernameService,
  populateUserService
} from "../services/chatroom.service";

const getAllContacts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: UserType | null = await populateUserService(req.cookies.userId);
    if (!user) return next(new AppError(400, "Username does not exist"));

    res.status(200).json({
      status: "success",
      data: {
        contacts: user.contacts
      }
    });
  }
);

const addNewContact = catchAsync(
  async (
    req: Request<{}, {}, { username: string; name: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, username } = req.body;
    if (!username) return next(new AppError(400, "Contact username is needed"));

    const user: UserType | null = await getUserService(req.cookies.userId);
    const newContact: UserType | null =
      await getUserByUsernameService(username);

    if (!user) return next(new AppError(400, "Username does not exist"));
    if (!newContact) return next(new AppError(400, "User does not exist"));
    if (user.username === newContact.username)
      return next(new AppError(400, "You can't add yourself as a contact"));

    for (let contact of user.contacts) {
      if (contact.contactDetails.toString() === newContact._id.toString()) {
        return next(new AppError(400, "Contact exists already"));
      }

      if (contact.name === name) {
        return next(new AppError(400, "Contact name exists already"));
      }
    }

    let chatRoomId: Types.ObjectId | null | undefined =
      await checkIfChatRoomExists(user, newContact);

    if (!chatRoomId) {
      const chatRoomDetails = {
        roomType: "Private",
        members: [
          new Types.ObjectId(newContact._id),
          new Types.ObjectId(user._id)
        ],
        messageHistory: []
      };

      const newChatRoom = await createChatRoom(chatRoomDetails as any);

      if (!newChatRoom)
        return next(new AppError(404, "Contact could not be added"));

      chatRoomId = newChatRoom._id as any;

      user.chatRooms.push(new Types.ObjectId(newContact._id));
      newContact.chatRooms.push(new Types.ObjectId(newContact._id));
    }

    const newContactData = {
      name,
      contactDetails: newContact._id,
      chatRoomId
    };

    user.contacts.push(newContactData as any);

    await user.save({ validateBeforeSave: false });
    await newContact.save({ validateBeforeSave: false });

    res.status(201).json({
      status: "success",
      data: {
        contact: {
          name,
          contactDetails: {
            username: newContact.username,
            _id: newContact._id,
            avatar: newContact.avatar,
            bio: newContact.bio,
            status: newContact.status
          },
          chatRoomId
        }
      }
    });
  }
);

const deleteContact = catchAsync(
  async (
    req: Request<{}, {}, { username: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { username } = req.body;

    if (!username)
      return next(new AppError(400, "Contact username is missing"));

    const user: UserType | null = await getUserService(req.cookies.userId);
    const aimedContact: UserType | null =
      await getUserByUsernameService(username);

    if (!aimedContact) return next(new AppError(400, "User does not exist"));
    if (!user) return next(new AppError(400, "Username does not exist"));

    let chatRoomId: Types.ObjectId | null = null;

    const id = aimedContact._id.toString();

    user.contacts = user.contacts.filter((contact) => {
      if (contact.contactDetails.toString() === id) {
        chatRoomId = contact.chatRoomId;
        return false;
      }

      return true;
    });

    if (!chatRoomId) {
      throw new Error("Chat room ID is undefined");
    }

    const chatRoomExists = await checkIfChatRoomExists(user, aimedContact);

    if (!chatRoomExists) {
      await deleteChatRoom(chatRoomId);

      user.chatRooms = user.chatRooms.filter(
        (roomId) => roomId.toString() !== chatRoomId!.toString()
      );
      aimedContact.chatRooms = aimedContact.chatRooms.filter(
        (roomId) => roomId.toString() !== chatRoomId!.toString()
      );

      user.pinnedChatRooms = user.pinnedChatRooms.filter(
        (roomId) => roomId.toString() !== chatRoomId!.toString()
      );
      aimedContact.pinnedChatRooms = aimedContact.pinnedChatRooms.filter(
        (roomId) => roomId.toString() !== chatRoomId!.toString()
      );

      await aimedContact.save({ validateBeforeSave: false });
    }

    await user.save({ validateBeforeSave: false });

    res.status(204).json({
      status: "success",
      message: "Contact successfully deleted"
    });
  }
);

export { addNewContact, getAllContacts, deleteContact };
