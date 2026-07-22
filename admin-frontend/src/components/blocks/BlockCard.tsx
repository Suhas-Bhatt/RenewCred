"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { Block, BlockType } from "@/lib/types";
import { BLOCK_TYPE_META } from "@/lib/types";
import BlockBody from "./BlockBody";

// Explicit map (not a dynamic `bg-block-${type}` template) because
// Tailwind's JIT compiler only picks up class names it can see literally
// in source — a runtime-built class string would get purged in production.
const TAG_COLOR: Record<BlockType, string> = {
  HEADING: "#4F46E5",
  PARAGRAPH: "#6B6D7A",
  IMAGE: "#0891B2",
  LIST: "#7C3AED",
  TABLE: "#B45309",
  MATH: "#BE185D",
  CODE: "#15803D",
  QUOTE: "#9333EA",
  DIVIDER: "#94A3B8",
  CALLOUT: "#0284C7",
};

export default function BlockCard({
  block,
  onChange,
  onDelete,
}: {
  block: Block;
  onChange: (data: Block["data"]) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const meta = BLOCK_TYPE_META[block.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-lg border border-line bg-canvas shadow-panel"
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab text-ash/50 hover:text-ash active:cursor-grabbing">
            <GripVertical size={14} />
          </button>
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white"
            style={{ backgroundColor: TAG_COLOR[block.type] }}
          >
            {meta.tag}
          </span>
          <span className="text-xs text-ash">{meta.label}</span>
        </div>
        <button onClick={onDelete} className="text-ash/60 opacity-0 transition hover:text-danger group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-4">
        <BlockBody block={block} onChange={onChange} />
      </div>
    </div>
  );
}
