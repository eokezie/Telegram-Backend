import { Server, Socket } from "socket.io";

import { checkMembersOffUndeliveredListInMessage } from "../controllers/chatroom.controller";
import User from "../models/user.model";
import AppError from "../utils/req-error";

interface CustomSocket extends Socket {
  userId?: string;
}

const getSocketDetails = async (userId: string) => {
  const userModel = await User.findById(userId);

  if (!userModel) return new AppError(400, "User does not exist");
  const allRoomsUserIn = userModel.chatRooms.map((room) => room.toString());

  return { userModel, allRoomsUserIn };
};

const onlineController = (io: Server, socket: CustomSocket) => {
  socket.on("user:online", async (userId: string) => {
    const trimmedUserId = userId.trim();

    socket.userId = trimmedUserId;

    socket.userId = userId;

    const result = await getSocketDetails(socket.userId);

    if (!result) {
      return socket.emit("error", { message: "User does not exist" });
    }

    // @ts-ignore
    const { userModel, allRoomsUserIn } = result;

    console.log(userModel, "USER MODEL");
    console.log(allRoomsUserIn, "USER ROOMS");

    if (!Array.isArray(allRoomsUserIn)) {
      return socket.emit("error", { message: "Invalid room list" });
    }

    socket.join(allRoomsUserIn);

    userModel.status = {
      online: true,
      lastSeen: undefined
    };

    for (let properties of userModel.undeliveredMessages) {
      await checkMembersOffUndeliveredListInMessage({
        membersId: [userId],
        io,
        ...properties
      });
    }

    userModel.undeliveredMessages = [];

    await userModel.save({ validateBeforeSave: false });

    socket.to(allRoomsUserIn).emit("user:online", userId);
  });
};

const offlineController = (io: Server, socket: CustomSocket) => {
  socket.on("user:offline", async () => {
    const { userId } = socket;

    // @ts-ignore
    const { userModel, allRoomsUserIn } = await getSocketDetails(
      userId as string
    );

    const time = new Date(Date.now()).toISOString();

    userModel.status = {
      online: false,
      lastSeen: time
    };

    await userModel.save({ validateBeforeSave: false });

    socket
      .to(allRoomsUserIn)
      .emit("user:offline", { userId: userModel._id, time });
  });
};

const disconnectingController = (io: Server, socket: CustomSocket) => {
  socket.on("disconnecting", async () => {
    if (!socket.userId) return;

    // @ts-ignore
    const { userModel, allRoomsUserIn } = await getSocketDetails(socket.userId);

    const time = new Date(Date.now()).toISOString();

    userModel.status = {
      online: false,
      lastSeen: time
    };

    await userModel.save({ validateBeforeSave: false });

    socket
      .to(allRoomsUserIn)
      .emit("user:offline", { userId: userModel._id, time });
  });
};

const joinRoomController = (io: Server, socket: CustomSocket) => {
  socket.on("user:joinRooms", ({ rooms }) => {
    socket.join(rooms);
  });
};

export {
  onlineController,
  offlineController,
  disconnectingController,
  joinRoomController
};
