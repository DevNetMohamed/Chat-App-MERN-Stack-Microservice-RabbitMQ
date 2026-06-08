import mongoose, { Schema } from "mongoose";
import type { IMessage } from "@chat-app/shared";

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: String,            
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
    image: {
      mediaUrl: { type: String, default: null },
      mediaPublicId: { type: String, default: null },
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", null],
      default: "text",
    },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false }, 
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);