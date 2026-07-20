import { dataResponse, errorResponse, getRequestSession } from "@/lib/api";
import { resourcesCollection } from "@/lib/collections";
import { serializeResource } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Sign in to view your resources.", 401);

  const items = await resourcesCollection()
    .find({ userId: session.user.id }, { sort: { createdAt: -1 }, limit: 100 })
    .toArray();

  return dataResponse({ items: items.map(serializeResource), nextCursor: null });
}
