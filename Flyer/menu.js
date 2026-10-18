/* ============================================================
   CLIENT SLIDES
   This is the file you edit for each client.

   1. Put their photo in images/slides/  (jpg or png)
   2. Replace images/logo.png with the business logo.
   3. Change the name, price, and image path below.
   3. Copy one block to add another slide.

   Ten slides is the minimum. Add as many as the client needs.
   Do not put account numbers here. Order now opens a QR page.
   ============================================================ */

window.MARKETING = {
  // Change the first slide before the lunch rush. The code below changes by itself every Monday.
  weekPrefix: "HEARTH",
  lunchStart: 11,
  lunchEnd: 14,
  prizes: [
    { label: "Free ice tea", code: "TEA", weight: 2 },
    { label: "$5 off today's plate", code: "5OFF", weight: 2 },
    { label: "Free fries", code: "FRIES", weight: 1 },
    { label: "10% off", code: "10OFF", weight: 3 },
    { label: "Try again next visit", code: "", weight: 4 }
  ]
};

window.CLIENT = {
  name: "Hearth",
  currency: "$",
  logo: "images/logo.png",
  tagline: "Straight from the kitchen. See the plate, then order it.",
  // Leave blank to use the temporary store.html. Paste the owner's real https site when they have one.
  storeUrl: "",
  phone: "",
  email: "",
  socials: [
    { name: "Instagram", href: "https://instagram.com/tapind_justin", mark: "IG" },
    { name: "Facebook", href: "https://facebook.com/", mark: "f" },
    { name: "TikTok", href: "https://tiktok.com/@tapind_justin", mark: "♪" }
  ]
};

window.SLIDES = [
  { name: "Today's Fries", price: "40", was: "55", promo: "Today only", ends: "until close", endsAt: "23:00", left: 12, saveNote: "Save this picture. Show it when you order.", addOn: "Add ice tea", addOnPrice: "5", detail: "Was $55. Until close, while it lasts.", image: "images/slides/04.jpg" },
  { name: "Beef Steak", price: "70", detail: "From the grill.", image: "images/slides/01.jpg" },
  { name: "Pasta", price: "50", detail: "House pasta.", image: "images/slides/02.jpg" },
  { name: "Salmon Fillet", price: "50", detail: "", image: "images/slides/03.jpg" },
  { name: "Fries", price: "55", detail: "", image: "images/slides/04.jpg" },
  { name: "Ice Tea", price: "50", detail: "", image: "images/slides/05.jpg" },
  { name: "Milkshake", price: "50", detail: "", image: "images/slides/06.jpg" },
  { name: "Ice Chocolate", price: "70", detail: "", image: "images/slides/07.jpg" },
  { name: "Signature Facial", price: "125", detail: "75 min. Mature skin and a custom mask.", image: "images/slides/08.jpg" },
  { name: "Bright Peel", price: "120", detail: "30 min. A light peel.", image: "images/slides/09.jpg" },
  { name: "Moisture Infusion", price: "100", detail: "60 min. For dry skin.", image: "images/slides/10.jpg" },
  { name: "Silver Pack", price: "125", detail: "Dust, floors, kitchen, and bathrooms.", image: "images/slides/11.jpg" },
  { name: "Platinum Pack", price: "225", detail: "Silver, plus inside appliances.", image: "images/slides/12.jpg" }
];
