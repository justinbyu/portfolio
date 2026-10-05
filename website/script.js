/* =====================================
   TAPIND NFC BUSINESS CARD
   COMPLETE JAVASCRIPT
===================================== */


/* =====================================
   GOOGLE SHEETS / APPS SCRIPT
===================================== */

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbya1jUMIIASHEOkkZSHnvU97r7oyjesgN0HJZH__5ovumA9A_cBzabU66Jp8Kda3nzc/exec";


/* =====================================
   ELEMENTS
===================================== */

const cardContainer =
    document.getElementById("cardContainer");

const businessCard =
    document.getElementById("businessCard");

const phoneContainer =
    document.getElementById("phoneContainer");

const phone =
    document.querySelector(".iphone");

const demo =
    document.getElementById("demo");

const resetButton =
    document.getElementById("resetButton");

const phoneDetected =
    document.getElementById("phoneDetected");


/* =====================================
   YOUR REAL DIGITAL BUSINESS CARD
===================================== */

const digitalCardURL =
    "https://justinbyu.github.io/portfolio/bdg/index.html";


/* =====================================
   VARIABLES
===================================== */

let cardFlipped = false;

let phoneTapped = false;

let tapTimer1 = null;

let tapTimer2 = null;


/* =====================================
   CARD FLIP
   FRONT ↔ BACK
===================================== */

if (cardContainer && businessCard) {

    cardContainer.addEventListener(
        "click",
        function () {

            /*
                Clicking the physical card
                ONLY flips the card.

                It does NOT start NFC.
            */

            cardFlipped = !cardFlipped;


            if (cardFlipped) {

                businessCard.classList.add(
                    "flipped"
                );

            } else {

                businessCard.classList.remove(
                    "flipped"
                );

            }

        }
    );

}


/* =====================================
   PHONE TAP
===================================== */

function startPhoneTap() {

    /*
        Prevent multiple taps
        while animation is running.
    */

    if (phoneTapped) {
        return;
    }


    phoneTapped = true;


    /* ===============================
       STEP 1
       PHONE MOVES TO CARD
    =============================== */

    if (demo) {

        demo.classList.add(
            "phone-tapping"
        );

    }


    /* ===============================
       STEP 2
       NFC DETECTED
    =============================== */

    tapTimer1 = setTimeout(
        function () {

            if (phone) {

                phone.classList.add(
                    "detected"
                );

            }

        },
        1200
    );


    /* ===============================
       STEP 3
       OPEN DIGITAL BUSINESS CARD
    =============================== */

    tapTimer2 = setTimeout(
        function () {

            window.location.href =
                digitalCardURL;

        },
        3000
    );

}


/* =====================================
   DESKTOP
   MOUSE ENTERS PHONE
===================================== */

if (phoneContainer) {

    phoneContainer.addEventListener(
        "mouseenter",
        startPhoneTap
    );

}


/* =====================================
   MOBILE TOUCH
===================================== */

if (phoneContainer) {

    phoneContainer.addEventListener(
        "touchstart",
        function (event) {

            event.preventDefault();

            startPhoneTap();

        },
        {
            passive: false
        }
    );

}


/* =====================================
   CLICK PHONE
===================================== */

if (phoneContainer) {

    phoneContainer.addEventListener(
        "click",
        function () {

            startPhoneTap();

        }
    );

}


/* =====================================
   RESET DEMO
===================================== */

