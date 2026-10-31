"use client";

export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("checkou-theme", dark ? "dark" : "light");
    } catch { /* tema só desta visita */ }
  };
  // O display do ícone vence as utilitárias do Tailwind, então quem esconde é o span de fora
  return (
    <button onClick={toggle} aria-label="Trocar tema" className={className}>
      <span className="flex dark:hidden"><span className="material-symbols-outlined text-[20px]">dark_mode</span></span>
      <span className="hidden dark:flex"><span className="material-symbols-outlined text-[20px]">light_mode</span></span>
    </button>
  );
}
