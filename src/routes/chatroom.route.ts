import express, { Router } from "express";

import {
  getChatRoom,
  getChatRoomSummaryForUser,
  pinChatRoom,
  unpinChatRoom
} from "../controllers/chatroom.controller";

const router: Router = express.Router();

router.route("/summary").get(getChatRoomSummaryForUser);
router
  .route("/:chatRoomId")
  .get(getChatRoom)
  .post(pinChatRoom)
  .patch(unpinChatRoom);

export default router;
