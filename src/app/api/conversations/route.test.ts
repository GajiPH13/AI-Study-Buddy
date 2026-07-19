import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  insertOne: vi.fn(),
  find: vi.fn(),
  getRequestSession: vi.fn(),
}));

vi.mock("@/lib/collections", () => ({
  conversationsCollection: () => ({ insertOne: mocks.insertOne, find: mocks.find }),
}));

vi.mock("@/lib/api", () => ({
  getRequestSession: mocks.getRequestSession,
  dataResponse: (data: unknown, init?: ResponseInit) => Response.json({ data }, init),
  errorResponse: (code: string, message: string, status: number) => Response.json({ error: { code, message } }, { status }),
}));

import { POST } from "@/app/api/conversations/route";

describe("conversation collection API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a session", async () => {
    mocks.getRequestSession.mockResolvedValue(null);
    const response = await POST(jsonRequest({ subject: "science", mode: "explain" }));
    expect(response.status).toBe(401);
    expect(mocks.insertOne).not.toHaveBeenCalled();
  });

  it("derives ownership from the authenticated session", async () => {
    mocks.getRequestSession.mockResolvedValue({ user: { id: "student-1" } });
    mocks.insertOne.mockResolvedValue({ acknowledged: true });
    const response = await POST(jsonRequest({ subject: "programming", mode: "hint" }));

    expect(response.status).toBe(201);
    expect(mocks.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      userId: "student-1",
      subject: "programming",
      mode: "hint",
    }));
  });

  it("rejects a client-provided owner", async () => {
    mocks.getRequestSession.mockResolvedValue({ user: { id: "student-1" } });
    const response = await POST(jsonRequest({ subject: "history", mode: "quiz", userId: "student-2" }));
    expect(response.status).toBe(400);
    expect(mocks.insertOne).not.toHaveBeenCalled();
  });
});

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
