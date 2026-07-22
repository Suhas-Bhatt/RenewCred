"use client";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import type { MathData } from "@/lib/types";

export default function MathEditor({ value, onChange }: { value: MathData; onChange: (v: MathData) => void }) {
  return (
    <div>
      <textarea
        value={value.latex}
        onChange={(e) => onChange({ ...value, latex: e.target.value })}
        rows={2}
        placeholder="\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
        className="w-full rounded border border-line bg-white px-3 py-2 font-mono text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      <label className="mt-2 flex items-center gap-1.5 text-xs text-ash">
        <input
          type="checkbox"
          checked={value.displayMode}
          onChange={(e) => onChange({ ...value, displayMode: e.target.checked })}
        />
        Display mode (centered, own line)
      </label>
      <div className="mt-3 rounded border border-dashed border-line bg-paper p-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ash">Live preview</p>
        {value.latex ? (
          <div className="overflow-x-auto text-ink">
            {value.displayMode ? <BlockMath math={value.latex} /> : <InlineMath math={value.latex} />}
          </div>
        ) : (
          <p className="text-xs text-ash/60">Type LaTeX above to preview it here</p>
        )}
      </div>
    </div>
  );
}
