import { ObjectId, type Filter } from "mongodb";
import { conversationsCollection } from "@/lib/collections";
import { dataResponse, errorResponse, getRequestSession } from "@/lib/api";
import { decodeCursor, encodeCursor } from "@/lib/cursor";
import type { Conversation } from "@/lib/models";
import { serializeConversation } from "@/lib/serialize";
import { conversationCreateSchema, paginationSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Please log in to continue.", 401);

  const url = new URL(request.url);
  const parsed = paginationSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "The pagination parameters are invalid.", 400);

  const filter: Filter<Conversation> = { userId: session.user.id };
  if (parsed.data.cursor) {
    const cursor = decodeCursor(parsed.data.cursor);
    if (!cursor) return errorResponse("VALIDATION_ERROR", "The conversation cursor is invalid.", 400);
    filter.$or = [
      { updatedAt: { $lt: cursor.date } },
      { updatedAt: cursor.date, _id: { $lt: cursor.id } },
    ];
  }

  const documents = await conversationsCollection()
    .find(filter)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(parsed.data.limit + 1)
    .toArray();
  const hasMore = documents.length > parsed.data.limit;
  const items = documents.slice(0, parsed.data.limit);
  const last = items.at(-1);

  return dataResponse({
    items: items.map(serializeConversation),
    nextCursor: hasMore && last ? encodeCursor(last.updatedAt, last._id) : null,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Please log in to continue.", 401);

  const body = await request.json().catch(() => null);
  const parsed = conversationCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Choose a valid subject and tutor mode.", 400);

  const now = new Date();
  const document: Conversation = {
    _id: new ObjectId(),
    userId: session.user.id,
    title: `Untitled ${parsed.data.subject} session`,
    isDefaultTitle: true,
    subject: parsed.data.subject,
    mode: parsed.data.mode,
    createdAt: now,
    updatedAt: now,
  };
  await conversationsCollection().insertOne(document);
  return dataResponse(serializeConversation(document), { status: 201, headers: { "Cache-Control": "no-store" } });
}
