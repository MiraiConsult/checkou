"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleMagicLink = () => {
    if (email.trim()) {
      setMagicLinkSent(true);
      setTimeout(() => setMagicLinkSent(false), 4000);
    }
  };

  const handleForgotPassword = () => {
    if (email.trim()) {
      setResetSent(true);
      setTimeout(() => { setResetSent(false); setShowForgotPassword(false); }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-[440px] mx-auto px-6 relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/30">
              <span className="material-symbols-outlined text-white text-[28px]">fact_check</span>
            </div>
            <h1 className="text-3xl font-extrabold text-navy tracking-tight">CHECKOU</h1>
          </div>
          <p className="text-sm text-on-surface-variant">Gestão operacional inteligente</p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-xl border border-outline-variant/10">
          <h2 className="text-xl font-bold text-navy mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-on-surface-variant mb-8">Acesse sua conta para continuar</p>

          {/* Forgot password inline */}
          {showForgotPassword ? (
            <div className="space-y-5">
              <p className="text-sm text-on-surface-variant">Digite seu email para receber um link de recuperação.</p>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Email corporativo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@empresa.com"
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 pl-11 text-sm text-on-surface placeholder:text-outline border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              {resetSent ? (
                <div className="py-3 bg-tertiary-fixed/20 text-tertiary rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Link de recuperação enviado!
                </div>
              ) : (
                <Button className="w-full py-3" onClick={handleForgotPassword}>
                  Enviar Link de Recuperação
                </Button>
              )}
              <button onClick={() => setShowForgotPassword(false)} className="w-full text-sm text-primary font-semibold hover:underline cursor-pointer text-center">
                Voltar ao login
              </button>
            </div>
          ) : (
            <>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href = "/"; }}>
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Email corporativo
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@empresa.com"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 pl-11 text-sm text-on-surface placeholder:text-outline border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-on-surface">Senha</label>
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-on-surface placeholder:text-outline border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Login button */}
                <Button type="submit" className="w-full py-3 text-base">
                  Entrar
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-outline-variant/30" />
                <span className="text-xs text-outline font-medium uppercase">ou</span>
                <div className="flex-1 h-px bg-outline-variant/30" />
              </div>

              {/* Magic Link */}
              {magicLinkSent ? (
                <div className="w-full py-3 bg-tertiary-fixed/20 text-tertiary rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Magic Link enviado para {email}
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={handleMagicLink}>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  Solicitar Magic Link
                </Button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-on-surface-variant">
            Não possui conta?{" "}
            <a href="mailto:contato@checkou.com.br" className="text-primary font-semibold hover:underline cursor-pointer">
              Fale com um consultor
            </a>
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <span className="text-xs text-outline">
            🌐 Português (BR)
          </span>
          <a href="mailto:suporte@checkou.com.br" className="text-xs text-outline hover:text-on-surface-variant transition-colors cursor-pointer">
            Suporte
          </a>
        </div>
      </div>
    </div>
  );
}
