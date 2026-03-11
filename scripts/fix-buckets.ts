import { Client, Storage } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69b0c13400091369a61a")
  .setKey("standard_7f8965a2e93fba6bfc860ded3c3924c94aca36f2f3a9efbaa0acf00c90f0f8f9fa309c3918d86436f76c123380a33a0b4777a97ebea40293cbdfb4ffcfd4ccb2836700acca569a406b8d542c0d198f33c82cb04ea34be7149cda1def4d5de46ef13c19171ab93f033df9a03b48b89705e27cbaa9e76f63d4708d1c6c4a33ac4f");

const storage = new Storage(client);

async function main() {
  for (const bucketId of ["originals", "translations"]) {
    try {
      await storage.updateBucket(
        bucketId,
        bucketId === "originals" ? "Original Documents" : "Translated Documents",
        undefined, // permissions (keep existing)
        false,     // fileSecurity
        true,      // enabled
        30 * 1024 * 1024, // maxFileSize
        ["pdf", "jpg", "jpeg", "png"], // allowedFileExtensions (not MIME types!)
      );
      console.log(`✓ Updated bucket: ${bucketId}`);
    } catch (e: unknown) {
      console.error(`✗ Failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

main();
