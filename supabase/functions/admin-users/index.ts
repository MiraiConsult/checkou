import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-acessar",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

const ROLES = ["operator", "admin", "master"];
const SECTORS = ["geral", "gerencia", "cozinha", "salao", "bar"];
const BAN_FOREVER = "876000h";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    // Equipe Checkou gerencia todas as empresas; admin de empresa, só a própria
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Não autenticado" }, 401);
    const { data: caller } = await admin.from("profiles")
      .select("id, full_name, role, organization_id, unit_id, active")
      .eq("id", userData.user.id).single();
    if (!caller?.active || !["admin", "master"].includes(caller.role)) {
      return json({ error: "Acesso negado" }, 403);
    }
    const ownUnit: string | null = caller.unit_id;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    const log = (act: string, entityId: string, description: string) => admin.from("activity_logs").insert({
      organization_id: caller.organization_id, user_id: caller.id, user_name: caller.full_name,
      action: act, entity_type: "user", entity_id: entityId, description,
    });

    const validUnit = async (unitId: string | null) => {
      if (!unitId) return true;
      const { data } = await admin.from("units").select("id").eq("id", unitId).eq("organization_id", caller.organization_id).maybeSingle();
      return !!data;
    };

    const parseChecklists = async (raw: unknown, unitId: string | null) => {
      const ids = Array.isArray(raw) ? raw.map(String) : [];
      if (!unitId || ids.length === 0) return [];
      const { data } = await admin.from("checklist_templates").select("id")
        .in("id", ids).eq("organization_id", caller.organization_id).contains("unit_ids", [unitId]);
      return (data ?? []).map((t) => t.id);
    };

    if (action === "list") {
      let query = admin.from("profiles")
        .select("id, full_name, email, role, sector, unit_id, active, checklist_ids, created_at")
        .eq("organization_id", caller.organization_id).order("full_name");
      if (ownUnit) query = query.eq("unit_id", ownUnit);
      const { data: profiles, error } = await query;
      if (error) return json({ error: error.message }, 400);
      const lastSignIn: Record<string, string | null> = {};
      await Promise.all((profiles ?? []).map(async (p) => {
        const { data } = await admin.auth.admin.getUserById(p.id);
        lastSignIn[p.id] = data?.user?.last_sign_in_at ?? null;
      }));
      return json({ users: (profiles ?? []).map((p) => ({ ...p, last_sign_in_at: lastSignIn[p.id] })) });
    }

    if (action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const fullName = String(body.full_name ?? "").trim();
      const password = String(body.password ?? "");
      const role = String(body.role ?? "operator");
      const sector = String(body.sector ?? "geral");
      const unitId = ownUnit ?? (body.unit_id ? String(body.unit_id) : null);
      if (!email || !fullName) return json({ error: "Informe nome e email." }, 400);
      if (password.length < 6) return json({ error: "A senha precisa ter ao menos 6 caracteres." }, 400);
      if (!ROLES.includes(role) || !SECTORS.includes(sector)) return json({ error: "Função ou setor inválido." }, 400);
      if (role === "master" && (ownUnit || caller.role !== "master")) return json({ error: "Só um Master pode criar outro Master." }, 403);
      if (!(await validUnit(unitId))) return json({ error: "Empresa inválida." }, 400);

      // O trigger handle_new_user consome este convite ao criar o perfil
      const { error: pendingError } = await admin.from("pending_users").upsert({
        email, organization_id: caller.organization_id, full_name: fullName, role, sector, unit_id: unitId,
        checklist_ids: await parseChecklists(body.checklist_ids, unitId),
      });
      if (pendingError) return json({ error: pendingError.message }, 400);

      const { data, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (error || !data?.user) {
        await admin.from("pending_users").delete().eq("email", email);
        const taken = /already|registered|exists/i.test(error?.message ?? "");
        return json({ error: taken ? "Já existe um usuário com este email." : error?.message ?? "Falha ao criar usuário." }, 400);
      }
      await log("user_created", data.user.id, `criou o usuário ${fullName}`);
      return json({ ok: true, id: data.user.id });
    }

    // Empresa e acesso do dono de uma vez
    if (action === "create_client") {
      if (ownUnit) return json({ error: "Acesso negado" }, 403);
      const companyName = String(body.company_name ?? "").trim();
      const location = String(body.location ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const fullName = String(body.full_name ?? "").trim();
      const password = String(body.password ?? "");
      if (!companyName || !email || !fullName) return json({ error: "Informe empresa, dono e email." }, 400);
      if (password.length < 6) return json({ error: "A senha precisa ter ao menos 6 caracteres." }, 400);

      const { data: unit, error: unitError } = await admin.from("units")
        .insert({ organization_id: caller.organization_id, name: companyName, location }).select("id").single();
      if (unitError || !unit) return json({ error: "Não foi possível criar a empresa." }, 400);

      const { error: pendingError } = await admin.from("pending_users").upsert({
        email, organization_id: caller.organization_id, full_name: fullName, role: "admin", sector: "gerencia", unit_id: unit.id,
      });
      const { data: created, error: createError } = pendingError
        ? { data: null, error: pendingError }
        : await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
      if (createError || !created?.user) {
        await admin.from("pending_users").delete().eq("email", email);
        await admin.from("units").delete().eq("id", unit.id);
        const taken = /already|registered|exists/i.test(createError?.message ?? "");
        return json({ error: taken ? "Já existe um usuário com este email." : "Não foi possível criar o acesso do dono." }, 400);
      }

      const checklistIds = Array.isArray(body.checklist_ids) ? body.checklist_ids.map(String) : [];
      if (checklistIds.length > 0) {
        const { data: templates } = await admin.from("checklist_templates").select("id, unit_ids")
          .in("id", checklistIds).eq("organization_id", caller.organization_id);
        await Promise.all((templates ?? []).map((t) => admin.from("checklist_templates")
          .update({ unit_ids: [...t.unit_ids, unit.id] }).eq("id", t.id)));
      }
      await log("client_created", created.user.id, `criou o cliente ${companyName}`);
      return json({ ok: true, unit_id: unit.id });
    }

    // As ações abaixo agem sobre um usuário existente da mesma organização
    const userId = String(body.user_id ?? "");
    const { data: target } = await admin.from("profiles")
      .select("id, full_name, email, role, organization_id, unit_id").eq("id", userId).maybeSingle();
    if (!target || target.organization_id !== caller.organization_id || (ownUnit && target.unit_id !== ownUnit)) return json({ error: "Usuário não encontrado." }, 404);
    if (target.role === "master" && caller.role !== "master") return json({ error: "Só um Master pode alterar outro Master." }, 403);

    if (action === "update") {
      const fullName = String(body.full_name ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const role = String(body.role ?? "");
      const sector = String(body.sector ?? "");
      const unitId = ownUnit ?? (body.unit_id ? String(body.unit_id) : null);
      if (!fullName || !email) return json({ error: "Informe nome e email." }, 400);
      if (!ROLES.includes(role) || !SECTORS.includes(sector)) return json({ error: "Função ou setor inválido." }, 400);
      if (role === "master" && (ownUnit || caller.role !== "master")) return json({ error: "Só um Master pode promover a Master." }, 403);
      if (!(await validUnit(unitId))) return json({ error: "Empresa inválida." }, 400);
      if (target.id === caller.id && (role !== caller.role || unitId !== ownUnit)) {
        return json({ error: "Você não pode mudar a própria função nem se vincular a uma empresa." }, 400);
      }
      if (email !== target.email) {
        const { error } = await admin.auth.admin.updateUserById(target.id, { email, email_confirm: true });
        if (error) return json({ error: "Não foi possível trocar o email. Ele pode já estar em uso." }, 400);
      }
      const { error } = await admin.from("profiles").update({
        full_name: fullName, email, role, sector, unit_id: unitId, checklist_ids: await parseChecklists(body.checklist_ids, unitId),
      }).eq("id", target.id);
      if (error) return json({ error: error.message }, 400);
      await log("user_updated", target.id, `editou o usuário ${fullName}`);
      return json({ ok: true });
    }

    if (action === "set_password") {
      const password = String(body.password ?? "");
      if (password.length < 6) return json({ error: "A senha precisa ter ao menos 6 caracteres." }, 400);
      const { error } = await admin.auth.admin.updateUserById(target.id, { password });
      if (error) return json({ error: error.message }, 400);
      await log("user_password_reset", target.id, `redefiniu a senha de ${target.full_name}`);
      return json({ ok: true });
    }

    if (action === "set_active") {
      const active = body.active === true;
      if (target.id === caller.id) return json({ error: "Você não pode desativar a própria conta." }, 400);
      const { error } = await admin.auth.admin.updateUserById(target.id, { ban_duration: active ? "none" : BAN_FOREVER });
      if (error) return json({ error: error.message }, 400);
      await admin.from("profiles").update({ active }).eq("id", target.id);
      await log(active ? "user_activated" : "user_deactivated", target.id, `${active ? "reativou" : "desativou"} o usuário ${target.full_name}`);
      return json({ ok: true });
    }

    if (action === "delete") {
      if (target.id === caller.id) return json({ error: "Você não pode excluir a própria conta." }, 400);
      const { count } = await admin.from("checklist_executions").select("id", { count: "exact", head: true }).eq("operator_id", target.id);
      if ((count ?? 0) > 0) {
        return json({ error: "Este usuário já respondeu checklists. Desative em vez de excluir, para manter o histórico." }, 409);
      }
      const { error: profileError } = await admin.from("profiles").delete().eq("id", target.id);
      if (profileError) return json({ error: "Este usuário tem registros ligados a ele. Desative em vez de excluir." }, 409);
      const { error } = await admin.auth.admin.deleteUser(target.id);
      if (error) return json({ error: error.message }, 400);
      await log("user_deleted", target.id, `excluiu o usuário ${target.full_name}`);
      return json({ ok: true });
    }

    return json({ error: "Ação inválida." }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
