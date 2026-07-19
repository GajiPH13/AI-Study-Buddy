import { getDb } from "@/lib/db";
import type { ChatMessage, Conversation, RateLimitBucket } from "@/lib/models";

export function conversationsCollection() {
  return getDb().collection<Conversation>("conversations");
}

export function messagesCollection() {
  return getDb().collection<ChatMessage>("messages");
}

export function rateLimitsCollection() {
  return getDb().collection<RateLimitBucket>("rateLimits");
}
