"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Mail, Copy, Download } from "lucide-react";
import { formatBGN, formatDateTime } from "@/lib/utils";

export default function ReportsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "sent">("idle");

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("company_name", { ascending: true });

    setClients(data || []);
  }
  }

  async function loadCandidates() {
    if (!selectedClient) return;
    setStatus("generating");

    const { data } = await supabase
      .from("matches_analysis")
      .select("*, tenders(*)")
      .eq("client_id", selectedClient)
      .eq("is_included_in_report", false)
      .gte("relevance_score", 65)
      .order("relevance_score", { ascending: false })
      .limit(5);

    setCandidates(data || []);
    setStatus("idle");
    generateHtml();
  }

  function generateHtml() {
    const client = clients.find((c) => c.id === selectedClient);
    const listHtml = candidates
      .map(
        (m) => `
      <li style="margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <strong style="color:#0f172a;">${m.tenders?.title || "Без заглавие"}</strong><br/>
        <span style="color:#64748b; font-size:14px;">${m.tenders?.contracting_authority || "—"} | ${m.relevance_score}/100</span><br/>
        <span style="color:#64748b; font-size:14px;">Крайни срок: ${formatDateTime(m.tenders?.submission_deadline)}</span><br/>
        <span style="color:#64748b; font-size:14px;">Стойност: ${formatBGN(m.tenders?.estimated_value_bgn ? Number(m.tenders.estimated_value_bgn) : null)}</span><br/>
        <em style="color:#64748b; font-size:13px;">${m.verdict || "—"}</em>
      </li>`
      )
      .join("");

    setPreviewHtml(`
      <!DOCTYPE html>
      <html lang="bg">
      <head><meta charset="UTF-8"><title>Отчет за обществени поръчки</title></head>
      <body style="font-family: Arial, sans-serif; color:#1e293b; line-height:1.6; max-width:600px; margin:0 auto; padding:20px;">
        <h1 style="color:#0f172a; border-bottom:2px solid #0f172a; padding-bottom:8px;">Тендър Радар — Отчет за поръчки</h1>
        <p>Здравейте, ${client?.company_name || "Уважаеми клиент"}!</p>
        <p>Ето подходящите обществени поръчки за вашата фирма:</p>
        <ul>${listHtml}</ul>
        <p style="color:#64748b; font-size:13px; margin-top:24px;">Този отчет е генериран автоматично от Tenders Radar.</p>
      </body>
      </html>
    `);
  }

  async function sendReport() {
    if (!selectedClient || candidates.length === 0) return;

    setStatus("sent");

    await supabase.from("outbound_reports").insert({
      client_id: selectedClient,
      tenders_count: candidates.length,
      delivery_channel: "email",
      delivery_status: "sent",
    });

    const ids = candidates.map((c) => c.id);
    await supabase.from("matches_analysis").update({ is_included_in_report: true }).in("id", ids);

    alert(`Отчетът е изпратен с ${candidates.length} поръчки.`);
    setCandidates([]);
    setPreviewHtml("");
  }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Генератор на отчети</h1>
          <p className="text-muted-foreground text-sm">
            Събирайте най-добрите поръчки и ги изпратете на клиента
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Изберете клиент</CardTitle>
            </CardHeader>
            <CardContent className="py-0 space-y-2">
              {clients.map((c) => (
                <Button
                  key={c.id}
                  variant={selectedClient === c.id ? "default" : "outline"}
                  size="sm"
                  className="w-full text-left justify-between"
                  onClick={() => setSelectedClient(c.id)}
                >
                  <span>{c.company_name}</span>
                  <span className="text-xs opacity-60">{c.delivery_channel}</span>
                </Button>
              ))}
              {clients.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Няма клиенти
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          {selectedClient ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button onClick={loadCandidates} disabled={status === "generating"}>
                  {status === "generating" ? "Генериране..." : (
                    <>
                      <RefreshCw size={16} /> Преглед на кандидати
                    </>
                  )}
                </Button>
                <Badge variant={candidates.length > 0 ? "default" : "secondary"}>
                  {candidates.length} кандидата
                </Badge>
              </div>

              {candidates.length > 0 && (
                <div className="bg-card border rounded-xl p-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Топ поръчки за отчета</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0 space-y-3">
                    {candidates.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded border border-border bg-background"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {m.tenders?.title || "Без заглавие"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {m.tenders?.contracting_authority || "—"} •
                            {m.relevance_score}/100
                          </div>
                        </div>
                        <Badge variant="default">
                          {formatBGN(
                            m.tenders?.estimated_value_bgn
                              ? Number(m.tenders.estimated_value_bgn)
                              : null
                          )}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </div>
              )}

              <div className="bg-primary p-6 rounded-xl text-primary-foreground">
                <h3 className="font-semibold mb-4">
                  Предварителен преглед на имейла
                </h3>
                <div
                  className="bg-background rounded p-4 border border-border max-h-64 overflow-y-auto text-sm text-foreground mb-4"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(previewHtml)
                    }
                  >
                    <Copy size={16} /> Копирай HTML
                  </Button>
                  {candidates.length > 0 && (
                    <Button
                      onClick={sendReport}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Mail size={16} /> Изпрати отчет
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>Изберете клиент от лявото меню.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}