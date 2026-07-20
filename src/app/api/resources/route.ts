import { ObjectId } from "mongodb";
import { dataResponse, errorResponse, getRequestSession } from "@/lib/api";
import { resourcesCollection } from "@/lib/collections";
import { resourceCreateSchema, resourceListSchema } from "@/lib/validation";
import { serializeResource } from "@/lib/serialize";
import type { StudyResource } from "@/lib/models";
import type { Filter, Sort } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = resourceListSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Invalid query parameters.", 400);
  const { q, subject, difficulty, sort, cursor, limit } = parsed.data;

  const filter: Filter<StudyResource> = {};
  if (q) filter.$text = { $search: q };
  if (subject) filter.subject = subject;
  if (difficulty) filter.difficulty = difficulty;
  if (cursor) {
    const [ts, id] = cursor.split("_");
    const cursorDate = new Date(Number(ts));
    const cursorId = new ObjectId(id);
    if (sort === "newest") {
      filter.$or = [
        { createdAt: { $lt: cursorDate } },
        { createdAt: cursorDate, _id: { $lt: cursorId } },
      ];
    } else if (sort === "oldest") {
      filter.$or = [
        { createdAt: { $gt: cursorDate } },
        { createdAt: cursorDate, _id: { $gt: cursorId } },
      ];
    } else {
      // popular: use _id cursor for simplicity
      filter._id = { $lt: cursorId };
    }
  }

  const sortSpec: Sort =
    sort === "oldest" ? { createdAt: 1, _id: 1 }
    : sort === "popular" ? { viewCount: -1, _id: -1 }
    : { createdAt: -1, _id: -1 };

  const docs = await resourcesCollection()
    .find(filter, { sort: sortSpec, limit: limit + 1 })
    .toArray();

  const hasMore = docs.length > limit;
  const items = docs.slice(0, limit);
  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last
      ? `${last.createdAt.getTime()}_${last._id.toHexString()}`
      : null;

  return dataResponse({ items: items.map(serializeResource), nextCursor });
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Sign in to add resources.", 401);

  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("VALIDATION_ERROR", "Invalid JSON.", 400); }

  const parsed = resourceCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.", 400);

  const { title, shortDescription, fullDescription, subject, difficulty, estimatedMinutes, imageUrl, tags } = parsed.data;
  const now = new Date();

  const result = await resourcesCollection().insertOne({
    _id: new ObjectId(),
    userId: session.user.id,
    title,
    shortDescription,
    fullDescription,
    subject,
    difficulty,
    estimatedMinutes,
    imageUrl: imageUrl || undefined,
    tags,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  const doc = await resourcesCollection().findOne({ _id: result.insertedId });
  if (!doc) return errorResponse("INTERNAL_ERROR", "Resource could not be retrieved after creation.", 500);

  return dataResponse(serializeResource(doc), { status: 201 });
}
