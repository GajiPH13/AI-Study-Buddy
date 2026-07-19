import { ObjectId, type Filter } from "mongodb";
import { conversationsCollection, messagesCollection } from "@/lib/collections";
import { dataResponse, errorResponse, getRequestSession } from "@/lib/api";
import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { getMongoClient } from "@/lib/db";
import type { ChatMessage } from "@/lib/models";
import { serializeConversation, serializeMessage } from "@/lib/serialize";
import { conversationUpdateSchema, messagePaginationSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function ownedConversation(request: Request, context: Context) {
  const session = await getRequestSession(request);
  if (!session) return { response: errorResponse("AUTH_REQUIRED", "Please log in to continue.", 401) };
  const { id } = await context.params;
  if (!ObjectId.isValid(id)) return { response: errorResponse("NOT_FOUND", "Conversation not found.", 404) };
  const conversationId = new ObjectId(id);
  const conversation = await conversationsCollection().findOne({ _id: conversationId, userId: session.user.id });
  if (!conversation) return { response: errorResponse("NOT_FOUND", "Conversation not found.", 404) };
  return { session, conversationId, conversation };
}

export async function GET(request: Request, context: Context) {
  const owned = await ownedConversation(request, context);
  if ("response" in owned) return owned.response;

  const url = new URL(request.url);
  const parsed = messagePaginationSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "The message pagination parameters are invalid.", 400);

  const filter: Filter<ChatMessage> = { conversationId: owned.conversationId, userId: owned.session.user.id };
  if (parsed.data.before) {
    const cursor = decodeCursor(parsed.data.before);
    if (!cursor) return errorResponse("VALIDATION_ERROR", "The message cursor is invalid.", 400);
    filter.$or = [
      { createdAt: { $lt: cursor.date } },
      { createdAt: cursor.date, _id: { $lt: cursor.id } },
    ];
  }

  const documents = await messagesCollection().find(filter).sort({ createdAt: -1, _id: -1 }).limit(parsed.data.limit + 1).toArray();
  const hasMore = documents.length > parsed.data.limit;
  const pageDescending = documents.slice(0, parsed.data.limit);
  const oldest = pageDescending.at(-1);

  return dataResponse({
    conversation: serializeConversation(owned.conversation),
    messages: pageDescending.reverse().map(serializeMessage),
    nextCursor: hasMore && oldest ? encodeCursor(oldest.createdAt, oldest._id) : null,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: Context) {
  const owned = await ownedConversation(request, context);
  if ("response" in owned) return owned.response;
  const body = await request.json().catch(() => null);
  const parsed = conversationUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Provide a valid title, subject, or tutor mode.", 400);

  const update = { ...parsed.data, ...(parsed.data.title ? { isDefaultTitle: false } : {}), updatedAt: new Date() };
  const result = await conversationsCollection().findOneAndUpdate(
    { _id: owned.conversationId, userId: owned.session.user.id },
    { $set: update },
    { returnDocument: "after" },
  );
  if (!result) return errorResponse("NOT_FOUND", "Conversation not found.", 404);
  return dataResponse(serializeConversation(result), { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request, context: Context) {
  const owned = await ownedConversation(request, context);
  if ("response" in owned) return owned.response;

  const mongoSession = getMongoClient().startSession();
  try {
    await mongoSession.withTransaction(async () => {
      const deleted = await conversationsCollection().deleteOne(
        { _id: owned.conversationId, userId: owned.session.user.id },
        { session: mongoSession },
      );
      if (!deleted.deletedCount) throw new Error("CONVERSATION_NOT_FOUND");
      await messagesCollection().deleteMany(
        { conversationId: owned.conversationId, userId: owned.session.user.id },
        { session: mongoSession },
      );
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONVERSATION_NOT_FOUND") return errorResponse("NOT_FOUND", "Conversation not found.", 404);
    return errorResponse("INTERNAL_ERROR", "The conversation could not be deleted. Please try again.", 500);
  } finally {
    await mongoSession.endSession();
  }

  return new Response(null, { status: 204 });
}
