JENNY JOVEN BERIA - ALR STEEL DIGITAL CARD - EDIT GUIDE
========================================================================

Theme: MARKETING EDITION - light frosted glass, bold hero headline,
blurred work imagery fixed behind everything, sticky full-bleed gallery.
No TAPIND branding on the card — fully white-labelled for ALR Steel.

FOLDER STRUCTURE (all separated):
- index.html        = main card page (name, bio, links)
- style.css         = all design / colors (edit :root variables to recolor)
- script.js         = carousel, save contact, share, NFC (edit CONFIG at top)
- payment.js        = payment page buttons (open GCash/BDO app, save QR)
- images/alr-logo.png = ALR company logo (footer, print card, favicons)
- images/my-photo.png = YOUR profile photo
- images/work-1.jpg   = Stair railings
- images/work-2.jpg   = Kitchen worktables
- images/work-3.jpg   = Range hoods
- favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png = app icons (from ALR logo)
- contact.html + contact.js = Save Contact page (phone/email options, vCard downloads)
- gcash.html, bdo.html = payment pages (add QR at images/gcash-qr.png, images/bdo-qr.png)
- print-card.html   = printable paper card (bank-card size)

HOW TO EDIT:
1. NAME / TITLE / BIO: open index.html, edit <h1>, .profile-title-chip, .profile-bio
2. COLORS: open style.css, edit the :root variables (--accent, --bg, --card...)
3. PHOTO: replace images/my-photo.png (keep same filename)
   BG PHOTO: the blurred backdrop uses images/work-2.jpg (see .bg-fixed in style.css)
4. WORK PHOTOS: replace images/work-1.jpg, work-2.jpg, work-3.jpg
5. SOCIAL LINKS: in index.html, swap Instagram/Facebook/TikTok URLs + handles
6. SERVICES: in index.html, edit the .service-row blocks
7. SAVE CONTACT INFO: edit CONFIG in script.js AND CONTACT in contact.js
   (phone + email must match in both files so the card and contact page agree)

PREVIEW: double-click index.html, or use VS Code + Live Server.
PUT ONLINE: upload this whole folder to GitHub Pages / Netlify / Vercel.
