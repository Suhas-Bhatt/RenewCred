import Link from "next/link";
import { getPublicPages } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";

export default async function SiteHeader() {
  const pages = await getPublicPages();

  return (
    <header className="sticky top-0 z-50 border-b border-line dark:border-ash/20 bg-cream/80 dark:bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay font-display text-sm font-bold text-cream shadow-sm transition-transform group-hover:scale-105">
            R
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-cream">RenewCred</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <nav className="hidden md:flex items-center gap-6 font-medium text-ink/70 dark:text-cream/70">
            {pages.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`} className="transition hover:text-clay dark:hover:text-clay">
                {p.title}
              </Link>
            ))}
          </nav>
          <div className="h-4 w-px bg-line dark:bg-ash/30 hidden md:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
