"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/" },
  { icon: "fact_check", label: "Checklists", href: "/checklists" },
  { icon: "assignment", label: "Tarefas", href: "/tarefas" },
  { icon: "assignment_turned_in", label: "Aprovações", href: "/aprovacoes" },
  { icon: "analytics", label: "Relatórios", href: "/relatorios" },
  { icon: "history", label: "Histórico", href: "/historico" },
  { icon: "notifications", label: "Alertas", href: "/configuracoes/alertas" },
];

export function SideNavBar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, fetchUser, logout } = useAuth();

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";
  const roleLabel = user?.role === "master" ? "Master" : user?.role === "admin" ? "Admin de Grupo" : "Operador";

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy fixed top-0 left-0 h-full z-40">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-[20px]">fact_check</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">CHECKOU</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">SaaS Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Principal</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <span className={cn("material-symbols-outlined text-[20px]", isActive && "filled")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 relative">
        {showUserMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1 z-10">
            <Link href="/configuracoes/alertas" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Configurações
            </Link>
            <button onClick={() => { setShowUserMenu(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sair
            </button>
          </div>
        )}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/50 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">{user?.name || "Carregando..."}</p>
            <p className="text-[11px] text-slate-400 truncate">{roleLabel}</p>
          </div>
          <span className="material-symbols-outlined text-slate-500 text-[18px]">
            {showUserMenu ? "expand_less" : "more_horiz"}
          </span>
        </button>
      </div>
    </aside>
  );
}
