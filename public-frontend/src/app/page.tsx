import { getPublicPage } from "@/lib/api";
import PageBody from "@/components/PageBody";
import { ArrowRight, FileEdit, Sparkles } from "lucide-react";

export default async function HomePage() {
  const page = await getPublicPage("home");

  if (!page) {
    return (
      <div className="relative mx-auto max-w-4xl px-6 py-32 text-center min-h-[70vh] flex flex-col justify-center items-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-clay/20 dark:bg-clay/10 rounded-full blur-3xl -z-10" />
        
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-clay/20 bg-clay/5 px-4 py-2 text-sm font-medium text-clay dark:border-clay/10 dark:bg-clay/10">
          <Sparkles className="h-4 w-4" />
          <span>Contest Assignment</span>
        </div>
        
        <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-ink dark:text-cream mb-6">
          Financing the future of <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-clay to-moss">clean energy</span>
        </h1>
        
        <p className="mt-4 text-lg text-ash dark:text-ash/80 max-w-2xl mb-12">
          This is a beautiful placeholder for your headless CMS. Publish a page with the slug <code className="rounded-md bg-ink/5 dark:bg-cream/10 px-1.5 py-0.5 font-mono text-sm text-clay dark:text-cream border border-line dark:border-ash/20">home</code> from the admin panel to replace this landing page.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-medium text-cream shadow-lg shadow-clay/20 hover:bg-clay/90 hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center">
            <FileEdit className="h-4 w-4" />
            Open Admin Panel
          </a>
          <a href="#" className="group flex items-center gap-2 rounded-full border border-line dark:border-ash/30 bg-cream dark:bg-ink px-6 py-3 font-medium text-ink dark:text-cream hover:bg-line/20 dark:hover:bg-ash/10 transition-all w-full sm:w-auto justify-center">
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    );
  }

  return <PageBody page={page} />;
}
