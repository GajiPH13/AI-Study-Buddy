"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS, DIFFICULTIES } from "@/lib/models";

export function AddResourceForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const imageUrl = String(form.get("imageUrl") ?? "").trim();

    const body = {
      title: String(form.get("title") ?? "").trim(),
      shortDescription: String(form.get("shortDescription") ?? "").trim(),
      fullDescription: String(form.get("fullDescription") ?? "").trim(),
      subject: form.get("subject"),
      difficulty: form.get("difficulty"),
      estimatedMinutes: Number(form.get("estimatedMinutes")),
      imageUrl: imageUrl || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null) as { error?: { message?: string } } | null;
      setError(data?.error?.message ?? "The resource could not be created. Please check your input.");
      setPending(false);
      return;
    }

    const { data } = await res.json() as { data: { id: string } };
    router.push(`/resources/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-5">
      <Field label="Title" name="title" type="text" minLength={3} maxLength={120} placeholder="e.g. Introduction to Algebra" required />
      <Field
        label="Short description"
        name="shortDescription"
        as="textarea"
        rows={2}
        minLength={10}
        maxLength={300}
        placeholder="A brief summary shown on cards (max 300 chars)"
        required
      />
      <Field
        label="Full description"
        name="fullDescription"
        as="textarea"
        rows={8}
        minLength={20}
        placeholder="Detailed content, notes, or study guide. Separate paragraphs with a blank line."
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Subject</label>
          <select name="subject" className="w-full rounded-xl border border-border bg-white px-3 py-3" required>
            {SUBJECTS.map((s) => <option key={s} value={s} className="capitalize">{cap(s)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Difficulty</label>
          <select name="difficulty" className="w-full rounded-xl border border-border bg-white px-3 py-3" required>
            {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{cap(d)}</option>)}
          </select>
        </div>
      </div>
      <Field
        label="Estimated study time (minutes)"
        name="estimatedMinutes"
        type="number"
        min={1}
        max={600}
        defaultValue={30}
        required
      />
      <div>
        <label className="block text-sm font-semibold mb-1.5">Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="algebra, equations, linear"
          className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
        />
        <p className="mt-1 text-xs text-muted">Up to 10 tags to help others find your resource.</p>
      </div>
      <Field label="Image URL (optional)" name="imageUrl" type="url" placeholder="https://example.com/image.jpg" />

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish resource"}
        </button>
        <Link href="/resources/manage" className="rounded-xl border border-border bg-white px-5 py-3 font-semibold hover:border-primary">
          Cancel
        </Link>
      </div>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  as?: "input" | "textarea";
};

function Field({ label, as = "input", ...props }: FieldProps) {
  const className = "w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary";
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {as === "textarea" ? (
        <textarea {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} className={className} />
      ) : (
        <input {...(props as React.InputHTMLAttributes<HTMLInputElement>)} className={className} />
      )}
    </label>
  );
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
