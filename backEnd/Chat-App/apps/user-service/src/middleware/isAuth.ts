import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

import { AppError, asyncHandler } from "@chat-app/shared";
import type { IUser } from "../model/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const isAuth = asyncHandler(
  async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Authorization header missing or invalid");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw AppError.unauthorized("Token is missing");
    }

    const JWT_SECRET = process.env.JWT_SECRET!;

    if (!JWT_SECRET) {
      throw AppError.badRequest("JWT_SECRET is not defined");
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      if (!decoded.user) {
        throw AppError.unauthorized("Invalid Token");
      }

      req.user = decoded.user;

      next();
    } catch (error) {
      throw AppError.unauthorized("Invalid or Expired Token");
    }
  },
);
