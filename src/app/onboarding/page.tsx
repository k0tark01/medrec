"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import type { Occupation, AcademicStatus } from "@/lib/types";
import { Briefcase, GraduationCap, ArrowRight, Stethoscope, HeartPulse, Cog } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const OCCUPATIONS: { value: Occupation; label: string; icon: LucideIcon }[] = [
  { value: "Nurse", label: "Nurse", icon: Stethoscope },
  { value: "Doctor", label: "Doctor", icon: HeartPulse },
  { value: "Engineer", label: "Engineer", icon: Cog },
];

const ACADEMIC_STATUSES: { value: AcademicStatus; label: string }[] = [
  { value: "Graduated", label: "Graduated" },
  { value: "Student", label: "Student" },
  { value: "Ausbildung", label: "Ausbildung (Vocational Training)" },
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [occupation, setOccupation] = useState<Occupation | "">("");
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "">("");
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!occupation || !academicStatus) {
      setError("Please select your occupation and academic status.");
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
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-ink mb-1">Complete Your Profile</h1>
        <p className="text-ink-muted text-sm mb-6">
          Tell us about your profession so we can prepare your document checklist.
        </p>

        {error && (
          <div className="bg-err-bg text-err text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              placeholder="+216 XX XXX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-2">
              <Briefcase className="inline w-4 h-4 mr-1" /> Occupation
            </label>
            <div className="grid grid-cols-3 gap-3">
              {OCCUPATIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOccupation(o.value)}
                  className={`border rounded-xl p-4 text-center transition ${
                    occupation === o.value
                      ? "border-accent bg-accent-50 ring-2 ring-accent-200"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <o.icon className="w-7 h-7 mx-auto mb-1" />
                  <span className="text-sm font-medium text-ink-secondary">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-2">
              <GraduationCap className="inline w-4 h-4 mr-1" /> Academic Status
            </label>
            <div className="space-y-2">
              {ACADEMIC_STATUSES.map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    academicStatus === s.value
                      ? "border-accent bg-accent-50"
                      : "border-line hover:border-line-strong"
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
                  <span className="text-sm text-ink-secondary">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent-bold text-white py-2.5 rounded-lg font-medium text-sm hover:bg-accent-bolder transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "Creating Profile..." : (
              <>Continue to Dashboard <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
