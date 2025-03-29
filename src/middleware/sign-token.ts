import { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

import config from "../config";

const signToken = (user: any) => {
  if (!config.JWT_SECRET_KEY) {
    throw new Error(
      "JWT_SECRET_KEY is not defined. Please check your environment variables."
    );
  }

  const signingOptions: SignOptions = {
    expiresIn: "1d"
  };
  return jwt.sign(
    { id: user._id },
    config.JWT_SECRET_KEY as string,
    signingOptions
  );
};

const assignTokenToCookie = (user: any, res: Response, statusCode: number) => {
  const token = signToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    expires: new Date(
      Date.now() + parseInt(config.JWT_EXPIRES_IN!) * 24 * 60 * 60 * 1000
    )
  };

  res.cookie("telegramToken", token, cookieOptions);
  res.cookie("userId", user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user
    }
  });
};

export { signToken, assignTokenToCookie };
