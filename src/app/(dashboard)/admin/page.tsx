"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth, isStaff, canManageUsers } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  sector: string;
  unit_id: string | null;
  active: boolean;
  checklist_ids: string[];
  created_at: string;
  last_sign_in_at: string | null;
}

interface Unit {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_m?: number;
}

interface Template {
  id: string;
  name: string;
  status: string;
  unit_ids: string[];
}

const roleLabels: Record<string, string> = { master: "Master", admin: "Administrador", operator: "Operador" };
const sectorLabels: Record<string, string> = { geral: "Geral (todos)", gerencia: "Gerência", cozinha: "Cozinha", salao: "Salão", bar: "Bar" };
const emptyForm = { full_name: "", email: "", password: "", role: "operator", sector: "geral", unit_id: "", checklist_ids: [] as string[] };

const tabs = [
  { id: "usuarios", label: "Usuários", icon: "group" },
  { id: "empresas", label: "Empresas", icon: "storefront" },
];

async function callAdmin<T = { ok: boolean }>(body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const { data, error } = await createClient().functions.invoke("admin-users", { body });
  if (error) {
    const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
    return { error: detail?.error || "Não foi possível concluir. Tente de novo." };
  }
  return { data };
}

async function fetchAdminData() {
  const supabase = createClient();
  const [usersRes, unitsRes, templatesRes] = await Promise.all([
    callAdmin<{ users: AdminUser[] }>({ action: "list" }),
    supabase.from("units").select("*").order("name"),
    supabase.from("checklist_templates").select("id, name, status, unit_ids").order("name"),
  ]);
  return { usersRes, unitsRes, templatesRes };
}

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const random = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(random, (n) => chars[n % chars.length]).join("");
}

