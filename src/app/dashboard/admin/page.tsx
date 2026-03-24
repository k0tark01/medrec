"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { StatusBadge } from "@/components/status-badge";
import type { Profile, BillingRecord } from "@/lib/types";
import { Users, CreditCard, Plus, BarChart3 } from "lucide-react";
import { ID } from "appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/language-context";
import { toast } from "sonner";
import { invoiceSchema } from "@/lib/validations";
import { StatCardSkeleton, ListSkeleton } from "@/components/ui/skeleton";
import { logAuditEvent } from "@/lib/audit";
import type { AuditLog } from "@/lib/types";
import { Query } from "appwrite";
import { ScrollText, Clock } from "lucide-react";

export default function AdminPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceTarget, setInvoiceTarget] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceType, setInvoiceType] = useState<"Deposit" | "Success_Fee" | "Other">("Deposit");
  const [invoiceDesc, setInvoiceDesc] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [pRes, bRes, aRes] = await Promise.all([
          databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.BILLING),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.AUDIT_LOGS, [
            Query.orderDesc("$createdAt"),
            Query.limit(50),
          ]),
        ]);
        setProfiles(pRes.documents as unknown as Profile[]);
        setInvoices(bRes.documents as unknown as BillingRecord[]);
        setAuditLogs(aRes.documents as unknown as AuditLog[]);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function createInvoice() {
    const result = invoiceSchema.safeParse({
      profileId: invoiceTarget,
      amount: parseFloat(invoiceAmount) || 0,
      invoiceType,
      description: invoiceDesc || undefined,
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
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
      await logAuditEvent({ userId: profile!.$id, action: "createInvoice", targetId: invoiceTarget, targetType: "billing", details: `${invoiceType} — ${invoiceAmount} TND` });
      setShowInvoiceForm(false);
      setInvoiceAmount("");
      setInvoiceDesc("");
      toast.success(t.admin.createInvoice + " ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.admin.failedCreate);
    }
  }

  async function markInvoicePaid(inv: BillingRecord) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.BILLING, inv.$id, {
      status: "Paid",
    });
    await logAuditEvent({ userId: profile!.$id, action: "markPaid", targetId: inv.$id, targetType: "billing", details: `${inv.invoiceType} — ${inv.amount} TND` });
    setInvoices((prev) =>
      prev.map((i) => (i.$id === inv.$id ? { ...i, status: "Paid" as const } : i))
    );
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, inv.profileId, {
      currentStatus: "Paid",
    });
  }

  async function updateRole(p: Profile, role: "applicant" | "reviewer" | "admin") {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, p.$id, { role });
    await logAuditEvent({ userId: profile!.$id, action: "roleChange", targetId: p.$id, targetType: "profile", details: `${p.fullName}: ${p.role} → ${role}` });
    setProfiles((prev) =>
      prev.map((pr) => (pr.$id === p.$id ? { ...pr, role } : pr))
    );
  }

  if (!profile || profile.role !== "admin") {
    return <p className="text-muted-foreground">{t.admin.adminRequired}</p>;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-foreground">{t.admin.title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <ListSkeleton count={4} />
      </div>
    );
  }

  const totalRevenue = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pendingRevenue = invoices.filter((i) => i.status === "Unpaid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">{t.admin.title}</h1>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">{t.admin.totalUsers}</span></div>
            <div className="text-2xl font-bold text-foreground">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-green-600" /><span className="text-sm text-muted-foreground">{t.admin.revenuePaid}</span></div>
            <div className="text-2xl font-bold text-foreground">{totalRevenue.toFixed(2)} TND</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-orange-500" /><span className="text-sm text-muted-foreground">{t.admin.pending}</span></div>
            <div className="text-2xl font-bold text-foreground">{pendingRevenue.toFixed(2)} TND</div>
          </CardContent>
        </Card>
      </div>

      {/* User management */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">{t.admin.userManagement}</h2>
        <div className="space-y-2">
          {profiles.map((p) => (
            <Card key={p.$id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{p.fullName}</div>
                  <div className="text-xs text-muted-foreground">{p.email} &bull; {p.occupation}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.currentStatus} />
                  <Select value={p.role} onValueChange={(v) => updateRole(p, v as "applicant" | "reviewer" | "admin")}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applicant">{t.admin.applicantRole}</SelectItem>
                      <SelectItem value="reviewer">{t.admin.reviewerRole}</SelectItem>
                      <SelectItem value="admin">{t.admin.adminRole}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Invoicing */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">{t.admin.invoices}</h2>
          <Button onClick={() => setShowInvoiceForm(!showInvoiceForm)} className="gradient-primary text-white border-0" size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> {t.admin.newInvoice}
          </Button>
        </div>

        {showInvoiceForm && (
          <Card className="mb-4">
            <CardContent className="p-5 space-y-3">
              <div className="space-y-2">
                <Label>{t.admin.applicant}</Label>
                <Select value={invoiceTarget} onValueChange={(v) => setInvoiceTarget(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.admin.selectApplicant} />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.filter((p) => p.role === "applicant").map((p) => (
                      <SelectItem key={p.$id} value={p.$id}>{p.fullName} ({p.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t.admin.amount}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.admin.type}</Label>
                  <Select value={invoiceType} onValueChange={(v) => setInvoiceType(v as typeof invoiceType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deposit">{t.admin.deposit}</SelectItem>
                      <SelectItem value="Success_Fee">{t.admin.successFee}</SelectItem>
                      <SelectItem value="Other">{t.admin.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.admin.descriptionOptional}</Label>
                <Input
                  type="text"
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                />
              </div>
              <Button onClick={createInvoice} className="bg-green-600 hover:bg-green-700 text-white">
                {t.admin.createInvoice}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {invoices.map((inv) => (
            <Card key={inv.$id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {inv.invoiceType.replace(/_/g, " ")} &mdash; {inv.amount.toFixed(2)} TND
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Profile: {inv.profileId} &bull; {new Date(inv.$createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inv.status} />
                  {inv.status === "Unpaid" && (
                    <Button
                      onClick={() => markInvoicePaid(inv)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {t.admin.markPaid}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {invoices.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">{t.admin.noInvoicesYet}</p>
          )}
        </div>
      </section>

      {/* Audit Log */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ScrollText className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">{t.auditLog.title}</h2>
        </div>
        {auditLogs.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">{t.auditLog.noLogs}</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.map((log) => {
              const actionKey = log.action as keyof typeof t.auditLog.actions;
              const actionLabel = t.auditLog.actions[actionKey] || log.action;
              const actor = profiles.find((p) => p.$id === log.userId);
              return (
                <Card key={log.$id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{actionLabel}</div>
                        <div className="text-xs text-muted-foreground">
                          {actor ? actor.fullName : log.userId}
                          {log.details && <> &bull; {log.details}</>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(log.$createdAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
