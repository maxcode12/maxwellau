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

> **Status:** IMPLEMENTED and VERIFIED against the local Azurite emulator —
> E2E covers a full direct browser→Blob block upload with server confirmation
> and READY status, plus rejection of unsupported file types. In Azure the
> adapter switches to Managed Identity + user-delegation SAS automatically.
> Thumbnail/poster generation is deferred to the worker (Phase 5+), as the
> MediaAsset model and admin UI hooks already anticipate it.

-   [x] Create upload-session endpoint.
-   [x] Generate exact-scope, short-lived SAS.
-   [x] Implement direct browser-to-Blob upload.
-   [x] Upload progress UI.
-   [x] Cancellation/retry.
-   [x] Server-side upload confirmation.
-   [x] Persist Media metadata.
-   [ ] Thumbnail/poster support.
-   [x] Media visibility and publication status.
-   [x] Secure/private container strategy where needed.

### Acceptance

A large video can be uploaded without passing through the Next.js server
process, and the website can display the resulting approved media.

## Phase 5 --- Publishing Engine

> **Status:** IMPLEMENTED and VERIFIED locally. SocialPublisher contract with
> explicit capability model (packages/social), Storage Queue adapter
> (packages/azure), idempotent jobs (publicationId+attempt gate), publishing
> worker (apps/worker) with scheduled-post promotion, per-destination status,
> retry, sanitised errors, composer and history UI. Worker smoke-tested
> against Azurite+Postgres; website-only publish verified by E2E.
> "Provision Azure Storage Queue" is defined in Terraform (Phase 2) —
> applying is blocked on Azure credentials.

-   [x] Define `SocialPublisher` contract.
-   [x] Define platform capability model.
-   [x] Add SocialPost composer.
-   [x] Select destinations.
-   [x] Publish now.
-   [x] Schedule publication.
-   [ ] Provision Azure Storage Queue.
-   [x] Add worker/Function.
-   [x] Implement idempotent jobs.
-   [x] Publication status tracking.
-   [x] Retry failed destination.
-   [x] Sanitize/log external errors.
-   [x] Admin publishing history.

### Acceptance

One content item can create independent destination jobs, and each
destination reports its own QUEUED/PROCESSING/PUBLISHED/FAILED state.

## Phase 6 --- YouTube Integration

> **Status:** Adapter (resumable upload, processing polls, token refresh),
> Google OAuth connect flow and encrypted token storage are IMPLEMENTED.
> Live testing is **BLOCKED — EXTERNAL CREDENTIALS REQUIRED** (Google Cloud
> project + OAuth client + YouTube API audit for public uploads).

-   [ ] Create/configure Google/YouTube API application.
-   [x] Implement OAuth.
-   [x] Protect token storage.
-   [x] Validate YouTube upload requirements.
-   [x] Implement video publisher.
-   [x] Save returned video ID/URL.
-   [x] Handle processing/failure states.
-   [x] Add disconnect/reconnect workflow.
-   [x] Document any API verification/audit requirements.

### Acceptance

An authorized Maxwell AU admin can select a stored video and publish it
to the connected YouTube channel through the admin publishing workflow.

## Phase 7 --- Meta: Facebook & Instagram

> **Status:** Page/IG adapters (file_url + container/publish flows), Meta OAuth
> with Page enumeration and linked-IG discovery are IMPLEMENTED. Live testing
> is **BLOCKED — EXTERNAL CREDENTIALS REQUIRED** (Meta developer app + app
> review for pages_manage_posts / instagram_content_publish).

-   [ ] Confirm account/page prerequisites and current API capabilities.
-   [ ] Configure Meta developer application.
-   [x] Implement OAuth/token lifecycle.
-   [x] Facebook publisher.
-   [x] Instagram publisher.
-   [x] Platform-specific validation.
-   [x] Result/status handling.
-   [x] Retry behavior.
-   [x] Document app review/permission requirements.

### Acceptance

Supported Maxwell AU Facebook/Instagram destinations can receive
eligible content without manual re-upload from the website.

## Phase 8 --- TikTok

> **Status:** Content Posting API adapter (PULL_FROM_URL, status polls, token
> refresh) and OAuth flow are IMPLEMENTED. Live testing is **BLOCKED —
> EXTERNAL CREDENTIALS REQUIRED** (TikTok developer app, Content Posting API
> approval, verified media domain).

-   [ ] Confirm current Content Posting API eligibility/capabilities.
-   [ ] Configure developer application.
-   [x] Implement OAuth/token lifecycle.
-   [x] Implement supported publishing flow.
-   [x] Validate video constraints.
-   [x] Result/status handling.
-   [x] Document review/approval requirements.

### Acceptance

Eligible content can be submitted to the connected TikTok account using
the officially supported API and the application clearly handles
capabilities that require user interaction or are unavailable.

## Phase 9 --- Scheduling & Editorial Workflow

-   [ ] Draft posts.
-   [x] Scheduled posts.
-   [ ] Calendar/list view.
-   [x] Caption variants per platform.
-   [ ] Platform-specific media selection.
-   [ ] Preview.
-   [ ] Approval state if additional editors are added.
-   [x] Retry dashboard.
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

> **Status:** Containerisation (web image built and smoke-tested locally with
> live database connectivity; worker image defined), CI (full verify + E2E
> against service containers), CD (OIDC → ACR → Container Apps with migration
> step and post-deploy health verification) and runbooks are IMPLEMENTED.
> Provisioning/deploying to real Azure environments is **BLOCKED — EXTERNAL
> CREDENTIALS REQUIRED** (Azure subscription + CD repository secrets).

-   [x] Containerize Next.js.
-   [ ] Provision Azure Container Apps environment/app.
-   [ ] Configure Managed Identity.
-   [ ] Configure Key Vault references.
-   [ ] Configure PostgreSQL production database.
-   [ ] Configure Blob production containers.
-   [ ] Configure logging/alerts.
-   [x] GitHub Actions CI.
-   [x] GitHub Actions CD.
-   [x] Database migration deployment strategy.
-   [ ] Staging environment.
-   [ ] Production environment.
-   [x] Health checks.
-   [ ] Backup/restore plan.

## Phase 13 --- maxwellau.com / GoDaddy DNS Cutover

> **Status:** Full step-by-step runbook in docs/dns-cutover.md (inventory,
> MX/TXT preservation, verification records, apex+www, canonical redirect,
> TLS and email validation). Execution is **BLOCKED** until the Azure
> production endpoint exists and is verified. The www→apex redirect is
> already implemented in the application.

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
-   [x] Rate limiting.
-   [x] Anti-spam for public forms.
-   [x] Security headers/CSP.
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
