import { NextRequest, NextResponse } from "next/server";
import { Account, Client, Query } from "node-appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { serverDatabases } from "@/lib/appwrite-server";
import type { Profile, StaffProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { jwt?: string };
    const jwt = body.jwt;

    if (!jwt || typeof jwt !== "string") {
      return NextResponse.json({ error: "Missing jwt" }, { status: 400 });
    }

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
      const normalized = {
        ...staff,
        occupation: "Other",
        academicStatus: "Graduated",
        currentStatus: "Draft",
      } as Profile;

      return NextResponse.json({ profile: normalized, source: "staff" });
    }

    const profileRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal("userId", user.$id),
      Query.limit(1),
    ]);

    if (profileRes.documents.length > 0) {
      return NextResponse.json({
        profile: profileRes.documents[0] as unknown as Profile,
        source: "applicant",
      });
    }

    return NextResponse.json({ profile: null, source: "none" });
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
