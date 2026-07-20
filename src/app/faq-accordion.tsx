"use client";

import { useState } from "react";

type Faq = { q: string; a: string };

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <dl className="divide-y divide-[var(--border)] rounded-2xl border border-border overflow-hidden">
      {faqs.map(({ q, a }, i) => (
        <div key={q} className="bg-white">
          <dt>
            <button
              type="button"
              className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold hover:bg-slate-50 transition-colors"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {q}
              <span className={`ml-4 flex-shrink-0 text-primary transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
          </dt>
          {open === i && (
            <dd className="px-6 pb-5 text-muted leading-7">{a}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
