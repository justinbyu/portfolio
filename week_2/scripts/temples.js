document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Hamburger Responsive Menu Logic ---
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            // Toggles visibility of mobile navigation link block element
            navMenu.classList.toggle("show");
            
            // Switch hamburger characters to 'X' close visual dynamic clue
            if (navMenu.classList.contains("show")) {
                menuToggle.textContent = "✕";
                menuToggle.setAttribute("aria-expanded", "true");
            } else {
                menuToggle.textContent = "☰";
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // --- 2. Dynamic Footer Copyright Year ---
    const currentYearSpan = document.getElementById("current-year");
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- 3. Dynamic Last Modified Date Stamp ---
    const lastModifiedSpan = document.getElementById("last-modified-date");
    if (lastModifiedSpan) {
        lastModifiedSpan.textContent = document.lastModified;
    }
});