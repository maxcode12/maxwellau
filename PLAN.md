# PLAN.md --- Maxwell AU Web & App Delivery Plan

## Vision

Build Maxwell AU into a modern worship/music ministry platform at
`maxwellau.com`, with a premium public experience and an administration
system capable of managing content and distributing eligible video/posts
to social platforms.

## Architecture Baseline

-   Next.js + React + TypeScript
-   Tailwind CSS + shadcn/ui
-   PostgreSQL + Prisma
-   Azure Blob Storage
-   Azure Container Apps
-   Azure Functions / TypeScript worker
-   Azure Storage Queue initially
-   Azure Key Vault
-   Application Insights
-   GitHub Actions
-   Terraform
-   GoDaddy remains domain registrar/DNS initially


> **Status (2026-08-20):** Phases 0 and 1 are IMPLEMENTED and VERIFIED locally
> (type-check, lint, 33 unit tests, production build, 33 Playwright E2E tests
> across desktop Chromium and mobile Safari). The public site uses the official
> biography and verified discography; events, videos, King's Time sessions and
> testimonies render clearly-labelled sample records until the CMS (Phase 3)
> lands — toggle with `NEXT_PUBLIC_SAMPLE_CONTENT=off`. Phase 2 (Azure data
> foundation) is next.

## Phase 0 --- Repository & Architecture Foundation

-   [x] Initialize Git repository.
-   [x] Create Next.js application with App Router, TypeScript and
    `src/`.
-   [x] Enable TypeScript strict mode.
-   [x] Add Tailwind CSS.
-   [x] Configure shadcn/ui.
-   [x] Add ESLint/Prettier conventions.
-   [x] Add `.env.example`.
-   [x] Add `CLAUDE.md`, `SKILL.md`, `PLAN.md`.
-   [x] Establish feature/module folder conventions.
-   [x] Add baseline unit-test tooling.
-   [x] Add Playwright.
-   [x] Add health endpoint.
-   [x] Create `docs/adr`.
-   [x] Record ADR for modular-monolith architecture.

### Acceptance

`npm/pnpm` install, lint, type-check, test and production build succeed
locally.

## Phase 1 --- Public Website MVP

### Navigation

-   [x] Header/navigation.
-   [x] Mobile menu.
-   [x] Footer.
-   [x] Social links.
-   [x] Newsletter CTA placeholder/integration boundary.

### Home

-   [x] Cinematic animated hero.
-   [x] Primary CTAs: Listen/Watch and Book Ministry.
-   [x] Latest music.
-   [x] Featured videos.
-   [x] King's Time feature.
-   [x] Upcoming events.
-   [x] Featured testimonies.
-   [x] Social section.
-   [x] Booking CTA.

### Pages

-   [x] Bio.
-   [x] Music.
-   [x] Videos.
-   [x] Events.
-   [x] King's Time.
-   [x] Testimonies.
-   [x] Booking.
-   [x] Media/gallery.
-   [x] Contact.

### Quality

-   [x] Metadata and Open Graph.
-   [x] Sitemap.
-   [x] robots.txt.
-   [x] Structured data where useful.
-   [x] Accessible semantic markup.
-   [x] Responsive testing.
-   [x] Performance baseline.
-   [x] Reduced-motion support.

### Acceptance

A visitor can understand Maxwell AU's ministry, watch/listen, discover
King's Time/events, read the bio, view testimonies and submit a booking
request.

## Phase 2 --- Azure Data Foundation

> **Status:** Schema, migrations, seed and Terraform are IMPLEMENTED and
> verified against local Docker Postgres (bookings persist end-to-end via E2E).
> Azure provisioning items (resource group, PostgreSQL server, storage account,
> Key Vault, App Insights, CORS, lifecycle, Managed Identity) are fully defined
> in `infra/terraform` and validated — applying them is
> **BLOCKED — EXTERNAL CREDENTIALS REQUIRED** (Azure subscription login).

-   [ ] Provision resource group(s).
-   [ ] Provision low-cost PostgreSQL Flexible Server configuration.
-   [x] Configure Prisma.
-   [x] Create initial schema.
-   [x] Create migrations.
-   [x] Add development seed data.
-   [ ] Provision Azure Storage Account.
-   [ ] Create media containers.
-   [ ] Configure CORS narrowly for direct uploads.
-   [ ] Configure Blob lifecycle policy.
-   [ ] Provision Key Vault.
-   [ ] Configure Managed Identity where supported.
-   [ ] Provision Application Insights.
-   [x] Define infrastructure in Terraform.

### Initial Models

