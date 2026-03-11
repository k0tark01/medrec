import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const BUCKET_ORIGINALS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ORIGINALS!;
export const BUCKET_TRANSLATIONS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TRANSLATIONS!;

export const COLLECTIONS = {
  PROFILES: "profiles",
  DOCUMENTS: "documents",
  BILLING: "billing",
  AUDIT_LOGS: "audit_logs",
} as const;
