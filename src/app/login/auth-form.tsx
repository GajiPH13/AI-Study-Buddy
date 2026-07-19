"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type View = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const result = view === "register"
      ? await authClient.signUp.email({ name: String(form.get("name") ?? "").trim(), email, password })
      : await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(view === "register" ? "We could not create that account. Check your details and try again." : "The email or password is incorrect.");
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
      <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Account access">
        {(["login", "register"] as View[]).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={view === item} onClick={() => { setView(item); setError(""); }} className={`rounded-lg px-3 py-2.5 font-semibold capitalize ${view === item ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}>{item}</button>
        ))}
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{view === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-[var(--muted)]">{view === "login" ? "Continue your saved study sessions." : "Start a private study session in seconds."}</p>

      <form onSubmit={submit} className="mt-7 grid gap-5">
        {view === "register" && <Field label="Name" name="name" type="text" autoComplete="name" minLength={2} maxLength={60} />}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete={view === "login" ? "current-password" : "new-password"} minLength={8} maxLength={128} hint={view === "register" ? "Use at least 8 characters." : undefined} />
        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
        <button disabled={pending} className="rounded-xl bg-[var(--primary)] px-5 py-3.5 font-bold text-white hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Please wait…" : view === "login" ? "Log in" : "Create account"}</button>
      </form>
    </section>
  );
}

function Field({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="grid gap-2 font-semibold">
      {label}
      <input required {...props} className="rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none transition focus:border-[var(--primary)]" />
      {hint && <span className="text-xs font-normal text-[var(--muted)]">{hint}</span>}
    </label>
  );
}
