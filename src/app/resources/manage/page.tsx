import Link from "next/link";
import { requirePageSession } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import { ManageClient } from "./manage-client";

export default async function ManageResourcesPage() {
  const session = await requirePageSession();
  return (
    <div className="min-h-screen">
      <Navbar activePath="/resources/manage" />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Signed in as {session.user.email}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">My Resources</h1>
          </div>
          <Link href="/resources/add" className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white hover:bg-primary-dark text-sm">
            + Add Resource
          </Link>
        </div>
        <ManageClient />
      </main>
    </div>
  );
}
