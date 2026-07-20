import Link from "next/link";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import { FaqAccordion } from "./faq-accordion";

const stats = [
  { label: "Students", value: "12,000+" },
  { label: "Study Sessions", value: "80,000+" },
  { label: "Subjects", value: "5" },
  { label: "Tutor Modes", value: "3" },
];

const features = [
  {
    icon: "💡",
    title: "Clear Explanations",
    description:
      "Turn difficult topics into student-friendly steps and examples. The tutor breaks down complexity at your level.",
  },
  {
    icon: "🧭",
    title: "Guided Hints",
    description:
      "Get unstuck without spoiling the answer. The tutor nudges you in the right direction so the understanding is yours.",
  },
  {
    icon: "📝",
    title: "Quick Quizzes",
    description:
      "Check your understanding with focused questions. Answers are held back until you attempt them — real practice, real feedback.",
  },
];

const steps = [
  { step: "1", title: "Create an account", description: "Register in seconds with your email. No verification, no waiting." },
  { step: "2", title: "Choose subject & mode", description: "Pick from Mathematics, Science, History, Programming, or General. Select Explain, Hint, or Quiz." },
  { step: "3", title: "Start your session", description: "Ask anything. Your tutor responds instantly in real time, and every conversation is saved." },
];

const subjects = [
  { name: "Mathematics", icon: "∑", color: "bg-blue-50 border-blue-200 text-blue-700", desc: "Algebra, calculus, geometry, statistics, and more." },
  { name: "Science", icon: "⚗", color: "bg-green-50 border-green-200 text-green-700", desc: "Physics, chemistry, biology, and earth science." },
  { name: "History", icon: "📜", color: "bg-amber-50 border-amber-200 text-amber-700", desc: "World history, civilizations, wars, and social movements." },
  { name: "Programming", icon: "</>", color: "bg-purple-50 border-purple-200 text-purple-700", desc: "Coding concepts, algorithms, debugging, and design." },
  { name: "General", icon: "📚", color: "bg-slate-50 border-slate-200 text-slate-700", desc: "Any topic that doesn't fit neatly into one category." },
];

const aiFeatures = [
  {
    badge: "AI Feature 1",
    title: "AI Chat Tutor",
    description:
      "A contextual conversational tutor in every study session. Streams responses in real time, remembers your conversation, and adapts to your subject and mode.",
    bullets: ["Streaming responses with stop & retry", "Full conversation history across sessions", "Content moderation for a safe learning environment"],
  },
  {
    badge: "AI Feature 2",
    title: "AI Study Recommendation Engine",
    description:
      "Analyzes your study history — which subjects you've explored, which questions you've asked — and surfaces the most relevant resources from the community.",
    bullets: ["Personalized to your subject frequency", "Context-aware reasoning by the AI", "Continuously improves as you study more"],
  },
];

const testimonials = [
  { name: "Maria S.", grade: "Grade 11", text: "AI Study Buddy helped me finally understand calculus derivatives. The Hint mode is amazing — it guides you without just handing over the answer." },
  { name: "James T.", grade: "University Freshman", text: "I use Quiz mode before every exam. Having it create questions on-the-spot and only reveal answers after my attempt changed how I study completely." },
  { name: "Aisha K.", grade: "Grade 9", text: "The fact that it remembers our conversations is a game-changer. I come back the next day and pick up exactly where I left off." },
];

