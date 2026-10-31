"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function TopNavBar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (!user?.organization_id) return;
    const supabase = createClient();
    if (user.unit_id) {
      supabase.from("units").select("name").eq("id", user.unit_id).single()
        .then(({ data }) => { if (data) setOrgName(data.name); });
      return;
    }
    supabase.from("organizations").select("name").eq("id", user.organization_id).single()
      .then(({ data }) => { if (data) setOrgName(data.name); });
  }, [user?.organization_id, user?.unit_id]);

  return (
    <header className="hidden md:flex print:hidden items-center justify-between h-16 px-6 bg-surface-container-lowest/85 backdrop-blur-xl rounded-full shadow-card fixed top-4 left-[17.5rem] right-4 md:right-6 z-30">
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

        {isStaff(user) && (
          <Link href="/configuracoes/alertas" className="relative p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
          </Link>
        )}

        <Link href="/relatorios" className="p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">help</span>
        </Link>

        <ThemeToggle className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer" />

        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-12 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[180px]">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-sm font-semibold text-navy">{user?.name || "..."}</p>
                <p className="text-xs text-on-surface-variant">{user?.email}</p>
              </div>
              {isStaff(user) && (
                <Link href="/configuracoes/alertas" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  Configurações
                </Link>
              )}
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
