"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  progress: number;
  due_date: string | null;
  profiles: { full_name: string } | null;
  units: { name: string } | null;
}

const priorityBadge: Record<string, { variant: "priority-high" | "priority-medium" | "priority-low"; label: string }> = {
  high: { variant: "priority-high", label: "Alta" },
  medium: { variant: "priority-medium", label: "Média" },
  low: { variant: "priority-low", label: "Baixa" },
};

export default function TarefasPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("tasks").select("id, title, priority, status, progress, due_date, profiles(full_name), units(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setTasks((data as unknown as Task[]) || []); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  const pending = tasks.filter((t) => t.status === "pending");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Operações de Campo</p>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">Gestão de Tarefas</h2>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card className="text-center py-16">
          <span className="material-symbols-outlined text-outline text-[56px] mb-4">assignment</span>
          <h3 className="text-lg font-bold text-navy mb-2">Nenhuma tarefa ainda</h3>
          <p className="text-sm text-on-surface-variant mb-6">Tarefas são criadas automaticamente quando há não-conformidades em checklists</p>
          <Link href="/checklists">
            <Button variant="primary">
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Ir para Checklists
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <p className="text-3xl font-black text-navy">{pending.length}</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Pendentes</p>
            </Card>
            <Card>
              <p className="text-3xl font-black text-navy">{inProgress.length}</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Em Andamento</p>
            </Card>
            <Card>
              <p className="text-3xl font-black text-navy">{completed.length}</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Concluídas</p>
            </Card>
          </div>
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Tarefa</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Unidade</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3 pr-4">Prioridade</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/tarefas/${task.id}`} className="text-sm font-medium text-on-surface hover:text-primary">{task.title}</Link>
                      {task.progress > 0 && task.progress < 100 && <ProgressBar value={task.progress} size="sm" color="primary" className="mt-1.5 max-w-[120px]" />}
                    </td>
                    <td className="py-3 pr-4 text-sm text-on-surface-variant">{task.units?.name || "—"}</td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={priorityBadge[task.priority]?.variant || "priority-low"}>{priorityBadge[task.priority]?.label || task.priority}</Badge>
                    </td>
                    <td className="py-3 text-sm text-on-surface-variant">{task.due_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      <FloatingActionButton onClick={() => router.push("/checklists")} />
    </div>
  );
}
