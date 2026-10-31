"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface Organization {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

const tabs = [
  { id: "empresa", label: "Checkou", icon: "domain" },
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

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("empresa");
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Configurações são da equipe Checkou; usuários de cliente não acessam
  useEffect(() => {
    if (user && !isStaff(user)) router.push("/");
  }, [user, router]);

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
    supabase.from("organizations").select("*").eq("id", user.organization_id).single().then(({ data }) => {
      setOrg(data);
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
        <p className="text-sm text-on-surface-variant mt-1">Dados da Checkou e histórico de edições. As empresas clientes ficam no Admin.</p>
      </div>

      {/* Success feedback */}
      {saved && (
        <div className="py-3 bg-tertiary-fixed/20 text-tertiary rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
          <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
          Salvo com sucesso!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-lowest p-1.5 rounded-full w-fit max-w-full overflow-x-auto shadow-card">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold whitespace-nowrap rounded-full transition-all cursor-pointer",
              activeTab === tab.id
                ? "bg-ink text-white dark:bg-primary"
                : "text-on-surface-variant hover:text-on-surface"
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
          <h3 className="text-lg font-bold text-navy mb-6">Dados da Checkou</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Nome *</label>
              <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} placeholder="Checkou" className={inputClass} />
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
              <input type="email" value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} placeholder="contato@checkou.com.br" className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="primary" onClick={saveOrg} disabled={saving}>
              <span className="material-symbols-outlined text-[18px]">save</span>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </Card>
      )}

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
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
