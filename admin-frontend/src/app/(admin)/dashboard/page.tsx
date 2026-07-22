"use client";
import { useEffect } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, PenLine, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPages, initialContentState } from "@/store/slices/contentSlice";
import { initialAuthState } from "@/store/slices/authSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const content = useAppSelector((s) => s.content ?? initialContentState);
  const { pages, status } = content;
  const auth = useAppSelector((s) => s.auth ?? initialAuthState);
  const admin = auth.admin;

  useEffect(() => {
    dispatch(fetchPages({ pageSize: 100 }));
  }, [dispatch]);

  const published = pages.filter((p) => p.status === "PUBLISHED").length;
  const drafts = pages.filter((p) => p.status === "DRAFT").length;

  const stats = [
    { label: "Total pages", value: pages.length, icon: FileText, color: "text-accent" },
    { label: "Published", value: published, icon: CheckCircle2, color: "text-success" },
    { label: "Drafts", value: drafts, icon: PenLine, color: "text-warning" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back{admin ? `, ${admin.name.split(" ")[0]}` : ""}</h1>
          <p className="mt-1 text-sm text-ash">Here&apos;s what&apos;s live on the public site right now.</p>
        </div>
        <Link
          href="/pages/new"
          className="flex items-center gap-1.5 rounded bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-soft"
        >
          <Plus size={15} /> New page
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-line bg-canvas p-5 shadow-panel">
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded bg-paper ${color}`}>
              <Icon size={16} />
            </div>
            <p className="font-display text-2xl font-semibold text-ink">{status === "loading" ? "–" : value}</p>
            <p className="mt-0.5 text-xs text-ash">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-line bg-canvas shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-display text-sm font-semibold text-ink">Recently updated</h2>
          <Link href="/pages" className="text-xs font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-line">
          {pages.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              href={`/pages/${p.id}`}
              className="flex items-center justify-between px-5 py-3 transition hover:bg-paper"
            >
              <div>
                <p className="text-sm font-medium text-ink">{p.title}</p>
                <p className="font-mono text-xs text-ash">/{p.slug}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  p.status === "PUBLISHED" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}
              >
                {p.status}
              </span>
            </Link>
          ))}
          {pages.length === 0 && status !== "loading" && (
            <p className="px-5 py-8 text-center text-sm text-ash">No pages yet — create your first one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
