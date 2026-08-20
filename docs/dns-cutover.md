# maxwellau.com — GoDaddy DNS cutover runbook (Phase 13)

**Do not change production DNS until the Azure production endpoint has been
deployed and verified.** Every step here is deliberate and reversible; nothing
is bulk-replaced.

## 0. Preconditions

- [ ] Production Container App is live and healthy on its default
      `*.azurecontainerapps.io` FQDN (home page, admin login, booking, media).
- [ ] `NEXT_PUBLIC_SITE_URL=https://maxwellau.com` is set on the prod app.
- [ ] A maintenance window is agreed (DNS TTLs mean up to 48h of propagation).

## 1. Inventory the existing zone (before touching anything)

In GoDaddy → DNS Management for maxwellau.com, export/record **every** record:
type, name, value, TTL. Save the inventory to `docs/dns-inventory-<date>.md`
(not committed if it contains private mail hosts — keep it with the owner).

Pay particular attention to:

- **MX** records (email delivery) — these must survive untouched.
- **TXT** records: SPF (`v=spf1 …`), DKIM (`*._domainkey`), DMARC
  (`_dmarc`), and any site-verification records.
- Existing A/AAAA/CNAME for `@` and `www` (the ones being replaced).

## 2. Add Azure domain verification

For each hostname (`maxwellau.com`, `www.maxwellau.com`):

```bash
az containerapp hostname add --hostname maxwellau.com \
  --name ca-maxwellau-web-prod --resource-group rg-maxwellau-prod
```

Azure returns a verification id. In GoDaddy add:

| Type | Name | Value |
| --- | --- | --- |
| TXT | `asuid` | `<verification id>` |
| TXT | `asuid.www` | `<verification id>` |

These records are additive — they change nothing about live traffic.

## 3. Point the hostnames

- `www` → **CNAME** to the Container App FQDN
  (`ca-maxwellau-web-prod.<env-id>.azurecontainerapps.io`).
- Apex `maxwellau.com` → GoDaddy does not support CNAME at the apex; use an
  **A record** to the Container Apps environment's static inbound IP
  (`az containerapp env show … --query properties.staticIp`). Keep the old
  A value in the inventory for instant rollback.

Lower TTLs to 600s a day in advance if possible.

## 4. Bind managed certificates

```bash
az containerapp hostname bind --hostname maxwellau.com ...
az containerapp hostname bind --hostname www.maxwellau.com ...
```

Wait for the managed certificate to issue; verify with
`curl -vI https://maxwellau.com` (valid chain, no warnings).

## 5. Canonical host and redirect

Decision: **`maxwellau.com` is canonical**; `www` 308-redirects to the apex
(already emitted by the app when the Host header is `www.maxwellau.com` — the
canonical URL metadata and sitemap all use the apex).

## 6. Validate

- [ ] `https://maxwellau.com` loads with valid TLS from an external network.
- [ ] `http://maxwellau.com` redirects to HTTPS.
- [ ] `https://www.maxwellau.com` behaves as designed.
- [ ] `/api/health` reports `database: true`.
- [ ] Send AND receive a test email on the ministry's existing addresses —
      confirms MX/SPF/DKIM survived.
- [ ] `dig +short maxwellau.com` / `dig MX maxwellau.com` from two networks.

## 7. Record the final state

Append the final record set and the date to the DNS inventory, and note the
cutover in `PLAN.md` Phase 13.

## Rollback

Restore the previous `@` A record and `www` value from the inventory. The
Azure TXT records can stay — they are inert.
