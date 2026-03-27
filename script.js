// ── PAGE BACKGROUND COLORS ──
const pageBg = {
  'index.html':    '#F7F0E2',
  'index':         '#F7F0E2',
  '':              '#F7F0E2',
  'devlog.html':   '#F7F0E2',
  'presskit.html': '#F7F0E2',
  'contact.html':  '#F7F0E2',
  'portfolio.html': '#F7F0E2',
};

function getCurrentPage() {
  const path = window.location.pathname.toLowerCase();
  const file = path.split('/').pop() || '';
  return file;
}

function getBgForPage(href) {
  const file = href.toLowerCase().split('/').pop().split('#')[0] || '';
  return pageBg[file] || '#F7F0E2';
}

// ── TRANSITION OVERLAY ──
function createOverlay() {
  if (document.getElementById('page-transition')) return;
  const el = document.createElement('div');
  el.id = 'page-transition';
  document.body.appendChild(el);
}

function navigateTo(href) {
  const overlay = document.getElementById('page-transition');
  const targetBg = getBgForPage(href);

  // Set overlay color to the destination page's bg
  overlay.style.background = targetBg;

  // Exit: slide page content out
  const exitEls = document.querySelectorAll(
    '.section-content, .page-wrapper, .contact-wrapper'
  );
  exitEls.forEach(el => el.classList.add('page-exit'));

  // After brief exit, wipe overlay in then navigate
  setTimeout(() => {
    overlay.classList.remove('wipe-out');
    overlay.classList.add('wipe-in');
    setTimeout(() => {
      window.location.href = href;
    }, 460);
  }, 220);
}

// ── PAGE ENTER ANIMATION ──
function runPageEnter() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  const currentBg = getBgForPage(getCurrentPage());
  overlay.style.background = currentBg;

  // Pin overlay over the page before browser paints
  overlay.style.transform = 'translateX(0%)';

  // rAF x2: first frame registers the transform, second starts the wipe
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      overlay.style.transform = '';        // let CSS animation take over
      overlay.classList.add('wipe-out');

      // Hard fallback in case animation event never fires
      setTimeout(function() {
        overlay.style.transform = 'translateX(110%)';
        overlay.classList.remove('wipe-out');
        overlay.style.pointerEvents = 'none';
      }, 800);
    });
  });
}

// ── INTERCEPT INTERNAL LINKS ──
function attachTransitionLinks() {
  document.querySelectorAll('a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;

    // Skip anchors, external links, mailto, downloads
    if (href.startsWith('#') || href.startsWith('mailto') ||
        href.startsWith('http') || link.hasAttribute('download')) return;

    // Skip if already has listener
    if (link.dataset.transitionBound) return;
    link.dataset.transitionBound = 'true';

    link.addEventListener('click', function (e) {
      // If it's a cross-page link (not just an anchor on same page)
      const target = href.split('#')[0];
      const current = getCurrentPage();
      const targetClean = target.toLowerCase();

      if (target === '' || targetClean === current) {
        // Same page — just scroll, don't transition
        return;
      }

      e.preventDefault();
      navigateTo(href);
    });
  });
}

// ── CONTACT FORM ──
function handleSubmit() {
  const name    = document.getElementById('name')?.value.trim();
  const email   = document.getElementById('email')?.value.trim();
  const message = document.getElementById('message')?.value.trim();

  if (!name || !email || !message) {
    showAlert('Missing Fields', 'Please fill in your name, email, and message before sending.');
    return;
  }

  const form    = document.getElementById('contactForm');
  const success = document.getElementById('successMsg');
  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'block';
}

