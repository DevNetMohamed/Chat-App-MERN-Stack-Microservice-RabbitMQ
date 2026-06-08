import { getChannel } from "./connection.js";
import { randomUUID } from "crypto";


export const rpcRequest = (
  queue: string,
  data: unknown,
  timeout = 5000,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const channel = getChannel();
    const replyQueue = await channel.assertQueue("", { exclusive: true });
    const correlationId = randomUUID();

    const timer = setTimeout(() => {
      reject(new Error(`RPC timeout on queue: ${queue}`));
    }, timeout);

    channel.consume(
      replyQueue.queue,
      (msg) => {
        if (msg?.properties.correlationId === correlationId) {
          clearTimeout(timer);
          resolve(JSON.parse(msg.content.toString()));
        }
      },
      { noAck: true },
    );

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
      correlationId,
      replyTo: replyQueue.queue,
    });
  });
};