if (resetButton) {

    resetButton.addEventListener(
        "click",
        function () {

            /*
                Cancel timers
            */

            clearTimeout(tapTimer1);

            clearTimeout(tapTimer2);


            /*
                Reset card
            */

            cardFlipped = false;

            if (businessCard) {

                businessCard.classList.remove(
                    "flipped"
                );

            }


            /*
                Reset phone
            */

            phoneTapped = false;


            if (demo) {

                demo.classList.remove(
                    "phone-tapping"
                );

            }


            if (phone) {

                phone.classList.remove(
                    "detected"
                );

            }


            /*
                Return to top
            */

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* =====================================
   TAPIND PRE-ORDER FORM
===================================== */

/*
    This connects your website to:

    TAPIND WEBSITE
          ↓
    GOOGLE APPS SCRIPT
          ↓
    GOOGLE SHEETS
          ↓
    YOUR GMAIL
*/


const preorderForm =
    document.getElementById("preorderForm");


/* =====================================
   FORM SUBMISSION
===================================== */

if (preorderForm) {

    preorderForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ==========================
               GET SUBMIT BUTTON
            ========================== */

            const submitButton =
                preorderForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            /* ==========================
               LOADING STATE
            ========================== */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "SUBMITTING...";

            }


            /* ==========================
               GET FORM DATA
            ========================== */

            const formData =
                new FormData(preorderForm);


            /*
                Convert all form fields
                into URLSearchParams.

                IMPORTANT:
                This automatically sends
                EVERY field in your HTML
                form.
            */

            const data =
                new URLSearchParams();


            formData.forEach(
                function (value, key) {

                    data.append(
                        key,
                        value
                    );

                }
            );


            /* ==========================
               ADD TAPIND INFORMATION
            ========================== */

            data.append(
                "source",
                "TAPIND Website"
            );


            data.append(
                "submittedAt",
                new Date().toISOString()
            );


            /* ==========================
               SEND TO GOOGLE APPS SCRIPT
            ========================== */

            try {

                await fetch(
                    GOOGLE_SCRIPT_URL,
                    {

                        method: "POST",

                        mode: "no-cors",

                        headers: {

                            "Content-Type":
                                "application/x-www-form-urlencoded"

                        },

                        body:
                            data.toString()

                    }
                );


                /* ==========================
                   SUCCESS
                ========================== */

                showPreorderMessage(
                    "success",
                    "Thank you! Your TAPIND pre-order has been submitted successfully. We will contact you soon."
                );


                /* ==========================
                   CLEAR FORM
                ========================== */

                preorderForm.reset();


            } catch (error) {

                console.error(
                    "TAPIND pre-order error:",
                    error
                );


                /* ==========================
                   ERROR
                ========================== */

                showPreorderMessage(
                    "error",
                    "Something went wrong. Please try again or contact TAPIND directly."
                );

            }


            /* ==========================
               RESTORE BUTTON
            ========================== */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    originalButtonText ||
                    "SUBMIT PRE-ORDER";

            }

        }
    );

}


/* =====================================
   PRE-ORDER MESSAGE
===================================== */

function showPreorderMessage(
    type,
    message
) {

    /*
        Your HTML already has:

        <div id="formMessage">

        So use that first.
    */

    let messageElement =
        document.getElementById(
            "formMessage"
        );


    /*
        Backup:
        If formMessage doesn't exist,
        create one.
    */

    if (!messageElement) {

        messageElement =
            document.createElement("div");

        messageElement.id =
            "formMessage";


        if (preorderForm) {

            preorderForm.appendChild(
                messageElement
            );

        }

    }


    /* ==========================
       MESSAGE CONTENT
    ========================== */

    messageElement.textContent =
        message;


    messageElement.style.display =
        "block";


    messageElement.style.marginTop =
        "20px";


    messageElement.style.padding =
        "15px";


    messageElement.style.borderRadius =
        "10px";


    messageElement.style.fontSize =
        "14px";


    messageElement.style.lineHeight =
        "1.5";


    /* ==========================
       SUCCESS STYLE
    ========================== */

    if (type === "success") {

        messageElement.style.background =
            "rgba(77, 184, 255, 0.10)";


        messageElement.style.border =
            "1px solid #4db8ff";


        messageElement.style.color =
            "#4db8ff";

    }


    /* ==========================
       ERROR STYLE
    ========================== */

    if (type === "error") {

        messageElement.style.background =
            "rgba(255, 80, 80, 0.10)";


        messageElement.style.border =
            "1px solid #ff5050";


        messageElement.style.color =
            "#ff7070";

    }


    /* ==========================
       SCROLL TO MESSAGE
    ========================== */

    messageElement.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


/* =====================================
   SMOOTH SCROLL TO PRE-ORDER
===================================== */

const preorderButtons =
    document.querySelectorAll(
        '[href="#preorder"], #preorderButton'
    );


preorderButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function (event) {

                const preorderSection =
                    document.getElementById(
                        "preorder"
                    );


                if (preorderSection) {

                    event.preventDefault();


                    preorderSection.scrollIntoView({

                        behavior: "smooth"

                    });

                }

            }
        );

    }
);


/* =====================================
   TAPIND SYSTEM READY
===================================== */

console.log(
    "TAPIND website loaded successfully."
);

console.log(
    "Google Sheets connection:",
    GOOGLE_SCRIPT_URL
);