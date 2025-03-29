import { Types } from "mongoose";
import { Server, Socket } from "socket.io";

import { clearChatRoom } from "../controllers/chatroom.controller";

interface CustomSocket extends Socket {
  userId?: Types.ObjectId;
}

const typingController = (io: Server, socket: CustomSocket) => {
  socket.on("user:typing", (chatRoomId, userId) => {
    if (!socket.userId) return;

    socket
      .to(chatRoomId)
      .emit("user:typing", { userId: userId || socket.userId, chatRoomId });
  });
};

const recordingcontroller = (io: Server, socket: CustomSocket) => {
  socket.on("user:recording", (chatRoomId) => {
    if (!socket.userId) return;

    socket
      .to(chatRoomId)
      .emit("user:recording", { userId: socket.userId, chatRoomId });
  });

  socket.on("user:recordingStopped", (chatRoomId) => {
    if (!socket.userId) return;

    socket
      .to(chatRoomId)
      .emit("user:recordingStopped", { userId: socket.userId, chatRoomId });
  });
};

const clearChatRoomController = (io: Server, socket: Socket) => {
  socket.on("user:chatRoomClear", async ({ chatRoomId }) => {
    await clearChatRoom({ chatRoomId });
    io.to(chatRoomId).emit("user:chatRoomClear", { chatRoomId });
  });
};

export { typingController, recordingcontroller, clearChatRoomController };
