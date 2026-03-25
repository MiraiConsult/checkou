export interface AlertConfig {
  id: string;
  organization_id: string;
  event_type: "checklist_rejected" | "non_conformity" | "task_overdue" | "approval_pending";
  channel_whatsapp: boolean;
  channel_email: boolean;
  channel_push_web: boolean;
  channel_push_mobile: boolean;
  recipients: string[];
}
