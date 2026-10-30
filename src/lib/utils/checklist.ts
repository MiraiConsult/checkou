import type { ChecklistResponse, ChecklistSectionItem, ScaleConfig } from "@/lib/types/checklist";

export const defaultScale: ScaleConfig = { min: 1, max: 5, step: 1 };

export function scaleValues(scale: ScaleConfig = defaultScale): number[] {
  const step = scale.step > 0 ? scale.step : 1;
  const values: number[] = [];
  for (let i = 0; scale.min + i * step <= scale.max + 1e-9; i++) {
    values.push(Math.round((scale.min + i * step) * 100) / 100);
  }
  return values;
}

export interface ItemGroup<T> {
  key: string;
  name: string | null;
  items: T[];
}

// Agrupa itens consecutivos da mesma subseção, preservando a ordem do template
export function groupBySubsection<T extends Pick<ChecklistSectionItem, "subsection" | "subsection_id">>(items: T[]): ItemGroup<T>[] {
  const groups: ItemGroup<T>[] = [];
  items.forEach((item, index) => {
    const id = item.subsection_id || item.subsection || "";
    const last = groups[groups.length - 1];
    if (last && (last.key === id || (!id && !last.name && last.key.startsWith("root-")))) {
      last.items.push(item);
    } else {
      groups.push({ key: id || `root-${index}`, name: id ? item.subsection || "" : null, items: [item] });
    }
  });
  return groups;
}

// Numera só as subseções: itens soltos antes delas não contam para o 1.1
export function subsectionNumbers<T>(groups: ItemGroup<T>[], sectionNumber: number): Record<string, string> {
  const numbers: Record<string, string> = {};
  let n = 0;
  groups.forEach((group) => {
    if (group.name !== null) numbers[group.key] = `${sectionNumber}.${++n}`;
  });
  return numbers;
}

export function responseEvidence(response: Pick<ChecklistResponse, "evidence_url" | "evidence_urls">): string[] {
  if (response.evidence_urls?.length) return response.evidence_urls;
  return response.evidence_url ? [response.evidence_url] : [];
}

export function computeScore(items: ChecklistSectionItem[], responses: Pick<ChecklistResponse, "item_id" | "answer" | "value">[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  let points = 0;
  const scaleValuesAnswered: number[] = [];
  let scaleMax = 0;

  responses.forEach((response) => {
    if (response.answer === "scale") {
      const scale = byId.get(response.item_id)?.scale || defaultScale;
      const value = Number(response.value);
      const range = scale.max - scale.min;
      points += range > 0 ? (value - scale.min) / range : 0;
      scaleValuesAnswered.push(value);
      scaleMax = Math.max(scaleMax, scale.max);
    } else if (response.answer === "conform") {
      points += 1;
    }
  });

  return {
    score: responses.length > 0 ? Math.round((points / responses.length) * 100) : 0,
    scaleAverage: scaleValuesAnswered.length > 0
      ? scaleValuesAnswered.reduce((sum, value) => sum + value, 0) / scaleValuesAnswered.length
      : null,
    scaleMax,
  };
}
