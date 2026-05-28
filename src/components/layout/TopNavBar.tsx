"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export function TopNavBar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (!user?.organization_id) return;
    const supabase = createClient();
    supabase.from("organizations").select("name").eq("id", user.organization_id).single()
      .then(({ data }) => { if (data) setOrgName(data.name); });
  }, [user?.organization_id]);

  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 fixed top-0 left-64 right-0 z-30">
      {/* Org name */}
      <div className="flex items-center gap-3">
        {orgName && (
          <div className="flex items-center gap-2 text-sm font-semibold text-navy">
            <span className="material-symbols-outlined text-primary text-[18px]">domain</span>
            {orgName}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <SearchInput placeholder="Buscar..." className="w-56" />

        <Link href="/configuracoes/alertas" className="relative p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
        </Link>

        <Link href="/relatorios" className="p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">help</span>
        </Link>

        <div className="h-6 w-px bg-slate-200" />

        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 cursor-pointer">
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
