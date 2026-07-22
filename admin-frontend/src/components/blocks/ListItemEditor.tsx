"use client";
import { Plus, Trash2, CornerDownRight } from "lucide-react";
import type { ListItem } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";

export default function ListItemEditor({
  items,
  onChange,
  depth = 0,
}: {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  depth?: number;
}) {
  function update(i: number, patch: Partial<ListItem>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, { content: [{ text: "" }] }]);
  }
  function addChild(i: number) {
    const item = items[i];
    update(i, { children: [...(item.children || []), { content: [{ text: "" }] }] });
  }

  return (
    <div className="space-y-2" style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      {items.map((item, i) => (
        <div key={i} className={depth > 0 ? "border-l-2 border-line pl-3" : ""}>
          <div className="flex items-start gap-1.5">
            <span className="mt-2 text-xs text-ash">{depth > 0 ? <CornerDownRight size={12} /> : "•"}</span>
            <div className="flex-1">
              <RichTextEditor value={item.content} onChange={(content) => update(i, { content })} placeholder="List item" />
            </div>
            <button type="button" onClick={() => addChild(i)} className="mt-1.5 text-ash hover:text-accent" title="Add sub-item">
              <CornerDownRight size={13} />
            </button>
            <button type="button" onClick={() => remove(i)} className="mt-1.5 text-ash hover:text-danger" title="Remove item">
              <Trash2 size={13} />
            </button>
          </div>
          {item.children && item.children.length > 0 && (
            <div className="mt-2">
              <ListItemEditor items={item.children} onChange={(children) => update(i, { children })} depth={depth + 1} />
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
        <Plus size={12} /> Add item
      </button>
    </div>
  );
}
