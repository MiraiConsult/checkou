"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";

interface AlertEvent {
  id: string;
  name: string;
  icon: string;
  whatsapp: boolean;
  email: boolean;
  pushWeb: boolean;
  pushMobile: boolean;
  recipients: string[];
}

const initialEvents: AlertEvent[] = [
  { id: "1", name: "Checklist Reprovado", icon: "cancel", whatsapp: true, email: true, pushWeb: false, pushMobile: true, recipients: ["Supervisores", "Gerentes"] },
  { id: "2", name: "Não-Conformidade Detectada", icon: "warning", whatsapp: false, email: true, pushWeb: true, pushMobile: true, recipients: ["Segurança", "Supervisores"] },
  { id: "3", name: "Tarefa Atrasada", icon: "assignment_late", whatsapp: true, email: true, pushWeb: true, pushMobile: false, recipients: ["Operadores", "Supervisores"] },
  { id: "4", name: "Aprovação Pendente", icon: "pending_actions", whatsapp: false, email: true, pushWeb: false, pushMobile: false, recipients: ["Auditores"] },
];

const auditLog = [
  { user: "Carlos Silva", initials: "CS", action: "ativou WhatsApp para Checklist Reprovado", time: "Hoje, 14:30" },
  { user: "Ana Lima", initials: "AL", action: "adicionou Segurança como destinatário", time: "Hoje, 11:15" },
  { user: "João Santos", initials: "JS", action: "desativou Push Mobile para Tarefa Atrasada", time: "Ontem, 16:45" },
];

export default function AlertasConfigPage() {
  const [events, setEvents] = useState(initialEvents);

  const toggleChannel = (eventId: string, channel: keyof Pick<AlertEvent, "whatsapp" | "email" | "pushWeb" | "pushMobile">) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, [channel]: !e[channel] } : e))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
          <span>Configurações</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Notificações</span>
        </div>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Configuração de Alertas</h2>
        <p className="text-sm text-on-surface-variant mt-1">Gerencie como e quando sua equipe recebe notificações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="hidden md:block lg:col-span-9">
          <Card>
            <h3 className="text-lg font-bold text-navy mb-6">Matriz de Notificação</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-4 pr-4">Evento</th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">
                      <span className="material-symbols-outlined text-[18px] block mx-auto mb-1 text-green-600">chat</span>
                      WhatsApp
                    </th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">
                      <span className="material-symbols-outlined text-[18px] block mx-auto mb-1 text-blue-600">mail</span>
                      Email
                    </th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">
                      <span className="material-symbols-outlined text-[18px] block mx-auto mb-1 text-purple-600">computer</span>
                      Push Web
                    </th>
                    <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">
                      <span className="material-symbols-outlined text-[18px] block mx-auto mb-1 text-orange-600">smartphone</span>
                      Push Mobile
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{event.icon}</span>
                          <span className="text-sm font-medium text-on-surface">{event.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center"><Toggle checked={event.whatsapp} onChange={() => toggleChannel(event.id, "whatsapp")} /></div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center"><Toggle checked={event.email} onChange={() => toggleChannel(event.id, "email")} /></div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center"><Toggle checked={event.pushWeb} onChange={() => toggleChannel(event.id, "pushWeb")} /></div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center"><Toggle checked={event.pushMobile} onChange={() => toggleChannel(event.id, "pushMobile")} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="md:hidden space-y-4 lg:col-span-9">
          {events.map((event) => (
            <Card key={event.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant">{event.icon}</span>
                <h4 className="text-sm font-bold text-navy">{event.name}</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">mail</span>
                  <Toggle checked={event.email} onChange={() => toggleChannel(event.id, "email")} />
                  <span className="text-[10px] text-outline">Email</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-green-600">chat</span>
                  <Toggle checked={event.whatsapp} onChange={() => toggleChannel(event.id, "whatsapp")} />
                  <span className="text-[10px] text-outline">WhatsApp</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-orange-600">smartphone</span>
                  <Toggle checked={event.pushMobile} onChange={() => toggleChannel(event.id, "pushMobile")} />
                  <span className="text-[10px] text-outline">Push</span>
                </div>
              </div>
            </Card>
          ))}
          <Button variant="primary" className="w-full mt-4">Salvar Configurações</Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <h4 className="text-sm font-bold text-navy mb-4">Destinatários por Evento</h4>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id}>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{event.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {event.recipients.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                        {r}
                        <span className="material-symbols-outlined text-[12px] cursor-pointer hover:text-error">close</span>
                      </span>
                    ))}
                    <button className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full border border-dashed border-outline-variant text-outline hover:text-primary hover:border-primary transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[12px]">add</span>
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <span className="material-symbols-outlined text-primary text-[24px] mb-2">help</span>
            <p className="text-sm font-bold text-navy">Documentação API</p>
            <p className="text-xs text-on-surface-variant mt-1">Integre alertas via API REST ou Webhooks</p>
            <button className="text-xs text-primary font-semibold mt-3 hover:underline cursor-pointer flex items-center gap-1">
              Ver documentação
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </Card>

          <Card>
            <h4 className="text-sm font-bold text-navy mb-4">Log de Alterações</h4>
            <div className="space-y-4">
              {auditLog.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-primary">{log.initials}</span>
                    </div>
                    {i < auditLog.length - 1 && <div className="w-px h-full bg-outline-variant/20 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-on-surface">
                      <span className="font-semibold">{log.user}</span> {log.action}
                    </p>
                    <p className="text-[10px] text-outline mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
