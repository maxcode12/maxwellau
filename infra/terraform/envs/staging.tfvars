environment      = "staging"
site_url         = "https://staging.maxwellau.com"
web_cors_origins = ["https://staging.maxwellau.com"]
min_replicas     = 0
# Container App, image and ACR pull role assignment already exist and have
# propagated (first live deploy: 2026-08-22) — safe to keep true going forward.
enable_acr_pull  = true
