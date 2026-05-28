"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface Response {
  item_id: string;
  answer: "conform" | "non_conform";
  observation: string | null;
}

interface Section {
  name: string;
  items: { id: string; question: string; required_evidence: boolean }[];
}

interface ExecutionData {
  id: string;
  score: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  responses: Response[];
  checklist_templates: { name: string; icon: string; sections: Section[] } | null;
  profiles: { full_name: string; email: string } | null;
  units: { name: string } | null;
}

const statusLabel: Record<string, { label: string; variant: "success" | "error" | "info" | "pending" }> = {
  completed: { label: "Concluído", variant: "info" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

export default function ExecutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const execId = params.id as string;
  const [exec, setExec] = useState<ExecutionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("checklist_executions")
      .select("id, score, status, started_at, completed_at, responses, checklist_templates(name, icon, sections), profiles(full_name, email), units(name)")
      .eq("id", execId).single()
      .then(({ data }) => { setExec(data as unknown as ExecutionData); setLoading(false); });
  }, [execId]);

  const handleApprove = async () => {
    if (!exec) return;
    const supabase = createClient();
    await supabase.from("checklist_executions").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", execId);
    setExec({ ...exec, status: "approved" });
  };

  const handleReject = async () => {
    if (!exec) return;
    const supabase = createClient();
    await supabase.from("checklist_executions").update({ status: "rejected" }).eq("id", execId);
    setExec({ ...exec, status: "rejected" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!exec) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-outline text-[48px] mb-3">search_off</span>
        <p className="text-sm text-on-surface-variant">Execução não encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/historico")}>Voltar</Button>
      </div>
    );
  }

  const responses = Array.isArray(exec.responses) ? exec.responses : [];
  const answersMap = new Map(responses.map((r) => [r.item_id, r]));
  const sections: Section[] = Array.isArray(exec.checklist_templates?.sections) ? exec.checklist_templates!.sections : [];
  const operatorName = exec.profiles?.full_name || "—";
  const initials = operatorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const status = statusLabel[exec.status] || statusLabel.completed;
  const conformCount = responses.filter((r) => r.answer === "conform").length;
  const nonConformCount = responses.filter((r) => r.answer === "non_conform").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Resultado da Execução</p>
          <h2 className="text-2xl font-extrabold text-navy tracking-tight">{exec.checklist_templates?.name || "—"}</h2>
        </div>
        <Badge variant={status.variant} className="text-sm px-3 py-1">{status.label}</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 flex flex-col items-center justify-center py-6">
          <ScoreRing score={exec.score} size={100} strokeWidth={8} />
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-3">Score de Conformidade</p>
        </Card>

        <Card className="md:col-span-4">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Operador</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{operatorName}</p>
                  <p className="text-xs text-on-surface-variant">{exec.profiles?.email}</p>
                </div>
              </div>
            </div>
            {exec.units && (
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Unidade</p>
                <p className="text-sm text-navy mt-1">{exec.units.name}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Data</p>
              <p className="text-sm text-navy mt-1">
                {exec.completed_at
                  ? new Date(exec.completed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                  : "Em andamento"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Conformes</span>
              <span className="text-lg font-black text-tertiary">{conformCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Não Conformes</span>
              <span className="text-lg font-black text-error">{nonConformCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Total de Itens</span>
              <span className="text-lg font-black text-navy">{responses.length}</span>
            </div>
          </div>

          {exec.status === "completed" && (
            <div className="flex gap-2 mt-5 pt-4 border-t border-outline-variant/10">
              <Button variant="danger" size="sm" className="flex-1" onClick={handleReject}>Rejeitar</Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={handleApprove}>
                <span className="material-symbols-outlined text-[16px]">check</span>Aprovar
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Detailed responses by section */}
      <div className="space-y-6">
        {sections.map((sec, sIdx) => {
          const sectionConform = sec.items.filter((i) => answersMap.get(i.id)?.answer === "conform").length;
          const sectionTotal = sec.items.filter((i) => answersMap.has(i.id)).length;
          return (
            <Card key={sIdx}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{sIdx + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-navy">{sec.name}</h3>
                  <span className="text-xs text-outline">{sectionConform}/{sectionTotal} conformes</span>
                </div>
              </div>
              <div className="space-y-2">
                {sec.items.map((item) => {
                  const resp = answersMap.get(item.id);
                  if (!resp) return null;
                  const isConform = resp.answer === "conform";
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border",
                        isConform ? "border-tertiary/20 bg-tertiary-fixed/5" : "border-error/20 bg-error-container/5"
                      )}
                    >
                      <span className={cn("material-symbols-outlined text-[20px] mt-0.5 filled", isConform ? "text-tertiary" : "text-error")}>
                        {isConform ? "check_circle" : "cancel"}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface">{item.question}</p>
                        <p className={cn("text-xs font-bold mt-1", isConform ? "text-tertiary" : "text-error")}>
                          {isConform ? "Conforme" : "Não Conforme"}
                        </p>
                        {resp.observation && (
                          <p className="text-xs italic text-on-surface-variant mt-2 border-l-2 border-error pl-2">{resp.observation}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
