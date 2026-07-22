"use client";
import { useEffect, useState } from "react";
import { UploadCloud, Copy } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/api$/, "");

  async function load() {
    const res = await api.get("/media");
    setItems(res.data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/media", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Media</h1>
      <p className="mb-6 text-sm text-ash">Files uploaded here can be used in any Image block.</p>

      <label className="mb-8 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-canvas py-10 text-ash hover:border-accent hover:text-accent">
        <UploadCloud size={22} />
        <span className="text-sm">{uploading ? "Uploading…" : "Click to upload"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      {error && <p className="mb-4 text-xs text-danger">{error}</p>}

      <div className="grid grid-cols-4 gap-4">
        {items.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-lg border border-line bg-canvas shadow-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${apiOrigin}${m.url}`} alt={m.filename} className="h-28 w-full object-cover" />
            <div className="flex items-center justify-between px-2.5 py-2">
              <p className="truncate text-[11px] text-ash">{m.filename}</p>
              <button
                onClick={() => navigator.clipboard.writeText(`${apiOrigin}${m.url}`)}
                className="text-ash hover:text-accent"
                title="Copy URL"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-sm text-ash">No uploads yet.</p>}
    </div>
  );
}
