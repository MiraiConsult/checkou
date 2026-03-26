"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import Link from "next/link";

const templates = [
  { id: "1", icon: "restaurant", name: "Abertura de Restaurante", version: "2.1", description: "Verificações de abertura para operação diária", sections: 5, items: 28, color: "bg-orange-50 text-orange-600" },
  { id: "2", icon: "cleaning_services", name: "Higienização Cozinha", version: "1.3", description: "Protocolo de limpeza e sanitização da cozinha", sections: 4, items: 22, color: "bg-blue-50 text-blue-600" },
  { id: "3", icon: "security", name: "Segurança Noturna", version: "1.0", description: "Checklist de segurança para fechamento noturno", sections: 3, items: 15, color: "bg-purple-50 text-purple-600" },
  { id: "4", icon: "thermostat", name: "Controle de Temperatura", version: "3.0", description: "Monitoramento de temperatura de equipamentos e alimentos", sections: 6, items: 32, color: "bg-red-50 text-red-600" },
  { id: "5", icon: "inventory_2", name: "Inventário Semanal", version: "1.2", description: "Contagem e verificação de estoque semanal", sections: 4, items: 20, color: "bg-green-50 text-green-600" },
];

const activityMetrics = [
  { label: "Taxa Adesão", value: "94.2%", icon: "trending_up", color: "text-tertiary" },
  { label: "Execuções", value: "158", icon: "fact_check", color: "text-primary" },
  { label: "Não Conformidades", value: "24", icon: "warning", color: "text-error" },
  { label: "Tempo Médio", value: "14min", icon: "timer", color: "text-on-surface-variant" },
];

export default function ChecklistsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Gestão de Checklists</p>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">Templates de Verificação</h2>
        </div>
        <Link href="/checklists/novo">
          <Button variant="primary">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo Checklist
          </Button>
        </Link>
      </div>

      {/* Grid of templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => (
          <Card key={tmpl.id} className="group relative">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tmpl.color} group-hover:bg-primary group-hover:text-white transition-colors`}>
                <span className="material-symbols-outlined">{tmpl.icon}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">v{tmpl.version}</Badge>
                <button className="p-1 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-outline text-[18px]">more_horiz</span>
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-navy mb-1">{tmpl.name}</h3>
            <p className="text-xs text-on-surface-variant mb-4">{tmpl.description}</p>

            <div className="flex items-center gap-4 text-xs text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">folder</span>
                {tmpl.sections} seções
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">checklist</span>
                {tmpl.items} itens
              </span>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline-variant/10">
              <button className="flex-1 text-xs font-semibold text-on-surface-variant hover:text-primary py-2 rounded-lg hover:bg-primary/5 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">edit</span>
                Editar
              </button>
              <button className="flex-1 text-xs font-semibold text-on-surface-variant hover:text-error py-2 rounded-lg hover:bg-error/5 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">delete</span>
                Excluir
              </button>
              <Link
                href={`/checklists/${tmpl.id}/execute`}
                className="flex-1 text-xs font-semibold text-primary py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all text-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">play_arrow</span>
                Executar
              </Link>
            </div>
          </Card>
        ))}

        {/* Create new template card */}
        <Link href="/checklists/novo" className="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group min-h-[240px]">
          <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-outline text-[28px] group-hover:text-primary transition-colors">add</span>
          </div>
          <p className="text-sm font-semibold text-on-surface-variant group-hover:text-primary transition-colors">Criar Novo Template</p>
          <p className="text-xs text-outline mt-1">Adicione um novo checklist</p>
        </Link>
      </div>

      {/* Activity metrics */}
      <Card>
        <h3 className="text-lg font-bold text-navy mb-6">Atividade Recente</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {activityMetrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <span className={`material-symbols-outlined ${metric.color} text-[28px] mb-2`}>{metric.icon}</span>
              <p className="text-2xl font-black text-navy">{metric.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <FloatingActionButton />
    </div>
  );
}
