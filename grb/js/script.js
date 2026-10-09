/* =====================================================
   TAPIND DIGITAL BUSINESS CARD
   JAVASCRIPT
   MULTI-PHOTO BUSINESS NICHE CAROUSEL
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
       PROFILE PHOTOS
    ================================================ */

    profile: {

        photo:
            "assets/profile.jpg",

        background:
            "assets/profile-background.jpg"

    },


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

    },


    /* =================================================
       BUSINESS NICHE PHOTOS

       ADD OR REMOVE PHOTOS HERE.

       Example:

       "web-development": [
           "assets/niches/web-development/1.jpg",
           "assets/niches/web-development/2.jpg",
           "assets/niches/web-development/3.jpg"
       ]

       You can have 1, 2, 5, 10+ photos.
    ================================================= */

    nichePhotos: {

        "web-development": [

            "assets/web-dev/1.jpg",

            "assets/web-dev/2.jpg",

            "assets/web-dev/3.jpg"

        ],


        "digital-business-card": [

            "assets/niches/digital-business-card/1.jpg",

            "assets/niches/digital-business-card/2.jpg",

            "assets/niches/digital-business-card/3.jpg"

        ],


        "qr-solutions": [

            "assets/niches/qr-solutions/1.jpg",

            "assets/niches/qr-solutions/2.jpg"

        ],


        "graphic-design": [

            "assets/niches/graphic-design/1.jpg",

            "assets/niches/graphic-design/2.jpg"

        ],


        "ai-automation": [

            "assets/niches/ai-automation/1.jpg",

            "assets/niches/ai-automation/2.jpg"

        ]

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
   LOAD PROFILE IMAGES
===================================================== */

const profileImage =
    document.querySelector(".profile-image img");


const profileBackground =
    document.getElementById("profileBackground");


if (
    profileImage &&
    TAPIND.profile.photo
) {

    profileImage.src =
        TAPIND.profile.photo;

}


if (
    profileBackground &&
    TAPIND.profile.background
) {

    profileBackground.src =
        TAPIND.profile.background;

}


/* =====================================================
   SOCIAL MEDIA LINKS
===================================================== */

const socialElements = {

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


/* =====================================================
   APPLY SOCIAL MEDIA LINKS
===================================================== */

Object.keys(socialElements).forEach(
    platform => {

        const element =
            socialElements[platform];


        const url =
            TAPIND.social[platform];


        if (!element || !url) return;


        element.href =
            url;


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


const paymentNames = [

    "gcash",

    "maya",

    "bdo",

    "bpi"

];


paymentButtons.forEach(
    (button, index) => {

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
   BUSINESS NICHE CAROUSEL
===================================================== */

function createNicheCarousels() {

    const carousels =
        document.querySelectorAll(
            ".niche-carousel"
        );


    carousels.forEach(
        carousel => {

            const nicheName =
                carousel.dataset.niche;


            const photos =
                TAPIND.nichePhotos[nicheName];

            // Keep each project gallery collapsed until its niche is selected.
            carousel.hidden = true;
            carousel.setAttribute("aria-hidden", "true");

            const nicheItem = carousel.closest(".niche-item");
            const nicheContent = nicheItem?.querySelector(".niche-content");
            if (nicheContent) {
                nicheContent.setAttribute("role", "button");
                nicheContent.setAttribute("tabindex", "0");
                nicheContent.setAttribute("aria-expanded", "false");
                nicheContent.setAttribute("aria-controls", `niche-gallery-${nicheName}`);
                carousel.id = `niche-gallery-${nicheName}`;

                const toggleGallery = () => {
                    const willOpen = carousel.hidden;

                    // Only one niche gallery is open at a time for a tidy layout.
                    document.querySelectorAll(".niche-carousel").forEach(other => {
                        other.hidden = true;
                        other.setAttribute("aria-hidden", "true");
                        const otherContent = other.closest(".niche-item")?.querySelector(".niche-content");
                        other.closest(".niche-item")?.classList.remove("is-expanded");
                        otherContent?.setAttribute("aria-expanded", "false");
                    });

                    if (willOpen) {
                        carousel.hidden = false;
                        carousel.setAttribute("aria-hidden", "false");
                        nicheItem?.classList.add("is-expanded");
                        nicheContent.setAttribute("aria-expanded", "true");
                    }
                };

                // Clicking the niche row/icon/title opens the same gallery.
                nicheItem?.addEventListener("click", event => {
                    if (event.target.closest(".niche-carousel, button")) return;
                    toggleGallery();
                });
                nicheContent.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleGallery();
                    }
                });
            }

            const track =
                carousel.querySelector(
                    ".carousel-track"
                );


            const dots =
                carousel.querySelector(
                    ".carousel-dots"
                );


            const previous =
                carousel.querySelector(
                    ".carousel-prev"
                );


            const next =
                carousel.querySelector(
                    ".carousel-next"
                );


            if (
                !photos ||
                photos.length === 0
            ) {

                carousel.style.display =
                    "none";

                return;

            }


            /* =========================================
               ONLY ONE IMAGE
            ========================================== */

            if (photos.length === 1) {

                carousel.classList.add(
                    "single-image"
                );

            }


            /* =========================================
               CREATE SLIDES
            ========================================== */

            photos.forEach(
                (photo, index) => {

                    const slide =
                        document.createElement(
                            "div"
                        );


                    slide.className =
                        "carousel-slide";
                    slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");

                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        photo;


                    image.alt =
                        `${nicheName} project ${index + 1}`;


                    // Load every gallery image up front so later slides (especially
                    // the third and final photos) are ready when the user navigates.
                    image.loading = "eager";
                    image.decoding = "async";
                    image.draggable = false;

                    // Make a missing filename/path easy to diagnose in DevTools.
                    image.addEventListener("error", () => {
                        console.warn(`[TAPIND gallery] Could not load image: ${photo}`, {
                            niche: nicheName,
                            slide: index + 1
                        });
                        slide.classList.add("image-load-error");
                        image.alt = `${nicheName} project ${index + 1} — image could not load. Check its path in TAPIND.nichePhotos.`;
                    }, { once: true });


                    slide.appendChild(
                        image
                    );


                    track.appendChild(
                        slide
                    );

                }
            );


            /* =========================================
               CREATE DOTS
            ========================================== */

            photos.forEach(
                (_, index) => {

                    const dot =
                        document.createElement(
                            "button"
                        );


                    dot.className =
                        "carousel-dot";


                    dot.type =
                        "button";


                    dot.setAttribute(
                        "aria-label",
                        `Go to image ${index + 1}`
                    );


                    if (index === 0) {

                        dot.classList.add(
                            "active"
                        );

                    }


                    dot.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            goToSlide(
                                carousel,
                                index
                            );

                        }
                    );


                    dots.appendChild(
                        dot
                    );

                }
            );


            /* =========================================
               CAROUSEL STATE
            ========================================== */

            carousel.currentIndex =
                0;


            carousel.totalSlides =
                photos.length;


            /* =========================================
               PREVIOUS
            ========================================== */

            previous.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    let newIndex =
                        carousel.currentIndex - 1;


                    if (newIndex < 0) {

                        newIndex =
                            photos.length - 1;

                    }


                    goToSlide(
                        carousel,
                        newIndex
                    );

                }
            );


            /* =========================================
               NEXT
            ========================================== */

            next.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    let newIndex =
                        carousel.currentIndex + 1;


                    if (
                        newIndex >=
                        photos.length
                    ) {

                        newIndex = 0;

                    }


                    goToSlide(
                        carousel,
                        newIndex
                    );

                }
            );


            /* =========================================
               SWIPE SUPPORT
            ========================================== */

            setupSwipe(
                carousel
            );

        }
    );

}


