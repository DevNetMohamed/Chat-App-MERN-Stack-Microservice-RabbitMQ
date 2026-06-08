import mongoose, { Schema, Document } from "mongoose";
import type { IChat } from "@chat-app/shared";

const chatSchema = new Schema<IChat>(
  {
    users: {
      type: [String],
      required: true,
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    groupName: {
      type: String,
      trim: true,
    },

    groupAdmin: {
      type: String,
    },

    latestMessage: {
      text: String,
      sender: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true, strict: false
  },
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
