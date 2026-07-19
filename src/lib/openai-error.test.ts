import { describe, expect, it } from "vitest";
import { classifyOpenAIError } from "@/lib/openai-error";

describe("OpenAI error classification", () => {
  it("preserves upstream rate-limit semantics", () => {
    expect(classifyOpenAIError({ status: 429 })).toEqual(expect.objectContaining({
      code: "AI_RATE_LIMITED",
      status: 429,
      retryAfterSeconds: 30,
    }));
  });

  it("hides authentication and unexpected upstream details", () => {
    const classified = classifyOpenAIError({ status: 401, message: "secret detail" });
    expect(classified.status).toBe(503);
    expect(classified.message).not.toContain("secret detail");
  });
});
