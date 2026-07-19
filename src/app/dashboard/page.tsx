import { requirePageSession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await requirePageSession();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <p className="text-sm text-[var(--muted)]">Signed in as {session.user.email}</p>
          <h1 className="mt-1 text-2xl font-bold">Your study sessions</h1>
        </div>
        <SignOutButton />
      </header>
      <DashboardClient />
    </main>
  );
}
