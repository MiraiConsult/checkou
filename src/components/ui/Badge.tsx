import { cn } from "@/lib/utils/cn";

type BadgeVariant = "success" | "pending" | "error" | "info" | "warning" | "priority-high" | "priority-medium" | "priority-low";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-tertiary-fixed text-on-tertiary-fixed",
  pending: "bg-slate-100 text-slate-600",
  error: "bg-red-100 text-red-700",
  info: "bg-primary/10 text-primary",
  warning: "bg-amber-100 text-amber-700",
  "priority-high": "bg-error-container/30 text-error",
  "priority-medium": "bg-orange-50 text-orange-600",
  "priority-low": "bg-tertiary-fixed/20 text-tertiary",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant, children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}
