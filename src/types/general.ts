import { Document } from "mongoose";

interface UnreadMessage {
  chatRoomId: string;
}

interface UserContact {
  contactDetails: string;
  name?: string;
}

export interface UserType extends Document {
  _id: string;
  chatRooms: string[];
  unreadMessages: UnreadMessage[];
  pinnedChatRooms: string[];
  contacts: UserContact[];
}

interface Message {
  text: string;
  timeSent: string;
}

interface ChatRoomMessageHistory {
  messages: Message[];
}

interface ChatRoomMember {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  status?: string;
}

export interface ChatRoomType extends Document {
  _id: string;
  members: ChatRoomMember[];
  roomType: "Private" | "Group";
  messageHistory: ChatRoomMessageHistory[];
}

export interface IChatRoomSummary {
  chatRoomId: string;
  roomType: "Private" | "Group";
  latestMessage: Message | null;
  unreadMessagesCount: number;
  pinned: boolean;
  profile?: ChatRoomMember & { name?: string };
  mode: string | null;
}
