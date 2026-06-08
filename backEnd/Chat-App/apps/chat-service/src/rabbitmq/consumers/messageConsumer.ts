// import { consumeEvent, resetUnseenCount } from "@chat-app/shared";

// export const registerMessageConsumers = async () => {
//   // listen for new messages
//   await consumeEvent("message_created", async (data) => {
//     const { chatId, receiverId } = data;
//     // Redis already incremented by message-service
//     // but if chat-service owns Redis, increment here instead
//     console.log(`New message in chat ${chatId} for user ${receiverId}`);
//   });

//   // listen for seen events
//   await consumeEvent("messages_seen", async (data) => {
//     const { chatId, userId } = data;
//     await resetUnseenCount(chatId, userId);
//     console.log(`Messages seen in chat ${chatId} by user ${userId}`);
//   });
// };

import { consumeEvent, resetUnseenCount, getChannel } from "@chat-app/shared";
import { Chat } from "../../models/Chat.js";

export const registerMessageConsumers = async () => {
  await consumeEvent("message_created", async (data) => {
    const { chatId, senderId, text, createdAt } = data;

    const parsedDate =
      createdAt && !isNaN(new Date(createdAt).getTime())
        ? new Date(createdAt)
        : new Date();

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: {
        text,
        sender: senderId,
        createdAt: parsedDate,
      },
    });

    console.log(`latestMessage updated for chat ${chatId}`);
  });

  // 2. messages seen — reset unseen counter in Redis
  await consumeEvent("messages_seen", async (data) => {
    const { chatId, userId } = data;

    await resetUnseenCount(chatId, userId);

    console.log(`Unseen count reset for chat ${chatId} user ${userId}`);
  });

  // 3. get_chat RPC — reply with chat members to message-service
  const channel = getChannel();
  await channel.assertQueue("get_chat", { durable: false });

  channel.consume("get_chat", async (msg) => {
    if (!msg) return;

    try {
      const { chatId } = JSON.parse(msg.content.toString());

      const chat = await Chat.findById(chatId);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(
          JSON.stringify({
            users: chat?.users ?? [],
            found: !!chat,
          }),
        ),
        { correlationId: msg.properties.correlationId },
      );

      channel.ack(msg);
    } catch (error) {
      console.error(" get_chat consumer error:", error);

      // always reply even on error — prevents rpcRequest from hanging
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify({ users: [], found: false })),
        { correlationId: msg.properties.correlationId },
      );

      channel.nack(msg, false, false);
    }
  });
};
