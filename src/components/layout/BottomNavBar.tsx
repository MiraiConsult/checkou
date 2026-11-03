"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth, isStaff, canManageUsers } from "@/hooks/useAuth";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/" },
  { icon: "fact_check", label: "Checklists", href: "/checklists" },
  { icon: "assignment_turned_in", label: "Aprovações", href: "/aprovacoes" },
  { icon: "history", label: "Histórico", href: "/historico" },
  { icon: "settings", label: "Config", href: "/configuracoes", managerOnly: true },
  { icon: "admin_panel_settings", label: "Admin", href: "/admin", staffOnly: true },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = navItems.filter((item) => item.managerOnly ? canManageUsers(user) : !item.staffOnly || isStaff(user));

  return (
    <nav className="md:hidden print:hidden fixed bottom-3 left-3 right-3 bg-ink rounded-3xl px-1.5 py-1.5 z-40">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[52px] py-1.5 px-1 rounded-2xl transition-all",
                isActive
                  ? "bg-white text-ink font-bold"
                  : "text-slate-400"
              )}
            >
              <span className={cn("material-symbols-outlined text-[22px]", isActive && "filled")}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
