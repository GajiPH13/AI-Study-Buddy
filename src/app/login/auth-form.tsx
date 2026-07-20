"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type View = "login" | "register";

const DEMO = { email: "demo@studybuddy.app", password: "demo123456" };

export function AuthForm() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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

  async function signInWithGoogle() {
    setPending(true);
    setError("");

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });

    if (result.error) {
      setError("Google sign-in failed.");
      setPending(false);
    }
  }

  function fillDemo() {
    setView("login");
    setError("");
    if (emailRef.current) emailRef.current.value = DEMO.email;
    if (passwordRef.current) passwordRef.current.value = DEMO.password;
  }

  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
      <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Account access">
        {(["login", "register"] as View[]).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={view === item} onClick={() => { setView(item); setError(""); }} className={`rounded-lg px-3 py-2.5 font-semibold capitalize ${view === item ? "bg-white shadow-sm" : "text-muted"}`}>{item}</button>
        ))}
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{view === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-muted">{view === "login" ? "Continue your saved study sessions." : "Start a private study session in seconds."}</p>

      <form onSubmit={submit} className="mt-7 grid gap-5">
        {view === "register" && <Field label="Name" name="name" type="text" autoComplete="name" minLength={2} maxLength={60} />}
        <Field label="Email" name="email" type="email" autoComplete="email" inputRef={emailRef} />
        <Field label="Password" name="password" type="password" autoComplete={view === "login" ? "current-password" : "new-password"} minLength={8} maxLength={128} hint={view === "register" ? "Use at least 8 characters." : undefined} inputRef={passwordRef} />
        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>}
        <button disabled={pending} className="rounded-xl bg-primary px-5 py-3.5 font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Please wait…" : view === "login" ? "Log in" : "Create account"}</button>
      </form>

      {view === "login" && (
        <button
          type="button"
          onClick={fillDemo}
          className="mt-3 w-full rounded-xl border border-dashed border-border bg-slate-50 px-5 py-3 text-sm font-semibold text-muted hover:border-primary hover:text-ink transition-colors"
        >
          Fill demo credentials
        </button>
      )}

      <div className="mt-6">
        <div className="my-4 flex items-center">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="mx-3 text-sm text-muted">Or continue with</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <button type="button" onClick={signInWithGoogle} disabled={pending} className="w-full rounded-xl border border-border px-5 py-3.5 font-bold hover:bg-slate-50 flex items-center justify-center gap-3 disabled:opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.9 0 6.9 1.7 8.5 3.1l6.2-6.2C35.8 3.2 30.3 1 24 1 14.8 1 6.9 6.7 3.1 14.7l7.7 6c1.6-5.8 7-11.2 13.2-11.2z"/>
            <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-2.8-.4-4H24v8.1h12.6c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-3.9 6.7-10 6.7-16.7z"/>
            <path fill="#4A90E2" d="M10.8 29.2A14.7 14.7 0 0 1 9 24.5c0-1.9.3-3.7.8-5.4l-7.7-6C1.3 17 0 20.6 0 24.5c0 4.7 1.6 9 4.3 12.5l6.5-7.8z"/>
            <path fill="#FBBC05" d="M24 46.9c6.3 0 11.8-2.1 16-5.8l-7.3-5.7c-2 1.3-4.5 2.1-8.7 2.1-6.1 0-11.6-3.9-13.8-9.4l-7.7 6C6.9 41.8 14.8 46.9 24 46.9z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </section>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

function Field({ label, hint, inputRef, ...props }: FieldProps) {
  return (
    <label className="grid gap-2 font-semibold">
      {label}
      <input required ref={inputRef} {...props} className="rounded-xl border border-border px-4 py-3 font-normal outline-none transition focus:border-primary" />
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}
