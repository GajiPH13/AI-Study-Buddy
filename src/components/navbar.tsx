import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

type Props = { activePath?: string };

export async function Navbar({ activePath }: Props) {
  const session = await getSession();
  const isLoggedIn = Boolean(session);

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-semibold transition-colors ${
        activePath === href ? "text-primary" : "text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8"
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight text-ink">
          AI Study Buddy
        </Link>

        {/* Centre links — hidden on mobile */}
        <div className="hidden items-center gap-6 sm:flex">
          {link("/explore", "Explore")}
          {link("/about", "About")}
          {link("/contact", "Contact")}
          {isLoggedIn && (
            <>
              {link("/dashboard", "Dashboard")}
              {link("/resources/manage", "My Resources")}
              {link("/resources/add", "Add Resource")}
            </>
          )}
        </div>

        {/* Right side: Login or Logout */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-xl !bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
