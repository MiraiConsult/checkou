export type ResponseType = "conform" | "multiple_choice" | "scale";

export interface ChoiceOption {
  label: string;
  conform: boolean;
}

export interface ScaleConfig {
  min: number;
  max: number;
  step: number;
}

export interface ChecklistSectionItem {
  id: string;
  question: string;
  required_evidence: boolean;
  help?: string;
  response_type?: ResponseType;
  options?: ChoiceOption[];
  scale?: ScaleConfig;
  // Subseção (1.1, 1.2...): fica no item para que o resto do sistema continue lendo section.items
  subsection?: string;
  subsection_id?: string;
}

export interface ChecklistSection {
  name: string;
  items: ChecklistSectionItem[];
}

export interface ChecklistTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  sections: ChecklistSection[];
  unit_ids: string[];
  allow_gallery: boolean;
  created_at: string;
}

export type ExecutionStatus = "in_progress" | "completed" | "approved" | "rejected";

export interface ChecklistResponse {
  item_id: string;
  answer: "conform" | "non_conform" | "scale";
  value?: string | number | null;
  evidence_url?: string | null;
  evidence_urls?: string[];
  observation?: string | null;
  answered_at?: string | null;
}

export interface ChecklistExecution {
  id: string;
  template_id: string;
  unit_id: string;
  operator_id: string;
  status: ExecutionStatus;
  score: number;
  responses: ChecklistResponse[];
  geolocation: { lat: number; lng: number } | null;
  started_at: string;
  completed_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
}
