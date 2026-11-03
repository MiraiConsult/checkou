"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { AccessMessage } from "@/components/admin/AccessMessage";
import { callAdmin, generatePassword, inputClass, labelClass, roleLabels, sectorLabels, timeAgo, type AdminTemplate, type AdminUnit, type AdminUser } from "@/lib/admin";

const emptyForm = { full_name: "", email: "", password: "", role: "operator", sector: "geral", unit_id: "", checklist_ids: [] as string[] };

interface UsersPanelProps {
  // null: equipe Checkou
  unitId: string | null;
  users: AdminUser[];
  units: AdminUnit[];
  templates: AdminTemplate[];
  onChange: () => void;
}

export function UsersPanel({ unitId, users, units, templates, onChange }: UsersPanelProps) {
  const { user } = useAuth();
  const staff = isStaff(user);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState<{ name: string; email: string; token: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const members = users.filter((u) => u.unit_id === unitId);
  const filtered = members.filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
  const formUnit = form.unit_id === "equipe" ? null : form.unit_id;
  const unitTemplates = templates.filter((t) => t.status === "published" && formUnit && t.unit_ids.includes(formUnit));

  const openNew = () => {
    setForm({ ...emptyForm, unit_id: unitId || "equipe" });
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
    const payload = { full_name: form.full_name, email: form.email, role: form.role, sector: form.sector, unit_id: formUnit, checklist_ids: form.checklist_ids };
    const result = isNew
      ? await callAdmin<{ invite_token: string | null }>({ action: "create", ...payload })
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
    const token = isNew ? (result.data as { invite_token?: string | null } | undefined)?.invite_token : null;
    if (token) setInvite({ name: form.full_name, email: form.email, token });
    else if (isNew) setError("Usuário criado, mas o link de acesso falhou. Use Gerar link na linha dele.");
    setSaving(false);
    setEditing(null);
    onChange();
  };

  const toggleActive = async (target: AdminUser) => {
    setError("");
    const result = await callAdmin({ action: "set_active", user_id: target.id, active: !target.active });
    if (result.error) setError(result.error);
    else onChange();
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setError("");
    const result = await callAdmin({ action: "delete", user_id: deleteTarget.id });
    if (result.error) setError(result.error);
    else onChange();
    setDeleteTarget(null);
  };

  const toggleChecklist = (id: string) => {
    setForm({ ...form, checklist_ids: form.checklist_ids.includes(id) ? form.checklist_ids.filter((c) => c !== id) : [...form.checklist_ids, id] });
  };

  const sendInvite = async (target: AdminUser) => {
    setError("");
    const result = await callAdmin<{ invite_token: string }>({ action: "invite", user_id: target.id });
    if (result.error || !result.data) setError(result.error || "Não foi possível gerar o link.");
    else setInvite({ name: target.full_name, email: target.email, token: result.data.invite_token });
  };

  const companyName = unitId ? units.find((u) => u.id === unitId)?.name || "sua empresa" : "Checkou";

  return (
    <div className="space-y-4">
      {error && !editing && <p className="text-sm text-error font-medium">{error}</p>}

      <div className="flex flex-col md:flex-row gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou email" className={cn(inputClass, "flex-1")} />
        <Button variant="primary" onClick={openNew}>
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
                <p className="text-[11px] text-outline">{sectorLabels[u.sector] || u.sector} · último acesso: {timeAgo(u.last_sign_in_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!u.active && <Badge variant="error">Desativado</Badge>}
              <Badge variant={u.role === "operator" ? "pending" : "info"}>{roleLabels[u.role] || u.role}</Badge>
              <button onClick={() => sendInvite(u)} aria-label="Gerar link de acesso" title="Gerar link de acesso" className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">link</span>
              </button>
              <button onClick={() => openEdit(u)} aria-label="Editar" className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
              </button>
              {u.id !== user?.id && (
                <>
                  <button onClick={() => toggleActive(u)} aria-label={u.active ? "Desativar" : "Reativar"} title={u.active ? "Desativar" : "Reativar"} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{u.active ? "block" : "check_circle"}</span>
                  </button>
                  <button onClick={() => setDeleteTarget(u)} aria-label="Excluir" className="p-2 hover:bg-error/5 rounded-lg transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-outline hover:text-error text-[18px]">delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy mb-5">{editing === "new" ? "Criar Usuário" : "Editar Usuário"}</h3>
            {error && <p className="text-sm text-error font-medium mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff && editing !== "new" && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Empresa</label>
                  <select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value, checklist_ids: [] })} className={inputClass}>
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
                  {((user?.role === "master" && staff) || form.role === "master") && <option value="master">Master</option>}
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
                        <button key={template.id} type="button" onClick={() => toggleChecklist(template.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer", linked ? "bg-primary text-white border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40")}>
                          <span className="material-symbols-outlined text-[14px]">{linked ? "check" : "add"}</span>
                          {template.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">Sem nenhum marcado, a pessoa vê todos os checklists da empresa.</p>
                </div>
              )}
              {editing === "new" ? (
                <p className="md:col-span-2 text-xs text-on-surface-variant">Ao salvar, sai uma mensagem pronta com o link para a pessoa criar a própria senha.</p>
              ) : (
                <div className="md:col-span-2">
                  <label className={labelClass}>Nova senha (opcional)</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Deixe vazio para não mudar" className={inputClass} />
                    <Button variant="outline" onClick={() => setForm({ ...form, password: generatePassword() })}>Gerar</Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button variant="primary" onClick={save} disabled={saving || !form.full_name.trim() || !form.email.trim()}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {invite && (
        <AccessMessage title="Acesso pronto" name={invite.name} company={companyName} email={invite.email} token={invite.token} onClose={() => setInvite(null)} />
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
