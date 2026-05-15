const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalType = document.getElementById('modalType');
const closeBtn = document.querySelector('.modal-close');

if (modal && modalImg && modalTitle && modalType && closeBtn) {
  document.querySelectorAll('.logo-card[data-img]').forEach((card) => {
    card.addEventListener('click', () => {
      modalImg.src = card.dataset.img;
      modalImg.alt = `${card.dataset.title} preview`;
      modalTitle.textContent = card.dataset.title;
      modalType.textContent = card.dataset.type;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

document.querySelectorAll('.js-intake-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const formNote = document.getElementById(form.dataset.noteId);
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending...';
    if (formNote) {
      formNote.className = 'form-note';
      formNote.textContent = form.dataset.sending || 'Sending...';
    }

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.submitted_at = new Date().toISOString();
      payload.page_url = window.location.href;

      const response = await fetch(form.action, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('ShopNasGraphics intake request failed');

      form.reset();
      if (formNote) {
        formNote.className = 'form-note success';
        formNote.textContent = form.dataset.success || 'Sent. ShopNasGraphics will follow up with your next step.';
      }
    } catch (error) {
      if (formNote) {
        formNote.className = 'form-note error';
        formNote.textContent = 'Could not send the inquiry right now. Please try again or email directly.';
      }
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
});
