import { getChannel } from "./connection";

export const publishEvent = async (queue: string, data: any) => {
  const channel = getChannel();

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
};
