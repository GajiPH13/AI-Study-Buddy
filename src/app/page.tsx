import Link from "next/link";

const features = [
  ["Clear explanations", "Turn difficult topics into student-friendly steps and examples."],
  ["Guided hints", "Get unstuck without immediately giving away the complete solution."],
  ["Quick quizzes", "Check your understanding with focused questions and concise feedback."],
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
      <nav className="flex items-center justify-between" aria-label="Primary navigation">
        <Link href="/" className="text-lg font-bold tracking-tight">AI Study Buddy</Link>
        <Link href="/login" className="rounded-full border border-[var(--border)] bg-white px-5 py-2.5 font-semibold shadow-sm hover:border-[var(--primary)]">Log in</Link>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Your focused study companion</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Understand more. Study with confidence.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">Choose a subject and tutoring style, ask a question, and continue every conversation whenever you return.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login?mode=register" className="rounded-xl bg-[var(--primary)] px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-[var(--primary-dark)]">Start studying</Link>
            <a href="#features" className="rounded-xl border border-[var(--border)] bg-white px-6 py-3.5 font-bold hover:border-[var(--primary)]">See how it helps</a>
          </div>
        </div>

        <div id="features" className="grid gap-4">
          {features.map(([title, description], index) => (
            <article key={title} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <span className="mb-4 grid size-9 place-items-center rounded-lg bg-blue-50 font-bold text-[var(--primary)]">{index + 1}</span>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 leading-7 text-[var(--muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-5 text-sm text-[var(--muted)]">AI responses can be incorrect. Verify important academic work.</footer>
    </main>
  );
}
