import Link from "next/link";
import { Leaf } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line dark:border-ash/20 bg-cream/50 dark:bg-ink/50 backdrop-blur">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay text-cream shadow-sm">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-cream">
                RenewCred
              </span>
            </Link>
            <p className="text-sm text-ash dark:text-ash/80 max-w-sm">
              Accelerating the transition to clean energy by connecting innovative green projects with modern capital.
            </p>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-ink dark:text-cream mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-ash dark:text-ash/80">
              <li><Link href="/projects" className="hover:text-clay transition-colors">Our Projects</Link></li>
              <li><Link href="/impact" className="hover:text-clay transition-colors">Impact Reports</Link></li>
              <li><Link href="/about" className="hover:text-clay transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-ink dark:text-cream mb-4">Connect</h3>
            <div className="flex flex-col space-y-3 text-sm text-ash dark:text-ash/80">
              <a href="#" className="hover:text-clay transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-clay transition-colors">
                LinkedIn
              </a>
              <a href="#" className="hover:text-clay transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-line/50 dark:border-ash/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ash dark:text-ash/60">
          <p>© {new Date().getFullYear()} RenewCred. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-clay">Privacy Policy</Link>
            <Link href="#" className="hover:text-clay">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
