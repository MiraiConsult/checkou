"use client";

interface FABProps {
  onClick?: () => void;
  icon?: string;
}

export function FloatingActionButton({ onClick, icon = "add" }: FABProps) {
  return (
    <>
      {/* Desktop */}
      <button
        onClick={onClick}
        className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[28px] hover:rotate-90 transition-transform duration-300">{icon}</span>
      </button>

      {/* Mobile */}
      <button
        onClick={onClick}
        className="md:hidden fixed right-6 bottom-24 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </button>
    </>
  );
}
