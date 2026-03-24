"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { useTheme } from "@/lib/theme-context";
import { useTranslation } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Sun, Moon, Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const resetUrl = `${window.location.origin}/auth/reset-password`;
      await account.createRecovery(email, resetUrl);
      setSent(true);
      toast.success(t.passwordReset.sent);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.auth.somethingWrong;
      toast.error(message);
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
          {t.passwordReset.title}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          {t.passwordReset.desc}
        </p>

        {sent ? (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="py-6 px-4 text-center">
              <Mail className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">{t.passwordReset.sent}</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.passwordReset.email}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white border-0 h-11">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? t.passwordReset.sending : t.passwordReset.sendLink}
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
