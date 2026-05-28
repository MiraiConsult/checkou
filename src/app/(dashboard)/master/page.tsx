"use client";

import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function MasterDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-navy tracking-tight">Dashboard Master</h1>
        <p className="text-sm text-on-surface-variant mt-1">Visão consolidada de toda a plataforma</p>
      </div>

      <Card className="text-center py-16">
        <span className="material-symbols-outlined text-outline text-[56px] mb-4">admin_panel_settings</span>
        <h3 className="text-lg font-bold text-navy mb-2">Área administrativa</h3>
        <p className="text-sm text-on-surface-variant mb-6">Este painel será habilitado para administradores da plataforma</p>
        <Link href="/" className="text-sm text-primary font-semibold hover:underline">Voltar ao Dashboard</Link>
      </Card>
    </div>
  );
}
