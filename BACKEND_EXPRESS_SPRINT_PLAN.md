# Medrec Backend Migration — Concrete Sprint Plan

Version: 1.0  
Date: 2026-03-25  
Reference: BACKEND_EXPRESS_MIGRATION_BLUEPRINT.md

---

## 1) Planning Assumptions

- Team size: 4 people minimum
  - 1 Backend Engineer (Lead)
  - 1 Backend Engineer
  - 1 Frontend Engineer
  - 1 QA/Automation Engineer
- Sprint length: 2 weeks
- Delivery mode: incremental, production-safe, with feature flags
- Current system remains live while backend is migrated

---

## 2) Roles and Responsibilities

## Backend Lead
- API architecture and security standards
- Workflow service + state machine ownership
- Code review gatekeeper for security-critical code

## Backend Engineer
- Auth/session module and repository adapters
- Billing/export modules and background jobs

## Frontend Engineer
- Replace direct Appwrite writes with backend API calls
- UX parity and fallback handling

## QA/Automation Engineer
- Integration/E2E/security test matrix
- Regression and release quality gates

---

## 3) Sprint Timeline Overview

- Sprint 1: Foundation + Auth + Security Core
- Sprint 2: Workflow and Reviewer Actions (server-owned)
- Sprint 3: Documents/Billing/Exports Integration
- Sprint 4: Hardening, Parity, Cutover Readiness

---

## 4) Sprint Backlog (Detailed)

## Sprint 1 (Weeks 1–2): Foundation + Auth + Security Core

Goal: Stand up backend service and secure authentication baseline.

### Deliverables
- Express TypeScript project scaffold
- Env/config management and secret validation
- Middleware stack: helmet, cors allowlist, request-id, rate-limit, error-handler
- Auth module:
  - register/login/refresh/logout
  - JWT access + refresh rotation
  - token versioning/revocation strategy
- Base profile lookup route (`/profiles/me`)
- Structured audit helper

### Tasks
1. Initialize backend repo and CI skeleton (lint, test, build)
2. Implement config + startup validation
3. Implement auth routes and schemas
4. Implement auth middleware and role middleware
5. Add baseline logging and error normalization
6. Add unit tests for auth flows and middleware

### Acceptance Criteria
- All auth routes functional in local + staging
- Access token expiry and refresh rotation verified
- Unauthorized access returns 401/403 consistently
- CI passes lint + tests + build

### Estimate
- 26–32 story points

### Risks
- Incorrect token invalidation edge cases

---

## Sprint 2 (Weeks 3–4): Workflow Service as Source of Truth

Goal: Move all critical workflow mutations behind backend.

### Deliverables
- Workflow module with state machine enforcement
- Reviewer actions APIs:
  - submit dossier
  - verify/reject document
  - set profile status
- Mandatory rejection reason code + note checks
- Applicant-only target validation
- Full audit events for each mutation

### Tasks
1. Implement workflow state machine utility
2. Build workflow controller/service/repository contracts
3. Add role + ownership + applicant-only guards
4. Integrate with frontend review/documents pages via feature flag
5. Integration tests for valid/invalid transitions

### Acceptance Criteria
- No direct critical status mutation from frontend
- Invalid transitions blocked with 409
- All reviewer/admin writes audited
- Regression tests pass for existing review flow

### Estimate
- 28–34 story points

### Risks
- Frontend parity issues during transition

---

## Sprint 3 (Weeks 5–6): Documents, Billing, ZIP Export

Goal: Complete high-value operational endpoints and UI integration.

### Deliverables
- Billing endpoints:
  - create invoice
  - mark invoice paid
- ZIP export endpoint for application folder
- Document metadata mutation endpoint hardening
- Frontend integration for reviewer ZIP download + admin billing actions
- Notification event stubs (queued)

### Tasks
1. Implement billing service and validations
2. Implement export service with stream-safe ZIP generation
3. Add endpoint-level rate limits (export/billing)
4. Wire frontend calls to backend for billing/export
5. Add integration tests for ZIP + billing state transitions

### Acceptance Criteria
- Reviewer/admin can download dossier ZIP securely
- Invoice/payment actions enforce role and transitions
- Large ZIP export does not crash process under normal size limits
- Production build and E2E smoke tests pass

### Estimate
- 24–30 story points

### Risks
- Memory pressure on ZIP generation for large dossiers

---

## Sprint 4 (Weeks 7–8): Hardening + Cutover Readiness

Goal: Reach operational confidence for primary-backend decision.

### Deliverables
- Security hardening pass:
  - stricter payload limits
  - abuse detection for auth endpoints
  - improved audit detail (ip/userAgent/action context)
- Full regression test suite (critical role-path matrix)
- Runbook docs: rollback, incident triage, backup/restore
- Cutover checklist and go/no-go review

### Tasks
1. Add performance and load smoke tests
2. Add security tests (BOLA/role bypass/replay)
3. Add observability dashboards and alert thresholds
4. Conduct staging game day (incident simulation)
5. Final production readiness review

### Acceptance Criteria
- No P0/P1 defects open
- Security checklist signed by tech lead
- All critical journeys pass in staging under load baseline
- Rollback procedure validated

### Estimate
- 22–28 story points

### Risks
- Hidden edge-case in auth/session refresh handling

---

## 5) Story Template (Use for Jira/Linear)

Title: [Module] [Action] [Outcome]

- Problem
- Scope
- API Contract (request/response/errors)
- Security Rules (role/ownership/rate-limit)
- Audit Requirement
- Test Cases (unit/integration/E2E)
- Acceptance Criteria
- Rollback Notes

---

## 6) Definition of Done (DoD)

A ticket is Done only if:
- Code merged with review
- Unit/integration tests added and passing
- Lint/build/CI green
- Security checks satisfied for endpoint
- Audit logging in place (for mutation routes)
- API contract documented
- QA verification completed

---

## 7) QA Matrix (Minimum)

### Applicant
- register/login/refresh/logout
- upload docs
- submit dossier
- blocked actions outside permissions

### Reviewer
- list applicants
- verify/reject doc with reason
- status transitions (valid/invalid)
- ZIP download

### Admin
- role updates
- create invoice
- mark paid
- audit visibility

### Negative/Security
- missing/invalid JWT
- role mismatch
- cross-profile mutation attempts
- replay/rate-limit scenarios

---

## 8) Go/No-Go Gates by Sprint

- Gate 1 (end Sprint 1): Auth stable, no blocker security defects
- Gate 2 (end Sprint 2): Workflow writes backend-owned and guarded
- Gate 3 (end Sprint 3): Billing/export stable and integrated
- Gate 4 (end Sprint 4): Full readiness package complete

If any gate fails, do not proceed to next gate without remediation plan.

---

## 9) Release and Cutover Strategy

### Stage A — Shadow Mode
- Frontend calls backend for read/validation while keeping current behavior as fallback

### Stage B — Write Switch
- Turn on backend write paths for a small internal cohort (reviewers/admin)

### Stage C — Full Enable
- Enable for all users, monitor alerts, keep rollback ready

### Stage D — Stabilization Window
- 7–14 days enhanced monitoring before declaring primary backend stable

---

## 10) Immediate Next Actions (This Week)

1. Create `medrec-backend` repo and baseline CI
2. Add Sprint 1 tickets in tracker with owners
3. Finalize env/secrets inventory
4. Freeze API versioning convention (`/api/v1`)
5. Start auth module implementation

---

Owner: Engineering Team  
Approver: Tech Lead / Security Lead
