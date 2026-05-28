"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-[480px] mx-auto px-6 relative z-10 text-center">
        {/* Success animation */}
        <div className="relative inline-flex mb-8">
          <div className="w-28 h-28 bg-tertiary-fixed/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 bg-tertiary-fixed/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[48px] filled">check_circle</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-extrabold text-navy tracking-tight mb-3">
          Email Confirmado!
        </h1>
        <p className="text-base text-on-surface-variant mb-2">
          Sua conta foi verificada com sucesso.
        </p>
        <p className="text-sm text-outline mb-10">
          Você já pode acessar todas as funcionalidades do CHECKOU.
        </p>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-xl border border-outline-variant/10 mb-8">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-[24px]">fact_check</span>
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-navy">CHECKOU</h2>
              <p className="text-xs text-on-surface-variant">Gestão operacional inteligente</p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 bg-tertiary-fixed/10 rounded-xl">
              <span className="material-symbols-outlined text-tertiary text-[20px]">dashboard</span>
              <span className="text-sm text-on-surface">Dashboard com indicadores em tempo real</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
              <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
              <span className="text-sm text-on-surface">Checklists digitais personalizáveis</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-tertiary-fixed/10 rounded-xl">
              <span className="material-symbols-outlined text-tertiary text-[20px]">assignment</span>
              <span className="text-sm text-on-surface">Gestão de tarefas e aprovações</span>
            </div>
          </div>
        </div>

        {/* Redirect */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Acessar o Sistema
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <p className="text-xs text-outline mt-4">
          Redirecionando automaticamente em {countdown}s...
        </p>
      </div>
    </div>
  );
}
