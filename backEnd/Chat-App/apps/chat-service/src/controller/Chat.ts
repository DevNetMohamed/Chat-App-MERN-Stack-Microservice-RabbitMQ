import {
  AppError,
  asyncHandler,
  type AuthenticatedRequest,
} from "@chat-app/shared";
import { Chat } from "../models/Chat.js";
import type { NextFunction, Response } from "express";

export const CreateNewChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { outherUserId } = req.body;

    console.log(req);

    if (!outherUserId) {
      throw AppError.badRequest("Another User ID is Require");
    }

    const existedChat = await Chat.findOne({
      users: { $all: [userId, outherUserId], $size: 2 },
    });
    if (existedChat) {
      res.json({
        message: "Chat is Already Exist",
        chayId: existedChat._id,
      });
      return;
    }

    const newChat = await Chat.create({
      users: [userId, outherUserId],
    });

    res.status(201).json({
      message: "New Chat Created",
      chatId: newChat._id,
    });
  },
);
