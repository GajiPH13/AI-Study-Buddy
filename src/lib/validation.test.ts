import { describe, expect, it } from "vitest";
import { conversationCreateSchema, conversationUpdateSchema, paginationSchema } from "@/lib/validation";

describe("conversation validation", () => {
  it("accepts the supported subjects and modes", () => {
    expect(conversationCreateSchema.safeParse({ subject: "programming", mode: "hint" }).success).toBe(true);
  });

  it("rejects unsupported enum values and client ownership", () => {
    expect(conversationCreateSchema.safeParse({ subject: "music", mode: "explain" }).success).toBe(false);
    expect(conversationCreateSchema.safeParse({ subject: "science", mode: "quiz", userId: "other" }).success).toBe(false);
  });

  it("requires a non-empty update and bounds titles", () => {
    expect(conversationUpdateSchema.safeParse({}).success).toBe(false);
    expect(conversationUpdateSchema.safeParse({ title: "  Algebra review  " }).data?.title).toBe("Algebra review");
    expect(conversationUpdateSchema.safeParse({ title: "x".repeat(81) }).success).toBe(false);
  });

  it("bounds conversation page sizes", () => {
    expect(paginationSchema.safeParse({ limit: 50 }).success).toBe(true);
    expect(paginationSchema.safeParse({ limit: 51 }).success).toBe(false);
  });
});
