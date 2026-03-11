# Product Requirements Document (PRD): Job Bridge Tunisia-Germany

## 1. Project Overview
**Goal:** A specialized recruitment platform facilitating the migration of Tunisian professionals (Nurses, Doctors, Engineers) to the German labor market.
**Current Workflow:** The platform serves as a document collection and verification hub. Once a candidate is "Approved," a Reviewer manually handles the redirection of files to German partners via external channels (Email/Secure Transfer).

### Tech Stack
- **Frontend:** Next.js / React (Responsive/Mobile-First)
- **Backend/BaaS:** Appwrite (Auth, Database, Storage)
- **Developer Tools:** VS Code + GitHub Copilot + Appwrite MCP

---

## 2. User Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Applicant** | Create profile, upload files (Original/Translated) based on occupation, track progress, receive email updates, pay invoices. |
| **Reviewer** | Access to all applicant files, document verification (Approve/Reject), status management, and preparing "Partner Bundles" for external export. |
| **Admin** | Reviewer permissions + Financial oversight (Invoicing), User management (Promote/Ban), and System Analytics. |

*Note: German Partners do not have accounts. They receive dossiers directly from the Reviewer/Admin.*

---

## 3. Functional Requirements

### 3.1 Profile & Occupation-Based Logic
- **Onboarding:** Applicant selects their profession (Nurse, Doctor, Engineer, etc.) and current academic status (Student, Graduated, Ausbilung).
- **Dynamic Dashboard:** The UI updates to show specific document slots required for that profession (e.g., Doctors need a Medical License slot; Nurses need a Nursing Diploma slot).

### 3.2 Document Management System (Appwrite Storage)
- **The "Dual-File" Requirement:** For every required document (e.g., Passport), the user must provide:
    1. **Original Document** (e.g., French/Arabic version).
    2. **Translated Document** (German version).
- **Checklist Engine:** A visual list showing `Missing`, `Uploaded`, or `Needs Correction`.
- **In-App Preview:** Reviewers can view files directly in the dashboard without downloading them to their local machine (for security).

### 3.3 Manual Redirection Workflow
1. **Submission:** Applicant submits their full dossier for review.
2. **Verification:** Reviewer checks each file. If a file is blurry or incorrect, they flag it; the applicant gets an email to re-upload.
3. **Internal Approval:** Once 100% verified, the status changes to `Ready for Partner`.
4. **Manual Export:** Reviewer downloads the "Verified Bundle" or uses a generated secure link to email the files to the German Partner.
5. **Status Update:** Reviewer updates the internal status to `Submitted to Partner`.

### 3.4 Invoicing & Payment
- **Flexible Trigger:** Admin can generate an invoice at any stage (either as a "Deposit" at the start or a "Success Fee" after a partner match).
- **Status tracking:** Applicants cannot see "Partner Name" or specific details until the invoice is marked as `Paid`.

---

## 4. Database Schema (Appwrite Collections)

### Collection: `profiles`
- `userId`: String (ID from Appwrite Auth)
- `occupation`: Enum (Nurse, Doctor, Engineer, etc.)
- `academicStatus`: Enum (Graduated, Student, etc.)
- `currentStatus`: String (Draft, Reviewing, Ready_for_Partner, Submitted_to_Partner, Invoiced, Paid, Hired)

### Collection: `documents`
- `profileId`: Relationship (Link to Profile)
- `docType`: String (Passport, B2_Certificate, Diploma, etc.)
- `originalFileId`: String (Storage ID)
- `translatedFileId`: String (Storage ID)
- `isVerified`: Boolean
- `reviewerNotes`: String (For feedback on rejections)

### Collection: `billing`
- `profileId`: Relationship
- `amount`: Float
- `status`: Enum (Unpaid, Paid, Cancelled)
- `invoiceDate`: DateTime

---

## 5. UI/UX Requirements
- **Mobile Experience:** Optimized for document scanning and uploading via smartphone.
- **Reviewer Speed:** A "Queue" view for the Reviewer to quickly cycle through pending applications.
- **Email Triggers:** Automated templates (via Appwrite Functions) for:
    - *Welcome Email*
    - *Document Rejected*
    - *Dossier Approved*
    - *Invoice Issued*

---

## 6. Security & Compliance
- **Data Privacy:** GDPR-compliant storage. Use Appwrite's file-level permissions so applicants can only see their own data.
- **Audit Log:** Track which Reviewer viewed/downloaded which applicant's files.

---

## 7. Next Steps for Implementation
1. **Appwrite MCP Setup:** Create the `profiles`, `documents`, and `billing` collections.
2. **Storage:** Setup two buckets: `originals` and `translations`.
3. **Logic:** Develop the dynamic frontend form that reads the user's `occupation` to determine which `docType` slots to display.