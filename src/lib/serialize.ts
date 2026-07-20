import type { ChatMessage, Conversation, StudyResource } from "@/lib/models";
import type { ConversationDto, MessageDto, ResourceDto } from "@/lib/contracts";

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

export function serializeResource(resource: StudyResource): ResourceDto {
  return {
    id: resource._id.toHexString(),
    userId: resource.userId,
    title: resource.title,
    shortDescription: resource.shortDescription,
    fullDescription: resource.fullDescription,
    subject: resource.subject,
    difficulty: resource.difficulty,
    estimatedMinutes: resource.estimatedMinutes,
    imageUrl: resource.imageUrl,
    tags: resource.tags,
    viewCount: resource.viewCount,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}
