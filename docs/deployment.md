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

Staging was provisioned this way on 2026-08-22; the same sequence applies to
prod.

1. Bootstrap the Terraform state backend (see `infra/terraform/README.md`).
2. `terraform apply -var-file=envs/<env>.tfvars`. First apply for a fresh
   environment creates ~21 resources including PostgreSQL (~4 min) — expect
   the whole apply to take 8-12 minutes.
3. **Grant yourself Key Vault access.** RBAC-authorization vaults start with
   nobody able to write secrets, including the identity running Terraform —
   `modules/core/main.tf` grants the deploying principal "Key Vault Secrets
   Officer" plus a 45s propagation wait via `time_sleep`, but this only
   happens on `terraform apply`, so the *first* apply's Key Vault secret
   writes will 403 before the role has been created. Symptom:
   `ForbiddenByRbac` on `azurerm_key_vault_secret`. Fix: re-run apply — it's
   additive and resumable, and the second run succeeds once the role from
   the first run has propagated.
4. **Push the first image and point the Container App at it.** Terraform
   deliberately does NOT configure the Container App's `registry` block —
   Container Apps validates registry credentials against the app's own
   SystemAssigned identity at revision-creation time, but that identity does
   not exist until the app itself is created. Configuring it in the same
   apply as the app is a chicken-and-egg that times out the revision after
   ~20 minutes (`ContainerAppOperationError: Operation expired`). Sequence
   instead:
   ```bash
   az acr login --name acr<project><env>
   docker build -f apps/web/Dockerfile -t acr<project><env>.azurecr.io/maxwellau-web:latest .
   docker push acr<project><env>.azurecr.io/maxwellau-web:latest
   ```
   Then configure the registry + image. `az containerapp registry set`
   intermittently fails with a spurious `ContainerAppSecretRefNotFound` even
   when the referenced secret plainly exists (observed on az-cli 2.81) — if
   it does, fall back to a direct ARM PUT: `az containerapp show -o json`,
   splice `properties.configuration.registries = [{server, identity:
   "System"}]` and the new `image` into the JSON, strip any top-level fields
   the target API version rejects (seen: `identitySettings`, `runtime`,
   `cooldownPeriod`/`pollingInterval` under `scale` — bump `api-version` to
   `2025-01-01` rather than stripping further), then
   `az rest --method put --url ".../containerApps/<name>?api-version=2025-01-01" --body @update.json`.
   This is a **one-time bootstrap per environment** — once `registries` is
   set, ordinary `az containerapp update --image ...` calls (what CD does)
   never need to touch it again.
5. **Run the database migration and bootstrap one real admin.** The
   PostgreSQL firewall only allows Azure-internal traffic by default
   (`allow-azure-services`); add a temporary rule for your own IP, run
   `prisma migrate deploy`, bootstrap an admin with
   `npx tsx prisma/bootstrap-admin.ts <email>` (prints a one-time generated
   password — save it immediately, it is never stored anywhere else; this is
   distinct from `prisma/seed.ts`, which refuses to run against anything
   that isn't `localhost`/`127.0.0.1`), then remove the temporary firewall
   rule.
6. Add the CD repository secrets (see above); run the CD workflow
   (`workflow_dispatch`) for subsequent deploys.
7. Verify: home page, `/api/health` (`database: true`), admin login, media
   upload, booking flow, logs in Application Insights.
8. Repeat for prod. **Do not** touch DNS until staging and the prod FQDN have
   both been verified — the cutover runbook is `docs/dns-cutover.md`.

### Other Azure CLI quirks hit during setup

- `az role assignment create` returned `MissingSubscription` for every
  invocation on this tenant regardless of flags — root cause unconfirmed, but
  a direct `az rest --method put` against
  `.../providers/Microsoft.Authorization/roleAssignments/<new-guid>?api-version=2022-04-01`
  with the same role/principal/scope worked immediately. Terraform's
  `azurerm_role_assignment` resource is unaffected (it talks to the same REST
  API directly, not through this CLI subcommand).
- Prefer `ARM_ACCESS_KEY` (a storage account key) over
  `use_azuread_auth = true` for the Terraform state backend unless the
  deploying identity already has `Storage Blob Data Contributor` on the state
  storage account — granting it hits the same broken CLI command above.

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
