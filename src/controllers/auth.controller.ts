import { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/catch-async-error";
import { ILoginRequestBody } from "../types/auth";
import { assignTokenToCookie } from "../middleware/sign-token";
import User from "../models/user.model";
import AppError from "../utils/req-error";

const login = catchAsync(
  async (
    req: Request<{}, {}, ILoginRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { password, username } = req.body;

    if (!username || !password) {
      return next(new AppError(400, "Username and Password needed"));
    }

    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return next(new AppError(400, "Username or Password incorrect"));
    }

    const passwordGivenCorrect = await foundUser.checkPasswordValidity(
      password,
      foundUser.password
    );

    if (!passwordGivenCorrect) {
      return next(new AppError(400, "Username or Password incorrect"));
    }

    assignTokenToCookie(foundUser, res, 200);
  }
);

const register = catchAsync(
  async (req: Request<{}, {}, {}>, res: Response, next: NextFunction) => {
    const newUser = await User.create(req.body);

    assignTokenToCookie(newUser, res, 201);
  }
);

export { login, register };
