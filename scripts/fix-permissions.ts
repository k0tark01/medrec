/**
 * Fix permissions on all collections and storage buckets.
 * Usage: npx tsx scripts/fix-permissions.ts
 */
import { Client, Databases, Storage, Permission, Role } from "node-appwrite";

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

  const permissions = [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ];

  // Fix collection permissions
  const collections = ["profiles", "documents", "billing", "audit_logs"];

  for (const colId of collections) {
    try {
      await databases.updateCollection(DATABASE_ID, colId, colId, permissions, true);
      console.log(`✓ Fixed permissions for: ${colId}`);
    } catch (e: unknown) {
      console.error(`✗ ${colId}:`, e instanceof Error ? e.message : String(e));
    }
  }

  // Fix bucket permissions
  const buckets = ["originals", "translations"];

  for (const bucketId of buckets) {
    try {
      await storage.updateBucket(
        bucketId,
        bucketId,
        permissions,
        true, // fileSecurity
        true, // enabled
        30 * 1024 * 1024,
        ["application/pdf", "image/jpeg", "image/png"],
      );
      console.log(`✓ Fixed permissions for bucket: ${bucketId}`);
    } catch (e: unknown) {
      console.error(`✗ bucket ${bucketId}:`, e instanceof Error ? e.message : String(e));
    }
  }

  console.log("\n✅ Permissions fixed!");
}

main();
