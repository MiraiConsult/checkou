import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/approvals/ScoreRing";
import { RichText } from "@/components/ui/RichText";
import { cn } from "@/lib/utils/cn";
import type { ChecklistResponse, ChecklistSection } from "@/lib/types/checklist";
import { computeScore, groupBySubsection, responseEvidence, subsectionNumbers } from "@/lib/utils/checklist";

export interface ReportData {
  score: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  responses: ChecklistResponse[];
  geolocation: { lat: number; lng: number } | null;
  template_name: string;
  sections: ChecklistSection[];
  operator_name: string;
  operator_email?: string;
  unit_name?: string | null;
}

const statusLabel: Record<string, { label: string; variant: "success" | "error" | "info" | "pending" }> = {
  completed: { label: "Concluído", variant: "info" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Reprovado", variant: "error" },
  in_progress: { label: "Em Andamento", variant: "pending" },
};

const dateTime = (value: string) => new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const clock = (value: string) => new Date(value).toLocaleTimeString("pt-BR");

function duration(start: string, end: string) {
  const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (minutes < 1) return "menos de 1 min";
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

export function ExecutionReport({ report, actions }: { report: ReportData; actions?: ReactNode }) {
  const answersMap = new Map(report.responses.map((r) => [r.item_id, r]));
  const initials = report.operator_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const status = statusLabel[report.status] || statusLabel.completed;
  const conformCount = report.responses.filter((r) => r.answer === "conform").length;
  const nonConformCount = report.responses.filter((r) => r.answer === "non_conform").length;
  const { scaleAverage, scaleMax } = computeScore(report.sections.flatMap((sec) => sec.items), report.responses);
  // Execuções antigas não têm horário por questão e gravavam o início igual ao fim
  const hasTimes = report.responses.some((r) => r.answered_at);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Resultado da Execução</p>
          <h2 className="text-2xl font-extrabold text-navy tracking-tight">{report.template_name}</h2>
          {report.unit_name && <p className="text-sm text-on-surface-variant mt-1">{report.unit_name}</p>}
        </div>
        <Badge variant={status.variant} className="text-sm px-3 py-1">{status.label}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6">
        <Card className="md:col-span-4 print:col-span-4 flex flex-col items-center justify-center py-6">
          <ScoreRing score={report.score} size={100} strokeWidth={8} />
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-3">Score de Conformidade</p>
        </Card>

        <Card className="md:col-span-4 print:col-span-4">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Operador</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{report.operator_name}</p>
                  {report.operator_email && <p className="text-xs text-on-surface-variant">{report.operator_email}</p>}
                </div>
              </div>
            </div>
            {hasTimes && (
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Início</p>
                <p className="text-sm text-navy mt-1">{dateTime(report.started_at)}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{hasTimes ? "Término" : "Data"}</p>
              <p className="text-sm text-navy mt-1">
                {dateTime(report.completed_at || report.started_at)}
                {hasTimes && report.completed_at && <span className="text-on-surface-variant"> ({duration(report.started_at, report.completed_at)})</span>}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Localização</p>
              {report.geolocation ? (
                <a href={`https://www.google.com/maps?q=${report.geolocation.lat},${report.geolocation.lng}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-semibold hover:underline">
                  {report.geolocation.lat.toFixed(5)}, {report.geolocation.lng.toFixed(5)}
                </a>
              ) : (
                <p className="text-sm text-on-surface-variant mt-1">Não registrada</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="md:col-span-4 print:col-span-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Conformes</span>
              <span className="text-lg font-black text-tertiary">{conformCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Não Conformes</span>
              <span className="text-lg font-black text-error">{nonConformCount}</span>
            </div>
            {scaleAverage !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Nota média</span>
                <span className="text-lg font-black text-primary">{scaleAverage.toFixed(1).replace(".", ",")} de {scaleMax}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Total de Itens</span>
              <span className="text-lg font-black text-navy">{report.responses.length}</span>
            </div>
          </div>
          {actions}
        </Card>
      </div>

      <div className="space-y-6">
        {report.sections.map((sec, sIdx) => {
          const sectionItems = sec.items.filter((i) => answersMap.has(i.id));
          const sectionConform = sectionItems.filter((i) => answersMap.get(i.id)?.answer === "conform").length;
          const groups = groupBySubsection(sec.items);
          const numbers = subsectionNumbers(groups, sIdx + 1);
          return (
            <Card key={sIdx}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{sIdx + 1}</span>
                </div>
                <h3 className="text-base font-bold text-navy">{sec.name}</h3>
                <span className="text-xs text-outline">{sectionConform}/{sectionItems.length} conformes</span>
              </div>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    {group.name !== null && (
                      <h4 className="text-sm font-bold text-navy">
                        <span className="text-primary mr-2">{numbers[group.key]}</span>{group.name}
                      </h4>
                    )}
                    {group.items.map((item) => {
                      const resp = answersMap.get(item.id);
                      if (!resp) return null;
                      const isScale = resp.answer === "scale";
                      const isConform = resp.answer === "conform" || isScale;
                      const label = isScale
                        ? `Nota ${resp.value}${item.scale ? ` de ${item.scale.max}` : ""}`
                        : resp.value ? String(resp.value) : isConform ? "Conforme" : "Não Conforme";
                      const evidence = responseEvidence(resp);
                      return (
                        <div key={item.id} className={cn("flex items-start gap-3 p-4 rounded-xl border break-inside-avoid", isConform ? "border-tertiary/20 bg-tertiary-fixed/5" : "border-error/20 bg-error-container/5")}>
                          <span className={cn("material-symbols-outlined text-[20px] mt-0.5 filled", isConform ? "text-tertiary" : "text-error")}>
                            {isScale ? "star" : isConform ? "check_circle" : "cancel"}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-on-surface"><RichText text={item.question} /></p>
                            <p className={cn("text-xs font-bold mt-1", isConform ? "text-tertiary" : "text-error")}>
                              {label}
                              {resp.answered_at && <span className="font-normal text-outline"> · {clock(resp.answered_at)}</span>}
                            </p>
                            {resp.observation && (
                              <p className="text-xs italic text-on-surface-variant mt-2 border-l-2 border-error pl-2">{resp.observation}</p>
                            )}
                            {evidence.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {evidence.map((url) => (
                                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt="Evidência fotográfica" className="w-32 h-24 rounded-xl object-cover border-2 border-outline-variant/20 hover:border-primary/40 transition-colors" />
                                  </a>
                                ))}
                              </div>
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
  );
}
