"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  return <button type="button" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:border-primary" onClick={async () => { await authClient.signOut(); router.push("/"); router.refresh(); }}>Log out</button>;
}
