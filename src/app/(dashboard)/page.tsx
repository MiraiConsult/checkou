"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KPICard } from "@/components/ui/KPICard";
import { PageHero } from "@/components/ui/PageHero";
import { useAuth } from "@/hooks/useAuth";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { Button } from "@/components/ui/Button";
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
  const { user } = useAuth();
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
          profiles!checklist_executions_operator_id_fkey(full_name)
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.name.split(" ")[0] || "";
  const hasExecutions = data!.executions.length > 0;
  const conformidade = hasExecutions
    ? Math.round(data!.executions.reduce((sum, e) => sum + e.score, 0) / data!.executions.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHero
        title={`${greeting}, ${firstName}`}
        subtitle={hasExecutions ? "Esta é a conformidade das últimas execuções." : "Nenhuma execução registrada ainda."}
        score={hasExecutions ? conformidade : null}
        label="conformidade"
      >
        <Link href="/checklists"><Button variant="lime">
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          Executar checklist
        </Button></Link>
        <Link href="/historico"><Button variant="outline">Ver histórico</Button></Link>
      </PageHero>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-ink text-white rounded-2xl p-6 shadow-card">
          <span className="w-11 h-11 rounded-xl bg-lime text-on-lime flex items-center justify-center">
            <span className="material-symbols-outlined">fact_check</span>
          </span>
          <p className="font-display text-3xl font-extrabold mt-4 tabular-nums">{data!.templates}</p>
          <p className="text-sm font-semibold text-slate-300">Checklists</p>
        </div>
        <KPICard icon="assignment" label="Tarefas" value={data!.tasks.total} description={data!.tasks.pending > 0 ? `${data!.tasks.pending} pendentes` : undefined} />
        <KPICard icon="pending_actions" label="Aguardando aprovação" value={data!.approvals} />
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
              <Link href="/admin" className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]">settings</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Cadastrar clientes</p>
                  <p className="text-xs text-on-surface-variant">Crie empresas e usuários no Admin</p>
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
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
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

    </div>
  );
}
