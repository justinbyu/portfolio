// Current Year
const currentYear = document.querySelector("#currentyear");
currentYear.textContent = new Date().getFullYear();

// Last Modified Date
const lastModified = document.querySelector("#lastModified");
lastModified.textContent = `Last Modified: ${document.lastModified}`;