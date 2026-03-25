import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/approvals/ScoreRing";

const executions = [
  { checklist: "Abertura Cozinha", operator: "Maria Souza", initials: "MS", score: 95, status: "approved" as const },
  { checklist: "Limpeza Banheiros", operator: "João Lima", initials: "JL", score: 72, status: "pending" as const },
  { checklist: "Segurança Estoque", operator: "Ana Costa", initials: "AC", score: 88, status: "approved" as const },
  { checklist: "Higienização Salão", operator: "Pedro Santos", initials: "PS", score: 60, status: "rejected" as const },
  { checklist: "Controle Temperatura", operator: "Carlos Silva", initials: "CS", score: 91, status: "approved" as const },
];

const statusMap = {
  approved: { label: "Aprovado", variant: "success" as const },
  pending: { label: "Pendente", variant: "pending" as const },
  rejected: { label: "Reprovado", variant: "error" as const },
};

export function RecentExecutions() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-navy">Últimas Execuções</h3>
        <button className="text-xs text-primary font-semibold hover:underline cursor-pointer">Ver todas</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="text-left text-[10px] uppercase font-bold text-on-surface-variant tracking-widest pb-3">Checklist</th>
              <th className="text-left text-[10px] uppercase font-bold text-on-surface-variant tracking-widest pb-3">Responsável</th>
              <th className="text-center text-[10px] uppercase font-bold text-on-surface-variant tracking-widest pb-3">Score</th>
              <th className="text-right text-[10px] uppercase font-bold text-on-surface-variant tracking-widest pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {executions.map((exec, i) => (
              <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3 text-sm font-medium text-on-surface">{exec.checklist}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-primary">{exec.initials}</div>
                    <span className="text-sm text-on-surface-variant">{exec.operator}</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex justify-center">
                    <ScoreRing score={exec.score} size={40} strokeWidth={4} />
                  </div>
                </td>
                <td className="py-3 text-right">
                  <Badge variant={statusMap[exec.status].variant}>{statusMap[exec.status].label}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
