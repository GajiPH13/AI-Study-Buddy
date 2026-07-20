import { dataResponse, errorResponse, getRequestSession } from "@/lib/api";
import { conversationsCollection, resourcesCollection } from "@/lib/collections";
import { serializeResource } from "@/lib/serialize";
import { getAIProviderConfig } from "@/lib/env";
import OpenAI from "openai";
import type { RecommendationDto } from "@/lib/contracts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getRequestSession(request);
  if (!session) return errorResponse("AUTH_REQUIRED", "Sign in to get recommendations.", 401);

  const userId = session.user.id;

  // Gather the user's study history (last 20 conversations)
  const conversations = await conversationsCollection()
    .find({ userId }, { sort: { updatedAt: -1 }, limit: 20 })
    .toArray();

  // Sample up to 20 resources from the database (exclude the user's own)
  const resources = await resourcesCollection()
    .find({ userId: { $ne: userId } }, { sort: { viewCount: -1 }, limit: 20 })
    .toArray();

  if (resources.length === 0) {
    return dataResponse({ recommendations: [] });
  }

  // Build subject frequency map from user history
  const subjectFreq: Record<string, number> = {};
  for (const c of conversations) {
    subjectFreq[c.subject] = (subjectFreq[c.subject] ?? 0) + 1;
  }

  const historyLines = Object.entries(subjectFreq)
    .sort(([, a], [, b]) => b - a)
    .map(([subject, count]) => `- ${subject}: ${count} session${count > 1 ? "s" : ""}`)
    .join("\n");

  const recentTitles = conversations
    .slice(0, 5)
    .map((c) => `"${c.title}"`)
    .join(", ");

  const resourceLines = resources
    .map((r, i) =>
      `${i + 1}. id=${r._id.toHexString()} | "${r.title}" | ${r.subject} | ${r.difficulty} | ${r.shortDescription}`,
    )
    .join("\n");

  const prompt = [
    "You are a study advisor. Based on the student's study history and available resources, pick the 3 most relevant resources.",
    "",
    "Student's study history (subject: session count):",
    historyLines || "No sessions yet.",
    "",
    recentTitles ? `Recent conversation titles: ${recentTitles}` : "",
    "",
    "Available resources:",
    resourceLines,
    "",
    'Return ONLY a JSON array with exactly 3 objects (or fewer if fewer resources exist): [{"resourceId":"...","reason":"..."},...]',
    "The reason should be 1–2 sentences explaining why this resource suits this student.",
    "Only use resource IDs from the list above.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const config = getAIProviderConfig();
    let raw = "";

    if (config.provider === "ollama") {
      const endpoint = `${config.baseUrl.replace(/\/$/, "")}/api/chat`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          stream: false,
          format: "json",
        }),
      });
      if (!res.ok) throw new Error("Ollama recommendation failed");
      const data = (await res.json()) as { message?: { content?: string } };
      raw = data.message?.content ?? "[]";
    } else {
      const client = new OpenAI({ apiKey: config.apiKey });
      const completion = await client.chat.completions.create({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 600,
      });
      raw = completion.choices[0]?.message?.content ?? "{}";
    }

    // Parse the AI response
    let picks: Array<{ resourceId: string; reason: string }> = [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        picks = parsed as typeof picks;
      } else if (
        typeof parsed === "object" &&
        parsed !== null &&
        "recommendations" in parsed &&
        Array.isArray((parsed as Record<string, unknown>).recommendations)
      ) {
        picks = (parsed as { recommendations: typeof picks }).recommendations;
      }
    } catch {
      picks = [];
    }

    const resourceMap = new Map(resources.map((r) => [r._id.toHexString(), r]));
    const recommendations: RecommendationDto[] = picks
      .slice(0, 3)
      .map((p) => {
        const resource = resourceMap.get(p.resourceId);
        if (!resource) return null;
        return { resource: serializeResource(resource), reason: p.reason ?? "" };
      })
      .filter((r): r is RecommendationDto => r !== null);

    return dataResponse({ recommendations });
  } catch {
    return errorResponse("SERVICE_UNAVAILABLE", "Recommendations are temporarily unavailable.", 503);
  }
}
