"use client";

export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("checkou-theme", dark ? "dark" : "light");
    } catch { /* tema só desta visita */ }
  };
  return (
    <button onClick={toggle} aria-label="Trocar tema" className={className}>
      <span className="material-symbols-outlined text-[20px] dark:hidden">dark_mode</span>
      <span className="material-symbols-outlined text-[20px] hidden dark:inline">light_mode</span>
    </button>
  );
}
