interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchInput({ placeholder = "Buscar...", value, onChange, className }: SearchInputProps) {
  return (
    <div className={`relative ${className || ""}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-slate-50 rounded-full px-4 py-1.5 pl-10 text-sm text-on-surface placeholder:text-outline border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}
