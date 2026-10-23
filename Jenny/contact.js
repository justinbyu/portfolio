/* =====================================
   ALR STEEL — SAVE CONTACT PAGE
   Keep these details in sync with
   CONFIG in script.js
===================================== */

const CONTACT = {
  name: "Jenny Joven Beria",
  title: "ALR Steel Fabrication and Services OPC",
  organization: "ALR Steel Fabrication and Services OPC",
  phone: "+639771164273", // 0977 116 4273 in international format
  email: "alr_kitssa@yahoo.com"
};

const contactStatus = document.getElementById("contactStatus");

function setStatus(message) {
  if (contactStatus) contactStatus.textContent = message;
}

function escapeVCard(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildVCard(includePhone, includeEmail) {
  const fields = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(CONTACT.name)}`,
    `ORG:${escapeVCard(CONTACT.organization)}`,
    `TITLE:${escapeVCard(CONTACT.title)}`
  ];

  if (includePhone) {
    fields.push(`TEL;TYPE=CELL:${escapeVCard(CONTACT.phone)}`);
  }

  if (includeEmail) {
    fields.push(`EMAIL:${escapeVCard(CONTACT.email)}`);
  }

  fields.push("END:VCARD");

  return fields.join("\r\n") + "\r\n";
}

function downloadVCard(filename, vcard, doneMessage) {
  const file = new Blob([vcard], {
    type: "text/vcard;charset=utf-8"
  });

  const downloadURL = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = downloadURL;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);

  setStatus(doneMessage);
}

const savePhone = document.getElementById("savePhone");
const saveEmail = document.getElementById("saveEmail");
const saveBoth = document.getElementById("saveBoth");

if (savePhone) {
  savePhone.addEventListener("click", () => {
    downloadVCard(
      "Jenny-Joven-Beria-Phone.vcf",
      buildVCard(true, false),
      "Phone contact downloaded. Open the file to save it to your phone."
    );
  });
}

if (saveEmail) {
  saveEmail.addEventListener("click", () => {
    downloadVCard(
      "Jenny-Joven-Beria-Email.vcf",
      buildVCard(false, true),
      "Email contact downloaded. Open the file to save it to your phone."
    );
  });
}

if (saveBoth) {
  saveBoth.addEventListener("click", () => {
    downloadVCard(
      "Jenny-Joven-Beria-ALR.vcf",
      buildVCard(true, true),
      "Full contact downloaded. Open the file to save it to your phone."
    );
  });
}
