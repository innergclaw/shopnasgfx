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

const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending...';
    formNote.className = 'form-note';
    formNote.textContent = 'Sending your inquiry...';

    try {
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('ShopNasGraphics intake request failed');

      contactForm.reset();
      formNote.className = 'form-note success';
      formNote.textContent = 'Inquiry sent. ShopNasGraphics will follow up with your next step.';
    } catch (error) {
      formNote.className = 'form-note error';
      formNote.textContent = 'Could not send the inquiry right now. Please try again or email directly.';
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
}
