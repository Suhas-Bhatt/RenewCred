import type { ListItem } from "@/lib/types";
import InlineRuns from "./InlineRuns";

export default function ListItems({ items, ordered }: { items: ListItem[]; ordered: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`space-y-1.5 pl-5 ${ordered ? "list-decimal" : "list-disc"} marker:text-clay/70`}>
      {items.map((item, i) => (
        <li key={i}>
          <InlineRuns runs={item.content} />
          {item.children && item.children.length > 0 && (
            <div className="mt-1.5">
              <ListItems items={item.children} ordered={ordered} />
            </div>
          )}
        </li>
      ))}
    </Tag>
  );
}
