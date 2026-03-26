"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { cn } from "@/lib/utils/cn";

const filters = ["Hoje", "Últimos 7 dias", "Status", "Unidades"];

const executions = [
  { id: "1", checklist: "Abertura de Restaurante", unit: "Unidade Centro", location: "Rua Principal, 123", score: 95, status: "completed", date: "23 Mar 2026", time: "09:30", nonConformities: 1 },
  { id: "2", checklist: "Higienização Cozinha", unit: "Unidade Sul", location: "Av. Comercial, 456", score: 82, status: "non_conformity", date: "23 Mar 2026", time: "08:15", nonConformities: 4 },
  { id: "3", checklist: "Segurança Noturna", unit: "Unidade Norte", location: "Rua Industrial, 789", score: 68, status: "non_conformity", date: "22 Mar 2026", time: "22:00", nonConformities: 5 },
  { id: "4", checklist: "Controle de Temperatura", unit: "Unidade Centro", location: "Rua Principal, 123", score: 91, status: "completed", date: "22 Mar 2026", time: "14:20", nonConformities: 2 },
  { id: "5", checklist: "Limpeza Banheiros", unit: "Unidade Leste", location: "Av. Leste, 321", score: 77, status: "completed", date: "22 Mar 2026", time: "11:45", nonConformities: 3 },
  { id: "6", checklist: "Inventário Semanal", unit: "Unidade Sul", location: "Av. Comercial, 456", score: 98, status: "completed", date: "21 Mar 2026", time: "16:00", nonConformities: 0 },
];

const statusBadge: Record<string, { label: string; variant: "success" | "error" }> = {
  completed: { label: "Concluído", variant: "success" },
  non_conformity: { label: "Não Conformidade", variant: "error" },
};

export default function HistoricoPage() {
  const [activeFilter, setActiveFilter] = useState("Hoje");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Registro Operacional</p>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Histórico de Operações</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
              activeFilter === filter
                ? "bg-primary text-white"
                : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/10"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {executions.map((exec) => {
          const status = statusBadge[exec.status];
          const isExpanded = expandedId === exec.id;
          return (
            <Card key={exec.id}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <Badge variant={status.variant} className="mb-2">{status.label}</Badge>
                  <h3 className="text-lg font-bold text-navy">{exec.checklist}</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {exec.unit} — {exec.location}
                    </span>
                    <span className="text-xs text-outline">{exec.date}, {exec.time}</span>
                  </div>
                  {exec.nonConformities > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-error font-bold mt-2">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      {exec.nonConformities} não conformidade{exec.nonConformities > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <ScoreRing score={exec.score} size={64} strokeWidth={6} />
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : exec.id)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? "Fechar" : "Ver detalhes"}
                    <span className="material-symbols-outlined text-[14px]">{isExpanded ? "expand_less" : "chevron_right"}</span>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Score</p>
                      <p className="text-2xl font-black text-navy">{exec.score}%</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Não Conformidades</p>
                      <p className="text-2xl font-black text-navy">{exec.nonConformities}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Local</p>
                      <p className="text-sm text-on-surface">{exec.unit}</p>
                      <p className="text-xs text-outline">{exec.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
