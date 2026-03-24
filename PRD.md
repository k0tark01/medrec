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

## 7. Implementation Status

### 7.1 Completed

#### Infrastructure & Setup
- [x] **Tech Stack:** Next.js 16.1.6 (App Router, TypeScript, Tailwind CSS v4, src directory)
- [x] **Appwrite Cloud:** Connected to `fra.cloud.appwrite.io`, Project `69b0c13400091369a61a`
- [x] **Appwrite SDK:** v23.0.0 integrated (`Query.equal()` format)
- [x] **Database:** `jobbridge_db` with collections: `profiles` (8 columns), `documents`, `billing`, `audit_logs`
- [x] **Storage:** Two buckets — `originals` and `translations` (extension-based filtering: pdf, jpg, jpeg, png; 30MB max)
- [x] **Environment:** `.env.local` for Appwrite endpoint, project ID, database ID, collection IDs, bucket IDs

#### Authentication & Authorization
- [x] **Appwrite Auth:** Email/password registration and login
- [x] **Auth Context:** `AuthProvider` with `useAuth()` hook (user, profile, loading, login, register, logout, refreshProfile)
- [x] **Role-based routing:** Applicant, Reviewer, Admin roles with conditional sidebar nav and page guards
- [x] **Onboarding flow:** Redirect to onboarding if user has no profile, redirect to dashboard if profile exists

#### UI/UX — shadcn/ui Design System
- [x] **shadcn/ui v4.0.3:** 15 components installed (Button, Card, Badge, Input, Label, Separator, Avatar, Tabs, Progress, Sheet, Dialog, Select, Textarea, DropdownMenu, Tooltip)
- [x] **Theme system:** Dark/light mode with `.dark` class on `<html>`, localStorage key `jb-theme`, oklch-based color tokens
- [x] **Global CSS:** Unified oklch color system in `globals.css` with `gradient-primary` and `gradient-hero` utility classes
- [x] **Responsive:** Mobile-first layout with collapsible sidebar (hamburger menu on mobile, fixed on desktop)

#### Pages (10 routes, all building cleanly)
- [x] **Landing Page** (`/`): Hero section, stats strip, professions grid (Nurses/Doctors/Engineers), how-it-works steps, features grid, CTA, footer
- [x] **Auth Page** (`/auth`): Split-screen with branding panel + login/register tabs (shadcn Tabs, Input, Card)
- [x] **Onboarding** (`/onboarding`): Split-screen, occupation selection cards (Nurse/Doctor/Engineer), academic status radio buttons, profile creation
- [x] **Dashboard Overview** (`/dashboard`): Stat cards (documents count, verified, needs correction, unpaid invoices), quick actions
- [x] **Documents** (`/dashboard/documents`): Dynamic doc slots based on occupation/academicStatus, dual file upload (original + translated), status badges, submit for review
- [x] **Billing** (`/dashboard/billing`): Invoice list with status badges, empty state
- [x] **Review Queue** (`/dashboard/review`): Applicant list → detail view with document preview/download, verify/reject per doc, Ready for Partner / Submitted to Partner workflow
- [x] **Admin Panel** (`/dashboard/admin`): Analytics cards (total users, revenue, pending), user management with role switcher (Select), invoice creation form, Mark Paid
- [x] **Users** (`/dashboard/users`): All users table with name, email, occupation, role, status, joined date
- [x] **Sidebar:** Branded with gradient logo, role-based nav links, theme toggle, user info, sign out

#### Internationalization (i18n)
- [x] **3 Languages:** English, French, German
- [x] **Translation files:** `src/lib/i18n/en.ts`, `fr.ts`, `de.ts` — comprehensive translations for all pages (landing, auth, onboarding, sidebar, dashboard, documents, billing, review, admin, users)
- [x] **Type-safe:** `Translations` type exported from `en.ts` with `DeepString<>` helper, all translations conform to the same shape
- [x] **Language Context:** `LanguageProvider` with `useTranslation()` hook, persists to localStorage key `jb-lang`, updates `<html lang>` attribute
- [x] **Language Switcher:** Compact EN/FR/DE toggle buttons in landing page nav and sidebar footer
- [x] **All pages wired:** Every hardcoded string replaced with `t.*` translation keys

#### Components
- [x] **StatusBadge:** Reusable component using shadcn Badge with color-coded status display
- [x] **LanguageSwitcher:** Compact 3-button language toggle
- [x] **Doc Requirements Engine:** `getRequiredDocs()` function returns document slots based on occupation + academicStatus
- [x] **Skeleton Loaders:** Reusable `Skeleton`, `CardSkeleton`, `StatCardSkeleton`, `TableRowSkeleton`, `ListSkeleton` components replacing all spinner loading states
- [x] **Pagination:** Shared `Pagination` component + `usePagination<T>` hook with page size of 10, range display, ellipsis navigation

