export interface ChecklistSection {
  name: string;
  items: ChecklistSectionItem[];
}

export interface ChecklistSectionItem {
  id: string;
  question: string;
  required_evidence: boolean;
}

export interface ChecklistTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  sections: ChecklistSection[];
  created_at: string;
}

export type ExecutionStatus = "in_progress" | "completed" | "approved" | "rejected";

export interface ChecklistResponse {
  item_id: string;
  answer: "conform" | "non_conform";
  evidence_url?: string;
  observation?: string;
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
