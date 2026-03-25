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
        "bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm",
        hover && "hover:shadow-xl transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}
