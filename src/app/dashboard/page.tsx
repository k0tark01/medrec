"use client";

import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { getRequiredDocs } from "@/lib/doc-requirements";
import type { DocRecord, BillingRecord } from "@/lib/types";
import { FileText, CreditCard, CheckCircle, AlertCircle, ArrowRight, UserPen, TrendingUp, Upload, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/language-context";
import { StatCardSkeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      try {
        const [docRes, billRes] = await Promise.all([
          databases.listDocuments(DATABASE_ID, COLLECTIONS.DOCUMENTS, [
            Query.equal("profileId", profile!.$id),
          ]),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.BILLING, [
            Query.equal("profileId", profile!.$id),
          ]),
        ]);
        setDocs(docRes.documents as unknown as DocRecord[]);
        setInvoices(billRes.documents as unknown as BillingRecord[]);
      } catch {
        // silently fail
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [profile]);

  if (!profile) return null;

  const requiredDocs = getRequiredDocs(profile.occupation, profile.academicStatus);
  const uploadedCount = docs.filter((d) => d.status !== "Missing").length;
  const verifiedCount = docs.filter((d) => d.status === "Verified").length;
  const needsCorrectionCount = docs.filter((d) => d.status === "Needs_Correction").length;
  const unpaidInvoices = invoices.filter((i) => i.status === "Unpaid");
  const progressPercent = requiredDocs.length > 0 ? Math.round((verifiedCount / requiredDocs.length) * 100) : 0;

  const isApplicant = profile.role === "applicant";
  const isStaff = profile.role === "reviewer" || profile.role === "admin";

  // Determine next step message
  const getNextStepMessage = () => {
    if (needsCorrectionCount > 0) return t.dashboard.correctionNeeded;
    if (uploadedCount < requiredDocs.length) return t.dashboard.uploadNext;
    if (verifiedCount === requiredDocs.length && requiredDocs.length > 0) return t.dashboard.allVerified;
    return t.dashboard.allUploaded;
  };

  const getNextStepColor = () => {
    if (needsCorrectionCount > 0) return "text-red-500";
    if (verifiedCount === requiredDocs.length && requiredDocs.length > 0) return "text-green-600";
    return "text-muted-foreground";
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">{t.dashboard.greeting}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {profile.fullName.split(" ")[0]} 👋
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-white/70 capitalize">
                  {isApplicant
                    ? `${profile.occupation} • ${profile.academicStatus}`
                    : profile.role === "admin"
                      ? t.admin.adminRole
                      : t.admin.reviewerRole}
                </span>
                {isApplicant && <StatusBadge status={profile.currentStatus} />}
              </div>
            </div>
            {isApplicant && (
              <div className="flex gap-2">
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                    <UserPen className="w-4 h-4 mr-1.5" /> {t.profileEdit.editProfile}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
      </div>

        {isStaff && (
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">{t.dashboard.staffWelcomeTitle}</h2>
              <p className="text-sm text-muted-foreground mb-6">{t.dashboard.staffWelcomeDesc}</p>

              <div className="flex flex-wrap gap-3">
                <Link href={profile.role === "admin" ? "/dashboard/admin" : "/dashboard/review"}>
                  <Button className="gradient-primary text-white border-0">
                    {profile.role === "admin" ? t.admin.title : t.sidebar.reviewQueue}
                  </Button>
                </Link>

                <Link href="/dashboard/users">
                  <Button variant="outline">{t.sidebar.users}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isApplicant && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-primary/10 text-primary"
          label={t.dashboard.documentsLabel}
          value={`${uploadedCount}/${requiredDocs.length}`}
          sub={t.dashboard.uploaded}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          iconBg="bg-green-500/10 text-green-600"
          label={t.dashboard.verified}
          value={String(verifiedCount)}
          sub={`of ${requiredDocs.length}`}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          iconBg="bg-red-500/10 text-red-500"
          label={t.dashboard.needsCorrection}
          value={String(needsCorrectionCount)}
          sub={t.dashboard.documentsWord}
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5" />}
          iconBg="bg-orange-500/10 text-orange-500"
          label={t.dashboard.unpaidInvoices}
          value={String(unpaidInvoices.length)}
          sub={unpaidInvoices.length > 0 ? `${unpaidInvoices.reduce((s, i) => s + i.amount, 0).toFixed(2)} TND` : t.dashboard.allClear}
        />
      </div>
      )}

      {isApplicant && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Progress card */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{t.dashboard.progressTitle}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{t.dashboard.progressDesc}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{t.dashboard.verified}</span>
                  <span className="font-bold text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{verifiedCount} {t.dashboard.verified.toLowerCase()}</span>
                  <span>{requiredDocs.length} total</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/60 border border-border">
                <Sparkles className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getNextStepColor()}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{t.dashboard.nextStep}</p>
                  <p className={`text-sm mt-0.5 ${getNextStepColor()}`}>{getNextStepMessage()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions card */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t.dashboard.quickActions}</h2>
              <div className="space-y-3">
                <Link href="/dashboard/documents" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      {uploadedCount < requiredDocs.length
                        ? <Upload className="w-5 h-5 text-white" />
                        : <Eye className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {uploadedCount < requiredDocs.length ? t.dashboard.uploadDocuments : t.dashboard.viewDocuments}
                      </p>
                      <p className="text-xs text-muted-foreground">{uploadedCount}/{requiredDocs.length} {t.dashboard.uploaded.toLowerCase()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>

                {unpaidInvoices.length > 0 && (
                  <Link href="/dashboard/billing" className="block">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{t.dashboard.viewInvoices}</p>
                        <p className="text-xs text-orange-600">{unpaidInvoices.length} unpaid &bull; {unpaidInvoices.reduce((s, i) => s + i.amount, 0).toFixed(2)} TND</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </div>
                  </Link>
                )}

                <Link href="/dashboard/profile" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <UserPen className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{t.profileEdit.editProfile}</p>
                      <p className="text-xs text-muted-foreground">{profile.occupation} &bull; {profile.academicStatus}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, iconBg, label, value, sub }: { icon: React.ReactNode; iconBg: string; label: string; value: string; sub: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>{icon}</div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{value}</div>
        <div className="text-sm font-medium text-foreground mt-1">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}
