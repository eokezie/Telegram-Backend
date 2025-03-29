import { Document, Types } from "mongoose";

export interface ContactType extends Document {
  _id: string;
  contactDetails: Types.ObjectId;
  name: string;
  chatRoomId: Types.ObjectId;
}

export interface UserType extends Document {
  _id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  contacts: ContactType[];
  status: {
    online: boolean;
    lastSeen: Date;
  };
  password: string;
  confirmPassword: string | undefined;
  chatRooms: Types.ObjectId[];
  pinnedChatRooms: string[];
  unreadMessages: any[];
  undeliveredMessages: any[];
  checkPasswordValidity(
    givenPassword: string,
    originalPassword: string
  ): Promise<boolean>;
}
