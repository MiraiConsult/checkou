"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Execution {
  id: string;
  score: number;
  status: string;
  started_at: string;
  checklist_templates: { name: string } | null;
  profiles: { full_name: string } | null;
  units: { name: string } | null;
}

export default function AprovacoesPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("checklist_executions")
      .select("id, score, status, started_at, checklist_templates(name), profiles(full_name), units(name)")
      .in("status", ["completed", "in_progress"])
      .order("started_at", { ascending: false })
      .then(({ data }) => { setExecutions((data as unknown as Execution[]) || []); setLoading(false); });
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    const supabase = createClient();
    await supabase.from("checklist_executions").update({
      status: action,
      ...(action === "approved" ? { approved_at: new Date().toISOString() } : {}),
    }).eq("id", id);
    setExecutions((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Auditoria & Conformidade</p>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">Painel de Aprovações</h2>
        </div>
        {executions.length > 0 && <Badge variant="warning" dot className="ml-2 text-[10px]">{executions.length} PENDENTES</Badge>}
      </div>

      {executions.length === 0 ? (
        <Card className="text-center py-16">
          <span className="material-symbols-outlined text-tertiary text-[56px] mb-4">task_alt</span>
          <h3 className="text-lg font-bold text-navy mb-2">Nenhuma aprovação pendente</h3>
          <p className="text-sm text-on-surface-variant mb-6">Quando checklists forem executados, eles aparecerão aqui para revisão</p>
          <Link href="/checklists">
            <Button variant="primary">
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Ver Checklists
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {executions.map((exec) => {
            const name = exec.profiles?.full_name || "—";
            const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <Card key={exec.id} className="!p-0 overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                  <ScoreRing score={exec.score} size={80} strokeWidth={7} />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-bold text-navy">{exec.checklist_templates?.name || "—"}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{exec.units?.name || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{initials}</span>
                      </div>
                      <span className="text-sm text-on-surface-variant">{name}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="danger" size="sm" onClick={() => handleAction(exec.id, "rejected")}>Rejeitar</Button>
                      <Button variant="primary" size="sm" onClick={() => handleAction(exec.id, "approved")}>
                        <span className="material-symbols-outlined text-[16px]">check</span>Aprovar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
