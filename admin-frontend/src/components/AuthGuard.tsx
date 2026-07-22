"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initialAuthState, setCredentials, setUnauthenticated } from "@/store/slices/authSlice";
import { API_BASE, api } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector((s) => s.auth ?? initialAuthState);

  useEffect(() => {
    if (status !== "idle") return;
    (async () => {
      try {
        const refreshRes = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        const accessToken = refreshRes.data.data.accessToken;
        const meRes = await api.get("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } });
        dispatch(setCredentials({ admin: meRes.data.data, accessToken }));
      } catch {
        dispatch(setUnauthenticated());
        router.replace("/login");
      }
    })();
  }, [status, dispatch, router]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-ash">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          <span className="font-mono text-sm">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return <>{children}</>;
}
