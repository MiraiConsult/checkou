"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface AccessMessageProps {
  title: string;
  name: string;
  company: string;
  email: string;
  token: string;
  onClose: () => void;
  children?: ReactNode;
}

export function buildAccessMessage({ name, company, email, token }: Pick<AccessMessageProps, "name" | "company" | "email" | "token">) {
  const origin = window.location.origin;
  return [
    `Olá, ${name.split(" ")[0]}! Seu acesso ao Checkou de ${company} está pronto.`,
    "",
    "1. Abra este link e crie sua senha:",
    `${origin}/primeiro-acesso?t=${token}`,
    "",
    "2. Depois, entre sempre por:",
    `${origin}/login`,
    `Email: ${email}`,
    "",
    "O link vale por 7 dias e só pode ser usado uma vez.",
  ].join("\n");
}

export function AccessMessage({ title, name, company, email, token, onClose, children }: AccessMessageProps) {
  const [copied, setCopied] = useState(false);
  const message = buildAccessMessage({ name, company, email, token });

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-3xl p-7 max-w-lg w-full shadow-2xl">
        <span className="w-14 h-14 rounded-2xl bg-lime text-on-lime flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[28px]">check</span>
        </span>
        <h3 className="text-2xl font-extrabold text-navy">{title}</h3>
        <p className="text-sm text-on-surface-variant mt-1 mb-4">Copie a mensagem e envie para {name} no WhatsApp. O link não aparece de novo depois de fechar.</p>
        <pre className="bg-ink text-white rounded-2xl p-4 text-sm whitespace-pre-wrap break-all font-sans mb-5">{message}</pre>
        <div className="flex flex-wrap justify-end gap-2.5">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {children}
          <Button variant="primary" onClick={copy}>
            <span className="material-symbols-outlined text-[16px]">{copied ? "check" : "content_copy"}</span>
            {copied ? "Mensagem copiada" : "Copiar mensagem"}
          </Button>
        </div>
      </div>
    </div>
  );
}
