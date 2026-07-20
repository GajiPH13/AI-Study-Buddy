"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { ConversationDto } from "@/lib/contracts";
import { SUBJECTS, TUTOR_MODES } from "@/lib/models";
import { RecommendationsWidget } from "./recommendations-widget";

const SubjectChart = dynamic(
  () => import("./subject-chart").then((m) => m.SubjectChart),
  { ssr: false },
);

type ListResponse = { data: { items: ConversationDto[]; nextCursor: string | null } };

export function DashboardClient() {
  const [items, setItems] = useState<ConversationDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/conversations${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, { cache: "no-store" });
    if (!response.ok) {
      setError("Your study sessions could not be loaded.");
      setLoading(false);
      return;
    }
    const body = await response.json() as ListResponse;
    setItems((current) => cursor ? [...current, ...body.data.items] : body.data.items);
    setNextCursor(body.data.nextCursor);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: form.get("subject"), mode: form.get("mode") }),
    });
    if (!response.ok) {
      setError("The study session could not be created.");
      setCreating(false);
      return;
    }
    const body = await response.json() as { data: ConversationDto };
    window.location.assign(`/chat/${body.data.id}`);
  }

  async function remove(item: ConversationDto) {
    if (!window.confirm(`Delete "${item.title}" and all of its messages? This cannot be undone.`)) return;
    const response = await fetch(`/api/conversations/${item.id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((c) => c.id !== item.id));
    else setError("The study session could not be deleted.");
  }

  // Build chart data from loaded conversations
  const subjectCounts: Record<string, number> = {};
  for (const item of items) {
    subjectCounts[item.subject] = (subjectCounts[item.subject] ?? 0) + 1;
  }
  const chartData = Object.entries(subjectCounts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_1fr]">
      {/* Sidebar */}
      <div className="space-y-5">
        <form onSubmit={create} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">New study session</h2>
          <label className="mt-5 grid gap-2 text-sm font-semibold">Subject
            <select name="subject" className="rounded-xl border border-border bg-white px-3 py-3">
              {SUBJECTS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </label>
          <label className="mt-4 grid gap-2 text-sm font-semibold">Tutor mode
            <select name="mode" className="rounded-xl border border-border bg-white px-3 py-3">
              {TUTOR_MODES.map((m) => <option key={m} value={m}>{label(m)}</option>)}
            </select>
          </label>
          <button disabled={creating} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60">
            {creating ? "Creating…" : "Create session"}
          </button>
        </form>

        {chartData.length > 0 && <SubjectChart data={chartData} />}

        <RecommendationsWidget />
      </div>

      {/* Sessions list */}
      <section aria-busy={loading}>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-danger">{error}</p>}
        {loading && items.length === 0 ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}
          </div>
        ) : null}
        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <h2 className="text-xl font-bold">No sessions yet</h2>
            <p className="mt-2 text-muted">Choose a subject and tutor mode to begin.</p>
          </div>
        ) : null}
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <Link href={`/chat/${item.id}`} className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted">{label(item.subject)} · {label(item.mode)} · Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
              </Link>
              <button type="button" onClick={() => void remove(item)} className="rounded-lg px-3 py-2 text-sm font-semibold text-danger hover:bg-red-50" aria-label={`Delete ${item.title}`}>Delete</button>
            </article>
          ))}
        </div>
        {nextCursor && (
          <button type="button" disabled={loading} onClick={() => void load(nextCursor)} className="mt-5 rounded-xl border border-border bg-white px-5 py-3 font-semibold">
            {loading ? "Loading…" : "Load more"}
          </button>
        )}
      </section>
    </div>
  );
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
