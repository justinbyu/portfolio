(() => {
  "use strict";
  const API_BASE = "https://tapind-reviews-api.justinriverodiaz.workers.dev";
  const $ = id => document.getElementById(id);
  const loginPanel = $("loginPanel"), dashboard = $("dashboard"), statusBox = $("status");
  const otpStatusBox = $("otpStatus");
  const reviewsBox = $("reviews"), counts = $("counts");

  // OTP session lives ONLY in sessionStorage (cleared when the tab closes).
  const OTP_TOKEN_KEY = "tapind_otp_token";
  const OTP_CHALLENGE_KEY = "tapind_otp_challenge";

  let token = "", authType = "", allReviews = [], currentFilter = "all";
  let challenge = null; // { challengeId, email, expiresAt } — newest code only
  let countdownTimer = null;

  function status(message, type = "") { statusBox.textContent = message; statusBox.className = type; }
  function otpStatus(message, type = "") { otpStatusBox.textContent = message; otpStatusBox.className = type; }
  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function dateLabel(v) { if (!v) return "Date unavailable"; const d = new Date(v); return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString(); }

  async function apiFetch(path, { useAuth = false, ...options } = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (useAuth && token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  async function request(path, options = {}) {
    const { response, data } = await apiFetch(path, { ...options, useAuth: true });
    if (response.status === 401 || response.status === 403) {
      const hint = authType === "otp"
        ? "OTP session was rejected. Make sure this email is listed in the Worker's ADMIN_EMAILS, then sign in again."
        : "Access rejected. Check the admin token and make sure the Worker admin routes are deployed.";
      throw new Error(hint);
    }
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
    return data;
  }

  async function enterDashboard() {
    const data = await request("/admin/reviews");
    allReviews = Array.isArray(data.reviews) ? data.reviews : [];
    loginPanel.classList.add("hidden");
    dashboard.classList.remove("hidden");
    render();
  }

  async function connectWith(nextToken, nextType) {
    token = nextToken; authType = nextType;
    try { await enterDashboard(); }
    catch (e) {
      if (nextType === "otp") clearOtpSession();
      token = ""; authType = "";
      const target = nextType === "otp" ? otpStatus : status;
      target(`${e.message} If you see 404, the Worker has not been updated yet.`, "error");
      loginPanel.classList.remove("hidden"); dashboard.classList.add("hidden");
    }
  }

  async function connect() {
    status("Checking access…");
    const supplied = $("adminToken").value.trim();
    await connectWith(supplied, "token");
    if (!token) status("Access rejected. Check the admin token and make sure the Worker admin routes are deployed.", "error");
  }

  // ---------- OTP flow ----------
  function setChallenge(next) {
    challenge = next;
    if (next) sessionStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(OTP_CHALLENGE_KEY);
    const form = $("otpVerifyForm");
    form.classList.toggle("hidden", !next);
    if (next) {
      $("otpEmailEcho").textContent = next.email;
      $("otpCode").value = "";
      startCountdown();
      $("otpCode").focus();
    } else {
      stopCountdown();
      $("otpCountdown").textContent = "";
    }
  }

  function startCountdown() {
    stopCountdown();
    const tick = () => {
      if (!challenge) return;
      const seconds = Math.max(0, Math.round((challenge.expiresAt - Date.now()) / 1000));
      $("otpCountdown").textContent = seconds > 0
        ? `Code expires in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
        : "Code expired — request a new one.";
      $("otpVerifyBtn").disabled = seconds <= 0;
      if (seconds <= 0) stopCountdown();
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }
  function stopCountdown() { if (countdownTimer) clearInterval(countdownTimer); countdownTimer = null; }

  async function requestOtp(email) {
    otpStatus("Sending code…");
    const { response, data } = await apiFetch("/otp/request", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    console.log("[TAPIND OTP] /otp/request", response.status, { success: !!data.success, errorCode: data.errorCode || null });
    if (!response.ok || !data.challengeId) {
      throw new Error(data.error || "Could not send a code. Please try again.");
    }
    // Only the newest challenge is kept — older emailed codes stop working.
    setChallenge({
      challengeId: data.challengeId,
      email,
      expiresAt: Date.now() + Number(data.expiresIn || 600) * 1000
    });
    otpStatus("Code sent. Enter the 6-digit code from the newest email — older codes no longer work.", "success");
  }

  async function verifyOtp(event) {
    event.preventDefault();
    if (!challenge) { otpStatus("Request a code first.", "error"); return; }
    const code = $("otpCode").value.replace(/\D/g, ""); // text input keeps leading zeros
    if (!/^\d{6}$/.test(code)) { otpStatus("Enter all 6 digits, including any leading zero.", "error"); return; }

    otpStatus("Verifying…");
    $("otpVerifyBtn").disabled = true;
    try {
      const { response, data } = await apiFetch("/otp/verify", {
        method: "POST",
        body: JSON.stringify({ challengeId: challenge.challengeId, email: challenge.email, code })
      });
      console.log("[TAPIND OTP] /otp/verify", response.status, { tokenReceived: !!data.token, errorCode: data.errorCode || null });
      if (!response.ok || !data.token) {
        const extra = data.errorCode === "OTP_MISMATCH" && typeof data.attemptsRemaining === "number"
          ? ` (${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? "" : "s"} left)` : "";
        throw new Error((data.error || "That code did not work.") + extra);
      }
      sessionStorage.setItem(OTP_TOKEN_KEY, data.token);
      setChallenge(null);
      otpStatus("Verified. Loading reviews…", "success");
      await connectWith(data.token, "otp");
    } catch (e) {
      otpStatus(e.message, "error");
      $("otpVerifyBtn").disabled = false;
    }
  }

  function clearOtpSession() {
    sessionStorage.removeItem(OTP_TOKEN_KEY);
    setChallenge(null);
  }

  async function restoreOtpSession() {
    const savedChallenge = sessionStorage.getItem(OTP_CHALLENGE_KEY);
    if (savedChallenge) {
      try {
        const parsed = JSON.parse(savedChallenge);
        if (parsed?.expiresAt > Date.now()) {
          $("otpEmail").value = parsed.email || "";
          setChallenge(parsed);
        } else sessionStorage.removeItem(OTP_CHALLENGE_KEY);
      } catch { sessionStorage.removeItem(OTP_CHALLENGE_KEY); }
    }

    const savedToken = sessionStorage.getItem(OTP_TOKEN_KEY);
    if (!savedToken) return;
    const { response, data } = await apiFetch("/otp/validate", {
      method: "GET", useAuth: false,
      headers: { Authorization: `Bearer ${savedToken}` }
    }).catch(() => ({ response: null, data: {} }));
    if (response?.ok && data.valid) {
      otpStatus("Restoring your OTP session…");
      await connectWith(savedToken, "otp");
    } else {
      sessionStorage.removeItem(OTP_TOKEN_KEY);
    }
  }

  // ---------- Reviews dashboard (unchanged behaviour) ----------
  function render() {
    const pending = allReviews.filter(r => Number(r.approved) !== 1).length;
    counts.textContent = `${allReviews.length} total · ${pending} pending · ${allReviews.length - pending} approved`;
    const items = allReviews.filter(r => currentFilter === "all" || (currentFilter === "approved" ? Number(r.approved) === 1 : Number(r.approved) !== 1));
    if (!items.length) { reviewsBox.innerHTML = '<div class="empty">No reviews in this view yet.</div>'; return; }
    reviewsBox.innerHTML = items.map(r => {
      const approved = Number(r.approved) === 1, id = Number(r.id), name = r.customer_name || r.name || "Customer", message = r.review_text || r.review || r.message || "", rating = Math.max(1, Math.min(5, Number(r.rating) || 0));
      return `<article class="review"><div class="review-head"><div><div class="name">${esc(name)}</div><div class="meta">Review #${esc(id)} · ${esc(dateLabel(r.created_at))}</div></div><span class="badge ${approved ? "approved" : "pending"}">${approved ? "Approved" : "Pending approval"}</span></div><div class="stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div><p class="message">${esc(message)}</p><div class="actions">${approved ? `<button data-action="unapprove" data-id="${esc(id)}">Move to pending</button>` : `<button class="good" data-action="approve" data-id="${esc(id)}">Approve review</button>`}<button class="danger" data-action="delete" data-id="${esc(id)}">Delete</button></div></article>`;
    }).join("");
  }
  async function refresh() { reviewsBox.innerHTML = '<div class="empty">Refreshing reviews…</div>'; try { const data = await request("/admin/reviews"); allReviews = Array.isArray(data.reviews) ? data.reviews : []; render(); } catch (e) { reviewsBox.innerHTML = `<div class="empty">${esc(e.message)}</div>`; } }

  $("loginForm").addEventListener("submit", e => { e.preventDefault(); connect(); });
  $("otpRequestForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("otpEmail").value.trim().toLowerCase();
    $("otpSendBtn").disabled = true;
    try { await requestOtp(email); } catch (err) { otpStatus(err.message, "error"); } finally { $("otpSendBtn").disabled = false; }
  });
  $("otpVerifyForm").addEventListener("submit", verifyOtp);
  $("otpCode").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6); });
  $("otpResendBtn").addEventListener("click", async () => {
    if (!challenge) return;
    $("otpResendBtn").disabled = true;
    try { await requestOtp(challenge.email); } catch (err) { otpStatus(err.message, "error"); } finally { $("otpResendBtn").disabled = false; }
  });
  $("otpChangeEmailBtn").addEventListener("click", () => { setChallenge(null); otpStatus(""); $("otpEmail").focus(); });
  $("refreshBtn").addEventListener("click", refresh);
  $("logoutBtn").addEventListener("click", async () => {
    if (authType === "otp" && token) {
      await apiFetch("/otp/logout", { method: "POST", useAuth: true }).catch(() => {});
      clearOtpSession();
    }
    token = ""; authType = ""; allReviews = []; $("adminToken").value = "";
    dashboard.classList.add("hidden"); loginPanel.classList.remove("hidden"); status("Admin locked.");
  });
  document.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => { currentFilter = b.dataset.filter; render(); }));
  reviewsBox.addEventListener("click", async e => {
    const b = e.target.closest("button[data-action]"); if (!b) return;
    const id = b.dataset.id, action = b.dataset.action;
    if (action === "delete" && !confirm(`Permanently delete review #${id}? This cannot be undone.`)) return;
    b.disabled = true;
    try { await request(`/admin/reviews/${encodeURIComponent(id)}`, { method: action === "delete" ? "DELETE" : "PATCH", body: action === "delete" ? undefined : JSON.stringify({ approved: action === "approve" ? 1 : 0 }) }); await refresh(); }
    catch (err) { alert(err.message); b.disabled = false; }
  });

  restoreOtpSession();
})();