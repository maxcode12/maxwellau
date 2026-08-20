# Maxwell AU Platform

The worship and music ministry platform for **Maxwell AU** — singer-songwriter,
recording artist and worship minister.

> Worship • Encounter • Transformation

Production domain: **maxwellau.com** · Cloud: **Microsoft Azure** · DNS: GoDaddy

## What this repository contains

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js (App Router) public website + admin CMS |
| `apps/worker` | Publishing worker (Storage Queue consumer, social adapters) |
| `packages/social` | SocialPublisher contract, platform adapters, token crypto |
| `packages/azure` | Storage Queue adapter |
| `infra/terraform` | Azure infrastructure as code (Phase 2+) |
| `docs/adr` | Architecture decision records |
| `docs/content` | Owner-supplied source content (biography) |
| `scripts` | Asset pipeline (`prepare-assets.mjs`) |
| `images/` | Owner-supplied photography originals — **not committed**; processed into `apps/web/public` |

Delivery is governed by three documents: [CLAUDE.md](CLAUDE.md) (engineering
rules), [SKILL.md](SKILL.md) (implementation playbook) and [PLAN.md](PLAN.md)
(phase-by-phase roadmap and current status).

## Stack

TypeScript (strict) · Next.js App Router · React Server Components ·
Tailwind CSS 4 · Zod · React Hook Form · Prisma + PostgreSQL (Phase 2) ·
Azure Blob Storage / Container Apps / Storage Queue / Key Vault (Phase 2+) ·
Vitest · Playwright · GitHub Actions · Terraform

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Useful scripts (run from the repository root):

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the web app in development |
| `npm run typecheck` | TypeScript across all workspaces |
| `npm run lint` | ESLint across all workspaces |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E (builds and serves production bundle) |
| `npm run build` | Production build |
| `npm run verify` | typecheck + lint + test + build |
| `node scripts/prepare-assets.mjs` | Regenerate optimised images + manifest from `images/` |

## Environment

Copy `.env.example` to `apps/web/.env.local` for local development. Every
variable is documented in that file; none are required to run the public site
locally. Deployed environments read secrets from Azure Key Vault — never from
committed files.

**Sample content:** until the CMS (Phase 3) exists, events, videos, King's Time
sessions and testimonies render clearly-labelled sample records so the design
can be reviewed end-to-end. Set `NEXT_PUBLIC_SAMPLE_CONTENT=off` to hide them.
The biography and discography are real, sourced from the official biography in
`docs/content/`.

## Testing

- **Unit** (Vitest): schema validation, rate limiting, date/formatting
  utilities, UI primitives — `apps/web/src/**/*.test.ts(x)`
- **E2E** (Playwright): every public route, booking submission (success and
  validation failure), navigation, skip link, 404, health endpoint, robots and
  sitemap — `apps/web/e2e/`, run on desktop Chromium and mobile Safari.

## Deployment

See [docs/deployment.md](docs/deployment.md) (containers, CI/CD, first deploy)
and [docs/dns-cutover.md](docs/dns-cutover.md) (GoDaddy → Azure runbook).

## Current status

See the status notes in [PLAN.md](PLAN.md). In short: Phases 0–5 (scaffold,
public website with the official biography and discography, PostgreSQL/Prisma,
admin CMS with auth and RBAC, direct-to-Blob media upload, publishing engine
with worker and adapters) are implemented and verified locally. What remains
needs external access: Azure subscription (Terraform apply + first deploy),
Google/Meta/TikTok developer credentials (live social publishing), and the
GoDaddy DNS cutover once production is verified.
