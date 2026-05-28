"use client";

import { cn } from "@/lib/utils/cn";
import { SearchInput } from "@/components/ui/SearchInput";
import { useState } from "react";
import Link from "next/link";
import { useUnit, unitTabs } from "@/hooks/useUnit";
import { useAuth } from "@/hooks/useAuth";

export function TopNavBar() {
  const { activeUnit, setActiveUnit } = useUnit();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";

  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 fixed top-0 left-64 right-0 z-30">
      {/* Context tabs */}
      <div className="flex items-center gap-1">
        {unitTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveUnit(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all cursor-pointer",
              activeUnit === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <SearchInput placeholder="Buscar..." className="w-56" />

        <Link href="/configuracoes/alertas" className="relative p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </Link>

        <Link href="/relatorios" className="p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">help</span>
        </Link>

        <div className="h-6 w-px bg-slate-200" />

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-12 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[180px]">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-sm font-semibold text-navy">{user?.name || "..."}</p>
                <p className="text-xs text-on-surface-variant">{user?.email}</p>
              </div>
              <Link href="/configuracoes/alertas" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Configurações
              </Link>
              <button onClick={() => { setShowUserMenu(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
