# Allanese Medical Aesthetics — Website Prototype

Built from `Allanese_Medical_Aesthetics_Website_Brief.docx` (Google Drive → *Allanese Website* folder).
A premium, mobile-friendly static prototype: **Minimalist Luxury Medical Aesthetics UI**, Flat Design 2.0, Motion UI, pastel-lavender-and-gold brand (light purple, per client direction Oct 2026).

> ⚠️ **Prototype, not production.** Services, photos, team profiles and contact details are placeholders until the clinic confirms them. (The logo is now the clinic's official seal, supplied Oct 2026.) The appointment form is a **front-end demo only** — it does not send or store anything. See `CONTENT-TO-CONFIRM.md` for everything that must be replaced/verified before launch (Brief §9–§11).

## Pages (Brief §4)

| File | Page |
|---|---|
| `index.html` | Home — slim header, hero carousel (3 rounded banner slides with peeking edges + pill dots), trust highlights, 'Explore Our Treatments' card grid, care-approach split feature, clinic/team teaser, appointment request, deep-purple footer. UI layout refreshed Oct 2026 in a Coca-Cola-inspired style (centered bold section titles, wide outline pill buttons, white cards on a light grey-lavender canvas) at the client's request; announcement strip removed |
| `services.html` | Services / Treatments — each with description, suitability, preparation, risks, booking CTA |
| `about.html` | About the Clinic — story, care principles, facilities |
| `team.html` | Doctors / Team — placeholder profiles (no credentials claimed until verified) |
| `gallery.html` | Gallery — clinic/treatment photos with lightbox; **no before-and-afters** (consent required) |
| `book.html` | Appointment Request — demo form + how booking works |
| `faqs.html` | FAQs — accessible accordion |
| `contact.html` | Contact / Location — map placeholder until the pin is confirmed |
| `privacy.html` | Privacy Policy — **template** for clinic approval |

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 5173
# then visit http://localhost:5173
```

Deploy by uploading this whole folder to any static host — the brief suggests **Cloudflare Pages** (Brief §8). No build step is required: the `.html` files are final.

## Editing

- **Colors:** the brief's §3 named a palette section but contained no extractable hex codes, so the palette lives in CSS variables at the top of `assets/css/styles.css`. Drop the official values in there — every page updates at once.
  - Current (updated Oct 2026 to the client's **light pastel purple** direction): pastel lavender surfaces `#e7ddf8 / #d3c0f0 / #bda3e2`, soft champagne gold `#c9a86a`, lavender-white background `#fcfafe`. Deeper purples (`#3f2a57`, `#553a74`) are used mainly for text, small pill buttons, and the footer anchor (`#2a1b40`) so copy stays AA-readable on pastel — all text/background pairs were contrast-checked.
- **Page content:** pages are generated from `build.py` so the header, footer, services and FAQs stay consistent. Edit the content data in `build.py`, then run `python3 build.py`. (Or edit the generated HTML directly — just don't do both.)
- **Images:** replace files in `assets/images/` (same filenames) with approved clinic photography.
- **Logo (done, Oct 2026):** the clinic's official circular seal is now used in the header, footer and as favicons. The supplied PNG (1024px) had a baked-in checkerboard, so the seal was cut out with a circular alpha mask into `assets/images/logo.png` (512), `assets/favicon.png` (512), `assets/favicon-32.png` (32) and `assets/apple-touch-icon.png` (180, on white). To swap the artwork later, replace those four files.
- Every placeholder is marked in the code with `<!-- TODO(clinic): … -->` and most have a visible gold **[To confirm]** chip on the page. Search the folder for `TODO(clinic)` for the full list.

## Motion UI (Brief §5 — all implemented in `assets/css/styles.css` + `assets/js/main.js`)

| Requirement | Implementation |
|---|---|
| Hero reveal 600–800ms | `heroRise` keyframes, 700ms, staggered delays |
| Scroll reveal + stagger | `IntersectionObserver`, 90ms stagger per card in a group |
| Button feedback 180–250ms | 220ms lift + colour/shadow transition |
| Image hover 300–500ms | 450ms, gentle `scale(1.045)` zoom |
| Navigation | Smooth colour transitions, sticky header, accessible mobile menu (Esc to close) |
| `prefers-reduced-motion` | Media query disables animation; JS also skips reveal pre-hiding. Content is visible even with JS off |

Accessibility: skip link, semantic landmarks, labelled form fields with inline errors, visible focus rings, alt text, keyboard-operable FAQ accordion / gallery lightbox / menu, checked color contrast for body text.

## Appointment form — before launch (Brief §7)

The form validates locally and shows a clearly-worded **demo** message. Before launch, choose one:

1. Link/embed the clinic's existing booking provider, or
2. Build a secure backend (brief suggests Cloudflare Workers + D1): server-side validation, spam protection, staff notification, minimal data only.

Never collect diagnoses, medical histories or skin photos through this basic form. A patient-records/staff-dashboard system is a separate, security-sensitive phase (Brief §12).

## Launch checklist

Use `CONTENT-TO-CONFIRM.md` — it maps Brief §9 (assets/info to request) and §10 (launch checks) to the exact places in this site.
