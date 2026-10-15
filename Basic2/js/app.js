(function () {
  var card = window.CARD;
  var body = document.body;

  if (!card) {
    body.classList.add("ready");
    body.textContent = "Missing js/config.js";
    return;
  }

  var icons = {
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="7" r="0.9" fill="currentColor"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.2 8.2h2.1V5.2h-2.2c-2.3 0-3.9 1.6-3.9 4.1v1.9H8v3h2.2V20h3.1v-5.8h2.3l.7-3h-3V9.4c0-.7.4-1.2 1.1-1.2z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4h2.1c.2 1.7 1.2 3.1 2.9 3.8v2.2c-1.1 0-2.1-.3-3-.9v5.4a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.4a3.2 3.2 0 1 0 2.2 3V4z"/></svg>'
  };

  var slideIndex = 0;
  var slideTimer = 0;
  var toastTimer = 0;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

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

  function phoneHref(value) {
    var compact = String(value || "").replace(/[^\d+]/g, "");
    return compact ? "tel:" + compact : "";
  }

  function nameHtml(value) {
    var parts = String(value || "").trim().split(/\s+/);
    if (parts.length < 2) return esc(value);
    var first = parts.shift();
    return "<em>" + esc(first) + "</em> " + esc(parts.join(" "));
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  function copyText(value) {
    function fallback() {
      var area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {
        ok = false;
      }
      area.remove();
      return ok;
    }

    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(function () {
        return true;
      }).catch(fallback);
    }
    return Promise.resolve(fallback());
  }

  function publicUrl() {
    return httpUrl(card.publicUrl || "");
  }

  function renderProfile() {
    text("brand", card.brand);
    text("role", card.role);
    text("location", card.location);
    text("nicheLabel", card.niche);
    text("nicheSummary", card.nicheSummary);

    var name = document.getElementById("name");
    if (name) name.innerHTML = nameHtml(card.name);

    var photo = document.getElementById("portrait");
    if (photo) {
      photo.src = card.portrait;
      photo.alt = "Portrait of " + (card.name || "the card owner");
    }

    var contacts = document.getElementById("contacts");
    if (contacts) {
      var phone = phoneHref(card.phone);
      var email = card.email ? "mailto:" + card.email : "";
      var rows = "";
      if (phone) {
        rows += '<div class="contact-row"><dt>Call</dt><dd><a href="' + esc(phone) + '">' + esc(card.phone) + "</a></dd></div>";
      }
      if (email) {
        rows += '<div class="contact-row"><dt>Email</dt><dd><a href="' + esc(email) + '">' + esc(card.email) + "</a></dd></div>";
      }
      contacts.innerHTML = rows;
    }

    document.title = (card.name || "Digital card") + (card.brand ? " — " + card.brand : "");
    var description = document.getElementById("metaDescription");
    if (description) {
      description.setAttribute(
        "content",
        (card.name || "") + ", " + (card.role || "") + ". " + (card.niche || "")
      );
    }
  }

  function renderSlides() {
    var track = document.getElementById("sliderTrack");
    var dots = document.getElementById("dots");
    if (!track || !dots) return;

    track.innerHTML = (card.slides || []).map(function (slide, index) {
      return (
        '<figure class="slide"><img src="' + esc(slide.image) + '" alt="' + esc(slide.title || "Work picture " + (index + 1)) + '" draggable="false"></figure>'
      );
    }).join("");

    dots.innerHTML = (card.slides || []).map(function (slide, index) {
      return '<button type="button" class="dot" data-index="' + index + '" aria-label="Show picture ' + (index + 1) + '"></button>';
    }).join("");

    dots.querySelectorAll(".dot").forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(Number(dot.getAttribute("data-index")));
        restartAutoplay();
      });
    });

    var slider = document.getElementById("slider");
    if (slider && (!card.slides || card.slides.length < 2)) {
      var nav = slider.querySelector(".slider-nav");
      if (nav) nav.hidden = true;
    }

    goTo(0);
  }

  function pad(index) {
    return String(index + 1).padStart(2, "0");
  }

  function goTo(index) {
    var slides = card.slides || [];
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    var track = document.getElementById("sliderTrack");
    if (track) track.style.transform = "translateX(-" + slideIndex * 100 + "%)";

    var current = slides[slideIndex];
    text("slideNum", pad(slideIndex));
    text("slideTitle", current.title);
    text("slideCaption", current.caption);

    document.querySelectorAll(".dot").forEach(function (dot, dotIndex) {
      if (dotIndex === slideIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function restartAutoplay() {
    window.clearInterval(slideTimer);
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !card.slides || card.slides.length < 2) return;
    slideTimer = window.setInterval(function () {
      goTo(slideIndex + 1);
    }, 5600);
  }

  function bindSlider() {
    var viewport = document.getElementById("sliderViewport");
    var prev = document.getElementById("prevSlide");
    var next = document.getElementById("nextSlide");
    if (prev) {
      prev.addEventListener("click", function () {
        goTo(slideIndex - 1);
        restartAutoplay();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        goTo(slideIndex + 1);
        restartAutoplay();
      });
    }
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

    viewport.addEventListener("pointercancel", function () {
      tracking = false;
    });

    viewport.addEventListener("mouseenter", function () {
      window.clearInterval(slideTimer);
    });
    viewport.addEventListener("mouseleave", restartAutoplay);

    document.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      var active = document.activeElement;
      if (!viewport.contains(active) && active !== prev && active !== next) return;
      goTo(slideIndex + (event.key === "ArrowRight" ? 1 : -1));
      restartAutoplay();
    });
  }

  function renderSocials() {
    var list = document.getElementById("socialList");
    if (!list) return;
    list.innerHTML = (card.socials || []).map(function (social) {
      var href = httpUrl(social.url) || "#";
      var icon = icons[social.icon] || icons.instagram;
      return (
        '<a class="social" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="social-icon">' + icon + "</span>" +
          '<span class="social-text"><span class="social-name">' + esc(social.name) + "</span>" +
          '<span class="social-handle">' + esc(social.handle) + "</span></span>" +
          '<span class="social-go" aria-hidden="true">↗</span>' +
        "</a>"
      );
    }).join("");
  }

  function renderPayments() {
    var list = document.getElementById("payList");
    if (!list) return;
    list.innerHTML = (card.payments || []).map(function (payment, index) {
      return (
        '<article class="pay">' +
          '<p class="pay-name">' + esc(payment.name) + "</p>" +
          '<button type="button" class="copy" data-copy="' + esc(payment.number) + '" data-label="' + esc(payment.name) + '">Copy</button>' +
          '<p class="pay-account">' + esc(payment.accountName) + "</p>" +
          '<p class="pay-number">' + esc(payment.number) + "</p>" +
          '<p class="pay-detail">' + esc(payment.detail) + "</p>" +
        "</article>"
      );
    }).join("");

    list.querySelectorAll(".copy").forEach(function (button) {
      button.addEventListener("click", function () {
        var raw = (button.getAttribute("data-copy") || "").replace(/\s+/g, "");
        copyText(raw).then(function (ok) {
          showToast(ok ? button.getAttribute("data-label") + " number copied" : "Could not copy");
        });
      });
    });
  }

  function vCard() {
    var name = String(card.name || "").trim();
    var parts = name.split(/\s+/);
    var last = parts.length > 1 ? parts.pop() : "";
    var first = parts.join(" ") || name;

    function clean(value) {
      return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    }

    var note = [card.niche, card.nicheSummary].filter(Boolean).join(" — ");
    (card.payments || []).forEach(function (payment) {
      note += " " + payment.name + " " + payment.number + ".";
    });
    if (card.sample) note += " Sample card.";

    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:" + clean(last) + ";" + clean(first) + ";;;",
      "FN:" + clean(name),
      "ORG:" + clean(card.brand),
      "TITLE:" + clean(card.role),
      "TEL;TYPE=CELL:" + String(card.phone || "").replace(/[^\d+]/g, ""),
      "EMAIL:" + clean(card.email),
      "ADR;TYPE=WORK:;;" + clean(card.location) + ";;;;",
      "NOTE:" + clean(note)
    ];

    var url = publicUrl();
    if (url) lines.push("URL:" + url);

    (card.socials || []).forEach(function (social) {
      var href = httpUrl(social.url);
      if (href) lines.push("X-SOCIALPROFILE;TYPE=" + clean(social.name).toLowerCase() + ":" + href);
    });

    lines.push("END:VCARD");
    return lines.join("\r\n");
  }

  function saveContact() {
    var file = new Blob([vCard()], { type: "text/vcard" });
    var link = document.createElement("a");
    var safeName = String(card.name || "contact").trim().replace(/\s+/g, "-").replace(/[^\w\-]/g, "") || "contact";
    link.href = URL.createObjectURL(file);
    link.download = safeName + ".vcf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(link.href);
    }, 1000);
    showToast("Contact file downloaded");
  }

  function shareCard() {
    var url = publicUrl() || (window.location.protocol === "file:" ? "" : window.location.href);
    if (!url) {
      showToast("Host the folder first, then set publicUrl");
      return;
    }
    var payload = {
      title: card.name + " — " + card.brand,
      text: card.role + " · " + card.niche,
      url: url
    };
    if (navigator.share) {
      navigator.share(payload).catch(function () {});
      return;
    }
    copyText(url).then(function (ok) {
      showToast(ok ? "Link copied" : "Could not copy the link");
    });
  }

  function nfcMessage(err) {
    var name = err && err.name;
    if (name === "NotAllowedError") return "NFC was blocked. Allow it in Chrome, then try again.";
    if (name === "NotSupportedError") return "This browser cannot write NFC. Use the NFC Tools app.";
    if (name === "NotReadableError") return "Hold the sticker flat against the back of the phone.";
    if (name === "AbortError") return "Write cancelled.";
    if (name === "NetworkError") return "Keep the sticker still against the phone until it saves.";
    return "Could not write the chip. Paste the link into NFC Tools instead.";
  }

  function renderOwner() {
    var url = publicUrl();
    var code = document.getElementById("publicUrlText");
    var status = document.getElementById("nfcStatus");
    if (code) {
      code.textContent = url || "No public link yet — set publicUrl in js/config.js";
    }

    var copyLink = document.getElementById("copyLink");
    if (copyLink) {
      copyLink.addEventListener("click", function () {
        if (!url) {
          if (status) status.textContent = "Add an https link to publicUrl before writing a chip.";
          return;
        }
        copyText(url).then(function (ok) {
          if (status) status.textContent = ok ? "Link copied. Paste it into NFC Tools." : "Could not copy.";
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
        if (status) status.textContent = "This browser cannot write NFC. On iPhone or desktop, use the NFC Tools app and paste the link.";
        return;
      }
      if (status) status.textContent = "Hold a blank NTAG213 sticker to the back of the phone…";
      try {
        var ndef = new NDEFReader();
        ndef.write({
          records: [{ recordType: "url", data: url }]
        }).then(function () {
          if (status) status.textContent = "Saved. Tap the card with a phone — it should open this page.";
        }).catch(function (err) {
          if (status) status.textContent = nfcMessage(err);
        });
      } catch (err) {
        if (status) status.textContent = nfcMessage(err);
      }
    });
  }

  function renderSample() {
    var bar = document.getElementById("sampleBar");
    if (!bar) return;
    if (!card.sample) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    bar.innerHTML = "Sample card — edit <code>js/config.js</code>, then set sample to false";
  }

  try {
    renderSample();
    renderProfile();
    renderSlides();
    renderSocials();
    renderPayments();
    renderOwner();
    bindSlider();
    restartAutoplay();

    var save = document.getElementById("saveContact");
    var share = document.getElementById("shareCard");
    if (save) save.addEventListener("click", saveContact);
    if (share) share.addEventListener("click", shareCard);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.clearInterval(slideTimer);
      else restartAutoplay();
    });
  } finally {
    body.classList.add("ready");
  }
})();
