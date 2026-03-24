"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ORIGINALS, BUCKET_TRANSLATIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { StatusBadge } from "@/components/status-badge";
import { formatDocType } from "@/lib/doc-requirements";
import type { Profile, DocRecord } from "@/lib/types";
import { ChevronRight, Eye, Check, X, Download, ArrowLeft, Send, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/language-context";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, usePagination } from "@/components/pagination";
import { FilePreviewModal } from "@/components/file-preview-modal";
import { logAuditEvent } from "@/lib/audit";

export default function ReviewPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [applicants, setApplicants] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingDoc, setRejectingDoc] = useState<DocRecord | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  function openPreview(url: string, title: string) {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewOpen(true);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
          Query.equal("role", "applicant"),
        ]);
        setApplicants(res.documents as unknown as Profile[]);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadDocs = useCallback(async (applicant: Profile) => {
    setSelected(applicant);
    setLoadingDocs(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DOCUMENTS, [
        Query.equal("profileId", applicant.$id),
      ]);
      setDocs(res.documents as unknown as DocRecord[]);
    } catch {
      setDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  async function verifyDoc(doc: DocRecord) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, doc.$id, {
      status: "Verified",
      reviewerNotes: "",
    });
    await logAuditEvent({ userId: profile!.$id, action: "verifyDoc", targetId: doc.$id, targetType: "document", details: formatDocType(doc.docType) });
    toast.success(t.review.verify + " ✓");
    if (selected) await loadDocs(selected);
  }

  async function rejectDoc(doc: DocRecord) {
    setRejectingDoc(doc);
    setRejectNotes("");
  }

  async function confirmReject() {
    if (!rejectingDoc || !rejectNotes.trim()) return;
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, rejectingDoc.$id, {
      status: "Needs_Correction",
      reviewerNotes: rejectNotes.trim(),
    });
    await logAuditEvent({ userId: profile!.$id, action: "rejectDoc", targetId: rejectingDoc.$id, targetType: "document", details: `${formatDocType(rejectingDoc.docType)}: ${rejectNotes.trim()}` });
    toast.error(t.review.reject + " — " + formatDocType(rejectingDoc.docType));
    setRejectingDoc(null);
    setRejectNotes("");
    if (selected) await loadDocs(selected);
  }

  async function markReadyForPartner(applicant: Profile) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, applicant.$id, {
      currentStatus: "Ready_for_Partner",
    });
    await logAuditEvent({ userId: profile!.$id, action: "readyForPartner", targetId: applicant.$id, targetType: "profile", details: applicant.fullName });
    setApplicants((prev) =>
      prev.map((a) => (a.$id === applicant.$id ? { ...a, currentStatus: "Ready_for_Partner" as const } : a))
    );
    if (selected?.$id === applicant.$id) {
      setSelected({ ...applicant, currentStatus: "Ready_for_Partner" });
    }
  }

  async function markSubmittedToPartner(applicant: Profile) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, applicant.$id, {
      currentStatus: "Submitted_to_Partner",
    });
    await logAuditEvent({ userId: profile!.$id, action: "markSubmitted", targetId: applicant.$id, targetType: "profile", details: applicant.fullName });
    setApplicants((prev) =>
      prev.map((a) => (a.$id === applicant.$id ? { ...a, currentStatus: "Submitted_to_Partner" as const } : a))
    );
    if (selected?.$id === applicant.$id) {
      setSelected({ ...applicant, currentStatus: "Submitted_to_Partner" });
    }
  }

  function getPreviewUrl(fileId: string, bucket: string) {
    return storage.getFilePreview(bucket, fileId);
  }

  function getDownloadUrl(fileId: string, bucket: string) {
    return storage.getFileDownload(bucket, fileId);
  }

  const filteredApplicants = applicants.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.occupation.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || a.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { paginate, totalItems } = usePagination(filteredApplicants);
  const paginatedApplicants = paginate(currentPage);

  if (!profile || (profile.role !== "reviewer" && profile.role !== "admin")) {
    return <p className="text-muted-foreground">{t.review.noAccess}</p>;
  }

  const rejectDialog = (
    <Dialog open={!!rejectingDoc} onOpenChange={(open) => { if (!open) setRejectingDoc(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.review.rejectReason}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>{rejectingDoc ? formatDocType(rejectingDoc.docType) : ""}</Label>
          <Textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder={t.review.rejectReason}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectingDoc(null)}>
            {t.review.backToQueue}
          </Button>
          <Button
            onClick={confirmReject}
            disabled={!rejectNotes.trim()}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            <X className="w-4 h-4 mr-1" /> {t.review.reject}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Detail view
  if (selected) {
    const allVerified = docs.length > 0 && docs.every((d) => d.status === "Verified");

    return (
      <>
        {rejectDialog}
        <FilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} url={previewUrl} title={previewTitle} />
        <div>
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t.review.backToQueue}
          </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selected.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {selected.occupation} &bull; {selected.academicStatus} &bull; {selected.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={selected.currentStatus} />
            {allVerified && selected.currentStatus === "Reviewing" && (
              <Button onClick={() => markReadyForPartner(selected)} className="gradient-primary text-white border-0" size="sm">
                <Check className="w-4 h-4 mr-1.5" /> {t.review.readyForPartner}
              </Button>
            )}
            {selected.currentStatus === "Ready_for_Partner" && (
              <Button onClick={() => markSubmittedToPartner(selected)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Send className="w-4 h-4 mr-1.5" /> {t.review.markSubmitted}
              </Button>
            )}
          </div>
        </div>

        {loadingDocs ? (
          <ListSkeleton count={3} />
        ) : docs.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">{t.review.noDocsYet}</p>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <Card key={doc.$id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">{formatDocType(doc.docType)}</span>
                    <StatusBadge status={doc.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {doc.originalFileId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t.review.originalLabel}</span>
                        <button
                          onClick={() => openPreview(getPreviewUrl(doc.originalFileId!, BUCKET_ORIGINALS).toString(), `${formatDocType(doc.docType)} — ${t.review.originalLabel}`)}
                          className="text-primary text-xs hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> {t.review.preview}
                        </button>
                        <a
                          href={getDownloadUrl(doc.originalFileId, BUCKET_ORIGINALS).toString()}
                          className="text-muted-foreground text-xs hover:underline inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> {t.review.download}
                        </a>
                      </div>
                    )}
                    {doc.translatedFileId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t.review.translationLabel}</span>
                        <button
                          onClick={() => openPreview(getPreviewUrl(doc.translatedFileId!, BUCKET_TRANSLATIONS).toString(), `${formatDocType(doc.docType)} — ${t.review.translationLabel}`)}
                          className="text-primary text-xs hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> {t.review.preview}
                        </button>
                        <a
                          href={getDownloadUrl(doc.translatedFileId, BUCKET_TRANSLATIONS).toString()}
                          className="text-muted-foreground text-xs hover:underline inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> {t.review.download}
                        </a>
                      </div>
                    )}
                  </div>

                  {doc.status !== "Verified" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => verifyDoc(doc)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-3 h-3 mr-1" /> {t.review.verify}
                      </Button>
                      <Button
                        onClick={() => rejectDoc(doc)}
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-3 h-3 mr-1" /> {t.review.reject}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </>
    );
  }

  // Queue list view
  return (
    <>
      {rejectDialog}
      <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{t.review.title}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t.review.desc}</p>

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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.common.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.filterByStatus}</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Reviewing">Reviewing</SelectItem>
            <SelectItem value="Ready_for_Partner">Ready for Partner</SelectItem>
            <SelectItem value="Submitted_to_Partner">Submitted to Partner</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : paginatedApplicants.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">{filteredApplicants.length === 0 && applicants.length > 0 ? t.common.noResults : t.review.noApplicants}</p>
      ) : (
        <div className="space-y-2">
          {paginatedApplicants.map((a) => (
            <Card
              key={a.$id}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => loadDocs(a)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{a.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.occupation} &bull; {a.academicStatus} &bull; {a.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.currentStatus} />
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
          <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
        </div>
      )}
      </div>
    </>
  );
}

