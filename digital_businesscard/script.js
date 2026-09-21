/* =====================================================
   DIGITAL BUSINESS CARD
   PROFILE + CONTACT + SOCIAL + PAYMENTS
===================================================== */


/* =====================================================
   CLIENT DATA
===================================================== */

const defaultData = {

    profile: {

        name: "YOUR_NAME",

        title: "CEO / Business Owner",

        bio: "Digital business solutions, QR products and more.",

        photo: "images/profile.jpg"

    },


    contact: {

        phone: "YOUR_PHONE",

        email: "YOUR_EMAIL",

        address: "YOUR_ADDRESS"

    },


    social: {

        facebook: "YOUR_FACEBOOK_URL",

        instagram: "YOUR_INSTAGRAM_URL",

        tiktok: "YOUR_TIKTOK_URL",

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

            accountName: "YOUR_ACCOUNT_NAME",

            accountNumber: "YOUR_GCASH_NUMBER",

            icon: "fa-mobile-screen-button",

            iconClass: "gcash",

            /*
             * This is ONLY used by the
             * Open GCash button.
             *
             * The main GCash payment row
             * will NOT automatically launch it.
             */

            appLink: "gcash://",

            /*
             * GCash payment page
             */

            fallbackUrl: "gcash-payment.html",

            /*
             * GCash QR
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

            accountName: "YOUR_ACCOUNT_NAME",

            accountNumber: "YOUR_MAYA_NUMBER",

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

            accountName: "YOUR_ACCOUNT_NAME",

            accountNumber: "YOUR_BDO_ACCOUNT_NUMBER",

            accountType: "Savings",

            icon: "fa-building-columns",

            iconClass: "bank",

            /*
             * BDO PAYMENT PAGE
             */

            fallbackUrl: "bdo-payment.html",

            /*
             * BDO QR
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

            accountName: "YOUR_ACCOUNT_NAME",

            accountNumber: "YOUR_BPI_ACCOUNT_NUMBER",

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

            accountName: "YOUR_ACCOUNT_NAME",

            accountNumber: "YOUR_GOTYME_NUMBER",

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

            accountName: "YOUR_ACCOUNT_NAME",

            accountNumber: "YOUR_PAYPAL_EMAIL",

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

    const nameElement =

        document.getElementById("name");


    const titleElement =

        document.getElementById("title");


    const bioElement =

        document.getElementById("bio");


    const photo =

        document.getElementById("profilePhoto");


    if (nameElement) {

        nameElement.textContent =

            cardData.profile.name || "";

    }


    if (titleElement) {

        titleElement.textContent =

            cardData.profile.title || "";

    }


    if (bioElement) {

        bioElement.textContent =

            cardData.profile.bio || "";

    }


    if (photo) {

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



    /* =========================
       PHONE
    ========================== */

    if (

        phoneRow &&

        cardData.contact.phone

    ) {

        const phone =

            document.getElementById("phone");


        if (phone) {

            phone.textContent =

                cardData.contact.phone;

        }


        phoneRow.href =

            `tel:${cardData.contact.phone}`;


        phoneRow.style.display =

            "flex";

    }

    else if (phoneRow) {

        phoneRow.style.display =

            "none";

    }



    /* =========================
       EMAIL
    ========================== */

    if (

        emailRow &&

        cardData.contact.email

    ) {

        const email =

            document.getElementById("email");


        if (email) {

            email.textContent =

                cardData.contact.email;

        }


        emailRow.href =

            `mailto:${cardData.contact.email}`;


        emailRow.style.display =

            "flex";

    }

    else if (emailRow) {

        emailRow.style.display =

            "none";

    }



    /* =========================
       ADDRESS
    ========================== */

    if (

        addressRow &&

        cardData.contact.address

    ) {

        const address =

            document.getElementById("address");


        if (address) {

            address.textContent =

                cardData.contact.address;

        }


        addressRow.style.display =

            "flex";

    }

    else if (addressRow) {

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


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const socialIcons = {

        facebook: "fa-facebook-f",

        instagram: "fa-instagram",

        tiktok: "fa-tiktok",

        messenger: "fa-facebook-messenger"

    };


    Object.entries(cardData.social)

        .forEach(([platform, url]) => {

            if (

                !url ||

                url.startsWith("YOUR_")

            ) {

                return;

            }


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


    if (!section || !container) {

        return;

    }


    container.innerHTML = "";


    const enabledPayments =

        cardData.payments.filter(

            payment =>

                payment.enabled === true

        );


    /*
     * Hide payment section
     * when no payment is enabled.
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

                /*
                 * IMPORTANT:
                 *
                 * GCash NO LONGER automatically
                 * launches the GCash application.
                 *
                 * It opens the payment page first.
                 */

                const params =

                    new URLSearchParams({

                        accountName:

                            payment.accountName || "",

                        accountNumber:

                            payment.accountNumber || "",

                        appLink:

                            payment.appLink || "",

                        qrImage:

                            payment.qrImage || ""

                    });


                row.href =

                    `gcash-payment.html?${params.toString()}`;

            }



            /* =================================================
               BDO
            ================================================= */

            else if (

                payment.id === "bdo"

            ) {

                /*
                 * BDO opens the BDO payment page.
                 */

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
               BUILD PAYMENT ROW
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
   GCASH PAYMENT FALLBACK
===================================================== */

/*
 * This function is kept for compatibility with
 * the existing project.
 *
 * The main GCash payment row DOES NOT call this.
 */

function openGcashPayment(payment) {

    openGcashFallback(payment);

}



/* =====================================================
   GCASH FALLBACK
===================================================== */

function openGcashFallback(payment) {

    if (

        payment &&

        payment.fallbackUrl

    ) {

        window.location.href =

            payment.fallbackUrl;

        return;

    }


    if (payment) {

        showGcashQrModal(payment);

    }

}



/* =====================================================
   GCASH QR MODAL
===================================================== */

function showGcashQrModal(payment) {

    const oldModal =

        document.getElementById(

            "gcashQrModal"

        );


    if (oldModal) {

        oldModal.remove();

    }


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



    /* =========================
       CLOSE BUTTON
    ========================== */

    const closeButton =

        document.getElementById(

            "gcashClose"

        );


    if (closeButton) {

        closeButton.addEventListener(

            "click",

            () => {

                modal.remove();

            }

        );

    }



    /* =========================
       CLICK OUTSIDE
    ========================== */

    const overlay =

        modal.querySelector(

            ".gcash-modal-overlay"

        );


    if (overlay) {

        overlay.addEventListener(

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

    }



    /* =========================
       OPEN GCASH BUTTON
    ========================== */

    const openButton =

        document.getElementById(

            "openGcashAppButton"

        );


    if (openButton) {

        openButton.addEventListener(

            "click",

            () => {

                tryOpenGcashApp(

                    payment

                );

            }

        );

    }

}



/* =====================================================
   OPEN GCASH APP
===================================================== */

function tryOpenGcashApp(payment) {

    /*
     * This function ONLY runs when the
     * user explicitly presses "Open GCash".
     *
     * It does NOT run when the user taps
     * GCash on the main digital card.
     */

    if (

        payment &&

        payment.appLink

    ) {

        window.location.href =

            payment.appLink;

        return;

    }


    window.location.href =

        "gcash://";

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

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


    if (

        navigator.clipboard &&

        navigator.clipboard.writeText

    ) {

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

function showToast(message) {

    const toast =

        document.getElementById(

            "toast"

        );


    if (!toast) {

        return;

    }


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

const copyButton =

    document.getElementById(

        "copyButton"

    );


if (copyButton) {

    copyButton.addEventListener(

        "click",

        copyDetails

    );

}



const saveButton =

    document.getElementById(

        "saveButton"

    );


if (saveButton) {

    saveButton.addEventListener(

        "click",

        saveContact

    );

}



/* =====================================================
   INITIALIZE
===================================================== */

renderProfile();

renderContact();

renderSocialLinks();

renderPayments();