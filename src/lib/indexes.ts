import { getDb } from "@/lib/db";

export async function ensureApplicationIndexes() {
  const db = getDb();

  await Promise.all([
    db.collection("conversations").createIndex({ userId: 1, updatedAt: -1, _id: -1 }),
    db.collection("messages").createIndex({ conversationId: 1, createdAt: 1, _id: 1 }),
    db.collection("messages").createIndex({ userId: 1, conversationId: 1 }),
    db.collection("messages").createIndex(
      { userId: 1, conversationId: 1, clientRequestId: 1 },
      { unique: true, partialFilterExpression: { role: "user", clientRequestId: { $type: "string" } } },
    ),
    db.collection("messages").createIndex(
      { conversationId: 1, replyToMessageId: 1 },
      { unique: true, partialFilterExpression: { role: "assistant", replyToMessageId: { $type: "objectId" } } },
    ),
    db.collection("rateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
