"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useAuth, canManageUsers, isStaff } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

type Audience = "all" | "manager" | "staff";

interface Tutorial {
  id: string;
  title: string;
  icon: string;
  audience: Audience;
  steps: string[];
  href?: string;
}

const groups: { title: string; items: Tutorial[] }[] = [
  {
    title: "Primeiros passos",
    items: [
      {
        id: "novo-cliente", title: "Criar um cliente novo", icon: "add_business", audience: "staff", href: "/admin",
        steps: [
          "Abra o Admin e clique em Novo cliente.",
          "Preencha a empresa, o nome e o email do dono e escolha os checklists.",
          "Clique em Criar conta. A senha já vem gerada.",
          "Clique em Copiar acesso e cole no WhatsApp do dono.",
        ],
      },
      {
        id: "acessar", title: "Acessar a conta de um cliente", icon: "login", audience: "staff", href: "/admin",
        steps: [
          "No Admin, clique em Acessar na linha do cliente.",
          "A conta abre em uma aba nova, com uma faixa verde no topo.",
          "Tudo que aparece nessa aba é só daquela empresa.",
          "Clique em Voltar ao admin para sair da conta.",
        ],
      },
      {
        id: "local", title: "Cadastrar o local da empresa", icon: "location_on", audience: "staff", href: "/admin",
        steps: [
          "No Admin, abra o cliente e fique na aba Conta.",
          "Cole as coordenadas do Google Maps ou clique em Usar a minha, estando no restaurante.",
          "Ajuste o raio se precisar e clique em Salvar.",
          "O relatório passa a mostrar No local ou Fora do local.",
        ],
      },
    ],
  },
  {
    title: "Checklists",
    items: [
      {
        id: "criar-checklist", title: "Criar um checklist", icon: "edit_note", audience: "staff", href: "/checklists/novo",
        steps: [
          "Em Checklists, clique em Novo Checklist.",
          "Crie as seções, as subseções e os itens.",
          "Escolha o tipo de resposta de cada item: conforme, múltipla escolha ou nota.",
          "Marque os itens que exigem foto e publique.",
        ],
      },
      {
        id: "duplicar", title: "Duplicar um checklist para ajustar a um cliente", icon: "content_copy", audience: "staff", href: "/checklists",
        steps: [
          "Um checklist ligado a duas empresas é o mesmo arquivo: alterar para uma muda para a outra.",
          "Para ajustar só para um cliente, abra o menu do checklist e clique em Duplicar.",
          "Edite a cópia, publique e ligue à empresa em Admin, aba Checklists.",
        ],
      },
      {
        id: "pessoas", title: "Definir os checklists de cada pessoa", icon: "assignment_ind", audience: "manager", href: "/admin",
        steps: [
          "No Admin, abra a aba Usuários e edite a pessoa.",
          "Marque os checklists dela e salve.",
          "Sem nenhum marcado, a pessoa vê todos os checklists da empresa.",
        ],
      },
      {
        id: "executar", title: "Responder um checklist", icon: "play_circle", audience: "all", href: "/checklists",
        steps: [
          "Em Checklists, clique em Executar.",
          "Responda cada item. Use o botão de câmera nos itens que pedem foto.",
          "Clique em Finalizar e Enviar e confirme com a sua senha.",
          "Permita a localização quando o celular pedir: ela confirma que você estava no local.",
        ],
      },
    ],
  },
  {
    title: "Equipe",
    items: [
      {
        id: "usuarios", title: "Criar um usuário", icon: "person_add", audience: "manager", href: "/admin",
        steps: [
          "No Admin, abra a aba Usuários e clique em Criar Usuário.",
          "Administrador cuida da equipe da empresa. Operador só responde checklists.",
          "Salve e clique em Copiar acesso para enviar o login à pessoa.",
          "Quem saiu da empresa deve ser desativado, para manter o histórico.",
        ],
      },
    ],
  },
  {
    title: "Resultados",
    items: [
      {
        id: "relatorio", title: "Ler o relatório", icon: "analytics", audience: "all", href: "/historico",
        steps: [
          "Abra o Histórico e clique na execução.",
          "No topo ficam a nota, o início, o fim e a localização.",
          "Cada item mostra a resposta, o horário e as fotos.",
        ],
      },
      {
        id: "pdf", title: "Gerar o PDF", icon: "picture_as_pdf", audience: "all", href: "/historico",
        steps: [
          "Abra a execução no Histórico e clique em Gerar PDF.",
          "Na janela de impressão, escolha Salvar como PDF.",
        ],
      },
      {
        id: "link", title: "Enviar o link público com comentários", icon: "link", audience: "manager", href: "/historico",
        steps: [
          "Abra a execução no Histórico e clique em Gerar link público.",
          "O link é copiado. Cole no WhatsApp do cliente ou da equipe.",
          "Quem tem o link lê o relatório e comenta sem precisar de login.",
          "Clique em Desativar link quando não quiser mais compartilhar.",
        ],
      },
    ],
  },
];

export default function TutorialsPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState<string | null>(null);
  const visible = (audience: Audience) => audience === "all" || (audience === "manager" && canManageUsers(user)) || (audience === "staff" && isStaff(user));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Central de tutoriais</h2>
        <p className="text-sm text-on-surface-variant mt-1">Passo a passo do que você faz no Checkou</p>
      </div>

      {groups.map((group) => {
        const items = group.items.filter((item) => visible(item.audience));
        if (items.length === 0) return null;
        return (
          <section key={group.title} className="space-y-2.5">
            <h3 className="text-sm font-bold text-primary">{group.title}</h3>
            {items.map((item) => {
              const isOpen = open === item.id;
              return (
                <Card key={item.id} hover={false} className="p-0 overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? null : item.id)} aria-expanded={isOpen} className="w-full flex items-center gap-3 p-4 text-left cursor-pointer">
                    <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </span>
                    <span className="flex-1 font-bold text-navy">{item.title}</span>
                    <span className={cn("material-symbols-outlined text-outline transition-transform", isOpen && "rotate-180")}>expand_more</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5">
                      <ol className="space-y-2.5">
                        {item.steps.map((step, index) => (
                          <li key={step} className="flex gap-3 text-sm text-on-surface">
                            <span className="w-6 h-6 rounded-lg bg-surface-container text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                      {item.href && (
                        <Link href={item.href} className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-4">
                          Ir para a tela
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
