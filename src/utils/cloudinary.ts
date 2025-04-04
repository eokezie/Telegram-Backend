import cloudinary from "cloudinary";

import config from "../config";

const cloudinaryUpload = cloudinary.v2;

cloudinaryUpload.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
});

export { cloudinaryUpload };
