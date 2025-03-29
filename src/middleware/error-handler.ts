import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    status,
    message: err.message || "Something went wrong"
  });
};

export default errorHandler;
