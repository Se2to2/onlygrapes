// Contact form
function handleSubmit() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
        alert('Fill in at least your name, email, and a message.');
        return;
    }

    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('successMsg').style.display = 'block';
}

let isScrolling = false;
const sections = Array.from(document.querySelectorAll('.section'));
const dots = Array.from(document.querySelectorAll('.dot'));

function updateFades() {
  sections.forEach(function (section, i) {
    const rect = section.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    const inView = middle > 0 && middle < window.innerHeight;
    const content = section.querySelector('.section-content');
    const dot = dots[i];

    if (content) content.style.opacity = inView ? 1 : 0;
    if (dot) dot.classList.toggle('active', inView);
  });
}

function scrollToSection(target) {
  if (isScrolling) return;
  isScrolling = true;

  const navHeight = 60;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });

  setTimeout(() => { isScrolling = false; }, 1200);
}

// Anchor links
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) scrollToSection(target);
  });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const item = this.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
    }
  });
});

// Dropdown — only one open at a time
document.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    const parent = this.closest('.dropdown');
    const isOpen = parent.classList.contains('open');

    // Close all dropdowns
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));

    // Open this one if it wasn't already open
    if (!isOpen) parent.classList.add('open');
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', function (e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  }
});

// Index-only scroll logic
if (sections.length > 0) {
  window.addEventListener('scroll', updateFades);

  window.addEventListener('wheel', function (e) {
    e.preventDefault();

    if (isScrolling) return;
    isScrolling = true;

    const direction = e.deltaY > 0 ? 1 : -1;
    const current = sections.findIndex(s => {
      const middle = s.getBoundingClientRect().top + s.getBoundingClientRect().height / 2;
      return middle > 0 && middle < window.innerHeight;
    });
    const target = sections[Math.min(Math.max(current + direction, 0), sections.length - 1)];

    const navHeight = 60;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    setTimeout(() => { isScrolling = false; }, 1200);

  }, { passive: false });

  updateFades();
}

// Fade-in for non-index pages (pages without .section)
if (sections.length === 0) {
  const fadeEls = document.querySelectorAll(
    '.page-wrapper > *, .contact-wrapper > *, .ct-form, .ct-field, ' +
    '.dl-post, .dl-filters, .pk-about, .pk-facts, .pk-fact, ' +
    '.pk-team-table, .pk-boilerplate, .pk-assets, .pk-contact-strip, ' +
    '.page-title, .page-label, .page-subtitle, .sub-label, .section-rule'
  );

  fadeEls.forEach(function (el, i) {
    el.classList.add('fade-in');
    el.style.transitionDelay = (i * 0.07) + 's';
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(function (el) { observer.observe(el); });
}