export type OpenAIErrorResponse = {
  code: "AI_RATE_LIMITED" | "SERVICE_UNAVAILABLE" | "MODEL_NOT_FOUND";
  message: string;
  status: 429 | 503 | 404;
  retryAfterSeconds?: number;
};

type OpenAIErrorLike = {
  status?: number;
  code?: string | null;
  requestID?: string;
};

export function classifyOpenAIError(error: unknown): OpenAIErrorResponse {
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as OpenAIErrorLike).status)
    : undefined;

  if (status === 429) {
    return {
      code: "AI_RATE_LIMITED",
      message: "The AI tutor is busy or has reached its usage limit. Please try again later.",
      status: 429,
      retryAfterSeconds: 30,
    };
  }

  if (status === 404) {
    return {
      code: "MODEL_NOT_FOUND",
      message: "The configured AI model was not found on the provider. Check OLLAMA_MODEL or the provider's available models.",
      status: 404,
    };
  }

  return {
    code: "SERVICE_UNAVAILABLE",
    message: "The AI tutor is temporarily unavailable. Please try again later.",
    status: 503,
  };
}

export function logOpenAIError(stage: "moderation" | "generation", error: unknown) {
  const value = typeof error === "object" && error !== null ? error as OpenAIErrorLike : {};
  console.error("AI provider request failed", {
    stage,
    status: value.status,
    code: value.code,
    requestId: value.requestID,
  });
}
