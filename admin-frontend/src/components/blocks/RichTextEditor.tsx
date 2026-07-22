"use client";
import { Bold, Italic, Code as CodeIcon } from "lucide-react";
import type { InlineRun } from "@/lib/types";

// Scoping decision: rather than a full contenteditable rich-text engine
// (which would need its own serialization format), each content run is
// edited as plain text with per-run bold/italic/code toggles. A block can
// still mix multiple differently-styled runs by using the "+ Add run"
// control below — this keeps the stored shape (InlineRun[]) exactly what
// the renderer expects, with predictable, inspectable data at every step.
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: InlineRun[];
  onChange: (runs: InlineRun[]) => void;
  placeholder?: string;
}) {
  function updateRun(i: number, patch: Partial<InlineRun>) {
    const next = value.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  }
  function removeRun(i: number) {
    onChange(value.filter((_, idx) => idx !== i).length ? value.filter((_, idx) => idx !== i) : [{ text: "" }]);
  }
  function addRun() {
    onChange([...value, { text: "" }]);
  }

  return (
    <div className="space-y-1.5">
      {value.map((run, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={run.text}
            onChange={(e) => updateRun(i, { text: e.target.value })}
            placeholder={i === 0 ? placeholder : "…continued text"}
            className={`min-w-0 flex-1 rounded border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent ${
              run.bold ? "font-semibold" : ""
            } ${run.italic ? "italic" : ""} ${run.code ? "font-mono" : ""}`}
          />
          <button
            type="button"
            onClick={() => updateRun(i, { bold: !run.bold })}
            className={`rounded p-1.5 ${run.bold ? "bg-accent text-white" : "text-ash hover:bg-paper"}`}
            title="Bold"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() => updateRun(i, { italic: !run.italic })}
            className={`rounded p-1.5 ${run.italic ? "bg-accent text-white" : "text-ash hover:bg-paper"}`}
            title="Italic"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={() => updateRun(i, { code: !run.code })}
            className={`rounded p-1.5 ${run.code ? "bg-accent text-white" : "text-ash hover:bg-paper"}`}
            title="Inline code"
          >
            <CodeIcon size={13} />
          </button>
          {value.length > 1 && (
            <button type="button" onClick={() => removeRun(i)} className="px-1 text-xs text-ash hover:text-danger">
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addRun} className="text-xs font-medium text-accent hover:underline">
        + Add styled run
      </button>
    </div>
  );
}
