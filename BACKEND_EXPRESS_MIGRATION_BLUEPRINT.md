# Medrec Backend Migration Blueprint (Express + Node.js + JWT)

## 1) Purpose
This document defines the full backend migration target from Appwrite-centric logic to a dedicated backend using Express.js, Node.js, JWT, and controlled service layers.

Goal:
- Keep this as a backup architecture immediately
- Allow promotion to primary backend when team decides
- Improve security control, auditability, and workflow ownership

---

## 2) Scope and Non-Goals

## In Scope
- Dedicated REST API backend for auth/session, workflow, documents, billing, admin, notifications
- JWT-based auth model with role-based and action-based authorization
- Storage abstraction (Appwrite storage now, easy swap later to S3/MinIO)
- Full workflow state machine enforcement server-side
- Centralized audit logging
- File bundling/export (ZIP application folder)

## Out of Scope (for first migration wave)
- Payment gateway deep integration finalization (pending escrow verification: dhmad.tn)
- AI document OCR/quality scoring
- Full data warehouse/BI pipeline

---

## 3) Target Architecture

## High-Level Components
1. API Layer (Express)
- Route handlers only parse input, validate auth, call services

2. Service Layer
- Business logic: workflow transitions, reviewer actions, invoice lifecycle, export generation

3. Repository/Data Layer
- Data access abstraction
- Initial adapter: Appwrite Databases + Storage
- Future adapter: PostgreSQL + object storage

4. Auth Layer
- Access tokens (JWT), refresh token rotation
- Session revocation + token blacklist/versioning strategy

5. Security Layer
- RBAC + ownership checks + transition guards
- Request validation + rate limiting + structured audit

6. Async/Event Layer (optional but recommended)
- Queue for email notifications, heavy exports, and background tasks

## Suggested Deployment
- API: Node.js Express service (Vercel serverless, Render, Railway, or container)
- Reverse proxy/WAF: Cloudflare or equivalent
- Secrets: platform secret manager
- Logs: structured JSON to central sink

---

## 4) Suggested Project Structure

```text
backend/
  src/
    app.ts
    server.ts
    config/
      env.ts
      security.ts
      appwrite.ts
    middleware/
      auth.ts
      roles.ts
      validate.ts
      error-handler.ts
      request-id.ts
      rate-limit.ts
    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.schemas.ts
      users/
        users.routes.ts
        users.controller.ts
        users.service.ts
      profiles/
        profiles.routes.ts
        profiles.controller.ts
        profiles.service.ts
        profiles.schemas.ts
      documents/
        documents.routes.ts
        documents.controller.ts
        documents.service.ts
        documents.schemas.ts
      workflow/
        workflow.routes.ts
        workflow.controller.ts
        workflow.service.ts
        workflow.schemas.ts
        workflow.state-machine.ts
      billing/
        billing.routes.ts
        billing.controller.ts
        billing.service.ts
        billing.schemas.ts
      exports/
        exports.routes.ts
        exports.controller.ts
        exports.service.ts
      audit/
        audit.service.ts
      notifications/
        notifications.service.ts
    shared/
      types/
      constants/
      utils/
    repositories/
      appwrite/
        profiles.repo.ts
        documents.repo.ts
        billing.repo.ts
        audit.repo.ts
        files.repo.ts
      interfaces/
        profiles.repo.interface.ts
        ...
  tests/
  package.json
  tsconfig.json
```

---

## 5) Auth and Security Requirements

## Auth Model
- Access token: short TTL (10–15 min)
- Refresh token: longer TTL (7–30 days), rotated on refresh
- Include claims: sub (userId), role, profileId, tokenVersion, iat/exp
- Keep refresh token hashed in storage

## Authorization Rules
- Applicant: only own profile/docs
- Reviewer: applicant dossiers only
- Admin: all + billing/user management
- Every sensitive action requires:
  - role check
  - ownership/target integrity check
  - workflow transition check

## Hard Security Controls
- Helmet, CORS allowlist, request size limits
- Rate limits:
  - auth endpoints strict
  - file endpoints moderate
  - workflow endpoints moderate
- Input validation (zod/joi) on every route
- Structured audit for all write actions
- Secrets only from env manager (never hardcoded)

---

## 6) Core Domain States and Workflow

## ProfileStatus (target)
- Draft
- Reviewing
- Ready_for_Partner
- Submitted_to_Partner
- Approved
- Rejected
- Invoiced
- Paid
- Hired

## Required Transition Rules (server enforced)
- Draft -> Reviewing
- Reviewing -> Ready_for_Partner | Draft | Rejected
- Ready_for_Partner -> Submitted_to_Partner | Reviewing
- Submitted_to_Partner -> Invoiced | Approved | Rejected
- Approved -> Invoiced | Hired
- Rejected -> Draft
- Invoiced -> Paid
- Paid -> Hired
- Hired -> (terminal)

## Preliminary Check Semantics
- Reviewer validates readability/completeness/presence first
- Rejection requires reason code + note
- Correction request sets applicant status back to Draft

---

## 7) Data Model (API-facing Schemas)

## User
- id
- email
- passwordHash
- role (applicant/reviewer/admin)
- tokenVersion
- isActive
- createdAt, updatedAt

