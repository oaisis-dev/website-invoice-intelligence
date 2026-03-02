const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 20); });

const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => { menuBtn.classList.toggle('active'); mobileMenu.classList.toggle('hidden'); });
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => { menuBtn.classList.remove('active'); mobileMenu.classList.add('hidden'); }));

const ro = new IntersectionObserver((e) => { e.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); }); }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* ===== ANALYTICS (GA4 gtag) ===== */
function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

document.querySelectorAll('[data-gtag-event]').forEach(el => {
  el.addEventListener('click', () => {
    trackEvent(el.dataset.gtagEvent, {
      cta_label: el.dataset.gtagLabel || undefined,
      cta_location: el.dataset.gtagLocation || undefined,
      cta_target: el.dataset.gtagTarget || undefined,
      cta_text: (el.textContent || '').trim() || undefined,
    });
  });
});

function toggleFaq(btn) {
  const item = btn.closest('.faq-item'), ans = item.querySelector('.faq-answer'), chev = item.querySelector('.faq-chevron'), isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-chevron').forEach(c => c.classList.remove('open'));
  if (!isOpen) { ans.classList.add('open'); chev.classList.add('open'); }
}

const bt = document.getElementById('billingToggle'), ml = document.getElementById('monthlyLabel'), al = document.getElementById('annualLabel');
let isAnnual = true;
bt.addEventListener('click', () => {
  isAnnual = !isAnnual;
  bt.classList.toggle('active', isAnnual);
  ml.className = isAnnual ? 'text-sm font-medium text-gray-600' : 'text-sm font-semibold text-gray-800';
  al.querySelector('.glass-subtle') && (al.className = isAnnual ? 'text-sm font-semibold text-gray-800' : 'text-sm font-medium text-gray-600');
  document.querySelectorAll('.price-value').forEach(el => { el.textContent = `$${isAnnual ? el.dataset.annual : el.dataset.monthly}`; });
});

/* ===== MODAL SYSTEM ===== */
let activeModal = null;
let previousFocus = null;

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  previousFocus = document.activeElement;
  activeModal = modal;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Reset contact form if reopening
  if (id === 'contactModal') {
    document.getElementById('contactForm').classList.remove('hidden');
    document.getElementById('contactSuccess').classList.add('hidden');
    clearFormErrors();
  }

  // Focus the close button
  requestAnimationFrame(() => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  });
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  activeModal = null;
  if (previousFocus) previousFocus.focus();
  previousFocus = null;
}

// Click outside to close
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) closeModal(backdrop.id);
  });
});

// Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeModal) {
    closeModal(activeModal.id);
  }

  // Focus trap
  if (e.key === 'Tab' && activeModal) {
    const focusable = activeModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
});

/* ===== CONTACT FORM ===== */
function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function submitContact() {
  clearFormErrors();
  const name = document.getElementById('cf-name');
  const biz = document.getElementById('cf-biz');
  const email = document.getElementById('cf-email');
  const msg = document.getElementById('cf-msg');
  const demo = document.getElementById('cf-demo');
  let valid = true;

  if (!name.value.trim()) {
    name.classList.add('error');
    document.getElementById('cf-name-err').classList.add('visible');
    valid = false;
  }
  if (!biz.value.trim()) {
    biz.classList.add('error');
    document.getElementById('cf-biz-err').classList.add('visible');
    valid = false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
    email.classList.add('error');
    document.getElementById('cf-email-err').classList.add('visible');
    valid = false;
  }

  if (!valid) {
    // Focus the first errored field
    const firstErr = document.querySelector('.form-input.error');
    if (firstErr) firstErr.focus();
    return;
  }

  trackEvent('form_submit', {
    form_id: 'contact_form',
    form_location: 'contact_modal',
    demo_requested: demo.checked,
  });

  // Build email
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${pad(now.getUTCMonth()+1)}/${pad(now.getUTCDate())}/${now.getUTCFullYear()} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
  const confirmation = demo.checked ? 'Demo' : 'Contact Only';
  const subject = encodeURIComponent('Invoice Intelligence contact');
  const body = encodeURIComponent(
    `Name: ${name.value.trim()}\n` +
    `Business Name: ${biz.value.trim()}\n` +
    `Business Email: ${email.value.trim()}\n` +
    `Message: ${msg.value.trim() || '(none)'}\n` +
    `Confirmation: ${confirmation}\n` +
    `UTC Date/Time Stamp: ${timestamp}`
  );
  const cc = encodeURIComponent('chris@openoaisis.com');
  const mailto = `mailto:agent@openoaisis.com?cc=${cc}&subject=${subject}&body=${body}`;

  window.location.href = mailto;

  // Show success
  document.getElementById('contactForm').classList.add('hidden');
  document.getElementById('contactSuccess').classList.remove('hidden');

  // Reset form fields for next open
  name.value = ''; biz.value = ''; email.value = ''; msg.value = ''; demo.checked = false;
}
