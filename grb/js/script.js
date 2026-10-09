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


                    image.loading =
                        "lazy";


                    image.draggable =
                        false;


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
   CLIENT REVIEW SYSTEM
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const reviewForm = document.getElementById("reviewForm");

    const reviewsList = document.getElementById("reviewsList");

    const reviewName = document.getElementById("reviewName");

    const reviewRole = document.getElementById("reviewRole");

    const reviewRating = document.getElementById("reviewRating");

    const reviewMessage = document.getElementById("reviewMessage");

    const reviewCharacterCount =
        document.getElementById("reviewCharacterCount");

    const reviewSuccess =
        document.getElementById("reviewSuccess");

    const starButtons =
        document.querySelectorAll(".star-button");

    const overallRating =
        document.getElementById("overallRating");

    const overallStars =
        document.getElementById("overallStars");


    /* =========================================
       DEFAULT RATING
    ========================================= */

    let selectedRating = 5;


    updateStars(selectedRating);


    /* =========================================
       STAR SELECTION
    ========================================= */

    starButtons.forEach(button => {

        button.addEventListener("click", () => {

            selectedRating =
                Number(button.dataset.rating);

            reviewRating.value =
                selectedRating;

            updateStars(selectedRating);

        });

    });


    function updateStars(rating) {

        starButtons.forEach(button => {

            const buttonRating =
                Number(button.dataset.rating);

            if (buttonRating <= rating) {

                button.classList.add("active");

            } else {

                button.classList.remove("active");

            }

        });

    }


    /* =========================================
       CHARACTER COUNTER
    ========================================= */

    reviewMessage.addEventListener("input", () => {

        reviewCharacterCount.textContent =
            reviewMessage.value.length;

    });


    /* =========================================
       LOAD SAVED REVIEWS
    ========================================= */

    loadSavedReviews();


    function loadSavedReviews() {

        const savedReviews =
            JSON.parse(
                localStorage.getItem("tapindReviews")
            ) || [];


        savedReviews.forEach(review => {

            addReviewToPage(review, false);

        });


        updateOverallRating();

    }


    /* =========================================
       SUBMIT REVIEW
    ========================================= */

    reviewForm.addEventListener("submit", event => {

        event.preventDefault();


        const name =
            reviewName.value.trim();

        const role =
            reviewRole.value.trim();

        const message =
            reviewMessage.value.trim();

        const rating =
            Number(reviewRating.value);


        if (!name || !role || !message) {

            return;

        }


        const review = {

            id: Date.now(),

            name: name,

            role: role,

            rating: rating,

            message: message

        };


        /* =====================================
           SAVE REVIEW
        ===================================== */

        const savedReviews =
            JSON.parse(
                localStorage.getItem("tapindReviews")
            ) || [];


        savedReviews.push(review);


        localStorage.setItem(
            "tapindReviews",
            JSON.stringify(savedReviews)
        );


        /* =====================================
           DISPLAY REVIEW
        ===================================== */

        addReviewToPage(review, true);


        /* =====================================
           UPDATE RATING
        ===================================== */

        updateOverallRating();


        /* =====================================
           RESET FORM
        ===================================== */

        reviewForm.reset();


        selectedRating = 5;

        reviewRating.value = 5;

        updateStars(5);

        reviewCharacterCount.textContent = "0";


        /* =====================================
           SUCCESS MESSAGE
        ===================================== */

        reviewSuccess.classList.add("show");


        setTimeout(() => {

            reviewSuccess.classList.remove("show");

        }, 4000);


        /* =====================================
           SCROLL TO NEW REVIEW
        ===================================== */

        setTimeout(() => {

            const newestReview =
                reviewsList.lastElementChild;

            if (newestReview) {

                newestReview.scrollIntoView({

                    behavior: "smooth",

                    block: "center"

                });

            }

        }, 200);

    });


    /* =========================================
       ADD REVIEW TO PAGE
    ========================================= */

    function addReviewToPage(review, animate = false) {

        const article =
            document.createElement("article");


        article.className = "review user-review";


        if (!animate) {

            article.style.animation = "none";

        }


        const firstLetter =
            review.name.charAt(0).toUpperCase();


        const stars =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);


        article.innerHTML = `

            <div class="review-top">

                <div class="review-avatar">

                    ${escapeHTML(firstLetter)}

                </div>

                <div>

                    <strong>
                        ${escapeHTML(review.name)}
                    </strong>

                    <span>
                        ${escapeHTML(review.role)}
                    </span>

                </div>

            </div>


            <div class="stars">

                ${stars}

            </div>


            <p>

                "${escapeHTML(review.message)}"

            </p>

        `;


        reviewsList.appendChild(article);

    }


    /* =========================================
       UPDATE OVERALL RATING
    ========================================= */

    function updateOverallRating() {

        const savedReviews =
            JSON.parse(
                localStorage.getItem("tapindReviews")
            ) || [];


        /*
         * Three original sample reviews
         * are all 5 stars.
         */

        const originalReviews = 3;

        const originalRating = 5;


        let totalReviews =
            originalReviews +
            savedReviews.length;


        let totalRating =
            originalReviews * originalRating;


        savedReviews.forEach(review => {

            totalRating += Number(review.rating);

        });


        const average =
            totalReviews > 0
                ? totalRating / totalReviews
                : 5;


        const rounded =
            average.toFixed(1);


        overallRating.textContent =
            rounded;


        const fullStars =
            Math.round(average);


        overallStars.textContent =
            "★".repeat(fullStars) +
            "☆".repeat(5 - fullStars);

    }


    /* =========================================
       SECURITY
       Prevent HTML injection in reviews
    ========================================= */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent = value;

        return div.innerHTML;

    }

});