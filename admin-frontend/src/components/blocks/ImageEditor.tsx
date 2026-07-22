"use client";
import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import type { ImageData } from "@/lib/types";

export default function ImageEditor({ value, onChange }: { value: ImageData; onChange: (v: ImageData) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/media", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/api$/, "");
      onChange({ ...value, url: `${base}${res.data.data.url}` });
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value.url} alt={value.alt} className="max-h-48 rounded border border-line object-cover" />
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded border border-dashed border-line bg-paper py-8 text-ash hover:border-accent hover:text-accent">
          <UploadCloud size={20} />
          <span className="text-xs">{uploading ? "Uploading…" : "Click to upload an image"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <input
        value={value.url}
        onChange={(e) => onChange({ ...value, url: e.target.value })}
        placeholder="or paste an image URL"
        className="w-full rounded border border-line px-2.5 py-1.5 text-xs font-mono outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      <input
        value={value.alt}
        onChange={(e) => onChange({ ...value, alt: e.target.value })}
        placeholder="Alt text (for accessibility)"
        className="w-full rounded border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      <input
        value={value.caption || ""}
        onChange={(e) => onChange({ ...value, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full rounded border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
