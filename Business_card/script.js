// ==========================================
// DIGITAL BUSINESS CARD
// ==========================================


// ==========================================
// GET ELEMENTS
// ==========================================

const photoInput = document.getElementById("photoInput");

const nameInput = document.getElementById("nameInput");
const titleInput = document.getElementById("titleInput");
const bioInput = document.getElementById("bioInput");

const phoneInput = document.getElementById("phoneInput");
const emailInput = document.getElementById("emailInput");
const addressInput = document.getElementById("addressInput");

const facebookInput = document.getElementById("facebookInput");
const instagramInput = document.getElementById("instagramInput");
const tiktokInput = document.getElementById("tiktokInput");
const linkedinInput = document.getElementById("linkedinInput");
const websiteInput = document.getElementById("websiteInput");

const facebookToggle = document.getElementById("facebookToggle");
const instagramToggle = document.getElementById("instagramToggle");
const tiktokToggle = document.getElementById("tiktokToggle");
const linkedinToggle = document.getElementById("linkedinToggle");
const websiteToggle = document.getElementById("websiteToggle");


// PREVIEW

const profileImage = document.getElementById("profileImage");

const previewName = document.getElementById("previewName");
const previewTitle = document.getElementById("previewTitle");
const previewBio = document.getElementById("previewBio");

const previewPhone = document.getElementById("previewPhone");
const previewEmail = document.getElementById("previewEmail");
const previewAddress = document.getElementById("previewAddress");

const phoneLink = document.getElementById("phoneLink");
const emailLink = document.getElementById("emailLink");

const addressItem = document.getElementById("addressItem");

const socialLinks = document.getElementById("socialLinks");


// BUTTONS

const saveButton = document.getElementById("saveButton");
const resetButton = document.getElementById("resetButton");

const copyButton = document.getElementById("copyButton");
const contactButton = document.getElementById("contactButton");

const toast = document.getElementById("toast");


// ==========================================
// DEFAULT DATA
// ==========================================

const defaultData = {

    name: "Your Name",

    title: "Model / Entrepreneur / Influencer",

    bio: "Welcome to my digital business card.",

    phone: "+63 912 345 6789",

    email: "you@email.com",

    address: "Manila, Philippines",

    facebook: "https://facebook.com/",

    instagram: "https://instagram.com/",

    tiktok: "https://tiktok.com/",

    linkedin: "https://linkedin.com/",

    website: "https://example.com/",

    facebookShow: true,

    instagramShow: true,

    tiktokShow: true,

    linkedinShow: false,

    websiteShow: false,

    photo: ""

};


// ==========================================
// UPDATE PREVIEW
// ==========================================

function updatePreview() {

    // PERSONAL INFORMATION

    previewName.textContent =
        nameInput.value || "Your Name";

    previewTitle.textContent =
        titleInput.value || "Your Title";

    previewBio.textContent =
        bioInput.value || "Your short bio will appear here.";


    // PHONE

    if (phoneInput.value.trim() !== "") {

        previewPhone.textContent = phoneInput.value;

        phoneLink.href =
            "tel:" + phoneInput.value;

        phoneLink.style.display = "flex";

    } else {

        phoneLink.style.display = "none";

    }


    // EMAIL

    if (emailInput.value.trim() !== "") {

        previewEmail.textContent = emailInput.value;

        emailLink.href =
            "mailto:" + emailInput.value;

        emailLink.style.display = "flex";

    } else {

        emailLink.style.display = "none";

    }


    // ADDRESS

    if (addressInput.value.trim() !== "") {

        previewAddress.textContent =
            addressInput.value;

        addressItem.style.display = "flex";

    } else {

        addressItem.style.display = "none";

    }


    // SOCIAL MEDIA

    renderSocialLinks();

}


// ==========================================
// SOCIAL MEDIA
// ==========================================

function renderSocialLinks() {

    socialLinks.innerHTML = "";


    const socialMedia = [

        {
            name: "Facebook",
            icon: "fa-brands fa-facebook",
            url: facebookInput.value,
            show: facebookToggle.checked
        },

        {
            name: "Instagram",
            icon: "fa-brands fa-instagram",
            url: instagramInput.value,
            show: instagramToggle.checked
        },

        {
            name: "TikTok",
            icon: "fa-brands fa-tiktok",
            url: tiktokInput.value,
            show: tiktokToggle.checked
        },

        {
            name: "LinkedIn",
            icon: "fa-brands fa-linkedin",
            url: linkedinInput.value,
            show: linkedinToggle.checked
        },

        {
            name: "Website",
            icon: "fa-solid fa-globe",
            url: websiteInput.value,
            show: websiteToggle.checked
        }

    ];


    socialMedia.forEach(social => {

        if (
            social.show &&
            social.url.trim() !== ""
        ) {

            const link = document.createElement("a");

            link.className = "social-link";

            link.href = social.url;

            link.target = "_blank";

            link.rel = "noopener noreferrer";


            link.innerHTML = `

                <i class="${social.icon}"></i>

                <span>
                    ${social.name}
                </span>

            `;


            socialLinks.appendChild(link);

        }

    });

}


