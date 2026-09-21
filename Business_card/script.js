/* =====================================================
   DIGITAL BUSINESS CARD
   PROFILE + CONTACT + SOCIAL + PAYMENTS
===================================================== */


/* =====================================================
   CLIENT DATA
===================================================== */

const defaultData = {

    profile: {

        name: "Justin Diaz",

        title: "CEO / Business Owner",

        bio: "Digital business solutions, QR products and more.",

        photo: ""

    },


    contact: {

        phone: "09623017609",

        email: "justin@example.com",

        address: "Metro Manila, Philippines"

    },


    social: {

        facebook: "https://facebook.com/",

        instagram: "https://instagram.com/",

        tiktok: "https://tiktok.com/",

        messenger: ""

    },


    /* =================================================
       PAYMENT METHODS
    ================================================= */

    payments: [

        {

            id: "gcash",

            enabled: true,

            name: "GCash",

            accountName: "Justin Diaz",

            accountNumber: "09623017609",

            icon: "fa-mobile-screen-button",

            iconClass: "gcash",

            link: "https://gcash.com/"

        },


        {

            id: "maya",

            enabled: true,

            name: "Maya",

            accountName: "Justin Diaz",

            accountNumber: "09181234567",

            icon: "fa-wallet",

            iconClass: "maya",

            link: "https://www.maya.ph/"

        },


        {

            id: "bdo",

            enabled: true,

            name: "BDO",

            accountName: "Justin Diaz",

            accountNumber: "1234567890",

            icon: "fa-building-columns",

            iconClass: "bank",

            link: "#"

        },


        {

            id: "bpi",

            enabled: false,

            name: "BPI",

            accountName: "Justin Diaz",

            accountNumber: "1234567890",

            icon: "fa-building-columns",

            iconClass: "bpi",

            link: "#"

        },


        {

            id: "gotyme",

            enabled: false,

            name: "GoTyme",

            accountName: "Justin Diaz",

            accountNumber: "09191234567",

            icon: "fa-building-columns",

            iconClass: "gotyme",

            link: "#"

        },


        {

            id: "paypal",

            enabled: false,

            name: "PayPal",

            accountName: "Justin Diaz",

            accountNumber: "justin@example.com",

            icon: "fa-paypal",

            iconClass: "paypal",

            brandIcon: true,

            link: "https://www.paypal.com/"

        }

    ]

};


/* =====================================================
   LOAD CLIENT DATA
===================================================== */

let cardData = loadCardData();


function loadCardData() {

    const savedData = localStorage.getItem(
        "digitalBusinessCard"
    );

    if (!savedData) {

        return defaultData;

    }

    try {

        return JSON.parse(savedData);

    } catch (error) {

        console.error(
            "Could not load saved card data:",
            error
        );

        return defaultData;

    }

}


/* =====================================================
   SAVE CLIENT DATA
===================================================== */

function saveCardData() {

    localStorage.setItem(
        "digitalBusinessCard",
        JSON.stringify(cardData)
    );

}


/* =====================================================
   PROFILE
===================================================== */

function renderProfile() {

    document.getElementById("name").textContent =
        cardData.profile.name || "";

    document.getElementById("title").textContent =
        cardData.profile.title || "";

    document.getElementById("bio").textContent =
        cardData.profile.bio || "";


    const photo =
        document.getElementById("profilePhoto");

    if (cardData.profile.photo) {

        photo.src =
            cardData.profile.photo;

        photo.style.display =
            "block";

    } else {

        photo.style.display =
            "none";

    }

}


/* =====================================================
   CONTACT INFORMATION
===================================================== */

function renderContact() {

    const phoneRow =
        document.getElementById("phoneRow");

    const emailRow =
        document.getElementById("emailRow");

    const addressRow =
        document.getElementById("addressRow");


    /* PHONE */

    if (cardData.contact.phone) {

        document.getElementById("phone").textContent =
            cardData.contact.phone;

        phoneRow.href =
            `tel:${cardData.contact.phone}`;

        phoneRow.style.display =
            "flex";

    } else {

        phoneRow.style.display =
            "none";

    }


    /* EMAIL */

    if (cardData.contact.email) {

        document.getElementById("email").textContent =
            cardData.contact.email;

        emailRow.href =
            `mailto:${cardData.contact.email}`;

        emailRow.style.display =
            "flex";

    } else {

        emailRow.style.display =
            "none";

    }


    /* ADDRESS */

    if (cardData.contact.address) {

        document.getElementById("address").textContent =
            cardData.contact.address;

        addressRow.style.display =
            "flex";

    } else {

        addressRow.style.display =
            "none";

    }

}


/* =====================================================
   SOCIAL MEDIA
===================================================== */

