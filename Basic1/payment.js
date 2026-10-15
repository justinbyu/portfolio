
/* TAPIND PAYMENT PAGE */

document.querySelectorAll(".payment-qr img").forEach((image) => {
  const placeholder = image.nextElementSibling;

  function updateImageState() {
    if (image.naturalWidth > 0) {
      image.style.display = "block";
      placeholder.hidden = true;
    } else {
      image.style.display = "none";
      placeholder.hidden = false;
    }
  }

  image.addEventListener("load", updateImageState);
  image.addEventListener("error", updateImageState);

  if (image.complete) {
    updateImageState();
  }
});