// ==========================================
// PHOTO UPLOAD
// ==========================================

photoInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) {
            return;
        }


        const reader = new FileReader();


        reader.onload = function (event) {

            profileImage.src =
                event.target.result;

        };


        reader.readAsDataURL(file);

    }
);


// ==========================================
// INPUT LISTENERS
// ==========================================

const allInputs = document.querySelectorAll(
    "input, textarea"
);


allInputs.forEach(input => {

    input.addEventListener(
        "input",
        updatePreview
    );

    input.addEventListener(
        "change",
        updatePreview
    );

});


// ==========================================
// SAVE CARD
// ==========================================

saveButton.addEventListener(
    "click",
    function () {

        const data = {

            name: nameInput.value,

            title: titleInput.value,

            bio: bioInput.value,

            phone: phoneInput.value,

            email: emailInput.value,

            address: addressInput.value,

            facebook: facebookInput.value,

            instagram: instagramInput.value,

            tiktok: tiktokInput.value,

            linkedin: linkedinInput.value,

            website: websiteInput.value,

            facebookShow:
                facebookToggle.checked,

            instagramShow:
                instagramToggle.checked,

            tiktokShow:
                tiktokToggle.checked,

            linkedinShow:
                linkedinToggle.checked,

            websiteShow:
                websiteToggle.checked,

            photo:
                profileImage.src

        };


        localStorage.setItem(
            "digitalBusinessCard",
            JSON.stringify(data)
        );


        showToast(
            "Card saved successfully!"
        );

    }
);


// ==========================================
// LOAD SAVED CARD
// ==========================================

function loadCard() {

    const saved =
        localStorage.getItem(
            "digitalBusinessCard"
        );


    if (!saved) {

        loadData(defaultData);

        return;

    }


    try {

        const data =
            JSON.parse(saved);

        loadData(data);

    } catch (error) {

        console.log(
            "Could not load saved card."
        );

        loadData(defaultData);

    }

}


// ==========================================
// LOAD DATA INTO FORM
// ==========================================

function loadData(data) {

    nameInput.value =
        data.name || "";

    titleInput.value =
        data.title || "";

    bioInput.value =
        data.bio || "";

    phoneInput.value =
        data.phone || "";

    emailInput.value =
        data.email || "";

    addressInput.value =
        data.address || "";


    facebookInput.value =
        data.facebook || "";

    instagramInput.value =
        data.instagram || "";

    tiktokInput.value =
        data.tiktok || "";

    linkedinInput.value =
        data.linkedin || "";

    websiteInput.value =
        data.website || "";


    facebookToggle.checked =
        data.facebookShow !== false;

    instagramToggle.checked =
        data.instagramShow !== false;

    tiktokToggle.checked =
        data.tiktokShow !== false;

    linkedinToggle.checked =
        data.linkedinShow === true;

    websiteToggle.checked =
        data.websiteShow === true;


    if (
        data.photo &&
        data.photo.startsWith("data:")
    ) {

        profileImage.src =
            data.photo;

    }


    updatePreview();

}


// ==========================================
// RESET
// ==========================================

resetButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "digitalBusinessCard"
        );


        loadData(defaultData);


        profileImage.src =
            "https://via.placeholder.com/500x350?text=Your+Photo";


        showToast(
            "Card reset."
        );

    }
);


// ==========================================
// COPY DETAILS
// ==========================================

copyButton.addEventListener(
    "click",
    async function () {

        const details = `

${nameInput.value}

${titleInput.value}

${bioInput.value}

Phone:
${phoneInput.value}

Email:
${emailInput.value}

Address:
${addressInput.value}

Facebook:
${facebookInput.value}

Instagram:
${instagramInput.value}

TikTok:
${tiktokInput.value}

LinkedIn:
${linkedinInput.value}

Website:
${websiteInput.value}

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
                "Copy failed. Try again."
            );

        }

    }
);


// ==========================================
// SAVE TO PHONE
// ==========================================

contactButton.addEventListener(
    "click",
    function () {

        const name =
            nameInput.value || "Contact";


        const vcard = [

            "BEGIN:VCARD",

            "VERSION:3.0",

            `FN:${name}`,

            `TITLE:${titleInput.value}`,

            `TEL:${phoneInput.value}`,

            `EMAIL:${emailInput.value}`,

            `ADR:;;${addressInput.value}`,

            `URL:${websiteInput.value}`,

            `NOTE:${bioInput.value}`,

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
            `${name.replace(/\s+/g, "_")}.vcf`;


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);


        showToast(
            "Contact file created!"
        );

    }
);


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ==========================================
// START
// ==========================================

loadCard();