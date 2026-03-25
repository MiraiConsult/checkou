"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KPICard } from "@/components/ui/KPICard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const monthlyData = [
  { month: "Jan", realizado: 78, projetado: 85 },
  { month: "Fev", realizado: 82, projetado: 85 },
  { month: "Mar", realizado: 85, projetado: 86 },
  { month: "Abr", realizado: 80, projetado: 87 },
  { month: "Mai", realizado: 88, projetado: 88 },
  { month: "Jun", realizado: 90, projetado: 88 },
  { month: "Jul", realizado: 87, projetado: 89 },
  { month: "Ago", realizado: 92, projetado: 90 },
  { month: "Set", realizado: 89, projetado: 90 },
  { month: "Out", realizado: 91, projetado: 91 },
  { month: "Nov", realizado: 88, projetado: 91 },
  { month: "Dez", realizado: 0, projetado: 92 },
];

const unitRanking = [
  { name: "SP Central", value: 96 },
  { name: "RJ Sul", value: 91 },
  { name: "BH Centro", value: 85 },
  { name: "Curitiba", value: 78 },
  { name: "POA Norte", value: 72 },
];

const alerts = [
  { id: 1, date: "23 Mar, 09:15", unit: "Unidade Sul", status: "critical", performance: 65, action: "Visualizar" },
  { id: 2, date: "23 Mar, 08:30", unit: "Unidade Norte", status: "warning", performance: 72, action: "Visualizar" },
  { id: 3, date: "22 Mar, 16:45", unit: "Unidade Leste", status: "resolved", performance: 88, action: "Visualizar" },
  { id: 4, date: "22 Mar, 14:20", unit: "Unidade Centro", status: "warning", performance: 75, action: "Visualizar" },
  { id: 5, date: "22 Mar, 11:00", unit: "Unidade Sul", status: "critical", performance: 58, action: "Visualizar" },
];

const statusConfig: Record<string, { label: string; variant: "error" | "warning" | "success" }> = {
  critical: { label: "Crítico", variant: "error" },
  warning: { label: "Atenção", variant: "warning" },
  resolved: { label: "Resolvido", variant: "success" },
};

export default function RelatoriosPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Business Intelligence</p>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">Relatórios & Análises</h2>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant outline-none">
            <option>Últimos 12 meses</option>
            <option>Últimos 6 meses</option>
            <option>Últimos 3 meses</option>
          </select>
          <select className="bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant outline-none">
            <option>Todas as Unidades</option>
            <option>Unidade Centro</option>
            <option>Unidade Sul</option>
          </select>
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filtrar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard icon="verified" label="Conformidade Média" value="88%" trend={{ value: "+2.4%", positive: true }} />
        <KPICard icon="fact_check" label="Total Execuções" value="1.2k" trend={{ value: "+15%", positive: true }} />
        <KPICard icon="timer" label="Tempo Médio" value="15min" trend={{ value: "-2min", positive: true }} description="Por checklist" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evolution chart */}
        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy">Evolução de Conformidade</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" /> Realizado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/20" /> Projetado</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e8e9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#717786" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#717786" }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101828",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: 12,
                    padding: "8px 12px",
                  }}
                />
                <Bar dataKey="realizado" fill="#007EF9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projetado" fill="#007EF920" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Unit ranking */}
        <Card className="lg:col-span-4">
          <h3 className="text-lg font-bold text-navy mb-6">Ranking de Unidades</h3>
          <div className="space-y-4">
            {unitRanking.map((unit, i) => (
              <div key={unit.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant w-5">{i + 1}°</span>
                    <span className="text-sm font-medium text-on-surface">{unit.name}</span>
                  </div>
                  <span className="text-sm font-bold text-navy">{unit.value}%</span>
                </div>
                <ProgressBar
                  value={unit.value}
                  color={unit.value >= 90 ? "tertiary" : unit.value >= 80 ? "primary" : "warning"}
                  size="md"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alerts table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-navy">Alertas Operacionais</h3>
          <button className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Data/Hora</th>
                <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Unidade</th>
                <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Status</th>
                <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-3 pr-4">Performance</th>
                <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {alerts.map((alert) => {
                const status = statusConfig[alert.status];
                return (
                  <tr key={alert.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 pr-4 text-sm text-on-surface-variant">{alert.date}</td>
                    <td className="py-3 pr-4 text-sm font-medium text-on-surface">{alert.unit}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <ProgressBar
                          value={alert.performance}
                          color={alert.performance >= 80 ? "tertiary" : alert.performance >= 70 ? "warning" : "error"}
                          size="sm"
                          className="flex-1"
                        />
                        <span className="text-xs font-bold text-on-surface-variant w-8">{alert.performance}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <button className="text-xs text-primary font-semibold hover:underline cursor-pointer">{alert.action}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
