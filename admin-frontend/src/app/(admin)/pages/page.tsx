"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPages, deletePage, initialContentState } from "@/store/slices/contentSlice";

export default function PagesListPage() {
  const dispatch = useAppDispatch();
  const { pages, status } = useAppSelector((s) => s.content ?? initialContentState);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPages({ pageSize: 100 }));
  }, [dispatch]);

  async function handleDelete(id: string) {
    await dispatch(deletePage(id));
    setConfirmId(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Pages</h1>
          <p className="mt-1 text-sm text-ash">Every page rendered on the public site is managed here.</p>
        </div>
        <Link
          href="/pages/new"
          className="flex items-center gap-1.5 rounded bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-soft"
        >
          <Plus size={15} /> New page
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-canvas shadow-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/60 text-xs uppercase tracking-wide text-ash">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Blocks</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pages.map((p) => (
              <tr key={p.id} className="group transition hover:bg-paper/50">
                <td className="px-5 py-3">
                  <Link href={`/pages/${p.id}`} className="font-medium text-ink hover:text-accent">
                    {p.title}
                  </Link>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-ash">/{p.slug}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      p.status === "PUBLISHED" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-ash">{p._count?.blocks ?? "–"}</td>
                <td className="px-5 py-3 text-ash">{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3 opacity-0 transition group-hover:opacity-100">
                    {p.status === "PUBLISHED" && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "http://localhost:3001"}/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ash hover:text-accent"
                        title="View live"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {confirmId === p.id ? (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded bg-danger px-2 py-1 text-[11px] font-medium text-white"
                      >
                        Confirm delete
                      </button>
                    ) : (
                      <button onClick={() => setConfirmId(p.id)} className="text-ash hover:text-danger" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && status !== "loading" && (
          <p className="px-5 py-10 text-center text-sm text-ash">No pages yet — create your first one.</p>
        )}
      </div>
    </div>
  );
}
