"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { modelTemplates } from "@/lib/data/templates";
import { useAuth } from "@/hooks/useAuth";

interface Template {
  id: string;
  icon: string;
  name: string;
  version: string;
  description: string;
  sections: { name: string; items: unknown[] }[];
  status: string;
}

export default function ChecklistsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showModels, setShowModels] = useState(false);
  const [copying, setCopying] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { user } = useAuth();

  const copyModel = async (index: number) => {
    if (!user?.organization_id) return;
    setCopying(index);
    const model = modelTemplates[index];
    const supabase = createClient();
    const { data } = await supabase.from("checklist_templates").insert({
      organization_id: user.organization_id,
      name: model.name,
      description: model.description,
      icon: model.icon,
      version: "1.0",
      sections: model.sections,
      status: "published",
    }).select("id, icon, name, version, description, sections, status").single();
    if (data) setTemplates([data, ...templates]);
    setCopying(null);
    setShowModels(false);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.from("checklist_templates").select("id, icon, name, version, description, sections, status")
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
                  {tmpl.status === "draft" && <Badge variant="warning">Rascunho</Badge>}
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

      {/* Model preview modal */}
      {previewIndex !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreviewIndex(null)}>
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/10 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[modelTemplates[previewIndex].icon] || "bg-primary/5 text-primary"}`}>
                  <span className="material-symbols-outlined text-[20px]">{modelTemplates[previewIndex].icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy">{modelTemplates[previewIndex].name}</h3>
                  <p className="text-xs text-on-surface-variant">{modelTemplates[previewIndex].description}</p>
                </div>
              </div>
              <button onClick={() => setPreviewIndex(null)} className="p-2 hover:bg-surface-container-low rounded-lg cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {modelTemplates[previewIndex].sections.map((sec, sIdx) => (
                <div key={sIdx}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{sIdx + 1}</span>
                    </div>
                    <h4 className="text-sm font-bold text-navy">{sec.name}</h4>
                    <span className="text-[10px] text-outline">{sec.items.length} itens</span>
                  </div>
                  <div className="space-y-1.5 ml-8">
                    {sec.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="text-[10px] text-outline w-4">{iIdx + 1}.</span>
                        <span>{item.question}</span>
                        {item.required_evidence && (
                          <span className="material-symbols-outlined text-amber-500 text-[14px]">photo_camera</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant/10 p-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPreviewIndex(null)}>Fechar</Button>
              <Button variant="primary" className="flex-1" onClick={() => { copyModel(previewIndex); setPreviewIndex(null); }} disabled={copying === previewIndex}>
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Usar este modelo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Models library */}
      <div>
        <button onClick={() => setShowModels(!showModels)} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">{showModels ? "expand_less" : "auto_awesome"}</span>
          {showModels ? "Fechar modelos" : "Explorar modelos prontos"}
        </button>

        {showModels && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelTemplates.map((model, i) => {
              const totalItems = model.sections.reduce((sum, s) => sum + s.items.length, 0);
              return (
                <Card key={i} className="border-2 border-dashed border-primary/10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[model.icon] || "bg-primary/5 text-primary"}`}>
                      <span className="material-symbols-outlined text-[20px]">{model.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-navy">{model.name}</h4>
                      <p className="text-xs text-on-surface-variant">{model.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-outline mb-4">
                    <span>{model.sections.length} seções</span>
                    <span>{totalItems} itens</span>
                    <Badge variant="info">{model.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewIndex(i)}>
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Ver
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => copyModel(i)} disabled={copying === i}>
                      <span className="material-symbols-outlined text-[16px]">{copying === i ? "progress_activity" : "content_copy"}</span>
                      Usar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => router.push("/checklists/novo")} />
    </div>
  );
}
