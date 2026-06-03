// import { createClient } from "redis";
// export const redisClinet = async () => {
//   const url = process.env.REDIS_URI?.trim();
//   if (!url) {
//     throw new Error("REDIS_URI is not defined in environment variables");
//   }
//   try {
//     const client = createClient({
//       url,
//       socket: {
//         connectTimeout: 10000,
//         reconnectStrategy: (retries) => {
//           if (retries > 5) {
//             return new Error("Max reconnection retries reached");
//           }
//           return Math.min(retries * 200, 2000);
//         },
//       },
//     });
//     client.on("error", (err) => console.error("Redis Client Error", err));
//     await client.connect();
//     console.log("Connected to Redis successfully!");
//     return client;
//   } catch (error) {
//     console.error("Failed to connect to Redis", error);
//     throw error; // Re-throw so callers know it failed
//   }
// };

// redis.js - New REST-based client
import { Redis } from "@upstash/redis";

export const redisClient = async () => {
  const client = new Redis({
    url: process.env.REDIS_URI,
    token: process.env.REDIS_TOKEN,
  });

  try {
    const pong = await client.ping();
    console.log("Connected to Upstash Redis via REST!", pong);
    return client;
  } catch (error) {
    console.error("Failed to connect to Upstash", error);
    throw error;
  }
};
