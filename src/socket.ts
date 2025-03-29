import { Server } from "socket.io";

import { io } from "./server";

import {
  callAcceptedController,
  callDeniedController,
  callRequestController,
  endCallController
} from "./socket-controllers/call-controller";
import {
  disconnectingController,
  joinRoomController,
  offlineController,
  onlineController
} from "./socket-controllers/connection-controller";
import {
  markMessageReadController,
  messagingController
} from "./socket-controllers/message-controller";
import {
  clearChatRoomController,
  recordingcontroller,
  typingController
} from "./socket-controllers/user-action.controller";

const startSocketServer = async () => {
  io.on("connection", async (socket) => {
    console.log(`Connected to Socket.io server with ID: ${socket.id}!`);

    // -------------Connection controls -------------- //
    onlineController(io, socket);
    offlineController(io, socket);
    disconnectingController(io, socket);
    joinRoomController(io, socket);
    //--------------------------------------------------//

    // -------------User Action controls -------------- //
    typingController(io, socket);
    recordingcontroller(io, socket);
    clearChatRoomController(io, socket);
    //--------------------------------------------------//

    // -------------Message controls -------------- //
    messagingController(io, socket);
    markMessageReadController(io, socket);

    //--------------------------------------------------//

    // ----------------- Call controls --------------- //
    callRequestController(io, socket);
    callAcceptedController(io, socket);
    endCallController(io, socket);
    callDeniedController(io, socket);
    //--------------------------------------------------//
  });
};

export { startSocketServer };
