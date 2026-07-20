"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { RecommendationDto } from "@/lib/contracts";

type Response = { data: { recommendations: RecommendationDto[] } };

async function fetchRecommendations() {
  const res = await fetch("/api/recommendations", { method: "POST" });
  if (!res.ok) return { recommendations: [] as RecommendationDto[] };
  return ((await res.json()) as Response).data;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

export function RecommendationsWidget() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
    staleTime: 5 * 60_000,
  });

  const recs = data?.recommendations ?? [];

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">Recommended for you</h2>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-100 h-16" />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm text-muted">Start a few study sessions to get personalized recommendations.</p>
          <Link href="/explore" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Browse resources →</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {recs.map(({ resource, reason }) => (
            <li key={resource.id} className="rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold capitalize text-primary">{resource.subject}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[resource.difficulty] ?? "bg-slate-100 text-slate-700"}`}>{resource.difficulty}</span>
                  </div>
                  <p className="font-semibold text-sm truncate">{resource.title}</p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{reason}</p>
                </div>
                <Link
                  href={`/resources/${resource.id}`}
                  className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary transition-colors"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
