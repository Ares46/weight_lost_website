// Reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navToggle.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    nav.classList.toggle('open');
  });

  // Close menu on link click (mobile)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (getComputedStyle(navToggle).display !== 'none') {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      }
    });
  });
}

// Smooth scroll enhancement
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#' || targetId.length === 1) return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    if (prefersReducedMotion) {
      target.scrollIntoView();
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Shift focus for a11y
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});


// Simple contact form validation
const form = document.getElementById('contact-form');
if (form) {
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const messageEl = document.getElementById('message');
  const successEl = document.getElementById('form-success');
  const errName = document.getElementById('error-name');
  const errEmail = document.getElementById('error-email');
  const errMessage = document.getElementById('error-message');

  function validateEmail(value) { return /.+@.+\..+/.test(String(value).toLowerCase()); }
  function clearErrors() { [errName, errEmail, errMessage].forEach(el => el && (el.textContent = '')); }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    let valid = true;

    if (!nameEl.value.trim()) { errName.textContent = 'Please enter your name.'; nameEl.focus(); valid = false; }
    else if (!emailEl.value.trim() || !validateEmail(emailEl.value)) { errEmail.textContent = 'Please enter a valid email address.'; emailEl.focus(); valid = false; }
    else if (!messageEl.value.trim()) { errMessage.textContent = 'Please add a short message.'; messageEl.focus(); valid = false; }

    if (!valid) return;
    successEl.hidden = false;
    form.reset();
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.2 }); // trigger when 20% is visible

  reveals.forEach(el => observer.observe(el));
});



