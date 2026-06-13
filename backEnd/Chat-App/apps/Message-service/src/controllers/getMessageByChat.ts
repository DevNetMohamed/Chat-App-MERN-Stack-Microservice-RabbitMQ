import {
  AppError,
  asyncHandler,
  redisClient,
  type AuthenticatedRequest,
} from "@chat-app/shared";
import { Message } from "../models/message.js";

export const getMessageByChat = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;
    console.log(req.params);

    console.log("error");

    if (!userId) {
      throw AppError.unauthorized("You are not Autherized");
    }
    if (!chatId) {
      throw AppError.notFound("Chat ID Not Found... please Try Again");
    }

    const redis = redisClient();
    const cacheKey = `messages:${chatId}`;
    const cached = await redis.get(cacheKey);

    console.log("cached:", typeof cached);

    if (cached) {
      const message = typeof cached === "string" ? JSON.parse(cached) : cached;
      console.log(message);

      return res.status(200).json({
        fromCach: true,
        message,
      });
    }

    const message = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .lean();

    console.log("message", typeof message);
    await redis.set(cacheKey, JSON.stringify(message), { ex: 300 });

    return res.status(200).json({
      fromCache: false,
      message,
    });
  },
);
