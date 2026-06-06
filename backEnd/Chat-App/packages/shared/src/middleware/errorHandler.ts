import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // If it's our custom app error, use its specific properties
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Fallback for unhandled programmatic or third-party bugs
  console.error("Unexpected Error:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
