"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useTranslation } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { account, teams } from "@/lib/appwrite";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Sun, Moon, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/auth-errors";

function StaffActivateContent() {
  const params = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { refreshUser } = useAuth();

  const userId = params.get("userId") ?? params.get("userid") ?? "";
  const secret = params.get("secret") ?? params.get("token") ?? "";
  const teamId =
    params.get("teamId") ??
    params.get("teamid") ??
    params.get("team") ??
    process.env.NEXT_PUBLIC_APPWRITE_STAFF_TEAM_ID ??
    "";
  const membershipId =
    params.get("membershipId") ??
    params.get("membershipid") ??
    params.get("membership") ??
    "";

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Only validate required token fields on the client and let Appwrite enforce real expiry/secret checks.
  const isValidLink = Boolean(userId && secret && teamId && membershipId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error(t.auth.nameRequired);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordReset.passwordMismatch);
      return;
    }

    setSubmitting(true);
    try {
      // If invite is opened while another user is logged in, clear session to avoid token mismatch issues.
      try {
        const current = await account.get();
        if (current?.$id && current.$id !== userId) {
          await account.deleteSession("current");
        }
      } catch {
        // No active session is fine.
      }

      await teams.updateMembershipStatus({
        teamId,
        membershipId,
        userId,
        secret,
      });

      await account.updateName({ name: fullName.trim() });
      await account.updatePassword({ password });

      const jwt = await account.createJWT();
      const response = await fetch("/api/auth/staff-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          jwt: jwt.jwt,
          fullName,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; email?: string };

      if (!response.ok) {
        throw new Error(data.error || "invite-complete-failed");
      }

      if (!data.email) {
        throw new Error("invite-email-missing");
      }

      setSuccess(true);
      toast.success(t.staffInvite.success);
      await refreshUser();
      window.location.assign("/dashboard");
    } catch (err) {
      const fallbackMessage = getAuthErrorMessage(err, t);
      const raw = err instanceof Error ? err.message : "";
      const lower = raw.toLowerCase();

      if (lower.includes("secret") || lower.includes("membership") || lower.includes("expired") || lower.includes("invite")) {
        toast.error(t.staffInvite.invalidLink);
      } else if (raw) {
        toast.error(raw);
      } else {
        toast.error(fallbackMessage);
      }
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

        <h1 className="text-2xl font-bold text-foreground mb-1">{t.staffInvite.title}</h1>
        <p className="text-muted-foreground text-sm mb-6">{t.staffInvite.desc}</p>

        {!isValidLink ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 px-4 text-center text-sm text-destructive">
              {t.staffInvite.invalidLink}
            </CardContent>
          </Card>
        ) : success ? (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="py-6 px-4 text-center">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">{t.staffInvite.success}</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.auth.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmed Ben Ali"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.minChars}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.minChars}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? t.auth.hidePassword : t.auth.showPassword}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white border-0 h-11">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? t.pleaseWait : t.staffInvite.completeBtn}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function StaffActivatePage() {
  return (
    <Suspense>
      <StaffActivateContent />
    </Suspense>
  );
}
