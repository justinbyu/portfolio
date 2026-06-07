// Product Array provided by assignment guidelines
const products = [
    { id: "fc-1888", name: "flux capacitor", averagerating: 4.5 },
    { id: "fc-2050", name: "power laces", averagerating: 4.7 },
    { id: "fs-1987", name: "time circuits", averagerating: 3.5 },
    { id: "ac-2000", name: "low voltage reactor", averagerating: 3.9 },
    { id: "jj-1969", name: "warp equalizer", averagerating: 5.0 }
];

document.addEventListener("DOMContentLoaded", () => {
    const productSelect = document.getElementById("product-name");

    // Dynamically build the product options
    products.forEach(product => {
        const option = document.createElement("option");
        option.value = product.id; // Sets value attribute to the product's id
        option.textContent = product.name; // Displays the name to the user
        productSelect.appendChild(option);
    });

    // Populate common footer elements
    document.getElementById("current-year").textContent = new Date().getFullYear();
    document.getElementById("last-modified").textContent = document.lastModified;
});