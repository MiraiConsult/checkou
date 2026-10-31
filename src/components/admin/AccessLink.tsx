"use client";

import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/lib/utils/activity";
import { accessUrl } from "@/lib/impersonation";

// Abre em aba nova: cada aba guarda a própria conta, então dá para abrir vários clientes
export function AccessLink({ unitId, unitName, className, label = "Acessar" }: { unitId: string; unitName: string; className: string; label?: string }) {
  const { user } = useAuth();
  const log = () => {
    if (!user) return;
    logActivity({ organizationId: user.organization_id, userId: user.id, userName: user.name, action: "account_accessed", entityType: "unit", entityId: unitId, description: `acessou a conta de ${unitName}` });
  };
  return (
    <a href={accessUrl(unitId)} target="_blank" rel="noopener" onClick={log} className={className}>
      <span className="material-symbols-outlined text-[16px]">login</span>
      {label}
    </a>
  );
}
