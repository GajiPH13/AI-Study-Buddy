import { z } from "zod";
import { SUBJECTS, TUTOR_MODES } from "@/lib/models";

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
