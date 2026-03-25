"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <div
        className={`toggle-switch ${checked ? "active" : ""}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      />
      {label && <span className="text-sm text-on-surface-variant">{label}</span>}
    </label>
  );
}