function renderSocialLinks() {

    const container =
        document.getElementById("socialLinks");

    container.innerHTML = "";


    const socialIcons = {

        facebook: "fa-facebook-f",

        instagram: "fa-instagram",

        tiktok: "fa-tiktok",

        messenger: "fa-facebook-messenger"

    };


    Object.entries(cardData.social)
        .forEach(([platform, url]) => {

            if (!url) return;


            const link =
                document.createElement("a");

            link.href = url;

            link.target = "_blank";

            link.rel = "noopener noreferrer";

            link.title = platform;


            const icon =
                document.createElement("i");

            icon.className =
                `fa-brands ${socialIcons[platform] || "fa-link"}`;


            link.appendChild(icon);

            container.appendChild(link);

        });

}


/* =====================================================
   PAYMENT METHODS
===================================================== */

function renderPayments() {

    const section =
        document.getElementById("paymentSection");

    const container =
        document.getElementById("paymentList");


    container.innerHTML = "";


    /* Get only enabled payment methods */

    const enabledPayments =
        cardData.payments.filter(
            payment => payment.enabled === true
        );


    /* Hide entire payment section
       if there are no payments */

    if (enabledPayments.length === 0) {

        section.style.display =
            "none";

        return;

    }


    section.style.display =
        "block";


    enabledPayments.forEach(payment => {

        const row =
            document.createElement("a");


        row.className =
            "payment-row";


        row.href =
            payment.link || "#";


        /* Only open external links
           in a new tab */

        if (
            payment.link &&
            payment.link !== "#"
        ) {

            row.target =
                "_blank";

            row.rel =
                "noopener noreferrer";

        }


        /* ICON */

        const iconContainer =
            document.createElement("div");


        iconContainer.className =
            `payment-icon ${payment.iconClass || ""}`;


        const icon =
            document.createElement("i");


        if (payment.brandIcon) {

            icon.className =
                `fa-brands ${payment.icon}`;

        } else {

            icon.className =
                `fa-solid ${payment.icon}`;

        }


        iconContainer.appendChild(icon);


        /* INFORMATION */

        const info =
            document.createElement("div");


        info.className =
            "payment-info";


        const name =
            document.createElement("strong");


        name.textContent =
            payment.name;


        const account =
            document.createElement("span");


        /*
            Displays:

            Justin Diaz
            09171234567

            OR

            Justin Diaz
            justin@email.com
        */

        if (payment.accountName) {

            account.textContent =
                `${payment.accountName} • ${payment.accountNumber || ""}`;

        } else {

            account.textContent =
                payment.accountNumber || "";

        }


        info.appendChild(name);

        info.appendChild(account);


        /* CHEVRON */

        const arrow =
            document.createElement("i");


        arrow.className =
            "fa-solid fa-chevron-right chevron";


        /* BUILD ROW */

        row.appendChild(iconContainer);

        row.appendChild(info);

        row.appendChild(arrow);


        container.appendChild(row);

    });

}


/* =====================================================
   COPY DETAILS
===================================================== */

function copyDetails() {

    const profile =
        cardData.profile;

    const contact =
        cardData.contact;


    let text = "";

    text += `${profile.name}\n`;

    text += `${profile.title}\n\n`;

    if (profile.bio) {

        text += `${profile.bio}\n\n`;

    }


    if (contact.phone) {

        text += `Phone: ${contact.phone}\n`;

    }


    if (contact.email) {

        text += `Email: ${contact.email}\n`;

    }


    if (contact.address) {

        text += `Address: ${contact.address}\n`;

    }


    navigator.clipboard
        .writeText(text)
        .then(() => {

            showToast(
                "Details copied!"
            );

        })
        .catch(error => {

            console.error(
                "Copy failed:",
                error
            );

        });

}


/* =====================================================
   SAVE CONTACT TO PHONE
===================================================== */

function saveContact() {

    const profile =
        cardData.profile;

    const contact =
        cardData.contact;


    const vCard = [

        "BEGIN:VCARD",

        "VERSION:3.0",

        `FN:${profile.name}`,

        `TITLE:${profile.title}`,

        `TEL:${contact.phone}`,

        `EMAIL:${contact.email}`,

        `ADR:;;${contact.address}`,

        "END:VCARD"

    ].join("\n");


    const blob =
        new Blob(
            [vCard],
            {
                type:
                    "text/vcard"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `${profile.name || "contact"}.vcf`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    showToast(
        "Contact downloaded!"
    );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


/* =====================================================
   BUTTON EVENTS
===================================================== */

document
    .getElementById("copyButton")
    .addEventListener(
        "click",
        copyDetails
    );


document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveContact
    );


/* =====================================================
   INITIALIZE CARD
===================================================== */

renderProfile();

renderContact();

renderSocialLinks();

renderPayments();