"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth, isStaff, canManageUsers } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/layout/Brand";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/" },
  { icon: "fact_check", label: "Checklists", href: "/checklists" },
  { icon: "assignment_turned_in", label: "Aprovações", href: "/aprovacoes" },
  { icon: "analytics", label: "Relatórios", href: "/relatorios" },
  { icon: "history", label: "Histórico", href: "/historico" },
  { icon: "notifications", label: "Alertas", href: "/configuracoes/alertas", staffOnly: true },
  { icon: "settings", label: "Configurações", href: "/configuracoes", managerOnly: true },
  { icon: "admin_panel_settings", label: "Admin", href: "/admin", staffOnly: true },
];

export function SideNavBar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, fetchUser, logout } = useAuth();

  const [pendingAlerts, setPendingAlerts] = useState(0);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    const supabase = createClient();
    const checkPending = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { count: templateCount } = await supabase.from("checklist_templates").select("id", { count: "exact", head: true }).eq("status", "published").eq("frequency", "daily");
      const { count: execCount } = await supabase.from("checklist_executions").select("id", { count: "exact", head: true }).gte("started_at", today);
      setPendingAlerts(Math.max((templateCount || 0) - (execCount || 0), 0));
    };
    checkPending();
    const interval = setInterval(checkPending, 60000);
    return () => clearInterval(interval);
  }, []);

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";
  const items = navItems.filter((item) => item.managerOnly ? canManageUsers(user) : !item.staffOnly || isStaff(user));
  const roleLabel = isStaff(user) ? "Equipe Checkou" : user?.role === "operator" ? "Operador" : "Administrador";

  return (
    <aside className="hidden md:flex print:hidden flex-col w-64 bg-ink rounded-3xl fixed top-4 bottom-4 left-4 z-40 overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/"><Brand /></Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Principal</p>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && !items.some((other) => other.href !== item.href && other.href.startsWith(item.href) && pathname.startsWith(other.href)));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-white text-ink"
                  : "text-slate-400 hover:text-white hover:bg-ink-2"
              )}
            >
              <span className={cn("material-symbols-outlined text-[20px]", isActive && "filled")}>
                {item.icon}
              </span>
              {item.label}
              {item.icon === "notifications" && pendingAlerts > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 relative">
        {showUserMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-ink-2 rounded-2xl shadow-xl py-1 z-10">
            {isStaff(user) && (
              <Link href="/configuracoes/alertas" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-ink transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Configurações
              </Link>
            )}
            <button onClick={() => { setShowUserMenu(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-ink transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sair
            </button>
          </div>
        )}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-ink-2 rounded-2xl hover:bg-ink-2/70 transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">{user?.name || "..."}</p>
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
