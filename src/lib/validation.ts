import { z } from "zod";
import { DIFFICULTIES, SUBJECTS, TUTOR_MODES } from "@/lib/models";

export const conversationCreateSchema = z.object({
  subject: z.enum(SUBJECTS),
  mode: z.enum(TUTOR_MODES),
}).strict();

export const conversationUpdateSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  subject: z.enum(SUBJECTS).optional(),
  mode: z.enum(TUTOR_MODES).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const paginationSchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const messagePaginationSchema = z.object({
  before: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const resourceCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  shortDescription: z.string().trim().min(10).max(300),
  fullDescription: z.string().trim().min(20).max(10000),
  subject: z.enum(SUBJECTS),
  difficulty: z.enum(DIFFICULTIES),
  estimatedMinutes: z.coerce.number().int().min(1).max(600),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
}).strict();

export const resourceUpdateSchema = resourceCreateSchema.partial().strict().refine(
  (v) => Object.keys(v).length > 0,
  "At least one field is required.",
);

export const resourceListSchema = z.object({
  q: z.string().trim().optional(),
  subject: z.enum(SUBJECTS).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  sort: z.enum(["newest", "oldest", "popular"]).default("newest"),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});
