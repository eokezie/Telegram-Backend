import mongoose from "mongoose";

import { CallDetailsType, ChatRoom, MessageType } from "../types/chat";

const Schema = mongoose.Schema;

const CallDetailSchema = new Schema<CallDetailsType>({
  callType: String,
  callDuration: String,
  callRejectReason: { type: String, enum: ["Missed", "Busy"] }
});

const MessageSchema = new Schema<MessageType>({
  messageType: {
    type: String,
    required: true
  },
  sender: mongoose.Schema.Types.ObjectId,
  readStatus: {
    type: Boolean,
    default: false
  },
  deliveredStatus: {
    type: Boolean,
    default: false
  },
  undeliveredMembers: [mongoose.Schema.Types.ObjectId],
  unreadMembers: [mongoose.Schema.Types.ObjectId],
  timeSent: Date,
  message: String,
  imageUrl: String,
  callDetails: CallDetailSchema,
  voiceNoteUrl: String,
  voiceNoteDuration: String
});

const ChatSchema = new Schema<ChatRoom>({
  roomType: {
    type: String,
    enum: ["Private", "Group"]
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messageHistory: [{ day: Number, messages: [MessageSchema] }]
});

ChatSchema.set("toJSON", { virtuals: true });

const ChatRoom = mongoose.model<ChatRoom>("ChatRoom", ChatSchema);
export default ChatRoom;
