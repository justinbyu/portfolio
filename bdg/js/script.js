/* =====================================================
   TAPIND DIGITAL BUSINESS CARD
   JAVASCRIPT
===================================================== */


/* =====================================================
   TAPIND INFORMATION
   EDIT YOUR DETAILS HERE
===================================================== */

const TAPIND = {

    name: "Justin Diaz",

    title: "CEO & Founder",

    bio:
        "Digital solutions designed to help businesses connect, grow, and stand out.",


    /* ================================================
       SOCIAL MEDIA
    ================================================ */

    social: {

        instagram:
            "https://instagram.com/tapind_justin",

        facebook:
            "https://facebook.com/",

        tiktok:
            "https://tiktok.com/@tapind_justin",

        youtube:
            "https://youtube.com/",

        website:
            "https://tapind.ph"

    },


    /* ================================================
       REVIEW LINK
    ================================================ */

    reviews:
        "https://www.google.com/",


    /* ================================================
       PAYMENT LINKS
       Replace # with your actual payment links
    ================================================ */

    payments: {

        gcash: "#",

        maya: "#",

        bdo: "#",

        bpi: "#"

    },


    /* ================================================
       CONTACT INFORMATION
    ================================================ */

    contact: {

        phone:
            "+63 900 000 0000",

        email:
            "hello@tapind.ph",

        company:
            "TAPIND"

    }

};


/* =====================================================
   LOAD PROFILE INFORMATION
===================================================== */

const profileName =
    document.getElementById("profile-name");

const profileTitle =
    document.getElementById("profile-title");

const profileBio =
    document.getElementById("profile-bio");


if (profileName) {

    profileName.textContent =
        TAPIND.name;

}


if (profileTitle) {

    profileTitle.textContent =
        TAPIND.title;

}


if (profileBio) {

    profileBio.textContent =
        TAPIND.bio;

}


/* =====================================================
   SOCIAL MEDIA LINKS
===================================================== */

const socialLinks = {

    instagram:
        document.getElementById("instagram"),

    facebook:
        document.getElementById("facebook"),

    tiktok:
        document.getElementById("tiktok"),

    youtube:
        document.getElementById("youtube"),

    website:
        document.getElementById("website")

};


Object.keys(socialLinks).forEach(
    platform => {

        const element =
            socialLinks[platform];

        if (!element) return;


        element.href =
            TAPIND.social[platform];


        element.target =
            "_blank";


        element.rel =
            "noopener noreferrer";

    }
);


/* =====================================================
   REVIEW BUTTON
===================================================== */

const reviewButton =
    document.querySelector(".review-button");


if (reviewButton) {

    reviewButton.href =
        TAPIND.reviews;

    reviewButton.target =
        "_blank";

    reviewButton.rel =
        "noopener noreferrer";

}


/* =====================================================
   PAYMENT BUTTONS
===================================================== */

const paymentButtons =
    document.querySelectorAll(".payment-item");


paymentButtons.forEach(
    (button, index) => {

        const paymentNames = [

            "gcash",

            "maya",

            "bdo",

            "bpi"

        ];

        const payment =
            paymentNames[index];


        button.addEventListener(
            "click",
            () => {

                const link =
                    TAPIND.payments[payment];


                if (!link || link === "#") {

                    showNotification(
                        `${payment.toUpperCase()} payment link is not set yet.`
                    );

                    return;

                }


                window.open(
                    link,
                    "_blank"
                );

            }
        );

    }
);


/* =====================================================
   SAVE CONTACT
===================================================== */

