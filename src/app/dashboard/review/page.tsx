"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ORIGINALS, BUCKET_TRANSLATIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { StatusBadge } from "@/components/status-badge";
import { formatDocType } from "@/lib/doc-requirements";
import type { Profile, DocRecord } from "@/lib/types";
import { ChevronRight, Eye, Check, X, Download, ArrowLeft, Send } from "lucide-react";

export default function ReviewPage() {
  const { profile } = useAuth();
  const [applicants, setApplicants] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);

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
    if (selected) await loadDocs(selected);
  }

  async function rejectDoc(doc: DocRecord) {
    const notes = prompt("Reason for rejection:");
    if (!notes) return;
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, doc.$id, {
      status: "Needs_Correction",
      reviewerNotes: notes,
    });
    if (selected) await loadDocs(selected);
  }

  async function markReadyForPartner(applicant: Profile) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, applicant.$id, {
      currentStatus: "Ready_for_Partner",
    });
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

  if (!profile || (profile.role !== "reviewer" && profile.role !== "admin")) {
    return <p className="text-ink-muted">You don&apos;t have access to this page.</p>;
  }

  // Detail view
  if (selected) {
    const allVerified = docs.length > 0 && docs.every((d) => d.status === "Verified");

    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink-secondary mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">{selected.fullName}</h1>
            <p className="text-sm text-ink-muted">
              {selected.occupation} Ã¢â‚¬Â¢ {selected.academicStatus} Ã¢â‚¬Â¢ {selected.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={selected.currentStatus} />
            {allVerified && selected.currentStatus === "Reviewing" && (
              <button
                onClick={() => markReadyForPartner(selected)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-bold text-white text-sm rounded-lg hover:bg-accent-bolder"
              >
                <Check className="w-4 h-4" /> Ready for Partner
              </button>
            )}
            {selected.currentStatus === "Ready_for_Partner" && (
              <button
                onClick={() => markSubmittedToPartner(selected)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                <Send className="w-4 h-4" /> Mark Submitted
              </button>
            )}
          </div>
        </div>

        {loadingDocs ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-bold" />
          </div>
        ) : docs.length === 0 ? (
          <p className="text-ink-muted py-8 text-center">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc.$id} className="bg-card rounded-xl border border-line p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-ink">{formatDocType(doc.docType)}</span>
                  <StatusBadge status={doc.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {doc.originalFileId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-muted">Original:</span>
                      <a
                        href={getPreviewUrl(doc.originalFileId, BUCKET_ORIGINALS).toString()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-bold text-xs hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </a>
                      <a
                        href={getDownloadUrl(doc.originalFileId, BUCKET_ORIGINALS).toString()}
                        className="text-ink-muted text-xs hover:underline inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </div>
                  )}
                  {doc.translatedFileId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-muted">Translation:</span>
                      <a
                        href={getPreviewUrl(doc.translatedFileId, BUCKET_TRANSLATIONS).toString()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-bold text-xs hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </a>
                      <a
                        href={getDownloadUrl(doc.translatedFileId, BUCKET_TRANSLATIONS).toString()}
                        className="text-ink-muted text-xs hover:underline inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </div>
                  )}
                </div>

                {doc.status !== "Verified" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => verifyDoc(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-300"
                    >
                      <Check className="w-3 h-3" /> Verify
                    </button>
                    <button
                      onClick={() => rejectDoc(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Queue list view
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-2">Review Queue</h1>
      <p className="text-sm text-ink-muted mb-6">Click an applicant to review their documents.</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-bold" />
        </div>
      ) : applicants.length === 0 ? (
        <p className="text-ink-muted py-8 text-center">No applicants to review.</p>
      ) : (
        <div className="space-y-2">
          {applicants.map((a) => (
            <button
              key={a.$id}
              onClick={() => loadDocs(a)}
              className="w-full bg-card rounded-xl border border-line p-4 flex items-center justify-between hover:border-accent-200 transition text-left"
            >
              <div>
                <div className="font-medium text-ink">{a.fullName}</div>
                <div className="text-xs text-ink-muted">
                  {a.occupation} Ã¢â‚¬Â¢ {a.academicStatus} Ã¢â‚¬Â¢ {a.email}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.currentStatus} />
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
