import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest p-6 rounded-2xl shadow-card",
        hover && "hover:-translate-y-0.5 transition-transform duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
