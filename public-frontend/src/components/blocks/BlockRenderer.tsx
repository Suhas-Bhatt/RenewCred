import type {
  Block,
  CalloutData,
  CodeData,
  HeadingData,
  ImageData,
  ListData,
  ParagraphData,
  QuoteData,
  TableData,
  MathData,
} from "@/lib/types";
import InlineRuns from "./InlineRuns";
import ListItems from "./ListItems";
import MathRenderer from "./MathRenderer";

const HEADING_STYLES: Record<number, string> = {
  1: "text-4xl md:text-5xl font-semibold leading-tight mt-2 mb-4",
  2: "text-2xl md:text-3xl font-semibold leading-tight mt-10 mb-3",
  3: "text-xl md:text-2xl font-semibold leading-snug mt-8 mb-2",
  4: "text-lg font-semibold leading-snug mt-6 mb-2",
};

const CALLOUT_STYLES: Record<string, string> = {
  info: "border-clay/30 bg-clay-soft text-ink",
  success: "border-moss/30 bg-moss/10 text-ink",
  warning: "border-amber-400/40 bg-amber-50 text-ink",
  danger: "border-red-400/40 bg-red-50 text-ink",
};

export default function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "HEADING": {
      const data = block.data as HeadingData;
      const Tag = (`h${data.level}` as unknown) as keyof JSX.IntrinsicElements;
      return (
        <Tag className={`font-display ${HEADING_STYLES[data.level]}`}>
          <InlineRuns runs={data.content} />
        </Tag>
      );
    }
    case "PARAGRAPH": {
      const data = block.data as ParagraphData;
      return (
        <p className="mb-5 text-[17px] leading-[1.75] text-ink/90">
          <InlineRuns runs={data.content} />
        </p>
      );
    }
    case "IMAGE": {
      const data = block.data as ImageData;
      if (!data.url) return null;
      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.url} alt={data.alt} className="w-full rounded-md border border-line" />
          {data.caption && <figcaption className="mt-2 text-center text-sm text-ash">{data.caption}</figcaption>}
        </figure>
      );
    }
    case "LIST": {
      const data = block.data as ListData;
      return (
        <div className="mb-5 text-[17px] leading-[1.75]">
          <ListItems items={data.items} ordered={data.ordered} />
        </div>
      );
    }
    case "TABLE": {
      const data = block.data as TableData;
      return (
        <div className="my-6 overflow-x-auto rounded-md border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-line/40">
                {data.headers.map((h, i) => (
                  <th key={i} className="border-b border-line px-3 py-2 text-left font-semibold text-ink">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, r) => (
                <tr key={r} className="odd:bg-cream even:bg-white">
                  {row.map((cell, c) => (
                    <td key={c} className="border-b border-line px-3 py-2 text-ink/85">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "MATH":
      return (
        <div className="my-6">
          <MathRenderer data={block.data as MathData} />
        </div>
      );
    case "CODE": {
      const data = block.data as CodeData;
      return (
        <pre className="my-6 overflow-x-auto rounded-md bg-ink px-4 py-3 font-mono text-sm text-cream">
          <code>{data.code}</code>
        </pre>
      );
    }
    case "QUOTE": {
      const data = block.data as QuoteData;
      return (
        <blockquote className="my-6 border-l-2 border-clay pl-4 italic text-ink/80">
          <InlineRuns runs={data.content} />
          {data.cite && <footer className="mt-1 font-body text-sm not-italic text-ash">— {data.cite}</footer>}
        </blockquote>
      );
    }
    case "DIVIDER":
      return <hr className="my-8 border-line" />;
    case "CALLOUT": {
      const data = block.data as CalloutData;
      return (
        <div className={`my-6 rounded-md border px-4 py-3 text-[15px] ${CALLOUT_STYLES[data.tone]}`}>
          <InlineRuns runs={data.content} />
        </div>
      );
    }
    default:
      return null;
  }
}
