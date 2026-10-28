# Maxwell AU platform — Azure infrastructure.
#
# One configuration, parameterised per environment via envs/<env>.tfvars:
#   terraform init -backend-config=envs/<env>.backend.hcl
#   terraform plan -var-file=envs/<env>.tfvars
#
# Cost posture (CLAUDE.md): the cheapest tiers that meet the MVP — burstable
# PostgreSQL, LRS storage, consumption Container Apps, Storage Queue instead of
# Service Bus. Scale decisions are documented before they are made.

terraform {
  required_version = ">= 1.9"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.11"
    }
  }

  # Remote state in an Azure Storage account, configured per environment:
  #   terraform init -backend-config=envs/<env>.backend.hcl
  backend "azurerm" {}
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}

locals {
  project = "maxwellau"
  tags = {
    project     = local.project
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.project}-${var.environment}"
  location = var.location
  tags     = local.tags
}

module "core" {
  source = "./modules/core"

  project             = local.project
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

module "data" {
  source = "./modules/data"

  project             = local.project
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags

  key_vault_id             = module.core.key_vault_id
  postgres_sku             = var.postgres_sku
  postgres_storage_mb      = var.postgres_storage_mb
  postgres_admin_login     = var.postgres_admin_login
  allowed_client_ip_ranges = var.allowed_client_ip_ranges
  web_cors_origins         = var.web_cors_origins

  # Needs the deployer's Key Vault RBAC (granted inside module.core) to have
  # propagated before it can write the database-url secret.
  depends_on = [module.core]
}

module "web" {
  source = "./modules/web"

  project             = local.project
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags

  container_image              = var.container_image
  min_replicas                 = var.min_replicas
  max_replicas                 = var.max_replicas
  key_vault_id                 = module.core.key_vault_id
  log_analytics_workspace_id   = module.core.log_analytics_workspace_id
  app_insights_connection_name = module.core.app_insights_connection_secret_name
  database_url_secret_name     = module.data.database_url_secret_name
  storage_account_name         = module.data.storage_account_name
  storage_account_id           = module.data.storage_account_id
  site_url                     = var.site_url
  acr_id                       = module.core.acr_id
  acr_login_server             = module.core.acr_login_server
  enable_acr_pull              = var.enable_acr_pull
  smtp_enabled                 = var.smtp_enabled
  smtp_user                    = var.smtp_user
  email_from                   = var.email_from
}
