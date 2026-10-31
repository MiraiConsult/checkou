import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageHeroProps {
  title: string;
  subtitle?: ReactNode;
  score?: number | null;
  label?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHero({ title, subtitle, score, label, children, className }: PageHeroProps) {
  return (
    <div className={cn("relative overflow-hidden bg-primary text-white rounded-3xl p-6 md:p-8 flex flex-col-reverse md:flex-row md:items-center gap-5", className)}>
      <div aria-hidden className="absolute w-80 h-80 -right-20 -top-36 rounded-full bg-white/15 print:hidden" />
      <div className="relative flex-1 min-w-0">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h2>
        {subtitle && <div className="text-sm opacity-90 mt-1.5 max-w-xl">{subtitle}</div>}
        {children && <div className="flex flex-wrap gap-2.5 mt-5">{children}</div>}
      </div>
      {score !== undefined && score !== null && (
        <div className="relative shrink-0 w-32 h-32 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(var(--color-lime) ${score}%, rgb(255 255 255 / 0.22) 0)` }}>
          <div className="w-[6.4rem] h-[6.4rem] rounded-full bg-primary flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-extrabold tabular-nums">{score}%</span>
            {label && <span className="text-[10px] font-bold opacity-80">{label}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
