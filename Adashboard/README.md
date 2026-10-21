# Allanese Clinic Ops — Dashboard (Phase 1–4 prototype)

An interactive prototype of the **staff dashboard** specified in
*"Dashboard Features & Implementation Plan.pdf"* (Google Drive → **Allanese Website** folder),
built for **Allanese Medical Aesthetics**.

> Zero dependencies — plain Node.js on the server, vanilla ES-module JS on the client.

## Run

```bash
cd allanese-dashboard
node server.js          # http://localhost:3000   (set PORT=xxxx to change)
```

**Sign in:** any valid email works (try **admin@allanese.clinic** — click *Use demo account*).
The OTP arrives instantly in the in-app **demo inbox** (envelope icon / auto-opened drawer).

## What's implemented

| Plan section | Status |
|---|---|
| 2.1 Calendar & booking (day/week/month, filters, double-booking locks, rescheduling) | ✅ |
| 2.2 Decision & approval rules (accept/decline + note, auto-confirm, audit log) | ✅ |
| 2.3 Passwordless OTP auth (expiry, attempt caps, rate limits, server-side verify) | ✅ |
| 3. Design system (Pastel Lavender & Champagne Gold, Playfair/Inter, WCAG AA, motion UI) | ✅ |
| 4. Brevo email automation (300/day quota, 70/85/95% alerts, OTP reserve <10%, dedup) | ✅ |
| 5. Layout & UI specs (rounded cards, soft lavender shadows, fade-rise motion, reduced-motion) | ✅ |
| 6. Booking workflow (submission → availability → routing → persistence → email → audit) | ✅ |
| 7. Security & compliance posture (RBAC-shaped sessions, HTTPS-ready, audit trails, consent note) | ✅ (prototype-level) |
| 8. Phased roadmap — Phase 1–4 features | ✅ |
| 9. Configurable business rules (approval mode, hours, lead time, cancellation window) | ✅ |
| 10. Suggested stack (frontend / backend API / DB / email / workers) | ✅ JSON store + mock provider |
| 5-phase Analytics (Phase 5) | ⏳ not in this prototype |

## Sections

- **Overview** — KPI cards, pending approvals (accept/decline inline), alerts, recent audit activity
- **Calendar** — day / week / month, status filter pills, click empty slot → new booking, click event → manage
- **Appointments** — search + filters, full workflow (accept, decline with note, reschedule, cancel, complete)
- **Clients** — directory, profiles, care notes, appointment history
- **Services & Email** — service menu CRUD + Brevo quota tiles, threshold meter, email log, simulate batch, reset quota
- **Settings** (gear) — approval mode, auto-confirm treatments, business hours, lead time, cancellation window, roster

## Server-side rules (all enforced for real)

- Overlapping slot for the same practitioner → **409** with the clashing booking code
- Outside business hours / closed day → **400**
- Inside the lead-time window → **400** (`leadTimeHours`, default 2)
- Auto-confirm only when mode = *auto* **and** the service is eligible
- Late cancellations flagged against `cancellationWindowHours`
- OTP: 5-min expiry, 5 attempts, 10-s cooldown, 5 codes/hour
- Every mutation writes an immutable audit entry

## Plugging in the real Brevo API

`lib/brevo.js` is the **only** file to change. Replace `deliver`-level logic in `send()` with:

```
POST https://api.brevo.com/v3/smtp/email
headers: { 'api-key': process.env.BREVO_API_KEY }
```

Keep the same return contract (`{status: 'sent'|'failed'|'held'|'duplicate', alerts: []}`) and all
callers (OTP, booking workflow, reminders, alerts) work unchanged. Set quota limits/thresholds at
the top of the file.

## Notes / limits (per the website brief)

- Prototype data only — JSON file store at `data/db.json`; **POST /api/demo/reset** restores seed data.
- Emails are simulated in-app; no real mail leaves this machine.
- Not production security: add HTTPS, real RBAC accounts, secrets management, backups before launch.
- No clinical/medical-records data — care notes are operational only (see brief §7).
- Client-facing website is **Phase 1 of the brief** and is a separate deliverable.

## Layout

```
server.js            HTTP server: static + REST API (zero deps)
lib/db.js            JSON datastore, seed data, wall-time helpers, audit writer
lib/otp.js           OTP issue/verify + sessions + rate limits
lib/brevo.js         MOCK Brevo client — quota, alerts, dedup, OTP reserve
public/index.html    SPA shell (login + app)
public/css/styles.css design system
public/js/           api, ui toolkit, app shell/router, booking modals
public/js/views/     overview · calendar · appointments · clients · services · settings
```
