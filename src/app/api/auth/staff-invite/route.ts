import { NextRequest, NextResponse } from "next/server";
import { Account, Client, ID, Permission, Query, Role as AppwriteRole, Teams } from "node-appwrite";
import { serverDatabases, serverUsers } from "@/lib/appwrite-server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite";
import type { Profile, Role, StaffProfile } from "@/lib/types";

type Action = "send" | "complete";

type AppwriteLikeError = Error & {
  code?: number;
  type?: string;
  response?: string;
};

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

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

async function getActorContext(jwt: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt);

  const account = new Account(client);
  const user = await account.get();

  let actorProfile: Profile | StaffProfile | null = null;

  // Prefer staff profile to avoid collisions when stale applicant rows exist.
  const staffRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, [
    Query.equal("userId", user.$id),
    Query.limit(1),
  ]);

  if (staffRes.documents.length > 0) {
    actorProfile = staffRes.documents[0] as unknown as StaffProfile;
  } else {
    const profilesRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal("userId", user.$id),
      Query.limit(1),
    ]);

    if (profilesRes.documents.length > 0) {
      actorProfile = profilesRes.documents[0] as unknown as Profile;
    }
  }

  if (!actorProfile) {
    throw new Error("FORBIDDEN");
  }

  if (actorProfile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return { actorUser: user, actorProfile };
}

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

function getStaffTeamId() {
  return process.env.APPWRITE_STAFF_TEAM_ID || process.env.NEXT_PUBLIC_APPWRITE_STAFF_TEAM_ID || "";
}

function getJwtClient(jwt: string) {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt);
}

async function getProfileByUserId(userId: string): Promise<StaffProfile | null> {
  const profileRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);

  if (profileRes.documents.length === 0) return null;
  return profileRes.documents[0] as unknown as StaffProfile;
}

async function deleteApplicantProfilesByUserId(userId: string) {
  const applicantRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal("userId", userId),
    Query.limit(100),
  ]);

  for (const doc of applicantRes.documents) {
    await serverDatabases.deleteDocument(DATABASE_ID, COLLECTIONS.PROFILES, doc.$id);
  }
}

async function getUserByEmail(email: string) {
  const userList = await serverUsers.list({
    queries: [Query.equal("email", [email]), Query.limit(1)],
  });

  return userList.users.length > 0 ? userList.users[0] : null;
}

async function removePendingMemberships(teams: Teams, teamId: string, userId: string) {
  const memberships = await teams.listMemberships({
    teamId,
    queries: [Query.equal("userId", [userId]), Query.limit(100)],
  });

  for (const membership of memberships.memberships) {
    if (!membership.confirm) {
      await teams.deleteMembership({ teamId, membershipId: membership.$id });
    }
  }
}

async function createTeamInvite({
  teams,
  teamId,
  role,
  email,
  inviteUrl,
  userId,
}: {
  teams: Teams;
  teamId: string;
  role: Exclude<Role, "applicant">;
  email: string;
  inviteUrl: string;
  userId?: string;
}) {
  return await teams.createMembership({
    teamId,
    roles: [role],
    email,
    userId,
    url: inviteUrl,
    name: "Pending Staff",
  });
}

async function ensureStaffProfile({
  userId,
  email,
  role,
}: {
  userId: string;
  email: string;
  role: Exclude<Role, "applicant">;
}) {
  const existingProfile = await getProfileByUserId(userId);

  if (existingProfile) {
    if (existingProfile.role !== role || existingProfile.email !== email) {
      await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, existingProfile.$id, {
        role,
        email,
      });
    }
    return existingProfile;
  }

  return (await serverDatabases.createDocument(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, ID.unique(), {
    userId,
    fullName: "Pending Staff",
    email,
    role,
  }, [
    Permission.read(AppwriteRole.user(userId)),
    Permission.update(AppwriteRole.user(userId)),
    Permission.delete(AppwriteRole.user(userId)),
  ])) as unknown as StaffProfile;
}

