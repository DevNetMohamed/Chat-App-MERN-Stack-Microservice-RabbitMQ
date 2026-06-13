import {
  AppError,
  asyncHandler,
  redisClient,
  publishEvent,
  type AuthenticatedRequest,
  rpcRequest,
} from "@chat-app/shared";
import type { Response } from "express";
import { Message } from "../models/message.js";

export const sendMessage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;

    if (!senderId) throw AppError.unauthorized("Unauthorized");
    if (!chatId) throw AppError.badRequest("chatId is required");
    if (!text && !imageFile) {
      throw AppError.badRequest("Message must have text or media");
    }

    const senderIdStr = String(senderId);

    const redis = redisClient();

    const getMessageType = (mimetype?: string) => {
      if (!mimetype) return "text";
      if (mimetype.startsWith("image/")) return "image";
      if (mimetype.startsWith("video/")) return "video";
      return "file";
    };

    const message = await Message.create({
      chatId,
      sender: senderIdStr,
      text: text || null,
      image: imageFile
        ? {
            mediaUrl: imageFile.path,
            mediaPublicId: imageFile.filename,
          }
        : null,
      messageType: imageFile ? getMessageType(imageFile.mimetype) : "text",
      seen: false,
      isDeleted: false,
    });

    await redis.set(
      `lastMessage:${chatId}`,
      JSON.stringify({
        text: text || "Media",
        sender: senderId,
        createdAt: new Date().toISOString(),
      }),
      { ex: 60 * 60 * 24 },
    );

    let members: string[] = [];
    const cachedMembers = await redis.get(`chat:${chatId}`);

    if (cachedMembers) {
      try {
        members = JSON.parse(cachedMembers as string);
      } catch {
        members = [];
      }
    } else {
      const { users, found } = await rpcRequest("get_chat", { chatId });
      if (!found || !users?.length) {
        throw AppError.notFound("Chat not found");
      }
      members = users;
      await redis.set(`chat:${chatId}`, JSON.stringify(users), { ex: 3600 });
    }

    await Promise.all(
      members
        .filter((id) => String(id) !== senderId)
        .map((userId) => redis.incr(`unseen:${chatId}:${userId}`)),
    );

    await publishEvent("message_created", {
      chatId,
      senderId: senderIdStr,
      text: text || "Media",
      createdAt: new Date().toISOString(),
    });

    return res
      .status(201)
      .json({ success: true, message, senderId: senderIdStr });
  },
);
