"use client";

import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { useTranslation } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Briefcase, GraduationCap, Save, Stethoscope, Wrench, HeartPulse, CircleEllipsis, User, Phone } from "lucide-react";
import { toast } from "sonner";
import type { Occupation, AcademicStatus } from "@/lib/types";

const OCCUPATION_OPTIONS: { value: Occupation; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "Nurse", icon: HeartPulse },
  { value: "Doctor", icon: Stethoscope },
  { value: "Engineer", icon: Wrench },
  { value: "Other", icon: CircleEllipsis },
];

export default function ProfileEditPage() {
  const { profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [occupation, setOccupation] = useState<Occupation>(profile?.occupation ?? "Nurse");
  const [customOccupation, setCustomOccupation] = useState("");
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus>(profile?.academicStatus ?? "Graduated");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile && profile.role !== "applicant") {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  if (!profile) return null;
  if (profile.role !== "applicant") return null;

  const profileLocked = profile.currentStatus !== "Draft";

  const occupationLabels: Record<Occupation, string> = {
    Nurse: t.onboarding.nurse,
    Doctor: t.onboarding.doctor,
    Engineer: t.onboarding.engineer,
    Other: t.onboarding.other,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (profileLocked) {
      toast.error("Profile editing is locked while your application is under review.");
      return;
    }
    if (!fullName.trim()) return;
    setSubmitting(true);
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile!.$id, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        occupation,
        academicStatus,
      });
      await refreshProfile();
      toast.success(t.profileEdit.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.profileEdit.failed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t.profileEdit.title}</h1>
        <p className="text-base text-muted-foreground mt-1">{t.profileEdit.desc}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {profileLocked && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
            Profile fields are locked while your dossier is in review. They will reopen if corrections are requested.
          </div>
        )}

        {/* Personal Info Card */}
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {t.onboarding.fullName}
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 text-base"
                disabled={profileLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                {t.onboarding.phone}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.onboarding.phonePlaceholder}
                className="h-12 text-base"
                disabled={profileLocked}
              />
            </div>
          </CardContent>
        </Card>

        {/* Occupation Card */}
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              {t.onboarding.occupation}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {OCCUPATION_OPTIONS.map((o) => {
                const Icon = o.icon;
                const isActive = occupation === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setOccupation(o.value)}
                    disabled={profileLocked}
                    className={`border rounded-xl p-5 text-center transition-all cursor-pointer ${
                      isActive
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {occupationLabels[o.value]}
                    </span>
                  </button>
                );
              })}
            </div>
            {occupation === "Other" && (
              <div className="pt-1">
                <Input
                  type="text"
                  value={customOccupation}
                  onChange={(e) => setCustomOccupation(e.target.value)}
                  placeholder={t.onboarding.otherPlaceholder}
                  className="h-12 text-base"
                  disabled={profileLocked}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Status Card */}
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              {t.onboarding.academicStatus}
            </Label>
            <div className="space-y-2">
              {([
                { value: "Graduated" as AcademicStatus, label: t.onboarding.graduated },
                { value: "Student" as AcademicStatus, label: t.onboarding.student },
                { value: "Ausbildung" as AcademicStatus, label: t.onboarding.ausbildung },
              ]).map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    academicStatus === s.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="academicStatus"
                    value={s.value}
                    checked={academicStatus === s.value}
                    onChange={() => setAcademicStatus(s.value)}
                    className="mr-4 w-4 h-4 accent-[var(--primary)]"
                    disabled={profileLocked}
                  />
                  <span className={`text-base font-medium ${academicStatus === s.value ? "text-primary" : "text-foreground"}`}>
                    {s.label}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting || profileLocked} className="w-full gradient-primary text-white border-0 h-12 text-base font-semibold">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {submitting ? t.profileEdit.saving : t.profileEdit.save}
        </Button>
      </form>
    </div>
  );
}
