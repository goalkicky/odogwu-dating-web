const toast = document.querySelector('.toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('.edit').forEach(button => {
  button.addEventListener('click', () => {
    const row = button.closest('.info-row');
    const field = row.dataset.field;
    const valueEl = row.querySelector('.value');

    const current = valueEl.innerText.trim();
    const next = prompt(`Edit ${field}:`, current);
    if (next !== null && next.trim() !== '') {
      if (field === 'Education') {
        valueEl.querySelector('b').textContent = next.trim();
      } else {
        valueEl.textContent = next.trim();
      }
      showToast(`${field} updated`);
    }
  });
});

document.querySelector('.save-btn').addEventListener('click', () => {
  showToast('Information saved successfully');
});

document.querySelector('.skip-btn').addEventListener('click', () => {
  showToast('Skipped for now');
});

document.querySelector('.back-btn').addEventListener('click', () => {
  if (history.length > 1) history.back();
  else showToast('Back');
});
