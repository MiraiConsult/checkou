"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface ExecSummary {
  id: string;
  score: number;
  status: string;
  started_at: string;
  template_name: string;
  operator_name: string;
}

interface ProfileOption {
  id: string;
  full_name: string;
}

const statusLabel: Record<string, { label: string; variant: "success" | "error" | "info" | "pending" }> = {
  completed: { label: "Concluído", variant: "info" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ templates: 0, executions: 0, avgScore: 0, approved: 0, rejected: 0 });
  const [efficiency, setEfficiency] = useState({ expected: 0, executed: 0, late: 0, onTime: 0 });
  const [recentExecs, setRecentExecs] = useState<ExecSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);

  // Fetch profiles for user filter (only for admin/master)
  useEffect(() => {
    if (!user || user.role === "operator") return;
    const supabase = createClient();
    supabase.from("profiles").select("id, full_name").then(({ data }) => {
      setProfiles(data || []);
    });
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    const [templatesRes] = await Promise.all([
      supabase.from("checklist_templates").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);

    // Build executions query with filters
    let execsQuery = supabase
      .from("checklist_executions")
      .select("id, score, status, started_at, template_id, operator_id")
      .order("started_at", { ascending: false })
      .limit(50);

    // Operators can only see their own data
    if (user.role === "operator") {
      execsQuery = execsQuery.eq("operator_id", user.id);
    } else if (selectedUserId) {
      execsQuery = execsQuery.eq("operator_id", selectedUserId);
    }

    if (startDate) {
      execsQuery = execsQuery.gte("started_at", startDate);
    }
    if (endDate) {
      execsQuery = execsQuery.lte("started_at", endDate + "T23:59:59");
    }

    const { data: execsData } = await execsQuery;
    const execs = execsData || [];
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
    } else {
      setRecentExecs([]);
    }

    // ---- Execution efficiency for the selected period ----
    // Published daily templates for this org define what SHOULD run each day.
    const { data: dailyTemplates } = await supabase
      .from("checklist_templates")
      .select("id, deadline_time")
      .eq("status", "published")
      .eq("frequency", "daily")
      .eq("organization_id", user.organization_id);
    const dailyTpls = dailyTemplates || [];
    const dailyIds = dailyTpls.map((t) => t.id);
    const deadlineMap = new Map(dailyTpls.map((t) => [t.id, t.deadline_time as string | null]));

    // Resolve the effective date window (defaults to current month when unset).
    const now = new Date();
    const periodStart = startDate
      ? new Date(startDate + "T00:00:00")
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = endDate
      ? new Date(endDate + "T23:59:59")
      : now;
    // Number of calendar days in the window (inclusive).
    const dayMs = 24 * 60 * 60 * 1000;
    const startDay = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    const endDay = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
    const numDays = Math.max(1, Math.floor((endDay.getTime() - startDay.getTime()) / dayMs) + 1);

    const expected = dailyIds.length * numDays;

    let executed = 0;
    let late = 0;
    if (dailyIds.length > 0) {
      let effQuery = supabase
        .from("checklist_executions")
        .select("id, started_at, template_id")
        .in("template_id", dailyIds)
        .gte("started_at", periodStart.toISOString())
        .lte("started_at", periodEnd.toISOString());
      if (user.role === "operator") {
        effQuery = effQuery.eq("operator_id", user.id);
      } else if (selectedUserId) {
        effQuery = effQuery.eq("operator_id", selectedUserId);
      }
      const { data: effData } = await effQuery;
      const effExecs = effData || [];
      executed = effExecs.length;
      for (const e of effExecs) {
        const deadline = deadlineMap.get(e.template_id);
        if (!deadline) continue;
        const started = new Date(e.started_at);
        const [dh, dm] = deadline.split(":").map(Number);
        const startMinutes = started.getHours() * 60 + started.getMinutes();
        const deadlineMinutes = dh * 60 + (dm || 0);
        if (startMinutes > deadlineMinutes) late += 1;
      }
    }
    setEfficiency({ expected, executed, late, onTime: executed - late });

    setLoading(false);
  }, [user, startDate, endDate, selectedUserId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {user?.role !== "operator" && (
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Operador</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todos</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
          )}
          <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); setSelectedUserId(""); }}>
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            Limpar
          </Button>
        </div>
      </Card>

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

      {/* Execution efficiency */}
      {(() => {
        const rate = efficiency.expected > 0 ? Math.round((efficiency.executed / efficiency.expected) * 100) : 0;
        const onTimeRate = efficiency.executed > 0 ? Math.round((efficiency.onTime / efficiency.executed) * 100) : 0;
        return (
          <div>
            <h3 className="text-lg font-bold text-navy mb-4">Eficiência de Execução</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Execution rate */}
              <Card>
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Taxa de Execução</p>
                <p className={`text-4xl font-black mt-2 ${rate >= 80 ? "text-tertiary" : "text-error"}`}>{rate}%</p>
                <p className="text-xs text-on-surface-variant mt-2">
                  Dos checklists previstos, <span className="font-bold text-navy">{rate}%</span> foram executados
                </p>
                <p className="text-[11px] text-outline mt-1">
                  {efficiency.executed} de {efficiency.expected} previstos
                </p>
              </Card>

              {/* Previstos vs executados */}
              <Card>
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Previstos vs Executados</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-navy">{efficiency.executed}</span>
                  <span className="text-lg font-bold text-on-surface-variant">/ {efficiency.expected}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  Diários publicados no período selecionado
                </p>
                {efficiency.expected - efficiency.executed > 0 && (
                  <p className="text-[11px] text-error mt-1 font-semibold">
                    {efficiency.expected - efficiency.executed} não executados
                  </p>
                )}
              </Card>

              {/* On time vs late */}
              <Card>
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Pontualidade</p>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-4xl font-black text-tertiary">{efficiency.onTime}</span>
                  <span className="text-sm font-bold text-on-surface-variant">no prazo</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  <span className="font-bold text-error">{efficiency.late}</span> em atraso
                  {efficiency.executed > 0 && (
                    <> · <span className="font-bold text-navy">{onTimeRate}%</span> dentro do prazo</>
                  )}
                </p>
                <p className="text-[11px] text-outline mt-1">Atraso = iniciado após o horário-limite do template</p>
              </Card>
            </div>
          </div>
        );
      })()}

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
