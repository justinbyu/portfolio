document.addEventListener("DOMContentLoaded", () => {
    // 1. Automate footer credentials
    const yearSpan = document.getElementById("currentYear"); // Double-check if your HTML ID is "currentYear" or "currend"
    const modifiedSpan = document.getElementById("lastModified"); // Double-check if your HTML ID is "lastModified" or "ls"

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    if (modifiedSpan) {
        modifiedSpan.textContent = document.lastModified;
    }

    // 2. Extract and process weather data
    const tempElement = document.getElementById("current-temp");
    const windElement = document.getElementById("wind-speed");
    const chillDisplay = document.getElementById("wind-chill");

    if (tempElement && windElement && chillDisplay) {
        const temperature = parseFloat(tempElement.textContent);
        const windSpeed = parseFloat(windElement.textContent);
        
        // Example: If you need to calculate wind chill later, you have the numbers ready here:
        // chillDisplay.textContent = calculateWindChill(temperature, windSpeed);
    }
});
