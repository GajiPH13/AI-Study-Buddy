import { MongoServerError, ObjectId } from "mongodb";
import { conversationsCollection, messagesCollection } from "@/lib/collections";
import { errorResponse, getRequestSession } from "@/lib/api";
import { chatRequestSchema } from "@/lib/chat-validation";
import { getMongoClient } from "@/lib/db";
import { getChatEnv } from "@/lib/env";
import type { ChatMessage } from "@/lib/models";
import { moderateTutorInput, streamTutorResponse } from "@/lib/openai";
import { classifyOpenAIError, logOpenAIError } from "@/lib/openai-error";
import { consumeChatRateLimit } from "@/lib/rate-limit";
import { serializeMessage } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Please log in to continue.", 401);

  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema().safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Enter a valid message and conversation.", 400);
  if (!ObjectId.isValid(parsed.data.conversationId)) return errorResponse("NOT_FOUND", "Conversation not found.", 404);

  const conversationId = new ObjectId(parsed.data.conversationId);
  const conversation = await conversationsCollection().findOne({ _id: conversationId, userId: session.user.id });
  if (!conversation) return errorResponse("NOT_FOUND", "Conversation not found.", 404);

  const rateLimit = await consumeChatRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    const response = errorResponse("RATE_LIMITED", "You are sending messages too quickly. Please wait a moment.", 429);
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    return response;
  }

  let userMessage: ChatMessage;
  if (parsed.data.retryUserMessageId) {
    if (!ObjectId.isValid(parsed.data.retryUserMessageId)) return errorResponse("NOT_FOUND", "Message not found.", 404);
    const now = new Date();
    const retry = await messagesCollection().findOneAndUpdate(
      {
        _id: new ObjectId(parsed.data.retryUserMessageId),
        conversationId,
        userId: session.user.id,
        role: "user",
        $or: [
          { generationStatus: { $in: ["failed", "cancelled"] } },
          { generationStatus: "active", generationLeaseUntil: { $lt: now } },
        ],
      },
      { $set: { generationStatus: "active", generationLeaseUntil: leaseUntil() } },
      { returnDocument: "after" },
    );
    if (!retry) return errorResponse("CONFLICT", "That message is already being answered or has been completed.", 409);
    userMessage = retry;
  } else {
    const content = parsed.data.content!;
    try {
      if (await moderateTutorInput(content)) return errorResponse("MODERATION_BLOCKED", "That message cannot be processed. Try asking in a different way.", 400);
    } catch (error) {
      logOpenAIError("moderation", error);
      const classified = classifyOpenAIError(error);
      const response = errorResponse(classified.code, classified.message, classified.status);
      if (classified.retryAfterSeconds) response.headers.set("Retry-After", String(classified.retryAfterSeconds));
      return response;
    }

    userMessage = {
      _id: new ObjectId(),
      conversationId,
      userId: session.user.id,
      role: "user",
      content,
      clientRequestId: parsed.data.clientRequestId,
      generationStatus: "active",
      generationLeaseUntil: leaseUntil(),
      createdAt: new Date(),
    };
    try {
      await messagesCollection().insertOne(userMessage);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) return errorResponse("CONFLICT", "This message was already submitted.", 409);
      throw error;
    }

    const generatedTitle = content.replace(/\s+/g, " ").slice(0, 60);
    await conversationsCollection().updateOne(
      { _id: conversationId, userId: session.user.id },
      {
        $set: {
          updatedAt: userMessage.createdAt,
          ...(conversation.isDefaultTitle ? { title: generatedTitle, isDefaultTitle: false } : {}),
        },
      },
    );
  }

  const history = await messagesCollection().find({
    conversationId,
    userId: session.user.id,
    $or: [
      { role: "assistant" },
      { role: "user", generationStatus: "completed" },
      { _id: userMessage._id },
    ],
  }).sort({ createdAt: -1, _id: -1 }).limit(30).toArray();

  const input = history.reverse().map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(sse("start", { message: serializeMessage(userMessage) }));
      const abortController = new AbortController();
      const onClientAbort = () => abortController.abort();
      request.signal.addEventListener("abort", onClientAbort, { once: true });
      const timeout = setTimeout(() => abortController.abort(), getChatEnv().CHAT_TIMEOUT_MS);
      let assistantContent = "";
      let completed = false;

      try {
        const aiStream = streamTutorResponse({
          subject: conversation.subject,
          mode: conversation.mode,
          messages: input,
          signal: abortController.signal,
        });

        for await (const delta of aiStream) {
          assistantContent += delta;
          controller.enqueue(sse("delta", { text: delta }));
        }
        completed = true;

        if (!completed || !assistantContent.trim()) throw new Error("OPENAI_INCOMPLETE_RESPONSE");
        const assistantMessage: ChatMessage = {
          _id: new ObjectId(),
          conversationId,
          userId: session.user.id,
          role: "assistant",
          content: assistantContent,
          replyToMessageId: userMessage._id,
          createdAt: new Date(),
        };
        const mongoSession = getMongoClient().startSession();
        try {
          await mongoSession.withTransaction(async () => {
            await messagesCollection().insertOne(assistantMessage, { session: mongoSession });
            const userUpdate = await messagesCollection().updateOne(
            { _id: userMessage._id, userId: session.user.id, generationStatus: "active" },
            { $set: { generationStatus: "completed" }, $unset: { generationLeaseUntil: "" } },
              { session: mongoSession },
            );
            if (!userUpdate.matchedCount) throw new Error("GENERATION_STATE_CHANGED");
            await conversationsCollection().updateOne(
              { _id: conversationId, userId: session.user.id },
              { $set: { updatedAt: assistantMessage.createdAt } },
              { session: mongoSession },
            );
          });
        } finally {
          await mongoSession.endSession();
        }
        controller.enqueue(sse("done", { message: serializeMessage(assistantMessage) }));
      } catch (error) {
        const cancelled = abortController.signal.aborted;
        if (!cancelled) logOpenAIError("generation", error);
        await messagesCollection().updateOne(
          { _id: userMessage._id, userId: session.user.id, generationStatus: "active" },
          { $set: { generationStatus: cancelled ? "cancelled" : "failed" }, $unset: { generationLeaseUntil: "" } },
        ).catch(() => undefined);
        if (!request.signal.aborted) {
          controller.enqueue(sse("error", {
            code: cancelled ? "GENERATION_CANCELLED" : "SERVICE_UNAVAILABLE",
            message: cancelled ? "Generation was stopped." : "The tutor could not answer right now. You can retry this message.",
          }));
        }
      } finally {
        clearTimeout(timeout);
        request.signal.removeEventListener("abort", onClientAbort);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function leaseUntil() {
  return new Date(Date.now() + getChatEnv().CHAT_TIMEOUT_MS + 15_000);
}
