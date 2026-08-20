# ADR 0001 — Modular monolith on Azure Container Apps

- **Status:** Accepted
- **Date:** 2026-08-20
- **Deciders:** Maxwell AU platform team

## Context

Maxwell AU needs a public ministry website, an authenticated admin CMS, direct
large-media upload to Azure Blob Storage, and asynchronous distribution of
eligible content to YouTube, Facebook, Instagram and TikTok.

The constraints that shape the decision:

- One primary maintainer, not a platform team.
- The initial Azure bill must stay low, with a clean path to scale.
- Traffic is intermittent and event-driven — worship nights, releases, King's
  Time — not steady high-volume load.
- Social publishing is genuinely asynchronous and must survive partial failure:
  one destination failing must never roll back another that succeeded.

## Decision

Build a **modular monolith**: a single Next.js application (App Router, React
Server Components by default) deployed as one container to **Azure Container
Apps**, with explicit in-process module boundaries under `src/modules/`:

```
auth  profile  media  music  events  bookings
testimonies  kings-time  publishing  social  newsletter  settings
```

Each module owns its types and a service layer. Pages, route handlers and
components call module services; they never reach for Prisma, an Azure SDK or a
social platform API directly. External platforms sit behind adapters and Azure
dependencies behind infrastructure adapters, so both can be swapped or faked in
tests.

Background publishing work is the one thing that leaves the process: it is
queued to **Azure Storage Queue** and consumed by a separate worker
(`apps/worker`, added in Phase 5). That split is justified by an operational
need — publishing jobs are long-running, retryable and must not occupy a request
thread — not by a desire for service granularity.

Supporting choices:

- **PostgreSQL Flexible Server + Prisma** — one relational database as the
  source of truth for metadata. Large binaries never go in the database.
- **Azure Blob Storage** with short-lived, exact-scope SAS URLs for
  direct browser-to-blob upload. Media never proxies through the Next.js server.
- **Azure Storage Queue over Service Bus** — the MVP needs a durable FIFO-ish
  work queue, not sessions, topics or transactions. Queue access is abstracted so
  Service Bus can replace it when a feature actually requires it.
- **Terraform** for all Azure infrastructure, parameterised across dev, staging
  and prod.

## Consequences

**Positive**

- One deployable, one log stream, one migration path. Debugging a publishing
  failure means reading two processes, not eight.
- Scale-to-zero on Container Apps keeps idle cost near nothing between events.
- Module boundaries are enforced by convention and review now, and can be
  enforced by extraction into `packages/*` later without rewriting call sites.
- A single database means no distributed transactions and no eventual-consistency
  reconciliation for ordinary content operations.

**Negative**

- Module boundaries are conventions, not compiler-enforced walls. A careless
  import can couple two modules; code review and the repository shape are the
  only guards until packages are extracted.
- The whole application scales as one unit. If media processing ever needs
  materially different resources from web serving, that is the signal to split.
- A bad deploy takes down the public site and the admin together.

**Revisit when**

- A module needs an independent release cadence or a different runtime.
- Publishing volume makes Storage Queue's ordering or dead-lettering
  insufficient — that is the Service Bus trigger.
- The single database becomes a measured bottleneck, rather than a suspected one.

## Alternatives considered

**Microservices from the start.** Rejected: it multiplies deployment,
observability and cost surface for a project with one maintainer and no
independent scaling requirement. CLAUDE.md explicitly requires a documented
operational reason, and none exists yet.

**Azure App Service instead of Container Apps.** Viable, but Container Apps
gives scale-to-zero, a first-class container workflow shared with the worker,
and KEDA-based queue scaling for the publishing worker later. Container Apps
also keeps the local Docker image and the deployed artefact identical.

**Serverless-only (Azure Functions for everything).** Rejected for the web tier:
Next.js SSR with React Server Components is not a natural fit, and cold starts
on a public marketing site are a real user-facing cost. Functions remain a valid
host for the publishing worker.
