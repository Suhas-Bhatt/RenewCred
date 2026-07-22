"use client";
import type { Block, CalloutData, CodeData, HeadingData, ImageData, ListData, MathData, ParagraphData, QuoteData, TableData } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import ListItemEditor from "./ListItemEditor";
import TableEditor from "./TableEditor";
import MathEditor from "./MathEditor";
import ImageEditor from "./ImageEditor";

export default function BlockBody({ block, onChange }: { block: Block; onChange: (data: Block["data"]) => void }) {
  switch (block.type) {
    case "HEADING": {
      const data = block.data as HeadingData;
      return (
        <div>
          <div className="mb-2 flex gap-1">
            {([1, 2, 3, 4] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onChange({ ...data, level: lvl })}
                className={`rounded px-2 py-0.5 text-xs font-mono ${
                  data.level === lvl ? "bg-accent text-white" : "bg-paper text-ash hover:bg-line"
                }`}
              >
                H{lvl}
              </button>
            ))}
          </div>
          <RichTextEditor value={data.content} onChange={(content) => onChange({ ...data, content })} placeholder="Heading text" />
        </div>
      );
    }
    case "PARAGRAPH": {
      const data = block.data as ParagraphData;
      return <RichTextEditor value={data.content} onChange={(content) => onChange({ ...data, content })} placeholder="Paragraph text" />;
    }
    case "IMAGE":
      return <ImageEditor value={block.data as ImageData} onChange={onChange} />;
    case "LIST": {
      const data = block.data as ListData;
      return (
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs text-ash">
            <input
              type="checkbox"
              checked={data.ordered}
              onChange={(e) => onChange({ ...data, ordered: e.target.checked })}
            />
            Ordered (numbered) list
          </label>
          <ListItemEditor items={data.items} onChange={(items) => onChange({ ...data, items })} />
        </div>
      );
    }
    case "TABLE":
      return <TableEditor value={block.data as TableData} onChange={onChange} />;
    case "MATH":
      return <MathEditor value={block.data as MathData} onChange={onChange} />;
    case "CODE": {
      const data = block.data as CodeData;
      return (
        <div>
          <input
            value={data.language}
            onChange={(e) => onChange({ ...data, language: e.target.value })}
            placeholder="language (e.g. javascript, python)"
            className="mb-2 w-48 rounded border border-line px-2 py-1 font-mono text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <textarea
            value={data.code}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
            rows={5}
            placeholder="// code"
            className="w-full rounded border border-line bg-ink px-3 py-2 font-mono text-xs text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      );
    }
    case "QUOTE": {
      const data = block.data as QuoteData;
      return (
        <div className="space-y-2">
          <RichTextEditor value={data.content} onChange={(content) => onChange({ ...data, content })} placeholder="Quote text" />
          <input
            value={data.cite || ""}
            onChange={(e) => onChange({ ...data, cite: e.target.value })}
            placeholder="Attribution (optional)"
            className="w-full rounded border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      );
    }
    case "DIVIDER":
      return <p className="py-2 text-center font-mono text-xs text-ash/60">— horizontal rule, no content —</p>;
    case "CALLOUT": {
      const data = block.data as CalloutData;
      return (
        <div>
          <div className="mb-2 flex gap-1">
            {(["info", "success", "warning", "danger"] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => onChange({ ...data, tone })}
                className={`rounded px-2 py-0.5 text-xs capitalize ${
                  data.tone === tone ? "bg-accent text-white" : "bg-paper text-ash hover:bg-line"
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
          <RichTextEditor value={data.content} onChange={(content) => onChange({ ...data, content })} placeholder="Callout text" />
        </div>
      );
    }
    default:
      return <p className="text-xs text-ash">Unsupported block type</p>;
  }
}
