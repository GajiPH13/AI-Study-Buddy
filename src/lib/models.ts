import type { ObjectId } from "mongodb";

export const SUBJECTS = ["mathematics", "science", "history", "programming", "general"] as const;
export const TUTOR_MODES = ["explain", "hint", "quiz"] as const;
export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export type Subject = (typeof SUBJECTS)[number];
export type TutorMode = (typeof TUTOR_MODES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type GenerationStatus = "active" | "completed" | "failed" | "cancelled";

export type Conversation = {
  _id: ObjectId;
  userId: string;
  title: string;
  isDefaultTitle: boolean;
  subject: Subject;
  mode: TutorMode;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessage = {
  _id: ObjectId;
  conversationId: ObjectId;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  clientRequestId?: string;
  generationStatus?: GenerationStatus;
  generationLeaseUntil?: Date;
  replyToMessageId?: ObjectId;
};

export type RateLimitBucket = {
  _id: string;
  userId: string;
  count: number;
  expiresAt: Date;
};

export type StudyResource = {
  _id: ObjectId;
  userId: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  subject: Subject;
  difficulty: Difficulty;
  estimatedMinutes: number;
  imageUrl?: string;
  tags: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
};
