"use strict";
import dotenv from "dotenv";

dotenv.config();

const {
  NODE_ENV,
  MONGODB_URI,
  PORT,
  DB,
  JWT_SECRET_KEY,
  JWT_EXPIRES_IN,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_API_KEY,
  CLOUDINARY_NAME,
  SOCKET_PORT
} = process.env;

const env = NODE_ENV || "development";

export default {
  env,
  MONGODB_URI,
  PORT,
  DB,
  JWT_SECRET_KEY,
  JWT_EXPIRES_IN,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
  SOCKET_PORT
};
