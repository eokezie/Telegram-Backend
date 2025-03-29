import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { ContactType, UserType } from "../types/user";

const Schema = mongoose.Schema;

const ContactSchema = new Schema<ContactType>({
  contactDetails: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  chatRoomId: mongoose.Schema.Types.ObjectId
});

const UserSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true
  },
  username: {
    unique: true,
    type: String,
    required: true,
    lower: true
  },
  bio: {
    type: String,
    min: 1,
    max: 100,
    default: "Hi there, I'm using Telegram"
  },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/dlanhtzbw/image/upload/v1675343188/Telegram%20Clone/no-profile_aknbeq.jpg"
  },
  contacts: [ContactSchema],
  status: {
    online: { type: Boolean, default: true },
    lastSeen: Date
  },
  password: {
    type: String,
    required: true,
    min: [8, "Password too short"]
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (givenPassword) {
        return givenPassword === this.password;
      },
      message: "Passwords do not match"
    }
  },
  chatRooms: [mongoose.Schema.Types.ObjectId],
  pinnedChatRooms: [],
  unreadMessages: [{}],
  undeliveredMessages: [{}]
});

UserSchema.pre("save", async function (next) {
  if (!this.isNew) this.$ignore("password");
  next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  this.confirmPassword = undefined;
  next();
});

UserSchema.methods.checkPasswordValidity = async function (
  givenPassword: string,
  originalPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, originalPassword);
};

const User = mongoose.model<UserType>("User", UserSchema);
export default User;