#### UX & Quality (Phase 1)
- [x] **Toast Notifications:** Replaced all `alert()`/`prompt()` calls with Sonner toast system (`sonner` package); `<Toaster>` mounted in root layout
- [x] **Form Validation:** Zod v4 schemas (`loginSchema`, `registerSchema`, `onboardingSchema`, `invoiceSchema`) in `src/lib/validations.ts`; validation applied to auth, onboarding, and admin invoice forms
- [x] **Loading Skeletons:** All pages (dashboard, documents, billing, review, admin, users) use contextual skeleton loaders instead of spinners
- [x] **Search & Filtering:** Search bar + status/role filter dropdowns on Review Queue, Users table, and Billing list (client-side filtering)
- [x] **Pagination:** Review Queue, Users table, and Billing list paginated with 10 items per page
- [x] **Dialog-based Rejection:** Review page uses shadcn Dialog + Textarea for rejection notes (replaced browser `prompt()`)

#### Email Verification
- [x] **Verification Flow:** Full email verification using Appwrite client SDK `account.createVerification()` / `account.updateVerification()`
- [x] **Verify Email Page** (`/auth/verify-email`): "Check your inbox" waiting page with resend button, check status button, and sign out link
- [x] **Verify Callback** (`/auth/verify`): Handles email verification link click, completes verification via client SDK, auto-redirects to dashboard
- [x] **Dashboard Guard:** Dashboard layout enforces email verification — redirects unverified users to `/auth/verify-email`
- [x] **Auth Context Updates:** `emailVerified`, `refreshUser()`, and `sendVerificationEmail()` added to `useAuth()` hook
- [x] **i18n:** Email verification strings added to all 3 languages (en, fr, de)

---

### 7.2 Implemented After Initial PRD Draft

#### Core Features (Now Implemented)
- [x] **Password Reset:** Forgot/reset password flow implemented (`/auth/forgot-password`, `/auth/reset-password`).
- [x] **Profile Editing:** Users can edit profile details after onboarding (`/dashboard/profile`).
- [x] **In-App File Preview:** Reviewers can preview files in a modal without mandatory local download.
- [x] **Audit Logging Pipeline:** Reviewer/Admin actions are written to `audit_logs` and visible in Admin UI.
- [x] **Email Verification:** Signup verification flow enforced before dashboard access.
- [x] **Occupation Flexibility:** `occupation` enum updated to include `Other` (with manual text capture in UI).

#### UX Upgrades (Now Implemented)
- [x] **Dashboard Refresh:** Personalized hero, progress visualization, improved quick actions, better responsiveness.
- [x] **File Preview Sizing:** Larger adaptive modal + fullscreen toggle.
- [x] **Logout Accessibility:** Prominent always-visible logout button in sidebar.

---

### 7.3 Partially Implemented

- [~] **In-App Preview:** Implemented for reviewer workflows; additional format-specific handling and download audit granularity can be expanded.
- [~] **Manual Redirection Workflow:** Status transitions (`Ready for Partner`, `Submitted to Partner`) are present; secure partner bundle generation is still pending.
- [~] **Audit Scope:** Key reviewer/admin actions logged; complete file view/download telemetry remains to be finalized.

---

### 7.4 Not Yet Implemented (Current Gaps)

#### P0 — Business-Critical
- [ ] **Email Notifications via Appwrite Functions**
    - Triggers: welcome, document rejected, dossier approved, invoice issued.
    - Acceptance: On event, email sent within 60s and event recorded in logs.
- [ ] **Secure Partner Bundle**
    - Generate ZIP or time-limited secure share link for verified dossier export.
    - Acceptance: Reviewer can export only when dossier is fully verified.
- [ ] **Payment Integration**
    - Integrate provider (Stripe/PayPal/Flouci) with webhook-driven invoice reconciliation.
    - Acceptance: Successful payment auto-sets invoice to `Paid` and writes audit event.

#### P1 — Security & Compliance
- [ ] **GDPR Workflows**
    - Data export and account/data deletion request flow.
    - Acceptance: User can request export/deletion and admin can fulfill with audit trail.
- [ ] **File-Level Permission Hardening**
    - Enforce per-user/per-role file access permissions in storage.
    - Acceptance: Applicants can access only own files; reviewer/admin scope is controlled.
- [ ] **Rate Limiting & Abuse Protection**
    - Add auth/upload throttling and suspicious activity controls.
    - Acceptance: Repeated failed attempts/uploads are throttled and logged.

#### P2 — Delivery & Reliability
- [ ] **CI/CD Pipeline**
    - Build, lint, and deploy automation with environment checks.
    - Acceptance: Main branch changes pass automated checks before deployment.
- [ ] **Testing Strategy**
    - Add unit + integration + critical E2E tests.
    - Acceptance: Auth, onboarding, upload, review, and billing flows covered.
- [ ] **Monitoring & Alerting**
    - Error tracking (e.g., Sentry) + operational alerts.
    - Acceptance: Runtime exceptions and failed critical jobs are visible with alert routing.

#### P3 — Product Polish
- [ ] **Analytics Expansion**
    - Funnel and operational metrics beyond dashboard totals.
- [ ] **SEO & Metadata**
    - Open Graph, sitemap, robots, richer metadata for public pages.

---

### 7.5 Suggested Execution Order (Next 6 Sprints)

1. **Sprint 1:** Email Functions + trigger contracts + delivery logging
2. **Sprint 2:** Secure partner bundle export and permission gates
3. **Sprint 3:** Payment gateway + webhook reconciliation + billing audit
4. **Sprint 4:** GDPR export/delete + file-level permission hardening
5. **Sprint 5:** CI/CD + core test coverage + monitoring baseline
6. **Sprint 6:** Analytics expansion + SEO polish