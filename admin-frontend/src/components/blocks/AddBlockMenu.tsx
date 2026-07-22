"use client";
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { BLOCK_TYPE_META, type BlockType } from "@/lib/types";

const ORDER: BlockType[] = ["HEADING", "PARAGRAPH", "IMAGE", "LIST", "TABLE", "MATH", "CODE", "QUOTE", "CALLOUT", "DIVIDER"];

export default function AddBlockMenu({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-3 text-sm font-medium text-ash transition hover:border-accent hover:bg-accent-soft hover:text-accent"
      >
        <Plus size={15} /> Add block
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-10 mt-1.5 grid grid-cols-2 gap-1 rounded-lg border border-line bg-canvas p-1.5 shadow-panel">
          {ORDER.map((type) => (
            <button
              key={type}
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded px-2.5 py-2 text-left text-xs text-ink hover:bg-paper"
            >
              <span className="font-mono text-[9px] font-bold text-accent">{BLOCK_TYPE_META[type].tag}</span>
              {BLOCK_TYPE_META[type].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
