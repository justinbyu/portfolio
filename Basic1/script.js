
/* =====================================
   TAPIND BASIC DIGITAL CARD
   Editable personal information
===================================== */

const CONFIG = {
  name: "Justin Diaz",
  title: "CEO & Founder",
  organization: "TAPIND",
  phone: "", // Add your phone number
  email: "", // Add your email
  website: "https://tapind.ph",

  banks: {
    bdo: {
      accountName: "YOUR ACCOUNT NAME",
      accountNumber: "YOUR BDO ACCOUNT NUMBER"
    },

    bpi: {
      accountName: "YOUR ACCOUNT NAME",
      accountNumber: "YOUR BPI ACCOUNT NUMBER"
    }
  }
};

/* =====================================
   BUSINESS PHOTO CAROUSEL
===================================== */

const carousel = document.getElementById("businessCarousel");
const previousButton = document.getElementById("previousSlide");
const nextButton = document.getElementById("nextSlide");
const dots = [...document.querySelectorAll(".dot")];

function getSlides() {
  return [...carousel.querySelectorAll(".slide")];
}

function getCurrentSlide() {
  const slides = getSlides();

  if (!slides.length) return 0;

  const slideWidth =
    slides[0].getBoundingClientRect().width + 12;

  return Math.max(
    0,
    Math.min(
      slides.length - 1,
      Math.round(carousel.scrollLeft / slideWidth)
    )
  );
}

function goToSlide(index) {
  const slides = getSlides();

  if (!slides.length) return;

  const safeIndex = Math.max(
    0,
    Math.min(index, slides.length - 1)
  );

  carousel.scrollTo({
    left: slides[safeIndex].offsetLeft - slides[0].offsetLeft,
    behavior: "smooth"
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

previousButton.addEventListener("click", () => {
  const current = getCurrentSlide();
  const total = getSlides().length;

  goToSlide(current === 0 ? total - 1 : current - 1);
});

nextButton.addEventListener("click", () => {
  const current = getCurrentSlide();
  const total = getSlides().length;

  goToSlide(current >= total - 1 ? 0 : current + 1);
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    goToSlide(Number(dot.dataset.slide));
  });
});

let scrollFrame;

carousel.addEventListener("scroll", () => {
  cancelAnimationFrame(scrollFrame);

  scrollFrame = requestAnimationFrame(() => {
    updateDots();
  });
});

/* =====================================
   BANK DETAILS
===================================== */

function populateBankDetails() {
  Object.entries(CONFIG.banks).forEach(([bank, details]) => {
    const bankCard = document.querySelector(
      `[data-copy-account="${bank}"]`
    )?.closest(".bank-card");

    if (!bankCard) return;

    bankCard.querySelector("[data-account-name]").textContent =
      details.accountName;

    bankCard.querySelector("[data-account-number]").textContent =
      details.accountNumber;
  });
}

populateBankDetails();

/* Copy account number */

document.querySelectorAll("[data-copy-account]").forEach((button) => {
  button.addEventListener("click", async () => {
    const bank = button.dataset.copyAccount;
    const details = CONFIG.banks[bank];
    const accountNumber = details?.accountNumber || "";

    const isPlaceholder =
      !accountNumber ||
      /YOUR|PLACEHOLDER|ACCOUNT NUMBER/i.test(accountNumber);

    if (isPlaceholder) {
      button.textContent = "Add account details first";
      return;
    }

    try {
      await navigator.clipboard.writeText(accountNumber);

      button.textContent = "Copied successfully!";

      setTimeout(() => {
        button.textContent = "Copy account number";
      }, 1800);
    } catch (error) {
      button.textContent =
        "Copy unavailable — select the number manually";
    }
  });
});

/* =====================================
   SAVE CONTACT AS VCARD
===================================== */

const saveButton = document.getElementById("saveContact");
const saveMessage = document.getElementById("saveMessage");

function escapeVCard(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function createVCard() {
  const fields = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(CONFIG.name)}`,
    `ORG:${escapeVCard(CONFIG.organization)}`,
    `TITLE:${escapeVCard(CONFIG.title)}`
  ];

  if (CONFIG.phone.trim()) {
    fields.push(`TEL;TYPE=CELL:${escapeVCard(CONFIG.phone)}`);
  }

  if (CONFIG.email.trim()) {
    fields.push(`EMAIL:${escapeVCard(CONFIG.email)}`);
  }

  if (CONFIG.website.trim()) {
    fields.push(`URL:${escapeVCard(CONFIG.website)}`);
  }

  fields.push("END:VCARD");

  return fields.join("\r\n") + "\r\n";
}

saveButton.addEventListener("click", () => {
  const vcard = createVCard();

  const file = new Blob([vcard], {
    type: "text/vcard;charset=utf-8"
  });

  const downloadURL = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = downloadURL;
  link.download = "Justin-Diaz-TAPIND.vcf";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);

  saveMessage.textContent =
    "Contact file downloaded. Open it to save the contact.";

  saveMessage.setAttribute("role", "status");
});

/* =====================================
   FOOTER YEAR
===================================== */

document.getElementById("currentYear").textContent =
  new Date().getFullYear();
