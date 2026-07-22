import type { InlineRun } from "@/lib/types";

export default function InlineRuns({ runs }: { runs: InlineRun[] }) {
  return (
    <>
      {runs.map((run, i) => {
        let node: React.ReactNode = run.text;
        if (run.code) node = <code className="rounded bg-clay-soft px-1.5 py-0.5 font-mono text-[0.9em] text-clay">{node}</code>;
        if (run.bold) node = <strong className="font-semibold">{node}</strong>;
        if (run.italic) node = <em>{node}</em>;
        if (run.href) node = (
          <a href={run.href} className="text-clay underline decoration-clay/40 underline-offset-2 hover:decoration-clay">
            {node}
          </a>
        );
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}
