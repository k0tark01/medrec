"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
    if (!loading && user && !profile) router.replace("/onboarding");
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-bold" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  );
}
