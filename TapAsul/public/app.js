(() => {
  const form = document.querySelector('#client-form');
  const input = document.querySelector('#client-id');
  const error = document.querySelector('#form-error');
  const button = document.querySelector('#continue-button');
  const year = document.querySelector('#year');
  const validId = /^[A-Za-z0-9_-]{1,32}$/;
  if (year) year.textContent = String(new Date().getFullYear());

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = input.value.trim();
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    if (!validId.test(id)) {
      error.textContent = id ? 'That Client ID format is not valid. Use up to 32 letters, numbers, hyphens, or underscores.' : 'Please enter your Client ID.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    button.disabled = true;
    button.querySelector('span').textContent = 'Finding your card…';
    window.location.assign(`/r/${encodeURIComponent(id)}`);
  });
})();
