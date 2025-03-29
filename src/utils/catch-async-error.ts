import { Request, Response, NextFunction } from "express";

import AppError from "./req-error";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error) => next(new AppError(400, error.message)));
  };
};

export { catchAsync };
