/* =====================================
   TAPIND BASIC DIGITAL CARD
   Editable personal information
===================================== */

const CONFIG = {
  name: "Justin Diaz",
  title: "CEO & Founder",
  organization: "TAPIND",
  phone: "", // Add your phone number
  email: "", // Add your email
  website: "https://tapind.ph",

  // Paste the public https link of this page after you host the folder.
  // Example: "https://justinbyu.github.io/portfolio/Basic1/index.html"
  publicUrl: ""
};

/* =====================================
   CLIENT SLIDES — electric glass card
   Photos, names, and prices live in menu.js
===================================== */

const slides = Array.isArray(window.SLIDES) ? window.SLIDES : [];
const client = window.CLIENT || { name: "", currency: "$" };
const menuImage = document.getElementById("menuImage");
const menuCaptionName = document.getElementById("menuItemName");
const menuCaptionPrice = document.getElementById("menuItemPrice");
const pngFallback = document.getElementById("pngFallback");
const previousButton = document.getElementById("previousSlide");
const nextButton = document.getElementById("nextSlide");
const orderNow = document.getElementById("orderNow");
const slideBar = document.getElementById("slideBar");
const savePicture = document.getElementById("savePicture");
const savePictureMessage = document.getElementById("savePictureMessage");
const menuPng = document.getElementById("menuPng");
const slideCount = document.getElementById("slideCount");
const glassBadge = document.getElementById("glassBadge");

let slideIndex = 0;

function money(value) {
  const currency = client.currency || "$";
  if (value == null || String(value).trim() === "") return "Ask";
  const text = String(value).trim();
  if (text.charAt(0) === currency) return text;
  return currency + text;
}

function fileName(name) {
  const base = String(name || "picture").trim().replace(/\s+/g, "-").replace(/[^\w\-]/g, "") || "picture";
  return base + ".jpg";
}

function currentItem() {
  if (!slides.length) return null;
  return slides[(slideIndex + slides.length) % slides.length];
}

function dealEnded(item) {
  if (!item || !item.endsAt) return false;
  const parts = String(item.endsAt).split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1] || 0);
  if (!Number.isFinite(hour)) return false;
  const now = new Date();
  return now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute);
}

function liveDeal() {
  return slides.find((item) => item.promo && !item.soldOut && !dealEnded(item)) || null;
}

function orderHref(item) {
  const price = money(item && item.price);
  const query = [
    "item=" + encodeURIComponent((item && item.name) || ""),
    "price=" + encodeURIComponent(price),
    item && item.was ? "was=" + encodeURIComponent(money(item.was)) : "",
    item && item.promo ? "promo=" + encodeURIComponent(item.promo) : "",
    item && item.ends ? "ends=" + encodeURIComponent(item.ends) : "",
    item && item.addOn ? "addOn=" + encodeURIComponent(item.addOn) : "",
    item && item.addOnPrice ? "addOnPrice=" + encodeURIComponent(money(item.addOnPrice)) : ""
  ].filter(Boolean).join("&");
  const site = String(client.storeUrl || "").trim();
  if (/^https:\/\//i.test(site)) {
    return site + (site.indexOf("?") === -1 ? "?" : "&") + query;
  }
  return "store.html?" + query;
}

