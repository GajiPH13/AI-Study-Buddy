import { z } from "zod";
import { getChatEnv } from "@/lib/env";

export function chatRequestSchema() {
  return z.object({
    conversationId: z.string().min(1),
    content: z.string().trim().max(getChatEnv().CHAT_MESSAGE_MAX_CHARS).optional(),
    clientRequestId: z.uuid(),
    retryUserMessageId: z.string().min(1).optional(),
  }).strict().superRefine((value, context) => {
    if (!value.retryUserMessageId && !value.content) {
      context.addIssue({ code: "custom", path: ["content"], message: "The message is required." });
    }
  });
}
