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

        photo: "images/profile.jpg"

    },


    contact: {

        phone: "09623017609",

        email: "justinriverodiaz@gmail.com",

        address: "Metro Manila, Philippines"

    },


    social: {

        facebook: "https://www.facebook.com/justin.meee/",

        instagram: "https://www.instagram.com/justin.ai.studio_/",

        tiktok: "https://www.tiktok.com/@justinlds",

        messenger: ""

    },


    /* =================================================
       PAYMENT METHODS
    ================================================= */

    payments: [


        /* =========================
           GCASH
        ========================== */

        {

            id: "gcash",

            enabled: true,

            name: "GCash",

            accountName: "Justin Diaz",

            accountNumber: "09623017609",

            icon: "fa-mobile-screen-button",

            iconClass: "gcash",


            /*
             * BEST-EFFORT GCASH APP LINK
             *
             * This attempts to open the GCash app.
             * It does NOT guarantee Express Send
             * will be pre-filled with the number.
             */

            appLink: "gcash://",


            /*
             * FALLBACK
             *
             * Opens your GCash payment page.
             */

            fallbackUrl: "gcash-payment.html",


            /*
             * Your GCash QR image
             */

            qrImage: "images/gcash-qr.png"

        },


        /* =========================
           MAYA
        ========================== */

        {

            id: "maya",

            enabled: true,

            name: "Maya",

            accountName: "Justin Diaz",

            accountNumber: "09623017609",

            icon: "fa-wallet",

            iconClass: "maya",

            link: "https://www.maya.ph/"

        },


        /* =========================
           BDO
        ========================== */

        {

            id: "bdo",

            enabled: true,

            name: "BDO",

            accountName: "Justin Diaz",

            accountNumber: "1234567890",

            accountType: "Savings",

            icon: "fa-building-columns",

            iconClass: "bank",


            /*
             * BDO PAYMENT PAGE
             */

            fallbackUrl: "bdo-payment.html",


            /*
             * Your BDO QR image
             */

            qrImage: "images/bdo-qr.png"

        },


        /* =========================
           BPI
        ========================== */

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


        /* =========================
           GOTYME
        ========================== */

        {

            id: "gotyme",

            enabled: false,

            name: "GoTyme",

            accountName: "Justin Diaz",

            accountNumber: "09623017609",

            icon: "fa-building-columns",

            iconClass: "gotyme",

            link: "#"

        },


        /* =========================
           PAYPAL
        ========================== */

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
   LOAD DATA
===================================================== */

let cardData = loadCardData();



function loadCardData() {

    const savedData =

        localStorage.getItem(

            "digitalBusinessCard"

        );


    if (!savedData) {

        return defaultData;

    }


    try {

        return JSON.parse(savedData);

    }

    catch (error) {

        console.error(

            "Could not load saved card data:",

            error

        );

        return defaultData;

    }

}



/* =====================================================
   SAVE DATA
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

    }

    else {

        photo.style.display =

            "none";

    }

}



/* =====================================================
   CONTACT
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

    }

    else {

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

    }

    else {

        emailRow.style.display =

            "none";

    }



    /* ADDRESS */

    if (cardData.contact.address) {

        document.getElementById("address").textContent =

            cardData.contact.address;


        addressRow.style.display =

            "flex";

    }

    else {

        addressRow.style.display =

            "none";

    }

}



/* =====================================================
   SOCIAL MEDIA
===================================================== */

function renderSocialLinks() {

    const container =

        document.getElementById(

            "socialLinks"

        );


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


            link.href =

                url;


            link.target =

                "_blank";


            link.rel =

                "noopener noreferrer";


            link.title =

                platform;


            const icon =

                document.createElement("i");


            icon.className =

                `fa-brands ${
                    socialIcons[platform] ||
                    "fa-link"
                }`;


            link.appendChild(icon);


            container.appendChild(link);

        });

}



/* =====================================================
   PAYMENT METHODS
===================================================== */

