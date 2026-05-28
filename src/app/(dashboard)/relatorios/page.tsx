"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RelatoriosPage() {
  const [stats, setStats] = useState({ templates: 0, executions: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("checklist_templates").select("id", { count: "exact", head: true }),
      supabase.from("checklist_executions").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
    ]).then(([t, e, tk]) => {
      setStats({ templates: t.count || 0, executions: e.count || 0, tasks: tk.count || 0 });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  const hasData = stats.executions > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Business Intelligence</p>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Relatórios & Análises</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary">fact_check</span>
          </div>
          <p className="text-3xl font-black text-navy">{stats.templates}</p>
          <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Templates</p>
        </Card>
        <Card>
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary">play_circle</span>
          </div>
          <p className="text-3xl font-black text-navy">{stats.executions}</p>
          <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Execuções</p>
        </Card>
        <Card>
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary">assignment</span>
          </div>
          <p className="text-3xl font-black text-navy">{stats.tasks}</p>
          <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Tarefas</p>
        </Card>
      </div>

      {!hasData ? (
        <Card className="text-center py-16">
          <span className="material-symbols-outlined text-outline text-[56px] mb-4">analytics</span>
          <h3 className="text-lg font-bold text-navy mb-2">Relatórios disponíveis após primeiras execuções</h3>
          <p className="text-sm text-on-surface-variant mb-6">Execute checklists para gerar dados de conformidade e análises</p>
          <Link href="/checklists">
            <Button variant="primary">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Executar um Checklist
            </Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <h3 className="text-lg font-bold text-navy mb-4">Dados disponíveis</h3>
          <p className="text-sm text-on-surface-variant">Os relatórios detalhados com gráficos serão gerados conforme mais execuções forem realizadas.</p>
        </Card>
      )}
    </div>
  );
}
