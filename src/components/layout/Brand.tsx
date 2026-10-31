export function Brand({ admin, className }: { admin?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 font-display font-extrabold text-lg text-white ${className || ""}`}>
      <span className="w-9 h-9 rounded-xl bg-lime text-on-lime flex items-center justify-center -rotate-6">
        <span className="material-symbols-outlined text-[20px]">check</span>
      </span>
      CHECKOU
      {admin && <span className="ml-auto font-sans text-[10.5px] font-extrabold bg-primary px-2 py-0.5 rounded-full">Admin</span>}
    </div>
  );
}
