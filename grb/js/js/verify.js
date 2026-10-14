/* =====================================================
   TAPIND VERIFY PAGE (step 1 of the private card flow)
   - The visitor enters their own email and receives a
     6-digit code. Any visitor can do this.
   - The message box shows WARNINGS/ERRORS only. On success
     the OTP section simply appears below.
   - The "Verify & Continue" button shows its own state:
     gray "Verifying…" → green "Verified" → next page.
   - On success this page hands a ONE-TIME session over to
     index.html through the URL fragment (#t=...).

   Privacy notes:
   - The fragment (#t=...) is never sent to any server.
   - The token is never written to localStorage,
     sessionStorage or cookies. index.html keeps it in
     memory only and erases it from the address bar.
   - Reloading / returning later = a new code is required.
===================================================== */
(() => {
  "use strict";

  const API_BASE = "https://tapind-reviews-api.justinriverodiaz.workers.dev";
  const CARD_PAGE = "index.html";
  const $ = id => document.getElementById(id);

  const requestForm = $("gateRequestForm");
  const verifyForm = $("gateVerifyForm");
  const statusBox = $("gateStatus");
  const sendBtn = $("gateSendBtn");
  const verifyBtn = $("gateVerifyBtn");
  if (!requestForm || !verifyForm) return;

  let challenge = null;      // { challengeId, email, expiresAt } newest code only
  let countdownTimer = null;
  let verifyState = "idle";  // "idle" | "verifying" | "verified"

  /* ---------------- status box: WARNINGS ONLY ---------------- */

  function showError(message) {
    if (!statusBox) { if (message) console.log("[TAPIND verify]", message); return; }
    statusBox.textContent = message;
    statusBox.classList.toggle("show", Boolean(message));
  }
  function clearError() { showError(""); }

  /* ---------------- buttons ---------------- */

  function setSendButtonState(state) {
    // state: "idle" | "sending"
    if (!sendBtn) return;
    if (state === "sending") {
      sendBtn.disabled = true;
      sendBtn.classList.add("is-verifying");
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    } else {
      sendBtn.disabled = false;
      sendBtn.classList.remove("is-verifying");
      sendBtn.innerHTML = '<i class="fa-solid fa-envelope"></i> Email me a code';
    }
  }

  function secondsLeft() {
    return challenge ? Math.max(0, Math.round((challenge.expiresAt - Date.now()) / 1000)) : 0;
  }

  function renderVerifyButton() {
    if (!verifyBtn) return;
    verifyBtn.classList.toggle("is-verifying", verifyState === "verifying");
    verifyBtn.classList.toggle("is-verified", verifyState === "verified");
    if (verifyState === "verifying") {
      verifyBtn.disabled = true;
      verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying…';
    } else if (verifyState === "verified") {
      verifyBtn.disabled = true;
      verifyBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verified';
    } else {
      verifyBtn.disabled = secondsLeft() <= 0;
      verifyBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Verify &amp; Continue';
    }
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  /* ---------------- challenge handling ---------------- */

  function setChallenge(next) {
    challenge = next;
    verifyForm.hidden = !next;
    if (next) {
      verifyState = "idle";
      renderVerifyButton();
      $("gateEmailEcho").textContent = next.email;
      $("gateCode").value = "";
      startCountdown();
      // Bring the OTP section into view and focus the code field.
      try { verifyForm.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch { /* older browsers */ }
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
      const seconds = secondsLeft();
      $("gateCountdown").textContent = seconds > 0
        ? `Code expires in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
        : "Code expired — request a new one.";
      if (verifyState === "idle") renderVerifyButton();
      if (seconds <= 0) stopCountdown();
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }
  function stopCountdown() { if (countdownTimer) clearInterval(countdownTimer); countdownTimer = null; }

  async function requestCode(email) {
    setSendButtonState("sending");
    clearError();
    const { response, data } = await api("/otp/request", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    console.log("[TAPIND verify] /otp/request", response.status, { errorCode: data.errorCode || null });
    setSendButtonState("idle");
    if (!response.ok || !data.challengeId) {
      throw new Error(data.error || "Could not send a code. Please try again.");
    }
    // No success message: the OTP section appearing IS the confirmation.
    setChallenge({
      challengeId: data.challengeId,
      email,
      expiresAt: Date.now() + Number(data.expiresIn || 600) * 1000
    });
  }

  /* ---------------- forms ---------------- */

  requestForm.addEventListener("submit", async event => {
    event.preventDefault(); // without this the browser reloads the page and the code box never appears
    const email = $("gateEmail").value.trim().toLowerCase();
    try {
      await requestCode(email);
    } catch (e) {
      showError(e.message);
    }
  });

  verifyForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (verifyState !== "idle") return;
    if (!challenge) { showError("Request a code first."); return; }
    const code = $("gateCode").value.replace(/\D/g, ""); // keeps leading zeros
    if (!/^\d{6}$/.test(code)) { showError("Enter all 6 digits, including any leading zero."); return; }

    clearError();
    verifyState = "verifying";   // gray button
    renderVerifyButton();

    try {
      const { response, data } = await api("/otp/verify", {
        method: "POST",
        body: JSON.stringify({ challengeId: challenge.challengeId, email: challenge.email, code })
      });
      console.log("[TAPIND verify] /otp/verify", response.status, { tokenReceived: !!data.token, errorCode: data.errorCode || null });
      if (!response.ok || !data.token) {
        const extra = data.errorCode === "OTP_MISMATCH" && typeof data.attemptsRemaining === "number"
          ? ` (${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? "" : "s"} left)` : "";
        throw new Error((data.error || "That code did not work.") + extra);
      }

      stopCountdown();
      verifyState = "verified";    // green button
      renderVerifyButton();

      // One-time handoff to the card page. The card page takes the token,
      // erases it from the address bar and keeps it in memory only.
      // The short pause lets the green "Verified" state be seen.
      setTimeout(() => {
        window.location.replace(`${CARD_PAGE}#t=${encodeURIComponent(data.token)}`);
      }, 700);
    } catch (e) {
      verifyState = "idle";
      renderVerifyButton();
      showError(e.message);
    }
  });

  $("gateCode").addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
  });

  $("gateResendBtn").addEventListener("click", async () => {
    if (!challenge) return;
    $("gateResendBtn").disabled = true;
    try { await requestCode(challenge.email); }
    catch (e) { showError(e.message); }
    finally { $("gateResendBtn").disabled = false; }
  });

  $("gateChangeEmailBtn").addEventListener("click", () => {
    setChallenge(null);
    verifyState = "idle";
    renderVerifyButton();
    clearError();
    $("gateEmail").focus();
  });

  // Arriving back here because the 30-minute card session ended.
  if (new URLSearchParams(window.location.search).get("expired") === "1") {
    showError("Your session ended. Enter your email to get a new code.");
  }
})();
