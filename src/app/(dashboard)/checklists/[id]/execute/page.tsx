"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils/cn";

interface QuestionItem {
  id: string;
  section: string;
  question: string;
  instruction: string;
  answer?: "conform" | "non_conform";
  observation?: string;
  hasPhoto?: boolean;
}

const questions: QuestionItem[] = [
  { id: "1", section: "Recepção", question: "Área de recepção está limpa e organizada?", instruction: "Verificar piso, balcão e área de espera" },
  { id: "2", section: "Recepção", question: "Materiais de divulgação estão atualizados?", instruction: "Conferir cartazes, banners e cardápios" },
  { id: "3", section: "Cozinha", question: "Equipamentos foram higienizados?", instruction: "Verificar fogão, fritadeira, chapa e bancadas" },
  { id: "4", section: "Cozinha", question: "Temperatura da câmara fria está adequada?", instruction: "Verificar se está entre -18°C e -22°C. Registrar temperatura atual." },
  { id: "5", section: "Cozinha", question: "Alimentos armazenados corretamente?", instruction: "Verificar rotulagem, validade e organização" },
  { id: "6", section: "Cozinha", question: "Lixeiras estão limpas e identificadas?", instruction: "Conferir separação de resíduos e identificação" },
  { id: "7", section: "Salão", question: "Mesas e cadeiras estão limpas?", instruction: "Verificar todas as mesas e cadeiras do salão" },
  { id: "8", section: "Salão", question: "Iluminação está funcionando?", instruction: "Verificar todas as lâmpadas e pontos de luz" },
  { id: "9", section: "Banheiros", question: "Banheiros estão limpos e abastecidos?", instruction: "Verificar papel, sabonete, lixeiras" },
  { id: "10", section: "Banheiros", question: "Ralos estão limpos e sem obstrução?", instruction: "Verificar todos os ralos" },
  { id: "11", section: "Segurança", question: "Extintores estão no prazo de validade?", instruction: "Conferir data de validade e lacre" },
  { id: "12", section: "Segurança", question: "Saídas de emergência estão desobstruídas?", instruction: "Verificar todas as saídas e sinalização" },
];

