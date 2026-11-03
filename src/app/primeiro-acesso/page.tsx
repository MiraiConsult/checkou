"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/lib/admin";

interface Invite {
  full_name: string;
  email: string;
  company: string;
}

async function callFirstAccess<T>(body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const { data, error } = await createClient().functions.invoke("first-access", { body });
  if (error) {
    const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
    return { error: detail?.error || "Não foi possível abrir o link. Tente de novo." };
  }
  return { data };
}

export default function FirstAccessPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // O token sai da barra de endereço para não ficar no histórico
    const value = new URLSearchParams(window.location.search).get("t") || "";
    window.history.replaceState({}, "", "/primeiro-acesso");
    callFirstAccess<Invite>({ action: "check", token: value }).then((result) => {
      setToken(value);
      setInvite(result.data || null);
      setError(result.error || "");
      setLoading(false);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não são iguais.");
      return;
    }
    setSaving(true);
    setError("");
    const result = await callFirstAccess<{ email: string }>({ action: "set_password", token, password });
    if (result.error || !result.data) {
      setError(result.error || "Não foi possível salvar a senha.");
      setSaving(false);
      return;
    }
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: result.data.email, password });
    if (signInError) {
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-primary rounded-3xl p-6 mb-4">
          <Brand />
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-7 shadow-card">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
            </div>
          ) : !invite ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-outline text-[48px]">link_off</span>
              <p className="text-sm text-on-surface-variant mt-3">{error}</p>
              <a href="/login" className="inline-block mt-5 text-sm font-bold text-primary">Ir para o login</a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <h1 className="text-2xl font-extrabold text-navy tracking-tight">Olá, {invite.full_name.split(" ")[0]}!</h1>
                <p className="text-sm text-on-surface-variant mt-1">Crie sua senha para entrar no Checkou de {invite.company}.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="fa-email">Seu email de acesso</label>
                <input id="fa-email" type="email" value={invite.email} readOnly className={`${inputClass} opacity-70`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="fa-pass">Senha</label>
                <input id="fa-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" autoFocus className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="fa-confirm">Repita a senha</label>
                <input id="fa-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputClass} />
              </div>
              {error && <p className="text-sm text-error font-medium">{error}</p>}
              <Button type="submit" className="w-full" disabled={saving || password.length < 6 || !confirm}>
                {saving ? "Salvando..." : "Criar senha e entrar"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
