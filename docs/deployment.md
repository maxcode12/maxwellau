# Deployment — Maxwell AU platform

## Topology

| Component | Where | How |
| --- | --- | --- |
| Web (Next.js) | Azure Container Apps `ca-maxwellau-web-<env>` | `apps/web/Dockerfile`, standalone output, port 3000 |
| Worker (publishing) | Azure Container Apps `ca-maxwellau-worker-<env>` (or Container Apps Job) | `apps/worker/Dockerfile` |
| Database | Azure PostgreSQL Flexible Server | Prisma migrations via `prisma migrate deploy` |
| Media | Azure Blob Storage (`media` private, `public-media` public-read) | direct browser upload with SAS |
| Queue | Azure Storage Queue `publishing-jobs` | consumed by the worker |
| Secrets | Azure Key Vault | Container Apps secret references via Managed Identity |
| Telemetry | Application Insights | connection string from Key Vault |

All infrastructure is defined in `infra/terraform` (dev/staging/prod tfvars).

## Environment variables

Documented in `.env.example` (names only, never values). In Azure, values come
from Key Vault references configured by Terraform — the app never sees an
account key, and the Prisma connection string exists only in Key Vault.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): install → prisma generate → type-check
  → lint → unit tests → production build, plus a separate E2E job with real
  Postgres and Azurite service containers running the full Playwright suite
  (Chromium + mobile Safari).
- **CD** (`.github/workflows/cd.yml`): builds/pushes both images to ACR (OIDC
  login, no long-lived credentials), runs `prisma migrate deploy`, updates the
  Container App and verifies `/api/health` before declaring success. The
  workflow **no-ops with a notice** until the Azure OIDC secrets are
  configured, so nothing pretends to deploy.

Required repository secrets to enable CD:

```
AZURE_CLIENT_ID          # federated (OIDC) app registration
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
ACR_LOGIN_SERVER         # e.g. crmaxwellau.azurecr.io
DATABASE_URL             # per-environment; used only for migrate deploy
```

## First deployment (once Azure credentials exist)

1. Bootstrap the Terraform state backend (see `infra/terraform/README.md`).
2. `terraform apply -var-file=envs/staging.tfvars`.
3. Add the CD repository secrets; run the CD workflow (`workflow_dispatch`).
4. Verify: home page, `/api/health` (database: true), admin login, media
   upload, booking flow, logs in Application Insights.
5. Repeat for prod. **Do not** touch DNS until staging and the prod FQDN have
   both been verified — the cutover runbook is `docs/dns-cutover.md`.

## Local production rehearsal

```bash
docker build -f apps/web/Dockerfile -t maxwellau-web:local .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://maxwellau:localdev@host.docker.internal:5433/maxwellau_dev" \
  maxwellau-web:local
```

## Rollback

Container Apps keeps previous revisions: `az containerapp revision list` then
`az containerapp ingress traffic set` to shift traffic back. Database
migrations follow expand/migrate/contract, so the previous app revision keeps
working against the newer schema during a rollback window.
