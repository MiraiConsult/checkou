"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface Execution {
  id: string;
  score: number;
  status: string;
  started_at: string;
  template_name: string;
  operator_name: string;
}

const statusBadge: Record<string, { label: string; variant: "success" | "error" | "info" | "pending" }> = {
  completed: { label: "Concluído", variant: "info" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

export default function HistoricoPage() {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const fetchData = async () => {
      let query = supabase
        .from("checklist_executions")
        .select("id, score, status, started_at, template_id, operator_id")
        .order("started_at", { ascending: false })
        .limit(50);

      // Operators can only see their own executions
      if (user.role === "operator") {
        query = query.eq("operator_id", user.id);
      }

      const { data: execs } = await query;

      if (execs && execs.length > 0) {
        const tIds = [...new Set(execs.map((e) => e.template_id))];
        const oIds = [...new Set(execs.map((e) => e.operator_id))];
        const [tRes, oRes] = await Promise.all([
          supabase.from("checklist_templates").select("id, name").in("id", tIds),
          supabase.from("profiles").select("id, full_name").in("id", oIds),
        ]);
        const tMap = new Map((tRes.data || []).map((t) => [t.id, t.name]));
        const oMap = new Map((oRes.data || []).map((o) => [o.id, o.full_name]));

        setExecutions(execs.map((e) => ({
          id: e.id, score: Number(e.score), status: e.status, started_at: e.started_at,
          template_name: tMap.get(e.template_id) || "—",
          operator_name: oMap.get(e.operator_id) || "—",
        })));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

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
        <div className="space-y-3">
          {executions.map((exec) => {
            const status = statusBadge[exec.status] || statusBadge.completed;
            const initials = exec.operator_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <Link key={exec.id} href={`/historico/${exec.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={exec.score} size={52} strokeWidth={5} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-navy">{exec.template_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-primary">{initials}</span>
                          </div>
                          <span className="text-xs text-on-surface-variant">{exec.operator_name}</span>
                        </div>
                        <span className="text-xs text-outline">
                          {new Date(exec.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
