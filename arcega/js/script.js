/* ==========================================================================
   SAVE TO CONTACTS  (.vcf)  —  cross-platform fix
   --------------------------------------------------------------------------
   WHY THE OLD CODE FAILED
   1. It navigated to a `data:text/vcard,...` URL. Android Chrome has blocked
      top-frame navigation to `data:` URLs since Chrome 60 (2017), so on an
      Android phone the tap did literally nothing.
   2. iPhone Safari is unreliable with `data:text/vcard` too, and it silently
      fails inside in-app browsers (Instagram / Facebook / Messenger / TikTok),
      which is where most people open a link-in-bio card.
   3. The button was `<a href="javascript:void(0)" onclick="...">`. If the
      script did not run (or a WebView blocked `javascript:` URLs) there was no
      real link left to fall back on.

   HOW IT WORKS NOW
   The button is a normal link to a real file ->  King_Arcega.vcf
   The file is served by GitHub Pages, and the OS handles it natively:
     • iPhone / iPad Safari  -> opens the contact preview, tap "Create New Contact"
     • Android Chrome        -> downloads the .vcf, open it to add the contact
   This script only *enhances* that: it adds a helper sheet when the page is
   opened inside an app that cannot open .vcf files at all.
   ========================================================================== */

(function () {
  'use strict';

  var VCARD_FILE = 'King_Arcega.vcf'; // sits next to index.html

  var DETAILS = {
    name: 'King Arcega',
    title: 'Affiliate Marketing Creator',
    business: 'theshop101.ph',
    email: 'theshop101.ph@gmail.com',
    address: '55 G Marcelo Street, Maysan, Valenzuela City, Metro Manila, Philippines',
    tiktok: 'https://www.tiktok.com/@theshop101ph',
    facebook: 'https://www.facebook.com/share/1Cko11JjHw/',
    instagram: 'https://www.instagram.com/theshop101.ph'
  };

  /* ---------------------------------------------------------------- helpers */

  var ua = navigator.userAgent || '';

  function isIOS() {
    return /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isAndroid() {
    return /Android/i.test(ua);
  }

  // Instagram, Facebook, Messenger, TikTok, WeChat, LINE, Snapchat, Pinterest,
  // LinkedIn, X/Twitter, Google app, and generic Android WebViews ("; wv)").
  // None of these can hand a .vcf download to the Contacts app.
  function isInAppBrowser() {
    return /(FBAN|FBAV|FB_IAB|Instagram|Messenger|musical_ly|BytedanceWebview|TikTok|MicroMessenger|Line\/|Snapchat|Pinterest|LinkedInApp|Twitter|GSA\/|; wv\))/i.test(ua);
  }

  // On iOS every in-app browser / WebView hides the "Safari" token
  // (Chrome, Firefox and Edge on iOS all keep it), so this catches the rest.
  function isIOSWebView() {
    return isIOS() && !/Safari\//i.test(ua);
  }

  function el(id) {
    return document.getElementById(id);
  }

  /* ------------------------------------------------------------------ toast */

  var toastTimer = null;

  function showToast(message, ms) {
    var toast = el('cardToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, ms || 4200);
  }

  /* ------------------------------------------------------- helper sheet */

  function openHelpSheet() {
    var sheet = el('contactHelp');
    if (!sheet) return;
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    var copyBtn = el('copyContactBtn');
    if (copyBtn && copyBtn.focus) {
      setTimeout(function () { copyBtn.focus(); }, 260);
    }
  }

  function closeHelpSheet() {
    var sheet = el('contactHelp');
    if (!sheet) return;
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function plainTextCard() {
    return [
      DETAILS.name,
      DETAILS.title + ' — ' + DETAILS.business,
      'Email: ' + DETAILS.email,
      'Address: ' + DETAILS.address,
      'TikTok: ' + DETAILS.tiktok,
      'Facebook: ' + DETAILS.facebook,
      'Instagram: ' + DETAILS.instagram
    ].join('\n');
  }

  function copyDetails() {
    var text = plainTextCard();
    var done = function () {
      showToast('Contact details copied ✓');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, legacyCopy);
    } else {
      legacyCopy();
    }

    function legacyCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) { done(); } else { showToast('Long-press the details to copy them'); }
    }
  }

  /* ------------------------------------------------------ save contact flow */

  function handleSaveContact(event) {
    // 1) In-app browsers / WebViews: the .vcf link cannot do anything here,
    //    so explain how to reopen the card in Safari or Chrome.
    if (isInAppBrowser() || isIOSWebView()) {
      event.preventDefault();
      openHelpSheet();
      return;
    }

    // 2) Android: the browser downloads the file natively. We never block that
    //    — we just tell the user where it went and what to do next.
    if (isAndroid()) {
      setTimeout(function () {
        showToast('Contact downloaded — open the file to add it to Contacts.', 6000);
      }, 900);
      return;
    }

    // 3) iOS browsers other than Safari (Chrome, Firefox, Edge, Opera) save the
    //    file instead of opening the contact sheet.
    if (isIOS() && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) {
      setTimeout(function () {
        showToast('Contact downloaded — open it from Files → Downloads.', 6000);
      }, 900);
      return;
    }

    // 4) iPhone Safari and desktop browsers: let the link do its native thing
    //    (contact preview on iOS, .vcf download / Contacts app on desktop).
  }

  /* ------------------------------------------------------------------- init */

  function init() {
    var btn = el('saveContactBtn');
    if (btn) {
      btn.addEventListener('click', handleSaveContact);
    }

    var copyBtn = el('copyContactBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', copyDetails);
    }

    var closers = document.querySelectorAll('[data-close-sheet]');
    for (var i = 0; i < closers.length; i++) {
      closers[i].addEventListener('click', closeHelpSheet);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeHelpSheet();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // exposed for the inline fallback button inside the sheet
  window.copyContactDetails = copyDetails;
  window.closeContactHelp = closeHelpSheet;
})();

/* ==========================================================================
   3D COVER FLOW / COVER RING CAROUSEL
   ========================================================================== */

let currentCover = 1; // Default middle slide active
const totalCovers = 3;

function renderCoverflow() {
  const cards = document.querySelectorAll('.coverflow-card');
  const dots = document.querySelectorAll('.cover-dot');

  cards.forEach((card, idx) => {
    card.classList.remove('center', 'left', 'right');

    if (idx === currentCover) {
      card.classList.add('center');
    } else if (idx === (currentCover - 1 + totalCovers) % totalCovers) {
      card.classList.add('left');
    } else {
      card.classList.add('right');
    }
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentCover);
  });
}

function nextCoverSlide() {
  currentCover = (currentCover + 1) % totalCovers;
  renderCoverflow();
}

function prevCoverSlide() {
  currentCover = (currentCover - 1 + totalCovers) % totalCovers;
  renderCoverflow();
}

function setCoverSlide(idx) {
  currentCover = idx;
  renderCoverflow();
}

// Initialize Coverflow positions
document.addEventListener('DOMContentLoaded', () => {
  renderCoverflow();
});

// Auto-rotate 3D Cover Ring every 4.5 seconds
setInterval(() => {
  nextCoverSlide();
}, 4500);