function saveContact() {

    const contact = {

        name:
            TAPIND.name,

        title:
            TAPIND.title,

        company:
            TAPIND.contact.company,

        phone:
            TAPIND.contact.phone,

        email:
            TAPIND.contact.email,

        website:
            TAPIND.social.website

    };


    /* ================================================
       CREATE VCARD
    ================================================ */

    const vCard = [

        "BEGIN:VCARD",

        "VERSION:3.0",

        `FN:${contact.name}`,

        `ORG:${contact.company}`,

        `TITLE:${contact.title}`,

        `TEL:${contact.phone}`,

        `EMAIL:${contact.email}`,

        `URL:${contact.website}`,

        "NOTE:TAPIND - Tap. Connect. Grow.",

        "END:VCARD"

    ].join("\n");


    /* ================================================
       CREATE DOWNLOAD
    ================================================ */

    const blob =
        new Blob(
            [vCard],
            {
                type:
                    "text/vcard;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        `${TAPIND.name.replaceAll(" ", "_")}.vcf`;


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    showNotification(
        "Contact card created successfully!"
    );

}


/* =====================================================
   SAVE BUTTON
===================================================== */

const saveButton =
    document.getElementById("saveContact");


if (saveButton) {

    saveButton.addEventListener(
        "click",
        saveContact
    );

}


/* =====================================================
   FLOATING SAVE BUTTON
===================================================== */

const floatingSave =
    document.getElementById("floatingSave");


if (floatingSave) {

    floatingSave.addEventListener(
        "click",
        saveContact
    );

}


/* =====================================================
   NOTIFICATION SYSTEM
===================================================== */

function showNotification(message) {

    /* Remove existing notification */

    const existing =
        document.querySelector(
            ".tapind-notification"
        );


    if (existing) {

        existing.remove();

    }


    /* Create notification */

    const notification =
        document.createElement("div");


    notification.className =
        "tapind-notification";


    notification.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        <span>${message}</span>

    `;


    document.body.appendChild(
        notification
    );


    /* Show */

    setTimeout(() => {

        notification.classList.add(
            "show"
        );

    }, 50);


    /* Hide */

    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

    }, 2800);


    /* Remove */

    setTimeout(() => {

        notification.remove();

    }, 3300);

}


/* =====================================================
   ADD NOTIFICATION CSS
===================================================== */

const notificationStyle =
    document.createElement("style");


notificationStyle.textContent = `

.tapind-notification {

    position: fixed;

    left: 50%;

    bottom: 25px;

    z-index: 9999;

    display: flex;

    align-items: center;

    gap: 10px;

    max-width: calc(100% - 30px);

    padding: 13px 18px;

    border: 1px solid rgba(
        255,
        255,
        255,
        0.15
    );

    border-radius: 50px;

    color: white;

    background:
        rgba(
            15,
            20,
            35,
            0.8
        );

    backdrop-filter:
        blur(20px);

    -webkit-backdrop-filter:
        blur(20px);

    box-shadow:
        0 15px 40px
        rgba(0,0,0,0.4);

    font-size: 12px;

    transform:
        translate(-50%, 100px);

    opacity: 0;

    transition:
        all 0.35s ease;

}


.tapind-notification.show {

    transform:
        translate(-50%, 0);

    opacity: 1;

}


.tapind-notification i {

    color:
        #6ea8ff;

    font-size: 15px;

}

`;


document.head.appendChild(
    notificationStyle
);


/* =====================================================
   CARD SCROLL ANIMATION
===================================================== */

const cards =
    document.querySelectorAll(
        ".glass-card"
    );


const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                    }

                }
            );

        },

        {
            threshold: 0.08
        }

    );


cards.forEach(
    card => {

        observer.observe(card);

    }
);


/* =====================================================
   PARALLAX GLOW EFFECT
===================================================== */

document.addEventListener(
    "mousemove",
    event => {

        const x =
            event.clientX /
            window.innerWidth;

        const y =
            event.clientY /
            window.innerHeight;


        const glowOne =
            document.querySelector(
                ".glow-one"
            );


        const glowTwo =
            document.querySelector(
                ".glow-two"
            );


        if (glowOne) {

            glowOne.style.transform =
                `translate(
                    ${x * 40}px,
                    ${y * 40}px
                )`;

        }


        if (glowTwo) {

            glowTwo.style.transform =
                `translate(
                    ${x * -30}px,
                    ${y * -30}px
                )`;

        }

    }
);


/* =====================================================
   CONSOLE MESSAGE
===================================================== */

console.log(
    "TAPIND Digital Business Card loaded."
);

console.log(
    "Tap. Connect. Grow."
);