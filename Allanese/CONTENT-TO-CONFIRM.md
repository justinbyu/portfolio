# Content to Confirm Before Launch

Everything below is currently a **placeholder** in the prototype. Source: Website Brief §9 (assets/information to request), §10 (launch checklist), §11 (prototype notes).
In the code, each item is marked `<!-- TODO(clinic): … -->`; on the pages, most show a gold **[To confirm]** chip.

## 1. Brand & identity
- [ ] Original high-resolution logo (transparent background) — replaces the temporary "A" text mark in the header, footer and `assets/favicon.svg`
- [ ] Official clinic name / approved brand spelling ("Allanese Medical Aesthetics")
- [ ] Official gold & purple hex codes — paste into the CSS variables at the top of `assets/css/styles.css` (Brief §3 had no extractable values in the .docx)

## 2. Services (currently 6 placeholder treatment areas in `build.py` → `SERVICES`)
- [ ] Confirmed service list — add/remove/rename treatments
- [ ] Approved description, suitability, preparation and risk wording per service
- [ ] Prices, if they will be displayed (none shown in the prototype)
- [ ] Any treatments that must **not** be advertised (e.g. prescription-only restrictions)
- [ ] Verify every medical claim with the clinic — prototype copy deliberately makes no outcome promises

## 3. People
- [ ] Doctor/staff names, roles and **verified** qualifications (`team.html` claims none until confirmed)
- [ ] Approved team photos + permission to publish

## 4. Photography
- [ ] Approved clinic interior, staff and treatment photos — replace all files in `assets/images/` (currently AI-generated illustrative images)
- [ ] Before-and-after images **only** with informed patient permission and appropriate safeguards (none in the prototype)

## 5. Contact & location (footer, `contact.html`, home/book sidebars)
- [ ] Official street address + Google Maps pin (then embed the map in `contact.html`)
- [ ] Phone number, email address
- [ ] Opening hours
- [ ] Official Facebook / Instagram (and any other) profile URLs — currently `href="#"`
- [ ] Parking / directions / landmark notes if wanted

## 6. Booking workflow (Brief §7 — **must do before launch**)
- [ ] Choose: existing booking provider **or** secure custom backend (validation, spam protection, staff notification, minimal data)
- [ ] Who receives requests, how appointments are confirmed, what schedule is bookable
- [ ] Test the full notification flow end-to-end
- [ ] Do **not** publish the demo form as if it sends bookings

## 7. Legal / privacy
- [ ] Clinic-approved Privacy Policy wording, privacy contact, retention periods (`privacy.html` is a template)
- [ ] Confirm what the live form collects and who can access it; name any third-party booking/email provider in the policy
- [ ] Check local advertising rules for aesthetic/prescription treatments before publishing service copy

## 8. Technical launch checks (Brief §10)
- [ ] Domain + HTTPS; hosting account ownership (Cloudflare Pages suggested)
- [ ] Canonical URLs, page titles/meta descriptions (drafts included), social preview image, local SEO details
- [ ] Test on phones, tablets, desktop; all links/buttons/form validation
- [ ] Keyboard navigation, contrast, alt text, reduced-motion (implemented — retest after content swaps)
- [ ] Backups/maintenance responsibilities agreed
- [ ] Final client approval of all content

## Suggested phasing (Brief §12)
1. **Phase 1 (this prototype):** public website, responsive design, Motion UI → clinic approval
2. **Phase 2:** connect booking provider or secure appointment-request backend
3. **Phase 3 (optional):** staff dashboard / editable content — patient medical records are out of scope for a basic website and need separate security assessment
