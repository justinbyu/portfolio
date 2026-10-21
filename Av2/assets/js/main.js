/* Allanese Medical Aesthetics — Motion UI + interactions
   Brief §5: scroll reveal with stagger · smooth nav · prefers-reduced-motion respected.
   Brief §7/§11: the appointment form is a FRONT-END DEMO ONLY — it never sends or stores data. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) document.documentElement.classList.add("no-motion");
  /* Only pre-hide reveal content if we can definitely reveal it again */
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("reveal-ready");
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "✕ Close" : "☰ Menu";
    };
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
  }

  /* ---------- Scroll reveal (staggered within [data-stagger] groups) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      group.querySelectorAll(".reveal").forEach(function (el, i) {
        el.style.setProperty("--d", Math.min(i * 90, 450) + "ms");
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ accordion (one open at a time, fully keyboard accessible) ---------- */
  var faqBtns = document.querySelectorAll(".faq-q");
  faqBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      faqBtns.forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
        document.getElementById(b.getAttribute("aria-controls")).hidden = true;
      });
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        document.getElementById(btn.getAttribute("aria-controls")).hidden = false;
      }
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.querySelector("dialog.lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector("figcaption");
    document.querySelectorAll(".gallery-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var img = item.querySelector("img");
        var cap = item.querySelector("figcaption");
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = cap ? cap.textContent : img.alt;
        lightbox.showModal();
      });
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", function () { lightbox.close(); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) lightbox.close(); });
  }

  /* ---------- Appointment form — DEMO ONLY (Brief §7, §11) ----------
     Validates locally and shows a clearly-worded demo message.
     NOTHING is transmitted or stored. Connect a booking provider /
     secure backend before launch (Brief §7, §10). */
  document.querySelectorAll("form.appointment-form").forEach(function (form) {
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

    /* Pre-select the service when arriving from a service card (book.html?service=…) */
    var wanted = new URLSearchParams(window.location.search).get("service");
    var serviceSelect = form.querySelector('[name="service"]');
    if (wanted && serviceSelect && serviceSelect.querySelector('option[value="' + wanted + '"]')) {
      serviceSelect.value = wanted;
    }

    var showError = function (input, msg) {
      var err = form.querySelector('[data-error-for="' + input.id + '"]');
      input.setAttribute("aria-invalid", "true");
      if (err) { err.textContent = msg; err.classList.add("show"); }
    };
    var clearError = function (input) {
      var err = form.querySelector('[data-error-for="' + input.id + '"]');
      input.removeAttribute("aria-invalid");
      if (err) { err.textContent = ""; err.classList.remove("show"); }
    };
    form.querySelectorAll("input,select,textarea").forEach(function (input) {
      input.addEventListener("input", function () { clearError(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var firstBad = null;

      form.querySelectorAll("[required]").forEach(function (input) {
        var bad = false, msg = "This field is required.";
        if (input.type === "checkbox") { bad = !input.checked; msg = "Please confirm we may contact you about this request."; }
        else if (!input.value.trim()) bad = true;
        else if (input.type === "tel" && !/^[+\d][\d\s()\-]{6,}$/.test(input.value.trim())) { bad = true; msg = "Please enter a valid contact number."; }
        else if (input.type === "email" && input.value && !/^\S+@\S+\.\S+$/.test(input.value.trim())) { bad = true; msg = "Please enter a valid email address."; }
        if (bad) { showError(input, msg); if (!firstBad) firstBad = input; } else clearError(input);
      });

      if (firstBad) {
        status.className = "form-status show error";
        status.textContent = "Please check the highlighted fields and try again.";
        firstBad.focus();
        return;
      }
      var name = form.querySelector('[name="full_name"]').value.trim();
      var service = form.querySelector('[name="service"]');
      var serviceText = service.options[service.selectedIndex].text;
      status.className = "form-status show success";
      status.innerHTML = "<strong>Thank you, " + name.replace(/</g, "&lt;") + " — this is a demo.</strong> " +
        "Your request for <em>" + serviceText.replace(/</g, "&lt;") + "</em> was <strong>not sent or stored</strong>. " +
        "This prototype form must be connected to the clinic's booking system before launch. " +
        "To book in the meantime, please use the clinic's official contact details.";
      status.setAttribute("tabindex", "-1");
      status.focus();
      form.reset();
    });
  });

  /* ---------- Hero carousel (UI refresh) ---------- */
  var carousel = document.querySelector(".carousel");
  if (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var viewport = carousel.querySelector(".carousel-viewport");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
    var index = 0, timer = null;

    var go = function (i) {
      index = ((i % slides.length) + slides.length) % slides.length;
      var slide = slides[index];
      var x = slide.offsetLeft - (viewport.clientWidth - slide.clientWidth) / 2;
      track.style.transform = "translateX(" + (-x) + "px)";
      slides.forEach(function (sl, k) {
        sl.setAttribute("aria-hidden", k === index ? "false" : "true");
        if ("inert" in sl) sl.inert = k !== index; /* keep peeking slides out of tab order */
      });
      dots.forEach(function (d, k) {
        if (k === index) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var play = function () {
      if (reduceMotion || timer) return; /* no autoplay for reduced-motion users */
      timer = setInterval(function () { if (!document.hidden) go(index + 1); }, 6000);
    };
    carousel.querySelector("[data-carousel-prev]").addEventListener("click", function () { go(index - 1); });
    carousel.querySelector("[data-carousel-next]").addEventListener("click", function () { go(index + 1); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); }); });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", play);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", play);
    window.addEventListener("resize", function () { go(index); });
    go(0); play();
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
