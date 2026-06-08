import {
  AppError,
  asyncHandler,
  getCachedUser,
  getUnseenCount,
  setCachedUser,
  type AuthenticatedRequest,
} from "@chat-app/shared";
import axios from "axios";
import { Chat } from "../models/Chat.js";
import type { Response } from "express";
export const getAllChats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      throw AppError.badRequest("User Id Not Found Try to Create a New Chat");
    }

    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

    const chatWithUserData = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id !== String(userId));

        const unseenCount = await getUnseenCount(
          String(chat._id),
          String(userId),
        );

        let user = await getCachedUser(otherUserId!);

        if (!user) {
          try {
            const { data } = await axios.get(
              `${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`,
            );
            user = data;
            await setCachedUser(otherUserId!, data);
          } catch (error) {
            user = { _id: otherUserId, name: "Unknown User" };
          }
        }

        return {
          ...chat.toObject(),
          otherUserId,
          unseenCount,
          latestMessage: chat.latestMessage ?? null,
          user,
        };
      }),
    );

    return res.status(200).json({
      chats: chatWithUserData,
    });
  },
);
