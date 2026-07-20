"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResourceCard, ResourceCardSkeleton } from "@/components/resource-card";
import { SUBJECTS, DIFFICULTIES } from "@/lib/models";
import type { ResourceDto } from "@/lib/contracts";

type ListResponse = { data: { items: ResourceDto[]; nextCursor: string | null } };

async function fetchResources(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/resources?${qs}`);
  if (!res.ok) throw new Error("Failed to load resources");
  return (await res.json()) as ListResponse;
}

export function ExploreClient() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sort, setSort] = useState("newest");
  const [cursor, setCursor] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<ResourceDto[]>([]);

  const params: Record<string, string> = { sort };
  if (q.trim()) params.q = q.trim();
  if (subject) params.subject = subject;
  if (difficulty) params.difficulty = difficulty;
  if (cursor) params.cursor = cursor;

  const { data, isFetching, isError } = useQuery({
    queryKey: ["resources", params],
    queryFn: () => fetchResources(params),
    placeholderData: (prev) => prev,
    select: (d) => d.data,
  });

  function applyFilters() {
    setCursor(null);
    setAllItems([]);
  }

  function loadMore() {
    if (data?.nextCursor) {
      setAllItems((prev) => [...prev, ...(data.items ?? [])]);
      setCursor(data.nextCursor);
    }
  }

  const displayItems = cursor ? allItems : (data?.items ?? []);

  return (
    <div>
      {/* Search + Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1.5">Search</label>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Search resources…"
            className="w-full rounded-xl border border-border px-4 py-2.5 outline-none focus:border-primary"
          />
        </div>
        <div className="w-full sm:w-44">
          <label className="block text-sm font-semibold mb-1.5">Subject</label>
          <select
            value={subject}
            onChange={(e) => { setSubject(e.target.value); applyFilters(); }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5"
          >
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s} className="capitalize">{cap(s)}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <label className="block text-sm font-semibold mb-1.5">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); applyFilters(); }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5"
          >
            <option value="">All levels</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{cap(d)}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <label className="block text-sm font-semibold mb-1.5">Sort by</label>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); applyFilters(); }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="popular">Most popular</option>
          </select>
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark shrink-0"
        >
          Search
        </button>
      </div>

      {/* Error */}
      {isError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-danger mb-6">
          Resources could not be loaded. Please try again.
        </p>
      )}

      {/* Grid */}
      {isFetching && displayItems.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-14 text-center">
          <p className="text-xl font-bold">No resources found</p>
          <p className="mt-2 text-muted">Try adjusting the filters, or be the first to add a resource.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayItems.map((r) => <ResourceCard key={r.id} resource={r} />)}
            {isFetching && Array.from({ length: 4 }).map((_, i) => <ResourceCardSkeleton key={`sk-${i}`} />)}
          </div>
          {data?.nextCursor && (
            <div className="mt-10 text-center">
              <button
                type="button"
                disabled={isFetching}
                onClick={loadMore}
                className="rounded-xl border border-border bg-white px-7 py-3 font-semibold hover:border-primary disabled:opacity-60"
              >
                {isFetching ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
