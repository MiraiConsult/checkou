"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/approvals/ScoreRing";

const initialApprovals = [
  {
    id: "1",
    checklist: "Abertura de Restaurante",
    unit: "Unidade Centro",
    operator: "Ana Lima",
    operatorRole: "Operadora de Campo",
    initials: "AL",
    completedAt: "23 Mar 2026, 09:30",
    score: 95,
    criticalItems: 1,
    totalItems: 28,
    observation: "Todos os itens verificados conforme protocolo. Pequena observação na sinalização de saída.",
    photos: 3,
  },
  {
    id: "2",
    checklist: "Higienização Cozinha",
    unit: "Unidade Sul",
    operator: "João Santos",
    operatorRole: "Supervisor",
    initials: "JS",
    completedAt: "23 Mar 2026, 08:15",
    score: 82,
    criticalItems: 4,
    totalItems: 22,
    observation: "Fritadeira com resíduos. Bancada 3 precisa de manutenção. Ralos da área de preparo necessitam limpeza.",
    photos: 5,
  },
  {
    id: "3",
    checklist: "Controle de Temperatura",
    unit: "Unidade Norte",
    operator: "Maria Costa",
    operatorRole: "Operadora de Campo",
    initials: "MC",
    completedAt: "22 Mar 2026, 14:20",
    score: 91,
    criticalItems: 2,
    totalItems: 32,
    observation: "Câmara fria #2 com variação de 2°C acima do ideal. Ajuste programado.",
    photos: 4,
  },
  {
    id: "4",
    checklist: "Segurança Noturna",
    unit: "Unidade Leste",
    operator: "Pedro Alves",
    operatorRole: "Segurança",
    initials: "PA",
    completedAt: "22 Mar 2026, 22:00",
    score: 68,
    criticalItems: 5,
    totalItems: 15,
    observation: "Dois extintores vencidos. Câmera do estacionamento inoperante. Saída de emergência B obstruída.",
    photos: 6,
  },
];

export default function AprovacoesPage() {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ id: string; action: "approved" | "rejected" } | null>(null);

  const handleApprove = (id: string) => {
    setActionFeedback({ id, action: "approved" });
    setTimeout(() => {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      setActionFeedback(null);
    }, 800);
  };

  const handleReject = (id: string) => {
    setActionFeedback({ id, action: "rejected" });
    setTimeout(() => {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      setActionFeedback(null);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Auditoria & Conformidade</p>
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">Painel de Aprovações</h2>
          </div>
          <Badge variant="warning" dot className="ml-2 text-[10px]">{approvals.length} PENDENTES</Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <ScoreRing score={94} size={64} strokeWidth={6} />
            <div>
              <p className="text-2xl font-black text-navy">94.2%</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">Score Médio</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">schedule</span>
            </div>
            <div>
              <p className="text-2xl font-black text-navy">4h12m</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">Tempo Médio Resposta</p>
            </div>
          </div>
        </Card>
        <div className="bg-navy rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Próxima Auditoria Global</p>
              <p className="text-xl font-black mt-1">28 Mar 2026</p>
              <p className="text-xs text-white/50 mt-1">Em 5 dias</p>
            </div>
            <span className="material-symbols-outlined text-white/30 text-[40px]">event</span>
          </div>
        </div>
      </div>

      {approvals.length === 0 && (
        <Card className="text-center py-12">
          <span className="material-symbols-outlined text-tertiary text-[48px] mb-4">task_alt</span>
          <h3 className="text-lg font-bold text-navy mb-1">Tudo aprovado!</h3>
          <p className="text-sm text-on-surface-variant">Não há aprovações pendentes no momento.</p>
        </Card>
      )}

      {/* Approval cards */}
      <div className="space-y-4">
        {approvals.map((approval) => {
          const isFeedback = actionFeedback?.id === approval.id;
          return (
            <Card
              key={approval.id}
              className={`!p-0 overflow-hidden transition-all duration-500 ${
                isFeedback ? (actionFeedback.action === "approved" ? "ring-2 ring-tertiary bg-tertiary-fixed/5" : "ring-2 ring-error bg-error-container/5") : ""
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Score ring */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <ScoreRing score={approval.score} size={80} strokeWidth={7} />
                  </div>

                  {/* Details grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Checklist + Unit */}
                    <div>
                      <p className="text-sm font-bold text-navy">{approval.checklist}</p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {approval.unit}
                      </p>
                    </div>

                    {/* Operator */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">{approval.initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface">{approval.operator}</p>
                          <p className="text-[11px] text-on-surface-variant">{approval.operatorRole}</p>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs text-outline uppercase tracking-wider mb-0.5">Conclusão</p>
                      <p className="text-sm font-medium text-on-surface">{approval.completedAt}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === approval.id ? null : approval.id)}>
                        <span className="material-symbols-outlined text-[16px]">{expandedId === approval.id ? "expand_less" : "expand_more"}</span>
                        Ver
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleReject(approval.id)}>Rejeitar</Button>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(approval.id)}>
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {(expandedId === approval.id || true) && (
                  <div className="mt-5 pt-5 border-t border-outline-variant/10">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Observação do Operador</p>
                        <p className="text-sm text-on-surface italic">{approval.observation}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full">
                          <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                          {approval.photos} fotos
                        </div>
                        <div className="flex items-center gap-1 text-xs text-error bg-error-container/20 px-3 py-1.5 rounded-full font-bold">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          {approval.criticalItems} itens críticos
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
