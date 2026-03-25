"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  ClipboardList,
  LogOut,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  UserPen,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { useTranslation } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const role = profile?.role ?? "applicant";

  const links = [
    { href: "/dashboard", label: t.sidebar.dashboard, icon: LayoutDashboard, roles: ["applicant", "reviewer", "admin"] },
    { href: "/dashboard/profile", label: t.profileEdit.editProfile, icon: UserPen, roles: ["applicant"] },
    { href: "/dashboard/documents", label: t.sidebar.documents, icon: FileText, roles: ["applicant"] },
    { href: "/dashboard/billing", label: t.sidebar.billing, icon: CreditCard, roles: ["applicant", "admin"] },
    { href: "/dashboard/review", label: t.sidebar.reviewQueue, icon: ClipboardList, roles: ["reviewer", "admin"] },
    { href: "/dashboard/users", label: t.sidebar.users, icon: Users, roles: ["admin"] },
    { href: "/dashboard/admin", label: t.sidebar.adminPanel, icon: Shield, roles: ["admin"] },
  ].filter((l) => l.roles.includes(role));

  const nav = (
    <nav className="flex h-full min-h-0 flex-col overflow-hidden lg:sticky lg:top-0 lg:h-screen">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">Job Bridge</h2>
            <p className="text-[11px] text-muted-foreground capitalize">{role} {t.nav.portal}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 py-4 space-y-1 px-3 overflow-y-auto">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{profile?.fullName}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
            title={theme === "light" ? t.sidebar.switchDark : t.sidebar.switchLight}
          >
            {theme === "light" ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>
        <Separator className="mb-3" />
        <LanguageSwitcher />
        <Separator className="my-3" />
        <Button
          variant="destructive"
          onClick={logout}
          className="w-full justify-center h-10 text-sm font-semibold"
        >
          <LogOut className="w-4 h-4 mr-2" /> {t.signOut}
        </Button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-card rounded-lg shadow-md border border-border p-2"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-screen lg:h-auto bg-card border-r border-border transform transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
