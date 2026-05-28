"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/client";

interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  due_date: string | null;
  observation: string | null;
  profiles: { full_name: string } | null;
  units: { name: string } | null;
}

const priorityLabel: Record<string, { label: string; variant: "priority-high" | "priority-medium" | "priority-low" }> = {
  high: { label: "Alta Prioridade", variant: "priority-high" },
  medium: { label: "Média Prioridade", variant: "priority-medium" },
  low: { label: "Baixa Prioridade", variant: "priority-low" },
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("tasks")
      .select("id, title, description, priority, status, progress, due_date, observation, profiles(full_name), units(name)")
      .eq("id", taskId).single()
      .then(({ data }) => {
        setTask(data as unknown as TaskData);
        setLoading(false);
      });
  }, [taskId]);

  const handleComplete = async () => {
    if (!task) return;
    const supabase = createClient();
    await supabase.from("tasks").update({ status: "completed", progress: 100, completed_at: new Date().toISOString() }).eq("id", taskId);
    setTask({ ...task, status: "completed", progress: 100 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-outline text-[48px] mb-3">search_off</span>
        <p className="text-sm text-on-surface-variant">Tarefa não encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/tarefas")}>Voltar</Button>
      </div>
    );
  }

  const completed = task.status === "completed";
  const priority = priorityLabel[task.priority] || priorityLabel.medium;
  const assigneeName = task.profiles?.full_name || "Não atribuída";
  const initials = assigneeName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back_ios_new</span>
        </button>
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Detalhe da Tarefa</p>
          <h2 className="text-xl font-extrabold text-navy tracking-tight">{task.title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <Badge variant={priority.variant}>{priority.label}</Badge>
            <Badge variant={completed ? "success" : "pending"}>{completed ? "Concluída" : "Pendente"}</Badge>
          </div>
          <div className="space-y-4">
            {task.description && (
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Descrição</p>
                <p className="text-sm text-on-surface">{task.description}</p>
              </div>
            )}
            {task.units && (
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Unidade</p>
                <p className="text-sm text-on-surface">{task.units.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Progresso</p>
              <ProgressBar value={task.progress} size="lg" color={completed ? "tertiary" : "primary"} showLabel />
            </div>
          </div>
        </Card>

        <div className="md:col-span-4 space-y-6">
          <Card>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Responsável</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{initials}</span>
              </div>
              <p className="text-sm font-semibold text-navy">{assigneeName}</p>
            </div>
          </Card>
          {task.due_date && (
            <Card>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Prazo</p>
              <p className="text-lg font-bold text-navy">{new Date(task.due_date).toLocaleDateString("pt-BR")}</p>
            </Card>
          )}
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
