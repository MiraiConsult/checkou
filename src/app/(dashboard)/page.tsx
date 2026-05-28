"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { Button } from "@/components/ui/Button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const statusMap: Record<string, { label: string; variant: "success" | "pending" | "error" | "info" }> = {
  approved: { label: "Aprovado", variant: "success" },
  completed: { label: "Concluído", variant: "info" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

interface DashboardData {
  templates: number;
  executions: { id: string; checklist: string; operator: string; initials: string; score: number; status: string; date: string }[];
  tasks: { total: number; pending: number };
  approvals: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const [templatesRes, executionsRes, tasksRes, approvalsRes] = await Promise.all([
        supabase.from("checklist_templates").select("id", { count: "exact", head: true }),
        supabase.from("checklist_executions").select(`
          id, score, status, started_at,
          checklist_templates(name),
          profiles(full_name)
        `).order("started_at", { ascending: false }).limit(5),
        supabase.from("tasks").select("id, status"),
        supabase.from("checklist_executions").select("id", { count: "exact", head: true }).in("status", ["completed"]),
      ]);

      const tasks = tasksRes.data || [];
      const execList = (executionsRes.data || []).map((e: Record<string, unknown>) => {
        const tmpl = e.checklist_templates as Record<string, string> | null;
        const prof = e.profiles as Record<string, string> | null;
        const name = prof?.full_name || "—";
        return {
          id: e.id as string,
          checklist: tmpl?.name || "—",
          operator: name,
          initials: name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
          score: e.score as number,
          status: e.status as string,
          date: new Date(e.started_at as string).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
        };
      });

      setData({
        templates: templatesRes.count || 0,
        executions: execList,
        tasks: {
          total: tasks.length,
          pending: tasks.filter((t) => t.status === "pending").length,
        },
        approvals: approvalsRes.count || 0,
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
          <p className="text-sm text-on-surface-variant mt-3">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const hasExecutions = data!.executions.length > 0;
  const conformidade = hasExecutions
    ? Math.round(data!.executions.reduce((sum, e) => sum + e.score, 0) / data!.executions.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Dashboard de Gestão</p>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">Visão Geral da Operação</h2>
          <p className="text-sm text-on-surface-variant mt-1">Acompanhe os indicadores de conformidade em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filtros Avançados
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <select className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                <option>Todas as Unidades</option>
              </select>
              <select className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
              <select className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                <option>Todos os Status</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
              <span className="material-symbols-outlined text-[16px]">close</span>
              Fechar
            </Button>
          </div>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Conformance Gauge */}
        <Card className="md:col-span-4 flex flex-col items-center justify-center py-8">
          <div className="relative">
            <svg width="180" height="180" className="-rotate-90">
              <circle cx="90" cy="90" r="78" fill="none" stroke="#e7e8e9" strokeWidth="12" />
              <circle
                cx="90" cy="90" r="78" fill="none" stroke="#007EF9" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - conformidade / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-navy">{conformidade}%</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Conformidade</span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-4 text-center">
            {hasExecutions ? "Taxa geral de conformidade" : "Nenhuma execução registrada ainda"}
          </p>
        </Card>

        {/* KPI Cards */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">fact_check</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-navy">{data!.templates}</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Templates</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">assignment</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-navy">{data!.tasks.total}</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Tarefas</p>
              {data!.tasks.pending > 0 && (
                <p className="text-xs text-outline mt-1">{data!.tasks.pending} pendentes</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">pending_actions</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-navy">{String(data!.approvals).padStart(2, "0")}</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Execuções</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quick actions */}
        <Card className="md:col-span-5">
          <h3 className="text-lg font-bold text-navy mb-6">Começar</h3>
          {!hasExecutions ? (
            <div className="space-y-4">
              <Link href="/checklists/novo" className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-[20px]">add</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Criar seu primeiro checklist</p>
                  <p className="text-xs text-on-surface-variant">Monte um template com seções e itens</p>
                </div>
              </Link>
              <Link href="/checklists" className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">play_arrow</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Executar um checklist</p>
                  <p className="text-xs text-on-surface-variant">Inicie uma verificação em campo</p>
                </div>
              </Link>
              <Link href="/configuracoes" className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]">settings</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Configurar restaurante</p>
                  <p className="text-xs text-on-surface-variant">Cadastre unidades e usuários</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Link href="/relatorios" className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver relatórios</Link>
            </div>
          )}
        </Card>

        {/* Últimas Execuções */}
        <Card className="md:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy">Últimas Execuções</h3>
            {hasExecutions && (
              <Link href="/historico" className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver histórico</Link>
            )}
          </div>

          {hasExecutions ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Checklist</th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Responsável</th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3 pr-4">Score</th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Status</th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {data!.executions.map((exec) => {
                    const status = statusMap[exec.status] || { label: exec.status, variant: "pending" as const };
                    return (
                      <tr key={exec.id} className="hover:bg-surface-container-low/50 transition-colors cursor-pointer" onClick={() => { router.push(`/historico/${exec.id}`); }}>
                        <td className="py-3 pr-4"><span className="text-sm font-medium text-on-surface">{exec.checklist}</span></td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-primary">{exec.initials}</span>
                            </div>
                            <span className="text-sm text-on-surface-variant">{exec.operator}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center"><ScoreRing score={exec.score} size={40} strokeWidth={4} /></td>
                        <td className="py-3 pr-4"><Badge variant={status.variant}>{status.label}</Badge></td>
                        <td className="py-3"><span className="text-xs text-outline">{exec.date}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-outline text-[48px] mb-3">inbox</span>
              <p className="text-sm font-semibold text-on-surface-variant">Nenhuma execução ainda</p>
              <p className="text-xs text-outline mt-1">Execute um checklist para ver os resultados aqui</p>
            </div>
          )}
        </Card>
      </div>

      <FloatingActionButton onClick={() => router.push("/checklists/novo")} />
    </div>
  );
}
