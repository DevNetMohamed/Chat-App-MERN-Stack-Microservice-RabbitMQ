import type { Document } from "mongoose";

export interface IMessage extends Document {
  chatId: string;
  sender: string;
  text?: string | null;
  image?: {
    mediaUrl?: string | null;
    mediaPublicId?: string | null;
  } | null;
  messageType: "text" | "image" | "video" | "file" | null;
  seen: boolean;
  seenAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
