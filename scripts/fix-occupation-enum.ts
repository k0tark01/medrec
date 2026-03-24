/**
 * Update the occupation enum attribute to include "Other".
 * Usage: npx tsx scripts/fix-occupation-enum.ts
 */
import { Client, Databases } from "node-appwrite";

const ENDPOINT = process.env.APPWRITE_ENDPOINT ?? "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "jobbridge_db";

async function main() {
  if (!PROJECT_ID || !API_KEY) {
    throw new Error("Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in environment.");
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);

  console.log("Updating occupation enum to include 'Other'...");
  try {
    await databases.updateEnumAttribute({
      databaseId: DATABASE_ID,
      collectionId: "profiles",
      key: "occupation",
      elements: ["Nurse", "Doctor", "Engineer", "Other"],
      required: true,
    });
    console.log("✅ occupation attribute now accepts: Nurse, Doctor, Engineer, Other");
  } catch (e: unknown) {
    console.error("✗ Update failed:", e instanceof Error ? e.message : String(e));
  }
}

main().catch(console.error);
