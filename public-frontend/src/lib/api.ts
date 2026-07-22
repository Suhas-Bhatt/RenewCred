import type { Page } from "./types";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Revalidate every 60s (ISR) so published edits show up without a full
// redeploy, while still getting the performance benefit of static caching
// between edits — a reasonable default for a marketing/docs site.
//
// Both helpers swallow fetch-level failures (not just non-2xx responses)
// and degrade to an empty/null result. This matters at build time: Docker
// Compose builds this image independently of whether the backend
// container happens to be running yet, so a hard network error here must
// not fail `next build` — pages fall back to on-demand rendering instead
// (see generateStaticParams in app/[slug]/page.tsx).
export async function getPublicPages(): Promise<Pick<Page, "slug" | "title" | "publishedAt">[]> {
  try {
    const res = await fetch(`${API_URL}/public/pages`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data;
  } catch {
    return [];
  }
}

export async function getPublicPage(slug: string): Promise<Page | null> {
  try {
    const res = await fetch(`${API_URL}/public/pages/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}
