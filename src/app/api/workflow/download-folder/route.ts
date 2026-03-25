import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { Account, Client, Query } from "node-appwrite";
import { serverDatabases, serverStorage } from "@/lib/appwrite-server";
import { BUCKET_ORIGINALS, BUCKET_TRANSLATIONS, COLLECTIONS, DATABASE_ID } from "@/lib/appwrite";
import type { DocRecord, Profile, Role } from "@/lib/types";

async function getActorProfile(jwt: string): Promise<Profile> {
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

  return profilesRes.documents[0] as unknown as Profile;
}

function ensureRole(role: Role, allowed: Role[]) {
  if (!allowed.includes(role)) {
    throw new Error("Unauthorized action for current role");
  }
}

function safeName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_").slice(0, 80);
}

async function addFileToZip(zip: JSZip, folderName: string, bucketId: string, fileId: string, fallbackName: string) {
  const meta = await serverStorage.getFile(bucketId, fileId);
  const data = await serverStorage.getFileDownload(bucketId, fileId);
  const bytes = Buffer.from(data);
  const fileName = safeName(meta.name || fallbackName || fileId);
  zip.file(`${folderName}/${fileName}`, bytes);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jwt, profileId } = body as { jwt?: string; profileId?: string };

    if (!jwt || typeof jwt !== "string") {
      return NextResponse.json({ error: "Missing jwt" }, { status: 400 });
    }

    if (!profileId || typeof profileId !== "string") {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
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
    if (docs.length === 0) {
      return NextResponse.json({ error: "No documents found for this application" }, { status: 404 });
    }

    const zip = new JSZip();

    for (const doc of docs) {
      const folderName = safeName(doc.docType || "Document");

      if (doc.originalFileId) {
        await addFileToZip(zip, folderName, BUCKET_ORIGINALS, doc.originalFileId, `${folderName}_original`);
      }

      if (doc.translatedFileId) {
        await addFileToZip(zip, folderName, BUCKET_TRANSLATIONS, doc.translatedFileId, `${folderName}_translation`);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
    const zipBytes = new Uint8Array(zipBuffer);

    const applicantName = safeName(targetProfile.fullName || profileId);
    const fileName = `application_folder_${applicantName}.zip`;

    return new NextResponse(zipBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=\"${fileName}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to download application folder";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
