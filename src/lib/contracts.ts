import type { Difficulty, GenerationStatus, Subject, TutorMode } from "@/lib/models";

export type ConversationDto = {
  id: string;
  title: string;
  subject: Subject;
  mode: TutorMode;
  createdAt: string;
  updatedAt: string;
};

export type MessageDto = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  generationStatus?: GenerationStatus;
  replyToMessageId?: string;
};

export type ResourceDto = {
  id: string;
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
  createdAt: string;
  updatedAt: string;
};

export type RecommendationDto = {
  resource: ResourceDto;
  reason: string;
};

export type ApiErrorBody = {
  error: { code: string; message: string };
};
