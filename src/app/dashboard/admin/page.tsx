"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { StatusBadge } from "@/components/status-badge";
import type { Profile, BillingRecord } from "@/lib/types";
import { Users, CreditCard, Plus, BarChart3 } from "lucide-react";
import { ID } from "appwrite";

export default function AdminPage() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceTarget, setInvoiceTarget] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceType, setInvoiceType] = useState<"Deposit" | "Success_Fee" | "Other">("Deposit");
  const [invoiceDesc, setInvoiceDesc] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [pRes, bRes] = await Promise.all([
          databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.BILLING),
        ]);
        setProfiles(pRes.documents as unknown as Profile[]);
        setInvoices(bRes.documents as unknown as BillingRecord[]);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function createInvoice() {
    if (!invoiceTarget || !invoiceAmount) return;
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.BILLING, ID.unique(), {
        profileId: invoiceTarget,
        amount: parseFloat(invoiceAmount),
        status: "Unpaid",
        invoiceType,
        description: invoiceDesc || undefined,
      });
      const bRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BILLING);
      setInvoices(bRes.documents as unknown as BillingRecord[]);
      setShowInvoiceForm(false);
      setInvoiceAmount("");
      setInvoiceDesc("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create invoice");
    }
  }

  async function markInvoicePaid(inv: BillingRecord) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.BILLING, inv.$id, {
      status: "Paid",
    });
    setInvoices((prev) =>
      prev.map((i) => (i.$id === inv.$id ? { ...i, status: "Paid" as const } : i))
    );
    // Also update the profile status
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, inv.profileId, {
      currentStatus: "Paid",
    });
  }

  async function updateRole(p: Profile, role: "applicant" | "reviewer" | "admin") {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, p.$id, { role });
    setProfiles((prev) =>
      prev.map((pr) => (pr.$id === p.$id ? { ...pr, role } : pr))
    );
  }

  if (!profile || profile.role !== "admin") {
    return <p className="text-ink-muted">Admin access required.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-bold" />
      </div>
    );
  }

  const totalRevenue = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pendingRevenue = invoices.filter((i) => i.status === "Unpaid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ink">Admin Panel</h1>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-line p-5">
          <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-accent-bold" /><span className="text-sm text-ink-secondary">Total Users</span></div>
          <div className="text-2xl font-bold text-ink">{profiles.length}</div>
        </div>
        <div className="bg-card rounded-xl border border-line p-5">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-green-600" /><span className="text-sm text-ink-secondary">Revenue (Paid)</span></div>
          <div className="text-2xl font-bold text-ink">{totalRevenue.toFixed(2)} TND</div>
        </div>
        <div className="bg-card rounded-xl border border-line p-5">
          <div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-orange-500" /><span className="text-sm text-ink-secondary">Pending</span></div>
          <div className="text-2xl font-bold text-ink">{pendingRevenue.toFixed(2)} TND</div>
        </div>
      </div>

      {/* User management */}
      <section>
        <h2 className="text-lg font-semibold text-ink mb-3">User Management</h2>
        <div className="space-y-2">
          {profiles.map((p) => (
            <div key={p.$id} className="bg-card rounded-xl border border-line p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-ink">{p.fullName}</div>
                <div className="text-xs text-ink-muted">{p.email} Ã¢â‚¬Â¢ {p.occupation}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.currentStatus} />
                <select
                  value={p.role}
                  onChange={(e) => updateRole(p, e.target.value as "applicant" | "reviewer" | "admin")}
                  className="text-xs border border-line rounded-lg px-2 py-1 bg-card"
                >
                  <option value="applicant">Applicant</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invoicing */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink">Invoices</h2>
          <button
            onClick={() => setShowInvoiceForm(!showInvoiceForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-bold text-white text-sm rounded-lg hover:bg-accent-bolder"
          >
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>

        {showInvoiceForm && (
          <div className="bg-card rounded-xl border border-line p-5 mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1">Applicant</label>
              <select
                value={invoiceTarget}
                onChange={(e) => setInvoiceTarget(e.target.value)}
                className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select applicant</option>
                {profiles.filter((p) => p.role === "applicant").map((p) => (
                  <option key={p.$id} value={p.$id}>{p.fullName} ({p.email})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1">Amount (TND)</label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1">Type</label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value as typeof invoiceType)}
                  className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Success_Fee">Success Fee</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1">Description (optional)</label>
              <input
                type="text"
                value={invoiceDesc}
                onChange={(e) => setInvoiceDesc(e.target.value)}
                className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={createInvoice}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              Create Invoice
            </button>
          </div>
        )}

        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.$id} className="bg-card rounded-xl border border-line p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">
                  {inv.invoiceType.replace(/_/g, " ")} Ã¢â‚¬â€ {inv.amount.toFixed(2)} TND
                </div>
                <div className="text-xs text-ink-muted">
                  Profile: {inv.profileId} Ã¢â‚¬Â¢ {new Date(inv.$createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={inv.status} />
                {inv.status === "Unpaid" && (
                  <button
                    onClick={() => markInvoicePaid(inv)}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-300"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <p className="text-ink-muted py-4 text-center text-sm">No invoices created yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