const faqs = [
  { q: "Is AI Study Buddy free?", a: "Yes — creating an account and using all three tutoring modes is completely free." },
  { q: "Which subjects are supported?", a: "Mathematics, Science, History, Programming, and General. More subjects may be added in future updates." },
  { q: "Is my data private?", a: "Yes. Each conversation is private to your account. No other student or instructor can read your sessions." },
  { q: "Can I use it on my phone?", a: "Absolutely. The interface is fully responsive and works on phones, tablets, and desktops." },
  { q: "Which AI model powers it?", a: "The platform supports both OpenAI GPT models and locally-hosted Ollama models, configured by the operator." },
];

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = Boolean(session);

  return (
    <div className="min-h-screen">
      <Navbar activePath="/" />

      <main>
        {/* ── Section 1: Hero ── */}
        <section className="relative mx-auto flex min-h-[65vh] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-blue-100 opacity-50 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 h-56 w-56 rounded-full bg-blue-50 opacity-60 blur-2xl" />
          </div>
          <span className="relative mb-5 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-primary">
            Your focused study companion
          </span>
          <h1 className="relative max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Understand more.<br className="hidden sm:block" /> Study with confidence.
          </h1>
          <p className="relative mt-6 max-w-xl text-lg leading-8 text-muted">
            Choose a subject, pick a tutoring style, and ask anything. Your AI tutor responds instantly and remembers every session.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login?mode=register"}
              className="rounded-xl bg-primary px-7 py-3.5 font-bold text-black shadow-lg shadow-blue-200 hover:bg-primary-dark transition-colors"
            >
              {isLoggedIn ? "Go to dashboard" : "Start studying free"}
            </Link>
            <a href="#features" className="rounded-xl border border-border bg-white px-7 py-3.5 font-bold hover:border-primary transition-colors">
              See how it works
            </a>
          </div>
        </section>

        {/* ── Section 2: Statistics ── */}
        <section className="border-y border-border bg-white py-12">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map(({ label, value }) => (
                <div key={label} className="text-center">
                  <dt className="text-sm font-semibold text-muted uppercase tracking-wide">{label}</dt>
                  <dd className="mt-2 text-4xl font-bold text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Section 3: Features ── */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three ways to learn</h2>
            <p className="mt-4 text-lg text-muted">Every tutoring mode is designed around how students actually learn.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-border bg-white p-7 shadow-sm">
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Section 4: How It Works ── */}
        <section className="bg-white border-y border-border py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Up and running in minutes</h2>
              <p className="mt-4 text-lg text-muted">No setup, no configuration. Just learn.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map(({ step, title, description }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-lg shadow-blue-200">{step}</div>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-muted leading-7">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 5: Subjects ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Every subject covered</h2>
            <p className="mt-4 text-lg text-muted">Five subject areas with a tailored tutor for each.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {subjects.map(({ name, icon, color, desc }) => (
              <div key={name} className={`rounded-2xl border p-5 ${color}`}>
                <div className="text-2xl font-bold mb-2">{icon}</div>
                <h3 className="font-bold">{name}</h3>
                <p className="mt-1 text-xs leading-5 opacity-80">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 6: AI Features ── */}
        <section className="bg-white border-y border-border py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Powered by two AI features</h2>
              <p className="mt-4 text-lg text-muted">Not just chat — intelligent tutoring and personalized discovery.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {aiFeatures.map(({ badge, title, description, bullets }) => (
                <div key={title} className="rounded-2xl border border-border p-8 shadow-sm">
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">{badge}</span>
                  <h3 className="mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-muted leading-7">{description}</p>
                  <ul className="mt-5 space-y-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-muted">
                        <span className="mt-0.5 text-primary">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 7: Testimonials ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What students say</h2>
            <p className="mt-4 text-lg text-muted">Real feedback from students who study smarter.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map(({ name, grade, text }) => (
              <blockquote key={name} className="rounded-2xl border border-border bg-white p-7 shadow-sm">
                <p className="text-muted leading-7">&ldquo;{text}&rdquo;</p>
                <footer className="mt-5">
                  <p className="font-bold">{name}</p>
                  <p className="text-sm text-muted">{grade}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* ── Section 8: FAQ ── */}
        <section className="bg-white border-t border-border py-20">
          <div className="mx-auto max-w-2xl px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
            </div>
            <FaqAccordion faqs={faqs} />
          </div>
        </section>

        {/* ── Section 9: CTA ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 text-center">
          <div className="rounded-3xl bg-primary px-8 py-16 shadow-xl shadow-blue-200">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to study smarter?</h2>
            <p className="mt-4 text-lg text-blue-100">Join thousands of students already learning with AI Study Buddy.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login?mode=register"}
                className="rounded-xl bg-white px-7 py-3.5 font-bold text-white hover:bg-blue-50 transition-colors shadow"
              >
                {isLoggedIn ? "Open dashboard" : "Create free account"}
              </Link>
              <Link
                href="/explore"
                className="rounded-xl border border-white/40 px-7 py-3.5 font-bold text-white hover:bg-white/10 transition-colors"
              >
                Browse resources
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-lg font-bold">AI Study Buddy</p>
              <p className="mt-2 text-sm text-muted leading-6">Focused AI tutoring for students of all levels. Study smarter, not harder.</p>
            </div>
            <div>
              <p className="font-semibold text-sm uppercase tracking-wide">Platform</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><Link href="/explore" className="hover:text-ink">Explore Resources</Link></li>
                <li><Link href="/dashboard" className="hover:text-ink">Dashboard</Link></li>
                <li><Link href="/resources/add" className="hover:text-ink">Add Resource</Link></li>
                <li><Link href="/login" className="hover:text-ink">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm uppercase tracking-wide">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><Link href="/about" className="hover:text-ink">About</Link></li>
                <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm uppercase tracking-wide">Connect</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink">GitHub</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink">Twitter / X</a></li>
                <li><a href="mailto:hello@aistudybuddy.app" className="hover:text-ink">hello@aistudybuddy.app</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted">
            <p>AI responses can be incorrect. Verify important academic work with authoritative sources.</p>
            <p className="mt-1">© {new Date().getFullYear()} AI Study Buddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
