(function () {
  var card = window.CARD || {};
  var id = document.body.getAttribute("data-pay");
  var payment = (card.payments || []).filter(function (item) { return item.id === id; })[0];
  var status = document.getElementById("payStatus");
  var qrImage = document.getElementById("qrImage");
  var downloadUrl = "";
  var usingSample = true;

  if (!payment) {
    if (status) status.textContent = "This payment is missing from js/config.js.";
    return;
  }

  var brand = document.getElementById("payBrand");
  var title = document.getElementById("payName");
  var sub = document.getElementById("paySub");
  var note = document.getElementById("qrNote");
  var openBtn = document.getElementById("openApp");

  if (brand) brand.textContent = card.brand || "Pay";
  if (title) title.textContent = payment.name;
  if (sub) sub.textContent = "Scan to pay " + (payment.accountName || card.name || "");
  if (openBtn) openBtn.textContent = "Go to " + payment.name + " app";
  document.title = payment.name + (card.brand ? " — " + card.brand : "");

  function samplePayload() {
    return "SAMPLE " + payment.name + " QR for " + (card.name || "this card") + ". Replace with your real QR in js/config.js.";
  }

  function drawQr(value) {
    var qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    return qr.createDataURL(8, 4);
  }

  function showGenerated(value, isSample) {
    usingSample = isSample;
    downloadUrl = drawQr(value);
    if (qrImage) {
      qrImage.src = downloadUrl;
      qrImage.classList.add("is-generated");
      qrImage.alt = payment.name + " QR code";
    }
    if (note) {
      note.hidden = !isSample;
      note.textContent = isSample
        ? "Sample QR. Save your real " + payment.name + " QR and set qrImage in js/config.js."
        : "";
    }
  }

  function showFile(src) {
    usingSample = false;
    downloadUrl = src;
    if (qrImage) {
      qrImage.classList.remove("is-generated");
      qrImage.alt = payment.name + " QR code";
      qrImage.onerror = function () {
        qrImage.onerror = null;
        var payload = payment.qrPayload ? String(payment.qrPayload) : "";
        showGenerated(payload || samplePayload(), !payload);
      };
      qrImage.src = src;
    }
    if (note) note.hidden = true;
  }

  if (payment.qrImage) showFile(payment.qrImage);
  else showGenerated(payment.qrPayload ? String(payment.qrPayload) : samplePayload(), !payment.qrPayload);

  function fileName(ext) {
    var who = String(card.name || "card").trim().replace(/\s+/g, "-").replace(/[^\w\-]/g, "") || "card";
    return who + "-" + payment.name + "-QR" + ext;
  }

  function pngFrom(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        var size = 840;
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = false;
        var pad = 48;
        ctx.drawImage(image, pad, pad, size - pad * 2, size - pad * 2);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = function () { reject(); };
      image.src = src;
    });
  }

  function saveQr() {
    if (downloadUrl.indexOf("data:") === 0) {
      pngFrom(downloadUrl).then(function (png) {
        trigger(png, fileName(".png"));
      }).catch(function () {
        if (status) status.textContent = "Could not save the QR.";
      });
      return;
    }
    fetch(downloadUrl).then(function (response) {
      if (!response.ok) throw new Error("missing");
      return response.blob();
    }).then(function (blob) {
      var ext = blob.type.indexOf("jpeg") !== -1 ? ".jpg" : ".png";
      trigger(URL.createObjectURL(blob), fileName(ext));
    }).catch(function () {
      if (status) status.textContent = "Could not save the QR. Add the image file, then try again.";
    });
  }

  function trigger(href, name) {
    var link = document.createElement("a");
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (href.indexOf("blob:") === 0) {
      window.setTimeout(function () { URL.revokeObjectURL(href); }, 800);
    }
    if (status) status.textContent = "QR saved to your downloads.";
  }

  function openApp() {
    var ua = navigator.userAgent || "";
    var isAndroid = /android/i.test(ua);
    var isIOS = /iPad|iPhone|iPod/.test(ua);
    var store = isIOS ? payment.iosStore : payment.androidStore;

    if (isAndroid && payment.androidPackage) {
      var fallback = encodeURIComponent(payment.androidStore || "");
      window.location.href = "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package="
        + payment.androidPackage
        + (fallback ? ";S.browser_fallback_url=" + fallback : "")
        + ";end";
      if (status) status.textContent = "Opening " + payment.name + "…";
      return;
    }

    if (isIOS && payment.scheme) {
      var started = Date.now();
      window.location.href = payment.scheme;
      window.setTimeout(function () {
        if (document.hidden || Date.now() - started > 1600) return;
        window.location.href = payment.iosStore;
      }, 1200);
      if (status) status.textContent = "Opening " + payment.name + "…";
      return;
    }

    if (isIOS && payment.iosStore) {
      window.location.href = payment.iosStore;
      if (status) status.textContent = "If the app is installed, tap Open on the store page.";
      return;
    }

    if (store) window.open(store, "_blank", "noopener");
    if (status) status.textContent = "Open this page on your phone to launch the " + payment.name + " app.";
  }

  var saveBtn = document.getElementById("saveQr");
  if (saveBtn) saveBtn.addEventListener("click", saveQr);
  if (openBtn) openBtn.addEventListener("click", openApp);
})();
