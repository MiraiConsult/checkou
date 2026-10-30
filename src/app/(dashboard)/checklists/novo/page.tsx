"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { RichText } from "@/components/ui/RichText";
import type { ChecklistSectionItem, ResponseType } from "@/lib/types/checklist";
import { defaultScale, groupBySubsection, scaleValues, subsectionNumbers } from "@/lib/utils/checklist";
import { logActivity } from "@/lib/utils/activity";

const iconOptions = [
  "restaurant", "cleaning_services", "security", "thermostat", "inventory_2",
  "local_fire_department", "health_and_safety", "storefront", "warehouse",
  "kitchen", "food_bank", "pest_control", "engineering", "electric_bolt",
  "water_drop", "ac_unit", "local_shipping", "recycling",
];

type SectionItem = ChecklistSectionItem;

interface Section {
  id: string;
  name: string;
  items: SectionItem[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function newItem(subsection?: { subsection: string; subsection_id: string }): SectionItem {
  return { id: generateId(), question: "", required_evidence: false, response_type: "conform", ...subsection };
}

const responseTypes: { value: ResponseType; label: string }[] = [
  { value: "conform", label: "Conforme / Não conforme" },
  { value: "multiple_choice", label: "Múltipla escolha" },
  { value: "scale", label: "Escala (nota)" },
];

function isItemComplete(item: SectionItem) {
  if (!item.question.trim()) return true;
  if (item.response_type === "multiple_choice") return (item.options || []).filter((o) => o.label.trim()).length >= 2;
  if (item.response_type === "scale") return scaleValues(item.scale).length >= 2;
  return true;
}

function FormattedInput({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const wrap = (mark: string) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const hasSelection = end > start;
    const from = hasSelection ? start : 0;
    const to = hasSelection ? end : value.length;
    if (from === to) return;
    onChange(`${value.slice(0, from)}${mark}${value.slice(from, to)}${mark}${value.slice(to)}`);
  };

  return (
    <div className="flex items-center gap-1">
      <input ref={inputRef} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />
      <button type="button" title="Negrito" onMouseDown={(e) => { e.preventDefault(); wrap("**"); }} className="w-7 h-7 rounded-md text-sm font-black text-on-surface-variant hover:bg-surface-container-high cursor-pointer">B</button>
      <button type="button" title="Destacar" onMouseDown={(e) => { e.preventDefault(); wrap("=="); }} className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high cursor-pointer">
        <span className="material-symbols-outlined text-[16px]">ink_highlighter</span>
      </button>
    </div>
  );
}

export default function NovoChecklistPage() {
  return (
    <Suspense>
      <NovoChecklistContent />
    </Suspense>
  );
}

function NovoChecklistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { user } = useAuth();

  // Redirect non-admin users
  useEffect(() => {
    if (!user) return;
    if (!isStaff(user)) {
      router.push("/checklists");
    }
  }, [user, router]);

  const [dbId, setDbId] = useState<string | null>(editId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("fact_check");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [frequency, setFrequency] = useState("daily");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [sector, setSector] = useState("geral");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [allowGallery, setAllowGallery] = useState(false);
  const [unitIds, setUnitIds] = useState<string[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [sections, setSections] = useState<Section[]>([
    { id: generateId(), name: "", items: [newItem()] },
  ]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    createClient().from("units").select("id, name").order("name")
      .then(({ data }) => setUnits(data || []));
  }, []);

  // Load template from Supabase when editing
  useEffect(() => {
    if (!editId) return;
    const supabase = createClient();
    supabase.from("checklist_templates").select("*").eq("id", editId).single()
      .then(({ data }) => {
        if (data) {
          setName(data.name);
          setDescription(data.description);
          setIcon(data.icon);
          if (data.frequency) setFrequency(data.frequency);
          if (data.deadline_time) setDeadlineTime(data.deadline_time.slice(0, 5));
          if (data.sector) setSector(data.sector);
          if (typeof data.requires_approval === "boolean") setRequiresApproval(data.requires_approval);
          setAllowGallery(!!data.allow_gallery);
          setUnitIds(data.unit_ids || []);
          const secs = Array.isArray(data.sections) ? data.sections : [];
          if (secs.length > 0) {
            setSections(secs.map((s: { name: string; items: SectionItem[] }) => ({
              id: generateId(),
              name: s.name,
              items: (s.items || []).map((i: SectionItem) => ({
                ...i,
                id: i.id || generateId(),
                response_type: i.response_type || "conform",
              })),
            })));
          }
        }
      });
  }, [editId]);

  // Auto-save as draft
  const autoSave = useCallback(async (n: string, desc: string, ic: string, secs: Section[]) => {
    if (!user?.organization_id || !n.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: n,
      description: desc,
      icon: ic,
      frequency,
      deadline_time: deadlineTime || null,
      sector,
      requires_approval: requiresApproval,
      allow_gallery: allowGallery,
      unit_ids: unitIds,
      sections: secs.map((s) => ({ name: s.name, items: s.items })),
      organization_id: user.organization_id,
    };

    // Rascunho automático só na criação: editar não pode tirar um checklist publicado do cliente
    if (dbId) {
      await supabase.from("checklist_templates").update(payload).eq("id", dbId);
    } else {
      const { data } = await supabase.from("checklist_templates").insert({ ...payload, status: "draft" }).select("id").single();
      if (data) setDbId(data.id);
    }
    setSaving(false);
    setLastSaved(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  }, [dbId, user?.organization_id, frequency, deadlineTime, sector, requiresApproval, allowGallery, unitIds]);

  // Trigger auto-save on changes (debounced)
  useEffect(() => {
    if (!name.trim()) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => autoSave(name, description, icon, sections), 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [name, description, icon, sections, frequency, deadlineTime, sector, requiresApproval, allowGallery, unitIds, autoSave]);

  const isEditing = !!editId;

  const addSection = () => {
    setSections([...sections, {
      id: generateId(),
      name: "",
      items: [newItem()],
    }]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const updateSectionName = (sectionId: string, value: string) => {
    setSections(sections.map((s) => s.id === sectionId ? { ...s, name: value } : s));
  };

  const addItem = (sectionId: string, subsection?: { subsection: string; subsection_id: string }) => {
    setSections(sections.map((s) => {
      if (s.id !== sectionId) return s;
      if (!subsection) return { ...s, items: [...s.items, newItem()] };
      // Entra logo depois do último item da subseção
      const lastIndex = s.items.map((i) => i.subsection_id).lastIndexOf(subsection.subsection_id);
      const items = [...s.items];
      items.splice(lastIndex + 1, 0, newItem(subsection));
      return { ...s, items };
    }));
  };

  const addSubsection = (sectionId: string) => {
    setSections(sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: [...s.items, newItem({ subsection: "", subsection_id: generateId() })] }
        : s
    ));
  };

  const renameSubsection = (sectionId: string, subsectionId: string, value: string) => {
    setSections(sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: s.items.map((i) => i.subsection_id === subsectionId ? { ...i, subsection: value } : i) }
        : s
    ));
  };

  const removeSubsection = (sectionId: string, subsectionId: string) => {
    setSections(sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = s.items.filter((i) => i.subsection_id !== subsectionId);
      return { ...s, items: items.length > 0 ? items : [newItem()] };
    }));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setSections(sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: s.items.length > 1 ? s.items.filter((i) => i.id !== itemId) : s.items }
        : s
    ));
  };

  const updateItem = (sectionId: string, itemId: string, patch: Partial<SectionItem>) => {
    setSections(sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: s.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) }
        : s
    ));
  };

  const changeResponseType = (sectionId: string, item: SectionItem, responseType: ResponseType) => {
    updateItem(sectionId, item.id, {
      response_type: responseType,
      options: responseType === "multiple_choice" ? item.options || [{ label: "", conform: true }, { label: "", conform: false }] : item.options,
      scale: responseType === "scale" ? item.scale || defaultScale : item.scale,
    });
  };

  const toggleUnit = (id: string) => {
    setUnitIds(unitIds.includes(id) ? unitIds.filter((u) => u !== id) : [...unitIds, id]);
  };

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const incompleteItems = sections.reduce((sum, s) => sum + s.items.filter((i) => !isItemComplete(i)).length, 0);
  const isValid = name.trim() !== "" && sections.some((s) => s.name.trim() !== "") && incompleteItems === 0;

  const handlePublish = async () => {
    if (!isValid || !user?.organization_id) return;
    setSaving(true);
    const supabase = createClient();
    const cleanSections = sections
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name,
        items: s.items.filter((i) => i.question.trim()).map((i) => ({
          ...i,
          options: i.response_type === "multiple_choice" ? (i.options || []).filter((o) => o.label.trim()) : undefined,
          scale: i.response_type === "scale" ? i.scale : undefined,
        })),
      }));
    const payload = {
      name, description, icon, frequency,
      deadline_time: deadlineTime || null,
      sector,
      requires_approval: requiresApproval,
      allow_gallery: allowGallery,
      unit_ids: unitIds,
      sections: cleanSections,
      organization_id: user.organization_id,
      status: "published" as const,
    };
    if (dbId) {
      await supabase.from("checklist_templates").update(payload).eq("id", dbId);
    } else {
      await supabase.from("checklist_templates").insert(payload);
    }
    await logActivity({
      organizationId: user.organization_id,
      userId: user.id,
      userName: user.name,
      action: dbId ? "template_published" : "template_created",
      entityType: "checklist_template",
      entityId: dbId || undefined,
      description: `${dbId ? "editou e publicou" : "criou"} o template "${name}"`,
    });
    router.push("/checklists");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/checklists")} className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
          </button>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Gestão de Checklists</p>
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">
              {isEditing ? "Editar Checklist" : "Novo Checklist"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            {saving ? (
              <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>Salvando...</>
            ) : lastSaved ? (
              <><span className="material-symbols-outlined text-tertiary text-[14px]">cloud_done</span>Rascunho salvo às {lastSaved}</>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => router.push("/checklists")}>Cancelar</Button>
          <Button variant="primary" onClick={handlePublish} disabled={!isValid || saving}>
            <span className="material-symbols-outlined text-[18px]">publish</span>
            Publicar Template
          </Button>
        </div>
      </div>

      {/* Basic info */}
      <Card>
        <h3 className="text-lg font-bold text-navy mb-6">Informações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => setShowIconPicker(!showIconPicker)} className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-2", showIconPicker ? "border-primary bg-primary/10" : "border-outline-variant/20 bg-primary/5 hover:border-primary/40")}>
              <span className="material-symbols-outlined text-primary text-[36px]">{icon}</span>
            </button>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ícone</span>
            {showIconPicker && (
              <div className="absolute mt-24 z-10 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 p-3 grid grid-cols-6 gap-1.5 w-[240px]">
                {iconOptions.map((ic) => (
                  <button key={ic} onClick={() => { setIcon(ic); setShowIconPicker(false); }} className={cn("w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors", icon === ic ? "bg-primary text-white" : "hover:bg-surface-container-high text-on-surface-variant")}>
                    <span className="material-symbols-outlined text-[20px]">{ic}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Nome do Checklist *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Abertura de Restaurante" className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Descrição</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o objetivo deste checklist..." rows={2} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Periodicidade</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Prazo para responder</label>
                <input type="time" value={deadlineTime} onChange={(e) => setDeadlineTime(e.target.value)} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Setor responsável</label>
                <select value={sector} onChange={(e) => setSector(e.target.value)} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="geral">Geral (todos)</option>
                  <option value="gerencia">Gerência</option>
                  <option value="cozinha">Cozinha</option>
                  <option value="salao">Salão</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer bg-surface-container-low rounded-xl px-4 py-3 w-full border border-outline-variant/10">
                  <Toggle checked={requiresApproval} onChange={setRequiresApproval} />
                  <span className="text-sm font-medium text-on-surface">Exige aprovação do gestor</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer bg-surface-container-low rounded-xl px-4 py-3 w-full border border-outline-variant/10">
                  <Toggle checked={allowGallery} onChange={setAllowGallery} />
                  <span>
                    <span className="block text-sm font-medium text-on-surface">Permitir anexar foto da galeria</span>
                    <span className="block text-xs text-on-surface-variant">Desligado: a foto só pode ser tirada na hora, pela câmera do app</span>
                  </span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Empresas que recebem este checklist</label>
                {units.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Nenhuma empresa cadastrada. Cadastre em Configurações → Empresas / Unidades.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {units.map((unit) => (
                      <button key={unit.id} type="button" onClick={() => toggleUnit(unit.id)} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer", unitIds.includes(unit.id) ? "bg-primary text-white border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40")}>
                        <span className="material-symbols-outlined text-[16px]">{unitIds.includes(unit.id) ? "check" : "storefront"}</span>
                        {unit.name}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-outline mt-1.5">Usuários de uma empresa só veem os checklists vinculados a ela.</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary bar */}
      <div className="flex items-center gap-6 px-1">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">folder</span>
          <span className="font-bold text-navy">{sections.length}</span> {sections.length === 1 ? "seção" : "seções"}
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">checklist</span>
          <span className="font-bold text-navy">{totalItems}</span> {totalItems === 1 ? "item" : "itens"}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <Card key={section.id}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{sIdx + 1}</span>
              </div>
              <input type="text" value={section.name} onChange={(e) => updateSectionName(section.id, e.target.value)} placeholder="Nome da seção (ex: Cozinha)" className="flex-1 bg-transparent text-base font-bold text-navy placeholder:text-outline/50 outline-none border-b border-transparent focus:border-primary/30 transition-colors pb-1" />
              {sections.length > 1 && (
                <button onClick={() => removeSection(section.id)} className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/5 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
            <div className="space-y-5">
              {(() => {
                const groups = groupBySubsection(section.items);
                const numbers = subsectionNumbers(groups, sIdx + 1);
                return groups.map((group) => {
                  const subsection = group.name !== null ? { subsection: group.name, subsection_id: group.key } : undefined;
                  return (
                    <div key={group.key} className={cn(subsection && "pl-3 border-l-2 border-primary/20 space-y-3")}>
                      {subsection && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">{numbers[group.key]}</span>
                          <input type="text" value={group.name || ""} onChange={(e) => renameSubsection(section.id, group.key, e.target.value)} placeholder="Nome da subseção (ex: Utensílios)" className="flex-1 bg-transparent text-sm font-bold text-navy placeholder:text-outline/50 outline-none border-b border-transparent focus:border-primary/30 transition-colors pb-1" />
                          <button onClick={() => removeSubsection(section.id, group.key)} title="Excluir subseção" className="p-1 rounded-lg text-outline hover:text-error hover:bg-error/5 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      )}
                      <div className="space-y-3">
                        {group.items.map((item, iIdx) => {
                          const responseType = item.response_type || "conform";
                          return (
                            <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/5 group">
                              <span className="text-xs font-bold text-outline mt-2.5 w-6 text-center shrink-0">{iIdx + 1}</span>
                              <div className="flex-1 space-y-2 min-w-0">
                                <FormattedInput value={item.question} onChange={(v) => updateItem(section.id, item.id, { question: v })} placeholder="Pergunta de verificação..." className="flex-1 min-w-0 bg-transparent text-sm text-on-surface placeholder:text-outline/50 outline-none" />
                                {/[*=]{2}/.test(item.question) && (
                                  <p className="text-xs text-on-surface-variant">Prévia: <RichText text={item.question} /></p>
                                )}
                                <FormattedInput value={item.help || ""} onChange={(v) => updateItem(section.id, item.id, { help: v })} placeholder="Subtítulo ou instrução (opcional)" className="flex-1 min-w-0 bg-transparent text-xs text-on-surface-variant placeholder:text-outline/50 outline-none" />
                                <div className="flex flex-wrap items-center gap-4">
                                  <select value={responseType} onChange={(e) => changeResponseType(section.id, item, e.target.value as ResponseType)} className="bg-surface-container-low rounded-lg px-2 py-1.5 text-xs text-on-surface border border-outline-variant/10 outline-none">
                                    {responseTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                                  </select>
                                  <Toggle checked={item.required_evidence} onChange={(v) => updateItem(section.id, item.id, { required_evidence: v })} label="Exige evidência fotográfica" />
                                </div>
                                {responseType === "multiple_choice" && (
                                  <div className="space-y-2 pt-1">
                                    {(item.options || []).map((option, oIdx) => (
                                      <div key={oIdx} className="flex items-center gap-2">
                                        <input type="text" value={option.label} onChange={(e) => updateItem(section.id, item.id, { options: (item.options || []).map((o, i) => i === oIdx ? { ...o, label: e.target.value } : o) })} placeholder={`Opção ${oIdx + 1}`} className="flex-1 min-w-0 bg-surface-container-lowest rounded-lg px-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20" />
                                        <button type="button" onClick={() => updateItem(section.id, item.id, { options: (item.options || []).map((o, i) => i === oIdx ? { ...o, conform: !o.conform } : o) })} className={cn("px-2 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer", option.conform ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error")}>
                                          {option.conform ? "Conforme" : "Não conforme"}
                                        </button>
                                        <button type="button" onClick={() => updateItem(section.id, item.id, { options: (item.options || []).filter((_, i) => i !== oIdx) })} className="p-1 text-outline hover:text-error cursor-pointer">
                                          <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => updateItem(section.id, item.id, { options: [...(item.options || []), { label: "", conform: true }] })} className="text-xs font-semibold text-primary cursor-pointer">+ Adicionar opção</button>
                                    {!isItemComplete(item) && <p className="text-xs text-error">Cadastre pelo menos 2 opções.</p>}
                                  </div>
                                )}
                                {responseType === "scale" && (
                                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-on-surface-variant">
                                    {([["min", "De"], ["max", "Até"], ["step", "Sobe de"]] as const).map(([field, label]) => (
                                      <label key={field} className="flex items-center gap-1.5">
                                        {label}
                                        <input type="number" step="any" value={(item.scale || defaultScale)[field]} onChange={(e) => updateItem(section.id, item.id, { scale: { ...(item.scale || defaultScale), [field]: Number(e.target.value) } })} className="w-16 bg-surface-container-lowest rounded-lg px-2 py-1.5 text-xs text-on-surface border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20" />
                                      </label>
                                    ))}
                                    {!isItemComplete(item) && <span className="text-error">Confira os valores da escala.</span>}
                                  </div>
                                )}
                              </div>
                              <button onClick={() => removeItem(section.id, item.id)} className="p-1 rounded-lg text-outline hover:text-error hover:bg-error/5 transition-colors cursor-pointer md:opacity-0 md:group-hover:opacity-100">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      {subsection && (
                        <button onClick={() => addItem(section.id, subsection)} className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          Adicionar Item nesta subseção
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <button onClick={() => addItem(section.id)} className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Adicionar Item
              </button>
              <button onClick={() => addSubsection(section.id)} className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">subdirectory_arrow_right</span>
                Adicionar Subseção
              </button>
            </div>
          </Card>
        ))}
      </div>

      <button onClick={addSection} className="w-full border-2 border-dashed border-outline-variant/30 rounded-xl py-6 flex items-center justify-center gap-2 text-sm font-semibold text-on-surface-variant hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
        <span className="material-symbols-outlined text-[20px]">add</span>
        Adicionar Nova Seção
      </button>

      <div className="flex items-center justify-end gap-3 pb-4">
        <Button variant="outline" onClick={() => router.push("/checklists")}>Cancelar</Button>
        <Button variant="primary" onClick={handlePublish} disabled={!isValid || saving}>
          <span className="material-symbols-outlined text-[18px]">publish</span>
          Publicar Template
        </Button>
      </div>
    </div>
  );
}