async function handleSend(req: NextRequest, body: Record<string, unknown>) {
  const jwt = typeof body.jwt === "string" ? body.jwt : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role === "admin" ? "admin" : body.role === "reviewer" ? "reviewer" : null;
  const teamId = getStaffTeamId();

  if (!jwt) {
    return NextResponse.json({ error: "Missing auth token" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Missing invite email" }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json({ error: "Missing invite role" }, { status: 400 });
  }

  if (!teamId) {
    return NextResponse.json({ error: "Staff team is not configured" }, { status: 500 });
  }

  const inviteUrl = `${getBaseUrl(req)}/auth/staff-activate`;
  const teams = new Teams(getJwtClient(jwt));
  const { actorUser, actorProfile } = await getActorContext(jwt);
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    const existingPrefs = (existingUser.prefs ?? {}) as Record<string, unknown>;
    const hasInviteFootprint =
      existingPrefs.pendingStaffRole === "reviewer" ||
      existingPrefs.pendingStaffRole === "admin" ||
      typeof existingPrefs.invitedByUserId === "string" ||
      existingPrefs.staffInvitePending === true;

    const existingProfile = await getProfileByUserId(existingUser.$id);

    if (!existingProfile && hasInviteFootprint) {
      await ensureStaffProfile({ userId: existingUser.$id, email, role });
      await deleteApplicantProfilesByUserId(existingUser.$id);
    }

    const resolvedProfile = existingProfile ?? await getProfileByUserId(existingUser.$id);

    const canResend =
      resolvedProfile &&
      (resolvedProfile.role === "reviewer" || resolvedProfile.role === "admin") &&
      (existingPrefs.staffInvitePending === true || hasInviteFootprint);

    if (!canResend) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    await removePendingMemberships(teams, teamId, existingUser.$id);
    await createTeamInvite({
      teams,
      teamId,
      role,
      email,
      inviteUrl,
      userId: existingUser.$id,
    });
    await ensureStaffProfile({ userId: existingUser.$id, email, role });

    const resendCount = Number(existingPrefs.staffInviteResendCount || 0) + 1;

    await serverUsers.updatePrefs(existingUser.$id, {
      ...existingPrefs,
      staffInvitePending: true,
      pendingStaffRole: role,
      staffInviteResendCount: resendCount,
      staffInviteLastSentAt: new Date().toISOString(),
      staffInviteExpiresAt: inviteExpiresAt,
      invitedByUserId: actorUser.$id,
      invitedByProfileId: actorProfile.$id,
    });

    await writeAuditLog({
      userId: actorProfile.$id,
      action: "staffInviteResent",
      targetId: existingUser.$id,
      targetType: "user",
      details: `${email} (${role})`,
    });

    return NextResponse.json({ success: true, resent: true });
  }

  await createTeamInvite({
    teams,
    teamId,
    role,
    email,
    inviteUrl,
  });

  const createdUser = await getUserByEmail(email);

  if (!createdUser) {
    return NextResponse.json({ error: "Invite sent but user could not be resolved" }, { status: 500 });
  }

  await ensureStaffProfile({ userId: createdUser.$id, email, role });

  await serverUsers.updatePrefs(createdUser.$id, {
    ...(createdUser.prefs ?? {}),
    staffInvitePending: true,
    pendingStaffRole: role,
    invitedByUserId: actorUser.$id,
    invitedByProfileId: actorProfile.$id,
    staffInviteCreatedAt: new Date().toISOString(),
    staffInviteLastSentAt: new Date().toISOString(),
    staffInviteResendCount: 0,
    staffInviteExpiresAt: inviteExpiresAt,
  });

  await writeAuditLog({
    userId: actorProfile.$id,
    action: "staffInviteCreated",
    targetId: createdUser.$id,
    targetType: "user",
    details: `${email} (${role})`,
  });

  return NextResponse.json({ success: true, resent: false });
}

async function handleComplete(body: Record<string, unknown>) {
  const jwt = typeof body.jwt === "string" ? body.jwt : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

  if (!jwt || !fullName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const account = new Account(getJwtClient(jwt));
  const actorUser = await account.get();
  const user = await serverUsers.get(actorUser.$id);
  const prefs = (user.prefs ?? {}) as Record<string, unknown>;
  const pendingRole: Exclude<Role, "applicant"> = prefs.pendingStaffRole === "admin" ? "admin" : "reviewer";

  await serverUsers.updateName(actorUser.$id, fullName);
  await serverUsers.updatePrefs(actorUser.$id, {
    ...prefs,
    staffInvitePending: false,
    staffInviteAcceptedAt: new Date().toISOString(),
  });

  const existingProfile = await getProfileByUserId(actorUser.$id);
  const profile = existingProfile ?? await ensureStaffProfile({
    userId: actorUser.$id,
    email: user.email,
    role: pendingRole,
  });

  if (profile) {
    const resolvedRole: Exclude<Role, "applicant"> =
      prefs.pendingStaffRole === "admin"
        ? "admin"
        : prefs.pendingStaffRole === "reviewer"
          ? "reviewer"
          : profile.role;

    await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_PROFILES, profile.$id, {
      fullName,
      email: user.email,
      role: resolvedRole,
    });

    await deleteApplicantProfilesByUserId(actorUser.$id);

    if (prefs.invitedByProfileId && typeof prefs.invitedByProfileId === "string") {
      await writeAuditLog({
        userId: prefs.invitedByProfileId,
        action: "staffInviteAccepted",
        targetId: profile.$id,
        targetType: "profile",
        details: `${fullName} (${profile.role})`,
      });
    }
  }

  return NextResponse.json({ success: true, email: user.email });
}

export async function POST(req: NextRequest) {
  let action: Action = "send";

  try {
    const body = (await req.json()) as Record<string, unknown>;
    action = body.action === "complete" ? "complete" : "send";

    if (action === "send") {
      return await handleSend(req, body);
    }

    return await handleComplete(body);
  } catch (error) {
    const err = error as AppwriteLikeError;
    const message = err?.message || "Staff invite request failed";
    const lower = message.toLowerCase();

    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "complete" && (lower.includes("invalid") || lower.includes("expired"))) {
      return NextResponse.json({ error: "Invite link is invalid or expired" }, { status: 400 });
    }

    if (lower.includes("team") && lower.includes("not found")) {
      return NextResponse.json({ error: "Staff team was not found. Check APPWRITE_STAFF_TEAM_ID." }, { status: 500 });
    }

    if (lower.includes("platform") || lower.includes("redirect") || lower.includes("hostname")) {
      return NextResponse.json({ error: "Invite redirect URL is not allowed in Appwrite platform settings." }, { status: 500 });
    }

    if (lower.includes("missing scope") || lower.includes("not authorized") || lower.includes("not have access")) {
      return NextResponse.json({ error: "Admin is missing team invite permissions for the configured staff team." }, { status: 403 });
    }

    if (err?.code && Number.isFinite(err.code)) {
      return NextResponse.json({ error: `Invite failed (${err.code}): ${message}` }, { status: err.code });
    }

    return NextResponse.json({ error: `Invite failed: ${message}` }, { status: 500 });
  }
}
