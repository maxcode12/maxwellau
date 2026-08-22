output "resource_group" {
  value = azurerm_resource_group.main.name
}

output "web_fqdn" {
  description = "Default Container Apps hostname — test here before any DNS change."
  value       = module.web.web_fqdn
}

output "storage_account_name" {
  value = module.data.storage_account_name
}

output "acr_login_server" {
  description = "docker build/push target for this environment's image."
  value       = module.core.acr_login_server
}
