const nfcCard = document.getElementById("nfcCard");
const tapButton = document.getElementById("tapButton");
const nfcWaves = document.getElementById("nfcWaves");
const profile = document.getElementById("profile");

let connected = false;


/* =========================
   TAP FUNCTION
========================= */

function activateTap() {

    if (connected) {
        return;
    }

    connected = true;

    // Start NFC animation
    nfcWaves.classList.add("active");

    // Flip card
    setTimeout(() => {

        nfcCard.classList.add("flipped");

    }, 500);


    // Change button
    setTimeout(() => {

        tapButton.innerText = "CONNECTED ✓";

        tapButton.style.background = "#4db8ff";

    }, 900);


    // Show digital profile
    setTimeout(() => {

        profile.classList.add("show");

        profile.scrollIntoView({
            behavior: "smooth"
        });

    }, 1500);

}


/* BUTTON */

tapButton.addEventListener("click", activateTap);


/* CARD */

nfcCard.addEventListener("click", activateTap);


/* =========================
   3D MOUSE EFFECT
========================= */

nfcCard.addEventListener("mousemove", (event) => {

    if (connected) return;

    const rect = nfcCard.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX =
        ((y - centerY) / centerY) * -8;

    const rotateY =
        ((x - centerX) / centerX) * 10;

    nfcCard.style.animation = "none";

    nfcCard.style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

});


/* RESET CARD POSITION */

nfcCard.addEventListener("mouseleave", () => {

    if (connected) return;

    nfcCard.style.animation =
        "floating 4s ease-in-out infinite";

    nfcCard.style.transform = "";

});


/* =========================
   SAVE CONTACT
========================= */

const contactButton =
    document.querySelector(".contact-button");

contactButton.addEventListener("click", () => {

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

    const blob = new Blob(
        [contact],
        { type: "text/vcard" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Justin-Diaz-TAPIND.vcf";

    link.click();

    URL.revokeObjectURL(url);

});