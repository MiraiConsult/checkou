"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TaskStatus = "pending" | "in_progress" | "completed";
type TaskPriority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  unit: string;
  unitColor: string;
  assignee: string;
  initials: string;
  dueDate: string;
  isUrgent: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  hasEvidence: boolean;
}

const tasks: Task[] = [
  { id: "1", title: "Limpeza profunda da fritadeira", unit: "Unidade Centro", unitColor: "bg-blue-500", assignee: "Ana Lima", initials: "AL", dueDate: "24 Mar", isUrgent: true, priority: "high", status: "pending", progress: 0, hasEvidence: false },
  { id: "2", title: "Reparo iluminação do salão", unit: "Unidade Sul", unitColor: "bg-green-500", assignee: "João Santos", initials: "JS", dueDate: "25 Mar", isUrgent: false, priority: "medium", status: "in_progress", progress: 65, hasEvidence: true },
  { id: "3", title: "Substituição de extintores vencidos", unit: "Unidade Norte", unitColor: "bg-purple-500", assignee: "Maria Costa", initials: "MC", dueDate: "23 Mar", isUrgent: true, priority: "high", status: "pending", progress: 0, hasEvidence: false },
  { id: "4", title: "Manutenção câmara fria", unit: "Unidade Centro", unitColor: "bg-blue-500", assignee: "Pedro Alves", initials: "PA", dueDate: "26 Mar", isUrgent: false, priority: "medium", status: "in_progress", progress: 40, hasEvidence: false },
  { id: "5", title: "Limpeza do sistema de exaustão", unit: "Unidade Leste", unitColor: "bg-orange-500", assignee: "Carla Nunes", initials: "CN", dueDate: "27 Mar", isUrgent: false, priority: "low", status: "completed", progress: 100, hasEvidence: true },
  { id: "6", title: "Reparo vazamento banheiro", unit: "Unidade Sul", unitColor: "bg-green-500", assignee: "Lucas Ferreira", initials: "LF", dueDate: "28 Mar", isUrgent: false, priority: "medium", status: "pending", progress: 0, hasEvidence: false },
  { id: "7", title: "Calibração termômetros", unit: "Unidade Centro", unitColor: "bg-blue-500", assignee: "Ana Lima", initials: "AL", dueDate: "24 Mar", isUrgent: false, priority: "low", status: "completed", progress: 100, hasEvidence: true },
  { id: "8", title: "Troca de lâmpadas emergência", unit: "Unidade Norte", unitColor: "bg-purple-500", assignee: "João Santos", initials: "JS", dueDate: "25 Mar", isUrgent: false, priority: "high", status: "in_progress", progress: 80, hasEvidence: false },
];

const priorityBadge: Record<TaskPriority, { variant: "priority-high" | "priority-medium" | "priority-low"; label: string }> = {
  high: { variant: "priority-high", label: "Alta" },
  medium: { variant: "priority-medium", label: "Média" },
  low: { variant: "priority-low", label: "Baixa" },
};

const mobileFilters = ["Todas", "Urgentes", "Minha Área", "Favoritas"];
const statusFilters = ["Todos", "Pendente", "Em Andamento", "Concluída"];
const unitFilters = ["Todas", "Unidade Centro", "Unidade Sul", "Unidade Norte", "Unidade Leste"];
const periodFilters = ["Todos", "Hoje", "Esta Semana", "Este Mês"];

// Pre-computed from constant data
const pendingTasks = tasks.filter((t) => t.status === "pending");
const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
const completedTasks = tasks.filter((t) => t.status === "completed");

