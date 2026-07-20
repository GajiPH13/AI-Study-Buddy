import Link from "next/link";
import type { ResourceDto } from "@/lib/contracts";

const SUBJECT_COLORS: Record<string, string> = {
  mathematics: "bg-blue-50 text-blue-700",
  science: "bg-green-50 text-green-700",
  history: "bg-amber-50 text-amber-700",
  programming: "bg-purple-50 text-purple-700",
  general: "bg-slate-100 text-slate-700",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

const SUBJECT_BG: Record<string, string> = {
  mathematics: "from-blue-400 to-blue-600",
  science: "from-green-400 to-emerald-600",
  history: "from-amber-400 to-orange-500",
  programming: "from-purple-400 to-violet-600",
  general: "from-slate-400 to-slate-600",
};

export function ResourceCard({ resource }: { resource: ResourceDto }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-40 bg-gradient-to-br ${SUBJECT_BG[resource.subject] ?? "from-slate-400 to-slate-600"} relative flex-shrink-0`}>
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt={resource.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-40 select-none">{subjectIcon(resource.subject)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${SUBJECT_COLORS[resource.subject] ?? "bg-slate-100 text-slate-700"}`}>
            {resource.subject}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[resource.difficulty] ?? "bg-slate-100 text-slate-700"}`}>
            {resource.difficulty}
          </span>
        </div>
        <h3 className="font-bold text-base leading-snug line-clamp-2">{resource.title}</h3>
        <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2 flex-1">{resource.shortDescription}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>{resource.estimatedMinutes} min</span>
          <span>{resource.viewCount} view{resource.viewCount !== 1 ? "s" : ""}</span>
        </div>
        <Link
          href={`/resources/${resource.id}`}
          className="mt-4 block w-full rounded-xl border border-primary px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-blue-50 transition-colors"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-200 flex-shrink-0" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-slate-200" />
          <div className="h-5 w-16 rounded-full bg-slate-200" />
        </div>
        <div className="h-5 bg-slate-200 rounded w-4/5" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-10 bg-slate-200 rounded-xl mt-2" />
      </div>
    </div>
  );
}

function subjectIcon(subject: string) {
  const icons: Record<string, string> = {
    mathematics: "∑",
    science: "⚗",
    history: "📜",
    programming: "</>",
    general: "📚",
  };
  return icons[subject] ?? "📖";
}
