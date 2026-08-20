# Data layer: PostgreSQL Flexible Server, Storage Account (blobs + queue).

variable "project" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "tags" { type = map(string) }
variable "key_vault_id" { type = string }
variable "postgres_sku" { type = string }
variable "postgres_storage_mb" { type = number }
variable "postgres_admin_login" { type = string }
variable "web_cors_origins" { type = list(string) }
variable "allowed_client_ip_ranges" {
  type = list(object({
    name     = string
    start_ip = string
    end_ip   = string
  }))
}

# ---------------------------------------------------------------------------
# PostgreSQL Flexible Server
# ---------------------------------------------------------------------------

resource "random_password" "postgres_admin" {
  length  = 32
  special = false
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-${var.project}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  version  = "16"
  sku_name = var.postgres_sku

  storage_mb        = var.postgres_storage_mb
  auto_grow_enabled = true

  administrator_login    = var.postgres_admin_login
  administrator_password = random_password.postgres_admin.result

  backup_retention_days        = var.environment == "prod" ? 14 : 7
  geo_redundant_backup_enabled = false

  # Public access + firewall rules keeps MVP cost down (no VNet/private DNS).
  # Revisit with a private endpoint if compliance needs demand it (Phase 14).
  public_network_access_enabled = true

  zone = "1"

  tags = var.tags

  lifecycle {
    ignore_changes = [zone]
  }
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = "maxwellau"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Container Apps egress uses Azure public IPs; this service-level rule allows
# Azure services through the firewall. Tighten in Phase 14 if VNet integration
# is adopted.
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "admin_clients" {
  for_each = { for range in var.allowed_client_ip_ranges : range.name => range }

  name             = each.value.name
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = each.value.start_ip
  end_ip_address   = each.value.end_ip
}

resource "azurerm_key_vault_secret" "database_url" {
  name = "database-url"
  value = format(
    "postgresql://%s:%s@%s:5432/%s?sslmode=require",
    var.postgres_admin_login,
    random_password.postgres_admin.result,
    azurerm_postgresql_flexible_server.main.fqdn,
    azurerm_postgresql_flexible_server_database.app.name,
  )
  key_vault_id = var.key_vault_id
}

# ---------------------------------------------------------------------------
# Storage: blobs for media, queue for publishing jobs
# ---------------------------------------------------------------------------

resource "azurerm_storage_account" "main" {
  # Storage account names: 3-24 lowercase alphanumerics, globally unique.
  name                = "st${var.project}${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  min_tls_version          = "TLS1_2"

  # Never permanent public write; public READ is per-container below.
  allow_nested_items_to_be_public = true

  blob_properties {
    # CORS scoped to exactly what direct-to-Blob upload needs.
    cors_rule {
      allowed_origins    = var.web_cors_origins
      allowed_methods    = ["PUT", "OPTIONS"]
      allowed_headers    = ["content-type", "x-ms-blob-type", "x-ms-blob-content-type", "x-ms-version"]
      exposed_headers    = ["etag"]
      max_age_in_seconds = 3600
    }

    delete_retention_policy {
      days = var.environment == "prod" ? 30 : 7
    }
  }

  tags = var.tags
}

# Private container: originals uploaded by admins; served via SAS or copied to
# the public container on publication.
resource "azurerm_storage_container" "media" {
  name                  = "media"
  storage_account_id    = azurerm_storage_account.main.id
  container_access_type = "private"
}

# Public-read container for published website media.
resource "azurerm_storage_container" "public_media" {
  name                  = "public-media"
  storage_account_id    = azurerm_storage_account.main.id
  container_access_type = "blob"
}

resource "azurerm_storage_queue" "publishing" {
  name                 = "publishing-jobs"
  storage_account_name = azurerm_storage_account.main.name
}

# Lifecycle: originals cool after 90 days; archive after a year. Published
# public media stays hot.
resource "azurerm_storage_management_policy" "lifecycle" {
  storage_account_id = azurerm_storage_account.main.id

  rule {
    name    = "cool-then-archive-originals"
    enabled = true
    filters {
      prefix_match = ["media/"]
      blob_types   = ["blockBlob"]
    }
    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than    = 90
        tier_to_archive_after_days_since_modification_greater_than = 365
      }
    }
  }
}

output "database_url_secret_name" { value = azurerm_key_vault_secret.database_url.name }
output "storage_account_name" { value = azurerm_storage_account.main.name }
output "storage_account_id" { value = azurerm_storage_account.main.id }
