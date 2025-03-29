import { Server, Socket } from "socket.io";

import { AcknowledgementFn, CallRequestPayload } from "../types/socket";

const callRequestController = (io: Server, socket: Socket) => {
  socket.on(
    "user:callRequest",
    async (
      { chatRoomId, signalData, userId, callType }: CallRequestPayload,
      acknowledgementFn: AcknowledgementFn
    ) => {
      try {
        // If call receiver is not in room
        const socketsInChatRoom = await io.in(chatRoomId).fetchSockets();

        if (socketsInChatRoom.length <= 1) {
          acknowledgementFn(false);
          return;
        }

        // Emit call request to other users in the chat room
        socket
          .to(chatRoomId)
          .timeout(5000)
          .emit(
            "user:callRequest",
            { chatRoomId, signalData, userId, callType },
            (err?: Error) => {
              if (err) {
                console.log("Emit error:", err);
              } else {
                acknowledgementFn(true);
              }
            }
          );
      } catch (error) {
        console.error("Call request handling error:", error);
        acknowledgementFn(false);
      }
    }
  );
};

const callAcceptedController = (io: Server, socket: Socket) => {
  socket.on("user:callAccepted", ({ chatRoomId, signalData }) => {
    socket.to(chatRoomId).emit("user:callAccepted", { signalData });
  });
};

const endCallController = (io: Server, socket: Socket) => {
  socket.on("user:endCall", ({ chatRoomId }) => {
    io.to(chatRoomId).emit("user:endCall");
  });
};

const callDeniedController = (io: Server, socket: Socket) => {
  socket.on("user:callDenied", ({ chatRoomId }) => {
    io.to(chatRoomId).emit("user:callDenied");
  });
};

export {
  callRequestController,
  callAcceptedController,
  endCallController,
  callDeniedController
};
