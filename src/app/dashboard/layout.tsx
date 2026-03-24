"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, emailVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
    if (!loading && user && !emailVerified) router.replace("/auth/verify-email");
    if (!loading && user && emailVerified && !profile) router.replace("/onboarding");
  }, [loading, user, profile, emailVerified, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !emailVerified || !profile) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  );
}
