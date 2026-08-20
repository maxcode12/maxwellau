# Maxwell AU Platform

The worship and music ministry platform for **Maxwell AU** — singer-songwriter,
recording artist and worship minister.

> Worship • Encounter • Transformation

Production domain: **maxwellau.com** · Cloud: **Microsoft Azure** · DNS: GoDaddy

## What this repository contains

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js (App Router) public website + admin (admin lands in Phase 3) |
| `packages/*` | Extracted shared packages (created when concrete reuse emerges) |
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

## Current status

See the status note at the top of [PLAN.md](PLAN.md). In short: Phases 0–1
(scaffold + full public website) are implemented and verified; Phase 2 (Azure
data foundation: PostgreSQL, Prisma, Blob Storage, Terraform) is next.
