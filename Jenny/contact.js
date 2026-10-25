/* =====================================
   ALR STEEL — SAVE CONTACT PAGE
   Contact details live in:
   1. contact.html (visible text + tel/mailto links)
   2. CONTACT below (copy buttons)
   3. The 3 static .vcf files (the downloads)
   4. CONFIG in script.js (share text)
   Keep all four in sync.

   NOTE: Android direct-save intents were tried and
   removed — Messenger's browser errors on them
   (ERR_UNKNOWN_URL_SCHEME). Plain .vcf downloads are
   the proven path: Save File -> Open File -> Contacts.
===================================== */

const CONTACT = {
  name: "Jenny Joven Beria",
  organization: "ALR Steel Fabrication and Services OPC",
  phoneDisplay: "09933234360",
  email: "alr_kitssa@yahoo.com"
};

// Set to true ONLY by the preview builder to demo every state.
// The real contact.js shipped in the zip keeps this false.
const FORCE_INAPP_DEMO = false;

/* ---------- Platform detection ----------
   - Android: downloads work everywhere here; the only
     wrinkle is the 2-tap Save File -> Open File flow,
     so Android gets a short guide for it.
   - iPhone: .vcf links open the contact preview directly.
     But iOS in-app browsers block downloads entirely,
     so those get the "Open in Safari" guide. */

function detectInApp() {
  const ua = navigator.userAgent || "";

  if (/messenger/i.test(ua)) return "Messenger";
  if (/instagram/i.test(ua)) return "Instagram";
  if (/tiktok|musical_ly|bytedance/i.test(ua)) return "TikTok";
  if (/fban|fbav|fb_iab/i.test(ua)) return "Facebook";
  if (/twitter/i.test(ua)) return "X (Twitter)";
  if (/linkedin/i.test(ua)) return "LinkedIn";
  if (/snapchat/i.test(ua)) return "Snapchat";
  if (/pinterest/i.test(ua)) return "Pinterest";
  if (/micromessenger/i.test(ua)) return "WeChat";
  if (/line\//i.test(ua)) return "LINE";
  if (/viber/i.test(ua)) return "Viber";
  if (/;\s*wv\)/i.test(ua)) return "your app"; // generic Android webview

  // Manual test: open contact.html?inapp=1 in any browser
  if (/[?&](inapp|demo)=1/i.test(window.location.search)) return "demo app";

  return null; // real browser — downloads work fine
}

function detectAndroid() {
  // Manual test: open contact.html?os=android in any browser
  if (/[?&]os=android/i.test(window.location.search)) return true;
  return /android/i.test(navigator.userAgent || "");
}

const IS_ANDROID = !FORCE_INAPP_DEMO && detectAndroid();
const INAPP_NAME = FORCE_INAPP_DEMO ? "Messenger" : detectInApp();

function systemBrowser() {
  const ua = navigator.userAgent || "";
  if (/iphone|ipad|ipod/i.test(ua)) return "Safari";
  if (/android/i.test(ua)) return "Chrome";
  return "your browser";
}

const contactStatus = document.getElementById("contactStatus");

function setStatus(message) {
  if (contactStatus) contactStatus.textContent = message;
}

/* ---------- Guides ---------- */

const inappBanner = document.getElementById("inappBanner");
const inappTitle = document.getElementById("inappTitle");
const inappText = document.getElementById("inappText");
const androidHint = document.getElementById("androidHint");

if (IS_ANDROID && androidHint) {
  androidHint.hidden = false;
} else if (INAPP_NAME && inappBanner) {
  inappBanner.hidden = false;
  if (inappTitle) {
    inappTitle.textContent = "You're viewing this inside " + INAPP_NAME;
  }
  if (inappText) {
    inappText.textContent =
      "In-app browsers often block contact downloads. Tap \u22EF at the top " +
      "of the screen \u2192 \u201COpen in " + systemBrowser() + "\u201D, " +
      "then tap Save again. Tip: Call Now, Write Email and Copy work right here.";
  }
}

function activeGuide() {
  if (IS_ANDROID) return androidHint;
  if (INAPP_NAME) return inappBanner;
  return null;
}

/* ---------- Save buttons ----------
   Plain file links — the browser handles the download
   natively on every platform. JS only adds guidance. */

function bindSaveButton(id) {
  const button = document.getElementById(id);
  if (!button) return;

  button.addEventListener("click", () => {
    const guide = activeGuide();

    if (IS_ANDROID) {
      setStatus("File downloading — tap Save File, then Open File to import it into Contacts.");
    } else if (INAPP_NAME) {
      setStatus(
        "If nothing downloads, open this page in " + systemBrowser() +
        " (tap \u22EF above) and try again."
      );
    } else {
      setStatus("Contact file downloading. Open it to save the contact.");
    }

    if (guide) {
      guide.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

bindSaveButton("savePhone");
bindSaveButton("saveEmail");
bindSaveButton("saveBoth");

/* ---------- Copy fallbacks (work inside every app) ---------- */

async function copyText(text, doneMessage) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(doneMessage);
    return;
  } catch (error) {
    // Older webviews: hidden-textarea fallback
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      setStatus(doneMessage);
    } catch (fallbackError) {
      setStatus("Copy failed — long-press the details above to copy them.");
    }
  }
}

const copyPhone = document.getElementById("copyPhone");
const copyEmail = document.getElementById("copyEmail");

if (copyPhone) {
  copyPhone.addEventListener("click", () => {
    copyText(CONTACT.phoneDisplay, "Number copied — paste it into your contacts app.");
  });
}

if (copyEmail) {
  copyEmail.addEventListener("click", () => {
    copyText(CONTACT.email, "Email copied — paste it into your contacts app.");
  });
}
