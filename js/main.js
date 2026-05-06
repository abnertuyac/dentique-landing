// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  navToggle.innerHTML = mobileMenu.classList.contains('open')
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

function closeMobile() {
  mobileMenu.classList.remove('open');
  navToggle.innerHTML = '<i class="fas fa-bars"></i>';
}

// Scroll fade-in animation
const fadeEls = document.querySelectorAll(
  '.service-card, .why-card, .testimonial-card, .stat, .about__content, .about__image, .section__header, .contact__info, .contact__form'
);

fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

// Contact form submission
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    formSuccess.classList.add('show');
    form.reset();
    setTimeout(() => formSuccess.classList.remove('show'), 4000);
  }, 1200);
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Animate stat numbers on scroll
const statNums = document.querySelectorAll('.stat__num');

const animateStat = (el) => {
  const text = el.textContent;
  const num = parseFloat(text.replace(/[^0-9.]/g, ''));
  const suffix = text.replace(/[0-9.]/g, '');
  let start = 0;
  const duration = 1500;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (num < 100 ? Math.floor(eased * num) : Math.round(eased * num)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateStat(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statObserver.observe(el));
