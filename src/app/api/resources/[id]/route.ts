import { ObjectId } from "mongodb";
import { dataResponse, errorResponse, getRequestSession } from "@/lib/api";
import { resourcesCollection } from "@/lib/collections";
import { resourceUpdateSchema } from "@/lib/validation";
import { serializeResource } from "@/lib/serialize";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function parseId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const _id = parseId(id);
  if (!_id) return errorResponse("NOT_FOUND", "Resource not found.", 404);

  const doc = await resourcesCollection().findOneAndUpdate(
    { _id },
    { $inc: { viewCount: 1 } },
    { returnDocument: "after" },
  );
  if (!doc) return errorResponse("NOT_FOUND", "Resource not found.", 404);

  return dataResponse(serializeResource(doc));
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Sign in to edit resources.", 401);

  const { id } = await params;
  const _id = parseId(id);
  if (!_id) return errorResponse("NOT_FOUND", "Resource not found.", 404);

  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("VALIDATION_ERROR", "Invalid JSON.", 400); }

  const parsed = resourceUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.", 400);

  const doc = await resourcesCollection().findOneAndUpdate(
    { _id, userId: session.user.id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!doc) return errorResponse("NOT_FOUND", "Resource not found.", 404);

  return dataResponse(serializeResource(doc));
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Sign in to delete resources.", 401);

  const { id } = await params;
  const _id = parseId(id);
  if (!_id) return errorResponse("NOT_FOUND", "Resource not found.", 404);

  const result = await resourcesCollection().deleteOne({ _id, userId: session.user.id });
  if (result.deletedCount === 0) return errorResponse("NOT_FOUND", "Resource not found.", 404);

  return new Response(null, { status: 204 });
}
