import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  getRequestSession: vi.fn(),
}));

vi.mock("@/lib/collections", () => ({
  conversationsCollection: () => ({ findOne: mocks.findOne }),
  messagesCollection: () => ({}),
}));

vi.mock("@/lib/api", () => ({
  getRequestSession: mocks.getRequestSession,
  dataResponse: (data: unknown, init?: ResponseInit) => Response.json({ data }, init),
  errorResponse: (code: string, message: string, status: number) => Response.json({ error: { code, message } }, { status }),
}));

vi.mock("@/lib/db", () => ({ getMongoClient: vi.fn() }));

import { GET } from "@/app/api/conversations/[id]/route";

describe("owned conversation API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without a session", async () => {
    mocks.getRequestSession.mockResolvedValue(null);
    const response = await get("507f1f77bcf86cd799439011");
    expect(response.status).toBe(401);
    expect(mocks.findOne).not.toHaveBeenCalled();
  });

  it("returns an owner-safe 404 for malformed identifiers", async () => {
    mocks.getRequestSession.mockResolvedValue({ user: { id: "student-1" } });
    const response = await get("invalid-id");
    expect(response.status).toBe(404);
    expect(mocks.findOne).not.toHaveBeenCalled();
  });

  it("queries by both resource and authenticated owner", async () => {
    mocks.getRequestSession.mockResolvedValue({ user: { id: "student-1" } });
    mocks.findOne.mockResolvedValue(null);
    const response = await get("507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
    expect(mocks.findOne).toHaveBeenCalledWith(expect.objectContaining({ userId: "student-1" }));
  });
});

function get(id: string) {
  return GET(
    new Request(`http://localhost/api/conversations/${id}`),
    { params: Promise.resolve({ id }) },
  ) as Promise<Response>;
}
