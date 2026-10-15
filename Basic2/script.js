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
   BUSINESS PHOTO CAROUSEL
===================================== */

const carousel = document.getElementById("businessCarousel");
const previousButton = document.getElementById("previousSlide");
const nextButton = document.getElementById("nextSlide");
const dots = [...document.querySelectorAll(".dot")];

function getSlides() {
  return [...carousel.querySelectorAll(".slide")];
}

function getCurrentSlide() {
  const slides = getSlides();

  if (!slides.length) return 0;

  const slideWidth =
    slides[0].getBoundingClientRect().width + 12;

  return Math.max(
    0,
    Math.min(
      slides.length - 1,
      Math.round(carousel.scrollLeft / slideWidth)
    )
  );
}

function goToSlide(index) {
  const slides = getSlides();

  if (!slides.length) return;

  const safeIndex = Math.max(
    0,
    Math.min(index, slides.length - 1)
  );

  carousel.scrollTo({
    left: slides[safeIndex].offsetLeft - slides[0].offsetLeft,
    behavior: "smooth"
  });

  updateDots(safeIndex);
}

function updateDots(index = getCurrentSlide()) {
  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;

    dot.classList.toggle("active", isActive);

    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

if (carousel && previousButton && nextButton) {
  previousButton.addEventListener("click", () => {
    const current = getCurrentSlide();
    const total = getSlides().length;

    goToSlide(current === 0 ? total - 1 : current - 1);
  });

  nextButton.addEventListener("click", () => {
    const current = getCurrentSlide();
    const total = getSlides().length;

    goToSlide(current >= total - 1 ? 0 : current + 1);
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goToSlide(Number(dot.dataset.slide));
    });
  });

  let scrollFrame;

  carousel.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);

    scrollFrame = requestAnimationFrame(() => {
      updateDots();
    });
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") goToSlide(getCurrentSlide() + 1);
    if (event.key === "ArrowLeft") goToSlide(getCurrentSlide() - 1);
  });
}

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
