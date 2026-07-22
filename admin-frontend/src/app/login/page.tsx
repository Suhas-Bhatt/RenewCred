"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE, apiErrorMessage } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("admin@renewcred.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password }, { withCredentials: true });
      const { accessToken, admin } = res.data.data;
      dispatch(setCredentials({ admin, accessToken }));
      router.push("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't log in — check your email and password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded bg-accent font-display text-lg font-bold text-white">
            R
          </div>
          <h1 className="font-display text-xl font-semibold text-white">RenewCred CMS</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/40">Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-canvas p-6 shadow-panel">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-ash">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="you@renewcred.dev"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-ash">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 rounded border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-ink py-2.5 text-sm font-medium text-white transition hover:bg-ink-soft disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-[11px] text-white/30">
          Seed credentials: admin@renewcred.dev / ChangeMe123!
        </p>
      </div>
    </div>
  );
}
