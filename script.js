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

  function validateEmail(value) {
    return /.+@.+\..+/.test(String(value).toLowerCase());
  }
  function clearErrors() {
    [errName, errEmail, errMessage].forEach(el => el && (el.textContent = ''));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    let valid = true;

    if (!nameEl.value.trim()) {
      errName.textContent = 'Please enter your name.';
      nameEl.focus();
      valid = false;
    } else if (!emailEl.value.trim() || !validateEmail(emailEl.value)) {
      errEmail.textContent = 'Please enter a valid email address.';
      emailEl.focus();
      valid = false;
    } else if (!messageEl.value.trim()) {
      errMessage.textContent = 'Please add a short message.';
      messageEl.focus();
      valid = false;
    }

    if (!valid) return;
    successEl.hidden = false;
    form.reset();
  });
}

// Reveal on scroll animations
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

  // ✅ Initialize Swiper (Team Slider) with resilience & a11y
  const teamContainer = document.querySelector('.team-swiper');
  if (teamContainer) {
    if (window.Swiper) {
      const delay = Number(teamContainer.dataset.autoplayDelay) || 4000;
      const progressWrap = teamContainer.querySelector('.team-progress');
      const progressBar = progressWrap ? progressWrap.querySelector('.bar') : null;

      const teamSwiper = new Swiper('.team-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        watchOverflow: true,
        a11y: { enabled: true },
        keyboard: { enabled: true, onlyInViewport: true },
        autoplay: {
          delay,
          disableOnInteraction: false,
          pauseOnMouseEnter: false, // we'll manually control for focus/hover
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
        on: {
          autoplayTimeLeft(swiper, time, progress) {
            if (!progressBar) return;
            // progress is 0..1, where 1 means autoplay is almost finished
            const pct = Math.max(0, Math.min(100, (1 - progress) * 100));
            progressBar.style.width = pct + '%';
            if (progressWrap) progressWrap.setAttribute('aria-valuenow', String(Math.round(pct)));
          },
          autoplayStart() {
            if (progressBar) progressBar.style.width = '0%';
            if (progressWrap) progressWrap.setAttribute('aria-valuenow', '0');
          },
          slideChangeTransitionStart() {
            if (progressBar) progressBar.style.width = '0%';
            if (progressWrap) progressWrap.setAttribute('aria-valuenow', '0');
          }
        }
      });

      // Pause autoplay on hover/focus, resume on leave/blur for better UX
      const pause = () => teamSwiper.autoplay && teamSwiper.autoplay.stop();
      const resume = () => teamSwiper.autoplay && teamSwiper.autoplay.start();
      teamContainer.addEventListener('mouseenter', pause);
      teamContainer.addEventListener('mouseleave', resume);
      teamContainer.addEventListener('focusin', pause);
      teamContainer.addEventListener('focusout', resume);

      // External controls
      const btnPrev = document.getElementById('team-prev');
      const btnNext = document.getElementById('team-next');
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          teamSwiper.slidePrev();
          // Nudge autoplay to continue after manual click
          resume();
          if (progressBar) progressBar.style.width = '0%';
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          teamSwiper.slideNext();
          resume();
          if (progressBar) progressBar.style.width = '0%';
        });
      }
    } else {
      console.warn('[Delta Medical] Swiper library not found. Team slider will be static.');
    }
  }
  
  // Insurance modal open/close
  const openBtn = document.getElementById('open-insurance-list');
  const modal = document.getElementById('insurance-modal');
  const closeBtn = document.getElementById('close-insurance-modal');
  let lastFocusedEl = null;

  function openModal() {
    if (!modal) return;
    lastFocusedEl = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    // focus close for accessibility
    closeBtn && closeBtn.focus();
    document.addEventListener('keydown', onKeyDown);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  if (openBtn && modal) {
    openBtn.addEventListener('click', openModal);
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
});
