# Web tier: Container Apps environment + app with system-assigned Managed
# Identity, Key Vault secret references and least-privilege storage roles.

variable "project" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "tags" { type = map(string) }
variable "container_image" { type = string }
variable "min_replicas" { type = number }
variable "max_replicas" { type = number }
variable "key_vault_id" { type = string }
variable "log_analytics_workspace_id" { type = string }
variable "app_insights_connection_name" { type = string }
variable "database_url_secret_name" { type = string }
variable "storage_account_name" { type = string }
variable "storage_account_id" { type = string }
variable "site_url" { type = string }

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${var.project}-${var.environment}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = var.log_analytics_workspace_id
  tags                       = var.tags
}

resource "azurerm_container_app" "web" {
  name                         = "ca-${var.project}-web-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type = "SystemAssigned"
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  # Secrets are Key Vault REFERENCES resolved by the app's Managed Identity —
  # no secret value ever passes through Terraform state for the app config.
  secret {
    name                = "database-url"
    key_vault_secret_id = "${trimsuffix(data.azurerm_key_vault.main.vault_uri, "/")}/secrets/${var.database_url_secret_name}"
    identity            = "System"
  }

  secret {
    name                = "appinsights-connection"
    key_vault_secret_id = "${trimsuffix(data.azurerm_key_vault.main.vault_uri, "/")}/secrets/${var.app_insights_connection_name}"
    identity            = "System"
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "web"
      image  = var.container_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "NEXT_PUBLIC_SITE_URL"
        value = var.site_url
      }
      env {
        name  = "NEXT_PUBLIC_SAMPLE_CONTENT"
        value = var.environment == "prod" ? "off" : "on"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        secret_name = "appinsights-connection"
      }
      env {
        name  = "AZURE_STORAGE_ACCOUNT"
        value = var.storage_account_name
      }

      liveness_probe {
        path      = "/api/health"
        port      = 3000
        transport = "HTTP"
      }
      readiness_probe {
        path      = "/api/health"
        port      = 3000
        transport = "HTTP"
      }
    }
  }

  lifecycle {
    # CD updates the image; Terraform must not fight it.
    ignore_changes = [template[0].container[0].image]
  }
}

data "azurerm_key_vault" "main" {
  name                = element(split("/", var.key_vault_id), length(split("/", var.key_vault_id)) - 1)
  resource_group_name = var.resource_group_name
}

# Least-privilege data-plane roles for the app's Managed Identity.
resource "azurerm_role_assignment" "kv_secrets" {
  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_container_app.web.identity[0].principal_id
}

resource "azurerm_role_assignment" "blob_contributor" {
  scope                = var.storage_account_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_container_app.web.identity[0].principal_id
}

# Needed to mint user-delegation SAS for direct browser uploads.
resource "azurerm_role_assignment" "blob_delegator" {
  scope                = var.storage_account_id
  role_definition_name = "Storage Blob Delegator"
  principal_id         = azurerm_container_app.web.identity[0].principal_id
}

resource "azurerm_role_assignment" "queue_contributor" {
  scope                = var.storage_account_id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_container_app.web.identity[0].principal_id
}

output "web_fqdn" { value = azurerm_container_app.web.ingress[0].fqdn }
output "web_principal_id" { value = azurerm_container_app.web.identity[0].principal_id }
