"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { useTranslation } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileCheck,
  Shield,
  Globe,
  ChevronRight,
  Sun,
  Moon,
  Stethoscope,
  HeartPulse,
  Cog,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      router.replace("/dashboard");
    } else if (user && !profile) {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Job Bridge</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </button>
            <Link href="/auth">
              <Button variant="ghost" size="sm">{t.signIn}</Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="gradient-primary text-white border-0">
                {t.getStarted} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="w-3.5 h-3.5" />
              {t.landing.badge}
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              {t.landing.heroTitle}{" "}
              <span className="text-primary">{t.landing.heroHighlight}</span>{" "}
              {t.landing.heroTitleEnd}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              {t.landing.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth">
                <Button size="lg" className="gradient-primary text-white border-0 text-base px-8 h-12">
                  {t.landing.startApplication} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-base h-12 px-8" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                {t.landing.howItWorks} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl">
            {[
              { value: t.landing.stats.placedValue, label: t.landing.stats.placed },
              { value: t.landing.stats.approvalValue, label: t.landing.stats.approval },
              { value: t.landing.stats.processingValue, label: t.landing.stats.processing },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Professions */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">{t.landing.whoWeHelp}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
            {t.landing.whoWeHelpDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Stethoscope, title: t.landing.nurses, desc: t.landing.nursesDesc },
              { icon: HeartPulse, title: t.landing.doctors, desc: t.landing.doctorsDesc },
              { icon: Cog, title: t.landing.engineers, desc: t.landing.engineersDesc },
            ].map((p) => (
              <div key={p.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <p.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">{t.landing.howItWorksTitle}</h2>
          <p className="text-center text-muted-foreground mb-12">{t.landing.howItWorksDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: FileCheck, title: t.landing.step1Title, desc: t.landing.step1Desc },
              { step: "02", icon: FileCheck, title: t.landing.step2Title, desc: t.landing.step2Desc },
              { step: "03", icon: Shield, title: t.landing.step3Title, desc: t.landing.step3Desc },
              { step: "04", icon: Globe, title: t.landing.step4Title, desc: t.landing.step4Desc },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-6xl font-black text-primary/10 absolute -top-2 -left-1">{s.step}</div>
                <div className="relative pt-8 pl-1">
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">{t.landing.whyJobBridge}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: t.landing.features.smartTracking, desc: t.landing.features.smartTrackingDesc },
              { title: t.landing.features.dualUpload, desc: t.landing.features.dualUploadDesc },
              { title: t.landing.features.expertVerification, desc: t.landing.features.expertVerificationDesc },
              { title: t.landing.features.billing, desc: t.landing.features.billingDesc },
              { title: t.landing.features.partnerNetwork, desc: t.landing.features.partnerNetworkDesc },
              { title: t.landing.features.secure, desc: t.landing.features.secureDesc },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t.landing.ctaTitle}</h2>
          <p className="text-muted-foreground mb-8">
            {t.landing.ctaDesc}
          </p>
          <Link href="/auth">
            <Button size="lg" className="gradient-primary text-white border-0 text-base px-10 h-12">
              {t.landing.ctaButton} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
              <Globe className="w-3 h-3 text-white" />
            </div>
            <span>Job Bridge</span>
          </div>
          <span>&copy; {new Date().getFullYear()} {t.appName}. {t.landing.footerRights}</span>
        </div>
      </footer>
    </div>
  );
}
