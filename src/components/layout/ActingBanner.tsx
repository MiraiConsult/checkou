"use client";

import { useAuth } from "@/hooks/useAuth";
import { leaveAccess } from "@/lib/impersonation";

export function ActingBanner() {
  const { user } = useAuth();
  if (!user?.acting_name) return null;
  return (
    <div className="print:hidden flex flex-wrap items-center gap-3 bg-lime text-on-lime rounded-full pl-5 pr-2 py-2 mb-6 text-sm font-bold">
      <span className="material-symbols-outlined text-[20px]">login</span>
      <span className="flex-1 min-w-0">Você está na conta de {user.acting_name} como admin</span>
      <button onClick={leaveAccess} className="bg-ink text-white rounded-full px-4 py-2 text-xs font-bold cursor-pointer">Voltar ao admin</button>
    </div>
  );
}
