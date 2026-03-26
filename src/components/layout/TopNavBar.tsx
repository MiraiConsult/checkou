"use client";

import { cn } from "@/lib/utils/cn";
import { SearchInput } from "@/components/ui/SearchInput";
import { useState } from "react";
import Link from "next/link";

const tabs = [
  { label: "Empresa Alfa", id: "empresa" },
  { label: "Grupo Beta", id: "grupo" },
  { label: "Unidade Sul", id: "unidade" },
];

export function TopNavBar() {
  const [activeTab, setActiveTab] = useState("empresa");
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 fixed top-0 left-64 right-0 z-30">
      {/* Context tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all cursor-pointer",
              activeTab === tab.id
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
              <span className="text-xs font-bold text-primary">CS</span>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-12 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[180px]">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-sm font-semibold text-navy">Carlos Silva</p>
                <p className="text-xs text-on-surface-variant">Admin de Grupo</p>
              </div>
              <Link href="/configuracoes/alertas" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Configurações
              </Link>
              <Link href="/login" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sair
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
