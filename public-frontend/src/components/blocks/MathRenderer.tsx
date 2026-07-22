"use client";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import type { MathData } from "@/lib/types";

export default function MathRenderer({ data }: { data: MathData }) {
  return (
    <div className={`overflow-x-auto ${data.displayMode ? "my-2 text-center" : "inline"}`}>
      {data.displayMode ? <BlockMath math={data.latex} /> : <InlineMath math={data.latex} />}
    </div>
  );
}
