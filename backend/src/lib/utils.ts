import { Language } from "../generated/prisma/enums.js";
import redisClient from "./redis.js";

export function toLanguage(raw: unknown): Language | undefined {
  if (typeof raw !== "string") return undefined;
  const upper = raw.toUpperCase();
  if (Object.values(Language).includes(upper as Language)) {
    return upper as Language;
  }
  return undefined;
}

export const invalidateSnippets = async (organizationId: number) => {
  const keys = await redisClient.get(`org:${organizationId}:snippets:*`);
  if (keys && keys.length > 0) {
    await redisClient.del(keys);
  }
};

export const invalidateNotifications = async (organizationId: number) => {
  const keys = await redisClient.get(`org:${organizationId}:notifications:*`);
  if (keys && keys.length > 0) {
    await redisClient.del(keys);
  }
};
