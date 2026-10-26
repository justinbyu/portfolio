# TapAsul Client ID Redirect Website

**Tap. Connect. Grow.** A complete, lightweight Cloudflare Workers + D1 implementation for sending a cardholder from a single Client ID input to the digital business card assigned to that ID.

> This repository contains source code and deployment instructions only. It has **not** been deployed to Cloudflare. You must create your own Cloudflare account, D1 database, admin token, and domain.

## Features

- Customer page at `/` with exactly one input: **Client ID**.
- Client-side and server-side ID validation; IDs are case-sensitive and accept 1–32 ASCII letters, digits, `_`, or `-`.
- `GET /r/:id` looks up the ID in D1 and returns an HTTP 302 only for active routes. Unknown, malformed, disabled, or operational-error cases get branded error pages instead of redirects.
- `/admin.html` management dashboard to list, add/upsert, edit, activate/disable, and delete mappings.
- `ADMIN_TOKEN` bearer authentication on every admin API endpoint; no token is embedded in public source or persisted in browser storage.
- Parameterized SQL, server-side field validation, defensive URL checks, safe DOM rendering, security headers, and no permissive CORS.
- Cloudflare Workers Static Assets hosts the pages; Worker code handles API and redirect paths; D1 stores routes.

## Project structure

```text
TapAsul_ID_Redirect_Website/
├── public/
│   ├── _headers
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
├── worker/
│   ├── index.js
│   └── schema.sql
├── tests/
│   └── worker.test.js
├── .dev.vars.example
├── .gitignore
├── package.json
├── wrangler.toml
└── README.md
```

## Requirements

