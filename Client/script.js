// ==========================================
// KAKI DIGITAL MARKETING - CUSTOM JAVASCRIPT
// ==========================================

// Mobile navigation
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", isOpen);
    });

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

// Scroll reveal animation
const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealItems.forEach(item => revealObserver.observe(item));

// Demo contact form
// Replace this with Formspree, Netlify Forms, a Cloudflare Worker,
// your own backend, or another form service when the site is deployed.
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        formMessage.textContent =
            "Thank you! Your message has been received. Connect this form to your preferred email/form service before launch.";

        contactForm.reset();
    });
}
