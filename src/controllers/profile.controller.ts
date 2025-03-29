import { NextFunction, Request, Response } from "express";

import { catchAsync } from "../utils/catch-async-error";
import AppError from "../utils/req-error";
import User from "../models/user.model";

const getSelfProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.cookies.userId).select(
      "-contacts -password -__v"
    );

    if (!user) return next(new AppError(400, "User does not exist"));

    res.status(200).json({
      status: "Success",
      data: {
        user
      }
    });
  }
);

const updateSelfProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.cookies.userId, req.body, {
      new: true
    });

    if (!user) return next(new AppError(400, "User does not exist"));

    res.status(200).json({
      status: "Success",
      data: {
        user
      }
    });
  }
);

export { getSelfProfile, updateSelfProfile };
