environment      = "prod"
site_url         = "https://maxwellau.com"
web_cors_origins = ["https://maxwellau.com", "https://www.maxwellau.com"]
# Keep one warm replica in production so the public site has no cold starts.
min_replicas = 1
max_replicas = 3
