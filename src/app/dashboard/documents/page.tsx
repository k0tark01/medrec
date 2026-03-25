"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { account, databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ORIGINALS, BUCKET_TRANSLATIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { getRequiredDocs, formatDocType } from "@/lib/doc-requirements";
import { StatusBadge } from "@/components/status-badge";
import type { DocRecord } from "@/lib/types";
import { Upload, Eye, AlertTriangle, CheckCircle, FileText, Send, Loader2 } from "lucide-react";
import { ID } from "appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/language-context";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/ui/skeleton";
import { canTransitionProfileStatus, getTransitionError } from "@/lib/review-workflow";

export default function DocumentsPage() {
  const { profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
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
  if (profile.role !== "applicant") {
    return <p className="text-muted-foreground">{t.review.noAccess}</p>;
  }

  const requiredDocs = getRequiredDocs(profile.occupation, profile.academicStatus);
  const docMap = new Map(docs.map((d) => [d.docType, d]));

  async function handleUpload(docType: string, variant: "original" | "translated", file: File) {
    if (!profile) return;
    if (profile.currentStatus !== "Draft") {
      toast.error("Documents are locked while your application is under review.");
      return;
    }
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
      toast.error(err instanceof Error ? err.message : t.docs.uploadFailed);
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmitDossier() {
    if (!profile) return;
    if (!canTransitionProfileStatus(profile.currentStatus, "Reviewing")) {
      toast.error(getTransitionError(profile.currentStatus, "Reviewing"));
      return;
    }
    setSubmitting(true);
    try {
      const jwt = await account.createJWT();
      const response = await fetch("/api/workflow/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt: jwt.jwt,
          action: "submitDossier",
          profileId: profile.$id,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || t.docs.submissionFailed);
      }

      await refreshProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.docs.submissionFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const allUploaded = requiredDocs.every((dt) => {
    const d = docMap.get(dt);
    return d && d.originalFileId && d.translatedFileId;
  });

  const canSubmit = allUploaded && profile.currentStatus === "Draft";
  const documentsLocked = profile.currentStatus !== "Draft";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.docs.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.docs.desc}
          </p>
        </div>
        {canSubmit && (
          <Button
            onClick={handleSubmitDossier}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {submitting ? t.submitting : t.docs.submitForReview}
          </Button>
        )}
      </div>

      {documentsLocked && (
        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
          Documents are currently locked while your dossier is in review. They will reopen if corrections are requested.
        </div>
      )}

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="space-y-4">
          {requiredDocs.map((docType) => {
            const doc = docMap.get(docType);
            const status = doc?.status ?? "Missing";

            return (
              <Card key={docType}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{formatDocType(docType)}</span>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  {doc?.reviewerNotes && status === "Needs_Correction" && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-3 text-sm text-destructive flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{doc.reviewerNotes}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FileSlot
                      label={t.docs.original}
                      hasFile={!!doc?.originalFileId}
                      uploading={uploading === `${docType}-original`}
                      onFileSelect={(f) => handleUpload(docType, "original", f)}
                      disabled={status === "Verified" || documentsLocked}
                    />
                    <FileSlot
                      label={t.docs.translation}
                      hasFile={!!doc?.translatedFileId}
                      uploading={uploading === `${docType}-translated`}
                      onFileSelect={(f) => handleUpload(docType, "translated", f)}
                      disabled={status === "Verified" || documentsLocked}
                    />
                  </div>
                </CardContent>
              </Card>
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
  const { t } = useTranslation();
  return (
    <div className={`border rounded-lg p-3 ${hasFile ? "border-green-500/30 bg-green-500/5" : "border-dashed border-border"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {hasFile && <CheckCircle className="w-4 h-4 text-green-600" />}
      </div>
      {!disabled && (
        <label className="flex items-center justify-center gap-2 py-2 px-3 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors">
          {uploading ? (
            <span className="animate-pulse">{t.uploading}</span>
          ) : (
            <>
              {hasFile ? <Eye className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {hasFile ? t.docs.replace : t.docs.upload}
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
        <div className="text-xs text-green-600 font-medium">{t.docs.verifiedLocked}</div>
      )}
    </div>
  );
}
