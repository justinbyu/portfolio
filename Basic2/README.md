# TAPIND digital card

A phone taps the NFC chip and opens this page. The chip stores a link, not the QR or the design.

The card matches a clean white phone card: profile, three socials, one niche, three pictures, then GCash and BDO. Account numbers are not shown.

## Open in VS Code

1. File → Open Folder, and choose this `digital-card` folder.
2. Install **Live Server** if VS Code asks.
3. Right-click `index.html` → **Open with Live Server**.

## Edit your details

Open `js/config.js`. That is the only file you need to change.

## Payments

GCash and BDO are rows on the card. Each opens its own page:

- `gcash.html`
- `bdo.html`

Each page has the QR and two buttons:

1. **Save the QR** — downloads the QR image.
2. **Go to GCash app** / **Go to BDO app** — opens that app on a phone.

Android opens the installed app (GCash `com.globe.gcash.android`, BDO Online `ph.com.bdo.retail`). If the app is missing, it opens the store. On iPhone, GCash tries `gcash://`, then the App Store. BDO opens the App Store page, which shows Open if the app is already installed.

The QR on a fresh sample is not a real payment code. Replace it before anyone pays you:

1. In GCash, open your receive QR and save the image.
2. Put it in this folder as `images/gcash-qr.png`.
3. In `js/config.js`, set that payment’s `qrImage` to `"images/gcash-qr.png"`.
4. Do the same for BDO with `images/bdo-qr.png`.

Or paste the text encoded in the QR into `qrPayload`. Leave `qrImage` empty if you use the text.

## NFC

1. Host this folder so the page has an `https://` address.
2. Paste that address into `publicUrl`.
3. Print `print-card.html` at 100% scale and stick a blank NTAG213 on the dashed circle.
4. Write the link. Android Chrome: Card owner → Write to NFC card. iPhone: NFC Tools → Write → URL → paste the link.
