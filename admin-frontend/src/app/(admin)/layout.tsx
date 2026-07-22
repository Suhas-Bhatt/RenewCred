import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <main className="min-h-screen flex-1 bg-paper">{children}</main>
      </div>
    </AuthGuard>
  );
}
