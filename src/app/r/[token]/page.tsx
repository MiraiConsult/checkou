"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExecutionReport, type ReportData } from "@/components/report/ExecutionReport";
import { createClient } from "@/lib/supabase/client";

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

type PublicReport = ReportData & { comments: Comment[] };

const AUTHOR_KEY = "checkou_comment_author";

async function fetchReport(token: string) {
  const { data } = await createClient().rpc("get_public_report", { p_token: token });
  return data as PublicReport | null;
}

export default function PublicReportPage() {
  const token = useParams().token as string;
  const [report, setReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetchReport(token).then((data) => {
      setReport(data);
      setLoading(false);
    });
  }, [token]);

  useEffect(() => {
    fetchReport(token).then((data) => {
      setReport(data);
      setLoading(false);
    });
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [token, load]);

  useEffect(() => {
    const saved = localStorage.getItem(AUTHOR_KEY);
    if (saved) queueMicrotask(() => setAuthor(saved));
  }, []);

  const sendComment = async () => {
    setSending(true);
    setError("");
    const { error: rpcError } = await createClient().rpc("add_public_comment", { p_token: token, p_author: author, p_body: body });
    setSending(false);
    if (rpcError) {
      setError("Não foi possível enviar o comentário. Tente de novo.");
      return;
    }
    localStorage.setItem(AUTHOR_KEY, author);
    setBody("");
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-center p-6">
        <span className="material-symbols-outlined text-outline text-[48px] mb-3">link_off</span>
        <p className="text-sm text-on-surface-variant">Este link não existe ou foi desativado.</p>
      </div>
    );
  }

  const inputClass = "w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline border border-outline-variant/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8 print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-navy font-black text-lg tracking-tight">CHECKOU</h1>
          <Button variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            Gerar PDF
          </Button>
        </div>

        <ExecutionReport report={report} />

        <Card className="print:hidden">
          <h3 className="text-base font-bold text-navy mb-4">Comentários ({report.comments.length})</h3>
          <div className="space-y-4 mb-5">
            {report.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">{comment.author_name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0 bg-surface-container-low rounded-xl px-4 py-2">
                  <p className="text-xs font-bold text-navy">
                    {comment.author_name}
                    <span className="font-normal text-outline"> · {new Date(comment.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  </p>
                  <p className="text-sm text-on-surface whitespace-pre-wrap break-words">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <input type="text" value={author} maxLength={80} onChange={(e) => setAuthor(e.target.value)} placeholder="Seu nome" className={inputClass} />
            <textarea value={body} maxLength={2000} rows={3} onChange={(e) => setBody(e.target.value)} placeholder="Escreva um comentário" className={inputClass} />
            {error && <p className="text-sm text-error font-medium">{error}</p>}
            <div className="flex justify-end">
              <Button variant="primary" onClick={sendComment} disabled={sending || !author.trim() || !body.trim()}>
                {sending ? "Enviando..." : "Comentar"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
