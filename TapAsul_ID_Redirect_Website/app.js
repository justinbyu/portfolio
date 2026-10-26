
const form = document.getElementById("client-form");
const clientIdInput = document.getElementById("client-id");
const message = document.getElementById("message");

const WORKER_URL =
  "https://tapasul-redirect.justinriverodiaz.workers.dev";

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const clientId = clientIdInput.value.trim();

  // Validate the Client ID before navigating.
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(clientId)) {
    message.textContent =
      "Please enter a valid Client ID using letters, numbers, hyphens, or underscores.";
    return;
  }

  // Send the customer to the Worker, which checks the database.
  message.textContent = "Finding your website...";

  window.location.href =
    `${WORKER_URL}/r/${encodeURIComponent(clientId)}`;
});
