// Generate vCard Contact File (.vcf)
function downloadVCard() {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:King Arcega
ORG:theshop101.ph
EMAIL;TYPE=INTERNET,WORK:theshop101.ph@gmail.com
ADR;TYPE=WORK:;;55 G Marcelo Street Maysan;Valenzuela City;;;Philippines
URL;TYPE=TikTok:https://www.tiktok.com/@theshop101ph
URL;TYPE=Facebook:https://www.facebook.com/share/1Cko11JjHw/
URL;TYPE=Instagram:https://www.facebook.com/share/1Cko11JjHw/
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'King_Arcega.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
