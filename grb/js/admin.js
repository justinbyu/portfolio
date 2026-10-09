(() => {
  "use strict";
  const API_BASE = "https://tapind-reviews-api.justinriverodiaz.workers.dev";
  const $ = id => document.getElementById(id);
  const loginPanel = $("loginPanel"), dashboard = $("dashboard"), statusBox = $("status");
  const reviewsBox = $("reviews"), counts = $("counts");
  let token = "", allReviews = [], currentFilter = "all";
  function status(message, type = "") { statusBox.textContent = message; statusBox.className = type; }
  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function dateLabel(v) { if (!v) return "Date unavailable"; const d = new Date(v); return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString(); }
  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}`, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) throw new Error("Access rejected. Check the admin token and make sure the Worker admin routes are deployed.");
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
    return data;
  }
  async function connect() {
    status("Checking access…"); token = $("adminToken").value.trim();
    try { const data = await request("/admin/reviews"); allReviews = Array.isArray(data.reviews) ? data.reviews : []; loginPanel.classList.add("hidden"); dashboard.classList.remove("hidden"); render(); }
    catch (e) { token = ""; status(`${e.message} If you see 404, the Worker has not been updated yet.`, "error"); }
  }
  function render() {
    const pending = allReviews.filter(r => Number(r.approved) !== 1).length;
    counts.textContent = `${allReviews.length} total · ${pending} pending · ${allReviews.length - pending} approved`;
    const items = allReviews.filter(r => currentFilter === "all" || (currentFilter === "approved" ? Number(r.approved) === 1 : Number(r.approved) !== 1));
    if (!items.length) { reviewsBox.innerHTML = '<div class="empty">No reviews in this view yet.</div>'; return; }
    reviewsBox.innerHTML = items.map(r => {
      const approved = Number(r.approved) === 1, id = Number(r.id), name = r.customer_name || r.name || "Customer", message = r.review_text || r.review || r.message || "", rating = Math.max(1, Math.min(5, Number(r.rating) || 0));
      return `<article class="review"><div class="review-head"><div><div class="name">${esc(name)}</div><div class="meta">Review #${esc(id)} · ${esc(dateLabel(r.created_at))}</div></div><span class="badge ${approved ? "approved" : "pending"}">${approved ? "Approved" : "Pending approval"}</span></div><div class="stars">${"★".repeat(rating)}${"☆".repeat(5-rating)}</div><p class="message">${esc(message)}</p><div class="actions">${approved ? `<button data-action="unapprove" data-id="${esc(id)}">Move to pending</button>` : `<button class="good" data-action="approve" data-id="${esc(id)}">Approve review</button>`}<button class="danger" data-action="delete" data-id="${esc(id)}">Delete</button></div></article>`;
    }).join("");
  }
  async function refresh() { reviewsBox.innerHTML = '<div class="empty">Refreshing reviews…</div>'; try { const data = await request("/admin/reviews"); allReviews = Array.isArray(data.reviews) ? data.reviews : []; render(); } catch (e) { reviewsBox.innerHTML = `<div class="empty">${esc(e.message)}</div>`; } }
  $("loginForm").addEventListener("submit", e => { e.preventDefault(); connect(); });
  $("refreshBtn").addEventListener("click", refresh);
  $("logoutBtn").addEventListener("click", () => { token = ""; allReviews = []; $("adminToken").value = ""; dashboard.classList.add("hidden"); loginPanel.classList.remove("hidden"); status("Admin locked."); });
  document.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => { currentFilter = b.dataset.filter; render(); }));
  reviewsBox.addEventListener("click", async e => {
    const b = e.target.closest("button[data-action]"); if (!b) return;
    const id = b.dataset.id, action = b.dataset.action;
    if (action === "delete" && !confirm(`Permanently delete review #${id}? This cannot be undone.`)) return;
    b.disabled = true;
    try { await request(`/admin/reviews/${encodeURIComponent(id)}`, { method: action === "delete" ? "DELETE" : "PATCH", body: action === "delete" ? undefined : JSON.stringify({ approved: action === "approve" ? 1 : 0 }) }); await refresh(); }
    catch (err) { alert(err.message); b.disabled = false; }
  });
})();
