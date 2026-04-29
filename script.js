const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalType = document.getElementById('modalType');
const closeBtn = document.querySelector('.modal-close');

document.querySelectorAll('.logo-card').forEach((card) => {
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
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Formspree request failed');

      contactForm.reset();
      formNote.className = 'form-note success';
      formNote.textContent = 'Inquiry sent. SHOPNASGRAPHICS will follow up.';
    } catch (error) {
      formNote.className = 'form-note error';
      formNote.textContent = 'Could not send through Formspree. Try again or email directly.';
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
}
