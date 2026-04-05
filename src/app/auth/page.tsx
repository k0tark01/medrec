"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useTranslation } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Sun, Moon, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { loginSchema, registerSchema } from "@/lib/validations";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { toast } from "sonner";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          setError(result.error.issues[0].message);
          setSubmitting(false);
          return;
        }
        await login(email, password);
        toast.success(t.auth.welcomeBack);
        // Login will set user state; dashboard layout handles email verification check
        router.push("/dashboard");
      } else {
        const result = registerSchema.safeParse({ name, email, password, confirmPassword });
        if (!result.success) {
          setError(result.error.issues[0].message);
          setSubmitting(false);
          return;
        }
        await register(email, password, name);
        toast.success(t.auth.createAccount);
        router.push("/auth/verify-email");
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Job Bridge</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {t.auth.brandingTitle}
          </h2>
          <p className="text-white/70 leading-relaxed mb-8">
            {t.auth.brandingDesc}
          </p>
          <div className="space-y-3">
            {[t.auth.feature1, t.auth.feature2, t.auth.feature3].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageSwitcher compact />
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>

        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Job Bridge</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            {mode === "login" ? t.auth.welcomeBack : t.auth.createAccount}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === "login" ? t.auth.signInDesc : t.auth.registerDesc}
          </p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")} className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">{t.signIn}</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">{t.register}</TabsTrigger>
            </TabsList>
          </Tabs>

          {error && (
            <Card className="mb-4 border-destructive/30 bg-destructive/5">
              <CardContent className="py-3 px-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">{t.auth.fullName}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmed Ben Ali"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {mode === "login" && (
                <div className="text-right">
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    {t.passwordReset.forgotPassword}
                  </Link>
                </div>
              )}
            </div>

            {mode === "register" && (
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
            )}
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white border-0 h-11">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? t.pleaseWait : mode === "login" ? t.signIn : t.auth.createAccountBtn}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              &larr; {t.backToHome}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
