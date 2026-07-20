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
    db.collection("resources").createIndex({ subject: 1, difficulty: 1, createdAt: -1 }),
    db.collection("resources").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("resources").createIndex({ viewCount: -1, createdAt: -1 }),
    db.collection("resources").createIndex(
      { title: "text", shortDescription: "text", tags: "text" },
      { weights: { title: 10, shortDescription: 5, tags: 3 } },
    ),
  ]);
}
