import dotenv from "dotenv";
import { Client, Databases, ID, Query } from "node-appwrite";

dotenv.config({ path: ".env.local" });
dotenv.config();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error("Missing env vars for cleanup script");
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

async function main() {
  const staff = await databases.listDocuments(databaseId, "staff_profiles", [Query.limit(100)]);
  let deleted = 0;
  let moved = 0;
  let created = 0;
  let updated = 0;

  for (const staffDoc of staff.documents) {
    const profileDocs = await databases.listDocuments(databaseId, "profiles", [
      Query.equal("userId", String(staffDoc.userId)),
      Query.limit(100),
    ]);

    for (const profile of profileDocs.documents) {
      await databases.deleteDocument(databaseId, "profiles", profile.$id);
      deleted += 1;
      console.log(`Deleted applicant profile ${profile.$id} for staff userId=${String(staffDoc.userId)}`);
    }
  }

  const misplacedStaffProfiles = await databases.listDocuments(databaseId, "profiles", [
    Query.equal("role", ["admin", "reviewer"]),
    Query.limit(100),
  ]);

  for (const profileDoc of misplacedStaffProfiles.documents) {
    const role = String(profileDoc.role);
    const userId = String(profileDoc.userId);

    const existingStaff = await databases.listDocuments(databaseId, "staff_profiles", [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);

    const payload: Record<string, unknown> = {
      userId,
      fullName: String(profileDoc.fullName || "Pending Staff"),
      email: String(profileDoc.email || ""),
      role,
    };

    if (profileDoc.phone) {
      payload.phone = String(profileDoc.phone);
    }

    if (existingStaff.documents.length > 0) {
      await databases.updateDocument(databaseId, "staff_profiles", existingStaff.documents[0].$id, payload);
      updated += 1;
      console.log(`Updated existing staff profile ${existingStaff.documents[0].$id} from misplaced profile ${profileDoc.$id}`);
    } else {
      await databases.createDocument(databaseId, "staff_profiles", ID.unique(), payload);
      created += 1;
      console.log(`Created staff profile for misplaced role=${role} userId=${userId}`);
    }

    await databases.deleteDocument(databaseId, "profiles", profileDoc.$id);
    moved += 1;
    console.log(`Deleted misplaced staff role profile ${profileDoc.$id}`);
  }

  console.log(
    `Cleanup complete. Deleted ${deleted} conflicting applicant rows. Moved ${moved} misplaced staff rows (${created} created, ${updated} updated).`
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
