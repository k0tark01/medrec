"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { StatusBadge } from "@/components/status-badge";
import type { Profile } from "@/lib/types";
import { Users, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/language-context";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { Pagination, usePagination } from "@/components/pagination";

export default function UsersPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES);
        setProfiles(res.documents as unknown as Profile[]);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.occupation.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const { paginate, totalItems } = usePagination(filtered);
  const paginated = paginate(currentPage);

  if (!profile || profile.role !== "admin") {
    return <p className="text-muted-foreground">{t.usersPage.adminRequired}</p>;
  }

  const tableHead = (
    <thead>
      <tr className="border-b border-border bg-muted">
        <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.usersPage.name}</th>
        <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.usersPage.email}</th>
        <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.usersPage.occupationCol}</th>
        <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.usersPage.role}</th>
        <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.usersPage.status}</th>
        <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t.usersPage.joined}</th>
      </tr>
    </thead>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">{t.usersPage.title}</h1>

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
        <Select value={roleFilter} onValueChange={(v: string | null) => { setRoleFilter(v ?? "all"); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.filterByStatus}</SelectItem>
            <SelectItem value="applicant">Applicant</SelectItem>
            <SelectItem value="reviewer">Reviewer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              {tableHead}
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={6} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                {tableHead}
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.$id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{p.fullName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.occupation}</td>
                      <td className="px-4 py-3 capitalize text-foreground">{p.role}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.currentStatus} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.$createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paginated.length === 0 && (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                  <Users className="w-8 h-8 text-muted-foreground mb-2" />
                  {filtered.length === 0 && profiles.length > 0 ? t.common.noResults : t.usersPage.noUsers}
                </div>
              )}
            </CardContent>
          </Card>
          <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
