"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, LogOut, Image as ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { api } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pages", label: "Pages", icon: FileText },
  { href: "/media", label: "Media", icon: ImageIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((s) => s.auth.admin);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      dispatch(logoutAction());
      router.replace("/login");
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col justify-between bg-ink text-white">
      <div>
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-accent font-display text-sm font-bold">
            R
          </div>
          <span className="font-display text-sm font-semibold tracking-tight">RenewCred CMS</span>
        </div>

        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition ${
                  active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3">
          <p className="truncate text-sm font-medium">{admin?.name}</p>
          <p className="truncate font-mono text-[11px] text-white/40">{admin?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </aside>
  );
}
