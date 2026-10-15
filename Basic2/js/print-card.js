(function () {
  var card = window.CARD || {};

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function nameHtml(value) {
    var parts = String(value || "").trim().split(/\s+/);
    if (parts.length < 2) return esc(value);
    var first = parts.shift();
    return "<em>" + esc(first) + "</em> " + esc(parts.join(" "));
  }

  var front = document.getElementById("front");
  var back = document.getElementById("back");
  var warn = document.getElementById("sampleWarn");

  if (front) {
    front.innerHTML =
      '<div class="face-top"><p class="brand">' + esc(card.brand) + '</p><p class="tiny">' + (card.sample ? "Sample" : "Tap") + "</p></div>" +
      '<div class="face-bottom"><div><p class="role">' + esc(card.role) + "</p><h1>" + nameHtml(card.name) + '</h1><p class="role">' + esc(card.niche) + "</p></div>" +
      '<div class="nfc-mini" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="5" cy="12" r="1.3" fill="currentColor"/><path d="M9 8a6 6 0 0 1 0 8M12.5 5.5a10 10 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div></div>';
  }

  if (back) {
    var link = card.publicUrl ? card.publicUrl : "Set publicUrl in js/config.js";
    back.innerHTML =
      '<div class="back-copy"><h2>Tap to open</h2><p>' + esc(card.phone || "") + "</p><p>" + esc(link) + "</p><p>Place a 25 mm NTAG213 sticker in the circle. Keep it off metal.</p></div>" +
      '<div class="chip-spot">NFC<br>chip</div>';
  }

  if (warn) warn.hidden = !card.sample;

  var printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }
})();
