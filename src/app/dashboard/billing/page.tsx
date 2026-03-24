"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { StatusBadge } from "@/components/status-badge";
import type { BillingRecord } from "@/lib/types";
import { CreditCard, Receipt, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/language-context";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Pagination, usePagination } from "@/components/pagination";

export default function BillingPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const filtered = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || inv.invoiceType.toLowerCase().includes(q) || (inv.description || "").toLowerCase().includes(q) || inv.amount.toString().includes(q);
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { paginate, totalItems } = usePagination(filtered);
  const paginated = paginate(currentPage);

  if (!profile) return null;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t.billingPage.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.billingPage.desc}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: string | null) => { setStatusFilter(v ?? "all"); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.filterByStatus}</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <ListSkeleton count={3} />
      ) : paginated.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{filtered.length === 0 && invoices.length > 0 ? t.common.noResults : t.billingPage.noInvoices}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((inv) => (
            <Card key={inv.$id}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {inv.invoiceType.replace(/_/g, " ")} &mdash; {inv.amount.toFixed(2)} TND
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inv.description || t.billingPage.noDescription} &bull; {new Date(inv.$createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <StatusBadge status={inv.status} />
              </CardContent>
            </Card>
          ))}
          <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
