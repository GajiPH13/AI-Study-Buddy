import { Navbar } from "@/components/navbar";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  return (
    <div className="min-h-screen">
      <Navbar activePath="/contact" />

      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Get in touch</h1>
          <p className="mt-4 text-xl text-muted">We&rsquo;d love to hear from you — feedback, questions, or just a hello.</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <ContactForm />

          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="font-bold mb-4">Contact information</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✉</span>
                  <a href="mailto:hello@aistudybuddy.app" className="hover:text-ink">hello@aistudybuddy.app</a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">🐦</span>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink">@aistudybuddy</a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">💻</span>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink">github.com/aistudybuddy</a>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="font-bold mb-2">Response time</h3>
              <p className="text-sm text-muted leading-6">We typically respond within 1–2 business days. For urgent issues, please include &ldquo;URGENT&rdquo; in your subject line.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
