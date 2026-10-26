
const form = document.getElementById("client-form");
const clientIdInput = document.getElementById("client-id");
const message = document.getElementById("message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const clientId = clientIdInput.value.trim();

  if (!/^[A-Za-z0-9_-]{1,32}$/.test(clientId)) {
    message.textContent = "Please enter a valid Client ID.";
    return;
  }

  // Temporary test only.
  // We will connect this to Cloudflare next.
  message.textContent =
    `Client ID ${clientId} accepted. Redirect system coming next!`;
});
