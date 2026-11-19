"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Clock, MapPin, EuroSign, AlertTriangle, ExternalLink } from "lucide-react";
import { formatBGN, formatDateTime, daysRemaining, relevanceColor } from "@/lib/utils";
import { MatchSummaryJson } from "@/types/database";

export default function MatchesPage() {
  const supabase = createClient();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState(60);
  const [filterRegion, setFilterRegion] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerMatch, setDrawerMatch] = useState<any | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!clients) return;

    const { data } = await supabase
      .from("matches_analysis")
      .select("*, tenders(*)")
      .eq("client_id", clients.id)
      .order("analyzed_at", { ascending: false });

    setMatches(data || []);
    setLoading(false);
  }

  const filtered = matches.filter((m) => {
    const scoreOk = m.relevance_score >= filterScore;
    const regionOk = !filterRegion || m.tenders?.region?.includes(filterRegion);
    const statusOk =
      statusFilter === "all" ||
      (statusFilter === "new" && !m.is_included_in_report) ||
      (statusFilter === "reported" && m.is_included_in_report);
    const notExpired =
      !m.tenders?.submission_deadline ||
      new Date(m.tenders.submission_deadline) > new Date();
    return scoreOk && regionOk && statusOk && notExpired;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Подходящи поръчки</h1>
          <p className="text-muted-foreground text-sm">
            Филтрирайте и прегледайте анализирани поръчки за вашата фирма
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDrawerMatch(null)}>
            Ресет на филтрите
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-3 lg:col-span-2">
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Филтри</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-0">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">
                  Минимален рейтинг
                </label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={filterScore} onChange={(e) => setFilterScore(parseInt(e.target.value) || 0)} className="w-20" />
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">Регион</label>
                <Input placeholder="Напр. София" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">Статус</label>
                <div className="flex gap-2">
                  <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>Всички</Button>
                  <Button variant={statusFilter === "new" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("new")}>Нови</Button>
                  <Button variant={statusFilter === "reported" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("reported")}>В отчетите</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-9 lg:col-span-10">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">Зареждане на поръчки...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><p>Няма намерени поръчки по избраните филтри.</p></div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((m) => (
                <MatchCard key={m.id} match={m} onViewAnalysis={() => setDrawerMatch(m)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {drawerMatch && <AnalysisDrawer match={drawerMatch} onClose={() => setDrawerMatch(null)} />}
    </div>
  );
}

function MatchCard({ match, onViewAnalysis }: { match: any; onViewAnalysis: () => void }) {
  const tender = match.tenders;
  const daysLeft = daysRemaining(tender?.submission_deadline);
  const isUrgent = daysLeft !== null && daysLeft <= 5;
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={match.relevance_score >= 80 ? "default" : match.relevance_score >= 60 ? "secondary" : "outline"}>{match.relevance_score}/100</Badge>
            {isUrgent && <Badge variant="destructive" className="text-xs">Краен срок под 5 дни</Badge>}
          </div>
          <div className="text-sm font-semibold">{tender?.title || "Без заглавие"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{tender?.contracting_authority || "—"}</div>
        </div>
        <ExternalLink size={16} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 text-sm mb-3">
          <div className="flex items-center gap-1"><EuroSign size={14} /><span className="font-medium">{formatBGN(tender?.estimated_value_bgn ? Number(tender.estimated_value_bgn) : null)}</span></div>
          <div className="flex items-center gap-1"><Clock size={14} /><span className={`text-xs ${isUrgent ? "text-destructive font-medium" : "text-muted-foreground"}`}>{tender?.submission_deadline ? formatDateTime(tender.submission_deadline) : "—"}</span></div>
          <div className="flex items-center gap-1"><MapPin size={14} /><span className="text-xs text-muted-foreground">{tender?.region || "—"}</span></div>
        </div>
        <div className="text-xs text-muted-foreground mb-3">{match.verdict || "Няма заключение"}</div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onViewAnalysis} className="w-full">Пълен анализ</Button>
          <a href={tender?.source_url || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Оригинална обява</a>
        </div>
      </CardContent>
    </Card>
  );
}
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function AnalysisDrawer({
  match,
  onClose,
}: {
  match: any;
  onClose: () => void;
}) {
  const summary: MatchSummaryJson = match.summary_json || {
    summary_5_bullets: [],
    key_dates: { submission_deadline: "", questions_deadline: "", execution_duration: "" },
    budget: { estimated_value_bgn_no_vat: "", guarantee_participation: "", guarantee_performance: "" },
    requirements_for_sme: { specific_experience: "", financial_requirements: "", team_and_equipment: "", subcontractors_allowed: "" },
    red_flags_and_risks: [],
    next_action_checklist: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl flex flex-col h-[90vh] mx-4 md:mx-8 md:my-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Пълен AI анализ</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Затвори</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-primary p-3 rounded-lg text-primary-foreground">
              <div className="text-xs text-primary/30 mb-1">Рейтинг на съвпадение</div>
              <div className="text-2xl font-bold">{match.relevance_score}/100</div>
            </div>
            <div className="bg-background p-3 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-1">Възложител</div>
              <div className="text-sm font-medium">{match.tenders?.contracting_authority || "—"}</div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold flex items-center gap-2"><FileTextIcon size={16} /> Заключение</h3>
            <p className="text-sm">{match.verdict || "—"}</p>
          </div>
          <Section title="Основни 5 точки" items={summary.summary_5_bullets} />
          <Section title="Ключови дати" items={[`Краен срок за оферти: ${summary.key_dates.submission_deadline}`, `Въпроси/разяснения: ${summary.key_dates.questions_deadline}`, `Срок за изпълнение: ${summary.key_dates.execution_duration}`]} />
          <Section title="Бюджет" items={[`Прогнозна стойност (без ДДС): ${summary.budget.estimated_value_bgn_no_vat}`, `Гаранция за участие: ${summary.budget.guarantee_participation}`, `Гаранция за изпълнение: ${summary.budget.guarantee_performance}`]} />
          <Section title="Изисквания за МСП" items={[`Опит: ${summary.requirements_for_sme.specific_experience}`, `Финансови изисквания: ${summary.requirements_for_sme.financial_requirements}`, `Екип/лицензи: ${summary.requirements_for_sme.team_and_equipment}`, `Подизпълнители: ${summary.requirements_for_sme.subcontractors_allowed}`]} />
          <Section title="Червени флагове / Рискове" items={summary.red_flags_and_risks} variant="destructive" />
          <Section title="Чеклист за действие" items={summary.next_action_checklist} variant="default" />
          <div className="pt-4 border-t border-border">
            <a href={match.tenders?.source_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"><ExternalLinkIcon size={16} /> Отидете на оригиналната обява</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>);
}

function ExternalLinkIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /></svg>);
}

function Section({ title, items, variant = "default" }: { title: string; items: string[]; variant?: "default" | "destructive" }) {
  const color = variant === "destructive" ? "text-destructive" : "text-primary";
  return (
    <div className="space-y-2">
      <h3 className={`text-sm font-semibold ${color}`}><span className="mr-1">{title}</span></h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}