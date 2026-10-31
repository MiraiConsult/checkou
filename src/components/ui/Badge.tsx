import { cn } from "@/lib/utils/cn";

type BadgeVariant = "success" | "pending" | "error" | "info" | "warning" | "priority-high" | "priority-medium" | "priority-low";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-lime text-on-lime",
  pending: "bg-surface-container text-on-surface-variant",
  error: "bg-error-container text-error",
  info: "bg-primary/10 text-primary",
  warning: "bg-amber-400/25 text-amber-700 dark:text-amber-300",
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
