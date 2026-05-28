"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ExecSummary {
  id: string;
  score: number;
  status: string;
  started_at: string;
  template_name: string;
  operator_name: string;
}

const statusLabel: Record<string, { label: string; variant: "success" | "error" | "info" | "pending" }> = {
  completed: { label: "Concluído", variant: "info" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

export default function RelatoriosPage() {
  const [stats, setStats] = useState({ templates: 0, executions: 0, avgScore: 0, approved: 0, rejected: 0 });
  const [recentExecs, setRecentExecs] = useState<ExecSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchAll = async () => {
      const [templatesRes, execsRes] = await Promise.all([
        supabase.from("checklist_templates").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("checklist_executions").select("id, score, status, started_at, template_id, operator_id").order("started_at", { ascending: false }).limit(20),
      ]);

      const execs = execsRes.data || [];
      const totalExecs = execs.length;
      const avgScore = totalExecs > 0 ? Math.round(execs.reduce((s, e) => s + Number(e.score), 0) / totalExecs) : 0;
      const approved = execs.filter((e) => e.status === "approved").length;
      const rejected = execs.filter((e) => e.status === "rejected").length;

      setStats({ templates: templatesRes.count || 0, executions: totalExecs, avgScore, approved, rejected });

      if (execs.length > 0) {
        const tIds = [...new Set(execs.map((e) => e.template_id))];
        const oIds = [...new Set(execs.map((e) => e.operator_id))];
        const [tRes, oRes] = await Promise.all([
          supabase.from("checklist_templates").select("id, name").in("id", tIds),
          supabase.from("profiles").select("id, full_name").in("id", oIds),
        ]);
        const tMap = new Map((tRes.data || []).map((t) => [t.id, t.name]));
        const oMap = new Map((oRes.data || []).map((o) => [o.id, o.full_name]));
        setRecentExecs(execs.map((e) => ({
          id: e.id, score: Number(e.score), status: e.status, started_at: e.started_at,
          template_name: tMap.get(e.template_id) || "—",
          operator_name: oMap.get(e.operator_id) || "—",
        })));
      }

      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Business Intelligence</p>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Relatórios & Análises</h2>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <p className="text-3xl font-black text-navy">{stats.templates}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Templates</p>
        </Card>
        <Card>
          <p className="text-3xl font-black text-navy">{stats.executions}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Execuções</p>
        </Card>
        <Card>
          <p className="text-3xl font-black text-navy">{stats.avgScore}%</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Score Médio</p>
        </Card>
        <Card>
          <p className="text-3xl font-black text-tertiary">{stats.approved}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Aprovados</p>
        </Card>
        <Card>
          <p className="text-3xl font-black text-error">{stats.rejected}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Reprovados</p>
        </Card>
      </div>

      {/* Recent executions table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-navy">Últimas Execuções</h3>
          <Link href="/historico" className="text-xs text-primary font-semibold hover:underline">Ver histórico completo</Link>
        </div>

        {recentExecs.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-outline text-[48px] mb-3">analytics</span>
            <p className="text-sm text-on-surface-variant">Nenhuma execução registrada ainda</p>
            <p className="text-xs text-outline mt-1">Execute checklists para gerar relatórios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Checklist</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Operador</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3 pr-4">Score</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Status</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentExecs.map((exec) => {
                  const st = statusLabel[exec.status] || statusLabel.completed;
                  return (
                    <tr key={exec.id} className="hover:bg-surface-container-low/50 transition-colors cursor-pointer" onClick={() => { window.location.href = `/historico/${exec.id}`; }}>
                      <td className="py-3 pr-4 text-sm font-medium text-on-surface">{exec.template_name}</td>
                      <td className="py-3 pr-4 text-sm text-on-surface-variant">{exec.operator_name}</td>
                      <td className="py-3 pr-4 text-center"><ScoreRing score={exec.score} size={36} strokeWidth={4} /></td>
                      <td className="py-3 pr-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="py-3 text-xs text-outline">
                        {new Date(exec.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
