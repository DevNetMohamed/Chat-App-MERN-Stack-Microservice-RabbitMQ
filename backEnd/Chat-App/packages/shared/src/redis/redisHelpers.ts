import { redisClient } from "./redis.js";

const redis = redisClient();

const unseenKey = (chatId: string, userId: string) =>
  `unseen:${chatId}:${userId}`;

export const incrementUnseenCount = async (chatId: string, userId: string) => {
  const key = unseenKey(chatId, userId);

  await redis.incr(key);
  await redis.expire(key, 60 * 10); 
};

export const getUnseenCount = async (
  chatId: string,
  userId: string,
): Promise<number> => {
  const key = unseenKey(chatId, userId);

  const count = await redis.get(key);

  return count ? parseInt(count as string, 10) : 0;
};

export const resetUnseenCount = async (chatId: string, userId: string) => {
  const key = unseenKey(chatId, userId);
  await redis.del(key);
};

const userKey = (userId: string) => `user:${userId}`;

export const getCachedUser = async <T = any>(
  userId: string,
): Promise<T | null> => {
  const cached = await redis.get(userKey(userId));

  if (!cached) return null;

  try {
    return JSON.parse(cached as string) as T;
  } catch {
    return null;
  }
};

export const setCachedUser = async (userId: string, data: any) => {
  if (!data || !userId) return;
  await redis.set(userKey(userId), JSON.stringify(data), {
    ex: 60 * 5,
  });
};

export const invalidateCachedUser = async (userId: string) => {
  await redis.del(userKey(userId));
};