function UnitLocation({ unit, inputClass }: { unit: Unit; inputClass: string }) {
  const [coords, setCoords] = useState(unit.latitude != null ? `${unit.latitude}, ${unit.longitude}` : "");
  const [radius, setRadius] = useState(unit.radius_m ?? 200);
  const [status, setStatus] = useState("");

  const useCurrent = () => {
    setStatus("");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      () => setStatus("Não foi possível obter a localização. Verifique a permissão do navegador."),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const save = async () => {
    const match = coords.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
    const latitude = match ? Number(match[1]) : null;
    const longitude = match ? Number(match[2]) : null;
    if (coords.trim() && (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) {
      setStatus("Use o formato -29.123456, -51.123456");
      return;
    }
    const { error } = await createClient().from("units").update({ latitude, longitude, radius_m: radius || 200 }).eq("id", unit.id);
    setStatus(error ? "Não foi possível salvar a localização." : "Localização salva");
  };

  return (
    <div className="mt-5">
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Localização da empresa</p>
      <div className="flex flex-col md:flex-row gap-2">
        <input type="text" value={coords} onChange={(e) => setCoords(e.target.value)} placeholder="Coordenadas: -29.123456, -51.123456" className={cn(inputClass, "flex-1")} />
        <input type="number" min={20} value={radius} onChange={(e) => setRadius(parseInt(e.target.value) || 0)} aria-label="Raio em metros" className={cn(inputClass, "md:w-28")} />
        <Button variant="outline" onClick={useCurrent}>Usar a minha</Button>
        <Button variant="primary" onClick={save}>Salvar</Button>
      </div>
      <p className="text-xs text-on-surface-variant mt-2">{status || "Raio em metros: dentro dele, o relatório marca \"No local\". No Google Maps, clique com o botão direito no restaurante para copiar as coordenadas."}</p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("usuarios");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("todas");
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [credentials, setCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const staff = isStaff(user);
  const manager = canManageUsers(user);

  useEffect(() => {
    if (user && !manager) router.push("/");
  }, [user, manager, router]);

  const load = useCallback(() => {
    fetchAdminData().then(({ usersRes, unitsRes, templatesRes }) => {
      if (usersRes.error) setError(usersRes.error);
      setUsers(usersRes.data?.users || []);
      setUnits(unitsRes.data || []);
      setTemplates(templatesRes.data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!manager) return;
    fetchAdminData().then(({ usersRes, unitsRes, templatesRes }) => {
      if (usersRes.error) setError(usersRes.error);
      setUsers(usersRes.data?.users || []);
      setUnits(unitsRes.data || []);
      setTemplates(templatesRes.data || []);
      setLoading(false);
    });
  }, [manager]);

  const unitName = (id: string | null) => id ? units.find((u) => u.id === id)?.name || "Empresa" : "Equipe Checkou";

  const openNew = (unitId = user?.unit_id || (unitFilter !== "todas" ? unitFilter : "")) => {
    setForm({ ...emptyForm, password: generatePassword(), unit_id: unitId });
    setError("");
    setEditing("new");
  };

  const openEdit = (target: AdminUser) => {
    setForm({ full_name: target.full_name, email: target.email, password: "", role: target.role, sector: target.sector, unit_id: target.unit_id || "equipe", checklist_ids: target.checklist_ids || [] });
    setError("");
    setEditing(target);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const isNew = editing === "new";
    const payload = { full_name: form.full_name, email: form.email, role: form.role, sector: form.sector, unit_id: form.unit_id === "equipe" ? null : form.unit_id, checklist_ids: form.checklist_ids };
    const result = isNew
      ? await callAdmin({ action: "create", ...payload, password: form.password })
      : await callAdmin({ action: "update", user_id: (editing as AdminUser).id, ...payload });
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    if (!isNew && form.password) {
      const passwordResult = await callAdmin({ action: "set_password", user_id: (editing as AdminUser).id, password: form.password });
      if (passwordResult.error) {
        setError(passwordResult.error);
        setSaving(false);
        return;
      }
    }
    if (form.password) {
      setCopied(false);
      setCredentials({ name: form.full_name, email: form.email, password: form.password });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const toggleActive = async (target: AdminUser) => {
    setError("");
    const result = await callAdmin({ action: "set_active", user_id: target.id, active: !target.active });
    if (result.error) setError(result.error);
    else setUsers(users.map((u) => u.id === target.id ? { ...u, active: !u.active } : u));
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setError("");
    const result = await callAdmin({ action: "delete", user_id: deleteTarget.id });
    if (result.error) setError(result.error);
    else setUsers(users.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleTemplate = async (template: Template, unitId: string) => {
    const unitIds = template.unit_ids.includes(unitId)
      ? template.unit_ids.filter((id) => id !== unitId)
      : [...template.unit_ids, unitId];
    const { error: updateError } = await createClient().from("checklist_templates").update({ unit_ids: unitIds }).eq("id", template.id);
    if (updateError) setError("Não foi possível vincular o checklist.");
    else setTemplates(templates.map((t) => t.id === template.id ? { ...t, unit_ids: unitIds } : t));
  };

  const copyCredentials = async () => {
    if (!credentials) return;
    await navigator.clipboard.writeText(`Olá, ${credentials.name}! Seu acesso ao Checkou:\n\nLink: ${window.location.origin}\nEmail: ${credentials.email}\nSenha: ${credentials.password}`);
    setCopied(true);
  };

  const inputClass = "w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";
  const labelClass = "block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5";

  const filtered = users.filter((u) => {
    const matchesSearch = `${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesUnit = unitFilter === "todas" || (unitFilter === "equipe" ? !u.unit_id : u.unit_id === unitFilter);
    return matchesSearch && matchesUnit;
  });

  const userActions = (target: AdminUser) => (
    <>
      <button onClick={() => openEdit(target)} aria-label="Editar" className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
      </button>
      {target.id !== user?.id && (
        <>
          <button onClick={() => toggleActive(target)} aria-label={target.active ? "Desativar" : "Reativar"} title={target.active ? "Desativar" : "Reativar"} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{target.active ? "block" : "check_circle"}</span>
          </button>
          <button onClick={() => setDeleteTarget(target)} aria-label="Excluir" className="p-2 hover:bg-error/5 rounded-lg transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-outline hover:text-error text-[18px]">delete</span>
          </button>
        </>
      )}
    </>
  );

  const unitTemplates = templates.filter((t) => t.status === "published" && t.unit_ids.includes(form.unit_id));

  const toggleFormChecklist = (id: string) => {
    setForm({ ...form, checklist_ids: form.checklist_ids.includes(id) ? form.checklist_ids.filter((c) => c !== id) : [...form.checklist_ids, id] });
  };

  if (loading || !manager) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Administração</p>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Admin</h2>
        <p className="text-sm text-on-surface-variant mt-1">{staff ? "Crie os acessos dos clientes e defina o que cada empresa recebe" : "Crie os acessos da sua equipe e defina os checklists de cada pessoa"}</p>
      </div>

      {error && (
        <div className="py-3 px-4 bg-error/10 text-error rounded-xl flex items-center gap-2 font-semibold text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {staff && <div className="flex gap-2 border-b border-outline-variant/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-px",
              activeTab === tab.id ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>}

      {activeTab === "usuarios" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou email" className={cn(inputClass, "flex-1")} />
            {staff && (
              <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className={cn(inputClass, "md:w-56")}>
                <option value="todas">Todas as empresas</option>
                <option value="equipe">Equipe Checkou</option>
                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </select>
            )}
            <Button variant="primary" onClick={() => openNew()}>
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Criar Usuário
            </Button>
          </div>

          {filtered.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-sm text-on-surface-variant">Nenhum usuário encontrado</p>
            </Card>
          ) : filtered.map((u) => (
            <Card key={u.id} className={cn(!u.active && "opacity-60")}>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy truncate">{u.full_name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                    <p className="text-[11px] text-outline">
                      {unitName(u.unit_id)} · {sectorLabels[u.sector] || u.sector} · {u.last_sign_in_at ? `último acesso ${new Date(u.last_sign_in_at).toLocaleDateString("pt-BR")}` : "nunca acessou"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!u.active && <Badge variant="error">Desativado</Badge>}
                  <Badge variant={u.role === "operator" ? "pending" : "info"}>{roleLabels[u.role] || u.role}</Badge>
                  {userActions(u)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "empresas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              <span className="font-bold text-navy">{units.length}</span> {units.length === 1 ? "empresa" : "empresas"}
            </p>
            <Link href="/configuracoes">
              <Button variant="outline">
                <span className="material-symbols-outlined text-[18px]">add_business</span>
                Cadastrar Empresa
              </Button>
            </Link>
          </div>
          {units.map((unit) => {
            const members = users.filter((u) => u.unit_id === unit.id);
            return (
              <Card key={unit.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-navy">{unit.name}</h3>
                  <span className="text-xs text-on-surface-variant">{members.length} {members.length === 1 ? "usuário" : "usuários"}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Usuários desta empresa</p>
                  <button onClick={() => openNew(unit.id)} className="flex items-center gap-1 text-xs font-bold text-primary cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Adicionar
                  </button>
                </div>
                {members.length === 0 ? (
                  <p className="text-sm text-on-surface-variant mb-5">Nenhum usuário ainda</p>
                ) : (
                  <div className="divide-y divide-outline-variant/10 mb-5">
                    {members.map((u) => (
                      <div key={u.id} className={cn("flex items-center gap-2 py-2", !u.active && "opacity-60")}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-navy truncate">{u.full_name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                        </div>
                        {!u.active && <Badge variant="error">Desativado</Badge>}
                        <Badge variant={u.role === "operator" ? "pending" : "info"}>{roleLabels[u.role] || u.role}</Badge>
                        {userActions(u)}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Checklists desta empresa</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template) => {
                    const linked = template.unit_ids.includes(unit.id);
                    return (
                      <button key={template.id} onClick={() => toggleTemplate(template, unit.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer", linked ? "bg-primary text-white border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40")}>
                        <span className="material-symbols-outlined text-[14px]">{linked ? "check" : "add"}</span>
                        {template.name}
                        {template.status === "draft" && <span className="opacity-70">(rascunho)</span>}
                      </button>
                    );
                  })}
                </div>
                <UnitLocation unit={unit} inputClass={inputClass} />
              </Card>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy mb-5">{editing === "new" ? "Criar Usuário" : "Editar Usuário"}</h3>
            {error && <p className="text-sm text-error font-medium mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Empresa *</label>
                  <select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value, checklist_ids: [] })} className={inputClass}>
                    <option value="" disabled>Selecione a empresa</option>
                    {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                    <option value="equipe">Equipe Checkou (vê todas as empresas)</option>
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Nome Completo *</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Função</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
                  <option value="operator">Operador</option>
                  <option value="admin">Administrador</option>
                  {(user?.role === "master" || form.role === "master") && <option value="master">Master</option>}
                </select>
              </div>
              <div>
                <label className={labelClass}>Setor</label>
                <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className={inputClass}>
                  {Object.entries(sectorLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              {form.role === "operator" && unitTemplates.length > 0 && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Checklists desta pessoa</label>
                  <div className="flex flex-wrap gap-2">
                    {unitTemplates.map((template) => {
                      const linked = form.checklist_ids.includes(template.id);
                      return (
                        <button key={template.id} type="button" onClick={() => toggleFormChecklist(template.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer", linked ? "bg-primary text-white border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40")}>
                          <span className="material-symbols-outlined text-[14px]">{linked ? "check" : "add"}</span>
                          {template.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">Sem nenhum marcado, a pessoa vê todos os checklists da empresa.</p>
                </div>
              )}
              <div className="md:col-span-2">
                <label className={labelClass}>{editing === "new" ? "Senha *" : "Nova senha (opcional)"}</label>
                <div className="flex gap-2">
                  <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" className={inputClass} />
                  <Button variant="outline" onClick={() => setForm({ ...form, password: generatePassword() })}>Gerar</Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button variant="primary" onClick={save} disabled={saving || !form.unit_id || !form.full_name.trim() || !form.email.trim() || (editing === "new" && form.password.length < 6)}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {credentials && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-navy mb-2">Acesso pronto</h3>
            <p className="text-sm text-on-surface-variant mb-4">Copie e envie para {credentials.name}. A senha não aparece de novo depois de fechar.</p>
            <div className="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface space-y-1 mb-4 break-all">
              <p>{credentials.email}</p>
              <p className="font-mono">{credentials.password}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCredentials(null)}>Fechar</Button>
              <Button variant="primary" className="flex-1" onClick={copyCredentials}>
                <span className="material-symbols-outlined text-[16px]">{copied ? "check" : "content_copy"}</span>
                {copied ? "Copiado" : "Copiar acesso"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy text-center mb-2">Excluir {deleteTarget.full_name}?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6">Esta ação não pode ser desfeita. Usuários com histórico só podem ser desativados.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={deleteUser}>Excluir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
