import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "tertiary" | "error" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

const colorStyles = {
  primary: "bg-primary",
  tertiary: "bg-tertiary-container",
  error: "bg-error",
  warning: "bg-amber-500",
};

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({ value, max = 100, color = "primary", size = "md", className, showLabel }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-on-surface-variant">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-surface-container-high", sizeStyles[size])}>
        <div
          className={cn("rounded-full transition-all duration-500", colorStyles[color], sizeStyles[size])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