function paintBar() {
  if (!slideBar) return;
  slideBar.querySelectorAll("button").forEach((button, index) => {
    const on = index === slideIndex;
    button.classList.toggle("on", on);
    if (on) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
}

function showSlide() {
  const item = currentItem();
  if (!item || !menuImage) return;

  const price = money(item.price);
  const was = item.was ? money(item.was) : "";
  const number = String(slideIndex + 1).padStart(2, "0");
  const total = String(slides.length).padStart(2, "0");
  const menuWas = document.getElementById("menuWas");

  menuImage.style.display = "";
  menuImage.src = item.image || "";
  menuImage.alt = item.name || "Slide";
  if (menuCaptionName) menuCaptionName.textContent = item.name || "Slide";
  if (menuCaptionPrice) menuCaptionPrice.textContent = price;
  if (menuWas) {
    menuWas.hidden = !was;
    menuWas.textContent = was;
  }
  if (pngFallback) pngFallback.hidden = true;
  if (slideCount) slideCount.textContent = number + " / " + total;
  const ended = dealEnded(item);
  const dealRibbon = document.getElementById("dealRibbon");
  const flipSave = document.getElementById("flipSave");
  const flipAdd = document.getElementById("flipAdd");
  const dealStrip = document.getElementById("dealStrip");
  const offer = liveDeal();

  if (dealRibbon) {
    dealRibbon.hidden = !item.promo;
    dealRibbon.textContent = ended ? "Deal ended" : [item.promo, item.ends].filter(Boolean).join(" · ");
  }
  if (flipSave) {
    flipSave.hidden = !item.saveNote;
    flipSave.textContent = item.saveNote || "";
  }
  if (flipAdd) {
    flipAdd.hidden = !item.addOn;
    flipAdd.textContent = item.addOn ? item.addOn + (item.addOnPrice ? " · " + money(item.addOnPrice) : "") : "";
  }
  if (dealStrip) {
    if (offer) {
      dealStrip.hidden = false;
      dealStrip.textContent = [offer.promo, offer.name, money(offer.price), offer.ends].filter(Boolean).join(" · ");
    } else {
      dealStrip.hidden = true;
    }
  }
  if (glassBadge) glassBadge.textContent = item.promo || ("Slide " + number);
  const flipName = document.getElementById("flipName");
  const flipDetail = document.getElementById("flipDetail");
  const flipPrice = document.getElementById("flipPrice");
  const flipCard = document.getElementById("flipCard");
  if (flipName) flipName.textContent = item.name || "Slide";
  if (flipPrice) flipPrice.textContent = price;
  if (flipDetail) flipDetail.textContent = item.detail || item.ends || "Tap the picture to flip it back.";
  if (flipCard) flipCard.classList.remove("is-flipped");

  if (orderNow) {
    const sold = Boolean(item.soldOut) || ended;
    orderNow.setAttribute("aria-disabled", sold ? "true" : "false");
    orderNow.classList.toggle("is-sold", sold);
    orderNow.textContent = ended ? "DEAL ENDED" : item.promo ? "ORDER THE DEAL" : sold ? "SOLD OUT" : "ORDER NOW";
    orderNow.href = sold ? "#menuSketch" : orderHref(item);
  }

  paintBar();
  if (savePictureMessage) savePictureMessage.textContent = "";
}

function step(delta) {
  if (!slides.length) return;
  slideIndex = (slideIndex + delta + slides.length) % slides.length;
  showSlide();
}

if (menuImage) {
  menuImage.addEventListener("error", () => {
    menuImage.style.display = "none";
    if (pngFallback) pngFallback.hidden = false;
  });
}

if (previousButton) previousButton.addEventListener("click", () => step(-1));
if (nextButton) nextButton.addEventListener("click", () => step(1));

if (slideBar) {
  slideBar.innerHTML = slides.map((_, index) => {
    return '<button type="button" data-go="' + index + '" aria-label="Slide ' + (index + 1) + '"></button>';
  }).join("");
  slideBar.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    slideIndex = Number(button.dataset.go) || 0;
    showSlide();
  });
}

const dealStrip = document.getElementById("dealStrip");
if (dealStrip) {
  dealStrip.addEventListener("click", () => {
    const index = slides.findIndex((item) => item.promo && !dealEnded(item));
    if (index < 0) return;
    slideIndex = index;
    showSlide();
  });
}

if (orderNow) {
  orderNow.addEventListener("click", (event) => {
    if (orderNow.classList.contains("is-sold")) event.preventDefault();
  });
}