- Windows 10/11 and VS Code (steps below assume Windows PowerShell).
- Node.js **22 or newer** (use a current LTS release), including npm. Current Wrangler releases require Node.js 22+. Install from [nodejs.org](https://nodejs.org/).
- A Cloudflare account. A Cloudflare-managed zone is needed for a Cloudflare custom domain.
- Your own domain is optional; `workers.dev` can be used for initial testing.

## Local development on Windows

1. **Install Node.js LTS.** Download and install the LTS release from [nodejs.org](https://nodejs.org/), then restart VS Code. In VS Code, open **Terminal → New Terminal** and verify:
   ```powershell
   node --version
   npm --version
   ```
2. **Open the project folder** `TapAsul_ID_Redirect_Website` in VS Code.
3. **Install the project tools** (Wrangler is a development dependency):
   ```powershell
   npm install
   ```
   You can also invoke Wrangler with `npx wrangler`; no global installation is needed.
4. **Create a local D1 database** by running the schema. Wrangler's local D1 is separate from the production database:
   ```powershell
   npx wrangler d1 execute tapasul-routes --local --file=worker/schema.sql
   ```
   The configured `database_name` is `tapasul-routes`. If your local Wrangler version prompts about the placeholder database ID, first create the real database as in the Cloudflare setup steps below and replace the placeholder ID in `wrangler.toml`.
5. **Configure a local admin secret.** Copy the example file and replace the value with a long, random value used only for local testing:
   ```powershell
   Copy-Item .dev.vars.example .dev.vars
   ```
   Edit `.dev.vars` in VS Code. It is git-ignored. Do not reuse the production token.
6. **Run the site locally:**
   ```powershell
   npm run dev
   ```
   Open the local URL printed by Wrangler (usually `http://localhost:8787`).
7. **Create a test route.** Open `/admin.html`, enter the local `ADMIN_TOKEN`, and save e.g.:
   - Client ID: `42`
   - Client name: `Example Business`
   - Destination: `https://example.com/card` (use a real destination you control for a real redirect test)
   - Status: `Active`
8. **Test it** by entering `42` on `/`, or visit `/r/42`. The browser should redirect to the saved destination. Check unknown ID, disabled route, and invalid formats as described under [Testing](#testing).

### Local tests

```powershell
npm test
```

These Node tests use a small in-memory D1 mock to exercise Worker endpoint behavior. They do not replace a Cloudflare deployment or a live D1 integration test.

## Cloudflare setup and deployment

### 1. Authenticate Wrangler

From the project folder:

```powershell
npx wrangler login
```

A browser opens for Cloudflare authorization. For CLI details, see [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/).

### 2. Create the D1 database and bind it

```powershell
npx wrangler d1 create tapasul-routes
```

Cloudflare prints a database ID and may offer to update your configuration. If it does not, open `wrangler.toml` and replace the all-zero `database_id` placeholder with the exact `database_id` printed by Wrangler. Keep these values consistent:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tapasul-routes"
database_id = "PASTE_YOUR_REAL_DATABASE_ID_HERE"
```

The all-zero UUID in the starter file is only a syntactically valid placeholder, not a real database. Do not deploy before replacing it. The Worker uses this binding as `env.DB`.

Cloudflare's current D1 getting-started guide: [developers.cloudflare.com/d1/get-started](https://developers.cloudflare.com/d1/get-started/).

### 3. Initialize both local and production D1

For local development:

```powershell
npx wrangler d1 execute tapasul-routes --local --file=worker/schema.sql
```

For the Cloudflare-hosted database:

```powershell
npx wrangler d1 execute tapasul-routes --remote --file=worker/schema.sql
```

Review the command output and confirm the schema applied. The project schema is `worker/schema.sql` and creates the required `routes` table and `idx_routes_status` index.

### 4. Set the production administrator secret

First deploy the Worker (next step), then set the secret on that deployed Worker:

```powershell
npx wrangler secret put ADMIN_TOKEN
```

Enter a strong, unique random value at the prompt. Do not put production secrets in `wrangler.toml`, JavaScript, HTML, a committed `.env`, or a command-line argument. Wrangler prompts securely and stores it as a Worker secret. For future rotation, run the same `secret put` command and enter the new token; then update your secure password manager entry and sign in with the new token. Revoke/replace any token that may have been exposed.

For local development only, use `.dev.vars` as described above. Never commit it.

### 5. Deploy

After the D1 binding ID is updated and the remote schema is applied:

```powershell
npx wrangler deploy
```

Wrangler publishes the Worker and `public/` static assets. It prints the `workers.dev` URL; use the actual URL it reports. The first deployment may temporarily have admin endpoints unavailable until `ADMIN_TOKEN` is set. After setting the token, Wrangler updates the deployment. Test `/api/health`, `/admin.html`, and `/` on your actual URL.

Cloudflare documents the static asset/Worker combination at [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) and its [configuration and bindings](https://developers.cloudflare.com/workers/static-assets/binding/).

### 6. Add a production route

Visit your deployed `/admin.html`, sign in with the production `ADMIN_TOKEN`, and create a Client ID mapping. Use a destination URL you administer or have permission to route visitors to. Open `/r/<ClientID>` to verify it redirects.

### 7. Optional custom domain, DNS, and TLS

1. Add your domain to Cloudflare and complete the nameserver/domain onboarding steps shown in Cloudflare. Do not guess DNS records or copy another account's values.
2. In Cloudflare Dashboard, open **Workers & Pages → your Worker → Settings → Domains & Routes → Add → Custom Domain** and enter the exact hostname you want, for example `cards.yourdomain.com`. Or follow Cloudflare's current [Custom Domains guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
3. Cloudflare creates the DNS record and provisions the required certificate for a Worker Custom Domain. Do not point the hostname at an invented origin IP. Verify the hostname appears as active and test HTTPS before sharing it.
4. If the root and `www` hosts should both work, configure both separately or create a Cloudflare redirect for one to the other; a custom domain only matches its configured hostname.
5. In **SSL/TLS**, leave the zone in a secure mode appropriate to your overall configuration. For a Worker Custom Domain, Cloudflare handles the edge certificate; if your site also has a separate origin, use Full (strict) when that origin supports a valid certificate. Avoid insecure Flexible SSL for ordinary origin-backed sites.

### Useful commands

```powershell
npm run dev
npm test
npx wrangler d1 execute tapasul-routes --local --file=worker/schema.sql
npx wrangler d1 execute tapasul-routes --remote --file=worker/schema.sql
npx wrangler secret put ADMIN_TOKEN
npx wrangler deploy
```

## API reference

All API responses are JSON except redirect/error pages. API routes are same-origin; the application does not enable wildcard CORS.

| Method and path | Authentication | Behavior |
|---|---|---|
| `GET /api/health` | None | Returns `{ "ok": true, "service": "TapAsul", ... }`. Confirms the Worker is running, not that D1 has been queried. |
| `GET /api/admin/routes` | Bearer token | Lists all routes. |
| `POST /api/admin/routes` | Bearer token | Creates or upserts a route. Body: `{ "id":"42", "client_name":"Example", "destination_url":"https://example.com/card", "status":"active" }`. |
| `DELETE /api/admin/routes/:id` | Bearer token | Deletes a route; returns 404 if it does not exist. |
| `GET /r/:id` | None | 302 to the saved destination only if the route exists and is active. |

Admin calls use `Authorization: Bearer <ADMIN_TOKEN>`. The public website never accepts a destination URL and cannot change route mappings.

### Validation behavior

- Client ID is case-sensitive, 1–32 characters, ASCII letters/digits/hyphen/underscore only.
- Client label is text up to 120 characters.
- Status must be `active` or `disabled`.
- Destination URL must be an absolute HTTP(S) URL, no user/password, maximum 2,048 characters; localhost and common private/local IP ranges are blocked. URL validation is server-side on save and again before redirect.
- SQL statements use bound parameters. Conflict on an existing ID updates the mapping and `updated_at` while preserving `created_at`.

## Testing

- [ ] `/` shows TapAsul branding, tagline, one Client ID input, and one Continue button; no other visitor fields.
- [ ] Submit with Enter and with Continue.
- [ ] Active ID redirects to its D1 destination.
- [ ] Unknown ID shows a clear not-found page and does not redirect.
- [ ] Disabled ID shows an inactive-card page and does not redirect.
- [ ] Blank, spaces, slash, punctuation, and >32-character IDs are rejected.
- [ ] `GET /api/admin/routes` without a token and with a wrong token returns 401.
- [ ] Admin can create/upsert, edit, disable, refresh, and delete a route; refresh confirms persistence.
- [ ] Invalid schemes (e.g. `javascript:`), malformed URLs, URLs with embedded credentials, and localhost destinations are rejected.
- [ ] An unauthenticated public visitor cannot create or modify route mappings.
- [ ] Search public files for `ADMIN_TOKEN`: no real secret should appear.
- [ ] Confirm the app and redirects on the deployed URL and, if configured, custom HTTPS domain.

Use `npm test` for the included offline Worker tests, then also test the real D1 and deployment manually; no Cloudflare account or deployment is available from this source package.

## Security and operational notes

- **Shared bearer token limits:** anyone who obtains the token has full route-management access; there are no individual accounts, roles, or attribution. The dashboard keeps the token only in page memory and clears it on logout, but browser extensions, compromised devices, and XSS can still expose it. Protect `/admin.html` with Cloudflare Access (allow only named administrators), use a unique high-entropy token, and rotate it after staff changes or suspected exposure. For stronger identity, replace the shared token with Cloudflare Access JWT validation or a proper authenticated admin system.
- **Admin API is enforced server-side.** Hiding `/admin.html` is not security; every management endpoint checks the bearer token.
- **Rate limiting:** configure Cloudflare WAF/rate-limiting rules for public `/r/*` and `/api/health`, and tighter limits for `/api/admin/*`. Consider Access or another edge policy for admin paths. Keep an eye on D1 request limits and logs.
- **Redirect destinations:** this is an administrator-controlled redirect service. Validate business ownership/authorization for each destination. Consider an administrator-managed domain allowlist if your operational needs permit it. Do not let customers submit destination URLs.
- **Headers:** static-page headers are configured in `public/_headers`; Worker JSON and redirect responses set security/no-cache headers. The branded error page includes a small inline style protected by a restrictive response CSP.
- **Backups and auditability:** before adding analytics, audit logs, multi-admin access, QR/NFC provisioning, expiry, or subscriptions, design retention, privacy, and access controls deliberately.

## Documentation links

- [Cloudflare D1 getting started](https://developers.cloudflare.com/d1/get-started/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static Assets configuration and bindings](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/)
