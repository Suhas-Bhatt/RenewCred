"use client";
import { Plus, Trash2 } from "lucide-react";
import type { TableData } from "@/lib/types";

export default function TableEditor({ value, onChange }: { value: TableData; onChange: (v: TableData) => void }) {
  function updateHeader(i: number, text: string) {
    onChange({ ...value, headers: value.headers.map((h, idx) => (idx === i ? text : h)) });
  }
  function updateCell(r: number, c: number, text: string) {
    const rows = value.rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? text : cell)) : row));
    onChange({ ...value, rows });
  }
  function addColumn() {
    onChange({
      headers: [...value.headers, `Column ${value.headers.length + 1}`],
      rows: value.rows.map((row) => [...row, ""]),
    });
  }
  function removeColumn(i: number) {
    onChange({
      headers: value.headers.filter((_, idx) => idx !== i),
      rows: value.rows.map((row) => row.filter((_, idx) => idx !== i)),
    });
  }
  function addRow() {
    onChange({ ...value, rows: [...value.rows, value.headers.map(() => "")] });
  }
  function removeRow(i: number) {
    onChange({ ...value, rows: value.rows.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {value.headers.map((h, i) => (
              <th key={i} className="border border-line bg-paper p-0">
                <div className="flex items-center">
                  <input
                    value={h}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold text-ink outline-none"
                  />
                  <button onClick={() => removeColumn(i)} className="px-1 text-ash hover:text-danger" title="Remove column">
                    <Trash2 size={11} />
                  </button>
                </div>
              </th>
            ))}
            <th className="border border-line bg-paper p-1">
              <button onClick={addColumn} className="flex items-center gap-1 px-1 text-xs text-accent">
                <Plus size={12} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {value.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="border border-line p-0">
                  <input
                    value={cell}
                    onChange={(e) => updateCell(r, c, e.target.value)}
                    className="w-full px-2 py-1.5 text-sm outline-none focus:bg-accent-soft"
                  />
                </td>
              ))}
              <td className="border border-line p-1 text-center">
                <button onClick={() => removeRow(r)} className="text-ash hover:text-danger" title="Remove row">
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="mt-2 flex items-center gap-1 text-xs font-medium text-accent hover:underline">
        <Plus size={12} /> Add row
      </button>
    </div>
  );
}
