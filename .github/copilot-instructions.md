# Project Guidelines

## Code Style
- Use TypeScript and keep changes consistent with existing Next.js App Router patterns in src/app.
- Prefer existing UI primitives from src/components/ui and compose classes with the cn helper from src/lib/utils.ts.
- Add "use client" only where React client features are needed (state, effects, context, handlers).
- Reuse and extend existing Zod schemas in src/lib/validations.ts for form and request validation.
- Keep i18n strings in src/lib/i18n/*.ts and access via the language context rather than hardcoding user-facing text.

## Architecture
- This is a Next.js App Router app with route handlers under src/app/api and page/layout routes under src/app.
- Keep business rules in src/lib (for example workflow transitions in src/lib/review-workflow.ts and document rules in src/lib/doc-requirements.ts), not embedded in UI components.
- Use client Appwrite SDK wiring from src/lib/appwrite.ts in client code.
- Use server Appwrite wiring from src/lib/appwrite-server.ts in route handlers and privileged server actions.
- Keep auth, theme, and language behavior aligned with provider setup in src/app/layout.tsx and context files in src/lib.

## Build And Test
- Install dependencies: npm install
- Run dev server: npm run dev
- Build production bundle: npm run build
- Run production server: npm run start
- Lint: npm run lint
- One-time infra setup script: npx tsx scripts/setup-buckets.ts

## Conventions
- Enforce role-based access in both UI and API paths; do not rely on navigation visibility alone.
- Preserve workflow state-machine checks via src/lib/review-workflow.ts when mutating profile/document status.
- Preserve the dual-file document model (original + translated) in upload/review flows.
- In API handlers, return explicit JSON errors with meaningful HTTP status codes.
- Use audit logging helpers for reviewer/admin mutations when behavior changes affect traceability.
- Never introduce new hardcoded credentials; use environment variables for secrets.

## Docs
- Product requirements and current implementation status: PRD.md
- Future backend migration architecture: BACKEND_EXPRESS_MIGRATION_BLUEPRINT.md
- Migration execution plan: BACKEND_EXPRESS_SPRINT_PLAN.md
- Baseline Next.js bootstrap notes: README.md
