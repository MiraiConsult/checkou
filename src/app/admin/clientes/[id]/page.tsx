"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UnitLocation } from "@/components/admin/UnitLocation";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { fetchAdminData, inputClass, labelClass, timeAgo, type AdminExecution, type AdminTemplate, type AdminUnit, type AdminUser } from "@/lib/admin";

const statusLabel: Record<string, { label: string; variant: "success" | "error" | "info" | "pending" }> = {
  completed: { label: "Aguardando aprovação", variant: "info" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em andamento", variant: "pending" },
};

function AccountForm({ unit, onSaved }: { unit: AdminUnit; onSaved: (unit: AdminUnit) => void }) {
  const [form, setForm] = useState({ name: unit.name, location: unit.location || "", manager_name: unit.manager_name || "", phone: unit.phone || "", email: unit.email || "" });
  const [status, setStatus] = useState("");

  const save = async () => {
    const { error } = await createClient().from("units").update(form).eq("id", unit.id);
    setStatus(error ? "Não foi possível salvar." : "Dados salvos");
    if (!error) onSaved({ ...unit, ...form });
  };

  const fields: [keyof typeof form, string][] = [["name", "Nome da empresa *"], ["location", "Endereço"], ["manager_name", "Responsável"], ["phone", "Telefone"], ["email", "Email"]];

  return (
    <Card>
      <h3 className="text-sm font-bold text-navy mb-4">Dados da empresa</h3>
      <div className="space-y-4">
        {fields.map(([field, label]) => (
          <div key={field}>
            <label className={labelClass}>{label}</label>
            <input type="text" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={inputClass} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3 mt-5">
        {status && <span className="text-xs text-on-surface-variant">{status}</span>}
        <Button variant="primary" onClick={save} disabled={!form.name.trim()}>Salvar</Button>
      </div>
    </Card>
  );
}

export default function AdminClientDetailPage() {
  const unitId = useParams().id as string;
  const router = useRouter();
  const { user } = useAuth();
  const staff = isStaff(user);
  const [unit, setUnit] = useState<AdminUnit | null>(null);
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [executions, setExecutions] = useState<AdminExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(staff ? "conta" : "usuarios");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const apply = useCallback((data: Awaited<ReturnType<typeof fetchAdminData>>) => {
    setError(data.error || "");
    setUnit(data.units.find((u) => u.id === unitId) || null);
    setUnits(data.units);
    setUsers(data.users);
    setTemplates(data.templates);
    setExecutions(data.executions.filter((e) => e.unit_id === unitId));
    setLoading(false);
  }, [unitId]);

  const load = useCallback(() => { fetchAdminData().then(apply); }, [apply]);

  useEffect(() => {
    if (!user) return;
    if (user.unit_id && user.unit_id !== unitId) {
      router.replace(`/admin/clientes/${user.unit_id}`);
      return;
    }
    fetchAdminData().then(apply);
  }, [user, unitId, router, apply]);

  const toggleTemplate = async (template: AdminTemplate) => {
    const unitIds = template.unit_ids.includes(unitId) ? template.unit_ids.filter((id) => id !== unitId) : [...template.unit_ids, unitId];
    const { error: updateError } = await createClient().from("checklist_templates").update({ unit_ids: unitIds }).eq("id", template.id);
    if (updateError) setError("Não foi possível vincular o checklist.");
    else setTemplates(templates.map((t) => t.id === template.id ? { ...t, unit_ids: unitIds } : t));
  };

  const deleteUnit = async () => {
    const { error: deleteError } = await createClient().from("units").delete().eq("id", unitId);
    if (deleteError) {
      setError("Esta empresa tem usuários ou checklists executados, por isso não pode ser excluída.");
      setConfirmDelete(false);
      return;
    }
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!unit) return <p className="text-sm text-on-surface-variant">Cliente não encontrado.</p>;

  const members = users.filter((u) => u.unit_id === unitId);
  const linked = templates.filter((t) => t.unit_ids.includes(unitId));
  const tabs = staff
    ? [
        { id: "conta", label: "Conta" },
        { id: "usuarios", label: `Usuários (${members.length})` },
        { id: "checklists", label: `Checklists (${linked.length})` },
        { id: "execucoes", label: `Execuções (${executions.length})` },
      ]
    : [{ id: "usuarios", label: `Usuários (${members.length})` }];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {staff && (
          <Link href="/admin" aria-label="Voltar" className="p-2.5 rounded-xl hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
          </Link>
        )}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
          {unit.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-navy truncate">{unit.name}</h2>
          {unit.location && <p className="text-sm text-on-surface-variant truncate">{unit.location}</p>}
        </div>
      </div>

      {error && (
        <div className="py-3 px-4 bg-error/10 text-error rounded-xl flex items-center gap-2 font-semibold text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-outline-variant/10 overflow-x-auto">
        {tabs.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={cn("px-4 py-3 text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px", activeTab === item.id ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-on-surface")}>
            {item.label}
          </button>
        ))}
      </div>

      {activeTab === "conta" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AccountForm unit={unit} onSaved={setUnit} />
          <div className="space-y-6">
            <UnitLocation unit={unit} />
            <Card>
              <h3 className="text-sm font-bold text-navy mb-1">Excluir empresa</h3>
              <p className="text-xs text-on-surface-variant mb-4">Só é possível excluir uma empresa sem usuários e sem execuções.</p>
              {confirmDelete ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                  <Button variant="danger" onClick={deleteUnit}>Confirmar exclusão</Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setConfirmDelete(true)}>Excluir empresa</Button>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === "usuarios" && <UsersPanel unitId={unitId} users={users} units={units} templates={templates} onChange={load} />}

      {activeTab === "checklists" && (
        <Card>
          <p className="text-sm text-on-surface-variant mb-4">Marque os checklists que esta empresa recebe.</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => {
              const isLinked = template.unit_ids.includes(unitId);
              return (
                <button key={template.id} onClick={() => toggleTemplate(template)} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer", isLinked ? "bg-primary text-white border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40")}>
                  <span className="material-symbols-outlined text-[16px]">{isLinked ? "check" : "add"}</span>
                  {template.name}
                  {template.status === "draft" && <span className="opacity-70">(rascunho)</span>}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {activeTab === "execucoes" && (
        executions.length === 0 ? (
          <Card className="text-center py-12"><p className="text-sm text-on-surface-variant">Nenhuma execução ainda</p></Card>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 divide-y divide-outline-variant/10">
            {executions.map((execution) => {
              const status = statusLabel[execution.status] || statusLabel.completed;
              return (
                <Link key={execution.id} href={`/historico/${execution.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container-low transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{templates.find((t) => t.id === execution.template_id)?.name || "Checklist"}</p>
                    <p className="text-xs text-on-surface-variant truncate">{members.find((u) => u.id === execution.operator_id)?.full_name || "—"} · {timeAgo(execution.completed_at || execution.started_at)}</p>
                  </div>
                  <span className="text-sm font-bold text-navy tabular-nums">{Math.round(Number(execution.score))}%</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                </Link>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