if (menuPng) {
  let drag = null;
  let ignoreClick = false;
  let trackpadLock = false;

  menuPng.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { menuPng.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
  });

  menuPng.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) && event.cancelable) {
      event.preventDefault();
    }
  });

  menuPng.addEventListener("pointerup", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag = null;
    if (Math.abs(dx) >= 24 && Math.abs(dx) > Math.abs(dy)) {
      ignoreClick = true;
      step(dx > 0 ? -1 : 1);
      window.setTimeout(() => { ignoreClick = false; }, 500);
    }
  });

  menuPng.addEventListener("pointercancel", (event) => {
    if (drag && event.pointerId === drag.id) drag = null;
  });

  menuPng.addEventListener("click", (event) => {
    if (ignoreClick || event.target.closest(".png-save")) return;
    const card = document.getElementById("flipCard");
    if (card) card.classList.toggle("is-flipped");
  });

  menuPng.addEventListener("dragstart", (event) => event.preventDefault());

  menuPng.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaX) < 18 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    if (trackpadLock) return;
    trackpadLock = true;
    step(event.deltaX > 0 ? 1 : -1);
    window.setTimeout(() => { trackpadLock = false; }, 450);
  }, { passive: false });
}

document.addEventListener("keydown", (event) => {
  if (event.target && /INPUT|TEXTAREA/.test(event.target.tagName)) return;
  if (event.key === "ArrowRight") step(1);
  if (event.key === "ArrowLeft") step(-1);
});

async function saveCurrentPicture() {
  const item = currentItem();
  const src = item && item.image;

  if (!src || (pngFallback && !pngFallback.hidden)) {
    if (savePictureMessage) savePictureMessage.textContent = "This slide has no picture yet.";
    return;
  }

  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error("missing");
    const blob = await response.blob();
    const name = fileName(item.name);
    const file = new File([blob], name, { type: blob.type || "image/jpeg" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: item.name || "Slide" });
      if (savePictureMessage) savePictureMessage.textContent = "Picture ready to save.";
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
    if (savePictureMessage) savePictureMessage.textContent = "Picture saved to your downloads.";
  } catch (error) {
    if (savePictureMessage) savePictureMessage.textContent = "Could not save this picture.";
  }
}

if (savePicture) savePicture.addEventListener("click", saveCurrentPicture);
if (menuImage && slides.length) showSlide();

/* =====================================
   CONTACT — socials from menu.js
===================================== */

function escapeText(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}

const socialList = document.getElementById("socialList");
const foodTagline = document.getElementById("foodTagline");
if (foodTagline && client.tagline) foodTagline.textContent = client.tagline;

const bizLogo = document.getElementById("bizLogo");
const bizMark = document.getElementById("bizMark");
const bizName = document.getElementById("bizName");
if (bizName && client.name) bizName.textContent = client.name;
if (bizLogo) {
  if (client.logo) bizLogo.src = client.logo;
  bizLogo.alt = (client.name || "Business") + " logo";
  bizLogo.addEventListener("error", () => {
    bizLogo.hidden = true;
    if (bizMark) {
      const letters = String(client.name || "B").trim().split(/\s+/).filter(Boolean);
      bizMark.textContent = (letters.length > 1 ? letters[0][0] + letters[1][0] : letters[0].slice(0, 2)).toUpperCase();
      bizMark.hidden = false;
    }
  });
}
if (socialList) {
  socialList.innerHTML = (client.socials || []).filter((social) => social.href).map((social) => {
    return '<a class="glass-method" href="' + escapeText(social.href) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="method-mark">' + escapeText(social.mark || "@") + "</span>" +
      "<span><strong>" + escapeText(social.name) + "</strong><small>Social</small></span>" +
      '<span class="method-arrow">↗</span></a>';
  }).join("");
}

/* =====================================
   FLIP THE PICTURE ONLY
   It stays inside the frame. It cannot leave the section.
===================================== */



/* =====================================
   SAVE CONTACT AS VCARD
===================================== */

const saveButton = document.getElementById("saveContact");
const saveMessage = document.getElementById("saveMessage");

