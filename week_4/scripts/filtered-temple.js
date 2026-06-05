// 1. Array of Temple Objects (7 original entries + 3 custom student additions)
const temples = [
  {
    templeName: "Aba Nigeria",
    location: "Aba, Nigeria",
    dedicated: "2005, August, 7",
    area: 11500,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
  },
  {
    templeName: "Manti Utah",
    location: "Manti, Utah, United States",
    dedicated: "1888, May, 21",
    area: 74792,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-765878-wallpaper.jpg"
  },
  {
    templeName: "Payson Utah",
    location: "Payson, Utah, United States",
    dedicated: "2015, June, 7",
    area: 96630,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
  },
  {
    templeName: "Yigo Guam",
    location: "Yigo, Guam",
    dedicated: "2020, May, 2",
    area: 6861,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
  },
  {
    templeName: "Washington D.C.",
    location: "Kensington, Maryland, United States",
    dedicated: "1974, November, 19",
    area: 156558,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
  },
  {
    templeName: "Lima Perú",
    location: "Lima, Perú",
    dedicated: "1986, January, 10",
    area: 9600,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
  },
  {
    templeName: "Mexico City Mexico",
    location: "Mexico City, Mexico",
    dedicated: "1983, December, 2",
    area: 116642,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
  },
  {
    templeName: "Salt Lake",
    location: "Salt Lake City, Utah, United States",
    dedicated: "1893, April, 6",
    area: 253015,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/salt-lake-city-utah/400x250/salt-lake-temple-37-1011.jpg"
  },
  {
    templeName: "Rome Italy",
    location: "Rome, Italy",
    dedicated: "2019, March, 10",
    area: 40000,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/rome-italy/2019/400x250/2-Rome-Temple-2190312.jpg"
  },
  {
    templeName: "Paris France",
    location: "Le Chesnay, France",
    dedicated: "2017, May, 21",
    area: 44175,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/paris-france/400x250/paris-france-temple-exterior-1905403.jpg"
  }
];

// 2. Select HTML Elements safely
const gridContainer = document.querySelector(".temple-grid");
const galleryTitle = document.getElementById("gallery-title");

// 3. Dynamic Generation Function (Uses safe single/double quote logic)
function createTempleCards(filteredTemples) {
  if (!gridContainer) return; 
  
  gridContainer.innerHTML = "";
  
  filteredTemples.forEach(function(temple) {
    let card = document.createElement("section");
    card.className = "temple-card";

    let name = document.createElement("h3");
    name.textContent = temple.templeName;

    let location = document.createElement("p");
    location.innerHTML = '<span class="label">Location:</span> ' + temple.location;

    let dedicated = document.createElement("p");
    dedicated.innerHTML = '<span class="label">Dedicated:</span> ' + temple.dedicated;

    let area = document.createElement("p");
    area.innerHTML = '<span class="label">Size:</span> ' + temple.area.toLocaleString() + ' sq ft';

    let img = document.createElement("img");
    img.src = temple.imageUrl;
    img.alt = temple.templeName + " Temple"; 
    img.loading = "lazy"; 
    img.width = 400;      
    img.height = 250;     

    card.appendChild(name);
    card.appendChild(location);
    card.appendChild(dedicated);
    card.appendChild(area);
    card.appendChild(img);

    gridContainer.appendChild(card);
  });
}

// 4. Setup Navigation Filtering Mechanisms
const homeNav = document.getElementById("home-nav");
const oldNav = document.getElementById("old-nav");
const newNav = document.getElementById("new-nav");
const largeNav = document.getElementById("large-nav");
const smallNav = document.getElementById("small-nav");

if (homeNav) {
  homeNav.addEventListener("click", function(e) {
    updateActiveNav(e.target, "Home");
    createTempleCards(temples);
  });
}

if (oldNav) {
  oldNav.addEventListener("click", function(e) {
    updateActiveNav(e.target, "Old Temples");
    const oldTemples = temples.filter(function(temple) {
      const year = parseInt(temple.dedicated.split(",")[0].trim());
      return year < 1900;
    });
    createTempleCards(oldTemples);
  });
}

if (newNav) {
  newNav.addEventListener("click", function(e) {
    updateActiveNav(e.target, "New Temples");
    const newTemples = temples.filter(function(temple) {
      const year = parseInt(temple.dedicated.split(",")[0].trim());
      return year > 2000;
    });
    createTempleCards(newTemples);
  });
}

if (largeNav) {
  largeNav.addEventListener("click", function(e) {
    updateActiveNav(e.target, "Large Temples");
    const largeTemples = temples.filter(function(temple) {
      return temple.area > 90000;
    });
    createTempleCards(largeTemples);
  });
}

if (smallNav) {
  smallNav.addEventListener("click", function(e) {
    updateActiveNav(e.target, "Small Temples");
    const smallTemples = temples.filter(function(temple) {
      return temple.area < 10000;
    });
    createTempleCards(smallTemples);
  });
}

// Handles Active Highlighting State & Header Updating Switches
function updateActiveNav(element, titleText) {
  document.querySelectorAll(".navigation a").forEach(function(a) {
    a.classList.remove("active");
  });
  element.classList.add("active");
  if (galleryTitle) {
    galleryTitle.textContent = titleText;
  }
}

// 5. Responsive Hamburger Menu Controller logic
const mainnav = document.querySelector('.navigation');
const hambutton = document.querySelector('#menu');

if (hambutton && mainnav) {
  hambutton.addEventListener('click', function() {
      mainnav.classList.toggle('show');
      hambutton.classList.toggle('show');
  });
}

// 6. Dynamic Context Dates Generation Block
const currentYearEl = document.getElementById("currentyear");
const lastModifiedEl = document.getElementById("lastModified");

if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
if (lastModifiedEl) lastModifiedEl.textContent = document.lastModified;

// Fire generation display right away
createTempleCards(temples);