export default function ExecuteChecklistPage() {
  const [currentIndex, setCurrentIndex] = useState(3); // Start at question 4
  const [answers, setAnswers] = useState<Record<string, QuestionItem["answer"]>>({
    "1": "conform",
    "2": "conform",
    "3": "non_conform",
  });
  const [observations, setObservations] = useState<Record<string, string>>({
    "3": "Equipamento da fritadeira apresenta resíduos de gordura acumulada. Necessário limpeza profunda urgente.",
  });
  const [showObservation, setShowObservation] = useState(false);
  const [observationText, setObservationText] = useState("");

  const current = questions[currentIndex];
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / questions.length) * 100;
  const conformCount = Object.values(answers).filter((a) => a === "conform").length;
  const nonConformCount = Object.values(answers).filter((a) => a === "non_conform").length;

  const handleAnswer = (answer: "conform" | "non_conform") => {
    setAnswers((prev) => ({ ...prev, [current.id]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowObservation(false);
      setObservationText("");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowObservation(false);
      setObservationText("");
    }
  };

  // Get sections with their items for desktop view
  const sections = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, QuestionItem[]>);

  return (
    <div>
      {/* ====== MOBILE VIEW ====== */}
      <div className="md:hidden space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
          </button>
          <Badge variant="success" className="gap-1.5">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            No local 15m
          </Badge>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-navy">Questão {String(currentIndex + 1).padStart(2, "0")} de {questions.length}</span>
            <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} color="primary" size="md" />
        </div>

        {/* Question card */}
        <Card className="!p-5">
          <Badge variant="info" className="mb-3">{current.section}</Badge>
          <h3 className="text-lg font-bold text-navy mb-2">{current.question}</h3>
          <p className="text-sm text-on-surface-variant">{current.instruction}</p>
        </Card>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAnswer("conform")}
            className={cn(
              "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all active:scale-[0.98] cursor-pointer",
              answers[current.id] === "conform"
                ? "border-tertiary bg-tertiary-fixed/10"
                : "border-outline-variant/20 bg-surface-container-lowest hover:border-tertiary/30"
            )}
          >
            <span className={cn("material-symbols-outlined text-[32px]", answers[current.id] === "conform" ? "text-tertiary filled" : "text-outline")}>
              check_circle
            </span>
            <span className="text-sm font-bold text-on-surface">Conforme</span>
          </button>
          <button
            onClick={() => handleAnswer("non_conform")}
            className={cn(
              "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all active:scale-[0.98] cursor-pointer",
              answers[current.id] === "non_conform"
                ? "border-error bg-error-container/20"
                : "border-outline-variant/20 bg-surface-container-lowest hover:border-error/30"
            )}
          >
            <span className={cn("material-symbols-outlined text-[32px]", answers[current.id] === "non_conform" ? "text-error filled" : "text-outline")}>
              cancel
            </span>
            <span className="text-sm font-bold text-on-surface">Não Conforme</span>
          </button>
        </div>

        {/* Non-conform action */}
        {answers[current.id] === "non_conform" && (
          <Button variant="primary" className="w-full">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Gerar Tarefa de Manutenção
          </Button>
        )}

        {/* Evidence buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            Foto
          </button>
          <button
            onClick={() => setShowObservation(!showObservation)}
            className="flex items-center justify-center gap-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
            Observação
          </button>
        </div>

        {/* Observation input */}
        {showObservation && (
          <div className="space-y-3">
            <textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="Descreva a observação..."
              className="w-full bg-surface-container-low rounded-xl p-4 text-sm text-on-surface placeholder:text-outline border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
            />
          </div>
        )}

        {/* Existing observation for non-conform */}
        {observations[current.id] && (
          <div className="border-l-4 border-error bg-error-container/10 rounded-r-xl p-4">
            <p className="text-sm italic text-on-surface-variant">{observations[current.id]}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-low transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back_ios_new</span>
          </button>
          <Button onClick={handleNext} disabled={currentIndex === questions.length - 1}>
            Próxima
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Button>
        </div>
      </div>

      {/* ====== DESKTOP VIEW ====== */}
      <div className="hidden md:block space-y-6">
        {/* Header bento */}
        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Execução em Andamento</p>
                <h2 className="text-2xl font-extrabold text-navy tracking-tight">Abertura de Restaurante</h2>
              </div>
              <Badge variant="success" className="gap-1.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                No local — Unidade Centro
              </Badge>
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

          <div className="col-span-4 bg-navy rounded-xl p-6 text-white flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Tempo de Execução</p>
              <p className="text-3xl font-black mt-2 font-mono">00:24:12</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-white/60">Itens respondidos</span>
                <span className="font-bold">{totalAnswered}/{questions.length}</span>
              </div>
              <Button variant="primary" className="w-full">
                Finalizar e Enviar
                <span className="material-symbols-outlined text-[18px]">send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {Object.entries(sections).map(([sectionName, items], sIdx) => {
            const sectionAnswered = items.filter((i) => answers[i.id]).length;
            const allAnswered = sectionAnswered === items.length;
            const isFuture = items.every((i) => !answers[i.id]) && sIdx > 1;

            return (
              <Card key={sectionName} className={cn(isFuture && "opacity-70 border-dashed")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-navy">{sectionName}</h3>
                    <span className="text-xs text-outline">{sectionAnswered}/{items.length} itens</span>
                    {allAnswered && (
                      <span className="material-symbols-outlined text-tertiary text-[18px] filled">check_circle</span>
                    )}
                  </div>
                  {isFuture && <span className="text-xs text-outline italic">Aguardando Execução</span>}
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all",
                        answers[item.id] === "non_conform" && "border-error/30 bg-error-container/5",
                        answers[item.id] === "conform" && "border-tertiary/20 bg-tertiary-fixed/5",
                        !answers[item.id] && "border-outline-variant/10 bg-surface-container-lowest"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface">{item.question}</p>
                        <p className="text-xs text-outline mt-0.5">{item.instruction}</p>
                        {observations[item.id] && (
                          <p className="text-xs italic text-error mt-2 border-l-2 border-error pl-2">{observations[item.id]}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-outline text-[18px]">photo_camera</span>
                        </button>
                        <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-outline text-[18px]">chat_bubble</span>
                        </button>
                        <button
                          onClick={() => { setAnswers((p) => ({ ...p, [item.id]: "conform" })); }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            answers[item.id] === "conform"
                              ? "bg-tertiary text-white"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary"
                          )}
                        >
                          Conforme
                        </button>
                        <button
                          onClick={() => { setAnswers((p) => ({ ...p, [item.id]: "non_conform" })); }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            answers[item.id] === "non_conform"
                              ? "bg-error text-white"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-error/10 hover:text-error"
                          )}
                        >
                          Não Conforme
                        </button>
                        {answers[item.id] === "non_conform" && (
                          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer">
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                            GERAR TAREFA
                          </button>
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
