import dotenv from "dotenv";
import { Client, Databases, Query, Users } from "node-appwrite";

dotenv.config({ path: ".env.local" });
dotenv.config();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error("Missing env vars");
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const users = new Users(client);
const databases = new Databases(client);

async function listByEmail(email: string) {
  const u = await users.list({ queries: [Query.equal("email", [email]), Query.limit(1)] });
  if (!u.users[0]) {
    console.log(`User not found: ${email}`);
    return;
  }
  const user = u.users[0];
  console.log(`\n=== ${email} ===`);
  console.log(`userId=${user.$id} verified=${user.emailVerification}`);

  const app = await databases.listDocuments(databaseId, "profiles", [
    Query.equal("userId", user.$id),
    Query.limit(10),
  ]);
  const staff = await databases.listDocuments(databaseId, "staff_profiles", [
    Query.equal("userId", user.$id),
    Query.limit(10),
  ]);

  console.log(`profiles rows=${app.documents.length}`);
  app.documents.forEach((d) => {
    console.log(`  - profile ${d.$id} role=${String(d.role)} fullName=${String(d.fullName)}`);
  });

  console.log(`staff_profiles rows=${staff.documents.length}`);
  staff.documents.forEach((d) => {
    console.log(`  - staff ${d.$id} role=${String(d.role)} fullName=${String(d.fullName)}`);
  });
}

async function main() {
  await listByEmail("applicant.test@medrec.local");
  await listByEmail("reviewer.test@medrec.local");
  await listByEmail("admin.test@medrec.local");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
