"use client";

import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { getRequiredDocs } from "@/lib/doc-requirements";
import type { DocRecord, BillingRecord } from "@/lib/types";
import { FileText, CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();
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
        // silently fail â€” data will be empty
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

  const isApplicant = profile.role === "applicant";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          Welcome, {profile.fullName.split(" ")[0]}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm text-ink-muted capitalize">{profile.occupation} â€¢ {profile.academicStatus}</span>
          <StatusBadge status={profile.currentStatus} />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FileText className="w-5 h-5 text-accent-bold" />}
          label="Documents"
          value={`${uploadedCount}/${requiredDocs.length}`}
          sub="Uploaded"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          label="Verified"
          value={String(verifiedCount)}
          sub={`of ${requiredDocs.length}`}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          label="Needs Correction"
          value={String(needsCorrectionCount)}
          sub="documents"
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5 text-orange-500" />}
          label="Unpaid Invoices"
          value={String(unpaidInvoices.length)}
          sub={unpaidInvoices.length > 0 ? `${unpaidInvoices.reduce((s, i) => s + i.amount, 0).toFixed(2)} TND` : "All clear"}
        />
      </div>

      {isApplicant && (
        <div className="bg-card rounded-xl border border-line p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-bold text-white text-sm rounded-lg hover:bg-accent-bolder transition"
            >
              <FileText className="w-4 h-4" />
              {uploadedCount < requiredDocs.length ? "Upload Documents" : "View Documents"}
            </Link>
            {unpaidInvoices.length > 0 && (
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-700 transition"
              >
                <CreditCard className="w-4 h-4" /> View Invoices
              </Link>
            )}
          </div>
        </div>
      )}

      {loadingData && (
        <div className="flex justify-center py-12">
          <Clock className="w-6 h-6 text-ink-faint animate-spin" />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-card rounded-xl border border-line p-5">
      <div className="flex items-center gap-3 mb-3">{icon}<span className="text-sm font-medium text-ink-secondary">{label}</span></div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1">{sub}</div>
    </div>
  );
}
