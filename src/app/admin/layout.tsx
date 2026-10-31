"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, isStaff, canManageUsers } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { ActingBanner } from "@/components/layout/ActingBanner";
import { Brand } from "@/components/layout/Brand";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const staffNav = [
  { icon: "storefront", label: "Clientes", href: "/admin" },
  { icon: "badge", label: "Equipe Checkou", href: "/admin/equipe" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, fetchUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const manager = canManageUsers(user);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (!loading && !manager) router.push("/");
  }, [loading, manager, router]);

  if (!manager) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  const navItems = isStaff(user) ? staffNav : [{ icon: "group", label: "Minha equipe", href: "/admin" }];
  const isActive = (href: string) => pathname === href || (href === "/admin" && pathname.startsWith("/admin/clientes"));

  const nav = (
    <div className="flex flex-col h-full">
      <Brand admin className="px-6 pt-7 pb-6" />
      <nav className="flex-1 px-3.5 space-y-1">
        <p className="px-3 pb-2 text-xs font-bold text-slate-500">Administração</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all", isActive(item.href) ? "bg-white text-ink" : "text-slate-400 hover:text-white hover:bg-ink-2")}>
            <span className={cn("material-symbols-outlined text-[20px]", isActive(item.href) && "filled")}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-ink-2 transition-all">
          <span className="material-symbols-outlined text-[20px]">fact_check</span>
          Abrir o sistema
        </Link>
        <Link href="/tutoriais" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-ink-2 transition-all">
          <span className="material-symbols-outlined text-[20px]">help</span>
          Tutoriais
        </Link>
        <ThemeToggle className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-ink-2 transition-all cursor-pointer" />
      </nav>
      <div className="p-3.5">
        <div className="rounded-2xl bg-ink-2 p-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-ink transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sair
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="hidden lg:block w-60 bg-ink rounded-3xl fixed top-4 bottom-4 left-4 z-40 overflow-hidden">{nav}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-ink">{nav}</aside>
        </div>
      )}

      <div className="lg:ml-[16rem]">
        <header className="lg:hidden h-14 flex items-center gap-3 px-4 bg-surface-container-lowest">
          <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="p-2 -ml-1 rounded-lg cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant">menu</span>
          </button>
          <span className="text-sm font-bold text-navy">Painel Admin</span>
        </header>
        <main className="p-4 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto"><ActingBanner />{children}</div>
        </main>
      </div>
    </div>
  );
}
