import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route";
import chatRoomRoutes from "./routes/chatroom.route";
import contactRoutes from "./routes/contact.route";
import profileRoutes from "./routes/profile.route";
import uploadRoutes from "./routes/upload.route";
import AppError from "./utils/req-error";
import errorHandler from "./middleware/error-handler";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/*", (req, _res, next) => {
  if (!req.cookies.userId)
    return next(new AppError(400, "You are not logged in"));

  next();
});
app.use("/api/chatRoom", chatRoomRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);

app.use(errorHandler);

export default app;
