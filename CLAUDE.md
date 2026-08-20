# CLAUDE.md --- Maxwell AU Platform

## Project

Maxwell AU is a worship/music ministry platform. Build a premium public
website plus an authenticated administration experience for publishing
and managing music, videos, events, bookings, testimonies, King's Time
content, and social distribution.

Production domain: maxwellau.com DNS/registrar: GoDaddy Cloud: Microsoft
Azure

## Product Goals

1.  Present Maxwell AU as a professional worship minister and recording
    artist.
2.  Make music, videos, King's Time, events, biography, testimonies, and
    booking easy to discover.
3.  Give administrators one place to manage website content.
4.  Upload media once to Azure Blob Storage and distribute eligible
    content to connected social platforms through official APIs.
5.  Keep the initial Azure bill low while preserving a clean path to
    scale.
6.  Deliver excellent SEO, accessibility, mobile UX, performance,
    security, and maintainability.

## Approved Stack

-   Language: TypeScript with strict mode.
-   Web: Next.js using App Router.
-   UI: React.
-   Styling: Tailwind CSS.
-   Component primitives: shadcn/ui where useful.
-   Validation: Zod.
-   Forms: React Hook Form.
-   Database: PostgreSQL.
-   ORM: Prisma.
-   Media/object storage: Azure Blob Storage.
-   Hosting: Azure Container Apps unless PLAN.md explicitly changes the
    deployment target.
-   Background work: Azure Functions and/or a dedicated TypeScript
    worker.
-   Queue: start with Azure Storage Queue for low cost; abstract queue
    access so Service Bus can replace it when advanced messaging is
    justified.
-   Secrets: Azure Key Vault in deployed environments; `.env.local` only
    for local development.
-   Observability: Azure Application Insights / OpenTelemetry.
-   CI/CD: GitHub Actions.
-   Infrastructure as Code: Terraform.
-   Mobile, when Phase 3 begins: React Native + Expo + TypeScript.

## Architecture Rules

-   Start as a modular monolith. Do not create microservices without a
    documented operational reason.
-   Prefer Server Components by default. Add `"use client"` only when
    interactivity requires it.
-   Keep business/domain logic out of React components and route
    handlers.
-   Use modules with explicit boundaries: auth, profile, media, music,
    events, bookings, testimonies, kings-time, publishing, social,
    newsletter, settings.
-   Access PostgreSQL through Prisma repositories/services, not ad-hoc
    SQL from UI code.
-   External platforms must be isolated behind adapters/interfaces.
-   Azure dependencies must be isolated behind infrastructure adapters.
-   Never expose storage account keys, database credentials, OAuth
    client secrets, refresh tokens, or signing secrets to the browser.
-   Never commit secrets or generated credentials.
-   Never use permanent public write access on Blob Storage.
-   Browser media uploads must use short-lived, least-privilege SAS URLs
    and direct-to-Blob upload.
-   Persist media metadata in PostgreSQL; do not store large video/audio
    binary data in PostgreSQL.
-   Use idempotency for publishing jobs so retries cannot create
    accidental duplicate posts.
-   Store social publishing status independently for each destination.
-   Treat a social API failure as a recoverable job failure; do not fail
    website publication because another destination failed.

## Repository Shape

Prefer:

apps/ web/ \# Public site + protected admin in the initial release
worker/ \# Async publishing/background jobs when introduced mobile/ \#
Phase 3

packages/ db/ ui/ validation/ social/ azure/ config/ types/

infra/ terraform/

docs/ adr/

If the project begins as a single Next.js application, do not create
empty workspace packages prematurely. Grow toward this structure as
modules require extraction.

## Next.js Conventions

-   Use `src/app`.
-   Public routes: `/`, `/bio`, `/music`, `/videos`, `/events`,
    `/kings-time`, `/testimonies`, `/booking`, `/media`, `/contact`.
-   Admin routes live under `/admin`.
-   API/route handlers live under `/api` or feature-appropriate route
    handlers.
-   Use Next.js metadata APIs, Open Graph metadata, sitemap and robots
    configuration.
-   Use `next/image` for images where appropriate.
-   Avoid client-side fetching for content that can be rendered on the
    server.
-   Use loading/error/not-found boundaries intentionally.

## UI / Brand Direction

Maxwell AU should feel worship-centered, cinematic, modern, warm,
premium, and distinctly African without becoming visually busy.

Core experience: - Cinematic/animated home hero. - Music releases and
streaming destinations. - Worship/video content. - King's Time monthly
worship and prayer. - Upcoming events. - Testimonies. - Booking CTA. -
Social links/feed where platform policies allow. - Strong footer and
newsletter CTA.

Design must remain readable and restrained. Use animation to support
atmosphere, not distract from content. Respect `prefers-reduced-motion`.

