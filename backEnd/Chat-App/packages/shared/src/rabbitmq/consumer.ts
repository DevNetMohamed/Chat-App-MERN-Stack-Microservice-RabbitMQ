import { getChannel } from "./connection";

export const consumeEvent = async (
  queue: string,
  callback: (data: any) => void
) => {
  const channel = getChannel();

  await channel.assertQueue(queue);

  channel.consume(queue, (msg) => {
    if (!msg) return;

    const data = JSON.parse(
      msg.content.toString()
    );

    callback(data);

    channel.ack(msg);
  });
};