"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface Execution {
  id: string;
  score: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  template_id: string;
  operator_id: string;
  template_name: string;
  operator_name: string;
}

export default function AprovacoesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingTemplates, setPendingTemplates] = useState<{ name: string; deadline_time: string | null }[]>([]);

  // Only admin/master can access this page
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role === "operator") {
      router.push("/checklists");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      // Fetch completed executions for approval
      const { data: execs } = await supabase
        .from("checklist_executions")
        .select("id, score, status, started_at, completed_at, template_id, operator_id")
        .eq("status", "completed")
        .order("started_at", { ascending: false });

      if (execs && execs.length > 0) {
        // Fetch template names and operator names separately
        const templateIds = [...new Set(execs.map((e) => e.template_id))];
        const operatorIds = [...new Set(execs.map((e) => e.operator_id))];

        const [templatesRes, profilesRes] = await Promise.all([
          supabase.from("checklist_templates").select("id, name").in("id", templateIds),
          supabase.from("profiles").select("id, full_name").in("id", operatorIds),
        ]);

        const templateMap = new Map((templatesRes.data || []).map((t) => [t.id, t.name]));
        const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p.full_name]));

        setExecutions(execs.map((e) => ({
          ...e,
          template_name: templateMap.get(e.template_id) || "—",
          operator_name: profileMap.get(e.operator_id) || "—",
        })));
      }

      // Fetch daily templates not executed today
      const today = new Date().toISOString().split("T")[0];
      const { data: templates } = await supabase
        .from("checklist_templates")
        .select("id, name, deadline_time")
        .eq("status", "published")
        .eq("frequency", "daily");

      if (templates) {
        const { data: todayExecs } = await supabase
          .from("checklist_executions")
          .select("template_id")
          .gte("started_at", today);

        const doneIds = new Set((todayExecs || []).map((e) => e.template_id));
        setPendingTemplates(templates.filter((t) => !doneIds.has(t.id)));
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    const supabase = createClient();
    await supabase.from("checklist_executions").update({
      status: action,
      ...(action === "approved" ? { approved_at: new Date().toISOString() } : {}),
    }).eq("id", id);
    setExecutions((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!user || user.role === "operator") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Auditoria & Conformidade</p>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Painel de Aprovações</h2>
      </div>

      {/* Pending daily checklists */}
      {pendingTemplates.length > 0 && (
        <Card className="border-l-4 border-l-error">
          <h3 className="text-sm font-bold text-error mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] animate-pulse">warning</span>
            Checklists não respondidos hoje
          </h3>
          <div className="space-y-2">
            {pendingTemplates.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-error-container/10 rounded-xl">
                <span className="text-sm font-medium text-on-surface">{t.name}</span>
                <div className="flex items-center gap-2">
                  {t.deadline_time && (
                    <span className="text-xs text-error font-bold">Prazo: {t.deadline_time.slice(0, 5)}</span>
                  )}
                  <Badge variant="error">Pendente</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Executions awaiting approval */}
      <div>
        <h3 className="text-lg font-bold text-navy mb-4">
          Aguardando Aprovação
          {executions.length > 0 && <Badge variant="warning" className="ml-2">{executions.length}</Badge>}
        </h3>

        {executions.length === 0 ? (
          <Card className="text-center py-12">
            <span className="material-symbols-outlined text-tertiary text-[48px] mb-3">task_alt</span>
            <p className="text-sm font-semibold text-on-surface-variant">Nenhuma execução pendente de aprovação</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {executions.map((exec) => {
              const initials = exec.operator_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <Card key={exec.id}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <ScoreRing score={exec.score} size={64} strokeWidth={6} />
                    <div className="flex-1">
                      <p className="text-base font-bold text-navy">{exec.template_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-primary">{initials}</span>
                          </div>
                          <span className="text-xs text-on-surface-variant">{exec.operator_name}</span>
                        </div>
                        <span className="text-xs text-outline">
                          {new Date(exec.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/historico/${exec.id}`}>
                        <Button variant="outline" size="sm">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Abrir
                        </Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleAction(exec.id, "rejected")}>Rejeitar</Button>
                      <Button variant="primary" size="sm" onClick={() => handleAction(exec.id, "approved")}>
                        <span className="material-symbols-outlined text-[16px]">check</span>Aprovar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