-   [x] User / Role.
-   [x] ArtistProfile.
-   [x] Album / Song.
-   [x] Media / MediaAsset.
-   [x] Event.
-   [x] Booking.
-   [x] Testimony.
-   [x] KingsTimeSession.
-   [x] SocialAccount.
-   [x] SocialPost / SocialPublication.
-   [x] NewsletterSubscriber.
-   [x] SiteSetting.
-   [x] AuditLog.

### Acceptance

The application can read/write PostgreSQL safely, access Blob Storage
through approved credentials/identity, and deploy infrastructure
reproducibly.

## Phase 3 --- Admin CMS

> **Status:** IMPLEMENTED and VERIFIED locally. Session auth (opaque token,
> SHA-256 at rest, sliding expiry), RBAC (ADMIN/EDITOR), dashboard, and CRUD
> for music/songs, videos, events, King's Time, testimonies (with enforced
> publication consent), booking workflow (NEW→…→CLOSED with internal notes),
> newsletter list, site settings (social/streaming links + contact emails) and
> audit log. Public pages now read CMS content first and fall back to the
> checked-in content. Verified by 43 Playwright E2E tests incl. login,
> lockout-safe failures, event creation and booking workflow.
> Video *media management* beyond YouTube ids arrives with Phase 4 uploads.

-   [x] Admin authentication.
-   [x] RBAC.
-   [x] Dashboard shell.
-   [x] Artist profile/bio editor.
-   [x] Music/album management.
-   [x] Video/media management.
-   [x] Event management.
-   [x] King's Time management.
-   [x] Testimony management.
-   [x] Booking inbox/workflow.
-   [x] Site settings.
-   [x] Audit logging.

### Acceptance

An authorized administrator can update core website content without
changing source code.

## Phase 4 --- Direct Media Upload

-   [ ] Create upload-session endpoint.
-   [ ] Generate exact-scope, short-lived SAS.
-   [ ] Implement direct browser-to-Blob upload.
-   [ ] Upload progress UI.
-   [ ] Cancellation/retry.
-   [ ] Server-side upload confirmation.
-   [ ] Persist Media metadata.
-   [ ] Thumbnail/poster support.
-   [ ] Media visibility and publication status.
-   [ ] Secure/private container strategy where needed.

### Acceptance

A large video can be uploaded without passing through the Next.js server
process, and the website can display the resulting approved media.

## Phase 5 --- Publishing Engine

-   [ ] Define `SocialPublisher` contract.
-   [ ] Define platform capability model.
-   [ ] Add SocialPost composer.
-   [ ] Select destinations.
-   [ ] Publish now.
-   [ ] Schedule publication.
-   [ ] Provision Azure Storage Queue.
-   [ ] Add worker/Function.
-   [ ] Implement idempotent jobs.
-   [ ] Publication status tracking.
-   [ ] Retry failed destination.
-   [ ] Sanitize/log external errors.
-   [ ] Admin publishing history.

### Acceptance

One content item can create independent destination jobs, and each
destination reports its own QUEUED/PROCESSING/PUBLISHED/FAILED state.

## Phase 6 --- YouTube Integration

-   [ ] Create/configure Google/YouTube API application.
-   [ ] Implement OAuth.
-   [ ] Protect token storage.
-   [ ] Validate YouTube upload requirements.
-   [ ] Implement video publisher.
-   [ ] Save returned video ID/URL.
-   [ ] Handle processing/failure states.
-   [ ] Add disconnect/reconnect workflow.
-   [ ] Document any API verification/audit requirements.

### Acceptance

An authorized Maxwell AU admin can select a stored video and publish it
to the connected YouTube channel through the admin publishing workflow.

## Phase 7 --- Meta: Facebook & Instagram

-   [ ] Confirm account/page prerequisites and current API capabilities.
-   [ ] Configure Meta developer application.
-   [ ] Implement OAuth/token lifecycle.
-   [ ] Facebook publisher.
-   [ ] Instagram publisher.
-   [ ] Platform-specific validation.
-   [ ] Result/status handling.
-   [ ] Retry behavior.
-   [ ] Document app review/permission requirements.

### Acceptance

Supported Maxwell AU Facebook/Instagram destinations can receive
eligible content without manual re-upload from the website.

## Phase 8 --- TikTok

-   [ ] Confirm current Content Posting API eligibility/capabilities.
-   [ ] Configure developer application.
-   [ ] Implement OAuth/token lifecycle.
-   [ ] Implement supported publishing flow.
-   [ ] Validate video constraints.
-   [ ] Result/status handling.
-   [ ] Document review/approval requirements.

### Acceptance

Eligible content can be submitted to the connected TikTok account using
the officially supported API and the application clearly handles
capabilities that require user interaction or are unavailable.

## Phase 9 --- Scheduling & Editorial Workflow

