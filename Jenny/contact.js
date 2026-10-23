/* =====================================
   ALR STEEL — SAVE CONTACT PAGE
   Contact details live in:
   1. contact.html (visible text + tel/mailto links)
   2. The 3 static .vcf files (actual downloads)
   3. CONFIG in script.js (share text)
   Keep all three in sync.
===================================== */

// Set to true ONLY by the preview builder to demo the banner.
// The real contact.js shipped in the zip keeps this false.
const FORCE_INAPP_DEMO = false;

/* ---------- Platform detection ----------
   - iOS in-app browsers (Messenger/IG/TikTok) BLOCK downloads
     -> show the "Open in Safari" guide.
   - Android downloads fine everywhere, but always asks
     Save File -> Open File (system behavior, can't skip)
     -> show the 2-tap guide instead. */

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

const inappBanner = document.getElementById("inappBanner");
const inappTitle = document.getElementById("inappTitle");
const inappText = document.getElementById("inappText");
const androidHint = document.getElementById("androidHint");

if (IS_ANDROID && androidHint) {
  // Android: downloads work, just needs the 2-tap flow
  androidHint.hidden = false;
} else if (INAPP_NAME && inappBanner) {
  // iOS in-app browser: downloads blocked, must open in Safari
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

/* ---------- Save buttons ----------
   These are plain file links, so capable browsers download
   them natively. JS only adds status messages. */

const contactStatus = document.getElementById("contactStatus");

function setStatus(message) {
  if (contactStatus) contactStatus.textContent = message;
}

function activeGuide() {
  if (IS_ANDROID) return androidHint;
  if (INAPP_NAME) return inappBanner;
  return null;
}

function bindSaveButton(id) {
  const button = document.getElementById(id);
  if (!button) return;

  button.addEventListener("click", () => {
    const guide = activeGuide();

    if (IS_ANDROID) {
      setStatus("File downloading — tap Save File, then Open File to add it to Contacts.");
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
    copyText("0977 116 4273", "Number copied — paste it into your contacts app.");
  });
}

if (copyEmail) {
  copyEmail.addEventListener("click", () => {
    copyText("alr_kitssa@yahoo.com", "Email copied — paste it into your contacts app.");
  });
}

/* ---------- 1-Tap Direct Save (Android only) ----------
   Tries to open the system's "Create contact" screen with
   everything prefilled — no download dialog at all.
   Uses a hidden iframe so unsupported browsers fail
   silently, and the download buttons below still work. */

const DIRECT_SAVE_INTENT =
  "intent:#Intent;action=android.intent.action.INSERT;" +
  "type=vnd.android.cursor.dir/contact" +
  ";S.name=" + encodeURIComponent("Jenny Joven Beria") +
  ";S.company=" + encodeURIComponent("ALR Steel Fabrication and Services OPC") +
  ";S.phone=" + encodeURIComponent("0977 116 4273") +
  ";S.email=" + encodeURIComponent("alr_kitssa@yahoo.com") +
  ";end";

const directSave = document.getElementById("directSave");

if (directSave) {
  directSave.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.style.display = "none";
    frame.src = DIRECT_SAVE_INTENT;
    document.body.appendChild(frame);
    setTimeout(() => frame.remove(), 3000);
    setStatus("Opening your Contacts app\u2026 if nothing opens, use Save File below, then Open File.");
  });
}