function renderPayments() {

    const section =

        document.getElementById(

            "paymentSection"

        );


    const container =

        document.getElementById(

            "paymentList"

        );


    container.innerHTML = "";


    const enabledPayments =

        cardData.payments.filter(

            payment =>

                payment.enabled === true

        );


    /*
     * Hide the entire payment section
     * when no payment method is enabled.
     */

    if (

        enabledPayments.length === 0

    ) {

        section.style.display =

            "none";

        return;

    }


    section.style.display =

        "block";



    enabledPayments.forEach(

        payment => {


            const row =

                document.createElement("a");


            row.className =

                "payment-row";



            /* =================================================
               GCASH
            ================================================= */

            if (

                payment.id === "gcash"

            ) {

                row.href =

                    "#";


                row.addEventListener(

                    "click",

                    function(event) {

                        event.preventDefault();


                        openGcashPayment(

                            payment

                        );

                    }

                );

            }



            /* =================================================
               BDO
            ================================================= */

            else if (

                payment.id === "bdo"

            ) {

                row.href =

                    createBdoPaymentUrl(

                        payment

                    );

            }



            /* =================================================
               OTHER PAYMENT METHODS
            ================================================= */

            else {

                row.href =

                    payment.link || "#";


                if (

                    payment.link &&

                    payment.link !== "#"

                ) {

                    row.target =

                        "_blank";


                    row.rel =

                        "noopener noreferrer";

                }

            }



            /* =========================
               ICON
            ========================== */

            const iconContainer =

                document.createElement("div");


            iconContainer.className =

                `payment-icon ${
                    payment.iconClass || ""
                }`;


            const icon =

                document.createElement("i");


            if (payment.brandIcon) {

                icon.className =

                    `fa-brands ${payment.icon}`;

            }

            else {

                icon.className =

                    `fa-solid ${payment.icon}`;

            }


            iconContainer.appendChild(

                icon

            );



            /* =========================
               INFORMATION
            ========================== */

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


            if (

                payment.accountName

            ) {

                account.textContent =

                    `${payment.accountName} • ${
                        payment.accountNumber || ""
                    }`;

            }

            else {

                account.textContent =

                    payment.accountNumber || "";

            }


            info.appendChild(name);

            info.appendChild(account);



            /* =========================
               ARROW
            ========================== */

            const arrow =

                document.createElement("i");


            arrow.className =

                "fa-solid fa-chevron-right chevron";



            /* =========================
               BUILD
            ========================== */

            row.appendChild(

                iconContainer

            );


            row.appendChild(

                info

            );


            row.appendChild(

                arrow

            );


            container.appendChild(

                row

            );

        }

    );

}



/* =====================================================
   BDO PAYMENT PAGE
===================================================== */

function createBdoPaymentUrl(payment) {

    const params =

        new URLSearchParams({

            accountName:

                payment.accountName || "",

            accountNumber:

                payment.accountNumber || "",

            accountType:

                payment.accountType || "",

            qrImage:

                payment.qrImage || ""

        });


    return `bdo-payment.html?${params.toString()}`;

}



/* =====================================================
   GCASH PAYMENT HANDLER
===================================================== */

function openGcashPayment(

    payment

) {

    /*
     * Check if we're on mobile.
     */

    const isMobile =

        /Android|iPhone|iPad|iPod/i.test(

            navigator.userAgent

        );


    /*
     * Desktop:
     * Go directly to the fallback page.
     */

    if (!isMobile) {

        openGcashFallback(

            payment

        );

        return;

    }


    /*
     * Mobile:
     *
     * Try to open the GCash app.
     */

    let appOpened = false;


    /*
     * When the page becomes hidden,
     * we assume the app opened.
     */

    const handleVisibility =

        () => {

            if (

                document.hidden

            ) {

                appOpened =

                    true;

            }

        };


    document.addEventListener(

        "visibilitychange",

        handleVisibility

    );


    /*
     * Try opening GCash.
     */

    window.location.href =

        payment.appLink ||

        "gcash://";


    /*
     * Give the phone some time
     * to open the application.
     *
     * If it doesn't open,
     * show the QR/payment page.
     */

    setTimeout(() => {

        document.removeEventListener(

            "visibilitychange",

            handleVisibility

        );


        if (!appOpened) {

            openGcashFallback(

                payment

            );

        }

    }, 1800);

}



/* =====================================================
   GCASH FALLBACK
===================================================== */

function openGcashFallback(

    payment

) {

    /*
     * If you have a payment page,
     * open it.
     */

    if (

        payment.fallbackUrl

    ) {

        window.location.href =

            payment.fallbackUrl;

        return;

    }


    /*
     * If no payment page exists,
     * show QR modal instead.
     */

    showGcashQrModal(

        payment

    );

}



