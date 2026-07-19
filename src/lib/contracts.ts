import type { GenerationStatus, Subject, TutorMode } from "@/lib/models";

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

export type ApiErrorBody = {
  error: { code: string; message: string };
};
