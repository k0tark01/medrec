"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Globe, Mail, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmailWaitingPage() {
  const { user, emailVerified, refreshUser, sendVerificationEmail, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleResend() {
    setResending(true);
    try {
      await sendVerificationEmail();
      toast.success(t.emailVerification.resent);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setResending(false);
    }
  }

  async function handleCheckStatus() {
    setChecking(true);
    try {
      await refreshUser();
      // Re-read after refresh
      // We need a small delay for state to propagate
      setTimeout(async () => {
        // refreshUser sets new user, but we need to check from the hook
        // Just navigate — the dashboard layout will handle redirection if not verified
        router.push("/dashboard");
        setChecking(false);
      }, 500);
    } catch {
      toast.error(t.emailVerification.notVerified);
      setChecking(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/auth");
  }

  // If already verified, redirect
  if (emailVerified) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold">Job Bridge</span>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t.emailVerification.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">
              {t.emailVerification.desc}
            </p>
            {user && (
              <p className="text-sm font-medium text-foreground mb-6">{user.email}</p>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full gradient-primary text-white border-0"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {checking ? t.emailVerification.checking : "I've verified my email"}
              </Button>

              <Button
                onClick={handleResend}
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {t.emailVerification.resend}
              </Button>

              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.signOut}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
