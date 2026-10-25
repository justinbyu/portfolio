/* =====================================
   ALR STEEL DIGITAL CARD — MARKETING EDITION
   Editable personal information
===================================== */

const CONFIG = {
  name: "Jenny Joven Beria",
  title: "ALR Steel Fabrication and Services OPC",
  organization: "ALR Steel Fabrication and Services OPC",
  phone: "09933234360", // Also update CONTACT in contact.js
  email: "alr_kitssa@yahoo.com", // Also update CONTACT in contact.js
  website: "", // Add the business website, or leave blank

  // Paste the public https link of this page after you host the folder.
  // Example: "https://yourname.github.io/my-digital-card/index.html"
  publicUrl: ""
};

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================
   WORK CAROUSEL (horizontal swipe)
===================================== */

const carousel = document.getElementById("workCarousel");
const dots = [...document.querySelectorAll(".work-dot")];

function getSlides() {
  if (!carousel) return [];
  return [...carousel.querySelectorAll(".slide")];
}

function getCurrentSlide() {
  const slides = getSlides();
  if (!slides.length) return 0;

  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let best = 0;
  let bestDistance = Infinity;

  slides.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(slideCenter - center);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });

  return best;
}

function goToSlide(index) {
  const slides = getSlides();
  if (!slides.length) return;

  const total = slides.length;
  const safeIndex = ((index % total) + total) % total;
  const slide = slides[safeIndex];

  carousel.scrollTo({
    left: slide.offsetLeft - (carousel.clientWidth - slide.clientWidth) / 2,
    behavior: REDUCED_MOTION ? "auto" : "smooth"
  });

  updateDots(safeIndex);
}

function updateDots(index = getCurrentSlide()) {
  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;
    dot.classList.toggle("active", isActive);
    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

if (carousel) {
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goToSlide(Number(dot.dataset.slide));
    });
  });

  carousel.querySelectorAll(".slide-next").forEach((button) => {
    button.addEventListener("click", () => {
      goToSlide(getCurrentSlide() + 1);
    });
  });

  let scrollFrame;
  carousel.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => updateDots());
  }, { passive: true });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") goToSlide(getCurrentSlide() + 1);
    if (event.key === "ArrowLeft") goToSlide(getCurrentSlide() - 1);
  });

  updateDots(0);
}

/* =====================================
   SCROLL REVEAL — fade sections in
===================================== */

const revealTargets = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !REDUCED_MOTION) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("visible"));
}

/* =====================================
   COUNT-UP STATS
===================================== */

const statNums = document.querySelectorAll(".stat-num");

function animateCount(element) {
  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";

  if (REDUCED_MOTION || target <= 0) {
    element.textContent = target + suffix;
    return;
  }

  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    element.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

if ("IntersectionObserver" in window && !REDUCED_MOTION) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach((stat) => statObserver.observe(stat));
} else {
  statNums.forEach((stat) => animateCount(stat));
}

/* =====================================
   SAVE CONTACT — opens the contact page
===================================== */

const saveButton = document.getElementById("saveContact");
const quickSave = document.getElementById("quickSave");

function openContactPage() {
  window.location.href = "contact.html";
}

if (saveButton) saveButton.addEventListener("click", openContactPage);
if (quickSave) quickSave.addEventListener("click", openContactPage);

/* =====================================
   SHARE CARD
===================================== */

const shareButton = document.getElementById("shareCard");
const shareMessage = document.getElementById("shareMessage");

function cardUrl() {
  const configured = (CONFIG.publicUrl || "").trim();
  if (/^https:\/\//i.test(configured)) return configured;
  return window.location.href;
}

function setShareMessage(message) {
  if (shareMessage) {
    shareMessage.textContent = message;
    shareMessage.setAttribute("role", "status");
  }
}

if (shareButton) {
  shareButton.addEventListener("click", async () => {
    const url = cardUrl();
    const shareData = {
      title: CONFIG.name + " | ALR Steel Fabrication",
      text: "Connect with " + CONFIG.name + " — " + CONFIG.organization,
      url: url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareMessage("Thanks for sharing!");
      } catch (error) {
        if (error && error.name !== "AbortError") {
          setShareMessage("Share was blocked by the browser.");
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Card link copied — paste it anywhere to share.");
    } catch (error) {
      setShareMessage("Copy this page address to share the card.");
    }
  });
}

/* =====================================
   FOOTER YEAR
===================================== */

const year = document.getElementById("currentYear");
if (year) year.textContent = new Date().getFullYear();
