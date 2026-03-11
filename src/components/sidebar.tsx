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
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme-context";

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const role = profile?.role ?? "applicant";

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["applicant", "reviewer", "admin"] },
    { href: "/dashboard/documents", label: "Documents", icon: FileText, roles: ["applicant"] },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard, roles: ["applicant", "admin"] },
    { href: "/dashboard/review", label: "Review Queue", icon: ClipboardList, roles: ["reviewer", "admin"] },
    { href: "/dashboard/users", label: "Users", icon: Users, roles: ["admin"] },
    { href: "/dashboard/admin", label: "Admin Panel", icon: Shield, roles: ["admin"] },
  ].filter((l) => l.roles.includes(role));

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="p-6 border-b border-line">
        <h2 className="text-lg font-bold text-ink">Job Bridge</h2>
        <p className="text-xs text-ink-muted mt-0.5 capitalize">{role} Portal</p>
      </div>
      <div className="flex-1 py-4 space-y-1 px-3">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-accent-50 text-accent-bolder"
                  : "text-ink-secondary hover:bg-card-hover hover:text-ink"
              }`}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-line">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-ink truncate">{profile?.fullName}</div>
            <div className="text-xs text-ink-muted truncate">{profile?.email}</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex-shrink-0 p-2 rounded-lg bg-dim hover:bg-card-hover transition"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="w-4 h-4 text-ink-muted" /> : <Sun className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-err hover:text-err"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-card rounded-lg shadow p-2"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-line transform transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
