// ======================================================
// DIGITAL BUSINESS CARD
// CUSTOMIZE YOUR CUSTOMER HERE
// ======================================================


const CARD = {

    // ==========================================
    // PERSONAL INFORMATION
    // ==========================================

    name: "Justin",

    title: "CEO",

    bio: "Unemployed Final boss",


    // ==========================================
    // PROFILE PHOTO
    // ==========================================

    photo: "images/justin.jpg",


    // ==========================================
    // CONTACT INFORMATION
    // ==========================================

    phone: "+63 912 345 6789",

    email: "you@email.com",

    address: "Manila, Philippines",


    // ==========================================
    // SOCIAL MEDIA
    // ==========================================

    facebook: "https://facebook.com/",

    instagram: "https://instagram.com/",

    tiktok: "https://tiktok.com/",

    linkedin: "",

    website: "",


    // ==========================================
    // CHOOSE WHICH SOCIAL MEDIA TO SHOW
    // ==========================================

    showFacebook: true,

    showInstagram: true,

    showTikTok: true,

    showLinkedIn: false,

    showWebsite: false

};



// ======================================================
// DO NOT NEED TO EDIT BELOW THIS LINE
// ======================================================


// ==========================================
// PROFILE
// ==========================================

document.getElementById("name").textContent =
    CARD.name;

document.getElementById("title").textContent =
    CARD.title;

document.getElementById("bio").textContent =
    CARD.bio;

document.getElementById("profilePhoto").src =
    CARD.photo;


// ==========================================
// PHONE
// ==========================================

if (CARD.phone) {

    document.getElementById("phone").textContent =
        CARD.phone;

    document.getElementById("phoneRow").href =
        "tel:" + CARD.phone;

} else {

    document.getElementById("phoneRow").style.display =
        "none";

}


// ==========================================
// EMAIL
// ==========================================

if (CARD.email) {

    document.getElementById("email").textContent =
        CARD.email;

    document.getElementById("emailRow").href =
        "mailto:" + CARD.email;

} else {

    document.getElementById("emailRow").style.display =
        "none";

}


// ==========================================
// ADDRESS
// ==========================================

if (CARD.address) {

    document.getElementById("address").textContent =
        CARD.address;

} else {

    document.getElementById("addressRow").style.display =
        "none";

}


// ==========================================
// SOCIAL MEDIA
// ==========================================

const socialLinks =
    document.getElementById("socialLinks");


function addSocial(
    name,
    icon,
    url,
    show
) {

    if (!show || !url) {
        return;
    }


    const link =
        document.createElement("a");


    link.className =
        "social-link";


    link.href =
        url;


    link.target =
        "_blank";


    link.rel =
        "noopener noreferrer";


    link.innerHTML = `

        <i class="${icon}"></i>

        <span>
            ${name}
        </span>

    `;


    socialLinks.appendChild(link);

}


// FACEBOOK

addSocial(
    "Facebook",
    "fa-brands fa-facebook",
    CARD.facebook,
    CARD.showFacebook
);


// INSTAGRAM

addSocial(
    "Instagram",
    "fa-brands fa-instagram",
    CARD.instagram,
    CARD.showInstagram
);


// TIKTOK

addSocial(
    "TikTok",
    "fa-brands fa-tiktok",
    CARD.tiktok,
    CARD.showTikTok
);


// LINKEDIN

addSocial(
    "LinkedIn",
    "fa-brands fa-linkedin",
    CARD.linkedin,
    CARD.showLinkedIn
);


// WEBSITE

addSocial(
    "Website",
    "fa-solid fa-globe",
    CARD.website,
    CARD.showWebsite
);


// ==========================================
// COPY DETAILS
// ==========================================

document
    .getElementById("copyButton")
    .addEventListener(
        "click",
        async function () {

            const details = `

Name: ${CARD.name}

Title: ${CARD.title}

Phone: ${CARD.phone}

Email: ${CARD.email}

Address: ${CARD.address}

Facebook: ${CARD.facebook}

Instagram: ${CARD.instagram}

TikTok: ${CARD.tiktok}

LinkedIn: ${CARD.linkedin}

Website: ${CARD.website}

            `.trim();


            try {

                await navigator.clipboard.writeText(
                    details
                );


                showToast(
                    "Details copied!"
                );

            } catch (error) {

                showToast(
                    "Copy failed."
                );

            }

        }
    );


// ==========================================
// SAVE TO PHONE
// ==========================================

document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        function () {

            const vcard = [

                "BEGIN:VCARD",

                "VERSION:3.0",

                `FN:${CARD.name}`,

                `TITLE:${CARD.title}`,

                `TEL:${CARD.phone}`,

                `EMAIL:${CARD.email}`,

                `ADR:;;${CARD.address}`,

                `URL:${CARD.website}`,

                `NOTE:${CARD.bio}`,

                "END:VCARD"

            ].join("\n");


            const blob =
                new Blob(
                    [vcard],
                    {
                        type: "text/vcard"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;


            link.download =
                `${CARD.name}.vcf`;


            document.body.appendChild(link);


            link.click();


            document.body.removeChild(link);


            URL.revokeObjectURL(url);


            showToast(
                "Contact ready to save!"
            );

        }
    );


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    setTimeout(
        () => {

            toast.classList.remove("show");

        },
        2500
    );

}