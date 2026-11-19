"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Send, Building2 } from "lucide-react";

export default function ClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    delivery_channel: "email",
    delivery_target: "",
    keywords: "",
    regions: "",
    min_budget_bgn: "",
    client_notes: "",
  });

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
      .order("created_at", { ascending: false });

    setClients(data || []);
    setLoading(false);
  }

  async function createClientProfile(e: React.FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const keywords = form.keywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const regions = form.regions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      company_name: form.company_name,
      contact_name: form.contact_name || null,
      delivery_channel: form.delivery_channel,
      delivery_target: form.delivery_target,
      keywords,
      regions,
      min_budget_bgn: parseFloat(form.min_budget_bgn) || 0,
      client_notes: form.client_notes || null,
    });

    if (!error) {
      setOpen(false);
      setForm({
        company_name: "",
        contact_name: "",
        delivery_channel: "email",
        delivery_target: "",
        keywords: "",
        regions: "",
        min_budget_bgn: "",
        client_notes: "",
      });
      loadClients();
    }
  }

  const planBadge = (status: string) => {
    switch (status) {
      case "active_paid": return <Badge variant="default">Активен абонамент</Badge>;
      case "paused": return <Badge variant="secondary">Поставен на пауза</Badge>;
      default: return <Badge variant="outline">Лийд / Опитен период</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Клиенти и профили</h1>
          <p className="text-muted-foreground text-sm">
            Управлявайте фирмите, ключови думи и настройки за доставка
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} /> Добави фирма
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Всички профили</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="-mx-4 -my-2 overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-3 pl-4 pr-2">Фирма</th>
                      <th className="pb-3 pl-4 pr-2">Контакт</th>
                      <th className="pb-3 pl-4 pr-2">Ключови думи</th>
                      <th className="pb-3 pl-4 pr-2">Региони</th>
                      <th className="pb-3 pl-4 pr-2">Канал</th>
                      <th className="pb-3 pl-4 pr-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr key={c.id} className="border-b border-border hover:bg-accent/50">
                        <td className="py-3 pl-4 pr-2">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-muted-foreground" />
                            <span className="font-medium">{c.company_name}</span>
                          </div>
                        </td>
                        <td className="py-3 pl-4 pr-2 text-muted-foreground">{c.contact_name || "—"}</td>
                        <td className="py-3 pl-4 pr-2 text-muted-foreground">{c.keywords?.join(", ") || "—"}</td>
                        <td className="py-3 pl-4 pr-2 text-muted-foreground">{c.regions?.join(", ") || "—"}</td>
                        <td className="py-3 pl-4 pr-2">
                          <div className="flex items-center gap-2">
                            {c.delivery_channel === "email" ? <Mail size={14} /> : <Send size={14} />}
                            <span className="text-xs">{c.delivery_channel}</span>
                          </div>
                        </td>
                        <td className="py-3 pl-4 pr-2">{planBadge(c.plan_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {clients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground"><p>Няма добавени фирми.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border shadow-2xl flex flex-col m-4 md:m-8">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Нова фирма</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Затвори</Button>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={createClientProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Име на фирма</label>
                  <Input placeholder="ЕООД 'Строител'" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Контактно лице</label>
                  <Input placeholder="Иван Петров" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Канал за доставка</label>
                  <select value={form.delivery_channel} onChange={(e) => setForm({ ...form, delivery_channel: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="email">Имейл</option><option value="telegram">Telegram</option></select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Целеви адрес (имейл / Telegram потребител)</label>
                  <Input placeholder="ivan@firma.bg или @ivan_bot" value={form.delivery_target} onChange={(e) => setForm({ ...form, delivery_target: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Ключови думи (чрез запетая)</label>
                  <Input placeholder="строителство, CPV 45210000" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Региони (чрез запетая)</label>
                  <Input placeholder="София, Пловдив, Варна" value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Минимен бюджет (лв.)</label>
                  <Input type="number" placeholder="0" value={form.min_budget_bgn} onChange={(e) => setForm({ ...form, min_budget_bgn: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Бележки / ограничения</label>
                  <Input placeholder="Ограничен капацитет, само град Sofia" value={form.client_notes} onChange={(e) => setForm({ ...form, client_notes: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Запази фирмата</Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}