export default function TarefasPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [unitFilter, setUnitFilter] = useState("Todas");
  const [periodFilter, setPeriodFilter] = useState("Todos");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [page, setPage] = useState(0);

  const closeAllDropdowns = () => {
    setShowStatusDropdown(false);
    setShowUnitDropdown(false);
    setShowPeriodDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* ====== DESKTOP VIEW ====== */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Operações de Campo</p>
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">Gestão de Tarefas</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowStatusDropdown(!showStatusDropdown); }}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant hover:border-primary/30 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                {statusFilter === "Todos" ? "Status" : statusFilter}
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 top-11 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[160px]">
                  {statusFilters.map((f) => (
                    <button key={f} onClick={() => { setStatusFilter(f); setShowStatusDropdown(false); }} className={cn("w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer", statusFilter === f ? "text-primary font-semibold bg-primary/5" : "text-on-surface-variant hover:bg-surface-container-low")}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Unit filter */}
            <div className="relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowUnitDropdown(!showUnitDropdown); }}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant hover:border-primary/30 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">domain</span>
                {unitFilter === "Todas" ? "Unidade" : unitFilter}
              </button>
              {showUnitDropdown && (
                <div className="absolute right-0 top-11 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[180px]">
                  {unitFilters.map((f) => (
                    <button key={f} onClick={() => { setUnitFilter(f); setShowUnitDropdown(false); }} className={cn("w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer", unitFilter === f ? "text-primary font-semibold bg-primary/5" : "text-on-surface-variant hover:bg-surface-container-low")}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Period filter */}
            <div className="relative">
              <button
                onClick={() => { closeAllDropdowns(); setShowPeriodDropdown(!showPeriodDropdown); }}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant hover:border-primary/30 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {periodFilter === "Todos" ? "Período" : periodFilter}
              </button>
              {showPeriodDropdown && (
                <div className="absolute right-0 top-11 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[160px]">
                  {periodFilters.map((f) => (
                    <button key={f} onClick={() => { setPeriodFilter(f); setShowPeriodDropdown(false); }} className={cn("w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer", periodFilter === f ? "text-primary font-semibold bg-primary/5" : "text-on-surface-variant hover:bg-surface-container-low")}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">assignment</span>
              </div>
              <span className="text-xs font-bold text-tertiary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>+12%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-navy">128</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Total Ativas</p>
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-error/5 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-error">assignment_late</span>
              </div>
              <Badge variant="error" className="text-[9px]">CRÍTICO</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-navy">14</p>
              <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Atrasadas</p>
            </div>
          </Card>
          <div className="col-span-2 bg-navy rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white/70">Eficiência de Resolução</p>
              <span className="text-3xl font-black">94%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "94%" }} />
            </div>
            <p className="text-xs text-white/50 mt-2">Tarefas resolvidas dentro do prazo</p>
          </div>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Tarefa</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Unidade</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Responsável</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Prazo</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3 pr-4">Prioridade</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3 pr-4">Evidência</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <Link href={`/tarefas/${task.id}`} className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
                        {task.title}
                      </Link>
                      {task.progress > 0 && task.progress < 100 && (
                        <ProgressBar value={task.progress} size="sm" color="primary" className="mt-1.5 max-w-[120px]" />
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${task.unitColor}`} />
                        <span className="text-sm text-on-surface-variant">{task.unit}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">{task.initials}</span>
                        </div>
                        <span className="text-sm text-on-surface-variant">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={cn("text-sm font-medium", task.isUrgent ? "text-error" : "text-on-surface-variant")}>
                        {task.dueDate}
                        {task.isUrgent && <span className="material-symbols-outlined text-[14px] ml-1 align-middle">warning</span>}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      <Badge variant={priorityBadge[task.priority].variant}>
                        {priorityBadge[task.priority].label}
                      </Badge>
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      {task.hasEvidence ? (
                        <span className="material-symbols-outlined text-tertiary text-[18px] filled">photo_camera</span>
                      ) : (
                        <span className="text-xs text-outline">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      <Link href={`/tarefas/${task.id}`} className="p-1 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer inline-flex">
                        <span className="material-symbols-outlined text-outline text-[18px]">visibility</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/10">
            <span className="text-xs text-on-surface-variant">{page * 10 + 1}-{Math.min((page + 1) * 10, 128)} de 128 tarefas</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={(page + 1) * 10 >= 128} onClick={() => setPage(page + 1)}>Próximo</Button>
            </div>
          </div>
        </Card>

        {/* Footer contextual */}
        <div className="bg-navy rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["AL", "JS", "MC"].map((initials, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-navy flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{initials}</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-white/70">8 tarefas resolvidas hoje</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push("/relatorios")}>
            Ver Relatório
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Button>
        </div>
      </div>

      {/* ====== MOBILE VIEW (Kanban) ====== */}
      <div className="md:hidden space-y-6">
        {/* Mobile header */}
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Operações</p>
          <h2 className="text-2xl font-extrabold text-navy tracking-tight">Tarefas</h2>
        </div>

        {/* Filters scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {mobileFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                activeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/10"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Kanban columns */}
        <div className="space-y-6">
          {/* Pendentes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pendentes</h3>
              <span className="text-[10px] font-bold text-outline bg-surface-container-high px-1.5 py-0.5 rounded-full">{pendingTasks.length}</span>
            </div>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Link key={task.id} href={`/tarefas/${task.id}`} className="block bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 active:scale-[0.98] transition-all">
                  <Badge variant={priorityBadge[task.priority].variant} className="mb-2">{priorityBadge[task.priority].label}</Badge>
                  <h4 className="text-sm font-semibold text-navy mb-2">{task.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{task.initials}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-outline">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {task.dueDate}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Em Andamento */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Em Andamento</h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{inProgressTasks.length}</span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <Link key={task.id} href={`/tarefas/${task.id}`} className="block bg-surface-container-lowest p-4 rounded-xl border-l-4 border-l-primary border border-outline-variant/10 active:scale-[0.98] transition-all">
                  <Badge variant={priorityBadge[task.priority].variant} className="mb-2">{priorityBadge[task.priority].label}</Badge>
                  <h4 className="text-sm font-semibold text-navy mb-2">{task.title}</h4>
                  <ProgressBar value={task.progress} size="sm" color="primary" className="mb-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{task.initials}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{task.assignee}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{task.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Concluídas */}
          <div className="opacity-70">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Concluídas</h3>
              <span className="text-[10px] font-bold text-tertiary bg-tertiary-fixed/20 px-1.5 py-0.5 rounded-full">{completedTasks.length}</span>
            </div>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Link key={task.id} href={`/tarefas/${task.id}`} className="block bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                  <h4 className="text-sm font-semibold text-on-surface-variant line-through mb-2">{task.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{task.initials}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{task.assignee}</span>
                    </div>
                    <span className="material-symbols-outlined text-tertiary text-[18px] filled">check_circle</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={() => router.push("/tarefas/1")} />
    </div>
  );
}
