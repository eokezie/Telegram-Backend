import { catchAsync } from "../utils/catch-async-error";
import { cloudinaryUpload } from "../utils/cloudinary";
import AppError from "../utils/req-error";

const upload = catchAsync(async (req, res, next) => {
  const fileBase64 = req.body.data;

  const uploadData = await cloudinaryUpload.uploader
    .upload(fileBase64, {
      upload_preset: "telegram_preset",
      resource_type: req.body.fileType,
      width: 400,
      height: 400,
      crop: "limit"
    })
    .catch((error) => console.log(error));

  if (!uploadData) {
    return next(new AppError(500, "Upload failed"));
  }

  res.status(200).json({
    status: "success",
    data: {
      uploadData
    }
  });
});

export { upload };
