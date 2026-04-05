import dotenv from "dotenv";
import { Client, Databases, ID, Permission, Query, Role as AppwriteRole, Users, type Models } from "node-appwrite";

dotenv.config({ path: ".env.local" });
dotenv.config();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error("Missing required environment variables for Appwrite reset/seed script.");
}

const dbId: string = databaseId;

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const users = new Users(client);

const COLLECTIONS = {
  PROFILES: "profiles",
  STAFF_PROFILES: "staff_profiles",
  DOCUMENTS: "documents",
  BILLING: "billing",
  AUDIT_LOGS: "audit_logs",
} as const;

const SEED = {
  applicant: {
    email: "applicant.test@medrec.local",
    password: "Test@123456",
    fullName: "Applicant Test",
    phone: "+21611111111",
    role: "applicant" as const,
  },
  reviewer: {
    email: "reviewer.test@medrec.local",
    password: "Test@123456",
    fullName: "Reviewer Test",
    phone: "+21622222222",
    role: "reviewer" as const,
  },
  admin: {
    email: "admin.test@medrec.local",
    password: "Test@123456",
    fullName: "Admin Test",
    phone: "+21633333333",
    role: "admin" as const,
  },
};

async function listAllDocuments(collectionId: string) {
  const all: Models.Document[] = [];
  let offset = 0;

  while (true) {
    const page = await databases.listDocuments(dbId, collectionId, [
      Query.limit(100),
      Query.offset(offset),
    ]);

    if (page.documents.length === 0) break;

    all.push(...page.documents);
    offset += page.documents.length;

    if (page.documents.length < 100) break;
  }

  return all;
}

async function deleteAllRows(collectionId: string) {
  const docs = await listAllDocuments(collectionId);
  for (const doc of docs) {
    await databases.deleteDocument(dbId, collectionId, doc.$id);
  }
  console.log(`Cleared ${collectionId}: ${docs.length} rows`);
}

async function getUserByEmail(email: string) {
  const result = await users.list({
    queries: [Query.equal("email", [email]), Query.limit(1)],
  });

  return result.users[0] ?? null;
}

async function deleteUserByEmailIfExists(email: string) {
  const existing = await getUserByEmail(email);
  if (!existing) return;
  await users.delete(existing.$id);
  console.log(`Deleted existing user: ${email}`);
}

async function createUser(email: string, password: string, name: string) {
  const created = await users.create({
    userId: ID.unique(),
    email,
    password,
    name,
  });

  await users.updateEmailVerification({ userId: created.$id, emailVerification: true });

  return created;
}

async function seedApplicant(userId: string) {
  await databases.createDocument(dbId, COLLECTIONS.PROFILES, ID.unique(), {
    userId,
    fullName: SEED.applicant.fullName,
    email: SEED.applicant.email,
    phone: SEED.applicant.phone,
    occupation: "Engineer",
    academicStatus: "Graduated",
    currentStatus: "Draft",
    role: "applicant",
  }, [
    Permission.read(AppwriteRole.user(userId)),
    Permission.update(AppwriteRole.user(userId)),
    Permission.delete(AppwriteRole.user(userId)),
  ]);
}

async function seedStaff(userId: string, role: "reviewer" | "admin", fullName: string, email: string, phone: string) {
  await databases.createDocument(dbId, COLLECTIONS.STAFF_PROFILES, ID.unique(), {
    userId,
    fullName,
    email,
    phone,
    role,
  }, [
    Permission.read(AppwriteRole.user(userId)),
    Permission.update(AppwriteRole.user(userId)),
    Permission.delete(AppwriteRole.user(userId)),
  ]);
}

async function main() {
  console.log("Starting reset + seed...");

  await deleteAllRows(COLLECTIONS.DOCUMENTS);
  await deleteAllRows(COLLECTIONS.BILLING);
  await deleteAllRows(COLLECTIONS.AUDIT_LOGS);
  await deleteAllRows(COLLECTIONS.STAFF_PROFILES);
  await deleteAllRows(COLLECTIONS.PROFILES);

  await deleteUserByEmailIfExists(SEED.applicant.email);
  await deleteUserByEmailIfExists(SEED.reviewer.email);
  await deleteUserByEmailIfExists(SEED.admin.email);

  const applicantUser = await createUser(SEED.applicant.email, SEED.applicant.password, SEED.applicant.fullName);
  const reviewerUser = await createUser(SEED.reviewer.email, SEED.reviewer.password, SEED.reviewer.fullName);
  const adminUser = await createUser(SEED.admin.email, SEED.admin.password, SEED.admin.fullName);

  await seedApplicant(applicantUser.$id);
  await seedStaff(reviewerUser.$id, "reviewer", SEED.reviewer.fullName, SEED.reviewer.email, SEED.reviewer.phone);
  await seedStaff(adminUser.$id, "admin", SEED.admin.fullName, SEED.admin.email, SEED.admin.phone);

  console.log("Reset + seed complete.");
  console.log("\nTest accounts:");
  console.log(`Applicant: ${SEED.applicant.email} / ${SEED.applicant.password}`);
  console.log(`Reviewer:  ${SEED.reviewer.email} / ${SEED.reviewer.password}`);
  console.log(`Admin:     ${SEED.admin.email} / ${SEED.admin.password}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Reset + seed failed:", message);
  process.exit(1);
});
