import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function MobileTopBar() {
  const button = "w-10 h-10 rounded-xl bg-surface-container-lowest text-on-surface-variant shadow-card flex items-center justify-center cursor-pointer";
  return (
    <div className="md:hidden print:hidden flex justify-end gap-2 mb-4">
      <ThemeToggle className={button} />
      <Link href="/tutoriais" aria-label="Central de tutoriais" className={button}>
        <span className="material-symbols-outlined text-[20px]">help</span>
      </Link>
    </div>
  );
}
