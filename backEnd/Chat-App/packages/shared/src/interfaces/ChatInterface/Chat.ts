import type { Document } from "mongoose";

export interface IChat extends Document {
  users: string[];
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: string;

  latestMessage?: {
    text: string;
    sender: string;
    createdAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}
