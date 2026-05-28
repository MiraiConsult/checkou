"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface QuestionItem {
  id: string;
  section: string;
  question: string;
  required_evidence: boolean;
}

interface TemplateData {
  id: string;
  name: string;
  sections: { name: string; items: { id: string; question: string; required_evidence: boolean }[] }[];
}

export default function ExecuteChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<Record<string, "conform" | "non_conform">>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, boolean>>({});
  const [desktopObsId, setDesktopObsId] = useState<string | null>(null);
  const [desktopObsText, setDesktopObsText] = useState("");
  const [taskGenerated, setTaskGenerated] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [photoTargetId, setPhotoTargetId] = useState<string | null>(null);

  // Load template from Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase.from("checklist_templates").select("id, name, sections").eq("id", templateId).single()
      .then(({ data }) => {
        if (!data) { router.push("/checklists"); return; }
        setTemplate(data as TemplateData);
        const qs: QuestionItem[] = [];
        const secs = Array.isArray(data.sections) ? data.sections : [];
        secs.forEach((sec: { name: string; items: { id: string; question: string; required_evidence: boolean }[] }) => {
          (sec.items || []).forEach((item) => {
            qs.push({ id: item.id, section: sec.name, question: item.question, required_evidence: item.required_evidence });
          });
        });
        setQuestions(qs);
        setLoading(false);
      });
  }, [templateId, router]);

  const totalAnswered = Object.keys(answers).length;
  const progress = questions.length > 0 ? (totalAnswered / questions.length) * 100 : 0;
  const conformCount = Object.values(answers).filter((a) => a === "conform").length;
  const nonConformCount = Object.values(answers).filter((a) => a === "non_conform").length;

  const sections = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, QuestionItem[]>);

  const handlePhotoClick = (itemId: string) => {
    setPhotoTargetId(itemId);
    fileInputRef.current?.click();
  };

  const handleFileChange = () => {
    if (photoTargetId) {
      setPhotos((prev) => ({ ...prev, [photoTargetId]: true }));
      setPhotoTargetId(null);
    }
  };

  const handleSubmit = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const score = totalAnswered > 0 ? Math.round((conformCount / totalAnswered) * 100) : 0;
    const responses = Object.entries(answers).map(([itemId, answer]) => ({
      item_id: itemId,
      answer,
      observation: observations[itemId] || null,
    }));

    // Get first unit for this org (or null)
    const { data: units } = await supabase.from("units").select("id").limit(1);
    const unitId = units?.[0]?.id;

    if (unitId) {
      await supabase.from("checklist_executions").insert({
        template_id: templateId,
        unit_id: unitId,
        operator_id: user.id,
        status: "completed",
        score,
        responses,
        completed_at: new Date().toISOString(),
      });
    }

    setSubmitted(true);
    setTimeout(() => router.push("/checklists"), 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-tertiary-fixed/20 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary text-[40px] filled">check_circle</span>
        </div>
        <h2 className="text-2xl font-extrabold text-navy">Checklist Enviado!</h2>
        <p className="text-sm text-on-surface-variant">Score: {totalAnswered > 0 ? Math.round((conformCount / totalAnswered) * 100) : 0}% de conformidade</p>
        <p className="text-xs text-outline">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      {/* Desktop view */}
      <div className="space-y-6">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Execução em Andamento</p>
                <h2 className="text-2xl font-extrabold text-navy tracking-tight">{template?.name}</h2>
              </div>
              <button onClick={() => router.push("/checklists")} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-on-surface-variant">Progresso geral</span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} color="primary" size="lg" />
            <div className="flex items-center gap-6 mt-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary" /> {conformCount} Conformes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> {nonConformCount} Não Conformes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-outline-variant" /> {questions.length - totalAnswered} Pendentes</span>
            </div>
          </Card>

          <div className="md:col-span-4 bg-navy rounded-xl p-6 text-white flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Itens respondidos</p>
              <p className="text-3xl font-black mt-2">{totalAnswered}/{questions.length}</p>
            </div>
            <Button variant="primary" className="w-full mt-4" onClick={handleSubmit}>
              Finalizar e Enviar
              <span className="material-symbols-outlined text-[18px]">send</span>
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {Object.entries(sections).map(([sectionName, items]) => {
            const sectionAnswered = items.filter((i) => answers[i.id]).length;
            const allAnswered = sectionAnswered === items.length;

            return (
              <Card key={sectionName}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-navy">{sectionName}</h3>
                    <span className="text-xs text-outline">{sectionAnswered}/{items.length} itens</span>
                    {allAnswered && <span className="material-symbols-outlined text-tertiary text-[18px] filled">check_circle</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border transition-all",
                        answers[item.id] === "non_conform" && "border-error/30 bg-error-container/5",
                        answers[item.id] === "conform" && "border-tertiary/20 bg-tertiary-fixed/5",
                        !answers[item.id] && "border-outline-variant/10 bg-surface-container-lowest"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface">{item.question}</p>
                        {observations[item.id] && (
                          <p className="text-xs italic text-error mt-2 border-l-2 border-error pl-2">{observations[item.id]}</p>
                        )}
                        {desktopObsId === item.id && (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text" value={desktopObsText}
                              onChange={(e) => setDesktopObsText(e.target.value)}
                              placeholder="Adicionar observação..."
                              className="flex-1 bg-surface-container-low rounded-lg px-3 py-1.5 text-xs text-on-surface border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20"
                              onKeyDown={(e) => { if (e.key === "Enter" && desktopObsText.trim()) { setObservations((p) => ({ ...p, [item.id]: desktopObsText })); setDesktopObsId(null); setDesktopObsText(""); } }}
                            />
                            <button onClick={() => { if (desktopObsText.trim()) setObservations((p) => ({ ...p, [item.id]: desktopObsText })); setDesktopObsId(null); setDesktopObsText(""); }} className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg cursor-pointer">Salvar</button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handlePhotoClick(item.id)} className={cn("p-2 rounded-lg transition-colors cursor-pointer", photos[item.id] ? "bg-tertiary-fixed/10 text-tertiary" : "hover:bg-surface-container-low text-outline")}>
                          <span className="material-symbols-outlined text-[18px]">{photos[item.id] ? "check_circle" : "photo_camera"}</span>
                        </button>
                        <button onClick={() => { setDesktopObsId(desktopObsId === item.id ? null : item.id); setDesktopObsText(observations[item.id] || ""); }} className={cn("p-2 rounded-lg transition-colors cursor-pointer", observations[item.id] ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-outline")}>
                          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        </button>
                        <button onClick={() => setAnswers((p) => ({ ...p, [item.id]: "conform" }))} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer", answers[item.id] === "conform" ? "bg-tertiary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary")}>
                          Conforme
                        </button>
                        <button onClick={() => setAnswers((p) => ({ ...p, [item.id]: "non_conform" }))} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer", answers[item.id] === "non_conform" ? "bg-error text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-error/10 hover:text-error")}>
                          Não Conforme
                        </button>
                        {answers[item.id] === "non_conform" && (
                          taskGenerated[item.id] ? (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-tertiary-fixed/20 text-tertiary flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] filled">check_circle</span>TAREFA GERADA
                            </span>
                          ) : (
                            <button onClick={() => setTaskGenerated((p) => ({ ...p, [item.id]: true }))} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer">
                              <span className="material-symbols-outlined text-[14px]">bolt</span>GERAR TAREFA
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
