"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils/cn";

const iconOptions = [
  "restaurant", "cleaning_services", "security", "thermostat", "inventory_2",
  "local_fire_department", "health_and_safety", "storefront", "warehouse",
  "kitchen", "food_bank", "pest_control", "engineering", "electric_bolt",
  "water_drop", "ac_unit", "local_shipping", "recycling",
];

interface SectionItem {
  id: string;
  question: string;
  required_evidence: boolean;
}

interface Section {
  id: string;
  name: string;
  items: SectionItem[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function NovoChecklistPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("fact_check");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    { id: generateId(), name: "", items: [{ id: generateId(), question: "", required_evidence: false }] },
  ]);

  const addSection = () => {
    setSections([...sections, {
      id: generateId(),
      name: "",
      items: [{ id: generateId(), question: "", required_evidence: false }],
    }]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const updateSectionName = (sectionId: string, value: string) => {
    setSections(sections.map((s) => s.id === sectionId ? { ...s, name: value } : s));
  };

  const addItem = (sectionId: string) => {
    setSections(sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: [...s.items, { id: generateId(), question: "", required_evidence: false }] }
        : s
    ));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setSections(sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: s.items.length > 1 ? s.items.filter((i) => i.id !== itemId) : s.items }
        : s
    ));
  };

  const updateItem = (sectionId: string, itemId: string, field: "question" | "required_evidence", value: string | boolean) => {
    setSections(sections.map((s) =>
      s.id === sectionId
        ? { ...s, items: s.items.map((i) => i.id === itemId ? { ...i, [field]: value } : i) }
        : s
    ));
  };

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const isValid = name.trim() !== "" && sections.every((s) => s.name.trim() !== "" && s.items.every((i) => i.question.trim() !== ""));

  const handleSave = () => {
    if (!isValid) return;
    // TODO: persist to Supabase
    router.push("/checklists");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/checklists")}
            className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
          </button>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Gestão de Checklists</p>
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">Novo Checklist</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/checklists")}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!isValid}>
            <span className="material-symbols-outlined text-[18px]">save</span>
            Salvar Template
          </Button>
        </div>
      </div>

      {/* Basic info */}
      <Card>
        <h3 className="text-lg font-bold text-navy mb-6">Informações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
          {/* Icon picker */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-2",
                showIconPicker ? "border-primary bg-primary/10" : "border-outline-variant/20 bg-primary/5 hover:border-primary/40"
              )}
            >
              <span className="material-symbols-outlined text-primary text-[36px]">{icon}</span>
            </button>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ícone</span>

            {showIconPicker && (
              <div className="absolute mt-24 z-10 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 p-3 grid grid-cols-6 gap-1.5 w-[240px]">
                {iconOptions.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => { setIcon(ic); setShowIconPicker(false); }}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors",
                      icon === ic ? "bg-primary text-white" : "hover:bg-surface-container-high text-on-surface-variant"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">{ic}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name and description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Nome do Checklist *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Abertura de Restaurante"
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo deste checklist..."
                rows={2}
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
              />
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
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{sIdx + 1}</span>
              </div>
              <input
                type="text"
                value={section.name}
                onChange={(e) => updateSectionName(section.id, e.target.value)}
                placeholder="Nome da seção (ex: Cozinha)"
                className="flex-1 bg-transparent text-base font-bold text-navy placeholder:text-outline/50 outline-none border-b border-transparent focus:border-primary/30 transition-colors pb-1"
              />
              {sections.length > 1 && (
                <button
                  onClick={() => removeSection(section.id)}
                  className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3">
              {section.items.map((item, iIdx) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/5 group"
                >
                  <span className="text-xs font-bold text-outline mt-2.5 w-6 text-center shrink-0">
                    {iIdx + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateItem(section.id, item.id, "question", e.target.value)}
                      placeholder="Pergunta de verificação..."
                      className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline/50 outline-none"
                    />
                    <div className="flex items-center gap-4">
                      <Toggle
                        checked={item.required_evidence}
                        onChange={(v) => updateItem(section.id, item.id, "required_evidence", v)}
                        label="Exige evidência fotográfica"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(section.id, item.id)}
                    className="p-1 rounded-lg text-outline hover:text-error hover:bg-error/5 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add item button */}
            <button
              onClick={() => addItem(section.id)}
              className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Adicionar Item
            </button>
          </Card>
        ))}
      </div>

      {/* Add section button */}
      <button
        onClick={addSection}
        className="w-full border-2 border-dashed border-outline-variant/30 rounded-xl py-6 flex items-center justify-center gap-2 text-sm font-semibold text-on-surface-variant hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Adicionar Nova Seção
      </button>

      {/* Bottom save bar */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <Button variant="outline" onClick={() => router.push("/checklists")}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={!isValid}>
          <span className="material-symbols-outlined text-[18px]">save</span>
          Salvar Template
        </Button>
      </div>
    </div>
  );
}
