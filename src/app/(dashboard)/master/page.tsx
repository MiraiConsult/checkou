"use client";

import { useState } from "react";
import { KPICard } from "@/components/ui/KPICard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const initialGroups = [
  { id: 1, name: "Rede Alimenta", initials: "RA", plan: "Enterprise", companies: 12, users: 48, status: "active" },
  { id: 2, name: "Grupo Hospitalar Vida", initials: "GH", plan: "Enterprise Plus", companies: 8, users: 156, status: "active" },
  { id: 3, name: "Fast Food Brasil", initials: "FF", plan: "Professional", companies: 24, users: 89, status: "active" },
  { id: 4, name: "Hotelaria Premium", initials: "HP", plan: "Enterprise", companies: 6, users: 34, status: "trial" },
  { id: 5, name: "Varejo Nacional", initials: "VN", plan: "Professional", companies: 15, users: 67, status: "active" },
];

const planColors: Record<string, string> = {
  Professional: "bg-blue-100 text-blue-700",
  Enterprise: "bg-purple-100 text-purple-700",
  "Enterprise Plus": "bg-amber-100 text-amber-700",
};

export default function MasterDashboardPage() {
  const [showAll, setShowAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);

  const displayedGroups = showAll ? initialGroups : initialGroups.slice(0, 3);

  const handleExport = () => {
    const csv = [
      "Grupo,Plano,Empresas,Usuários,Status",
      ...initialGroups.map((g) => `${g.name},${g.plan},${g.companies},${g.users},${g.status}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checkou-clientes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-navy tracking-tight">Dashboard Master</h1>
          <p className="text-sm text-on-surface-variant mt-1">Visão consolidada de toda a plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar Dados
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowNewClient(!showNewClient)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* New client form */}
      {showNewClient && (
        <Card>
          <h3 className="text-lg font-bold text-navy mb-4">Cadastrar Novo Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Nome do Grupo" className="bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20" />
            <select className="bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface-variant border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
              <option>Professional</option>
              <option>Enterprise</option>
              <option>Enterprise Plus</option>
            </select>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={() => setShowNewClient(false)}>Salvar</Button>
              <Button variant="outline" onClick={() => setShowNewClient(false)}>Cancelar</Button>
            </div>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon="groups" label="Total Clientes" value={124} trend={{ value: "+12%", positive: true }} />
        <KPICard icon="domain" label="Empresas Ativas" value={456} trend={{ value: "+5%", positive: true }} />
        <Card>
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">bolt</span>
            </div>
            <span className="text-[10px] font-black text-error bg-error-container/30 px-2 py-0.5 rounded-full uppercase animate-pulse">
              Ao Vivo
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-navy">1.2k</p>
            <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Execuções Hoje</p>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">verified</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-navy">92%</span>
              <span className="text-xs font-bold text-tertiary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>+1.5%
              </span>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Taxa Conformidade</p>
            <div className="mt-3 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-container rounded-full" style={{ width: "92%" }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Groups table */}
        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy">Grupos Recentes</h3>
            <button onClick={() => setShowAll(!showAll)} className="text-xs text-primary font-semibold hover:underline cursor-pointer">
              {showAll ? "Mostrar menos" : "Ver todos"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Grupo</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Plano</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3 pr-4">Empresas</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3 pr-4">Usuários</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Status</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayedGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">{group.initials}</span>
                        </div>
                        <span className="text-sm font-medium text-on-surface">{group.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${planColors[group.plan]}`}>
                        {group.plan}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center text-sm text-on-surface-variant">{group.companies}</td>
                    <td className="py-3 pr-4 text-center text-sm text-on-surface-variant">{group.users}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={group.status === "active" ? "success" : "warning"}>
                        {group.status === "active" ? "Ativo" : "Trial"}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === group.id ? null : group.id)}
                          className="p-1 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-outline text-[18px]">more_horiz</span>
                        </button>
                        {menuOpen === group.id && (
                          <div className="absolute right-0 top-8 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[140px]">
                            <button onClick={() => setMenuOpen(null)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              Visualizar
                            </button>
                            <button onClick={() => setMenuOpen(null)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              Editar
                            </button>
                            <button onClick={() => setMenuOpen(null)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer">
                              <span className="material-symbols-outlined text-[16px]">block</span>
                              Suspender
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-primary rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white/80">Novas Assinaturas</p>
              <span className="material-symbols-outlined text-white/60 text-[18px]">trending_up</span>
            </div>
            <p className="text-4xl font-black">+42</p>
            <p className="text-sm text-white/70 mt-1">este mês</p>
            <div className="flex items-end gap-1.5 mt-6 h-16">
              {[35, 28, 42, 38, 45, 32, 50, 42, 55, 48, 42, 58].map((h, i) => (
                <div key={i} className="flex-1 bg-white/20 rounded-sm" style={{ height: `${(h / 58) * 100}%` }} />
              ))}
            </div>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-navy">Suporte Ativo</h4>
              <Badge variant="info">3 tickets</Badge>
            </div>
            <div className="flex -space-x-2 mb-3">
              {["AL", "JS", "MC", "PA"].map((initials, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{initials}</span>
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500">+5</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant">8 agentes disponíveis agora</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
