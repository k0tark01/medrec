"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, emailVerified, refreshProfile } = useAuth();
  const router = useRouter();
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (!emailVerified) {
      router.replace("/auth/verify-email");
      return;
    }

    if (profile) {
      setCheckingProfile(false);
      return;
    }

    let canceled = false;

    async function resolveProfile() {
      setCheckingProfile(true);
      try {
        const jwt = await account.createJWT();
        const response = await fetch("/api/auth/me-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwt: jwt.jwt }),
        });

        if (!response.ok) {
          if (!canceled) router.replace("/onboarding");
          return;
        }

        const data = (await response.json()) as { profile: unknown | null };

        if (data.profile) {
          await refreshProfile();
          return;
        }

        if (!canceled) router.replace("/onboarding");
      } catch {
        if (!canceled) router.replace("/onboarding");
      } finally {
        if (!canceled) setCheckingProfile(false);
      }
    }

    void resolveProfile();

    return () => {
      canceled = true;
    };
  }, [loading, user, profile, emailVerified, router, refreshProfile]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !emailVerified || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  );
}
