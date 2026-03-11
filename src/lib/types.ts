export type Occupation = "Nurse" | "Doctor" | "Engineer";
export type AcademicStatus = "Graduated" | "Student" | "Ausbildung";
export type Role = "applicant" | "reviewer" | "admin";
export type ProfileStatus =
  | "Draft"
  | "Reviewing"
  | "Ready_for_Partner"
  | "Submitted_to_Partner"
  | "Invoiced"
  | "Paid"
  | "Hired";
export type DocStatus = "Missing" | "Uploaded" | "Needs_Correction" | "Verified";
export type BillingStatus = "Unpaid" | "Paid" | "Cancelled";
export type InvoiceType = "Deposit" | "Success_Fee" | "Other";

export interface Profile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  occupation: Occupation;
  academicStatus: AcademicStatus;
  currentStatus: ProfileStatus;
  role: Role;
}

export interface DocRecord {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string;
  docType: string;
  originalFileId?: string;
  translatedFileId?: string;
  status: DocStatus;
  reviewerNotes?: string;
}

export interface BillingRecord {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string;
  amount: number;
  status: BillingStatus;
  invoiceType: InvoiceType;
  description?: string;
}

export interface AuditLog {
  $id: string;
  $createdAt: string;
  userId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: string;
}
