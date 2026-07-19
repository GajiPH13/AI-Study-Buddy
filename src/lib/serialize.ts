import type { ChatMessage, Conversation } from "@/lib/models";
import type { ConversationDto, MessageDto } from "@/lib/contracts";

export function serializeConversation(conversation: Conversation): ConversationDto {
  return {
    id: conversation._id.toHexString(),
    title: conversation.title,
    subject: conversation.subject,
    mode: conversation.mode,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function serializeMessage(message: ChatMessage): MessageDto {
  return {
    id: message._id.toHexString(),
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    generationStatus: message.generationStatus,
    replyToMessageId: message.replyToMessageId?.toHexString(),
  };
}
