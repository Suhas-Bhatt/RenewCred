"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { createPage } from "@/store/slices/contentSlice";
import { apiErrorMessage } from "@/lib/api";

export default function NewPagePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(createPage({ title, slug: slug || undefined })).unwrap();
      router.push(`/pages/${result.id}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create the page"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">New page</h1>
      <p className="mb-6 text-sm text-ash">It starts as a draft — add blocks, then publish when it&apos;s ready.</p>

      <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-canvas p-6 shadow-panel">
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-ash">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="About RenewCred"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-ash">
            Slug <span className="text-ash/60">(optional — generated from title if left blank)</span>
          </label>
          <div className="flex items-center rounded border border-line focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <span className="pl-3 font-mono text-xs text-ash">/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded px-1.5 py-2 font-mono text-sm outline-none"
              placeholder="about-renewcred"
            />
          </div>
        </div>

        {error && <div className="mb-4 rounded border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger">{error}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-soft disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create page"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/pages")}
            className="rounded border border-line px-4 py-2 text-sm font-medium text-ash hover:bg-paper"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
