"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/layout/Brand";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Email ou senha incorretos" : error.message);
      setLoading(false);
      return;
    }
    // Equipe Checkou entra direto no painel de admin
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("role, unit_id").eq("id", user?.id).single();
    const staff = profile && !profile.unit_id && (profile.role === "admin" || profile.role === "master");
    router.push(staff ? "/admin" : "/");
    router.refresh();
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) setError(error.message);
    else { setResetSent(true); setTimeout(() => { setResetSent(false); setShowForgotPassword(false); }, 4000); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 p-3 md:p-4">
      <section className="relative overflow-hidden bg-primary text-white rounded-3xl p-7 md:p-10 flex flex-col justify-between gap-8 lg:min-h-[calc(100vh-2rem)]">
        <div aria-hidden className="absolute w-[30rem] h-[30rem] -right-32 -top-48 rounded-full bg-white/15" />
        <Brand className="relative" />
        <h1 className="relative text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] max-w-xl">Cada turno conferido, sem papel e sem dúvida.</h1>
        <div className="relative hidden lg:flex flex-col gap-2.5 max-w-sm">
          {[["check", "Forno limpo e apto para uso", "-rotate-2"], ["check", "20 massas separadas", "rotate-[1.5deg] translate-x-6"], ["location_on", "Feito no restaurante", "-rotate-1"]].map(([icon, text, tilt]) => (
            <div key={text} className={`bg-white text-ink rounded-2xl px-4 py-3 flex items-center gap-2.5 font-bold shadow-xl ${tilt}`}>
              <span className="w-7 h-7 rounded-lg bg-lime text-on-lime flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
              </span>
              {text}
            </div>
          ))}
        </div>
      </section>

      <div className="w-full max-w-[440px] mx-auto self-center py-6 px-2">
        <div>
          {error && (
            <div className="mb-6 py-3 px-4 bg-error-container/20 text-error rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {showForgotPassword ? (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-navy mb-1">Recuperar Senha</h2>
              <p className="text-sm text-on-surface-variant">Digite seu email para receber um link de recuperação.</p>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@empresa.com"
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 pl-11 text-sm text-on-surface placeholder:text-outline border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              {resetSent ? (
                <div className="py-3 bg-tertiary-fixed/20 text-tertiary rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Link enviado!
                </div>
              ) : (
                <Button className="w-full py-3" onClick={handleForgotPassword} disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
              )}
              <button onClick={() => { setShowForgotPassword(false); setError(""); }} className="w-full text-sm text-primary font-semibold hover:underline cursor-pointer text-center">Voltar ao login</button>
            </div>

          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-navy tracking-tight mb-1">Entrar</h2>
              <p className="text-sm text-on-surface-variant mb-8">Use o acesso que você recebeu da equipe Checkou</p>
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Email corporativo</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@empresa.com" required
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 pl-11 text-sm text-on-surface placeholder:text-outline border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-on-surface">Senha</label>
                    <button type="button" onClick={() => { setShowForgotPassword(true); setError(""); }} className="text-xs text-primary font-semibold hover:underline cursor-pointer">Esqueceu a senha?</button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-on-surface placeholder:text-outline border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <span className="text-xs text-outline">🌐 Português (BR)</span>
          <a href="mailto:suporte@checkou.com.br" className="text-xs text-outline hover:text-on-surface-variant transition-colors cursor-pointer">Suporte</a>
        </div>
      </div>
    </div>
  );
}
