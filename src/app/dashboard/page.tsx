import { requirePageSession } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await requirePageSession();

  return (
    <div className="min-h-screen">
      <Navbar activePath="/dashboard" />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {session.user.name ?? session.user.email}</h1>
          <p className="mt-1 text-muted">Pick up where you left off, or start a new session.</p>
        </div>
        <DashboardClient />
      </main>
    </div>
  );
}
