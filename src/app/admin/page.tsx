"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { fetchAdminData, inputClass, isRecent, labelClass, timeAgo, type AdminExecution, type AdminTemplate, type AdminUnit, type AdminUser } from "@/lib/admin";

function situation(userCount: number, lastExecution: string | null) {
  if (userCount === 0) return { variant: "warning" as const, label: "Sem usuários" };
  if (isRecent(lastExecution)) return { variant: "success" as const, label: "Em uso" };
  return { variant: "pending" as const, label: "Parado" };
}

export default function AdminClientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const staff = isStaff(user);
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [executions, setExecutions] = useState<AdminExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.unit_id) router.replace(`/admin/clientes/${user.unit_id}`);
  }, [user, router]);

  useEffect(() => {
    if (!staff) return;
    fetchAdminData().then((data) => {
      setError(data.error || "");
      setUnits(data.units);
      setUsers(data.users);
      setTemplates(data.templates);
      setExecutions(data.executions);
      setLoading(false);
    });
  }, [staff]);

  const rows = useMemo(() => units.map((unit) => {
    const unitExecutions = executions.filter((e) => e.unit_id === unit.id);
    const unitUsers = users.filter((u) => u.unit_id === unit.id);
    const lastExecution = unitExecutions[0]?.completed_at || unitExecutions[0]?.started_at || null;
    const lastAccess = unitUsers.map((u) => u.last_sign_in_at).filter(Boolean).sort().pop() || null;
    return {
      unit,
      userCount: unitUsers.length,
      checklistCount: templates.filter((t) => t.unit_ids.includes(unit.id)).length,
      executionCount: unitExecutions.length,
      lastExecution,
      lastAccess,
      average: unitExecutions.length ? Math.round(unitExecutions.reduce((sum, e) => sum + Number(e.score), 0) / unitExecutions.length) : null,
    };
  }), [units, users, templates, executions]);

  const filtered = rows.filter((row) => row.unit.name.toLowerCase().includes(search.toLowerCase()));
  const clientExecutions = executions.filter((e) => e.unit_id);
  const kpis = [
    { label: "Clientes", value: units.length, icon: "storefront", tone: "text-primary" },
    { label: "Usuários", value: users.filter((u) => u.unit_id).length, icon: "group", tone: "text-sky-500" },
    { label: "Execuções", value: clientExecutions.length, icon: "task_alt", tone: "text-tertiary" },
    { label: "Execuções em 7 dias", value: clientExecutions.filter((e) => isRecent(e.completed_at || e.started_at)).length, icon: "bolt", tone: "text-amber-500" },
  ];

  const createClientUnit = async () => {
    if (!user?.organization_id) return;
    setSaving(true);
    setError("");
    const { data, error: insertError } = await createClient().from("units")
      .insert({ organization_id: user.organization_id, name: newName.trim(), location: newLocation.trim() })
      .select("id").single();
    setSaving(false);
    if (insertError || !data) {
      setError("Não foi possível criar o cliente.");
      setCreating(false);
      return;
    }
    router.push(`/admin/clientes/${data.id}`);
  };

  if (!staff || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">storefront</span>
            Clientes
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">Situação, usuários, checklists e execuções de cada empresa</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setNewName(""); setNewLocation(""); setCreating(true); }}>
          <span className="material-symbols-outlined text-[16px]">add</span>
          Novo cliente
        </Button>
      </div>

      {error && (
        <div className="py-3 px-4 bg-error/10 text-error rounded-xl flex items-center gap-2 font-semibold text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-on-surface-variant">{kpi.label}</p>
              <span className={`material-symbols-outlined text-[20px] ${kpi.tone}`}>{kpi.icon}</span>
            </div>
            <p className="text-3xl font-bold text-navy tabular-nums">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." className={`${inputClass} max-w-sm`} />

      {filtered.length === 0 ? (
        <Card><p className="text-center text-sm text-on-surface-variant py-10">Nenhum cliente encontrado.</p></Card>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10">
          <div className="hidden md:grid grid-cols-[1.8fr_1fr_1fr_0.7fr_0.8fr_0.8fr_2rem] gap-3 px-5 py-3 text-xs font-bold text-on-surface-variant border-b border-outline-variant/10">
            <span>Cliente</span>
            <span>Último acesso</span>
            <span>Última execução</span>
            <span className="text-right">Usuários</span>
            <span className="text-right">Checklists</span>
            <span className="text-right">Score médio</span>
            <span />
          </div>
          <div className="divide-y divide-outline-variant/10">
            {filtered.map((row) => {
              const status = situation(row.userCount, row.lastExecution);
              return (
                <Link key={row.unit.id} href={`/admin/clientes/${row.unit.id}`} className="grid grid-cols-2 md:grid-cols-[1.8fr_1fr_1fr_0.7fr_0.8fr_0.8fr_2rem] gap-3 px-5 py-3.5 items-center hover:bg-surface-container-low transition-colors">
                  <div className="col-span-2 md:col-span-1 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {row.unit.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-navy truncate">{row.unit.name}</p>
                      <Badge variant={status.variant} className="mt-0.5">{status.label}</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-on-surface-variant"><span className="md:hidden text-xs text-outline">Acesso: </span>{timeAgo(row.lastAccess)}</span>
                  <span className="text-sm text-on-surface-variant"><span className="md:hidden text-xs text-outline">Execução: </span>{timeAgo(row.lastExecution)}</span>
                  <span className="md:text-right text-sm text-navy tabular-nums"><span className="md:hidden text-xs text-outline">Usuários: </span>{row.userCount}</span>
                  <span className="md:text-right text-sm text-navy tabular-nums"><span className="md:hidden text-xs text-outline">Checklists: </span>{row.checklistCount}</span>
                  <span className="md:text-right text-sm text-navy tabular-nums"><span className="md:hidden text-xs text-outline">Score: </span>{row.average === null ? "—" : `${row.average}%`}</span>
                  <span className="material-symbols-outlined text-outline text-[18px] hidden md:block">chevron_right</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-on-surface-variant">&quot;Último acesso&quot; é o login mais recente de qualquer usuário da empresa. &quot;Em uso&quot; significa pelo menos uma execução nos últimos 7 dias. Clique em uma linha para abrir o cliente.</p>

      {creating && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy mb-5">Novo cliente</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome da empresa *</label>
                <input type="text" value={newName} autoFocus onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Dom Leonello Restaurante" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Endereço</label>
                <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Rua, número, bairro, cidade" className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button variant="primary" onClick={createClientUnit} disabled={saving || !newName.trim()}>{saving ? "Criando..." : "Criar cliente"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
