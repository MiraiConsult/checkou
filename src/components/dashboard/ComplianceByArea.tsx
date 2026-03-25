import { Card } from "@/components/ui/Card";

const areas = [
  { name: "Cozinha", value: 92, color: "bg-tertiary" },
  { name: "Salão", value: 85, color: "bg-primary" },
  { name: "Banheiros", value: 70, color: "bg-orange-500" },
  { name: "Estoque", value: 95, color: "bg-tertiary" },
  { name: "Recepção", value: 88, color: "bg-primary" },
];

export function ComplianceByArea() {
  return (
    <Card>
      <h3 className="text-lg font-bold text-navy mb-4">Conformidade por Área</h3>
      <div className="space-y-4">
        {areas.map((area) => (
          <div key={area.name}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-on-surface">{area.name}</span>
              <span className="text-sm font-bold text-navy">{area.value}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${area.color}`}
                style={{ width: `${area.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insight card */}
      <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">bolt</span>
          <div>
            <p className="text-xs font-bold text-primary">Insight Operacional</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Banheiros abaixo da meta de 80%. Ação corretiva recomendada.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
