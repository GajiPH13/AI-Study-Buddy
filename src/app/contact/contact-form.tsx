"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    // Simulate a brief submission delay
    setTimeout(() => {
      setSent(true);
      setPending(false);
    }, 800);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <p className="text-4xl mb-4">✓</p>
        <h2 className="text-xl font-bold text-emerald-800">Message sent!</h2>
        <p className="mt-2 text-emerald-700">Thank you for reaching out. We&rsquo;ll get back to you within 1–2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold mb-1.5 block">First name</span>
          <input required type="text" name="firstName" className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold mb-1.5 block">Last name</span>
          <input required type="text" name="lastName" className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold mb-1.5 block">Email</span>
        <input required type="email" name="email" className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold mb-1.5 block">Subject</span>
        <select name="subject" className="w-full rounded-xl border border-border bg-white px-3 py-3">
          <option value="general">General inquiry</option>
          <option value="feedback">Feedback</option>
          <option value="bug">Report a bug</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold mb-1.5 block">Message</span>
        <textarea
          required
          name="message"
          rows={5}
          minLength={20}
          className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary resize-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
