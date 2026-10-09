
document.addEventListener("DOMContentLoaded", () => {
    const niches = document.querySelectorAll(".niche-item");

    niches.forEach((niche) => {
        const content = niche.querySelector(".niche-content");
        const carousel = niche.querySelector(".niche-carousel");

        if (!content || !carousel) return;

        // Start with the carousel closed.
        carousel.hidden = true;

        // Make the niche keyboard-accessible.
        content.style.cursor = "pointer";
        content.setAttribute("role", "button");
        content.setAttribute("tabindex", "0");
        content.setAttribute("aria-expanded", "false");

        function toggleNiche() {
            const shouldOpen = carousel.hidden;

            // Close every other niche first.
            niches.forEach((otherNiche) => {
                const otherContent =
                    otherNiche.querySelector(".niche-content");
                const otherCarousel =
                    otherNiche.querySelector(".niche-carousel");

                if (otherCarousel) otherCarousel.hidden = true;
                if (otherContent) {
                    otherContent.setAttribute("aria-expanded", "false");
                }
            });

            // Toggle the selected niche.
            carousel.hidden = !shouldOpen;
            content.setAttribute(
                "aria-expanded",
                String(shouldOpen)
            );
        }

        content.addEventListener("click", toggleNiche);

        content.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleNiche();
            }
        });

        // Display full photos without cropping.
        carousel.querySelectorAll("img").forEach((image) => {
            image.style.objectFit = "contain";
            image.style.maxWidth = "100%";
        });
    });

    // Ensure carousel arrows and dots don't close the niche.
    document.querySelectorAll(".niche-carousel").forEach((carousel) => {
        carousel.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    });
});