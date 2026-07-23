const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalType = document.getElementById('modalType');
const closeBtn = document.querySelector('.modal-close');

const quoteForm = document.getElementById('quote');
const quoteSelect = quoteForm?.querySelector('select[name="project_type"]');
const mobileQuoteCta = document.querySelector('.mobile-quote-cta');

if (quoteForm && mobileQuoteCta && 'IntersectionObserver' in window) {
  const quoteVisibilityObserver = new IntersectionObserver(([entry]) => {
    mobileQuoteCta.classList.toggle('is-hidden', entry.isIntersecting);
  }, { threshold: 0.12 });

  quoteVisibilityObserver.observe(quoteForm);
}

document.querySelectorAll('[data-quote-trigger]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (!quoteForm) return;
    quoteForm.dataset.ctaSource = trigger.dataset.quoteTrigger || 'unknown';

    if (trigger.dataset.package && quoteSelect) {
      quoteSelect.value = trigger.dataset.package;
    }
  });
});

document.querySelectorAll('.js-intake-form').forEach((form) => {
  const markFormStarted = () => {
    if (!form.dataset.formStartedAt) {
      form.dataset.formStartedAt = new Date().toISOString();
      window.dispatchEvent(new CustomEvent('shopnasgfx:form-start', {
        detail: {
          formId: form.id,
          ctaSource: form.dataset.ctaSource || 'direct'
        }
      }));
    }
  };

  form.addEventListener('input', markFormStarted, { once: true });
});

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
      const searchParams = new URLSearchParams(window.location.search);
      payload.submitted_at = new Date().toISOString();
      payload.page_url = window.location.href;
      payload.referrer = document.referrer || 'direct';
      payload.cta_source = form.dataset.ctaSource || 'direct';
      payload.form_started_at = form.dataset.formStartedAt || '';
      payload.utm_source = searchParams.get('utm_source') || '';
      payload.utm_medium = searchParams.get('utm_medium') || '';
      payload.utm_campaign = searchParams.get('utm_campaign') || '';
      payload.utm_content = searchParams.get('utm_content') || '';

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
      window.dispatchEvent(new CustomEvent('shopnasgfx:lead-submit-success', {
        detail: {
          formId: form.id,
          projectType: payload.project_type,
          ctaSource: payload.cta_source,
          utmSource: payload.utm_source
        }
      }));
      document.dispatchEvent(new CustomEvent('cuelume:success'));
    } catch (error) {
      if (formNote) {
        formNote.className = 'form-note error';
        formNote.textContent = 'Could not send the inquiry right now. Please try again or email directly.';
      }
      document.dispatchEvent(new CustomEvent('cuelume:error'));
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
});
