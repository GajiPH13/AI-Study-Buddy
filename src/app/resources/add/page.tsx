import Link from "next/link";
import { requirePageSession } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import { AddResourceForm } from "./add-resource-form";

export default async function AddResourcePage() {
  await requirePageSession();
  return (
    <div className="min-h-screen">
      <Navbar activePath="/resources/add" />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <nav className="mb-4 text-sm text-muted">
            <Link href="/resources/manage" className="hover:text-ink">My Resources</Link>
            <span className="mx-2">/</span>
            <span className="text-ink font-medium">Add Resource</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight">Add a Study Resource</h1>
          <p className="mt-2 text-muted">Share a study guide, notes, or practice material with the community.</p>
        </div>
        <AddResourceForm />
      </main>
    </div>
  );
}
