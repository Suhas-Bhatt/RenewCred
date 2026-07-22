import type { Page } from "@/lib/types";
import BlockRenderer from "./blocks/BlockRenderer";

export default function PageBody({ page }: { page: Page }) {
  return (
    <article className="mx-auto max-w-prose px-6 py-14">
      {(page.blocks || []).map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </article>
  );
}
