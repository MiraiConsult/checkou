import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Pública de propósito: quem abre o link ainda não tem login. A prova é o token do convite.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-acessar",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const body = await req.json().catch(() => ({}));
    const token = String(body.token ?? "");
    if (!/^[0-9a-f]{64}$/.test(token)) return json({ error: "Link inválido." }, 400);

    const { data: invite } = await admin.from("access_invites")
      .select("token_hash, user_id, expires_at, used_at").eq("token_hash", await sha256(token)).maybeSingle();
    if (!invite) return json({ error: "Link inválido." }, 404);
    if (invite.used_at) return json({ error: "Este link já foi usado. Entre com seu email e senha." }, 410);
    if (new Date(invite.expires_at) < new Date()) return json({ error: "Este link expirou. Peça um novo para quem criou seu acesso." }, 410);

    const { data: profile } = await admin.from("profiles")
      .select("full_name, email, active, unit_id").eq("id", invite.user_id).maybeSingle();
    if (!profile?.active) return json({ error: "Este acesso está desativado." }, 403);

    if (body.action === "check") {
      const { data: unit } = profile.unit_id
        ? await admin.from("units").select("name").eq("id", profile.unit_id).maybeSingle()
        : { data: null };
      return json({ full_name: profile.full_name, email: profile.email, company: unit?.name ?? "Checkou" });
    }

    if (body.action === "set_password") {
      const password = String(body.password ?? "");
      if (password.length < 6) return json({ error: "A senha precisa ter ao menos 6 caracteres." }, 400);
      const { error } = await admin.auth.admin.updateUserById(invite.user_id, { password });
      if (error) return json({ error: "Não foi possível salvar a senha. Tente de novo." }, 400);
      await admin.from("access_invites").update({ used_at: new Date().toISOString() }).eq("token_hash", invite.token_hash);
      return json({ ok: true, email: profile.email });
    }

    return json({ error: "Ação inválida." }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
