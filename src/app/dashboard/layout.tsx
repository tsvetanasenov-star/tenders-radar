"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard },
  { href: "/dashboard/matches", label: "Подходящи поръчки", icon: FileText },
  { href: "/dashboard/clients", label: "Клиенти / Профили", icon: Users },
  { href: "/dashboard/reports", label: "Отчети", icon: Mail },
];

export default function DashboardLayout({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // Check auth on mount
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/50 backdrop-blur-sm",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full border-r border-border bg-card z-30 w-64 flex flex-col transition-all duration-300",
          !sidebarOpen ? "translate-x-[-100%]" : ""
        )}
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Tenders Radar
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
          {isAdmin && (
            <a
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Users size={18} />
              Администрация
            </a>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="w-full"
          >
            <LogOut size={16} className="mr-2" />
            Изход
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar button */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-md bg-primary text-primary-foreground"
        onClick={() => setSidebarOpen(true)}
        aria-label="Отвори менюто"
      >
        <Menu size={20} />
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">
            {pathname === "/dashboard"
              ? "Табло"
              : pathname === "/dashboard/matches"
              ? "Подходящи поръчки"
              : pathname === "/dashboard/clients"
              ? "Клиенти и профили"
              : pathname === "/dashboard/reports"
              ? "Отчети"
              : ""}
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-muted-foreground">
              {new Date().toLocaleDateString("bg-BG")}
            </span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}