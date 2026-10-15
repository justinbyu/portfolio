/* TAPIND PAYMENT PAGE */

document.querySelectorAll(".payment-qr img").forEach((image) => {
  const placeholder = image.nextElementSibling;

  function updateImageState() {
    if (image.naturalWidth > 0) {
      image.style.display = "block";
      if (placeholder) placeholder.hidden = true;
    } else {
      image.style.display = "none";
      if (placeholder) placeholder.hidden = false;
    }
  }

  image.addEventListener("load", updateImageState);
  image.addEventListener("error", updateImageState);

  if (image.complete) {
    updateImageState();
  }
});

const saveQr = document.getElementById("saveQr");
const openApp = document.getElementById("openApp");
const payStatus = document.getElementById("payStatus");

function setStatus(message) {
  if (payStatus) payStatus.textContent = message;
}

if (saveQr) {
  saveQr.addEventListener("click", async (event) => {
    const image = document.querySelector(".payment-qr img");
    const missing = !image || image.style.display === "none" || image.naturalWidth === 0;

    if (missing) {
      event.preventDefault();
      setStatus("Add the QR image first, then save it.");
      return;
    }

    event.preventDefault();

    try {
      const response = await fetch(saveQr.getAttribute("href"));
      if (!response.ok) throw new Error("missing");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = saveQr.getAttribute("download") || "payment-qr.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 800);
      setStatus("QR saved to your downloads.");
    } catch (error) {
      setStatus("Could not save the QR. Check that the image file is in the images folder.");
    }
  });
}

if (openApp) {
  openApp.addEventListener("click", () => {
    const name = openApp.dataset.name || "the app";
    const ua = navigator.userAgent || "";
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const androidStore = openApp.dataset.androidStore;
    const iosStore = openApp.dataset.iosStore;
    const appPackage = openApp.dataset.package;
    const scheme = openApp.dataset.scheme;

    if (isAndroid && appPackage) {
      const fallback = encodeURIComponent(androidStore || "");
      window.location.href =
        "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=" +
        appPackage +
        (fallback ? ";S.browser_fallback_url=" + fallback : "") +
        ";end";
      setStatus("Opening " + name + "…");
      return;
    }

    if (isIOS && scheme) {
      const started = Date.now();
      window.location.href = scheme;
      window.setTimeout(() => {
        if (document.hidden || Date.now() - started > 1600) return;
        if (iosStore) window.location.href = iosStore;
      }, 1200);
      setStatus("Opening " + name + "…");
      return;
    }

    if (isIOS && iosStore) {
      window.location.href = iosStore;
      setStatus("If the app is installed, tap Open on the store page.");
      return;
    }

    const store = androidStore || iosStore;
    if (store) window.open(store, "_blank", "noopener");
    setStatus("Open this page on your phone to launch the " + name + " app.");
  });
}
