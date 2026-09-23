const tapScene = document.querySelector(".tap-scene");
const tapButton = document.getElementById("tapButton");

const phone = document.getElementById("phone");
const nfcCard = document.getElementById("nfcCard");

const profile = document.getElementById("profile");

let connected = false;


/* =========================
   TAP ANIMATION
========================= */

function startTap() {

    if (connected) {
        return;
    }

    connected = true;

    /* Start scene */
    tapScene.classList.add("active");

    /* Phone detects NFC */
    setTimeout(() => {

        phone.classList.add("connected");

    }, 1100);


    /* Flip card */
    setTimeout(() => {

        nfcCard.classList.add("flipped");

    }, 1500);


    /* Button changes */
    setTimeout(() => {

        tapButton.innerText =
            "CONNECTED ✓";

        tapButton.classList.add("connected");

    }, 1700);


    /* Reveal digital profile */
    setTimeout(() => {

        profile.classList.add("show");

        profile.scrollIntoView({
            behavior: "smooth"
        });

    }, 2800);

}


/* BUTTON */

tapButton.addEventListener(
    "click",
    startTap
);


/* CARD CLICK */

nfcCard.addEventListener(
    "click",
    startTap
);


/* =========================
   3D CARD MOVEMENT
========================= */

nfcCard.addEventListener(
    "mousemove",
    function(event) {

        if (connected) return;

        const rect =
            nfcCard.getBoundingClientRect();

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;

        const centerX =
            rect.width / 2;

        const centerY =
            rect.height / 2;

        const rotateX =
            ((y - centerY) / centerY) * -8;

        const rotateY =
            ((x - centerX) / centerX) * 10;

        nfcCard.style.transform =
            `rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             scale(1.03)`;

    }
);


/* RESET CARD */

nfcCard.addEventListener(
    "mouseleave",
    function() {

        if (connected) return;

        nfcCard.style.transform = "";

    }
);


/* =========================
   SAVE CONTACT
========================= */

const contactButton =
    document.querySelector(".contact-button");

contactButton.addEventListener(
    "click",
    function() {

        const contact = `
BEGIN:VCARD
VERSION:3.0
FN:Justin Diaz
ORG:TAPIND
TITLE:CEO
TEL:
EMAIL:
URL:
END:VCARD
`;

        const blob =
            new Blob(
                [contact],
                { type: "text/vcard" }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "Justin-Diaz-TAPIND.vcf";

        link.click();

        URL.revokeObjectURL(url);

    }
);