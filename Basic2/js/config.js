/* ============================================================
   EDIT THIS FILE ONLY
   Save, then refresh the browser.

   This is a sample NFC business card for a freelance creative.
   Replace the text, links, and payment numbers before you share it.

   NFC cards do not store the whole page. They store a link.
   1. Put this folder online so it has an https address.
   2. Paste that address into publicUrl below.
   3. Write the chip from the "Card owner" section on the page,
      or with the NFC Tools app (needed on iPhone).
   ============================================================ */

window.CARD = {
  // Turn this off after you replace the sample name, links, and numbers.
  sample: true,

  // Public https link of this page, after you host the folder.
  // Example: "https://your-name.netlify.app"
  // Leave "" until the site is online. A file on your computer cannot be opened by a tap.
  publicUrl: "",

  brand: "Field & Form",
  name: "Lina Vargas",
  role: "Freelance Creative",
  location: "Quezon City",

  phone: "+63 917 000 0000",
  email: "hello@fieldandform.example",

  // The one business niche.
  niche: "Creative services",
  nicheSummary: "Brand identity, campaigns, and social content for small studios.",

  portrait: "images/portrait.jpg",

  // Exactly three socials. Change name, handle, and url.
  socials: [
    {
      name: "Instagram",
      handle: "@fieldandform",
      url: "https://instagram.com/fieldandform",
      icon: "instagram"
    },
    {
      name: "Facebook",
      handle: "Field & Form",
      url: "https://facebook.com/fieldandform",
      icon: "facebook"
    },
    {
      name: "TikTok",
      handle: "@fieldandform",
      url: "https://www.tiktok.com/@fieldandform",
      icon: "tiktok"
    }
  ],

  // Three pictures in the slider. Drop new jpgs in /images and update the paths.
  slides: [
    {
      image: "images/slide-1.jpg",
      title: "Identity system",
      caption: "Stationery and a quiet mark for a new studio."
    },
    {
      image: "images/slide-2.jpg",
      title: "Social set",
      caption: "Content cards for a seasonal launch."
    },
    {
      image: "images/slide-3.jpg",
      title: "Packaging",
      caption: "Box, sleeve, and a small geometric mark."
    }
  ],

  // Two ways to pay. Numbers below are fake samples.
  payments: [
    {
      name: "GCash",
      accountName: "Lina Vargas",
      number: "0917 000 0000",
      detail: "Sample wallet number — replace before sharing"
    },
    {
      name: "BDO",
      accountName: "Lina Vargas",
      number: "0000 0000 0000",
      detail: "Sample savings number — replace before sharing"
    }
  ]
};
