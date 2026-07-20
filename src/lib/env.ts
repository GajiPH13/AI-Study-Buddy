import { z } from "zod";

const mongoEnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("ai_study_buddy"),
});

const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

const chatEnvSchema = z.object({
  CHAT_MESSAGE_MAX_CHARS: z.coerce.number().int().positive().default(4000),
  CHAT_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(10),
  CHAT_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(1200),
  CHAT_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
});

let cachedMongoEnv: z.infer<typeof mongoEnvSchema> | undefined;
let cachedAuthEnv: z.infer<typeof authEnvSchema> | undefined;
let cachedChatEnv: z.infer<typeof chatEnvSchema> | undefined;

export function getMongoEnv() {
  cachedMongoEnv ??= mongoEnvSchema.parse(process.env);
  return cachedMongoEnv;
}

export function getAuthEnv() {
  cachedAuthEnv ??= authEnvSchema.parse(process.env);
  return cachedAuthEnv;
}

export function getChatEnv() {
  cachedChatEnv ??= chatEnvSchema.parse(process.env);
  return cachedChatEnv;
}

export type AIProviderConfig =
  | { provider: "openai"; apiKey: string; model: string }
  | { provider: "ollama"; apiKey?: string; baseUrl: string; model: string };

let cachedAIProvider: AIProviderConfig | undefined;

export function getAIProviderConfig(): AIProviderConfig {
  if (cachedAIProvider) return cachedAIProvider;
  const provider = process.env.AI_PROVIDER ?? (process.env.OLLAMA_MODEL ? "ollama" : "openai");

  if (provider === "ollama") {
    const parsed = z.object({
      OLLAMA_API_KEY: z.string().min(1).optional(),
      OLLAMA_BASE_URL: z.url().optional(),
      OLLAMA_MODEL: z.string().min(1),
    }).parse(process.env);
    cachedAIProvider = {
      provider: "ollama",
      apiKey: parsed.OLLAMA_API_KEY,
      baseUrl: parsed.OLLAMA_BASE_URL ?? (parsed.OLLAMA_API_KEY ? "https://api.ollama.ai" : "http://127.0.0.1:11434"),
      model: parsed.OLLAMA_MODEL,
    };
    return cachedAIProvider;
  }

  if (provider !== "openai") throw new Error("AI_PROVIDER must be either openai or ollama.");
  const parsed = z.object({
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  }).parse(process.env);
  cachedAIProvider = { provider: "openai", apiKey: parsed.OPENAI_API_KEY, model: parsed.OPENAI_MODEL };
  return cachedAIProvider;
}
