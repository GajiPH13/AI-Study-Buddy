import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { streamTutorResponse, tutorInstructions } from "@/lib/openai";

describe("tutor instructions", () => {
  it("keeps explain mode student friendly", () => {
    const prompt = tutorInstructions("mathematics", "explain");
    expect(prompt).toContain("mathematics");
    expect(prompt).toContain("student-friendly");
  });

  it("does not immediately solve in hint mode", () => {
    expect(tutorInstructions("science", "hint")).toContain("Do not immediately provide the complete solution");
  });

  it("caps quiz questions and delays answers", () => {
    const prompt = tutorInstructions("history", "quiz");
    expect(prompt).toContain("no more than five");
    expect(prompt).toContain("Do not reveal answers");
  });
});

describe("Ollama fallback", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.AI_PROVIDER = "ollama";
    process.env.OLLAMA_MODEL = "llama3.1-8b";
    process.env.OLLAMA_BASE_URL = "http://127.0.0.1:11434";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("retries with the discovered model when the configured model is missing", async () => {
    const firstResponse = {
      ok: false,
      status: 404,
      text: vi.fn().mockResolvedValue('{"error":"model not found"}'),
      headers: new Headers(),
    } as unknown as Response;
    const secondResponse = {
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"message":{"content":"hi"},"done":false}\n{"message":{"content":" there"},"done":true}\n'));
          controller.close();
        },
      }),
      headers: new Headers(),
    } as unknown as Response;

    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValue('{"models":[{"name":"llama3.1:latest"}]}') } as unknown as Response)
      .mockResolvedValueOnce(secondResponse));

    const stream = streamTutorResponse({
      subject: "mathematics",
      mode: "explain",
      messages: [{ role: "user", content: "Hello" }],
      signal: new AbortController().signal,
    });

    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["hi", " there"]);
  });
});
