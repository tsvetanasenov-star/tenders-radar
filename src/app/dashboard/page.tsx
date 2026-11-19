import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, DollarSign, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { count: matchesCount } = await supabase
    .from("matches_analysis")
    .select("*", { count: "exact", head: true })
    .eq("client_id", client?.id);

  const { data: highMatches } = await supabase
    .from("matches_analysis")
    .select("*, tenders(*)")
    .eq("client_id", client?.id)
    .gte("relevance_score", 80)
    .order("analyzed_at", { ascending: false })
    .limit(5);

  const { data: reports } = await supabase
    .from("outbound_reports")
    .select("*")
    .eq("client_id", client?.id)
    .order("sent_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Активни съвпадения" value={matchesCount || 0} icon={TrendingUp} color="text-green-600 bg-green-50" subtitle="с рейтинг над 60" />
        <StatCard title="Висок рейтинг (80+)" value={highMatches?.length || 0} icon={DollarSign} color="text-blue-600 bg-blue-50" subtitle="препоръчани за преглед" />
        <StatCard title="Изпратени отчети" value={reports?.length || 0} icon={MailIcon} color="text-indigo-600 bg-indigo-50" subtitle="за текущия период" />
        <StatCard title="Статус абонамент" value={client?.plan_status === "active_paid" ? "Активен" : "Лийд"} icon={Clock} color={client?.plan_status === "active_paid" ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50"} subtitle={client?.frequency || "—"} />
      </div>
      <div className="bg-card border rounded-xl p-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Последни високоскор matching</CardTitle>
          <a href="/dashboard/matches" className="text-sm text-primary hover:underline">Всички поръчки →</a>
        </CardHeader>
        <CardContent>
          {(highMatches?.length || 0) > 0 ? (
            <div className="space-y-3">
              {highMatches.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{m.tenders?.title || "Без заглавие"}</div>
                    <div className="text-xs text-muted-foreground">{m.tenders?.contracting_authority || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{m.relevance_score}/100</div>
                    <Badge variant={m.relevance_score >= 80 ? "default" : "outline"}>Висок рейтинг</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
              <p>Няма намерени съвпадения с висок рейтинг.</p>
              <p className="text-xs mt-2">Поръчките се анализират след импортиране от скрейпера.</p>
            </div>
          )}
        </CardContent>
      </div>
      <div className="bg-card border rounded-xl p-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Последни отчети</CardTitle>
        </CardHeader>
        <CardContent>
          {(reports?.length || 0) > 0 ? (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.tenders_count} поръчки в отчета</div>
                    <div className="text-xs text-muted-foreground">{formatDate(r.sent_at)} · {r.delivery_status}</div>
                  </div>
                  <Badge variant={r.delivery_status === "sent" ? "default" : r.delivery_status === "failed" ? "destructive" : "secondary"}>{r.delivery_status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground"><p>Няма изпратени отчети.</p></div>
          )}
        </CardContent>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string; value: number | string; icon: React.ElementType; color: string; subtitle: string }) {
  return (
    <Card className="p-5">
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={20} /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
}