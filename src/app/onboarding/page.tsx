"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import type { Occupation, AcademicStatus } from "@/lib/types";
import { useTranslation } from "@/lib/language-context";
import { Briefcase, GraduationCap, ArrowRight, Stethoscope, HeartPulse, Cog, CircleEllipsis, Globe, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { onboardingSchema } from "@/lib/validations";
import { toast } from "sonner";

const OCCUPATION_ICONS: Record<Occupation, LucideIcon> = {
  Nurse: Stethoscope,
  Doctor: HeartPulse,
  Engineer: Cog,
  Other: CircleEllipsis,
};

export default function OnboardingPage() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [occupation, setOccupation] = useState<Occupation | "">("");  const [customOccupation, setCustomOccupation] = useState("");  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "">("");
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingStaff, setCheckingStaff] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (profile) {
      router.replace("/dashboard");
      return;
    }

    let canceled = false;

    async function guardStaffOnboarding() {
      try {
        const staffRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, [
          Query.equal("userId", user.$id),
          Query.limit(1),
        ]);

        if (!canceled && staffRes.documents.length > 0) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // no-op
      } finally {
        if (!canceled) setCheckingStaff(false);
      }
    }

    void guardStaffOnboarding();

    return () => {
      canceled = true;
    };
  }, [loading, user, profile, router]);

  if (loading || checkingStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (profile) {
      router.replace("/dashboard");
      return;
    }

    const staffRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, [
      Query.equal("userId", user!.$id),
      Query.limit(1),
    ]);

    if (staffRes.documents.length > 0) {
      toast.error(t.onboarding.staffBlocked);
      router.replace("/dashboard");
      return;
    }

    const result = onboardingSchema.safeParse({ fullName, phone: phone || undefined, occupation: occupation || undefined, academicStatus: academicStatus || undefined });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, "unique()", {
        userId: user!.$id,
        fullName: fullName.trim(),
        email: user!.email,
        phone: phone.trim() || undefined,
        occupation,
        academicStatus,
        currentStatus: "Draft",
        role: "applicant",
      });
      await refreshProfile();
      toast.success(t.onboarding.continueBtn);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.onboarding.failedCreate);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-2/5 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Job Bridge</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
            {t.onboarding.setupTitle}
          </h2>
          <p className="text-white/70 leading-relaxed">
            {t.onboarding.setupDesc}
          </p>
          <div className="mt-8 space-y-3 text-white/60 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">1</div>
              {t.onboarding.step1}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/40">2</div>
              {t.onboarding.step2}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/40">3</div>
              {t.onboarding.step3}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Job Bridge</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">{t.onboarding.title}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {t.onboarding.desc}
          </p>

          {error && (
            <Card className="mb-4 border-destructive/30 bg-destructive/5">
              <CardContent className="py-3 px-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.onboarding.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.onboarding.phone}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.onboarding.phonePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Briefcase className="inline w-4 h-4 mr-1" /> {t.onboarding.occupation}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([
                  { value: "Nurse" as Occupation, label: t.onboarding.nurse },
                  { value: "Doctor" as Occupation, label: t.onboarding.doctor },
                  { value: "Engineer" as Occupation, label: t.onboarding.engineer },
                  { value: "Other" as Occupation, label: t.onboarding.other },
                ]).map((o) => {
                  const Icon = OCCUPATION_ICONS[o.value];
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setOccupation(o.value)}
                      className={`border rounded-xl p-4 text-center transition-all ${
                        occupation === o.value
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`w-7 h-7 mx-auto mb-1 ${occupation === o.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium text-foreground">{o.label}</span>
                    </button>
                  );
                })}
              </div>
              {occupation === "Other" && (
                <Input
                  type="text"
                  placeholder={t.onboarding.otherPlaceholder}
                  value={customOccupation}
                  onChange={(e) => setCustomOccupation(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>
                <GraduationCap className="inline w-4 h-4 mr-1" /> {t.onboarding.academicStatus}
              </Label>
              <div className="space-y-2">
                {([
                  { value: "Graduated" as AcademicStatus, label: t.onboarding.graduated },
                  { value: "Student" as AcademicStatus, label: t.onboarding.student },
                  { value: "Ausbildung" as AcademicStatus, label: t.onboarding.ausbildung },
                ]).map((s) => (
                  <label
                    key={s.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      academicStatus === s.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="academicStatus"
                      value={s.value}
                      checked={academicStatus === s.value}
                      onChange={() => setAcademicStatus(s.value)}
                      className="mr-3 accent-blue-600"
                    />
                    <span className="text-sm text-foreground">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white border-0 h-11">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? t.onboarding.creatingProfile : (
                <>{t.onboarding.continueBtn} <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
