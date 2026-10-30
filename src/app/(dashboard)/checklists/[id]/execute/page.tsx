"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/lib/utils/activity";
import { CameraCapture } from "@/components/ui/CameraCapture";
import { RichText } from "@/components/ui/RichText";
import type { ChecklistResponse, ChecklistSectionItem } from "@/lib/types/checklist";
import { computeScore, defaultScale, groupBySubsection, scaleValues, subsectionNumbers } from "@/lib/utils/checklist";

interface QuestionItem extends ChecklistSectionItem {
  section: string;
}

interface TemplateData {
  id: string;
  name: string;
  sections: { name: string; items: ChecklistSectionItem[] }[];
  requires_approval?: boolean;
  allow_gallery?: boolean;
  unit_ids?: string[];
}

type Answer = Pick<ChecklistResponse, "answer" | "value">;

export default function ExecuteChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const startedAt = useRef<string | null>(null);
  const answeredAt = useRef<Record<string, string>>({});

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [cameraTargetId, setCameraTargetId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [desktopObsId, setDesktopObsId] = useState<string | null>(null);
  const [desktopObsText, setDesktopObsText] = useState("");
  const [taskGenerated, setTaskGenerated] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [photoTargetId, setPhotoTargetId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Load template from Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase.from("checklist_templates").select("id, name, sections, requires_approval, allow_gallery, unit_ids").eq("id", templateId).single()
      .then(({ data }) => {
        if (!data) { router.push("/checklists"); return; }
        startedAt.current = new Date().toISOString();
        setTemplate(data as TemplateData);
        const linkedUnits: string[] = data.unit_ids || [];
        setSelectedUnit(linkedUnits[0] || "");
        if (linkedUnits.length > 1) {
          supabase.from("units").select("id, name").in("id", linkedUnits).then(({ data: rows }) => setUnits(rows || []));
        }
        const qs: QuestionItem[] = [];
        const secs = Array.isArray(data.sections) ? data.sections : [];
        secs.forEach((sec: { name: string; items: ChecklistSectionItem[] }) => {
          (sec.items || []).forEach((item) => {
            qs.push({ ...item, section: sec.name });
          });
        });
        setQuestions(qs);
        setLoading(false);
      });
  }, [templateId, router]);

  const answerItem = (itemId: string, answer: Answer) => {
    answeredAt.current[itemId] = new Date().toISOString();
    setAnswers((p) => ({ ...p, [itemId]: answer }));
  };

  const totalAnswered = Object.keys(answers).length;
  const progress = questions.length > 0 ? (totalAnswered / questions.length) * 100 : 0;
  const conformCount = Object.values(answers).filter((a) => a.answer === "conform").length;
  const nonConformCount = Object.values(answers).filter((a) => a.answer === "non_conform").length;
  const responseList = Object.entries(answers).map(([item_id, a]) => ({ item_id, ...a }));
  const { score, scaleAverage, scaleMax } = computeScore(questions, responseList);

  const sections = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, QuestionItem[]>);

  const handlePhotoClick = (itemId: string) => {
    setUploadError("");
    if (template?.allow_gallery) {
      setPhotoTargetId(itemId);
      fileInputRef.current?.click();
    } else {
      setCameraTargetId(itemId);
    }
  };

  const uploadPhoto = async (itemId: string, photo: Blob, extension: string, index: number) => {
    const supabase = createClient();
    const path = `${templateId}/${itemId}_${Date.now()}_${index}.${extension}`;
    const { error } = await supabase.storage.from("evidence").upload(path, photo);
    if (error) {
      setUploadError("Não foi possível enviar a foto. Verifique a internet e tente de novo.");
      return;
    }
    const { data: urlData } = supabase.storage.from("evidence").getPublicUrl(path);
    setPhotos((prev) => ({ ...prev, [itemId]: [...(prev[itemId] || []), urlData.publicUrl] }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !photoTargetId) return;
    setUploading(true);
    await Promise.all(files.map((file, index) => uploadPhoto(photoTargetId, file, file.name.split(".").pop() || "jpg", index)));
    setUploading(false);
    setPhotoTargetId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCameraCapture = async (photo: Blob) => {
    if (!cameraTargetId) return;
    const itemId = cameraTargetId;
    setCameraTargetId(null);
    setUploading(true);
    await uploadPhoto(itemId, photo, "jpg", 0);
    setUploading(false);
  };

  const removePhoto = (itemId: string, url: string) => {
    setPhotos((prev) => ({ ...prev, [itemId]: (prev[itemId] || []).filter((photo) => photo !== url) }));
  };

  const missingPhotos = questions.filter((q) => q.required_evidence && answers[q.id] && !photos[q.id]?.length);
  const canSubmit = totalAnswered === questions.length && missingPhotos.length === 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!password.trim()) {
      setPasswordError("Digite sua senha para confirmar.");
      return;
    }
    const supabase = createClient();

    // Verify password via signInWithPassword
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password,
    });
    if (signInError) {
      setPasswordError("Senha incorreta. Tente novamente.");
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const responses = Object.entries(answers).map(([itemId, { answer, value }]) => ({
      item_id: itemId,
      answer,
      value: value ?? null,
      observation: observations[itemId] || null,
      evidence_urls: photos[itemId] || [],
      evidence_url: photos[itemId]?.[0] || null,
      answered_at: answeredAt.current[itemId] || null,
    }));

    // Capture geolocation (best effort)
    let geolocation: { lat: number; lng: number } | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      geolocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch { /* geolocation optional */ }

    const unitId = user?.unit_id || selectedUnit || null;

    // If template requires approval, goes to pending queue; else auto-approved
    const status = template?.requires_approval ? "completed" : "approved";

    const { error: insertError } = await supabase.from("checklist_executions").insert({
      template_id: templateId,
      unit_id: unitId,
      operator_id: authUser.id,
      status,
      score,
      responses,
      geolocation,
      started_at: startedAt.current,
      completed_at: new Date().toISOString(),
      ...(status === "approved" ? { approved_at: new Date().toISOString() } : {}),
    });
    if (insertError) {
      setPasswordError("Não foi possível enviar o checklist. Tente de novo.");
      return;
    }

    // Log activity
    if (user?.organization_id) {
      await logActivity({
        organizationId: user.organization_id,
        userId: authUser.id,
        userName: user.name,
        action: "execution_completed",
        entityType: "checklist_execution",
        description: `respondeu o checklist "${template?.name}" (score ${score}%)`,
      });
    }

    setShowPasswordModal(false);
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
        <p className="text-sm text-on-surface-variant">
          {scaleAverage !== null ? `Nota: ${scaleAverage.toFixed(1).replace(".", ",")} de ${scaleMax}` : `Score: ${score}% de conformidade`}
        </p>
        <p className="text-xs text-outline">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
      {cameraTargetId && <CameraCapture onCapture={handleCameraCapture} onClose={() => setCameraTargetId(null)} />}

      {/* Password confirmation modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-[24px]">lock</span>
            </div>
            <h3 className="text-lg font-bold text-navy text-center mb-2">Confirmar Identidade</h3>
            <p className="text-sm text-on-surface-variant text-center mb-4">
              Digite sua senha para confirmar o envio do checklist.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
              placeholder="Sua senha"
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all mb-2"
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirmSubmit(); }}
              autoFocus
            />
            {passwordError && (
              <p className="text-xs text-error mb-3">{passwordError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
              <Button variant="primary" className="flex-1" onClick={handleConfirmSubmit}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop view */}
      <div className="space-y-6">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Execução em Andamento</p>
                <h2 className="text-2xl font-extrabold text-navy tracking-tight">{template?.name}</h2>
                {user && (
                  <p className="text-sm text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">person</span>
                    Operador: <span className="font-semibold text-navy">{user.name}</span>
                  </p>
                )}
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
            {!user?.unit_id && units.length > 1 && (
              <label className="flex items-center gap-2 mt-4 text-sm text-on-surface-variant">
                Empresa:
                <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="bg-surface-container-low rounded-lg px-3 py-1.5 text-sm text-on-surface border border-outline-variant/10 outline-none">
                  {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                </select>
              </label>
            )}
            <div className="flex items-center gap-6 mt-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary" /> {conformCount} Conformes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> {nonConformCount} Não Conformes</span>
              {scaleAverage !== null && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Nota {scaleAverage.toFixed(1).replace(".", ",")}</span>}
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-outline-variant" /> {questions.length - totalAnswered} Pendentes</span>
            </div>
          </Card>

          <div className="md:col-span-4 bg-navy rounded-xl p-6 text-white flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Itens respondidos</p>
              <p className="text-3xl font-black mt-2">{totalAnswered}/{questions.length}</p>
            </div>
            <Button variant="primary" className="w-full mt-4" onClick={handleSubmit} disabled={!canSubmit}>
              Finalizar e Enviar
              <span className="material-symbols-outlined text-[18px]">send</span>
            </Button>
            {!canSubmit && totalAnswered > 0 && (
              <p className="text-[10px] text-white/50 mt-2 text-center">
                {totalAnswered < questions.length
                  ? `Responda todos os ${questions.length} itens`
                  : `${missingPhotos.length} foto(s) obrigatória(s) pendente(s)`}
              </p>
            )}
          </div>
        </div>

        {uploadError && <p className="text-sm text-error font-medium">{uploadError}</p>}

        {/* Sections */}
        <div className="space-y-6">
          {Object.entries(sections).map(([sectionName, items], sIdx) => {
            const sectionAnswered = items.filter((i) => answers[i.id]).length;
            const allAnswered = sectionAnswered === items.length;
            const groups = groupBySubsection(items);
            const numbers = subsectionNumbers(groups, sIdx + 1);

            return (
              <Card key={sectionName}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{sIdx + 1}</span>
                    </div>
                    <h3 className="text-base font-bold text-navy">{sectionName}</h3>
                    <span className="text-xs text-outline">{sectionAnswered}/{items.length} itens</span>
                    {allAnswered && <span className="material-symbols-outlined text-tertiary text-[18px] filled">check_circle</span>}
                  </div>
                </div>

                <div className="space-y-5">
                  {groups.map((group) => (
                    <div key={group.key} className="space-y-3">
                      {group.name !== null && (
                        <h4 className="text-sm font-bold text-navy">
                          <span className="text-primary mr-2">{numbers[group.key]}</span>{group.name}
                        </h4>
                      )}
                      {group.items.map((item) => {
                        const current = answers[item.id];
                        const responseType = item.response_type || "conform";
                        const itemPhotos = photos[item.id] || [];
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "flex flex-col gap-3 p-4 rounded-xl border transition-all",
                              current?.answer === "non_conform" && "border-error/30 bg-error-container/5",
                              (current?.answer === "conform" || current?.answer === "scale") && "border-tertiary/20 bg-tertiary-fixed/5",
                              !current && "border-outline-variant/10 bg-surface-container-lowest"
                            )}
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-on-surface"><RichText text={item.question} /></p>
                                {item.required_evidence && (
                                  <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full", itemPhotos.length > 0 ? "bg-tertiary-fixed/20 text-tertiary" : "bg-amber-100 text-amber-700")}>
                                    <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                                    {itemPhotos.length > 0 ? "OK" : "Obrigatória"}
                                  </span>
                                )}
                              </div>
                              {item.help && <p className="text-xs text-on-surface-variant mt-1"><RichText text={item.help} /></p>}
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

                            {itemPhotos.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {itemPhotos.map((url) => (
                                  <div key={url} className="relative">
                                    <img src={url} alt="Evidência" className="w-14 h-14 rounded-lg object-cover border border-outline-variant/20" />
                                    <button onClick={() => removePhoto(item.id, url)} aria-label="Remover foto" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center cursor-pointer">
                                      <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              <button onClick={() => handlePhotoClick(item.id)} disabled={uploading} aria-label="Adicionar foto" className={cn("p-2 rounded-lg transition-colors cursor-pointer", itemPhotos.length > 0 ? "bg-tertiary-fixed/10 text-tertiary" : "hover:bg-surface-container-low text-outline")}>
                                <span className={cn("material-symbols-outlined text-[18px]", uploading && "animate-spin")}>{uploading ? "progress_activity" : "add_a_photo"}</span>
                              </button>
                              <button onClick={() => { setDesktopObsId(desktopObsId === item.id ? null : item.id); setDesktopObsText(observations[item.id] || ""); }} aria-label="Observação" className={cn("p-2 rounded-lg transition-colors cursor-pointer", observations[item.id] ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-outline")}>
                                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                              </button>

                              {responseType === "conform" && (
                                <>
                                  <button onClick={() => answerItem(item.id, { answer: "conform" })} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer", current?.answer === "conform" ? "bg-tertiary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary")}>
                                    Conforme
                                  </button>
                                  <button onClick={() => answerItem(item.id, { answer: "non_conform" })} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer", current?.answer === "non_conform" ? "bg-error text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-error/10 hover:text-error")}>
                                    Não Conforme
                                  </button>
                                </>
                              )}

                              {responseType === "multiple_choice" && (item.options || []).map((option) => (
                                <button key={option.label} onClick={() => answerItem(item.id, { answer: option.conform ? "conform" : "non_conform", value: option.label })} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer", current?.value === option.label ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary")}>
                                  {option.label}
                                </button>
                              ))}

                              {responseType === "scale" && scaleValues(item.scale || defaultScale).map((value) => (
                                <button key={value} onClick={() => answerItem(item.id, { answer: "scale", value })} className={cn("min-w-9 h-9 px-2 rounded-lg text-sm font-bold transition-all cursor-pointer", current?.value === value ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary")}>
                                  {value}
                                </button>
                              ))}

                              {current?.answer === "non_conform" && (
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
                        );
                      })}
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
