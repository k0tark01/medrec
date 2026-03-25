import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { serverUsers } from "@/lib/appwrite-server";

function parseUsedHashes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function POST(req: NextRequest) {
  try {
    const { userId, secret, password, confirmPassword, expire, action } = await req.json();

    if (
      !userId ||
      !secret ||
      typeof userId !== "string" ||
      typeof secret !== "string"
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const requestedAction = action === "mark-used" ? "mark-used" : "check";

    if (requestedAction === "mark-used") {
      if (
        !password ||
        !confirmPassword ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
      ) {
        return NextResponse.json({ error: "Missing password fields" }, { status: 400 });
      }

      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
      }

      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
    }

    if (typeof expire === "string") {
      const expiresAt = Date.parse(expire);
      if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
        return NextResponse.json({ error: "Reset link is expired" }, { status: 410 });
      }
    }

    const secretHash = createHash("sha256").update(secret).digest("hex");

    const user = await serverUsers.get(userId);
    const existingPrefs = (user.prefs ?? {}) as Record<string, unknown>;
    const usedHashes = parseUsedHashes(existingPrefs.usedRecoverySecretHashes);

    if (usedHashes.includes(secretHash)) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 409 });
    }

    if (requestedAction === "mark-used") {
      const nextUsedHashes = [...usedHashes, secretHash].slice(-30);
      await serverUsers.updatePrefs(userId, {
        ...existingPrefs,
        usedRecoverySecretHashes: nextUsedHashes,
      });
    }

    return NextResponse.json({ success: true, action: requestedAction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password";

    if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
      return NextResponse.json({ error: "Reset link is invalid or expired" }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