/* =====================================================
   GCASH QR MODAL
===================================================== */

function showGcashQrModal(

    payment

) {

    /*
     * Remove old modal if one exists.
     */

    const oldModal =

        document.getElementById(

            "gcashQrModal"

        );


    if (oldModal) {

        oldModal.remove();

    }


    /*
     * Create modal
     */

    const modal =

        document.createElement("div");


    modal.id =

        "gcashQrModal";


    modal.innerHTML = `

        <div class="gcash-modal-overlay">

            <div class="gcash-modal">

                <button

                    class="gcash-close"

                    id="gcashClose"

                    type="button"

                >

                    ×

                </button>


                <div class="gcash-modal-icon">

                    <i class="fa-solid fa-mobile-screen-button"></i>

                </div>


                <h2>

                    Send via GCash

                </h2>


                <p class="gcash-account-name">

                    ${escapeHtml(

                        payment.accountName || ""

                    )}

                </p>


                <p class="gcash-account-number">

                    ${escapeHtml(

                        payment.accountNumber || ""

                    )}

                </p>


                ${

                    payment.qrImage

                    ?

                    `

                    <img

                        class="gcash-qr"

                        src="${escapeHtml(

                            payment.qrImage

                        )}"

                        alt="GCash QR Code"

                    >

                    `

                    :

                    `

                    <div class="gcash-no-qr">

                        GCash QR not configured.

                    </div>

                    `

                }


                <p class="gcash-instruction">

                    Scan this QR code using the

                    GCash app to send money.

                </p>


                <button

                    id="openGcashAppButton"

                    class="gcash-open-button"

                    type="button"

                >

                    <i class="fa-solid fa-mobile-screen-button"></i>

                    Open GCash

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(

        modal

    );


    /*
     * Close button
     */

    document

        .getElementById(

            "gcashClose"

        )

        .addEventListener(

            "click",

            () => {

                modal.remove();

            }

        );


    /*
     * Click outside modal
     */

    modal

        .querySelector(

            ".gcash-modal-overlay"

        )

        .addEventListener(

            "click",

            event => {

                if (

                    event.target.classList.contains(

                        "gcash-modal-overlay"

                    )

                ) {

                    modal.remove();

                }

            }

        );


    /*
     * Open GCash button
     */

    document

        .getElementById(

            "openGcashAppButton"

        )

        .addEventListener(

            "click",

            () => {

                tryOpenGcashApp(

                    payment

                );

            }

        );

}



/* =====================================================
   TRY OPEN GCASH APP FROM QR PAGE
===================================================== */

function tryOpenGcashApp(

    payment

) {

    /*
     * Attempt to launch GCash.
     */

    window.location.href =

        payment.appLink ||

        "gcash://";

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(

    value

) {

    const div =

        document.createElement(

            "div"

        );


    div.textContent =

        value;


    return div.innerHTML;

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


    text +=

        `${profile.name}\n`;


    text +=

        `${profile.title}\n\n`;


    if (

        profile.bio

    ) {

        text +=

            `${profile.bio}\n\n`;

    }


    if (

        contact.phone

    ) {

        text +=

            `Phone: ${contact.phone}\n`;

    }


    if (

        contact.email

    ) {

        text +=

            `Email: ${contact.email}\n`;

    }


    if (

        contact.address

    ) {

        text +=

            `Address: ${contact.address}\n`;

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
   SAVE CONTACT
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

        URL.createObjectURL(

            blob

        );


    const link =

        document.createElement(

            "a"

        );


    link.href =

        url;


    link.download =

        `${profile.name || "contact"}.vcf`;


    document.body.appendChild(

        link

    );


    link.click();


    document.body.removeChild(

        link

    );


    URL.revokeObjectURL(

        url

    );


    showToast(

        "Contact downloaded!"

    );

}



/* =====================================================
   TOAST
===================================================== */

function showToast(

    message

) {

    const toast =

        document.getElementById(

            "toast"

        );


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

    .getElementById(

        "copyButton"

    )

    .addEventListener(

        "click",

        copyDetails

    );


document

    .getElementById(

        "saveButton"

    )

    .addEventListener(

        "click",

        saveContact

    );



/* =====================================================
   INITIALIZE
===================================================== */

renderProfile();

renderContact();

renderSocialLinks();

renderPayments();