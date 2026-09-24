/* =====================================
   TAPIND NFC BUSINESS CARD
===================================== */


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
    "https://justinbyu.github.io/portfolio/digital_businesscard/index.html";


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

cardContainer.addEventListener(
    "click",
    function () {

        /*
            Clicking the card only
            flips the physical card.
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

    demo.classList.add(
        "phone-tapping"
    );


    /* ===============================
       STEP 2
       NFC DETECTED
    =============================== */

    tapTimer1 = setTimeout(
        function () {

            phone.classList.add(
                "detected"
            );

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
===================================== */

/*
    Mouse enters phone
    → simulate NFC tap
*/

phoneContainer.addEventListener(
    "mouseenter",
    startPhoneTap
);



/* =====================================
   MOBILE TOUCH
===================================== */

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



/* =====================================
   CLICK PHONE
===================================== */

phoneContainer.addEventListener(
    "click",
    function () {

        startPhoneTap();

    }
);



/* =====================================
   RESET DEMO
===================================== */

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

        businessCard.classList.remove(
            "flipped"
        );


        /*
            Reset phone
        */

        phoneTapped = false;

        demo.classList.remove(
            "phone-tapping"
        );

        phone.classList.remove(
            "detected"
        );


        /*
            Return to top
        */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);



/* =====================================
   TAPIND PRE-ORDER FORM
===================================== */

const preorderForm =
    document.getElementById("preorderForm");

const preorderSuccess =
    document.getElementById("preorderSuccess");

const clearPreorder =
    document.getElementById("clearPreorder");



/* =====================================
   CHECK THAT FORM EXISTS
===================================== */

if (
    preorderForm &&
    preorderSuccess &&
    clearPreorder
) {


    /* =====================================
       SUBMIT PRE-ORDER
    ===================================== */

    preorderForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /*
                Collect form information
            */

            const preorderData = {

                name:
                    document.getElementById(
                        "customerName"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "customerEmail"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "customerPhone"
                    ).value.trim(),

                business:
                    document.getElementById(
                        "businessName"
                    ).value.trim(),

                quantity:
                    document.getElementById(
                        "quantity"
                    ).value,

                finish:
                    document.getElementById(
                        "finish"
                    ).value,

                qr:
                    document.getElementById(
                        "qrPreference"
                    ).value,

                nfc:
                    document.getElementById(
                        "nfcPreference"
                    ).value,

                message:
                    document.getElementById(
                        "customerMessage"
                    ).value.trim(),

                submittedAt:
                    new Date().toISOString()

            };


            /*
                Save information
                using Local Storage
            */

            localStorage.setItem(
                "tapindPreorder",
                JSON.stringify(preorderData)
            );


            /*
                Show success message
            */

            preorderSuccess.classList.add(
                "show"
            );


            /*
                Scroll to confirmation
            */

            preorderSuccess.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );



    /* =====================================
       LOAD PREVIOUS PRE-ORDER
    ===================================== */

    const savedPreorder =
        localStorage.getItem(
            "tapindPreorder"
        );


    if (savedPreorder) {

        try {

            const data =
                JSON.parse(savedPreorder);


            document.getElementById(
                "customerName"
            ).value =
                data.name || "";


            document.getElementById(
                "customerEmail"
            ).value =
                data.email || "";


            document.getElementById(
                "customerPhone"
            ).value =
                data.phone || "";


            document.getElementById(
                "businessName"
            ).value =
                data.business || "";


            document.getElementById(
                "quantity"
            ).value =
                data.quantity || "";


            document.getElementById(
                "finish"
            ).value =
                data.finish || "";


            document.getElementById(
                "qrPreference"
            ).value =
                data.qr || "";


            document.getElementById(
                "nfcPreference"
            ).value =
                data.nfc || "";


            document.getElementById(
                "customerMessage"
            ).value =
                data.message || "";

        }

        catch (error) {

            console.log(
                "Unable to load saved TAPIND pre-order."
            );

        }

    }



    /* =====================================
       CLEAR PRE-ORDER
    ===================================== */

    clearPreorder.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "tapindPreorder"
            );


            preorderForm.reset();


            preorderSuccess.classList.remove(
                "show"
            );

        }
    );

}