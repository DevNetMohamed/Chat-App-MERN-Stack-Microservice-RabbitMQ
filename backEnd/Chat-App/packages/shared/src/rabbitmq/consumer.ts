import { getChannel } from "./connection.js";

export const consumeEvent = async (
  queue: string,
  callback: (data: any) => void,
) => {
  const channel = getChannel();

  await channel.assertQueue(queue);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      await callback(data);

      channel.ack(msg);
    } catch (error) {
      console.error(error);

      channel.nack(msg, false, false);
    }
  });
};
