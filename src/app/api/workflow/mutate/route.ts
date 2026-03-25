import { NextRequest, NextResponse } from "next/server";
import { Account, Client, ID, Query } from "node-appwrite";
import { serverDatabases } from "@/lib/appwrite-server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite";
import type { BillingRecord, Profile, ProfileStatus, Role } from "@/lib/types";
import { canTransitionProfileStatus, getTransitionError, REVIEW_REJECTION_CODES } from "@/lib/review-workflow";

type WorkflowAction =
  | "submitDossier"
  | "verifyDoc"
  | "rejectDoc"
  | "setProfileStatus"
  | "createInvoice"
  | "markInvoicePaid";

interface ActorContext {
  userId: string;
  profile: Profile;
}

async function getActorContext(jwt: string): Promise<ActorContext> {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt);

  const account = new Account(client);
  const user = await account.get();

  const profilesRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal("userId", user.$id),
    Query.limit(1),
  ]);

  if (profilesRes.documents.length === 0) {
    throw new Error("Profile not found for current user");
  }

  return {
    userId: user.$id,
    profile: profilesRes.documents[0] as unknown as Profile,
  };
}

function ensureRole(actorRole: Role, allowed: Role[]) {
  if (!allowed.includes(actorRole)) {
    throw new Error("Unauthorized action for current role");
  }
}

async function writeAuditLog({
  userId,
  action,
  targetId,
  targetType,
  details,
}: {
  userId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: string;
}) {
  await serverDatabases.createDocument(DATABASE_ID, COLLECTIONS.AUDIT_LOGS, ID.unique(), {
    userId,
    action,
    targetId: targetId || undefined,
    targetType: targetType || undefined,
    details: details || undefined,
  });
}

async function getProfile(profileId: string): Promise<Profile> {
  const profile = await serverDatabases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId);
  return profile as unknown as Profile;
}

