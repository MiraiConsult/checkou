export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string;
  execution_id: string;
  unit_id: string;
  title: string;
  description: string;
  assigned_to: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  due_date: string;
  evidence_url: string | null;
  observation: string | null;
  created_at: string;
  completed_at: string | null;
}
