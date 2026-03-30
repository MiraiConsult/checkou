"use client";

import { useState } from "react";
import { KPICard } from "@/components/ui/KPICard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { Button } from "@/components/ui/Button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUnit } from "@/hooks/useUnit";

const statusMap: Record<string, { label: string; variant: "success" | "pending" | "error" | "info" }> = {
  approved: { label: "Aprovado", variant: "success" },
  completed: { label: "Concluído", variant: "info" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const unit = useUnit((s) => s.getUnitData());

  const checklistPercent = Math.round((unit.checklistsHoje.done / unit.checklistsHoje.total) * 100);
  const trendPositive = unit.conformidadeTrend.startsWith("+");
  const lowestArea = [...unit.areas].sort((a, b) => a.value - b.value)[0];

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
            23 Mar 2026
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filtros Avançados
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <select className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                <option>Todas as Unidades</option>
                <option>Unidade Centro</option>
                <option>Unidade Sul</option>
                <option>Unidade Norte</option>
              </select>
              <select className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
                <option>Este mês</option>
              </select>
              <select className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                <option>Todos os Status</option>
                <option>Aprovado</option>
                <option>Pendente</option>
                <option>Reprovado</option>
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
                strokeDashoffset={2 * Math.PI * 78 * (1 - unit.conformidade / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-navy">{unit.conformidade}%</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Conformidade</span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-4 text-center">Taxa geral de conformidade das unidades</p>
          <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendPositive ? "text-tertiary" : "text-error"}`}>
            <span className="material-symbols-outlined text-[16px]">{trendPositive ? "trending_up" : "trending_down"}</span>
            {unit.conformidadeTrend} vs. mês anterior
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">fact_check</span>
              </div>
              <span className="text-[10px] font-bold text-tertiary bg-tertiary-fixed/20 px-2 py-0.5 rounded-full">{checklistPercent}%</span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-navy">{unit.checklistsHoje.done}</span>
                <span className="text-lg text-on-surface-variant font-medium">/{unit.checklistsHoje.total}</span>
              </div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Checklists Hoje</p>
              <ProgressBar value={unit.checklistsHoje.done} max={unit.checklistsHoje.total} color="primary" size="sm" className="mt-3" />
            </div>
          </Card>

          <KPICard
            icon="assignment"
            label="Tarefas Abertas"
            value={unit.tarefasAbertas}
            trend={{ value: `${unit.tarefasAtrasadas} atrasadas`, positive: false }}
            description={`${unit.tarefasAtrasadas} atrasadas, ${unit.tarefasNoPrazo} no prazo`}
          />

          <KPICard
            icon="pending_actions"
            label="Aprovações Pendentes"
            value={String(unit.aprovacoesPendentes).padStart(2, "0")}
            trend={{ value: "-2", positive: true }}
            description="Aguardando auditoria"
          />
        </div>
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Conformidade por Área */}
        <Card className="md:col-span-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy">Conformidade por Área</h3>
            <Link href="/relatorios" className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver todas</Link>
          </div>
          <div className="space-y-4">
            {unit.areas.map((area) => (
              <div key={area.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-on-surface">{area.name}</span>
                  <span className="text-sm font-bold text-navy">{area.value}%</span>
                </div>
                <ProgressBar value={area.value} color={area.color} size="md" />
              </div>
            ))}
          </div>

          {/* Insight card */}
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">lightbulb</span>
              <div>
                <p className="text-sm font-semibold text-navy">Insight</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {lowestArea.name} apresenta a menor conformidade ({lowestArea.value}%). Recomenda-se revisão do checklist.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Últimas Execuções */}
        <Card className="md:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy">Últimas Execuções</h3>
            <Link href="/historico" className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver histórico</Link>
          </div>
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
                {unit.execucoes.map((exec) => {
                  const status = statusMap[exec.status];
                  return (
                    <tr key={exec.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="text-sm font-medium text-on-surface">{exec.checklist}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{exec.initials}</span>
                          </div>
                          <span className="text-sm text-on-surface-variant">{exec.operator}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <ScoreRing score={exec.score} size={40} strokeWidth={4} />
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3">
                        <span className="text-xs text-outline">{exec.date}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <FloatingActionButton onClick={() => router.push("/checklists/novo")} />
    </div>
  );
}