function ensureApplicantProfile(targetProfile: Profile) {
  if (targetProfile.role !== "applicant") {
    throw new Error("Target profile must be an applicant");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jwt, action } = body as { jwt?: string; action?: WorkflowAction };

    if (!jwt || typeof jwt !== "string") {
      return NextResponse.json({ error: "Missing jwt" }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const actor = await getActorContext(jwt);

    switch (action) {
      case "submitDossier": {
        const { profileId } = body as { profileId?: string };
        if (!profileId || typeof profileId !== "string") {
          return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
        }

        ensureRole(actor.profile.role, ["applicant"]);

        if (actor.profile.$id !== profileId) {
          return NextResponse.json({ error: "Forbidden profile target" }, { status: 403 });
        }

        if (!canTransitionProfileStatus(actor.profile.currentStatus, "Reviewing")) {
          return NextResponse.json({ error: getTransitionError(actor.profile.currentStatus, "Reviewing") }, { status: 409 });
        }

        await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId, {
          currentStatus: "Reviewing",
        });

        await writeAuditLog({
          userId: actor.profile.$id,
          action: "submitDossier",
          targetId: profileId,
          targetType: "profile",
          details: `${actor.profile.fullName}: ${actor.profile.currentStatus} -> Reviewing`,
        });

        return NextResponse.json({ success: true });
      }

      case "verifyDoc": {
        const { profileId, docId } = body as { profileId?: string; docId?: string };
        if (!profileId || !docId || typeof profileId !== "string" || typeof docId !== "string") {
          return NextResponse.json({ error: "Missing profileId or docId" }, { status: 400 });
        }

        ensureRole(actor.profile.role, ["reviewer", "admin"]);

        const doc = await serverDatabases.getDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, docId);
        if ((doc.profileId as string) !== profileId) {
          return NextResponse.json({ error: "Document profile mismatch" }, { status: 409 });
        }

        const applicantProfile = await getProfile(profileId);
        ensureApplicantProfile(applicantProfile);

        await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, docId, {
          status: "Verified",
          reviewerNotes: "",
        });

        await writeAuditLog({
          userId: actor.profile.$id,
          action: "verifyDoc",
          targetId: docId,
          targetType: "document",
          details: String(doc.docType || "document"),
        });

        return NextResponse.json({ success: true });
      }

      case "rejectDoc": {
        const { profileId, docId, reasonCode, notes } = body as {
          profileId?: string;
          docId?: string;
          reasonCode?: string;
          notes?: string;
        };

        if (!profileId || !docId || typeof profileId !== "string" || typeof docId !== "string") {
          return NextResponse.json({ error: "Missing profileId or docId" }, { status: 400 });
        }

        if (!reasonCode || typeof reasonCode !== "string" || !REVIEW_REJECTION_CODES.includes(reasonCode as (typeof REVIEW_REJECTION_CODES)[number])) {
          return NextResponse.json({ error: "Invalid rejection reason code" }, { status: 400 });
        }

        if (!notes || typeof notes !== "string" || !notes.trim()) {
          return NextResponse.json({ error: "Rejection notes are required" }, { status: 400 });
        }

        ensureRole(actor.profile.role, ["reviewer", "admin"]);

        const doc = await serverDatabases.getDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, docId);
        if ((doc.profileId as string) !== profileId) {
          return NextResponse.json({ error: "Document profile mismatch" }, { status: 409 });
        }

        const applicantProfile = await getProfile(profileId);
        ensureApplicantProfile(applicantProfile);

        const details = `[${reasonCode}] ${notes.trim()}`;
        await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, docId, {
          status: "Needs_Correction",
          reviewerNotes: details,
        });

        if (canTransitionProfileStatus(applicantProfile.currentStatus, "Draft")) {
          await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId, {
            currentStatus: "Draft",
          });

          await writeAuditLog({
            userId: actor.profile.$id,
            action: "correctionRequested",
            targetId: profileId,
            targetType: "profile",
            details: `${applicantProfile.fullName}: ${applicantProfile.currentStatus} -> Draft`,
          });
        }

        await writeAuditLog({
          userId: actor.profile.$id,
          action: "rejectDoc",
          targetId: docId,
          targetType: "document",
          details,
        });

        return NextResponse.json({ success: true });
      }

      case "setProfileStatus": {
        const { profileId, toStatus, reasonCode, notes } = body as {
          profileId?: string;
          toStatus?: ProfileStatus;
          reasonCode?: string;
          notes?: string;
        };

        if (!profileId || !toStatus || typeof profileId !== "string" || typeof toStatus !== "string") {
          return NextResponse.json({ error: "Missing profileId or toStatus" }, { status: 400 });
        }

        ensureRole(actor.profile.role, ["reviewer", "admin"]);

        const allowedTargets: ProfileStatus[] = ["Ready_for_Partner", "Submitted_to_Partner", "Approved", "Rejected"];
        if (!allowedTargets.includes(toStatus)) {
          return NextResponse.json({ error: "Unsupported target status" }, { status: 400 });
        }

        const targetProfile = await getProfile(profileId);
        ensureApplicantProfile(targetProfile);

        if (!canTransitionProfileStatus(targetProfile.currentStatus, toStatus)) {
          return NextResponse.json({ error: getTransitionError(targetProfile.currentStatus, toStatus) }, { status: 409 });
        }

        let details = `${targetProfile.fullName}: ${targetProfile.currentStatus} -> ${toStatus}`;

        if (toStatus === "Rejected") {
          if (!reasonCode || typeof reasonCode !== "string" || !REVIEW_REJECTION_CODES.includes(reasonCode as (typeof REVIEW_REJECTION_CODES)[number])) {
            return NextResponse.json({ error: "Invalid rejection reason code" }, { status: 400 });
          }
          if (!notes || typeof notes !== "string" || !notes.trim()) {
            return NextResponse.json({ error: "Rejection notes are required" }, { status: 400 });
          }
          details = `[${reasonCode}] ${notes.trim()}`;
        }

        await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId, {
          currentStatus: toStatus,
        });

        const actionMap: Record<string, string> = {
          Ready_for_Partner: "readyForPartner",
          Submitted_to_Partner: "markSubmitted",
          Approved: "approveApplication",
          Rejected: "rejectApplication",
        };

        await writeAuditLog({
          userId: actor.profile.$id,
          action: actionMap[toStatus] ?? "setProfileStatus",
          targetId: profileId,
          targetType: "profile",
          details,
        });

        return NextResponse.json({ success: true });
      }

      case "createInvoice": {
        const { profileId, amount, invoiceType, description } = body as {
          profileId?: string;
          amount?: number;
          invoiceType?: string;
          description?: string;
        };

        if (!profileId || typeof profileId !== "string") {
          return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
        }

        if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
          return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        if (!invoiceType || typeof invoiceType !== "string") {
          return NextResponse.json({ error: "Missing invoiceType" }, { status: 400 });
        }

        ensureRole(actor.profile.role, ["admin"]);

        const targetProfile = await getProfile(profileId);
        ensureApplicantProfile(targetProfile);
        if (!canTransitionProfileStatus(targetProfile.currentStatus, "Invoiced")) {
          return NextResponse.json({ error: getTransitionError(targetProfile.currentStatus, "Invoiced") }, { status: 409 });
        }

        await serverDatabases.createDocument(DATABASE_ID, COLLECTIONS.BILLING, ID.unique(), {
          profileId,
          amount,
          status: "Unpaid",
          invoiceType,
          description: description || undefined,
        });

        await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId, {
          currentStatus: "Invoiced",
        });

        await writeAuditLog({
          userId: actor.profile.$id,
          action: "createInvoice",
          targetId: profileId,
          targetType: "billing",
          details: `${invoiceType} — ${amount.toFixed(2)} TND`,
        });

        return NextResponse.json({ success: true });
      }

      case "markInvoicePaid": {
        const { invoiceId } = body as { invoiceId?: string };

        if (!invoiceId || typeof invoiceId !== "string") {
          return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
        }

        ensureRole(actor.profile.role, ["admin"]);

        const invoice = (await serverDatabases.getDocument(
          DATABASE_ID,
          COLLECTIONS.BILLING,
          invoiceId
        )) as unknown as BillingRecord;

        const targetProfile = await getProfile(invoice.profileId);
        ensureApplicantProfile(targetProfile);

        if (!canTransitionProfileStatus(targetProfile.currentStatus, "Paid")) {
          return NextResponse.json({ error: getTransitionError(targetProfile.currentStatus, "Paid") }, { status: 409 });
        }

        await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.BILLING, invoiceId, {
          status: "Paid",
        });

        await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, invoice.profileId, {
          currentStatus: "Paid",
        });

        await writeAuditLog({
          userId: actor.profile.$id,
          action: "markPaid",
          targetId: invoiceId,
          targetType: "billing",
          details: `${invoice.invoiceType} — ${Number(invoice.amount).toFixed(2)} TND`,
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow mutation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