## Profile
- id
- userId
- fullName
- phone
- occupation
- academicStatus
- currentStatus
- createdAt, updatedAt

## Document
- id
- profileId
- docType
- originalFileRef
- translatedFileRef
- status (Missing/Uploaded/Needs_Correction/Verified)
- reviewerNotes
- createdAt, updatedAt

## Billing
- id
- profileId
- amount
- invoiceType (Deposit/Success_Fee/Other)
- status (Unpaid/Paid/Cancelled)
- description
- createdAt, updatedAt

## AuditLog
- id
- actorUserId
- actorRole
- action
- targetType
- targetId
- details
- ip
- userAgent
- createdAt

---

## 8) API Routes (v1)

Base: /api/v1

## Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/send-verification
- POST /auth/verify-email

## Profiles
- GET /profiles/me
- PATCH /profiles/me
- GET /profiles/:profileId (reviewer/admin)

## Documents
- GET /profiles/:profileId/documents
- POST /documents/upload-url (or multipart upload endpoint)
- PATCH /documents/:docId (limited fields)

## Workflow
- POST /workflow/submit-dossier
- POST /workflow/verify-doc
- POST /workflow/reject-doc
- POST /workflow/set-profile-status

## Billing
- POST /billing/invoices
- POST /billing/invoices/:invoiceId/mark-paid
- GET /billing/invoices (role-aware)

## Exports
- POST /exports/application-folder-zip

## Admin
- PATCH /admin/users/:userId/role
- GET /admin/audit-logs

---

## 9) Request/Response Contracts (examples)

## POST /workflow/reject-doc
Request:
```json
{
  "profileId": "...",
  "docId": "...",
  "reasonCode": "INCOMPLETE_DOCUMENT",
  "notes": "Passport scan is blurry"
}
```

Response:
```json
{ "success": true }
```

## POST /exports/application-folder-zip
Request:
```json
{ "profileId": "..." }
```

Response:
- Binary application/zip

---

## 10) Appwrite Migration Strategy (Phased)

## Phase 0 (Now)
- Keep frontend unchanged
- Introduce backend API as secure façade
- Backend still reads/writes Appwrite (DB + Storage)

## Phase 1
- Migrate all critical writes behind Express API:
  - workflow transitions
  - reviewer actions
  - billing mutations
  - folder export

## Phase 2
- Migrate remaining writes:
  - profile update
  - doc metadata update
  - auth flows wrappers

## Phase 3
- Optional DB migration to PostgreSQL
- Keep repository interface stable to swap adapters

## Phase 4
- Deprecate direct Appwrite client mutations in frontend

---

## 11) Operational Requirements

## Observability
- Request ID middleware
- Structured JSON logs
- Error tracking (Sentry/OpenTelemetry)
- Security event logs (auth failures, forbidden actions)

## Reliability
- Idempotency keys for sensitive POST actions (invoice creation, payment mark)
- Retry policy for notification jobs
- Timeouts + circuit breakers for external providers

## Backup and Recovery
- Daily DB backups
- File bucket backup strategy
- Export script for profiles/documents/audit
- Recovery runbook with RTO/RPO targets

---

## 12) Testing Requirements

## Unit Tests
- workflow state machine
- authorization guards
- schema validation

## Integration Tests
- full applicant->reviewer->admin flow
- unauthorized and cross-tenant access attempts
- reset-password one-time logic

## Security Tests
- broken object level auth (BOLA) checks
- JWT tampering tests
- replay/rate-limit tests

## E2E (Critical)
- applicant upload + submit
- reviewer preview + verify/reject + zip export
- admin invoice + mark paid

---

## 13) Environment Variables (Backend)

- NODE_ENV
- PORT
- APP_URL
- FRONTEND_ORIGIN
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- JWT_ACCESS_TTL
- JWT_REFRESH_TTL
- APPWRITE_ENDPOINT
- APPWRITE_PROJECT_ID
- APPWRITE_API_KEY
- APPWRITE_DATABASE_ID
- APPWRITE_COLLECTION_PROFILES
- APPWRITE_COLLECTION_DOCUMENTS
- APPWRITE_COLLECTION_BILLING
- APPWRITE_COLLECTION_AUDIT_LOGS
- APPWRITE_BUCKET_ORIGINALS
- APPWRITE_BUCKET_TRANSLATIONS

---

## 14) Team Checklist Before Switching Primary Backend

- [ ] All critical write paths moved behind Express API
- [ ] Frontend no longer writes sensitive workflow status directly
- [ ] RBAC and ownership checks validated with tests
- [ ] Audit coverage complete for all mutations
- [ ] Load test baseline completed
- [ ] Rollback strategy documented and tested
- [ ] Production alerts configured
- [ ] Security review sign-off

---

## 15) Suggested Immediate Next Implementation Steps

1. Create separate backend workspace/repo (`medrec-backend`)
2. Implement auth + workflow modules first (highest risk)
3. Migrate frontend calls from direct Appwrite writes to backend endpoints
4. Enable dual-run period (backend shadow mode)
5. Cut over once parity and security tests pass

---

Owner: Engineering Team
Version: 1.0
Date: 2026-03-25
