# TAPIND digital card

This follows the Basic1 card at `justinbyu.github.io/portfolio/Basic1`, then adds the pieces that page was missing.

## Open in VS Code

1. File → Open Folder, and choose this `digital-card` folder.
2. Right-click `index.html` → Open with Live Server.

Edit your name, phone, email, and the NFC link in `script.js` (`CONFIG`).

## Upgrades

- Favicon, Apple touch icon, and a home-screen icon
- Web app manifest, so a phone can add the card to the home screen
- Share tags for the link preview
- Inter is included, so the type matches even offline
- Save contact and the footer year, which the original script expected
- GCash and BDO pages show a QR only, never an account number
- Each payment page has **Save the QR** and **Go to GCash app** / **Go to BDO app**
- NFC write for a blank NTAG213, under Card owner

## Your photos and QR files

Drop these in `images/` when you have them:

- `profile.jpg` — if this file is missing, the card shows the JD initials
- `niche-1.jpg`, `niche-2.jpg`, `niche-3.jpg` — the three project slides
- `gcash-qr.png` — the receive QR saved from the GCash app
- `bdo-qr.png` — the receive QR from BDO

Do not put account numbers on the card. The QR is the payment.

## NFC

1. Host this folder so `index.html` has an `https://` address.
2. Paste that address into `publicUrl` in `script.js`.
3. On Android Chrome, open Card owner and press Write to NFC card.
4. On iPhone, use NFC Tools: Write → URL → paste the link.
