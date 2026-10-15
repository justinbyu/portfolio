/* ============================================================
   EDIT THIS FILE ONLY
   Save, then refresh the browser.

   The card shows no account numbers.
   GCash and BDO each open their own page with a QR.

   To use your real QR:
   1. In the GCash app, open your receive QR and save the image.
   2. Put that image in this folder as images/gcash-qr.png
   3. Set qrImage below to "images/gcash-qr.png"
   4. Do the same for BDO with images/bdo-qr.png
   Or paste the text encoded in the QR into qrPayload.

   NFC: host this folder, paste the https link into publicUrl,
   then write that link onto a blank NTAG213 sticker.
   ============================================================ */

window.CARD = {
  // Set false after you replace the sample links and QR images.
  sample: true,

  // Public https link of index.html, after you host the folder.
  publicUrl: "",

  brand: "TAPIND",
  cardLabel: "TAPIND DIGITAL CARD",
  name: "Justin Diaz",
  role: "CEO & Founder",
  bio: "Digital solutions designed to help businesses connect, grow, and stand out.",
  tagline: "TAPIND · Tap. Connect. Grow.",

  // Used for Save contact. Leave "" to hide them from the contact file.
  phone: "",
  email: "",
  location: "",

  niche: "Web Development",

  socials: [
    {
      name: "Instagram",
      url: "https://instagram.com/tapind",
      icon: "instagram"
    },
    {
      name: "Facebook",
      url: "https://facebook.com/tapind",
      icon: "facebook"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@tapind",
      icon: "tiktok"
    }
  ],

  slides: [
    {
      image: "images/slide-1.jpg",
      title: "Product sites",
      caption: "Quiet pages for growing teams."
    },
    {
      image: "images/slide-2.jpg",
      title: "Mobile flows",
      caption: "Short paths from tap to action."
    },
    {
      image: "images/slide-3.jpg",
      title: "Systems",
      caption: "Structure behind the screen."
    }
  ],

  // No numbers are shown on the card. Each row opens its own page.
  payments: [
    {
      id: "gcash",
      name: "GCash",
      page: "gcash.html",
      accountName: "Justin Diaz",
      qrImage: "",
      qrPayload: "",
      androidPackage: "com.globe.gcash.android",
      androidStore: "https://play.google.com/store/apps/details?id=com.globe.gcash.android",
      iosStore: "https://apps.apple.com/ph/app/gcash/id520020791",
      // Used on iPhone to open the installed app. Clear it if the phone says the link is invalid.
      scheme: "gcash://"
    },
    {
      id: "bdo",
      name: "BDO",
      page: "bdo.html",
      accountName: "Justin Diaz",
      qrImage: "",
      qrPayload: "",
      androidPackage: "ph.com.bdo.retail",
      androidStore: "https://play.google.com/store/apps/details?id=ph.com.bdo.retail",
      iosStore: "https://apps.apple.com/app/bdo-online/id1551584630",
      scheme: ""
    }
  ]
};
