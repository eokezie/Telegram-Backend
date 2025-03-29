// import { createServer } from "http";
// import dotenv from "dotenv";

// import app from "./app";
// import connect from "./db/mongodb";
// import config from "./config";

// dotenv.config();
// export const httpServer = createServer();

// const db = config.MONGODB_URI;
// const port = config.PORT;

// httpServer.listen(config.SOCKET_PORT || 4000, () => {
//   console.log(
//     `WebSocket server is running and listening on port ${config.SOCKET_PORT} 🔌🔌🔌`
//   );
// });

// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: process.env.WEBSERVER_URI || "http://localhost:3001",
//     methods: ["GET", "POST"]
//   }
// });

// io.on("connection", (socket: any) => {
//   console.log("A client connected");
// });

// const expressServer = app.listen(port, () => {
//   console.log(`Server running on port ${port} 🚀`);
// });

// const startServer = async () => {
//   try {
//     await connect({ db });

//     return expressServer;
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// };

// export default startServer;

import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";

import app from "./app";
import connect from "./db/mongodb";
import config from "./config";

dotenv.config();

const httpServer = createServer(app);
const port = config.PORT || 4000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEBSERVER_URI || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

const startServer = async () => {
  try {
    await connect({ db: config.MONGODB_URI });

    httpServer.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
      console.log(`WebSocket server is running on the same port 🔌`);
    });

    return httpServer;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

export { io };
export default startServer;
