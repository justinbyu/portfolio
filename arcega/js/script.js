// Cross-Platform vCard Generator Fix (iOS Safari + Android Chrome Compatible)
function downloadVCard(e) {
    if (e) e.preventDefault();

    const vCardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Arcega;King;;;',
        'FN:King Arcega',
        'ORG:theshop101.ph',
        'TITLE:Affiliate Marketing Creator',
        'EMAIL;TYPE=INTERNET,WORK:theshop101.ph@gmail.com',
        'ADR;TYPE=WORK;LABEL="Valenzuela City":;;55 G Marcelo Street Maysan;Valenzuela City;;;Philippines',
        'URL;TYPE=TikTok:https://www.tiktok.com/@theshop101ph',
        'URL;TYPE=Facebook:https://www.facebook.com/share/1Cko11JjHw/',
        'URL;TYPE=Instagram:https://www.facebook.com/share/1Cko11JjHw/',
        'REV:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        'END:VCARD'
    ].join('\r\n');

    // Method 1: Data URI with text/vcard MIME type (Triggers direct Contacts app preview on iOS Safari & Mobile Chrome)
    const encodedVCard = encodeURIComponent(vCardData);
    const dataUri = 'data:text/vcard;charset=utf-8,' + encodedVCard;

    // Detect Mobile Environment
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Direct location navigation works seamlessly across iOS Safari & Android Mobile Chrome
        window.location.href = dataUri;
    } else {
        // Blob Object Download for Desktop Web Browsers
        const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'King_Arcega.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

// 3D Cover Flow / Cover Ring Controller
let currentCover = 1; // Default middle slide active
const totalCovers = 3;

function renderCoverflow() {
    const cards = document.querySelectorAll('.coverflow-card');
    const dots = document.querySelectorAll('.cover-dot');

    cards.forEach((card, idx) => {
        card.classList.remove('center', 'left', 'right');
        
        if (idx === currentCover) {
            card.classList.add('center');
        } else if (idx === (currentCover - 1 + totalCovers) % totalCovers) {
            card.classList.add('left');
        } else {
            card.classList.add('right');
        }
    });

    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentCover);
    });
}

function nextCoverSlide() {
    currentCover = (currentCover + 1) % totalCovers;
    renderCoverflow();
}

function prevCoverSlide() {
    currentCover = (currentCover - 1 + totalCovers) % totalCovers;
    renderCoverflow();
}

function setCoverSlide(idx) {
    currentCover = idx;
    renderCoverflow();
}

// Initialize Coverflow positions
document.addEventListener('DOMContentLoaded', () => {
    renderCoverflow();
});

// Auto-rotate 3D Cover Ring every 4.5 seconds
setInterval(() => {
    nextCoverSlide();
}, 4500);
