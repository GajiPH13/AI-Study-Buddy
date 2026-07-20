"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ResourceDto } from "@/lib/contracts";

type ListResponse = { data: { items: ResourceDto[]; nextCursor: string | null } };

async function fetchMyResources() {
  const res = await fetch("/api/resources/mine");
  if (!res.ok) throw new Error("Failed to load");
  return (await res.json() as ListResponse).data;
}

export function ManageClient() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-resources"],
    queryFn: fetchMyResources,
  });

  async function remove(resource: ResourceDto) {
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/resources/${resource.id}`, { method: "DELETE" });
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["my-resources"] });
    } else {
      alert("The resource could not be deleted.");
    }
  }

  const items = data?.items ?? [];

  return (
    <div>
      {isError && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-danger">
          Your resources could not be loaded. Please refresh.
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-white overflow-hidden animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-b-0">
              <div className="h-4 flex-1 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-8 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-14 text-center">
          <p className="text-xl font-bold">No resources yet</p>
          <p className="mt-2 text-muted">Share your first study resource with the community.</p>
          <Link href="/resources/add" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark">
            Add Resource
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-muted uppercase tracking-wide text-xs">Title</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-muted uppercase tracking-wide text-xs">Subject</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-muted uppercase tracking-wide text-xs">Difficulty</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-muted uppercase tracking-wide text-xs">Views</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-muted uppercase tracking-wide text-xs">Added</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-muted uppercase tracking-wide text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-muted mt-0.5 truncate">{item.shortDescription}</p>
                    </td>
                    <td className="px-4 py-4 capitalize text-muted">{item.subject}</td>
                    <td className="px-4 py-4 capitalize text-muted">{item.difficulty}</td>
                    <td className="px-4 py-4 text-muted">{item.viewCount}</td>
                    <td className="px-4 py-4 text-muted">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/resources/${item.id}`}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary transition-colors"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => void remove(item)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
