import { createClient } from "@/lib/supabase/client";

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  sector: string;
  unit_id: string | null;
  active: boolean;
  checklist_ids: string[];
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AdminUnit {
  id: string;
  name: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_m?: number;
}

export interface AdminTemplate {
  id: string;
  name: string;
  status: string;
  unit_ids: string[];
}

export interface AdminExecution {
  id: string;
  unit_id: string | null;
  template_id: string;
  operator_id: string;
  status: string;
  score: number;
  completed_at: string | null;
  started_at: string;
}

export const roleLabels: Record<string, string> = { master: "Master", admin: "Administrador", operator: "Operador" };
export const sectorLabels: Record<string, string> = { geral: "Geral (todos)", gerencia: "Gerência", cozinha: "Cozinha", salao: "Salão", bar: "Bar" };
export const inputClass = "w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";
export const labelClass = "block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5";

export async function callAdmin<T = { ok: boolean }>(body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const { data, error } = await createClient().functions.invoke("admin-users", { body });
  if (error) {
    const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
    return { error: detail?.error || "Não foi possível concluir. Tente de novo." };
  }
  return { data };
}

export async function fetchAdminData() {
  const supabase = createClient();
  const [usersRes, unitsRes, templatesRes, execsRes] = await Promise.all([
    callAdmin<{ users: AdminUser[] }>({ action: "list" }),
    supabase.from("units").select("*").order("name"),
    supabase.from("checklist_templates").select("id, name, status, unit_ids").order("name"),
    supabase.from("checklist_executions").select("id, unit_id, template_id, operator_id, status, score, completed_at, started_at").order("started_at", { ascending: false }),
  ]);
  return {
    error: usersRes.error,
    users: usersRes.data?.users || [],
    units: (unitsRes.data || []) as AdminUnit[],
    templates: (templatesRes.data || []) as AdminTemplate[],
    executions: (execsRes.data || []) as AdminExecution[],
  };
}

export function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const random = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(random, (n) => chars[n % chars.length]).join("");
}

export function timeAgo(value: string | null) {
  if (!value) return "nunca";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  if (days < 1) return "hoje";
  if (days === 1) return "ontem";
  return days < 30 ? `há ${days} dias` : new Date(value).toLocaleDateString("pt-BR");
}

export function isRecent(value: string | null, days = 7) {
  return !!value && Date.now() - new Date(value).getTime() < days * 86400000;
}
