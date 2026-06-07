document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize or increment the review counter in localStorage
    let reviewCount = localStorage.getItem("reviewCount");

    if (!reviewCount) {
        reviewCount = 1;
    } else {
        reviewCount = parseInt(reviewCount) + 1;
    }

    localStorage.setItem("reviewCount", reviewCount);

    // 2. Display the current updated calculation to the user
    document.getElementById("review-counter").textContent = reviewCount;

    // 3. Populate standard footer elements
    document.getElementById("current-year").textContent = new Date().getFullYear();
    document.getElementById("last-modified").textContent = document.lastModified;
});