/* =====================================================
   GO TO SPECIFIC SLIDE
===================================================== */

function goToSlide(
    carousel,
    index
) {

    const track =
        carousel.querySelector(
            ".carousel-track"
        );


    const dots =
        carousel.querySelectorAll(
            ".carousel-dot"
        );
    const slides = carousel.querySelectorAll(".carousel-slide");

    if (!track) return;


    carousel.currentIndex =
        index;


    track.style.transform =
        `translateX(-${index * 100}%)`;

    slides.forEach((slide, slideIndex) => {
        slide.setAttribute("aria-hidden", slideIndex === index ? "false" : "true");
    });

    dots.forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "active",
                dotIndex === index
            );

        }
    );

}


/* =====================================================
   TOUCH + MOUSE SWIPE
===================================================== */

function setupSwipe(carousel) {

    let startX = 0;

    let startY = 0;

    let currentX = 0;

    let isDragging = false;

    let moved = false;


    /* =========================================
       TOUCH START
    ========================================== */

    carousel.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.touches[0];


            startX =
                touch.clientX;

            startY =
                touch.clientY;

            currentX =
                startX;

            isDragging =
                true;

            moved =
                false;

        },
        {
            passive: true
        }
    );


    /* =========================================
       TOUCH MOVE
    ========================================== */

    carousel.addEventListener(
        "touchmove",
        event => {

            if (!isDragging) return;


            const touch =
                event.touches[0];


            currentX =
                touch.clientX;


            if (
                Math.abs(
                    currentX - startX
                ) > 10
            ) {

                moved =
                    true;

            }

        },
        {
            passive: true
        }
    );


    /* =========================================
       TOUCH END
    ========================================== */

    carousel.addEventListener(
        "touchend",
        () => {

            if (!isDragging) return;


            const difference =
                currentX - startX;


            const threshold =
                45;


            if (
                Math.abs(difference) >=
                threshold
            ) {

                if (difference < 0) {

                    goNext(
                        carousel
                    );

                } else {

                    goPrevious(
                        carousel
                    );

                }

            }


            isDragging =
                false;

        }
    );


    /* =========================================
       MOUSE DOWN
    ========================================== */

    carousel.addEventListener(
        "mousedown",
        event => {

            startX =
                event.clientX;

            currentX =
                startX;

            isDragging =
                true;

            moved =
                false;

            carousel.classList.add(
                "dragging"
            );

        }
    );


    /* =========================================
       MOUSE MOVE
    ========================================== */

    document.addEventListener(
        "mousemove",
        event => {

            if (!isDragging) return;


            currentX =
                event.clientX;


            if (
                Math.abs(
                    currentX - startX
                ) > 10
            ) {

                moved =
                    true;

            }

        }
    );


    /* =========================================
       MOUSE UP
    ========================================== */

    document.addEventListener(
        "mouseup",
        () => {

            if (!isDragging) return;


            const difference =
                currentX - startX;


            const threshold =
                45;


            if (
                Math.abs(difference) >=
                threshold
            ) {

                if (difference < 0) {

                    goNext(
                        carousel
                    );

                } else {

                    goPrevious(
                        carousel
                    );

                }

            }


            isDragging =
                false;


            carousel.classList.remove(
                "dragging"
            );

        }
    );

}


