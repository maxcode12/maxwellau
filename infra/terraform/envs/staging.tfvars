environment      = "staging"
# Promoted to serve production traffic on maxwellau.com (2026-08-27) — no
# separate prod environment yet, see docs/deployment.md.
site_url         = "https://maxwellau.com"
web_cors_origins = ["https://maxwellau.com", "https://www.maxwellau.com"]
min_replicas     = 0
# Container App, image and ACR pull role assignment already exist and have
# propagated (first live deploy: 2026-08-22) — safe to keep true going forward.
enable_acr_pull  = true
