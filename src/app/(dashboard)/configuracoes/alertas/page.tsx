"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { createClient } from "@/lib/supabase/client";

interface AlertEvent {
  id: string;
  event_type: string;
  channel_whatsapp: boolean;
  channel_email: boolean;
  channel_push_web: boolean;
  channel_push_mobile: boolean;
  recipients: string[];
}

const eventLabels: Record<string, { name: string; icon: string }> = {
  checklist_rejected: { name: "Checklist Reprovado", icon: "cancel" },
  non_conformity: { name: "Não-Conformidade Detectada", icon: "warning" },
  task_overdue: { name: "Tarefa Atrasada", icon: "assignment_late" },
  approval_pending: { name: "Aprovação Pendente", icon: "pending_actions" },
};

export default function AlertasConfigPage() {
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("alert_configs").select("*").then(({ data }) => {
      setEvents(data || []);
      setLoading(false);
    });
  }, []);

  const toggleChannel = async (eventId: string, channel: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const newValue = !event[channel as keyof AlertEvent];
    const supabase = createClient();
    await supabase.from("alert_configs").update({ [channel]: newValue }).eq("id", eventId);
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, [channel]: newValue } : e));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

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

      {events.length === 0 ? (
        <Card className="text-center py-16">
          <span className="material-symbols-outlined text-outline text-[56px] mb-4">notifications</span>
          <h3 className="text-lg font-bold text-navy mb-2">Nenhuma configuração de alerta</h3>
          <p className="text-sm text-on-surface-variant">As configurações de notificação aparecerão aqui</p>
        </Card>
      ) : (
        <Card>
          <h3 className="text-lg font-bold text-navy mb-6">Matriz de Notificação</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-left pb-4 pr-4">Evento</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">WhatsApp</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">Email</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">Push Web</th>
                  <th className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest text-center pb-4 px-4">Push Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {events.map((event) => {
                  const label = eventLabels[event.event_type] || { name: event.event_type, icon: "notifications" };
                  return (
                    <tr key={event.id}>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{label.icon}</span>
                          <span className="text-sm font-medium text-on-surface">{label.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center"><div className="flex justify-center"><Toggle checked={event.channel_whatsapp} onChange={() => toggleChannel(event.id, "channel_whatsapp")} /></div></td>
                      <td className="py-4 px-4 text-center"><div className="flex justify-center"><Toggle checked={event.channel_email} onChange={() => toggleChannel(event.id, "channel_email")} /></div></td>
                      <td className="py-4 px-4 text-center"><div className="flex justify-center"><Toggle checked={event.channel_push_web} onChange={() => toggleChannel(event.id, "channel_push_web")} /></div></td>
                      <td className="py-4 px-4 text-center"><div className="flex justify-center"><Toggle checked={event.channel_push_mobile} onChange={() => toggleChannel(event.id, "channel_push_mobile")} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="primary" onClick={handleSave}>
              {saved ? "Salvo!" : "Salvar Configurações"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
