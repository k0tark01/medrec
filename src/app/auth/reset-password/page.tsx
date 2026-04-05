"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { useTheme } from "@/lib/theme-context";
import { useTranslation } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Sun, Moon, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const secret = searchParams.get("secret") ?? "";
  const expire = searchParams.get("expire") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const parsedExpire = expire ? Date.parse(expire) : NaN;
  const isExpired = expire ? Number.isNaN(parsedExpire) || parsedExpire <= Date.now() : false;
  const isValidLink = userId && secret && !isExpired;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t.passwordReset.passwordMismatch);
      return;
    }
    setSubmitting(true);
    try {
      const checkResponse = await fetch("/api/auth/complete-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          secret,
          action: "check",
          expire,
        }),
      });

      const checkData = (await checkResponse.json().catch(() => ({}))) as { error?: string };

      if (!checkResponse.ok) {
        throw new Error(checkData.error || "check-recovery-failed");
      }

      await account.updateRecovery(userId, secret, password);

      const markResponse = await fetch("/api/auth/complete-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          secret,
          action: "mark-used",
          password,
          confirmPassword,
          expire,
        }),
      });

      const markData = (await markResponse.json().catch(() => ({}))) as { error?: string };

      if (!markResponse.ok) {
        throw new Error(markData.error || "mark-recovery-failed");
      }

      setSuccess(true);
      toast.success(t.passwordReset.success);
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher compact />
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Job Bridge</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t.passwordReset.resetPassword}
        </h1>

        {!isValidLink ? (
          <Card className="mt-4 border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 px-4 text-center">
              <p className="text-sm text-destructive">{t.passwordReset.invalidLink}</p>
            </CardContent>
          </Card>
        ) : success ? (
          <Card className="mt-4 border-green-500/30 bg-green-500/5">
            <CardContent className="py-6 px-4 text-center">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">{t.passwordReset.success}</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t.passwordReset.newPassword}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.minChars}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.passwordReset.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.auth.minChars}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white border-0 h-11">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? t.passwordReset.resetting : t.passwordReset.resetPassword}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/auth" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> {t.passwordReset.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
