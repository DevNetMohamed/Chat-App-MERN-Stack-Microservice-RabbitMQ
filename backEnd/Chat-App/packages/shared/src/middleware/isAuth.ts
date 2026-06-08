import type { Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "./asyncHandler.js";

import type {
  AuthenticatedRequest,
  IUser,
} from "../interfaces/UserInterface/User.js";

interface JwtPayloadWithUser extends JwtPayload {
  user: IUser;
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

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw AppError.badRequest("JWT_SECRET is not defined");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadWithUser;

      if (!decoded.user) {
        throw AppError.unauthorized("Invalid token");
      }

      req.user = decoded.user;

      next();
    } catch {
      throw AppError.unauthorized("Invalid or expired token");
    }
  },
);
