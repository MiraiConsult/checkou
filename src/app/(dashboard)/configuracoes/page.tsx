"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

interface Organization {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Unit {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  cuisine_type: string;
  operating_hours: string;
  manager_name: string;
  capacity: number;
}

const tabs = [
  { id: "empresa", label: "Empresa", icon: "domain" },
  { id: "unidades", label: "Unidades / Restaurantes", icon: "storefront" },
  { id: "usuarios", label: "Usuários", icon: "group" },
  { id: "historico", label: "Histórico de Edições", icon: "history" },
];

interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  description: string;
  created_at: string;
}

const actionIcon: Record<string, string> = {
  execution_completed: "play_circle",
  execution_approved: "check_circle",
  execution_rejected: "cancel",
  template_created: "add_circle",
  template_published: "publish",
  user_created: "person_add",
};

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("empresa");
  const [org, setOrg] = useState<Organization | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: "", full_name: "", password: "", role: "operator", sector: "geral" });
  const [newUnit, setNewUnit] = useState({ name: "", location: "", phone: "", email: "", cuisine_type: "", operating_hours: "", manager_name: "", capacity: 0 });
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (activeTab !== "historico" || !user?.organization_id) return;
    const supabase = createClient();
    supabase.from("activity_logs").select("id, user_name, action, description, created_at")
      .order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setLogs(data || []));
  }, [activeTab, user?.organization_id]);

  useEffect(() => {
    if (!user?.organization_id) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("organizations").select("*").eq("id", user.organization_id).single(),
      supabase.from("units").select("*").eq("organization_id", user.organization_id).order("created_at"),
      supabase.from("profiles").select("id, full_name, email, role, created_at").eq("organization_id", user.organization_id).order("created_at"),
    ]).then(([orgRes, unitsRes, usersRes]) => {
      setOrg(orgRes.data);
      setUnits(unitsRes.data || []);
      setUsers(usersRes.data || []);
      setLoading(false);
    });
  }, [user?.organization_id]);

  const saveOrg = async () => {
    if (!org) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("organizations").update({
      name: org.name, phone: org.phone, email: org.email, address: org.address,
    }).eq("id", org.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveUnit = async (unit: Unit) => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("units").update({
      name: unit.name, location: unit.location, phone: unit.phone, email: unit.email,
      cuisine_type: unit.cuisine_type, operating_hours: unit.operating_hours,
      manager_name: unit.manager_name, capacity: unit.capacity,
    }).eq("id", unit.id);
    setSaving(false);
    setEditingUnit(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addUnit = async () => {
    if (!newUnit.name.trim() || !user?.organization_id) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("units").insert({
      ...newUnit, organization_id: user.organization_id,
    }).select().single();
    if (data) setUnits([...units, data]);
    setNewUnit({ name: "", location: "", phone: "", email: "", cuisine_type: "", operating_hours: "", manager_name: "", capacity: 0 });
    setShowNewUnit(false);
    setSaving(false);
  };

  const deleteUnit = async (id: string) => {
    const supabase = createClient();
    await supabase.from("units").delete().eq("id", id);
    setUnits(units.filter((u) => u.id !== id));
  };

  const updateUnit = (id: string, field: string, value: string | number) => {
    setUnits(units.map((u) => u.id === id ? { ...u, [field]: value } : u));
  };

  const inputClass = "w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Configurações</p>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Configurações do Sistema</h2>
        <p className="text-sm text-on-surface-variant mt-1">Gerencie os dados da sua empresa e unidades</p>
      </div>

      {/* Success feedback */}
      {saved && (
        <div className="py-3 bg-tertiary-fixed/20 text-tertiary rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
          <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
          Salvo com sucesso!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-px",
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* EMPRESA TAB */}
      {activeTab === "empresa" && org && (
        <Card>
          <h3 className="text-lg font-bold text-navy mb-6">Dados da Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Nome da Empresa *</label>
              <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} placeholder="Nome da empresa" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Endereço</label>
              <input type="text" value={org.address} onChange={(e) => setOrg({ ...org, address: e.target.value })} placeholder="Rua, número, bairro, cidade - UF" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Telefone</label>
              <input type="text" value={org.phone} onChange={(e) => setOrg({ ...org, phone: e.target.value })} placeholder="(00) 00000-0000" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} placeholder="contato@empresa.com" className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="primary" onClick={saveOrg} disabled={saving}>
              <span className="material-symbols-outlined text-[18px]">save</span>
              {saving ? "Salvando..." : "Salvar Empresa"}
            </Button>
          </div>
        </Card>
      )}

      {/* UNIDADES TAB */}
      {activeTab === "unidades" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              <span className="font-bold text-navy">{units.length}</span> {units.length === 1 ? "unidade cadastrada" : "unidades cadastradas"}
            </p>
            <Button variant="primary" onClick={() => setShowNewUnit(true)}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nova Unidade
            </Button>
          </div>

          {/* New unit form */}
          {showNewUnit && (
            <Card className="border-2 border-primary/20">
              <h3 className="text-lg font-bold text-navy mb-5">
                <span className="material-symbols-outlined text-primary text-[20px] align-middle mr-2">add_business</span>
                Cadastrar Nova Unidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Nome da Unidade *</label>
                  <input type="text" value={newUnit.name} onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })} placeholder="Ex: Restaurante Centro" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Endereço</label>
                  <input type="text" value={newUnit.location} onChange={(e) => setNewUnit({ ...newUnit, location: e.target.value })} placeholder="Rua, número, bairro, cidade" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Tipo de Cozinha</label>
                  <input type="text" value={newUnit.cuisine_type} onChange={(e) => setNewUnit({ ...newUnit, cuisine_type: e.target.value })} placeholder="Ex: Italiana, Japonesa, Brasileira" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Horário de Funcionamento</label>
                  <input type="text" value={newUnit.operating_hours} onChange={(e) => setNewUnit({ ...newUnit, operating_hours: e.target.value })} placeholder="Ex: Seg-Sex 11h-23h" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Gerente Responsável</label>
                  <input type="text" value={newUnit.manager_name} onChange={(e) => setNewUnit({ ...newUnit, manager_name: e.target.value })} placeholder="Nome do gerente" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Capacidade (lugares)</label>
                  <input type="number" value={newUnit.capacity || ""} onChange={(e) => setNewUnit({ ...newUnit, capacity: parseInt(e.target.value) || 0 })} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Telefone</label>
                  <input type="text" value={newUnit.phone} onChange={(e) => setNewUnit({ ...newUnit, phone: e.target.value })} placeholder="(00) 00000-0000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" value={newUnit.email} onChange={(e) => setNewUnit({ ...newUnit, email: e.target.value })} placeholder="unidade@empresa.com" className={inputClass} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowNewUnit(false)}>Cancelar</Button>
                <Button variant="primary" onClick={addUnit} disabled={saving || !newUnit.name.trim()}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {saving ? "Salvando..." : "Cadastrar Unidade"}
                </Button>
              </div>
            </Card>
          )}

          {/* Units list */}
          {units.length === 0 && !showNewUnit ? (
            <Card className="text-center py-16">
              <span className="material-symbols-outlined text-outline text-[56px] mb-4">storefront</span>
              <h3 className="text-lg font-bold text-navy mb-2">Nenhuma unidade cadastrada</h3>
              <p className="text-sm text-on-surface-variant mb-6">Cadastre seus restaurantes e unidades para começar a usar o sistema</p>
              <Button variant="primary" onClick={() => setShowNewUnit(true)}>
                <span className="material-symbols-outlined text-[18px]">add</span>
                Cadastrar Primeira Unidade
              </Button>
            </Card>
          ) : (
            units.map((unit) => {
              const isEditing = editingUnit === unit.id;
              return (
                <Card key={unit.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[24px]">storefront</span>
                      </div>
                      <div>
                        {isEditing ? (
                          <input type="text" value={unit.name} onChange={(e) => updateUnit(unit.id, "name", e.target.value)} className="text-base font-bold text-navy bg-transparent border-b border-primary/30 outline-none pb-0.5" />
                        ) : (
                          <h3 className="text-base font-bold text-navy">{unit.name}</h3>
                        )}
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {unit.location || "Endereço não informado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setEditingUnit(null)}>Cancelar</Button>
                          <Button variant="primary" size="sm" onClick={() => saveUnit(unit)} disabled={saving}>
                            {saving ? "..." : "Salvar"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingUnit(unit.id)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
                          </button>
                          <button onClick={() => deleteUnit(unit.id)} className="p-2 hover:bg-error/5 rounded-lg transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-outline hover:text-error text-[18px]">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-outline-variant/10">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Endereço</label>
                        <input type="text" value={unit.location} onChange={(e) => updateUnit(unit.id, "location", e.target.value)} placeholder="Endereço completo" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Tipo de Cozinha</label>
                        <input type="text" value={unit.cuisine_type} onChange={(e) => updateUnit(unit.id, "cuisine_type", e.target.value)} placeholder="Ex: Italiana" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Horário</label>
                        <input type="text" value={unit.operating_hours} onChange={(e) => updateUnit(unit.id, "operating_hours", e.target.value)} placeholder="Seg-Sex 11h-23h" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Gerente</label>
                        <input type="text" value={unit.manager_name} onChange={(e) => updateUnit(unit.id, "manager_name", e.target.value)} placeholder="Nome do gerente" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Telefone</label>
                        <input type="text" value={unit.phone} onChange={(e) => updateUnit(unit.id, "phone", e.target.value)} placeholder="(00) 00000-0000" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Capacidade</label>
                        <input type="number" value={unit.capacity || ""} onChange={(e) => updateUnit(unit.id, "capacity", parseInt(e.target.value) || 0)} placeholder="0" className={inputClass} />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-outline-variant/10">
                      {unit.cuisine_type && (
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Cozinha</p>
                          <p className="text-sm text-on-surface mt-0.5">{unit.cuisine_type}</p>
                        </div>
                      )}
                      {unit.operating_hours && (
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Horário</p>
                          <p className="text-sm text-on-surface mt-0.5">{unit.operating_hours}</p>
                        </div>
                      )}
                      {unit.manager_name && (
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Gerente</p>
                          <p className="text-sm text-on-surface mt-0.5">{unit.manager_name}</p>
                        </div>
                      )}
                      {unit.capacity > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Capacidade</p>
                          <p className="text-sm text-on-surface mt-0.5">{unit.capacity} lugares</p>
                        </div>
                      )}
                      {!unit.cuisine_type && !unit.operating_hours && !unit.manager_name && unit.capacity === 0 && (
                        <p className="text-xs text-outline italic col-span-4">Clique em editar para adicionar mais informações</p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* USUARIOS TAB */}
      {activeTab === "usuarios" && (
        <div className="space-y-6">
          {user?.role !== "admin" && user?.role !== "master" ? (
            <Card className="text-center py-16">
              <span className="material-symbols-outlined text-outline text-[56px] mb-4">lock</span>
              <h3 className="text-lg font-bold text-navy mb-2">Acesso restrito</h3>
              <p className="text-sm text-on-surface-variant">Somente administradores podem gerenciar usuários</p>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                  <span className="font-bold text-navy">{users.length}</span> {users.length === 1 ? "usuário" : "usuários"}
                </p>
                <Button variant="primary" onClick={() => setShowNewUser(true)}>
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Criar Usuário
                </Button>
              </div>

              {showNewUser && (
                <Card className="border-2 border-primary/20">
                  <h3 className="text-lg font-bold text-navy mb-5">
                    <span className="material-symbols-outlined text-primary text-[20px] align-middle mr-2">person_add</span>
                    Criar Novo Usuário
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Nome Completo *</label>
                      <input type="text" value={newUserData.full_name} onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })} placeholder="Nome do colaborador" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Email *</label>
                      <input type="email" value={newUserData.email} onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })} placeholder="email@empresa.com" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Senha *</label>
                      <input type="text" value={newUserData.password} onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })} placeholder="Mínimo 6 caracteres" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Função</label>
                      <select value={newUserData.role} onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })} className={inputClass}>
                        <option value="operator">Operador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Setor</label>
                      <select value={newUserData.sector} onChange={(e) => setNewUserData({ ...newUserData, sector: e.target.value })} className={inputClass}>
                        <option value="geral">Geral (todos)</option>
                        <option value="gerencia">Gerência</option>
                        <option value="cozinha">Cozinha</option>
                        <option value="salao">Salão</option>
                        <option value="bar">Bar</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setShowNewUser(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={async () => {
                      if (!newUserData.email || !newUserData.password || !user?.organization_id) return;
                      setSaving(true);
                      const supabase = createClient();
                      const { data, error } = await supabase.auth.signUp({
                        email: newUserData.email,
                        password: newUserData.password,
                        options: { data: { full_name: newUserData.full_name, role: newUserData.role, sector: newUserData.sector, organization_id: user.organization_id } },
                      });
                      if (error) { alert(error.message); setSaving(false); return; }
                      if (data.user) {
                        setUsers([...users, { id: data.user.id, full_name: newUserData.full_name, email: newUserData.email, role: newUserData.role, created_at: new Date().toISOString() }]);
                      }
                      setNewUserData({ email: "", full_name: "", password: "", role: "operator", sector: "geral" });
                      setShowNewUser(false);
                      setSaving(false);
                      setSaved(true);
                      setTimeout(() => setSaved(false), 3000);
                    }} disabled={saving || !newUserData.email || !newUserData.password || !newUserData.full_name}>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {saving ? "Criando..." : "Criar Usuário"}
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {users.map((u) => {
                  const uInitials = u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  const roleLabels: Record<string, string> = { admin: "Administrador", operator: "Operador", master: "Master" };
                  return (
                    <Card key={u.id}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{uInitials}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-navy">{u.full_name}</p>
                          <p className="text-xs text-on-surface-variant">{u.email}</p>
                        </div>
                        <Badge variant={u.role === "admin" ? "info" : "pending"}>{roleLabels[u.role] || u.role}</Badge>
                        <span className="text-xs text-outline">{new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* HISTORICO DE EDICOES TAB */}
      {activeTab === "historico" && (
        <div className="space-y-3">
          {user?.role !== "admin" && user?.role !== "master" ? (
            <Card className="text-center py-16">
              <span className="material-symbols-outlined text-outline text-[56px] mb-4">lock</span>
              <h3 className="text-lg font-bold text-navy mb-2">Acesso restrito</h3>
              <p className="text-sm text-on-surface-variant">Somente administradores podem ver o histórico de edições</p>
            </Card>
          ) : logs.length === 0 ? (
            <Card className="text-center py-16">
              <span className="material-symbols-outlined text-outline text-[56px] mb-4">history</span>
              <h3 className="text-lg font-bold text-navy mb-2">Nenhuma atividade registrada</h3>
              <p className="text-sm text-on-surface-variant">Toda ação no sistema (respostas, aprovações, edições) aparecerá aqui</p>
            </Card>
          ) : (
            <Card>
              <div className="space-y-1">
                {logs.map((log) => {
                  const initials = log.user_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={log.id} className="flex items-center gap-3 py-3 border-b border-outline-variant/5 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[18px]">{actionIcon[log.action] || "edit"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface">
                          <span className="font-semibold text-navy">{log.user_name}</span> {log.description}
                        </p>
                      </div>
                      <span className="text-xs text-outline whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-primary">{initials}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