-   [ ] Draft posts.
-   [ ] Scheduled posts.
-   [ ] Calendar/list view.
-   [ ] Caption variants per platform.
-   [ ] Platform-specific media selection.
-   [ ] Preview.
-   [ ] Approval state if additional editors are added.
-   [ ] Retry dashboard.
-   [ ] Publishing notifications.

## Phase 10 --- Analytics

-   [ ] Website analytics.
-   [ ] Booking conversion tracking.
-   [ ] Media engagement events.
-   [ ] Social outbound-link tracking.
-   [ ] Platform analytics only where APIs/permissions permit.
-   [ ] Admin overview metrics.

Do not create misleading cross-platform metrics when platforms define
views/engagement differently.

## Phase 11 --- Mobile App

Use React Native + Expo + TypeScript and the same backend/domain
contracts.

### MVP

-   [ ] Home.
-   [x] Music.
-   [x] Videos.
-   [x] King's Time.
-   [x] Events.
-   [x] Testimonies.
-   [ ] About.
-   [ ] Booking/contact link.
-   [ ] Push notification foundation.

### Later

-   [ ] Prayer requests.
-   [ ] Devotionals.
-   [ ] Lyrics.
-   [ ] Live worship experience.
-   [ ] Saved/favorite content.
-   [ ] Giving/partnership integration if required.

## Phase 12 --- Production Deployment

-   [ ] Containerize Next.js.
-   [ ] Provision Azure Container Apps environment/app.
-   [ ] Configure Managed Identity.
-   [ ] Configure Key Vault references.
-   [ ] Configure PostgreSQL production database.
-   [ ] Configure Blob production containers.
-   [ ] Configure logging/alerts.
-   [ ] GitHub Actions CI.
-   [ ] GitHub Actions CD.
-   [ ] Database migration deployment strategy.
-   [ ] Staging environment.
-   [ ] Production environment.
-   [ ] Health checks.
-   [ ] Backup/restore plan.

## Phase 13 --- maxwellau.com / GoDaddy DNS Cutover

Do not change DNS until the Azure production endpoint has been tested.

-   [ ] Inventory existing GoDaddy DNS records before modification.
-   [ ] Preserve email/MX/TXT records unless intentionally changing
    email service.
-   [ ] Add Azure domain-verification record(s) required by the chosen
    hosting endpoint.
-   [ ] Configure apex `maxwellau.com`.
-   [ ] Configure `www.maxwellau.com`.
-   [ ] Decide canonical host and redirect the alternate.
-   [ ] Verify TLS certificate.
-   [ ] Verify HTTP -\> HTTPS.
-   [ ] Test website from external networks.
-   [ ] Confirm email still works after DNS changes.
-   [ ] Record final DNS configuration in project documentation.

### Acceptance

`https://maxwellau.com` resolves to the new Azure-hosted application
with valid TLS, `www` behaves as designed, and existing email
functionality is unaffected.

## Phase 14 --- Hardening

-   [ ] Dependency/security scanning.
-   [ ] Rate limiting.
-   [ ] Anti-spam for public forms.
-   [ ] Security headers/CSP.
-   [ ] RBAC review.
-   [ ] Azure least-privilege review.
-   [ ] Secret rotation procedure.
-   [ ] Database backup restore test.
-   [ ] Blob recovery/versioning decision.
-   [ ] Accessibility audit.
-   [ ] Performance audit.
-   [ ] Error/alert runbook.

## Explicitly Deferred From MVP

-   Automatic 4K transcoding.
-   Adaptive bitrate video platform.
-   AKS/Kubernetes.
-   Redis.
-   Kafka.
-   Elasticsearch.
-   Multiple independently deployed microservices.
-   AI-generated clips/captions/thumbnails.
-   Complex cross-platform analytics normalization.

## Future AI Content Assistant

After the publishing platform is stable: - Generate title/caption
suggestions. - Generate platform-specific descriptions. - Suggest
hashtags. - Suggest chapters from transcripts. - Suggest short-form
clips. - Generate thumbnail concepts. - Require human approval before
publication.

## Immediate Build Order

1.  Phase 0 --- scaffold.
2.  Phase 1 --- public website using real Maxwell AU content.
3.  Phase 2 --- PostgreSQL/Blob/Azure foundation.
4.  Phase 3 --- admin CMS.
5.  Phase 4 --- direct media upload.
6.  Phase 5 --- publishing engine.
7.  Phase 6 --- YouTube first.
8.  Phase 7/8 --- Meta and TikTok after API/account prerequisites are
    confirmed.
9.  Production deployment and GoDaddy DNS cutover.
10. Mobile app after the web/admin/publishing foundation is stable.
