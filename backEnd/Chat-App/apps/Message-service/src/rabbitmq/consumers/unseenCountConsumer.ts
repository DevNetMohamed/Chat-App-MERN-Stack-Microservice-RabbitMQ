import { getChannel } from "@chat-app/shared";
import { Message } from "../../models/message.js";
import axios from "axios";

export const unseenCountConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("unseen_count_request", { durable: false });

  channel.consume("unseen_count_request", async (msg) => {
    if (!msg) return;

    try {
      const { chatId, userId } = JSON.parse(msg.content.toString());

      const unseenCount = await Message.countDocuments({
        chatId,
        sender: { $ne: userId },
        seen: false,
      });

      // reply back to whoever asked
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify({ unseenCount })),
        { correlationId: msg.properties.correlationId },
      );

      channel.ack(msg);
    } catch (error) {
      console.error(error);
      channel.nack(msg, false, false);
    }
  });
};
