import { getDb } from "@/lib/db";
import type { ChatMessage, Conversation, RateLimitBucket, StudyResource } from "@/lib/models";

export function conversationsCollection() {
  return getDb().collection<Conversation>("conversations");
}

export function messagesCollection() {
  return getDb().collection<ChatMessage>("messages");
}

export function rateLimitsCollection() {
  return getDb().collection<RateLimitBucket>("rateLimits");
}

export function resourcesCollection() {
  return getDb().collection<StudyResource>("resources");
}
