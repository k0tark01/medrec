"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { StatusBadge } from "@/components/status-badge";
import type { BillingRecord } from "@/lib/types";
import { CreditCard, Receipt } from "lucide-react";

export default function BillingPage() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      try {
        const query = profile!.role === "admin"
          ? []
          : [Query.equal("profileId", profile!.$id)];
        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BILLING, query);
        setInvoices(res.documents as unknown as BillingRecord[]);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  if (!profile) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Billing</h1>
        <p className="text-sm text-ink-muted mt-1">View your invoices and payment status.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-bold" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-card rounded-xl border border-line p-12 text-center">
          <Receipt className="w-12 h-12 text-ink-faint mx-auto mb-3" />
          <p className="text-ink-muted">No invoices yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.$id} className="bg-card rounded-xl border border-line p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CreditCard className="w-5 h-5 text-ink-faint" />
                <div>
                  <div className="text-sm font-medium text-ink">
                    {inv.invoiceType.replace(/_/g, " ")} Ã¢â‚¬â€ {inv.amount.toFixed(2)} TND
                  </div>
                  <div className="text-xs text-ink-muted">
                    {inv.description || "No description"} Ã¢â‚¬Â¢ {new Date(inv.$createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <StatusBadge status={inv.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
