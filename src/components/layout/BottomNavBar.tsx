"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth, isStaff } from "@/hooks/useAuth";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/" },
  { icon: "fact_check", label: "Checklists", href: "/checklists" },
  { icon: "assignment_turned_in", label: "Aprovações", href: "/aprovacoes" },
  { icon: "history", label: "Histórico", href: "/historico" },
  { icon: "settings", label: "Config", href: "/configuracoes", staffOnly: true },
  { icon: "admin_panel_settings", label: "Admin", href: "/admin", staffOnly: true },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = navItems.filter((item) => !item.staffOnly || isStaff(user));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40 px-2 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[52px] py-1 px-1 rounded-xl transition-all",
                isActive
                  ? "text-blue-600 font-bold bg-blue-50"
                  : "text-slate-500"
              )}
            >
              <span className={cn("material-symbols-outlined text-[22px]", isActive && "filled")}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
