# SKILL.md --- Maxwell AU Development Playbook

## Purpose

Use this file as the execution playbook when implementing Maxwell AU
features with Claude Code. `CLAUDE.md` defines durable engineering
rules; `PLAN.md` defines delivery order; this file defines repeatable
workflows.

## Skill 1 --- Implement a Feature

When asked to build a feature: 1. Read `CLAUDE.md` and the relevant
`PLAN.md` phase. 2. Inspect the repository before proposing new files.
3. Identify affected domain module(s), database models, UI, API, Azure
dependencies and tests. 4. State a concise implementation plan. 5.
Implement the smallest complete vertical slice. 6. Validate server
inputs with Zod. 7. Keep domain logic outside React components. 8.
Add/update tests. 9. Run type-check, lint, tests and build. 10. Report
changed files, verification performed and any remaining risks.

Do not create speculative abstractions before a second concrete use case
exists.

## Skill 2 --- Build a Public Page

For a public website page: 1. Prefer Server Components. 2. Load public
data server-side. 3. Define page metadata and canonical/OG behavior. 4.
Build responsive sections from reusable primitives. 5. Use semantic HTML
and accessible controls. 6. Optimize images and avoid layout shift. 7.
Add empty states where CMS content may not exist. 8. Verify mobile,
tablet and desktop behavior. 9. Respect reduced-motion preferences.

## Skill 3 --- Build an Admin Module

For admin CRUD: 1. Require authentication and role authorization. 2.
Define/confirm Prisma model and migration. 3. Define Zod schemas shared
by form/server boundary where appropriate. 4. Implement
service/repository behavior. 5. Implement server action or route
handler. 6. Build list, create/edit, archive/delete flows as
appropriate. 7. Add success/error feedback. 8. Add audit logging for
important changes. 9. Test authorization and validation failures, not
only happy paths.

## Skill 4 --- Add Media Upload

Never proxy large media through a normal Next.js request.

Workflow: 1. Authenticate admin. 2. Validate requested media type,
extension, MIME type and configured size limit. 3. Generate a
collision-resistant blob key. 4. Generate a short-lived SAS scoped to
the exact upload operation. 5. Upload directly from browser to Blob
Storage. 6. Confirm upload server-side. 7. Persist metadata to
PostgreSQL. 8. Generate/use thumbnail metadata where applicable. 9.
Surface progress, cancellation and retry UX. 10. Never expose storage
account credentials.

MVP does not require automatic 4K transcoding or multi-bitrate
streaming.

## Skill 5 --- Add a Social Publisher

Before implementation, verify the current official API supports the
requested publication type.

Workflow: 1. Add/update platform capability definition. 2. Implement
OAuth using the platform's official flow. 3. Store protected
credential/token metadata. 4. Implement adapter behind the common
SocialPublisher contract. 5. Validate media/caption constraints before
enqueueing. 6. Queue publication asynchronously. 7. Use an idempotency
key such as publication record ID + destination. 8. Persist status:
DRAFT/QUEUED/PROCESSING/PUBLISHED/FAILED. 9. Store external ID/URL when
returned. 10. On failure, record a sanitized actionable error and allow
retry. 11. Never make another destination's failure roll back a
successful publication.

## Skill 6 --- Azure Resource Change

For any Azure resource: 1. Explain why the resource is needed. 2. Prefer
the least expensive tier that meets MVP requirements. 3. Define it in
Terraform. 4. Use Managed Identity where supported. 5. Put secrets in
Key Vault. 6. Configure tags: project, environment, owner/purpose as
appropriate. 7. Separate dev/staging/prod configuration. 8. Document
required environment variables. 9. Add monitoring/logging appropriate to
the resource. 10. Avoid adding always-on infrastructure when
consumption-based execution is adequate.

## Skill 7 --- Database Change

1.  Modify Prisma schema.
2.  Consider nullability, defaults, indexes, uniqueness and cascade
    behavior.
3.  Generate a migration.
4.  Review migration SQL before applying.
5.  Update seed/test fixtures.
6.  Test old and new code paths affected by the schema.
7.  Never reset a production database.
8.  For destructive changes, use expand/migrate/contract where
    practical.

## Skill 8 --- Booking Flow

Booking is a public-to-admin workflow. - Public fields: contact name,
organization, email, phone optional, event type, event date, location,
message. - Validate and normalize input. - Apply rate limiting and
anti-spam controls. - Persist the request before sending
notifications. - Admin states should support NEW, REVIEWING, CONTACTED,
CONFIRMED, DECLINED, CLOSED. - Do not expose private booking details
publicly.

## Skill 9 --- Event / King's Time Content

Treat King's Time as a first-class ministry content type, not merely a
generic blog tag. Allow: - title - slug - date/time - theme -
description - hero/thumbnail - livestream/replay URL -
scripture/reference text - status - related media

Events should support upcoming/past queries and structured metadata
useful for SEO.

## Skill 10 --- Debugging

When fixing a defect: 1. Reproduce or inspect evidence first. 2. Find
root cause rather than masking symptoms. 3. Add a regression test when
feasible. 4. Make the smallest safe fix. 5. Run targeted tests, then
broader checks. 6. Do not change architecture during a bug fix unless
architecture is the root cause.

## Skill 11 --- Deployment

Before deployment: - `git status` understood. - Type-check passes. -
Lint passes. - Tests pass. - `next build` passes. - Prisma migration
reviewed. - Required Azure configuration exists. - No secrets are in
tracked files. - Health endpoint works. - Rollback path is understood.

After deployment: - Verify home page. - Verify admin auth. - Verify
database connectivity. - Verify Blob upload in the target environment. -
Verify booking flow. - Verify logs/telemetry. - Verify custom domain and
TLS when configured.

## Response Format for Claude Code

At the end of implementation work, summarize: - What changed - Files
changed - Commands/tests run - Result - Configuration/migration actions
still required - Any known limitation

Do not claim a command/test/deployment succeeded unless it was actually
run and observed.