/* =====================================================
   NEXT SLIDE
===================================================== */

function goNext(carousel) {

    let newIndex =
        carousel.currentIndex + 1;


    if (
        newIndex >=
        carousel.totalSlides
    ) {

        newIndex = 0;

    }


    goToSlide(
        carousel,
        newIndex
    );

}


/* =====================================================
   PREVIOUS SLIDE
===================================================== */

function goPrevious(carousel) {

    let newIndex =
        carousel.currentIndex - 1;


    if (newIndex < 0) {

        newIndex =
            carousel.totalSlides - 1;

    }


    goToSlide(
        carousel,
        newIndex
    );

}


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
    document.getElementById(
        "saveContact"
    );


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
    document.getElementById(
        "floatingSave"
    );


if (floatingSave) {

    floatingSave.addEventListener(
        "click",
        saveContact
    );

}


/* =====================================================
   NOTIFICATION SYSTEM
===================================================== */

function showNotification(
    message
) {

    const existing =
        document.querySelector(
            ".tapind-notification"
        );


    if (existing) {

        existing.remove();

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "tapind-notification";


    notification.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        <span>${message}</span>

    `;


    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.classList.add(
                "show"
            );

        },
        50
    );


    setTimeout(
        () => {

            notification.classList.remove(
                "show"
            );

        },
        2800
    );


    setTimeout(
        () => {

            notification.remove();

        },
        3300
    );

}


/* =====================================================
   NOTIFICATION CSS
===================================================== */

const notificationStyle =
    document.createElement(
        "style"
    );


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
   INITIALIZE NICHE CAROUSELS
===================================================== */

createNicheCarousels();


/* =====================================================
   CONSOLE MESSAGE
===================================================== */

console.log(
    "TAPIND Digital Business Card loaded."
);

console.log(
    "Multi-photo niche carousel enabled."
);

console.log(
    "Tap. Connect. Grow."
);

/* =========================================
   TAPIND CUSTOMER REVIEW SYSTEM
   Cloudflare Worker + Turnstile + D1
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "https://tapind-reviews-api.justinriverodiaz.workers.dev";
    const reviewForm = document.getElementById("reviewForm");
    const reviewsList = document.getElementById("reviewsList");
    const reviewName = document.getElementById("reviewName");
    const reviewRole = document.getElementById("reviewRole");
    const reviewRating = document.getElementById("reviewRating");
    const reviewMessage = document.getElementById("reviewMessage");
    const reviewCharacterCount = document.getElementById("reviewCharacterCount");
    const reviewSuccess = document.getElementById("reviewSuccess");
    const submitButton = reviewForm?.querySelector('[type="submit"]');
    const starButtons = document.querySelectorAll(".star-button");
    const overallRating = document.getElementById("overallRating");
    const overallStars = document.getElementById("overallStars");
    const reviewsStatus = document.getElementById("reviewsStatus");

    if (!reviewForm || !reviewsList) return;

    let selectedRating = Number(reviewRating?.value || 5);
    updateStars(selectedRating);
    loadApprovedReviews();

    starButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedRating = Number(button.dataset.rating);
            reviewRating.value = String(selectedRating);
            updateStars(selectedRating);
        });
    });

    function updateStars(rating) {
        starButtons.forEach(button => {
            button.classList.toggle("active", Number(button.dataset.rating) <= rating);
        });
    }

    reviewMessage?.addEventListener("input", () => {
        if (reviewCharacterCount) reviewCharacterCount.textContent = String(reviewMessage.value.length);
    });

    async function loadApprovedReviews() {
        try {
            const response = await fetch(`${API_BASE}/reviews`, { method: "GET" });
            if (!response.ok) throw new Error("Unable to load reviews");
            const data = await response.json();
            const reviews = Array.isArray(data.reviews) ? data.reviews : [];
            reviewsList.replaceChildren();

            if (!reviews.length) {
                if (reviewsStatus) {
                    reviewsStatus.textContent = "No approved reviews yet. Be the first to share your experience!";
                    reviewsList.appendChild(reviewsStatus);
                } else {
                    const empty = document.createElement("p");
                    empty.className = "reviews-loading";
                    empty.textContent = "No approved reviews yet. Be the first to share your experience!";
                    reviewsList.appendChild(empty);
                }
            } else {
                if (reviewsStatus) reviewsStatus.remove();
                reviews.forEach(addReviewToPage);
            }
            updateOverallRating(reviews);
        } catch (error) {
            console.error("Could not load TAPIND reviews:", error);
            if (reviewsStatus) reviewsStatus.textContent = "Reviews are temporarily unavailable. Please try again later.";
            updateOverallRating([]);
        }
    }

    reviewForm.addEventListener("submit", async event => {
        event.preventDefault();
        const name = reviewName.value.trim();
        const role = reviewRole.value.trim();
        const review = reviewMessage.value.trim();
        const rating = Number(reviewRating.value);
        const tokenInput = reviewForm.querySelector('[name="cf-turnstile-response"]');
        const turnstileToken = tokenInput?.value || "";

        if (name.length < 2 || name.length > 80) {
            showMessage("Please enter a name between 2 and 80 characters.", false);
            return;
        }
        if (!role || role.length > 60) {
            showMessage("Please enter your business or role (up to 60 characters).", false);
            return;
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            showMessage("Please select a rating from 1 to 5 stars.", false);
            return;
        }
        if (review.length < 5 || review.length > 1500) {
            showMessage("Your review must be between 5 and 1,500 characters.", false);
            return;
        }
        if (!turnstileToken) {
            showMessage("Please complete the anti-spam check first.", false);
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent.trim();
            submitButton.textContent = "Submitting…";
        }
        if (reviewSuccess) reviewSuccess.classList.remove("show");

        try {
            const response = await fetch(`${API_BASE}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, role, rating, review, turnstileToken })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || "Could not submit your review.");

            showMessage(data.message || "Thank you! Your review was submitted for approval.", true);
            reviewForm.reset();
            selectedRating = 5;
            if (reviewRating) reviewRating.value = "5";
            updateStars(5);
            if (reviewCharacterCount) reviewCharacterCount.textContent = "0";
            if (window.turnstile) window.turnstile.reset();
            // Pending reviews are deliberately not inserted into the public list.
        } catch (error) {
            showMessage(error.message || "Submission failed. Please try again.", false);
            if (window.turnstile) window.turnstile.reset();
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || "Submit Review";
            }
        }
    });

    function showMessage(message, success) {
        if (!reviewSuccess) {
            window.alert(message);
            return;
        }
        reviewSuccess.textContent = message;
        reviewSuccess.classList.add("show");
        reviewSuccess.style.borderColor = success ? "rgba(70, 200, 130, .45)" : "rgba(240, 90, 90, .5)";
        window.setTimeout(() => reviewSuccess.classList.remove("show"), 6000);
    }

    function addReviewToPage(review) {
        const name = String(review.customer_name || review.name || "Customer");
        const message = String(review.review_text || review.message || "");
        const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
        const role = String(review.customer_role || review.role || "Customer");
        const article = document.createElement("article");
        article.className = "review user-review";

        const top = document.createElement("div");
        top.className = "review-top";
        const avatar = document.createElement("div");
        avatar.className = "review-avatar";
        avatar.textContent = name.charAt(0).toUpperCase();
        const identity = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = name;
        const roleSpan = document.createElement("span");
        roleSpan.textContent = role;
        identity.append(strong, roleSpan);
        top.append(avatar, identity);

        const stars = document.createElement("div");
        stars.className = "stars";
        stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
        const paragraph = document.createElement("p");
        paragraph.textContent = `“${message}”`;
        article.append(top, stars, paragraph);
        reviewsList.appendChild(article);
    }

    function updateOverallRating(reviews) {
        const total = reviews.length;
        const average = total ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total : 0;
        if (overallRating) overallRating.textContent = total ? average.toFixed(1) : "—";
        if (overallStars) {
            const full = total ? Math.round(average) : 0;
            overallStars.textContent = "★".repeat(full) + "☆".repeat(5 - full);
        }
    }
});
