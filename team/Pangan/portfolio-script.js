document.addEventListener('DOMContentLoaded', function () {

  let isScrolling = false;
  const sections = Array.from(document.querySelectorAll('.section'));
  const dots = Array.from(document.querySelectorAll('.dot'));

  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (isTouch) {
    // Mobile: keep everything visible, native scroll handles it
    sections.forEach(function (s) {
      const c = s.querySelector('.section-content');
      if (c) c.style.opacity = '1';
    });
  } else {
    // Desktop: hide all content initially, fade in on scroll
    sections.forEach(function (s) {
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

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) scrollToSection(target);
      });
    });

    window.addEventListener('scrollend', updateFades);

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

    updateFades();
  }

  // ── CAT ANIMATION ──
  // Start offscreen. IntersectionObserver on #contact triggers the keyframe
  // once in view. requestAnimationFrame ensures the browser registers the
  // initial state before we swap to the animation — fixes the broken flash.
  const contactImage = document.querySelector('.contact-bg-image');
  const contactSection = document.querySelector('#contact');

  if (contactImage && contactSection) {
    contactImage.style.opacity = '0';
    contactImage.style.transform = 'translateX(300px)';
    contactImage.style.transition = 'none';
    contactImage.style.animation = 'none';

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          requestAnimationFrame(function () {
            contactImage.style.opacity = '';
            contactImage.style.transform = '';
            contactImage.style.transition = 'none';
            contactImage.style.animation = 'slide-in-left 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(contactSection);
  }

});