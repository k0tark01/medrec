import { NextRequest, NextResponse } from "next/server";
import { Account, Client, Query } from "node-appwrite";
import { BUCKET_ORIGINALS, BUCKET_TRANSLATIONS, COLLECTIONS, DATABASE_ID } from "@/lib/appwrite";
import { serverDatabases, serverStorage } from "@/lib/appwrite-server";
import type { DocRecord, Profile, Role, StaffProfile } from "@/lib/types";

type AccessMode = "preview" | "download";

async function getActorProfile(jwt: string): Promise<Profile> {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt);

  const account = new Account(client);
  const user = await account.get();

  const staffRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, [
    Query.equal("userId", user.$id),
    Query.limit(1),
  ]);

  if (staffRes.documents.length > 0) {
    const staff = staffRes.documents[0] as unknown as StaffProfile;
    return {
      ...staff,
      occupation: "Other",
      academicStatus: "Graduated",
      currentStatus: "Draft",
    } as Profile;
  }

  const profilesRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal("userId", user.$id),
    Query.limit(1),
  ]);

  if (profilesRes.documents.length === 0) {
    throw new Error("Profile not found for current user");
  }

  return profilesRes.documents[0] as unknown as Profile;
}

function ensureRole(role: Role, allowed: Role[]) {
  if (!allowed.includes(role)) {
    throw new Error("Unauthorized action for current role");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      jwt?: string;
      fileId?: string;
      profileId?: string;
      bucketId?: string;
      mode?: AccessMode;
    };

    const jwt = body.jwt;
    const fileId = body.fileId;
    const profileId = body.profileId;
    const bucketId = body.bucketId;
    const mode: AccessMode = body.mode === "download" ? "download" : "preview";

    if (!jwt || !fileId || !profileId || !bucketId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (bucketId !== BUCKET_ORIGINALS && bucketId !== BUCKET_TRANSLATIONS) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const actor = await getActorProfile(jwt);
    ensureRole(actor.role, ["reviewer", "admin"]);

    const targetProfile = (await serverDatabases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      profileId
    )) as unknown as Profile;

    if (targetProfile.role !== "applicant") {
      return NextResponse.json({ error: "Target profile must be an applicant" }, { status: 400 });
    }

    const docsRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.DOCUMENTS, [
      Query.equal("profileId", profileId),
      Query.limit(200),
    ]);

    const docs = docsRes.documents as unknown as DocRecord[];
    const fileBelongsToProfile = docs.some(
      (doc) => doc.originalFileId === fileId || doc.translatedFileId === fileId
    );

    if (!fileBelongsToProfile) {
      return NextResponse.json({ error: "File does not belong to applicant" }, { status: 403 });
    }

    const meta = await serverStorage.getFile(bucketId, fileId);
    const bytes = await serverStorage.getFileDownload(bucketId, fileId);
    const data = new Uint8Array(Buffer.from(bytes));

    const headers = new Headers();
    headers.set("Content-Type", meta.mimeType || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      mode === "download"
        ? `attachment; filename="${meta.name || fileId}"`
        : `inline; filename="${meta.name || fileId}"`
    );
    headers.set("Cache-Control", "no-store");

    return new NextResponse(data, { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to access file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