function escapeVCard(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function createVCard() {
  const fields = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(CONFIG.name)}`,
    `ORG:${escapeVCard(CONFIG.organization)}`,
    `TITLE:${escapeVCard(CONFIG.title)}`
  ];

  if (CONFIG.phone.trim()) {
    fields.push(`TEL;TYPE=CELL:${escapeVCard(CONFIG.phone)}`);
  }

  if (CONFIG.email.trim()) {
    fields.push(`EMAIL:${escapeVCard(CONFIG.email)}`);
  }

  if (CONFIG.website.trim()) {
    fields.push(`URL:${escapeVCard(CONFIG.website)}`);
  }

  fields.push("END:VCARD");

  return fields.join("\r\n") + "\r\n";
}

if (saveButton) {
  saveButton.addEventListener("click", () => {
    const vcard = createVCard();

    const file = new Blob([vcard], {
      type: "text/vcard;charset=utf-8"
    });

    const downloadURL = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = downloadURL;
    link.download = "Justin-Diaz-TAPIND.vcf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);

    if (saveMessage) {
      saveMessage.textContent =
        "Contact file downloaded. Open it to save the contact.";
      saveMessage.setAttribute("role", "status");
    }
  });
}

/* =====================================
   WEEKLY CODE AND SPIN WHEEL
===================================== */

const marketing = window.MARKETING || {};
const prizeList = (marketing.prizes || []).filter((prize) => prize && prize.label);

function weekNumber(date) {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil((((copy - yearStart) / 86400000) + 1) / 7);
}

function weeklyCode() {
  const prefix = String(marketing.weekPrefix || client.name || "STORE").replace(/\s+/g, "").toUpperCase();
  return prefix + "-W" + String(weekNumber(new Date())).padStart(2, "0");
}

function inLunchRush() {
  const hour = new Date().getHours();
  const start = Number(marketing.lunchStart);
  const end = Number(marketing.lunchEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  return hour >= start && hour < end;
}

const weekCodeEl = document.getElementById("weekCode");
const code = weeklyCode();
if (weekCodeEl) weekCodeEl.textContent = "This week's code · " + code + (inLunchRush() ? " · Lunch rush" : "");

function paintWheel() {
  const wheel = document.getElementById("wheel");
  if (!wheel || !prizeList.length) return;
  const colors = [
    { bg: "#f2d31b", ink: "#172033" },
    { bg: "#12343a", ink: "#ffffff" },
    { bg: "#8ef7ff", ink: "#172033" },
    { bg: "#1a120c", ink: "#ffffff" },
    { bg: "#e7f0ff", ink: "#172033" },
    { bg: "#0c3f86", ink: "#ffffff" }
  ];
  const slice = 360 / prizeList.length;
  const stops = prizeList.map((prize, index) => {
    const color = colors[index % colors.length].bg;
    return color + " " + (index * slice) + "deg " + ((index + 1) * slice) + "deg";
  }).join(", ");
  wheel.style.background = "conic-gradient(from " + (-slice / 2) + "deg, " + stops + ")";
  wheel.innerHTML = prizeList.map((prize, index) => {
    const ink = colors[index % colors.length].ink;
    return '<span style="color:' + ink + ";transform:rotate(" + (index * slice) + 'deg)">' + escapeText(prize.label) + "</span>";
  }).join("");
}

function pickPrize() {
  const total = prizeList.reduce((sum, prize) => sum + (Number(prize.weight) || 1), 0);
  let roll = Math.random() * total;
  for (let index = 0; index < prizeList.length; index += 1) {
    roll -= Number(prizeList[index].weight) || 1;
    if (roll <= 0) return index;
  }
  return prizeList.length - 1;
}

paintWheel();

const spinButton = document.getElementById("spinButton");
const spinResult = document.getElementById("spinResult");
const wheel = document.getElementById("wheel");
const spinKey = "spin-" + new Date().toISOString().slice(0, 10);

function showSpin(label, already) {
  if (!spinResult) return;
  spinResult.textContent = (already ? "Already spun today. " : "") + label + ". Code " + code + ".";
}

try {
  const savedSpin = localStorage.getItem(spinKey);
  if (savedSpin) showSpin(savedSpin, true);
} catch (error) {
  /* ignore */
}

let wheelAngle = 0;
let wheelSpinning = false;

function spinWheel() {
  if (!wheel || !prizeList.length || wheelSpinning) return;
  try {
    const saved = localStorage.getItem(spinKey);
    if (saved) {
      showSpin(saved, true);
      return;
    }
  } catch (error) {
    /* allow the spin if storage is blocked */
  }
  const index = pickPrize();
  const slice = 360 / prizeList.length;
  const target = (360 - (index * slice) % 360) % 360;
  const current = ((wheelAngle % 360) + 360) % 360;
  let delta = target - current;
  if (delta < 0) delta += 360;
  wheelAngle += (5 * 360) + delta;
  wheelSpinning = true;
  wheel.style.transform = "rotate(" + wheelAngle + "deg)";
  if (spinButton) spinButton.disabled = true;
  window.setTimeout(() => {
    const label = prizeList[index].label;
    try { localStorage.setItem(spinKey, label); } catch (error) { /* ignore */ }
    showSpin(label, false);
    wheelSpinning = false;
    if (spinButton) spinButton.disabled = false;
  }, 4200);
}

if (spinButton && wheel && prizeList.length) {
  spinButton.addEventListener("click", spinWheel);
}

const wheelWrap = document.querySelector(".wheel-wrap");
if (wheelWrap && wheel && prizeList.length) {
  let flick = null;
  wheelWrap.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a")) return;
    flick = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { wheelWrap.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
  });
  wheelWrap.addEventListener("pointerup", (event) => {
    if (!flick || event.pointerId !== flick.id) return;
    const dx = event.clientX - flick.x;
    const dy = event.clientY - flick.y;
    flick = null;
    if (Math.abs(dx) >= 24 || Math.abs(dy) >= 24) spinWheel();
  });
  wheelWrap.addEventListener("pointercancel", () => { flick = null; });
}

/* =====================================
   FOOTER YEAR
===================================== */

const year = document.getElementById("currentYear");
if (year) year.textContent = new Date().getFullYear();

/* =====================================
   NFC — chip stores the public link only
===================================== */

const urlText = document.getElementById("publicUrlText");
const copyLink = document.getElementById("copyLink");
const writeNfc = document.getElementById("writeNfc");
const nfcStatus = document.getElementById("nfcStatus");

function publicUrl() {
  const value = (CONFIG.publicUrl || "").trim();
  if (/^https:\/\//i.test(value)) return value;
  return "";
}

if (urlText) {
  urlText.textContent = publicUrl() || "No public link yet. Set publicUrl in script.js";
}

if (copyLink) {
  copyLink.addEventListener("click", async () => {
    const url = publicUrl();
    if (!url) {
      if (nfcStatus) nfcStatus.textContent = "Add an https link to publicUrl first.";
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      if (nfcStatus) nfcStatus.textContent = "Link copied.";
    } catch (error) {
      if (nfcStatus) nfcStatus.textContent = "Could not copy. Select the link manually.";
    }
  });
}

function nfcError(error) {
  const name = error && error.name;
  if (name === "NotAllowedError") return "NFC was blocked. Allow it in Chrome, then try again.";
  if (name === "NotSupportedError") return "This browser cannot write NFC. Use the NFC Tools app.";
  if (name === "AbortError") return "Write cancelled.";
  return "Could not write the chip. Paste the link into NFC Tools instead.";
}

if (writeNfc) {
  writeNfc.addEventListener("click", async () => {
    const url = publicUrl();
    if (!url) {
      if (nfcStatus) nfcStatus.textContent = "The chip needs an https link. Host this folder, then paste it into publicUrl.";
      return;
    }
    if (!("NDEFReader" in window)) {
      if (nfcStatus) nfcStatus.textContent = "This browser cannot write NFC. On iPhone, use NFC Tools and paste the link.";
      return;
    }
    if (nfcStatus) nfcStatus.textContent = "Hold a blank NTAG213 sticker to the back of the phone…";
    try {
      const ndef = new NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: url }] });
      if (nfcStatus) nfcStatus.textContent = "Saved. Tap the card with a phone to open this page.";
    } catch (error) {
      if (nfcStatus) nfcStatus.textContent = nfcError(error);
    }
  });
}
