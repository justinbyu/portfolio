const cardContainer =
    document.getElementById("cardContainer");

const businessCard =
    document.getElementById("businessCard");

const phoneContainer =
    document.getElementById("phoneContainer");

const phone =
    document.querySelector(".iphone");

const demo =
    document.querySelector(".demo");

const resetButton =
    document.getElementById("resetButton");

const digitalProfile =
    document.getElementById("digitalProfile");


let cardFlipped = false;
let phoneTapped = false;


/* =====================================
   CLICK BUSINESS CARD
   FLIP FRONT → BACK
===================================== */

cardContainer.addEventListener(
    "click",
    function () {

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
   PHONE TOUCH / MOUSE
===================================== */

function startPhoneTap() {

    if (phoneTapped) {
        return;
    }

    phoneTapped = true;


    /*
       PHONE MOVES TOWARD CARD
    */

    demo.classList.add(
        "phone-tapping"
    );


    /*
       NFC WAVES APPEAR
    */


    /*
       PHONE DETECTS NFC
    */

    setTimeout(
        function () {

            phone.classList.add(
                "detected"
            );

        },
        1200
    );


    /*
       SHOW DIGITAL CARD
    */

    setTimeout(
        function () {

            digitalProfile.classList.add(
                "show"
            );

            digitalProfile.scrollIntoView({
                behavior: "smooth"
            });

        },
        3000
    );
}


/* DESKTOP */

phoneContainer.addEventListener(
    "mouseenter",
    startPhoneTap
);


/* MOBILE */

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


/* ALSO ALLOW CLICK */

phoneContainer.addEventListener(
    "click",
    startPhoneTap
);


/* =====================================
   RESET EVERYTHING
===================================== */

resetButton.addEventListener(
    "click",
    function () {

        cardFlipped = false;

        phoneTapped = false;

        businessCard.classList.remove(
            "flipped"
        );

        demo.classList.remove(
            "phone-tapping"
        );

        phone.classList.remove(
            "detected"
        );

        digitalProfile.classList.remove(
            "show"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);