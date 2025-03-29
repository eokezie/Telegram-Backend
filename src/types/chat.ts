import { Document, Types } from "mongoose";

type RejectReasons = "Missed" | "Busy";
type RoomType = "Private" | "Group";

export interface CallDetailsType extends Document {
  _id: string;
  callType: string;
  callDuration: string;
  callRejectReason: RejectReasons;
}

export interface MessageType extends Document {
  _id: string;
  messageType: string;
  sender: Types.ObjectId;
  readStatus: boolean;
  deliveredStatus: boolean;
  undeliveredMembers: Types.ObjectId[];
  unreadMembers: Types.ObjectId[];
  timeSent: Date;
  message: string;
  imageUrl: string;
  callDetails: CallDetailsType;
  voiceNoteUrl: string;
  voiceNoteDuration: string;
}

export interface ChatRoom extends Document {
  _id: string;
  roomType: RoomType;
  members: Types.ObjectId[];
  messageHistory:
    | [
        {
          day: Number;
          messages: MessageType;
        }
      ]
    | any;
}
