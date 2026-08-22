variable "environment" {
  description = "Deployment environment: dev, staging or prod."
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region. Canada Central suits the ministry's Ontario base."
  type        = string
  default     = "canadacentral"
}

variable "postgres_sku" {
  description = "PostgreSQL Flexible Server SKU. Burstable B1ms is the low-cost MVP tier."
  type        = string
  default     = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB. 32768 (32GB) is the flexible-server minimum."
  type        = number
  default     = 32768
}

variable "postgres_admin_login" {
  description = "PostgreSQL administrator login name (never the password — that is generated and stored in Key Vault)."
  type        = string
  default     = "maxwellau_admin"
}

variable "allowed_client_ip_ranges" {
  description = "CIDR ranges allowed through the PostgreSQL firewall for administration. Empty for none."
  type = list(object({
    name     = string
    start_ip = string
    end_ip   = string
  }))
  default = []
}

variable "web_cors_origins" {
  description = "Origins allowed to make direct-to-Blob uploads (the admin site origin only)."
  type        = list(string)
}

variable "container_image" {
  description = "Fully-qualified container image for the web app (set by CD; a placeholder for the first apply)."
  type        = string
  default     = "mcr.microsoft.com/k8se/quickstart:latest"
}

variable "min_replicas" {
  description = "Container App minimum replicas. 0 enables scale-to-zero (dev/staging)."
  type        = number
  default     = 0
}

variable "max_replicas" {
  description = "Container App maximum replicas."
  type        = number
  default     = 2
}

variable "site_url" {
  description = "Canonical public origin for this environment (e.g. https://maxwellau.com)."
  type        = string
}

variable "enable_acr_pull" {
  description = "Set true on a follow-up apply once the Container App and its acr_pull role assignment already exist — see docs/deployment.md for why this can't be true on the first apply."
  type        = bool
  default     = false
}
