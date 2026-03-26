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

document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) scrollToSection(target);
  });
});

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

const contactImage = document.querySelector('.contact-bg-image');

if (contactImage) {
  contactImage.style.animation = 'none';
  contactImage.style.opacity = '0';
  contactImage.style.transform = 'translateX(300px)';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        contactImage.style.transition = 'none';
        contactImage.style.animation = 'slide-in-left 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  observer.observe(document.querySelector('#contact'));
}