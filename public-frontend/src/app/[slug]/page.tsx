import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPage, getPublicPages } from "@/lib/api";
import PageBody from "@/components/PageBody";

interface Props {
  params: { slug: string };
}

// Pre-render every published page at build time (SSG) when the backend is
// reachable during the image build; ISR revalidation (see lib/api.ts) then
// keeps them fresh after edits. Docker Compose doesn't guarantee the
// backend is up while THIS image is being built, so on failure we return
// an empty list and let Next.js render those pages on-demand at request
// time instead (dynamicParams defaults to true) rather than failing the build.
export async function generateStaticParams() {
  try {
    const pages = await getPublicPages();
    return pages.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPublicPage(params.slug);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
  };
}

export default async function CmsPage({ params }: Props) {
  const page = await getPublicPage(params.slug);
  if (!page) notFound();
  return <PageBody page={page} />;
}
