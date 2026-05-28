"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Execution {
  id: string;
  score: number;
  status: string;
  started_at: string;
  checklist_templates: { name: string } | null;
  profiles: { full_name: string } | null;
  units: { name: string; location: string } | null;
}

const statusBadge: Record<string, { label: string; variant: "success" | "error" | "info" | "pending" }> = {
  completed: { label: "Concluído", variant: "info" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

export default function HistoricoPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("checklist_executions")
      .select("id, score, status, started_at, checklist_templates(name), profiles(full_name), units(name, location)")
      .order("started_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { setExecutions((data as unknown as Execution[]) || []); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Registro Operacional</p>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Histórico de Operações</h2>
      </div>

      {executions.length === 0 ? (
        <Card className="text-center py-16">
          <span className="material-symbols-outlined text-outline text-[56px] mb-4">history</span>
          <h3 className="text-lg font-bold text-navy mb-2">Nenhum registro ainda</h3>
          <p className="text-sm text-on-surface-variant mb-6">O histórico aparecerá aqui conforme checklists forem executados</p>
          <Link href="/checklists">
            <Button variant="primary">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Executar um Checklist
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {executions.map((exec) => {
            const status = statusBadge[exec.status] || { label: exec.status, variant: "pending" as const };
            return (
              <Card key={exec.id}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <Badge variant={status.variant} className="mb-2">{status.label}</Badge>
                    <h3 className="text-lg font-bold text-navy">{exec.checklist_templates?.name || "—"}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {exec.units?.name || "—"}
                      </span>
                      <span className="text-xs text-outline">
                        {new Date(exec.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <ScoreRing score={exec.score} size={64} strokeWidth={6} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
