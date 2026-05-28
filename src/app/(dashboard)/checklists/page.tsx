"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Template {
  id: string;
  icon: string;
  name: string;
  version: string;
  description: string;
  sections: { name: string; items: unknown[] }[];
}

export default function ChecklistsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("checklist_templates").select("id, icon, name, version, description, sections")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setTemplates(data || []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("checklist_templates").delete().eq("id", id);
    setTemplates(templates.filter((t) => t.id !== id));
    setDeleteConfirm(null);
  };

  const iconColors: Record<string, string> = {
    restaurant: "bg-orange-50 text-orange-600",
    cleaning_services: "bg-blue-50 text-blue-600",
    security: "bg-purple-50 text-purple-600",
    thermostat: "bg-red-50 text-red-600",
    inventory_2: "bg-green-50 text-green-600",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Gestão de Checklists</p>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">Templates de Verificação</h2>
        </div>
        <Link href="/checklists/novo">
          <Button variant="primary">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo Checklist
          </Button>
        </Link>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error text-[24px]">delete</span>
            </div>
            <h3 className="text-lg font-bold text-navy text-center mb-2">Excluir Template?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteConfirm)}>Excluir</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => {
          const secs = Array.isArray(tmpl.sections) ? tmpl.sections : [];
          const itemCount = secs.reduce((sum: number, s) => sum + (Array.isArray(s.items) ? s.items.length : 0), 0);
          const color = iconColors[tmpl.icon] || "bg-primary/5 text-primary";
          return (
            <Card key={tmpl.id} className="group relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                  <span className="material-symbols-outlined">{tmpl.icon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">v{tmpl.version}</Badge>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === tmpl.id ? null : tmpl.id)} className="p-1 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-outline text-[18px]">more_horiz</span>
                    </button>
                    {menuOpen === tmpl.id && (
                      <div className="absolute right-0 top-8 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-1 z-10 min-w-[160px]">
                        <button onClick={() => { setMenuOpen(null); router.push(`/checklists/novo?id=${tmpl.id}`); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">edit</span>Editar
                        </button>
                        <button onClick={() => { setMenuOpen(null); setDeleteConfirm(tmpl.id); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">delete</span>Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="text-base font-bold text-navy mb-1">{tmpl.name}</h3>
              <p className="text-xs text-on-surface-variant mb-4">{tmpl.description}</p>
              <div className="flex items-center gap-4 text-xs text-outline">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">folder</span>{secs.length} seções</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">checklist</span>{itemCount} itens</span>
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline-variant/10">
                <button onClick={() => router.push(`/checklists/novo?id=${tmpl.id}`)} className="flex-1 text-xs font-semibold text-on-surface-variant hover:text-primary py-2 rounded-lg hover:bg-primary/5 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">edit</span>Editar
                </button>
                <Link href={`/checklists/${tmpl.id}/execute`} className="flex-1 text-xs font-semibold text-primary py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all text-center cursor-pointer">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">play_arrow</span>Executar
                </Link>
              </div>
            </Card>
          );
        })}

        <Link href="/checklists/novo" className="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group min-h-[240px]">
          <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-outline text-[28px] group-hover:text-primary transition-colors">add</span>
          </div>
          <p className="text-sm font-semibold text-on-surface-variant group-hover:text-primary transition-colors">Criar Novo Template</p>
          <p className="text-xs text-outline mt-1">Adicione um novo checklist</p>
        </Link>
      </div>

      <FloatingActionButton onClick={() => router.push("/checklists/novo")} />
    </div>
  );
}
