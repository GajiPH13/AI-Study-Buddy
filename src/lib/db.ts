import { Db, MongoClient } from "mongodb";
import { getMongoEnv } from "@/lib/env";

declare global {
  var aiStudyBuddyMongoClient: MongoClient | undefined;
}

export function getMongoClient() {
  if (!global.aiStudyBuddyMongoClient) {
    global.aiStudyBuddyMongoClient = new MongoClient(getMongoEnv().MONGODB_URI, {
      appName: "ai-study-buddy",
      maxPoolSize: 10,
    });
  }

  return global.aiStudyBuddyMongoClient;
}

export function getDb(): Db {
  return getMongoClient().db(getMongoEnv().MONGODB_DB_NAME);
}
