"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS, BUCKET_ORIGINALS, BUCKET_TRANSLATIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { StatusBadge } from "@/components/status-badge";
import { formatDocType } from "@/lib/doc-requirements";
import type { Profile, DocRecord, ProfileStatus } from "@/lib/types";
import { ChevronRight, Eye, Check, X, Download, ArrowLeft, Send, Search, Loader2 } from "lucide-react";
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
import { canTransitionProfileStatus, getTransitionError, REVIEW_REJECTION_CODES, type ReviewRejectionCode } from "@/lib/review-workflow";

export default function ReviewPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [applicants, setApplicants] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingDoc, setRejectingDoc] = useState<DocRecord | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectCode, setRejectCode] = useState<ReviewRejectionCode>("INCOMPLETE_DOCUMENT");
  const [rejectingApplicant, setRejectingApplicant] = useState<Profile | null>(null);
  const [applicationRejectNotes, setApplicationRejectNotes] = useState("");
  const [applicationRejectCode, setApplicationRejectCode] = useState<ReviewRejectionCode>("INCOMPLETE_DOCUMENT");
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [downloadingFolder, setDownloadingFolder] = useState(false);
  const [fileActionKey, setFileActionKey] = useState<string | null>(null);

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
      const nextDocs = res.documents as unknown as DocRecord[];
      setDocs(nextDocs);
      setActiveDocId((prev) => {
        if (prev && nextDocs.some((d) => d.$id === prev)) return prev;
        return nextDocs[0]?.$id ?? null;
      });
    } catch {
      setDocs([]);
      setActiveDocId(null);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  function updateLocalApplicantStatus(profileId: string, currentStatus: ProfileStatus) {
    setApplicants((prev) => prev.map((a) => (a.$id === profileId ? { ...a, currentStatus } : a)));
    setSelected((prev) => (prev && prev.$id === profileId ? { ...prev, currentStatus } : prev));
  }

  async function mutateWorkflow(payload: Record<string, unknown>) {
    const jwt = await account.createJWT();
    const response = await fetch("/api/workflow/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jwt: jwt.jwt, ...payload }),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error || t.auth.somethingWrong);
    }
  }

  async function downloadApplicationFolder(applicant: Profile) {
    setDownloadingFolder(true);
    try {
      const jwt = await account.createJWT();
      const response = await fetch("/api/workflow/download-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwt.jwt, profileId: applicant.$id }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to download folder");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      const safeName = applicant.fullName.replace(/[^a-z0-9_-]+/gi, "_");
      link.download = `application_folder_${safeName}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download folder");
    } finally {
      setDownloadingFolder(false);
    }
  }

  async function verifyDoc(doc: DocRecord) {
    if (!selected) return;
    await mutateWorkflow({
      action: "verifyDoc",
      profileId: selected.$id,
      docId: doc.$id,
    });
    toast.success(t.review.verify + " ✓");
    if (selected) await loadDocs(selected);
  }

  async function rejectDoc(doc: DocRecord) {
    setRejectingDoc(doc);
    setRejectNotes("");
    setRejectCode("INCOMPLETE_DOCUMENT");
  }

  async function confirmReject() {
    if (!rejectingDoc || !rejectNotes.trim()) return;
    if (!selected) return;
    await mutateWorkflow({
      action: "rejectDoc",
      profileId: selected.$id,
      docId: rejectingDoc.$id,
      reasonCode: rejectCode,
      notes: rejectNotes.trim(),
    });
    updateLocalApplicantStatus(selected.$id, "Draft");

    toast.error(t.review.reject + " — " + formatDocType(rejectingDoc.docType));
    setRejectingDoc(null);
    setRejectNotes("");
    if (selected) await loadDocs(selected);
  }

  async function markReadyForPartner(applicant: Profile) {
    if (!canTransitionProfileStatus(applicant.currentStatus, "Ready_for_Partner")) {
      toast.error(getTransitionError(applicant.currentStatus, "Ready_for_Partner"));
      return;
    }
    await mutateWorkflow({
      action: "setProfileStatus",
      profileId: applicant.$id,
      toStatus: "Ready_for_Partner",
    });
    updateLocalApplicantStatus(applicant.$id, "Ready_for_Partner");
  }

  async function markSubmittedToPartner(applicant: Profile) {
    if (!canTransitionProfileStatus(applicant.currentStatus, "Submitted_to_Partner")) {
      toast.error(getTransitionError(applicant.currentStatus, "Submitted_to_Partner"));
      return;
    }
    await mutateWorkflow({
      action: "setProfileStatus",
      profileId: applicant.$id,
      toStatus: "Submitted_to_Partner",
    });
    updateLocalApplicantStatus(applicant.$id, "Submitted_to_Partner");
  }

  async function markApproved(applicant: Profile) {
    if (!canTransitionProfileStatus(applicant.currentStatus, "Approved")) {
      toast.error(getTransitionError(applicant.currentStatus, "Approved"));
      return;
    }
    await mutateWorkflow({
      action: "setProfileStatus",
      profileId: applicant.$id,
      toStatus: "Approved",
    });
    updateLocalApplicantStatus(applicant.$id, "Approved");
    toast.success(t.review.approveApplication);
  }

  function rejectApplication(applicant: Profile) {
    setRejectingApplicant(applicant);
    setApplicationRejectNotes("");
    setApplicationRejectCode("INCOMPLETE_DOCUMENT");
  }

  async function confirmRejectApplication() {
    if (!rejectingApplicant || !applicationRejectNotes.trim()) return;

    if (!canTransitionProfileStatus(rejectingApplicant.currentStatus, "Rejected")) {
      toast.error(getTransitionError(rejectingApplicant.currentStatus, "Rejected"));
      return;
    }

    await mutateWorkflow({
      action: "setProfileStatus",
      profileId: rejectingApplicant.$id,
      toStatus: "Rejected",
      reasonCode: applicationRejectCode,
      notes: applicationRejectNotes.trim(),
    });

    updateLocalApplicantStatus(rejectingApplicant.$id, "Rejected");
    setRejectingApplicant(null);
    setApplicationRejectNotes("");
    toast.error(t.review.rejectApplication);
  }

  async function fetchFileBlob(fileId: string, bucketId: string, profileId: string, mode: "preview" | "download") {
    const jwt = await account.createJWT();
    const response = await fetch("/api/workflow/file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jwt: jwt.jwt,
        fileId,
        bucketId,
        profileId,
        mode,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Failed to access file");
    }

    return response.blob();
  }

  async function openSecurePreview(fileId: string, bucketId: string, title: string) {
    if (!selected) return;
    const key = `${fileId}:preview`;
    setFileActionKey(key);
    try {
      const blob = await fetchFileBlob(fileId, bucketId, selected.$id, "preview");
      const objectUrl = URL.createObjectURL(blob);
      openPreview(objectUrl, title);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to preview file");
    } finally {
      setFileActionKey(null);
    }
  }

  async function downloadSecureFile(fileId: string, bucketId: string, fallbackName: string) {
    if (!selected) return;
    const key = `${fileId}:download`;
    setFileActionKey(key);
    try {
      const blob = await fetchFileBlob(fileId, bucketId, selected.$id, "download");
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fallbackName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download file");
    } finally {
      setFileActionKey(null);
    }
  }

  const filteredApplicants = applicants.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.occupation.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || a.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusPriority: Record<ProfileStatus, number> = {
    Reviewing: 1,
    Ready_for_Partner: 2,
    Submitted_to_Partner: 3,
    Draft: 4,
    Approved: 5,
    Rejected: 6,
    Invoiced: 7,
    Paid: 8,
    Hired: 9,
  };

  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    const priorityDiff = statusPriority[a.currentStatus] - statusPriority[b.currentStatus];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.$updatedAt).getTime() - new Date(b.$updatedAt).getTime();
  });

  const { paginate, totalItems } = usePagination(sortedApplicants);
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
          <Select value={rejectCode} onValueChange={(v) => setRejectCode(v as ReviewRejectionCode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_REJECTION_CODES.map((code) => (
                <SelectItem key={code} value={code}>{code.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

  const rejectApplicationDialog = (
    <Dialog open={!!rejectingApplicant} onOpenChange={(open) => { if (!open) setRejectingApplicant(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.review.rejectApplication}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>{rejectingApplicant?.fullName || ""}</Label>
          <Select value={applicationRejectCode} onValueChange={(v) => setApplicationRejectCode(v as ReviewRejectionCode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_REJECTION_CODES.map((code) => (
                <SelectItem key={code} value={code}>{code.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={applicationRejectNotes}
            onChange={(e) => setApplicationRejectNotes(e.target.value)}
            placeholder={t.review.rejectApplicationReasonPlaceholder}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectingApplicant(null)}>
            {t.common.cancel}
          </Button>
          <Button
            onClick={confirmRejectApplication}
            disabled={!applicationRejectNotes.trim()}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            <X className="w-4 h-4 mr-1" /> {t.review.rejectApplication}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Detail view
  if (selected) {
    const allVerified = docs.length > 0 && docs.every((d) => d.status === "Verified");
    const activeDoc = docs.find((d) => d.$id === activeDocId) ?? docs[0] ?? null;

    return (
      <>
        {rejectDialog}
        {rejectApplicationDialog}
        <FilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} url={previewUrl} title={previewTitle} />
        <div>
          <button
            onClick={() => { setSelected(null); setActiveDocId(null); }}
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
            <Button onClick={() => downloadApplicationFolder(selected)} size="sm" variant="outline" disabled={downloadingFolder}>
              <Download className="w-4 h-4 mr-1.5" /> {downloadingFolder ? t.review.preparingZip : t.review.downloadFolderZip}
            </Button>
            {allVerified && selected.currentStatus === "Reviewing" && (
              <Button onClick={() => markReadyForPartner(selected)} className="gradient-primary text-white border-0" size="sm">
                <Check className="w-4 h-4 mr-1.5" /> {t.review.precheckPassed}
              </Button>
            )}
            {selected.currentStatus === "Ready_for_Partner" && (
              <Button onClick={() => markSubmittedToPartner(selected)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Send className="w-4 h-4 mr-1.5" /> {t.review.markSubmitted}
              </Button>
            )}
            {selected.currentStatus === "Submitted_to_Partner" && (
              <>
                <Button onClick={() => markApproved(selected)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Check className="w-4 h-4 mr-1.5" /> {t.review.approveApplication}
                </Button>
                <Button onClick={() => rejectApplication(selected)} size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  <X className="w-4 h-4 mr-1.5" /> {t.review.rejectApplication}
                </Button>
              </>
            )}
          </div>
        </div>

        {loadingDocs ? (
          <ListSkeleton count={3} />
        ) : docs.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">{t.review.noDocsYet}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card className="lg:col-span-4">
              <CardContent className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
                {docs.map((doc) => (
                  <button
                    key={doc.$id}
                    onClick={() => setActiveDocId(doc.$id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      activeDoc?.$id === doc.$id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">{formatDocType(doc.docType)}</span>
                      <StatusBadge status={doc.status} />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-8">
              <CardContent className="p-5">
                {activeDoc && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">{formatDocType(activeDoc.docType)}</h3>
                      <StatusBadge status={activeDoc.status} />
                    </div>

                    {activeDoc.reviewerNotes && activeDoc.status === "Needs_Correction" && (
                      <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {activeDoc.reviewerNotes}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground mb-2">{t.review.originalLabel}</p>
                        {activeDoc.originalFileId ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openSecurePreview(activeDoc.originalFileId!, BUCKET_ORIGINALS, `${formatDocType(activeDoc.docType)} — ${t.review.originalLabel}`)}
                              disabled={fileActionKey === `${activeDoc.originalFileId}:preview`}
                              className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                            >
                              {fileActionKey === `${activeDoc.originalFileId}:preview` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} {t.review.preview}
                            </button>
                            <button
                              onClick={() => downloadSecureFile(activeDoc.originalFileId!, BUCKET_ORIGINALS, `${formatDocType(activeDoc.docType)}_original`)}
                              disabled={fileActionKey === `${activeDoc.originalFileId}:download`}
                              className="text-muted-foreground text-sm hover:underline inline-flex items-center gap-1"
                            >
                              {fileActionKey === `${activeDoc.originalFileId}:download` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {t.review.download}
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t.review.missingFile}</p>
                        )}
                      </div>

                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground mb-2">{t.review.translationLabel}</p>
                        {activeDoc.translatedFileId ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openSecurePreview(activeDoc.translatedFileId!, BUCKET_TRANSLATIONS, `${formatDocType(activeDoc.docType)} — ${t.review.translationLabel}`)}
                              disabled={fileActionKey === `${activeDoc.translatedFileId}:preview`}
                              className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                            >
                              {fileActionKey === `${activeDoc.translatedFileId}:preview` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} {t.review.preview}
                            </button>
                            <button
                              onClick={() => downloadSecureFile(activeDoc.translatedFileId!, BUCKET_TRANSLATIONS, `${formatDocType(activeDoc.docType)}_translation`)}
                              disabled={fileActionKey === `${activeDoc.translatedFileId}:download`}
                              className="text-muted-foreground text-sm hover:underline inline-flex items-center gap-1"
                            >
                              {fileActionKey === `${activeDoc.translatedFileId}:download` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {t.review.download}
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t.review.missingFile}</p>
                        )}
                      </div>
                    </div>

                    {activeDoc.status !== "Verified" && selected.currentStatus === "Reviewing" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => verifyDoc(activeDoc)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-3 h-3 mr-1" /> {t.review.verify}
                        </Button>
                        <Button
                          onClick={() => rejectDoc(activeDoc)}
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-3 h-3 mr-1" /> {t.review.reject}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
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
      {rejectApplicationDialog}
      <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{t.review.title}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t.review.desc}</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Reviewing</p><p className="text-xl font-bold">{applicants.filter((a) => a.currentStatus === "Reviewing").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Ready for Partner</p><p className="text-xl font-bold">{applicants.filter((a) => a.currentStatus === "Ready_for_Partner").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Submitted</p><p className="text-xl font-bold">{applicants.filter((a) => a.currentStatus === "Submitted_to_Partner").length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Overdue (&gt;3d)</p><p className="text-xl font-bold">{applicants.filter((a) => a.currentStatus === "Reviewing" && (Date.now() - new Date(a.$updatedAt).getTime()) > 3 * 24 * 60 * 60 * 1000).length}</p></CardContent></Card>
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.common.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.filterByStatus}</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Reviewing">Reviewing</SelectItem>
            <SelectItem value="Ready_for_Partner">Ready for Partner</SelectItem>
            <SelectItem value="Submitted_to_Partner">Submitted to Partner</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
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
                  {a.currentStatus === "Reviewing" && (Date.now() - new Date(a.$updatedAt).getTime()) > 3 * 24 * 60 * 60 * 1000 && (
                    <span className="text-xs font-medium text-red-500">Overdue</span>
                  )}
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

