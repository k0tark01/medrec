import { NextRequest, NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const { userId, secret } = await req.json();
    if (!userId || !secret || typeof userId !== "string" || typeof secret !== "string") {
      return NextResponse.json({ error: "Missing userId or secret" }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    // Use API key to complete verification server-side
    client.setKey(process.env.APPWRITE_API_KEY!);

    const account = new Account(client);
    await account.updateVerification(userId, secret);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
