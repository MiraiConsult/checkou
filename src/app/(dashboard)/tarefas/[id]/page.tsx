"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function TaskDetailPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleComplete = () => {
    setCompleted(true);
    setProgress(100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back_ios_new</span>
        </button>
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Detalhe da Tarefa</p>
          <h2 className="text-xl font-extrabold text-navy tracking-tight">Limpeza profunda da fritadeira</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="priority-high">Alta Prioridade</Badge>
            <Badge variant={completed ? "success" : "pending"}>{completed ? "Concluída" : "Pendente"}</Badge>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Descrição</p>
              <p className="text-sm text-on-surface">Equipamento da fritadeira apresenta resíduos de gordura acumulada. Necessário realizar limpeza profunda com produto desengordurante industrial.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Origem</p>
              <p className="text-sm text-on-surface">Checklist: Higienização Cozinha — Item #3</p>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Progresso</p>
              <ProgressBar value={progress} size="lg" color={completed ? "tertiary" : "primary"} showLabel />
            </div>
          </div>
        </Card>

        <div className="md:col-span-4 space-y-6">
          <Card>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Responsável</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">AL</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">Ana Lima</p>
                <p className="text-xs text-on-surface-variant">Operadora</p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Prazo</p>
            <p className="text-lg font-bold text-error">24 Mar 2026</p>
            <p className="text-xs text-error mt-1">Vence amanhã</p>
          </Card>
          {completed ? (
            <div className="w-full py-3 bg-tertiary-fixed/20 text-tertiary rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
              <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
              Tarefa Concluída
            </div>
          ) : (
            <Button variant="primary" className="w-full" onClick={handleComplete}>
              Marcar como Concluída
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
