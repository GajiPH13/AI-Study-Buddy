import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { AuthForm } from "./auth-form";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-xl font-bold">AI Study Buddy</Link>
        <AuthForm />
        <p className="mt-6 text-center text-sm leading-6 text-[var(--muted)]">By continuing, you agree to use AI responses as study guidance and verify important academic work.</p>
      </div>
    </main>
  );
}
