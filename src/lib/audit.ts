import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";

export async function logAuditEvent({
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
  try {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.AUDIT_LOGS, ID.unique(), {
      userId,
      action,
      targetId: targetId || undefined,
      targetType: targetType || undefined,
      details: details || undefined,
    });
  } catch {
    // Non-critical: don't break the main operation if logging fails
  }
}
