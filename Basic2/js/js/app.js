(function () {
  var card = window.CARD;
  if (!card) return;

  var icons = {
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="#E1306C" stroke-width="1.8"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="#E1306C" stroke-width="1.8"/><circle cx="16.6" cy="7.4" r="0.9" fill="#E1306C"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M14.2 8.2h2V5.4h-2.1c-2.2 0-3.7 1.5-3.7 3.9v1.8H8.2v2.8h2.2V20h2.9v-6.1h2.2l.6-2.8h-2.8V9.5c0-.7.3-1.3 1.1-1.3z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M14 4h2.1c.2 1.6 1.1 3 2.8 3.7v2.1c-1 0-2-.3-2.8-.8v5.3a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.3a3.1 3.1 0 1 0 2.1 2.9V4z"/></svg>'
  };

  var arrow =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 L16 8 M10 8 H16 V14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var slideIndex = 0;
  var slideTimer = 0;
  var toastTimer = 0;

  function text(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value || "";
  }

  function httpUrl(value) {
    try {
      var url = new URL(value, window.location.href);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    } catch (err) {
      return "";
    }
    return "";
  }

  function initials(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "•";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(function () { return true; }).catch(fallback);
    }
    return Promise.resolve(fallback());

    function fallback() {
      var area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      area.remove();
      return ok;
    }
  }

  function renderProfile() {
    text("cardLabel", card.cardLabel || (card.brand ? card.brand + " DIGITAL CARD" : "DIGITAL CARD"));
    text("name", card.name);
    text("role", card.role);
    text("bio", card.bio);
    text("tagline", card.tagline);
    text("niche", card.niche);

    var avatar = document.getElementById("avatar");
    if (avatar) avatar.textContent = initials(card.name);

    document.title = (card.name || "Digital card") + (card.brand ? " — " + card.brand : "");
    var meta = document.getElementById("metaDescription");
    if (meta) meta.setAttribute("content", (card.name || "") + ". " + (card.bio || ""));

    var note = document.getElementById("sampleNote");
    if (note) {
      note.hidden = !card.sample;
      note.textContent = card.sample ? "Sample card. Edit js/config.js, then set sample to false." : "";
    }
  }

  function renderSocials() {
    var list = document.getElementById("socialList");
    if (!list) return;
    list.innerHTML = (card.socials || []).map(function (social) {
      var href = httpUrl(social.url) || "#";
      return (
        '<a class="link-row" href="' + href + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="link-icon">' + (icons[social.icon] || icons.instagram) + "</span>" +
          '<span class="link-name">' + escapeHtml(social.name) + "</span>" +
          '<span class="link-arrow">' + arrow + "</span>" +
        "</a>"
      );
    }).join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function renderPayments() {
    var list = document.getElementById("payList");
    if (!list) return;
    list.innerHTML = (card.payments || []).map(function (payment) {
      var mark = payment.id === "bdo" ? "BDO" : payment.name.charAt(0).toUpperCase();
      return (
        '<a class="link-row" href="' + escapeHtml(payment.page || "#") + '">' +
          '<span class="link-icon mark mark-' + escapeHtml(payment.id) + '">' + escapeHtml(mark) + "</span>" +
          '<span class="link-name">' + escapeHtml(payment.name) + "</span>" +
          '<span class="link-arrow">' + arrow + "</span>" +
        "</a>"
      );
    }).join("");
  }

  function renderSlides() {
    var track = document.getElementById("track");
    var dots = document.getElementById("dots");
    var slides = card.slides || [];
    if (!track || !dots) return;

    track.innerHTML = slides.map(function (slide, index) {
      return '<figure class="slide"><img src="' + escapeHtml(slide.image) + '" alt="' + escapeHtml(slide.title || "Picture " + (index + 1)) + '" draggable="false"></figure>';
    }).join("");

    dots.innerHTML = slides.map(function (slide, index) {
      return '<button type="button" class="dot" data-index="' + index + '" aria-label="Show picture ' + (index + 1) + '"></button>';
    }).join("");

    dots.querySelectorAll(".dot").forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(Number(dot.getAttribute("data-index")));
        restartAutoplay();
      });
    });

    goTo(0);
  }

  function goTo(index) {
    var slides = card.slides || [];
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    var track = document.getElementById("track");
    if (track) track.style.transform = "translateX(-" + slideIndex * 100 + "%)";
    var current = slides[slideIndex];
    text("caption", current.caption || current.title || "");
    text("count", (slideIndex + 1) + " / " + slides.length);
    document.querySelectorAll(".dot").forEach(function (dot, dotIndex) {
      if (dotIndex === slideIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function restartAutoplay() {
    window.clearInterval(slideTimer);
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !card.slides || card.slides.length < 2) return;
    slideTimer = window.setInterval(function () { goTo(slideIndex + 1); }, 5200);
  }

  function bindSlider() {
    var viewport = document.getElementById("viewport");
    if (!viewport) return;
    var startX = 0;
    var startY = 0;
    var tracking = false;

    viewport.addEventListener("pointerdown", function (event) {
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
    });
    viewport.addEventListener("pointerup", function (event) {
      if (!tracking) return;
      tracking = false;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
      goTo(slideIndex + (dx < 0 ? 1 : -1));
      restartAutoplay();
    });
    viewport.addEventListener("pointercancel", function () { tracking = false; });
    viewport.addEventListener("mouseenter", function () { window.clearInterval(slideTimer); });
    viewport.addEventListener("mouseleave", restartAutoplay);
    viewport.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      goTo(slideIndex + (event.key === "ArrowRight" ? 1 : -1));
      restartAutoplay();
    });
  }

  function vEscape(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function saveContact() {
    var name = String(card.name || "").trim();
    var parts = name.split(/\s+/);
    var last = parts.length > 1 ? parts.pop() : "";
    var first = parts.join(" ") || name;
    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:" + vEscape(last) + ";" + vEscape(first) + ";;;",
      "FN:" + vEscape(name),
      "ORG:" + vEscape(card.brand),
      "TITLE:" + vEscape(card.role)
    ];
    if (card.phone) lines.push("TEL;TYPE=CELL:" + String(card.phone).replace(/[^\d+]/g, ""));
    if (card.email) lines.push("EMAIL:" + vEscape(card.email));
    if (card.location) lines.push("ADR;TYPE=WORK:;;" + vEscape(card.location) + ";;;;");
    if (card.bio) lines.push("NOTE:" + vEscape(card.bio));
    var url = httpUrl(card.publicUrl || "");
    if (url) lines.push("URL:" + url);
    (card.socials || []).forEach(function (social) {
      var href = httpUrl(social.url);
      if (href) lines.push("X-SOCIALPROFILE;TYPE=" + vEscape(social.name).toLowerCase() + ":" + href);
    });
    lines.push("END:VCARD");

    var file = new Blob([lines.join("\r\n")], { type: "text/vcard" });
    var link = document.createElement("a");
    var safeName = name.replace(/\s+/g, "-").replace(/[^\w\-]/g, "") || "contact";
    link.href = URL.createObjectURL(file);
    link.download = safeName + ".vcf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 800);
    showToast("Contact file downloaded");
  }

  function publicUrl() {
    return httpUrl(card.publicUrl || "");
  }

  function nfcMessage(err) {
    var name = err && err.name;
    if (name === "NotAllowedError") return "NFC was blocked. Allow it in Chrome, then try again.";
    if (name === "NotSupportedError") return "This browser cannot write NFC. Use the NFC Tools app.";
    if (name === "AbortError") return "Write cancelled.";
    if (name === "NetworkError") return "Keep the sticker still against the phone until it saves.";
    return "Could not write the chip. Paste the link into NFC Tools instead.";
  }

  function renderOwner() {
    var url = publicUrl();
    var code = document.getElementById("publicUrlText");
    var status = document.getElementById("nfcStatus");
    if (code) code.textContent = url || "No public link yet. Set publicUrl in js/config.js";

    var copyLink = document.getElementById("copyLink");
    if (copyLink) {
      copyLink.addEventListener("click", function () {
        if (!url) {
          if (status) status.textContent = "Add an https link to publicUrl first.";
          return;
        }
        copyText(url).then(function (ok) {
          if (status) status.textContent = ok ? "Link copied." : "Could not copy.";
        });
      });
    }

    var write = document.getElementById("writeNfc");
    if (!write) return;
    write.addEventListener("click", function () {
      if (!url || url.indexOf("https://") !== 0) {
        if (status) status.textContent = "The chip needs an https link. Host this folder, then paste it into publicUrl.";
        return;
      }
      if (!("NDEFReader" in window)) {
        if (status) status.textContent = "This browser cannot write NFC. On iPhone, use NFC Tools and paste the link.";
        return;
      }
      if (status) status.textContent = "Hold a blank NTAG213 sticker to the back of the phone…";
      try {
        var ndef = new NDEFReader();
        ndef.write({ records: [{ recordType: "url", data: url }] }).then(function () {
          if (status) status.textContent = "Saved. Tap the card with a phone to open this page.";
        }).catch(function (err) {
          if (status) status.textContent = nfcMessage(err);
        });
      } catch (err) {
        if (status) status.textContent = nfcMessage(err);
      }
    });
  }

  renderProfile();
  renderSocials();
  renderPayments();
  renderSlides();
  bindSlider();
  restartAutoplay();
  renderOwner();

  var save = document.getElementById("saveContact");
  if (save) save.addEventListener("click", saveContact);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) window.clearInterval(slideTimer);
    else restartAutoplay();
  });
})();
