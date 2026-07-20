import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import { resourcesCollection } from "@/lib/collections";
import { serializeResource } from "@/lib/serialize";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const SUBJECT_BG: Record<string, string> = {
  mathematics: "from-blue-400 to-blue-600",
  science: "from-green-400 to-emerald-600",
  history: "from-amber-400 to-orange-500",
  programming: "from-purple-400 to-violet-600",
  general: "from-slate-400 to-slate-600",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

export default async function ResourcePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  const isLoggedIn = Boolean(session);

  if (!ObjectId.isValid(id)) notFound();

  const doc = await resourcesCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { viewCount: 1 } },
    { returnDocument: "after" },
  );
  if (!doc) notFound();

  const resource = serializeResource(doc);

  // Related resources (same subject, different id)
  const related = await resourcesCollection()
    .find({ subject: doc.subject, _id: { $ne: doc._id } }, { limit: 4, sort: { viewCount: -1 } })
    .toArray();
  const relatedSerialized = related.map(serializeResource);

  return (
    <div className="min-h-screen">
      <Navbar activePath="/explore" />

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/explore" className="hover:text-ink">Explore</Link>
          <span className="mx-2">/</span>
          <span className="capitalize">{resource.subject}</span>
          <span className="mx-2">/</span>
          <span className="text-ink font-medium">{resource.title}</span>
        </nav>

        {/* Hero image or gradient */}
        <div className={`h-56 rounded-2xl bg-gradient-to-br ${SUBJECT_BG[resource.subject] ?? "from-slate-400 to-slate-600"} relative overflow-hidden mb-8`}>
          {resource.imageUrl ? (
            <img src={resource.imageUrl} alt={resource.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30 select-none">{resource.subject === "mathematics" ? "∑" : resource.subject === "programming" ? "</>" : "📚"}</span>
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {/* Title + meta */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-primary">{resource.subject}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[resource.difficulty] ?? "bg-slate-100 text-slate-700"}`}>{resource.difficulty}</span>
              {resource.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted">{tag}</span>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{resource.title}</h1>
            <p className="mt-3 text-lg text-muted">{resource.shortDescription}</p>

            {/* Full description */}
            <section className="mt-8">
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              <div className="prose prose-slate max-w-none">
                {resource.fullDescription.split("\n").map((para, i) =>
                  para.trim() ? <p key={i} className="mb-4 leading-7 text-muted">{para}</p> : null,
                )}
              </div>
            </section>

            {/* Study it */}
            <section className="mt-10 rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-bold mb-2">Study this topic with AI</h2>
              <p className="text-muted text-sm mb-4">Open a tutoring session on {resource.subject} and ask questions about this material.</p>
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark"
              >
                {isLoggedIn ? "Start a session" : "Sign in to study"}
              </Link>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="font-bold mb-3">Key information</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subject</dt>
                  <dd className="font-semibold capitalize">{resource.subject}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Difficulty</dt>
                  <dd className="font-semibold capitalize">{resource.difficulty}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Est. time</dt>
                  <dd className="font-semibold">{resource.estimatedMinutes} min</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Views</dt>
                  <dd className="font-semibold">{resource.viewCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Added</dt>
                  <dd className="font-semibold">{new Date(resource.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* Related resources */}
        {relatedSerialized.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Related resources</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedSerialized.map((r) => (
                <Link key={r.id} href={`/resources/${r.id}`} className="rounded-2xl border border-border bg-white p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[r.difficulty] ?? ""}`}>{r.difficulty}</span>
                  </div>
                  <p className="font-bold text-sm line-clamp-2">{r.title}</p>
                  <p className="mt-1 text-xs text-muted line-clamp-2">{r.shortDescription}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
