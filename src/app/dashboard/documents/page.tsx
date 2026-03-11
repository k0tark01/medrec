"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ORIGINALS, BUCKET_TRANSLATIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { getRequiredDocs, formatDocType } from "@/lib/doc-requirements";
import { StatusBadge } from "@/components/status-badge";
import type { DocRecord } from "@/lib/types";
import { Upload, Eye, AlertTriangle, CheckCircle, FileText, Send } from "lucide-react";
import { ID } from "appwrite";

export default function DocumentsPage() {
  const { profile, refreshProfile } = useAuth();
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDocs = useCallback(async () => {
    if (!profile) return;
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DOCUMENTS, [
        Query.equal("profileId", profile.$id),
      ]);
      setDocs(res.documents as unknown as DocRecord[]);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  if (!profile) return null;

  const requiredDocs = getRequiredDocs(profile.occupation, profile.academicStatus);

  // Merge: for each required doc type, find or create a placeholder
  const docMap = new Map(docs.map((d) => [d.docType, d]));

  async function handleUpload(docType: string, variant: "original" | "translated", file: File) {
    if (!profile) return;
    setUploading(`${docType}-${variant}`);
    try {
      const bucket = variant === "original" ? BUCKET_ORIGINALS : BUCKET_TRANSLATIONS;
      const uploaded = await storage.createFile(bucket, ID.unique(), file);

      const existing = docMap.get(docType);
      if (existing) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, existing.$id, {
          [variant === "original" ? "originalFileId" : "translatedFileId"]: uploaded.$id,
          status: "Uploaded",
        });
      } else {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, ID.unique(), {
          profileId: profile.$id,
          docType,
          [variant === "original" ? "originalFileId" : "translatedFileId"]: uploaded.$id,
          status: "Uploaded",
        });
      }
      await loadDocs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmitDossier() {
    if (!profile) return;
    setSubmitting(true);
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile.$id, {
        currentStatus: "Reviewing",
      });
      await refreshProfile();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const allUploaded = requiredDocs.every((dt) => {
    const d = docMap.get(dt);
    return d && d.originalFileId && d.translatedFileId;
  });

  const canSubmit = allUploaded && profile.currentStatus === "Draft";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Documents</h1>
          <p className="text-sm text-ink-muted mt-1">
            Upload original + translated versions of each required document.
          </p>
        </div>
        {canSubmit && (
          <button
            onClick={handleSubmitDossier}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-bold" />
        </div>
      ) : (
        <div className="space-y-4">
          {requiredDocs.map((docType) => {
            const doc = docMap.get(docType);
            const status = doc?.status ?? "Missing";

            return (
              <div key={docType} className="bg-card rounded-xl border border-line p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-ink-faint" />
                    <span className="font-medium text-ink">{formatDocType(docType)}</span>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {doc?.reviewerNotes && status === "Needs_Correction" && (
                  <div className="bg-err-bg border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{doc.reviewerNotes}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Original */}
                  <FileSlot
                    label="Original (FR/AR)"
                    hasFile={!!doc?.originalFileId}
                    uploading={uploading === `${docType}-original`}
                    onFileSelect={(f) => handleUpload(docType, "original", f)}
                    disabled={status === "Verified"}
                  />
                  {/* Translated */}
                  <FileSlot
                    label="Translation (DE)"
                    hasFile={!!doc?.translatedFileId}
                    uploading={uploading === `${docType}-translated`}
                    onFileSelect={(f) => handleUpload(docType, "translated", f)}
                    disabled={status === "Verified"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FileSlot({
  label,
  hasFile,
  uploading,
  onFileSelect,
  disabled,
}: {
  label: string;
  hasFile: boolean;
  uploading: boolean;
  onFileSelect: (file: File) => void;
  disabled: boolean;
}) {
  return (
    <div className={`border rounded-lg p-3 ${hasFile ? "border-green-200 bg-green-50" : "border-dashed border-line-strong"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-ink-secondary">{label}</span>
        {hasFile && <CheckCircle className="w-4 h-4 text-green-600" />}
      </div>
      {!disabled && (
        <label className="flex items-center justify-center gap-2 py-2 px-3 bg-card border border-line rounded-lg text-sm text-ink-secondary hover:bg-card-hover cursor-pointer transition">
          {uploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              {hasFile ? <Eye className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {hasFile ? "Replace" : "Upload"}
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileSelect(f);
              e.target.value = "";
            }}
            disabled={uploading || disabled}
          />
        </label>
      )}
      {disabled && (
        <div className="text-xs text-green-600 font-medium">Verified Ã¢â‚¬â€ locked</div>
      )}
    </div>
  );
}
