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
            Do NOT start NFC here.

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