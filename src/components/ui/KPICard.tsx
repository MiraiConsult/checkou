import { Card } from "./Card";

interface KPICardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  description?: string;
  className?: string;
}

export function KPICard({ icon, label, value, trend, description, className }: KPICardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-1 ${trend.positive ? "text-tertiary" : "text-error"}`}>
            <span className="material-symbols-outlined text-[16px]">
              {trend.positive ? "trending_up" : "trending_down"}
            </span>
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-black text-navy">{value}</p>
        <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">{label}</p>
        {description && <p className="text-xs text-outline mt-1">{description}</p>}
      </div>
    </Card>
  );
}