function showAlert(title, msg) {
  const existing = document.getElementById('og-alert');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'og-alert';
  overlay.style.cssText = [
    'position:fixed','inset:0','z-index:9999',
    'background:rgba(42,20,64,0.45)',
    'display:flex','align-items:center','justify-content:center',
    'padding:20px'
  ].join(';');

  overlay.innerhtml = `
    <style>
      @keyframes og-pop { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }
    </style>
    <div style="background:#F7F0E2;border:1px solid rgba(42,20,64,0.15);border-radius:12px;
                padding:32px 28px 24px;max-width:360px;width:100%;
                box-shadow:0 20px 60px rgba(42,20,64,0.2);
                animation:og-pop 0.25s cubic-bezier(0.34,1.56,0.64,1);text-align:center;">
      <div style="font-size:2rem;margin-bottom:12px;">🍇</div>
      <div style="font-size:1.1rem;font-weight:900;color:#2A1440;margin-bottom:8px;letter-spacing:-0.02em;">${title}</div>
      <p style="font-size:0.88rem;color:#5a4f45;line-height:1.7;margin-bottom:24px;">${msg}</p>
      <button id="og-alert-btn" style="background:#2A1440;color:#F7F0E2;border:none;border-radius:6px;
              padding:10px 28px;font-size:0.82rem;font-weight:700;letter-spacing:0.08em;
              text-transform:uppercase;cursor:pointer;font-family:Georgia,serif;">Got it</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('#og-alert-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ── MAIN INIT ──
document.addEventListener('DOMContentLoaded', function () {
  // Hide company name until custom font is ready — prevents FOUT
  const companyName = document.querySelector('.company-name');
  if (companyName) {
    companyName.style.opacity = '0';
    document.fonts.ready.then(function() {
      companyName.style.transition = 'opacity 0.3s ease';
      companyName.style.opacity = '1';
    });
  }

  createOverlay();
  runPageEnter();
  attachTransitionLinks();

  // ── CHROME (header + footer) entrance — once per session ──
  // Header/footer are visible by default in CSS.
  // Only on the very first ever load do we animate them in.
  if (!sessionStorage.getItem('chrome-entered')) {
    const header = document.querySelector('header.top-bar');
    const footer = document.querySelector('footer.site-footer');

    // Hide immediately (sync) so the browser never paints them visible first
    if (header) { header.style.opacity = '0'; header.style.transform = 'translateY(-10px)'; }
    if (footer) { footer.style.opacity = '0'; footer.style.transform = 'translateY(10px)'; }

    // Animate in after a beat
    setTimeout(function() {
      if (header) {
        header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        header.style.opacity = '1';
        header.style.transform = 'none';
      }
      if (footer) {
        footer.style.transition = 'opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s';
        footer.style.opacity = '1';
        footer.style.transform = 'none';
      }
      // After animation settles, clear inline styles so CSS takes over cleanly
      setTimeout(function() {
        if (header) { header.style.transition = ''; header.style.opacity = ''; header.style.transform = ''; }
        if (footer) { footer.style.transition = ''; footer.style.opacity = ''; footer.style.transform = ''; }
      }, 700);
      sessionStorage.setItem('chrome-entered', '1');
    }, 250);
  }

  const sections = Array.from(document.querySelectorAll('.section'));
  const dots = Array.from(document.querySelectorAll('.dot'));

  // ── INDEX: scroll snap + fade ──
  if (sections.length > 0) {
    let isScrolling = false;

    // Hide all section content initially so updateFades controls visibility
    sections.forEach(function(s) {
      const c = s.querySelector('.section-content');
      if (c) c.style.opacity = '0';
    });

    function updateFades() {
      const screenMid = window.innerHeight / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      sections.forEach(function (section, i) {
        const rect = section.getBoundingClientRect();
        const mid  = rect.top + rect.height / 2;
        const dist = Math.abs(mid - screenMid);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      });

      sections.forEach(function (section, i) {
        const inView = i === closestIdx;
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
      setTimeout(() => { isScrolling = false; updateFades(); }, 1200);
    }

    // Anchor links (index internal)
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) scrollToSection(target);
      });
    });

    window.addEventListener('scrollend', updateFades);

    // Only hijack wheel on non-touch devices — mobile uses native touch scroll
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!isTouch) {
      window.addEventListener('wheel', function (e) {
        e.preventDefault();
        if (isScrolling) return;
        isScrolling = true;

        const direction = e.deltaY > 0 ? 1 : -1;
        const screenMid = window.innerHeight / 2;
        let current = 0, closestDist = Infinity;
        sections.forEach(function (s, i) {
          const rect = s.getBoundingClientRect();
          const dist = Math.abs(rect.top + rect.height / 2 - screenMid);
          if (dist < closestDist) { closestDist = dist; current = i; }
        });
        const target = sections[Math.min(Math.max(current + direction, 0), sections.length - 1)];
        const navHeight = 60;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; updateFades(); }, 1200);
      }, { passive: false });
    }

    updateFades();
  }

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
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

  // ── Dropdowns ──
  document.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const parent = this.closest('.dropdown');
      const isOpen = parent.classList.contains('open');
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
      if (!isOpen) parent.classList.add('open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // ── SUB-PAGE fade-in (Netlify-safe) ──
  if (sections.length === 0) {
    const targets = document.querySelectorAll(
      '.page-wrapper > *, .contact-wrapper > *, .ct-form, .ct-field, ' +
      '.dl-post, .dl-filters, .pk-about, .pk-facts, .pk-fact, ' +
      '.pk-team-table, .pk-boilerplate, .pk-assets, .pk-contact-strip, ' +
      '.page-title, .page-label, .page-subtitle, .sub-label, .section-rule'
    );

    targets.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s ease ' + (0.15 + i * 0.06) + 's';
    });

    // Delay until after the overlay wipe-out finishes (~450ms)
    // Start invisible immediately so there's no flash
    requestAnimationFrame(function() {
      setTimeout(function () {
        targets.forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0px)';
        });
      }, 500);
    });
  }

  // ── Devlog inline functions ──
  window.filterPosts = function (tag, btn) {
    document.querySelectorAll('.dl-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.dl-post').forEach(post => {
      post.style.display = (tag === 'all' || post.dataset.tag === tag) ? 'block' : 'none';
    });
  };

  window.togglePost = function (post) {
    const isExpanded = post.classList.contains('expanded');
    document.querySelectorAll('.dl-post.expanded').forEach(p => {
      p.classList.remove('expanded');
      p.querySelector('.dl-read-more').textContent = 'Read more →';
    });
    if (!isExpanded) {
      post.classList.add('expanded');
      post.querySelector('.dl-read-more').textContent = 'Collapse ↑';
    }
  };
});

//  MOBILE NAV — append this to the bottom of script.js

function initMobileNav() {
  const topBar = document.querySelector('header.top-bar');
  if (!topBar) return;

  // ── HAMBURGER BUTTON ──
  const btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', 'Toggle navigation');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerhtml = '<span></span><span></span><span></span>';
  topBar.appendChild(btn);

  // ── MOBILE DRAWER ──
  // Build links from the existing desktop nav so we don't duplicate markup
  const isPortfolio = !!document.querySelector('.section-hero');
  const isSubPage   = !document.querySelectorAll('.section').length ||
                      (!document.querySelector('#landing') && !isPortfolio);

  // Detect path depth for relative links
  const depth = (window.location.pathname.match(/\//g) || []).length - 1;
  const root  = depth >= 2 ? '../../' : depth >= 1 ? '../' : '';

  const drawer = document.createElement('nav');
  drawer.className = 'mobile-menu';
  drawer.setAttribute('aria-label', 'Mobile navigation');

  if (isPortfolio) {
    // Portfolio pages: simple local + back-to-site links
    drawer.innerhtml = `
      <span class="mobile-menu-section">This Page</span>
      <a href="#hero">Hero</a>
      <a href="#about">About</a>
      <a href="#work">Skills</a>
      <a href="#contact">Contact</a>
      <span class="mobile-menu-section">Site</span>
      <a href="${root}index.html">Home</a>
      <a href="${root}index.html#about">About Us</a>
      <a href="${root}index.html#team">Meet the Team</a>
      <a href="${root}devlog.html">Devlog</a>
      <a href="${root}presskit.html">Press Kit</a>
      <a href="${root}contact.html">Contact</a>
    `;
  } else if (document.querySelector('#landing')) {
    // Main index: anchor links only
    drawer.innerhtml = `
      <span class="mobile-menu-section">Navigate</span>
      <a href="#landing">Home</a>
      <a href="#about">About Us</a>
      <a href="#team">Meet the Team</a>
      <a href="#faq">FAQ</a>
      <span class="mobile-menu-section">More</span>
      <a href="${root}devlog.html">Devlog</a>
      <a href="${root}presskit.html">Press Kit</a>
      <a href="${root}contact.html">Contact</a>
    `;
  } else {
    // Sub-pages: devlog / presskit / contact
    drawer.innerhtml = `
      <span class="mobile-menu-section">Navigate</span>
      <a href="${root}index.html">Home</a>
      <a href="${root}index.html#about">About Us</a>
      <a href="${root}index.html#team">Meet the Team</a>
      <a href="${root}index.html#faq">FAQ</a>
      <span class="mobile-menu-section">More</span>
      <a href="${root}devlog.html">Devlog</a>
      <a href="${root}presskit.html">Press Kit</a>
      <a href="${root}contact.html">Contact</a>
    `;
  }

  document.body.appendChild(drawer);

  // ── TOGGLE ──
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = drawer.classList.contains('open');
    drawer.classList.toggle('open');
    btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('header.top-bar') && !e.target.closest('.mobile-menu')) {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on any drawer link click
  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Adjust drawer top if header height changes (e.g. on resize)
  function syncDrawerTop() {
    drawer.style.top = topBar.offsetHeight + 'px';
  }
  syncDrawerTop();
  window.addEventListener('resize', syncDrawerTop);
}

document.addEventListener('DOMContentLoaded', initMobileNav);

window.addEventListener('pageshow', function(e) {
  if (e.persisted) {
    window.location.reload();
  }
});