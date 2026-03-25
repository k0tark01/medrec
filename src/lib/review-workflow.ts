import type { ProfileStatus } from "@/lib/types";

const ALLOWED_TRANSITIONS: Record<ProfileStatus, ProfileStatus[]> = {
  Draft: ["Reviewing"],
  Reviewing: ["Ready_for_Partner", "Draft", "Rejected"],
  Ready_for_Partner: ["Submitted_to_Partner", "Reviewing"],
  Submitted_to_Partner: ["Invoiced", "Approved", "Rejected"],
  Approved: ["Invoiced", "Hired"],
  Rejected: ["Draft"],
  Invoiced: ["Paid"],
  Paid: ["Hired"],
  Hired: [],
};

export function canTransitionProfileStatus(from: ProfileStatus, to: ProfileStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getTransitionError(from: ProfileStatus, to: ProfileStatus): string {
  return `Invalid status transition: ${from} -> ${to}`;
}

export const REVIEW_REJECTION_CODES = [
  "INCOMPLETE_DOCUMENT",
  "LOW_QUALITY_SCAN",
  "MISMATCHED_INFORMATION",
  "MISSING_TRANSLATION",
  "OTHER",
] as const;

export type ReviewRejectionCode = (typeof REVIEW_REJECTION_CODES)[number];