## Initial Content Model

Design Prisma models around: - User / Role - ArtistProfile - Album -
Song - Media - MediaAsset - Event - Booking - Testimony -
KingsTimeSession - SocialAccount - SocialPost - SocialPublication -
NewsletterSubscriber - SiteSetting - AuditLog

Use enums where they enforce stable domain states, including media type,
visibility, publication platform, and publication status.

## Media Workflow

Expected flow: 1. Admin requests an upload session. 2. Server validates
filename, MIME type, size, user authorization and target container. 3.
Server issues a short-lived write-only SAS URL for the exact blob/key.
4. Browser uploads directly to Azure Blob Storage. 5. Client/server
confirms completion. 6. API creates/finalizes the Media record. 7.
Website publication can happen independently. 8. Requested social
destinations generate asynchronous publication jobs. 9. Worker uses
platform adapters and records each result in SocialPublication. 10.
Failed jobs expose a retry action and preserve useful error details.

Do not assume one media format works on every social network. Validate
platform-specific requirements before queuing or publishing.

## Social Integrations

Use only official supported APIs and OAuth flows. Never implement
browser automation, scraping, credential sharing, or simulated user
actions.

Target adapters: - YouTube - Facebook - Instagram - TikTok

Each adapter should implement a common application-level contract such
as: - validate() - publish() - getStatus() when supported -
refreshCredentials() when applicable

Capabilities vary by platform/account/app approval. Build capability
detection rather than pretending all destinations support identical
features.

Encrypt/protect OAuth credentials and refresh tokens. Never return them
from API responses.

## Security

-   Authenticate every admin route and mutation.
-   Implement RBAC. Initial roles may be ADMIN and EDITOR.
-   Validate every server input with Zod.
-   Rate-limit public booking/contact endpoints.
-   Protect forms from spam/abuse.
-   Use secure, HTTP-only cookies for sessions.
-   Apply least privilege to Azure managed identities.
-   Prefer Managed Identity in Azure instead of connection secrets where
    supported.
-   Keep production and non-production resources/data separated.
-   Record sensitive administrative changes in AuditLog.
-   Do not log tokens, credentials, full connection strings, or
    sensitive form contents.

## Database / Prisma

-   PostgreSQL is the source of truth for application metadata.
-   Use migrations; never manually drift production schema.
-   Add indexes deliberately for slugs, dates, statuses, foreign keys,
    publication queues and common filters.
-   Use UTC timestamps in persistence.
-   Use human-readable unique slugs for public content.
-   Prefer soft-delete/archive where deleting published ministry/media
    content would be destructive.
-   Seed development data separately from production data.

## Cost Discipline

-   Prefer consumption/serverless resources for intermittent background
    work.
-   Begin with Azure Storage Queue unless Service Bus features are
    actually needed.
-   Use Blob lifecycle rules to move/archive old originals when
    appropriate.
-   Avoid unnecessary video transcoding in MVP.
-   Do not introduce Redis, Kubernetes/AKS, Kafka, Elasticsearch, or
    multiple databases without a measured requirement.
-   Add Front Door/CDN only when traffic, security, custom-domain
    routing, or media-delivery requirements justify the cost.
-   Document any recurring Azure resource added to the architecture and
    why it is necessary.

## Engineering Quality

Before considering a task complete: - TypeScript type-check passes. -
Lint passes. - Relevant tests pass. - Production build passes. - No
secrets are introduced. - Error states and loading states are handled. -
Mobile responsiveness is checked. - Accessibility basics are checked. -
Changes are documented when they alter architecture, environment
variables, deployment or database schema.

Prefer: - unit tests for domain/services - integration tests for
repositories/API boundaries - Playwright for critical user journeys

Critical journeys include: - public navigation - booking submission -
admin authentication - media upload - content publication - social
publication retry

## Git / Change Discipline

-   Make small, coherent changes.
-   Do not rewrite unrelated code.
-   Do not delete working functionality merely to simplify a task.
-   Explain destructive migrations before applying them.
-   Never run destructive production commands unless the user explicitly
    asks.
-   Keep `.env.example` updated with variable names only, never real
    values.
-   Add architecture decisions to `docs/adr` when a significant
    technology/hosting decision changes.

## Working With PLAN.md

PLAN.md is the delivery source of truth. - Read PLAN.md before
substantial implementation. - Work phase-by-phase. - Do not silently
skip acceptance criteria. - Mark completed checklist items only after
verification. - If implementation reveals a better approach, update
PLAN.md and explain the change before broad refactoring.

## Definition of Done

A feature is done when it is functional, secure, responsive, accessible
at a reasonable baseline, tested at the appropriate level, documented,
and deployable through the established CI/CD path.
