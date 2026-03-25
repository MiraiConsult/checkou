"use client";

import { cn } from "@/lib/utils/cn";
import { SearchInput } from "@/components/ui/SearchInput";
import { useState } from "react";

const tabs = [
  { label: "Empresa Alfa", id: "empresa" },
  { label: "Grupo Beta", id: "grupo" },
  { label: "Unidade Sul", id: "unidade" },
];

export function TopNavBar() {
  const [activeTab, setActiveTab] = useState("empresa");

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

        <button className="relative p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        <button className="p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">help</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">CS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
