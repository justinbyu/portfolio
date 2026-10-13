/* =====================================================
   TAPIND PRIVACY GATE
   - Whole card stays hidden until the visitor verifies
     an email OTP (their own email).
   - EVERY VISIT: the session token is kept only in
     memory. Reloading / reopening the page locks again.
   - Private details are fetched from GET /card with the
     session token; they are not in this page's source.
===================================================== */
(() => {
  "use strict";

  const API_BASE = "https://tapind-reviews-api.justinriverodiaz.workers.dev";
  const $ = id => document.getElementById(id);

  const gate = $("privacyGate");
  const cardContent = $("cardContent");
  const requestForm = $("gateRequestForm");
  const verifyForm = $("gateVerifyForm");
  const statusBox = $("gateStatus");
  if (!gate || !cardContent || !requestForm || !verifyForm) return;

  let challenge = null;      // { challengeId, email, expiresAt } newest code only
  let sessionToken = null;   // memory only — never stored, by design
  let countdownTimer = null;
  let relockTimer = null;
  let turnstileWidgetId = null;

  const TURNSTILE_SITE_KEY = "0x4AAAAAAFSFE6UCdcguhWxE";

  // The Turnstile widget lives inside the (initially hidden) card, so it
  // cannot auto-render at page load. Render it explicitly once visible.
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
        console.warn("[TAPIND gate] Turnstile render failed:", error);
      }
      return;
    }
    // Turnstile script is async; retry briefly until it arrives.
    if (attempt < 40) setTimeout(() => renderTurnstileWhenReady(attempt + 1), 250);
  }

  function removeTurnstile() {
    if (turnstileWidgetId !== null && window.turnstile?.remove) {
      try { window.turnstile.remove(turnstileWidgetId); } catch { /* already gone */ }
    }
    turnstileWidgetId = null;
  }

  function showStatus(message, success) {
    if (!statusBox) { if (message) console.log("[TAPIND gate]", message); return; }
    statusBox.textContent = message;
    statusBox.classList.toggle("show", Boolean(message));
    statusBox.style.borderColor = success ? "rgba(70, 200, 130, .45)" : "rgba(240, 90, 90, .5)";
  }

  async function api(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  function setChallenge(next) {
    challenge = next;
    verifyForm.hidden = !next;
    if (next) {
      $("gateEmailEcho").textContent = next.email;
      $("gateCode").value = "";
      startCountdown();
      $("gateCode").focus();
    } else {
      stopCountdown();
      $("gateCountdown").textContent = "";
    }
  }

  function startCountdown() {
    stopCountdown();
    const tick = () => {
      if (!challenge) return;
      const seconds = Math.max(0, Math.round((challenge.expiresAt - Date.now()) / 1000));
      $("gateCountdown").textContent = seconds > 0
        ? `Code expires in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
        : "Code expired — request a new one.";
      $("gateVerifyBtn").disabled = seconds <= 0;
      if (seconds <= 0) stopCountdown();
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }
  function stopCountdown() { if (countdownTimer) clearInterval(countdownTimer); countdownTimer = null; }

  async function requestCode(email) {
    showStatus("Sending code…", true);
    const { response, data } = await api("/otp/request", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    console.log("[TAPIND gate] /otp/request", response.status, { errorCode: data.errorCode || null });
    if (!response.ok || !data.challengeId) {
      throw new Error(data.error || "Could not send a code. Please try again.");
    }
    setChallenge({
      challengeId: data.challengeId,
      email,
      expiresAt: Date.now() + Number(data.expiresIn || 600) * 1000
    });
    showStatus("Code sent. Use the code in the newest email — older codes stop working.", true);
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

  function unlock(card, expiresInSeconds) {
    applyPrivateCard(card);
    gate.hidden = true;
    cardContent.hidden = false;
    renderTurnstileWhenReady();
    if (relockTimer) clearTimeout(relockTimer);
    // Session lasts up to 30 minutes; after that this visit locks again.
    relockTimer = setTimeout(lock, Math.max(1, Number(expiresInSeconds) || 1800) * 1000);
    window.scrollTo({ top: 0 });
  }

  function lock() {
    sessionToken = null;
    removeTurnstile();
    setChallenge(null);
    if (relockTimer) clearTimeout(relockTimer);
    cardContent.hidden = true;
    gate.hidden = false;
    showStatus("Session ended. Verify your email to view the card again.", false);
  }

  requestForm.addEventListener("submit", async event => {
    event.preventDefault();
    const email = $("gateEmail").value.trim().toLowerCase();
    $("gateSendBtn").disabled = true;
    try { await requestCode(email); }
    catch (e) { showStatus(e.message, false); }
    finally { $("gateSendBtn").disabled = false; }
  });

  verifyForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!challenge) { showStatus("Request a code first.", false); return; }
    const code = $("gateCode").value.replace(/\D/g, ""); // keeps leading zeros
    if (!/^\d{6}$/.test(code)) { showStatus("Enter all 6 digits, including any leading zero.", false); return; }

    $("gateVerifyBtn").disabled = true;
    showStatus("Verifying…", true);
    try {
      const { response, data } = await api("/otp/verify", {
        method: "POST",
        body: JSON.stringify({ challengeId: challenge.challengeId, email: challenge.email, code })
      });
      console.log("[TAPIND gate] /otp/verify", response.status, { tokenReceived: !!data.token, errorCode: data.errorCode || null });
      if (!response.ok || !data.token) {
        const extra = data.errorCode === "OTP_MISMATCH" && typeof data.attemptsRemaining === "number"
          ? ` (${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? "" : "s"} left)` : "";
        throw new Error((data.error || "That code did not work.") + extra);
      }

      sessionToken = data.token; // memory only: a reload requires a new code
      setChallenge(null);

      const cardResult = await api("/card", { method: "GET" });
      console.log("[TAPIND gate] /card", cardResult.response.status, { errorCode: cardResult.data.errorCode || null });
      if (!cardResult.response.ok) {
        sessionToken = null;
        throw new Error(cardResult.data.error || "Verified, but the card could not be loaded.");
      }

      unlock(cardResult.data.card, data.expiresIn);
    } catch (e) {
      showStatus(e.message, false);
      $("gateVerifyBtn").disabled = false;
    }
  });

  $("gateCode").addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
  });
  $("gateResendBtn").addEventListener("click", async () => {
    if (!challenge) return;
    $("gateResendBtn").disabled = true;
    try { await requestCode(challenge.email); }
    catch (e) { showStatus(e.message, false); }
    finally { $("gateResendBtn").disabled = false; }
  });
  $("gateChangeEmailBtn").addEventListener("click", () => {
    setChallenge(null);
    showStatus("", true);
    $("gateEmail").focus();
  });
})();