"use client";

import { KPICard } from "@/components/ui/KPICard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { Button } from "@/components/ui/Button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";

const areas = [
  { name: "Cozinha", value: 92, color: "tertiary" as const },
  { name: "Salão", value: 85, color: "primary" as const },
  { name: "Banheiros", value: 70, color: "warning" as const },
  { name: "Estoque", value: 88, color: "primary" as const },
  { name: "Recepção", value: 95, color: "tertiary" as const },
];

const recentExecutions = [
  { id: 1, checklist: "Abertura de Loja", operator: "Ana Lima", initials: "AL", score: 95, status: "approved", date: "23 Mar, 09:30" },
  { id: 2, checklist: "Higienização Cozinha", operator: "João Santos", initials: "JS", score: 82, status: "completed", date: "23 Mar, 08:15" },
  { id: 3, checklist: "Segurança Noturna", operator: "Maria Costa", initials: "MC", score: 68, status: "rejected", date: "22 Mar, 22:00" },
  { id: 4, checklist: "Controle Temperatura", operator: "Pedro Alves", initials: "PA", score: 91, status: "approved", date: "22 Mar, 14:20" },
  { id: 5, checklist: "Limpeza Banheiros", operator: "Carla Nunes", initials: "CN", score: 77, status: "completed", date: "22 Mar, 11:45" },
];

const statusMap: Record<string, { label: string; variant: "success" | "pending" | "error" | "info" }> = {
  approved: { label: "Aprovado", variant: "success" },
  completed: { label: "Concluído", variant: "info" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

export default function DashboardPage() {
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
          <Button variant="primary" size="sm">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filtros Avançados
          </Button>
        </div>
      </div>

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
                strokeDashoffset={2 * Math.PI * 78 * (1 - 0.88)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-navy">88%</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Conformidade</span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-4 text-center">Taxa geral de conformidade das unidades</p>
          <div className="flex items-center gap-1 mt-2 text-tertiary text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            +2.4% vs. mês anterior
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">fact_check</span>
              </div>
              <span className="text-[10px] font-bold text-tertiary bg-tertiary-fixed/20 px-2 py-0.5 rounded-full">80%</span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-navy">24</span>
                <span className="text-lg text-on-surface-variant font-medium">/30</span>
              </div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Checklists Hoje</p>
              <ProgressBar value={24} max={30} color="primary" size="sm" className="mt-3" />
            </div>
          </Card>

          <KPICard
            icon="assignment"
            label="Tarefas Abertas"
            value={12}
            trend={{ value: "+3%", positive: false }}
            description="4 atrasadas, 8 no prazo"
          />

          <KPICard
            icon="pending_actions"
            label="Aprovações Pendentes"
            value="05"
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
            <button className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver todas</button>
          </div>
          <div className="space-y-4">
            {areas.map((area) => (
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
                  Banheiros apresentam queda de 8% na conformidade. Recomenda-se revisão do checklist.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Últimas Execuções */}
        <Card className="md:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy">Últimas Execuções</h3>
            <button className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver histórico</button>
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
                {recentExecutions.map((exec) => {
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

      <FloatingActionButton />
    </div>
  );
}
