# Terraform — Maxwell AU Azure infrastructure

## Layout

- `main.tf` — root composition (resource group + core/data/web modules)
- `modules/core` — Log Analytics, Application Insights, Key Vault (RBAC mode)
- `modules/data` — PostgreSQL Flexible Server (burstable), Storage Account
  (media containers + publishing queue + lifecycle rules)
- `modules/web` — Container Apps environment + web app with system-assigned
  Managed Identity, Key Vault secret references and least-privilege roles
- `envs/*.tfvars` — per-environment parameters (dev / staging / prod)

## First-time bootstrap (manual, once)

1. Create the state backend (resource group + storage account + `tfstate`
   container), then copy `envs/dev.backend.hcl.example` to `envs/dev.backend.hcl`.
2. `az login` with an identity that can create resources and role assignments.

## Usage

```bash
terraform init -backend-config=envs/dev.backend.hcl
terraform plan  -var-file=envs/dev.tfvars
terraform apply -var-file=envs/dev.tfvars
```

## Cost notes

- PostgreSQL `B_Standard_B1ms` + 32GB is the smallest flexible-server shape.
- Container Apps scale to zero outside prod; prod keeps one warm replica.
- Storage Queue (not Service Bus) carries publishing jobs — revisit only when a
  feature needs sessions/topics/transactions (ADR 0001).
- No Front Door/CDN until traffic or custom-domain routing justifies it.

## Secrets

Terraform generates the PostgreSQL password (`random_password`) and stores the
connection string directly in Key Vault. The Container App reads it as a Key
Vault *reference* via Managed Identity — secret values never appear in app
configuration or CI logs. Note that generated credentials do live in Terraform
state: keep the state storage account private and RBAC-restricted.
