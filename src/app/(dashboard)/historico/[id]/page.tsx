"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ExecutionReport, type ReportData } from "@/components/report/ExecutionReport";
import { createClient } from "@/lib/supabase/client";
import { useAuth, canManageUsers } from "@/hooks/useAuth";
import type { ChecklistResponse, ChecklistSection } from "@/lib/types/checklist";

interface ExecutionData extends ReportData {
  id: string;
  public_token: string | null;
}

export default function ExecutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const execId = params.id as string;
  const [exec, setExec] = useState<ExecutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data: raw } = await supabase
        .from("checklist_executions")
        .select("id, score, status, started_at, completed_at, responses, geolocation, public_token, template_id, operator_id, unit_id")
        .eq("id", execId)
        .single();

      if (!raw) { setLoading(false); return; }

      const [tRes, pRes, uRes] = await Promise.all([
        supabase.from("checklist_templates").select("name, sections").eq("id", raw.template_id).single(),
        supabase.from("profiles").select("full_name, email").eq("id", raw.operator_id).single(),
        raw.unit_id ? supabase.from("units").select("name").eq("id", raw.unit_id).single() : Promise.resolve({ data: null }),
      ]);

      setExec({
        id: raw.id,
        score: Number(raw.score),
        status: raw.status,
        started_at: raw.started_at,
        completed_at: raw.completed_at,
        responses: Array.isArray(raw.responses) ? raw.responses as ChecklistResponse[] : [],
        geolocation: raw.geolocation,
        public_token: raw.public_token,
        template_name: tRes.data?.name || "—",
        sections: Array.isArray(tRes.data?.sections) ? tRes.data.sections as ChecklistSection[] : [],
        unit_name: uRes.data?.name,
        operator_name: pRes.data?.full_name || "—",
        operator_email: pRes.data?.email || "",
      });
      setLoading(false);
    };
    fetchData();
  }, [execId]);

  const handleAction = async (action: "approved" | "rejected") => {
    if (!exec) return;
    const supabase = createClient();
    await supabase.from("checklist_executions").update({
      status: action,
      ...(action === "approved" ? { approved_at: new Date().toISOString() } : {}),
    }).eq("id", execId);
    setExec({ ...exec, status: action });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!exec) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-outline text-[48px] mb-3">search_off</span>
        <p className="text-sm text-on-surface-variant">Execução não encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/historico")}>Voltar</Button>
      </div>
    );
  }

  const publicUrl = exec.public_token ? `${window.location.origin}/r/${exec.public_token}` : "";

  const enableShare = async () => {
    setShareError("");
    const { data, error } = await createClient().rpc("set_execution_share", { p_id: execId, p_enabled: true });
    if (error || !data) {
      setShareError("Não foi possível gerar o link.");
      return;
    }
    setExec({ ...exec, public_token: data as string });
    await navigator.clipboard.writeText(`${window.location.origin}/r/${data}`);
    setCopied(true);
  };

  const disableShare = async () => {
    setShareError("");
    const { error } = await createClient().rpc("set_execution_share", { p_id: execId, p_enabled: false });
    if (error) {
      setShareError("Não foi possível desativar o link.");
      return;
    }
    setExec({ ...exec, public_token: null });
    setCopied(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button onClick={() => router.back()} aria-label="Voltar" className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer mr-auto">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
        </button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          Gerar PDF
        </Button>
        {canManageUsers(user) && (exec.public_token ? (
          <>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <span className="material-symbols-outlined text-[16px]">{copied ? "check" : "link"}</span>
              {copied ? "Link copiado" : "Copiar link público"}
            </Button>
            <Button variant="outline" size="sm" onClick={disableShare}>
              <span className="material-symbols-outlined text-[16px]">link_off</span>
              Desativar link
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={enableShare}>
            <span className="material-symbols-outlined text-[16px]">link</span>
            Gerar link público
          </Button>
        ))}
      </div>
      {shareError && <p className="text-sm text-error font-medium print:hidden">{shareError}</p>}

      <ExecutionReport
        report={exec}
        actions={exec.status === "completed" && (
          <div className="flex gap-2 mt-5 pt-4 border-t border-outline-variant/10 print:hidden">
            <Button variant="danger" size="sm" className="flex-1" onClick={() => handleAction("rejected")}>Rejeitar</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => handleAction("approved")}>
              <span className="material-symbols-outlined text-[16px]">check</span>Aprovar
            </Button>
          </div>
        )}
      />
    </div>
  );
}
