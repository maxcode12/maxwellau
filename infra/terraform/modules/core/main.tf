# Core observability and secrets: Log Analytics, Application Insights, Key Vault.

variable "project" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "tags" { type = map(string) }

data "azurerm_client_config" "current" {}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  # Minimum retention keeps cost down; raise for prod when there is a need.
  retention_in_days = var.environment == "prod" ? 90 : 30
  tags              = var.tags
}

resource "azurerm_application_insights" "main" {
  name                = "appi-${var.project}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  tags                = var.tags
}

resource "azurerm_key_vault" "main" {
  name                = "kv-${var.project}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # RBAC authorisation (not access policies) so Managed Identities get
  # least-privilege roles like "Key Vault Secrets User".
  rbac_authorization_enabled = true
  purge_protection_enabled   = var.environment == "prod"

  tags = var.tags
}

resource "azurerm_key_vault_secret" "app_insights_connection" {
  name         = "appinsights-connection-string"
  value        = azurerm_application_insights.main.connection_string
  key_vault_id = azurerm_key_vault.main.id
}

output "key_vault_id" { value = azurerm_key_vault.main.id }
output "log_analytics_workspace_id" { value = azurerm_log_analytics_workspace.main.id }
output "app_insights_connection_secret_name" { value = azurerm_key_vault_secret.app_insights_connection.name }
