import { Navbar } from "@/components/navbar";
import { ExploreClient } from "./explore-client";

export default async function ExplorePage() {
  return (
    <div className="min-h-screen">
      <Navbar activePath="/explore" />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Explore Study Resources</h1>
          <p className="mt-2 text-muted">Browse community-created study guides, notes, and practice materials.</p>
        </div>
        <ExploreClient />
      </main>
    </div>
  );
}
