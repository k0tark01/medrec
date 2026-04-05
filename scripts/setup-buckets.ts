/**
 * Full Appwrite setup: database, collections, columns, and storage buckets.
 * Usage: npx tsx scripts/setup-buckets.ts
 *
 * Credentials are hardcoded here for one-time setup convenience.
 */
import { Client, Databases, Storage } from "node-appwrite";

const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "69b0c13400091369a61a";
const API_KEY = "standard_7f8965a2e93fba6bfc860ded3c3924c94aca36f2f3a9efbaa0acf00c90f0f8f9fa309c3918d86436f76c123380a33a0b4777a97ebea40293cbdfb4ffcfd4ccb2836700acca569a406b8d542c0d198f33c82cb04ea34be7149cda1def4d5de46ef13c19171ab93f033df9a03b48b89705e27cbaa9e76f63d4708d1c6c4a33ac4f";
const DATABASE_ID = "jobbridge_db";

async function main() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);
  const storage = new Storage(client);

  // 1. Create database
  try {
    await databases.create(DATABASE_ID, "JobBridge");
    console.log("✓ Created database: JobBridge");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists")) console.log("⏭ Database already exists");
    else console.error("✗ Database creation failed:", msg);
  }

  // 2. Create collections
  const collections = [
    { id: "profiles", name: "Profiles" },
    { id: "staff_profiles", name: "StaffProfiles" },
    { id: "documents", name: "Documents" },
    { id: "billing", name: "Billing" },
    { id: "audit_logs", name: "AuditLogs" },
  ];

  for (const col of collections) {
    try {
      await databases.createCollection(DATABASE_ID, col.id, col.name);
      console.log(`✓ Created collection: ${col.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) console.log(`⏭ Collection already exists: ${col.name}`);
      else console.error(`✗ Failed to create ${col.name}:`, msg);
    }
  }

  // Helper to create string attribute
  async function str(collId: string, key: string, size: number, required: boolean) {
    try {
      await databases.createStringAttribute(DATABASE_ID, collId, key, size, required);
      console.log(`  + ${collId}.${key} (string)`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) console.log(`  ⏭ ${collId}.${key} exists`);
      else console.error(`  ✗ ${collId}.${key}:`, msg);
    }
  }

  // Helper to create enum attribute
  async function enumAttr(collId: string, key: string, elements: string[], required: boolean, def?: string) {
    try {
      await databases.createEnumAttribute(DATABASE_ID, collId, key, elements, required, def);
      console.log(`  + ${collId}.${key} (enum)`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) console.log(`  ⏭ ${collId}.${key} exists`);
      else console.error(`  ✗ ${collId}.${key}:`, msg);
    }
  }

  // Helper to create float attribute
  async function floatAttr(collId: string, key: string, required: boolean) {
    try {
      await databases.createFloatAttribute(DATABASE_ID, collId, key, required);
      console.log(`  + ${collId}.${key} (float)`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) console.log(`  ⏭ ${collId}.${key} exists`);
      else console.error(`  ✗ ${collId}.${key}:`, msg);
    }
  }

  // 3. Create attributes
  console.log("\n--- Profiles attributes ---");
  await str("profiles", "userId", 255, true);
  await str("profiles", "fullName", 255, true);
  await str("profiles", "email", 255, true);
  await str("profiles", "phone", 50, false);
  await enumAttr("profiles", "occupation", ["Nurse", "Doctor", "Engineer"], true);
  await enumAttr("profiles", "academicStatus", ["Graduated", "Student", "Ausbildung"], true);
  await enumAttr("profiles", "currentStatus", ["Draft", "Reviewing", "Ready_for_Partner", "Submitted_to_Partner", "Invoiced", "Paid", "Hired"], false, "Draft");
  await enumAttr("profiles", "role", ["applicant", "reviewer", "admin"], false, "applicant");

  console.log("\n--- StaffProfiles attributes ---");
  await str("staff_profiles", "userId", 255, true);
  await str("staff_profiles", "fullName", 255, true);
  await str("staff_profiles", "email", 255, true);
  await str("staff_profiles", "phone", 50, false);
  await enumAttr("staff_profiles", "role", ["reviewer", "admin"], true);

  console.log("\n--- Documents attributes ---");
  await str("documents", "profileId", 255, true);
  await str("documents", "docType", 255, true);
  await str("documents", "originalFileId", 255, false);
  await str("documents", "translatedFileId", 255, false);
  await enumAttr("documents", "status", ["Missing", "Uploaded", "Needs_Correction", "Verified"], false, "Missing");
  await str("documents", "reviewerNotes", 2000, false);

  console.log("\n--- Billing attributes ---");
  await str("billing", "profileId", 255, true);
  await floatAttr("billing", "amount", true);
  await enumAttr("billing", "status", ["Unpaid", "Paid", "Cancelled"], false, "Unpaid");
  await enumAttr("billing", "invoiceType", ["Deposit", "Success_Fee", "Other"], false, "Deposit");
  await str("billing", "description", 1000, false);

  console.log("\n--- AuditLogs attributes ---");
  await str("audit_logs", "userId", 255, true);
  await str("audit_logs", "action", 255, true);
  await str("audit_logs", "targetId", 255, false);
  await str("audit_logs", "targetType", 255, false);
  await str("audit_logs", "details", 2000, false);

  // 4. Create storage buckets
  console.log("\n--- Storage Buckets ---");
  const buckets = [
    { id: "originals", name: "Original Documents" },
    { id: "translations", name: "Translated Documents" },
  ];

  for (const bucket of buckets) {
    try {
      await storage.createBucket(
        bucket.id,
        bucket.name,
        undefined,
        false,
        true,
        30 * 1024 * 1024,
        ["application/pdf", "image/jpeg", "image/png"],
      );
      console.log(`✓ Created bucket: ${bucket.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) console.log(`⏭ Bucket already exists: ${bucket.name}`);
      else console.error(`✗ Failed to create bucket ${bucket.name}:`, msg);
    }
  }

  console.log("\n✅ Setup complete!");
}

main();
