"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AccessLink } from "@/components/admin/AccessLink";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { callAdmin, fetchAdminData, generatePassword, inputClass, isRecent, labelClass, timeAgo, type AdminExecution, type AdminTemplate, type AdminUnit, type AdminUser } from "@/lib/admin";

const emptyDraft = { company_name: "", location: "", full_name: "", email: "", password: "", checklist_ids: [] as string[] };

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
  const [draft, setDraft] = useState(emptyDraft);
  const [created, setCreated] = useState<(typeof emptyDraft & { unit_id: string }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [modalError, setModalError] = useState("");
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

  const refresh = () => {
    fetchAdminData().then((data) => {
      setUnits(data.units);
      setUsers(data.users);
      setTemplates(data.templates);
      setExecutions(data.executions);
    });
  };

  const createAccount = async () => {
    setSaving(true);
    setModalError("");
    const result = await callAdmin<{ unit_id: string }>({ action: "create_client", ...draft });
    setSaving(false);
    if (result.error || !result.data) {
      setModalError(result.error || "Não foi possível criar a conta.");
      return;
    }
    setCreating(false);
    setCopied(false);
    setCreated({ ...draft, unit_id: result.data.unit_id });
    refresh();
  };

  const copyAccess = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(`Olá, ${created.full_name}! Seu acesso ao Checkou:\n\nLink: ${window.location.origin}\nEmail: ${created.email}\nSenha: ${created.password}`);
    setCopied(true);
  };

  const toggleDraftChecklist = (id: string) => {
    setDraft({ ...draft, checklist_ids: draft.checklist_ids.includes(id) ? draft.checklist_ids.filter((c) => c !== id) : [...draft.checklist_ids, id] });
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
        <Button variant="primary" size="sm" onClick={() => { setDraft({ ...emptyDraft, password: generatePassword() }); setModalError(""); setCreating(true); }}>
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
        {kpis.map((kpi, index) => index === 0 ? (
          <div key={kpi.label} className="bg-ink text-white rounded-2xl p-6 shadow-card">
            <span className="w-11 h-11 rounded-xl bg-lime text-on-lime flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
            </span>
            <p className="font-display text-3xl font-extrabold tabular-nums">{kpi.value}</p>
            <p className="text-sm font-semibold text-slate-300">{kpi.label}</p>
          </div>
        ) : (
          <Card key={kpi.label}>
            <span className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center mb-3">
              <span className={`material-symbols-outlined text-[20px] ${kpi.tone}`}>{kpi.icon}</span>
            </span>
            <p className="font-display text-3xl font-extrabold text-navy tabular-nums">{kpi.value}</p>
            <p className="text-sm font-semibold text-on-surface-variant">{kpi.label}</p>
          </Card>
        ))}
      </div>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." className={`${inputClass} max-w-sm`} />

      {filtered.length === 0 ? (
        <Card><p className="text-center text-sm text-on-surface-variant py-10">Nenhum cliente encontrado.</p></Card>
      ) : (
        <div className="space-y-2.5">
          <div className="hidden md:grid grid-cols-[1.8fr_1fr_1fr_0.7fr_0.8fr_0.8fr_6.5rem] gap-3 px-5 text-xs font-bold text-on-surface-variant">
            <span>Cliente</span>
            <span>Último acesso</span>
            <span>Última execução</span>
            <span className="text-right">Usuários</span>
            <span className="text-right">Checklists</span>
            <span className="text-right">Score médio</span>
            <span />
          </div>
          <div className="space-y-2.5">
            {filtered.map((row) => {
              const status = situation(row.userCount, row.lastExecution);
              return (
                <div key={row.unit.id} className="relative grid grid-cols-2 md:grid-cols-[1.8fr_1fr_1fr_0.7fr_0.8fr_0.8fr_6.5rem] gap-3 px-5 py-3.5 items-center bg-surface-container-lowest rounded-2xl shadow-card hover:-translate-y-0.5 transition-transform">
                  <div className="col-span-2 md:col-span-1 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {row.unit.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/clientes/${row.unit.id}`} className="block font-bold text-sm text-navy truncate after:absolute after:inset-0">{row.unit.name}</Link>
                      <Badge variant={status.variant} className="mt-0.5">{status.label}</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-on-surface-variant"><span className="md:hidden text-xs text-outline">Acesso: </span>{timeAgo(row.lastAccess)}</span>
                  <span className="text-sm text-on-surface-variant"><span className="md:hidden text-xs text-outline">Execução: </span>{timeAgo(row.lastExecution)}</span>
                  <span className="md:text-right text-sm text-navy tabular-nums"><span className="md:hidden text-xs text-outline">Usuários: </span>{row.userCount}</span>
                  <span className="md:text-right text-sm text-navy tabular-nums"><span className="md:hidden text-xs text-outline">Checklists: </span>{row.checklistCount}</span>
                  <span className="md:text-right text-sm text-navy tabular-nums"><span className="md:hidden text-xs text-outline">Score: </span>{row.average === null ? "—" : `${row.average}%`}</span>
                  <AccessLink unitId={row.unit.id} unitName={row.unit.name} className="relative z-10 col-span-2 md:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-white px-4 py-2 text-xs font-bold" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-on-surface-variant">&quot;Último acesso&quot; é o login mais recente de qualquer usuário da empresa. &quot;Em uso&quot; significa pelo menos uma execução nos últimos 7 dias. Clique em uma linha para abrir o cliente.</p>

      {creating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setCreating(false)}>
          <div className="bg-surface-container-lowest rounded-3xl p-7 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-extrabold text-navy">Novo cliente</h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-5">Cria a empresa e o acesso do dono de uma vez.</p>
            {modalError && <p className="text-sm text-error font-medium mb-4">{modalError}</p>}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome da empresa *</label>
                <input type="text" value={draft.company_name} autoFocus onChange={(e) => setDraft({ ...draft, company_name: e.target.value })} placeholder="Ex: Dom Leonello Restaurante" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Endereço</label>
                <input type="text" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Rua, número, bairro, cidade" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nome do dono *</label>
                  <input type="text" value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email de acesso *</label>
                  <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Senha inicial *</label>
                <div className="flex gap-2">
                  <input type="text" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} className={inputClass} />
                  <Button variant="outline" onClick={() => setDraft({ ...draft, password: generatePassword() })}>Gerar</Button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Checklists desta empresa</label>
                <div className="flex flex-wrap gap-2">
                  {templates.filter((t) => t.status === "published").map((template) => {
                    const linked = draft.checklist_ids.includes(template.id);
                    return (
                      <button key={template.id} type="button" onClick={() => toggleDraftChecklist(template.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${linked ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined text-[14px]">{linked ? "check" : "add"}</span>
                        {template.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button variant="primary" onClick={createAccount} disabled={saving || !draft.company_name.trim() || !draft.full_name.trim() || !draft.email.trim() || draft.password.length < 6}>{saving ? "Criando..." : "Criar conta"}</Button>
            </div>
          </div>
        </div>
      )}

      {created && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-7 max-w-md w-full shadow-2xl">
            <span className="w-14 h-14 rounded-2xl bg-lime text-on-lime flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px]">check</span>
            </span>
            <h3 className="text-2xl font-extrabold text-navy">Conta criada</h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">Copie e envie para {created.full_name}. A senha não aparece de novo depois de fechar.</p>
            <div className="bg-ink text-white rounded-2xl p-4 text-sm space-y-1 mb-5 break-all">
              <p className="font-bold">{created.company_name}</p>
              <p>{created.email}</p>
              <p className="font-mono text-lime">{created.password}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2.5">
              <Button variant="outline" onClick={() => setCreated(null)}>Fechar</Button>
              <Button variant="outline" onClick={copyAccess}>
                <span className="material-symbols-outlined text-[16px]">{copied ? "check" : "content_copy"}</span>
                {copied ? "Copiado" : "Copiar acesso"}
              </Button>
              <AccessLink unitId={created.unit_id} unitName={created.company_name} label="Acessar a conta" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-6 py-3 text-sm font-bold" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
