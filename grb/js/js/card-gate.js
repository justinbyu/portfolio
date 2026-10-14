/* =====================================================
   TAPIND CARD PAGE GUARD (runs on index.html)

   The digital card is shown only while a verified session
   is present:
   - verify.html hands over a ONE-TIME session token in the
     URL fragment (#t=...). This script takes that token,
     erases it from the address bar and keeps it in memory
     only — it is never stored anywhere.
   - No token (fresh visit, reload, direct link) → back to
     verify.html for a new code.
   - Private card details come from GET /card with the
     session; they are never part of this page's source.
   - The session lives 30 minutes; after that the visitor
     is sent back to verify.html.
===================================================== */
(() => {
  "use strict";

  const API_BASE = "https://tapind-reviews-api.justinriverodiaz.workers.dev";
  const VERIFY_PAGE = "verify.html";
  const SESSION_TTL_MS = 30 * 60 * 1000; // matches SESSION_TTL_SECONDS = 1800 in the Worker
  const TURNSTILE_SITE_KEY = "0x4AAAAAAFSFE6UCdcguhWxE";
  const $ = id => document.getElementById(id);

  // The card should always open at the TOP of the page — never on a scroll
  // position remembered from the verify page.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const cardContent = $("cardContent");
  const loadingCard = $("cardLoading");
  if (!cardContent) return;

  // ---- Take the one-time handoff token, then erase it from the URL ----
  const match = window.location.hash.match(/^#t=(.+)$/);
  const sessionToken = match ? decodeURIComponent(match[1]) : null;
  if (window.location.hash) {
    try {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {
      window.location.hash = "";
    }
  }

  function backToVerify() {
    window.location.replace(`${VERIFY_PAGE}?expired=1`);
  }

  if (!sessionToken) { backToVerify(); return; }

  let turnstileWidgetId = null;
  let relockTimer = null;

  // The Turnstile widget lives inside the (initially hidden) review form,
  // so it cannot auto-render at page load. Render it once the card is up.
  function renderTurnstileWhenReady(attempt = 0) {
    const container = $("turnstileWidget");
    if (!container) return;
    if (turnstileWidgetId !== null) {
      try { window.turnstile?.reset(turnstileWidgetId); } catch { /* fresh below */ }
      return;
    }
    if (window.turnstile?.render) {
      try {
        turnstileWidgetId = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "dark"
        });
      } catch (error) {
        console.warn("[TAPIND card] Turnstile render failed:", error);
      }
      return;
    }
    // Turnstile script is async; retry briefly until it arrives.
    if (attempt < 40) setTimeout(() => renderTurnstileWhenReady(attempt + 1), 250);
  }

  // The floating "Save Contact" button lives outside <main>, so it must be
  // shown/hidden together with the card (it would otherwise leak onto the
  // loading screen).
  function setCardChromeVisible(visible) {
    const saveBtn = $("floatingSave");
    if (saveBtn) saveBtn.hidden = !visible;
  }

  function applyPrivateCard(card) {
    if (!card || typeof card !== "object") return;

    // Fill the shared TAPIND object (declared in js/script.js) so existing
    // features — Save Contact vCard, payments — use the private values.
    if (typeof TAPIND !== "undefined") {
      if (card.name) TAPIND.name = card.name;
      if (card.title) TAPIND.title = card.title;
      if (card.bio) TAPIND.bio = card.bio;
      if (card.reviews) TAPIND.reviews = card.reviews;
      for (const key of ["instagram", "facebook", "tiktok", "youtube", "website"]) {
        if (card.social?.[key]) TAPIND.social[key] = card.social[key];
      }
      for (const key of ["gcash", "maya", "bdo", "bpi"]) {
        if (card.payments?.[key]) TAPIND.payments[key] = card.payments[key];
      }
      for (const key of ["phone", "email", "company"]) {
        if (card.contact?.[key]) TAPIND.contact[key] = card.contact[key];
      }
    }

    const setText = (id, value) => { const el = $(id); if (el && value) el.textContent = value; };
    setText("profile-name", card.name);
    setText("profile-title", card.title);
    setText("profile-bio", card.bio);

    const profileImg = document.querySelector(".profile-image img");
    if (profileImg && card.profile?.photo) profileImg.src = card.profile.photo;
    const bg = $("profileBackground");
    if (bg && card.profile?.background) bg.src = card.profile.background;

    const handles = card.socialHandles || {};
    for (const key of ["instagram", "facebook", "tiktok", "youtube", "website"]) {
      const el = $(key);
      if (!el) continue;
      if (card.social?.[key]) {
        el.href = card.social[key];
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }
      const label = el.querySelector("span");
      if (label && handles[key]) label.textContent = handles[key];
    }

    const googleBtn = document.querySelector(".review-button");
    if (googleBtn && card.reviews) {
      googleBtn.href = card.reviews;
      googleBtn.target = "_blank";
      googleBtn.rel = "noopener noreferrer";
    }
  }

  function unlock(card) {
    applyPrivateCard(card);
    // Hide the loading screen COMPLETELY. The inline display:none is a
    // safety net in case an older stylesheet is cached — without it the
    // loading screen keeps its full-screen height and the card would be
    // pushed to the bottom of the page.
    if (loadingCard) {
      loadingCard.hidden = true;
      loadingCard.style.display = "none";
    }
    cardContent.hidden = false;
    setCardChromeVisible(true);
    renderTurnstileWhenReady();
    if (relockTimer) clearTimeout(relockTimer);
    relockTimer = setTimeout(backToVerify, SESSION_TTL_MS);
    // Land the visitor at the top so the card is immediately on screen.
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  async function boot() {
    try {
      const response = await fetch(`${API_BASE}/card`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      const data = await response.json().catch(() => ({}));
      console.log("[TAPIND card] /card", response.status, { errorCode: data.errorCode || null });
      if (!response.ok) { backToVerify(); return; }
      unlock(data.card);
    } catch (error) {
      console.warn("[TAPIND card] Could not load the card:", error);
      backToVerify();
    }
  }

  boot();
})();
