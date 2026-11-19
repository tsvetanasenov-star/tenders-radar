"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (err) {
      setError(err.message || "Грешка при вход");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-full flex flex-col">
      <nav className="bg-primary border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Tenders Radar
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 bg-background">
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">Вход в профила</CardTitle>
              <p className="text-muted-foreground text-sm">
                Внесете вашите данни за достъп до таблото
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="ime@firma.bg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Вход..." : "Вход"}
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Нямате акаунт? Обранете се към администратора за достъп.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}