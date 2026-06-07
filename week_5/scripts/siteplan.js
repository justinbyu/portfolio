// Wait for the DOM to fully load before executing scripts
document.addEventListener("DOMContentLoaded", () => {
    console.log("EcoTrails Explorer Site Plan scripts loaded successfully.");

    // Dynamic Copyright Year Update
    const footerText = document.querySelector("footer p");
    if (footerText) {
        const currentYear = new Date().getFullYear();
        // Fixed syntax using standard string encapsulation
        footerText.innerHTML = "&copy; " + currentYear + " EcoTrails Explorer Site Plan | Prepared for WDD 131";
    }
});
