import { rateLimitsCollection } from "@/lib/collections";
import { getChatEnv } from "@/lib/env";

export async function consumeChatRateLimit(userId: string) {
  const now = Date.now();
  const windowStart = Math.floor(now / 60_000) * 60_000;
  const _id = `${userId}:${windowStart}`;
  const bucket = await rateLimitsCollection().findOneAndUpdate(
    { _id },
    {
      $inc: { count: 1 },
      $setOnInsert: { userId, expiresAt: new Date(windowStart + 120_000) },
    },
    { upsert: true, returnDocument: "after" },
  );

  return {
    allowed: Boolean(bucket && bucket.count <= getChatEnv().CHAT_RATE_LIMIT_PER_MINUTE),
    retryAfterSeconds: Math.max(1, Math.ceil((windowStart + 60_000 - now) / 1000)),
  };
}
