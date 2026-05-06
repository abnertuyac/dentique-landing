// ===== SCROLL PROGRESS BAR =====
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrollTop / docHeight * 100) + '%';
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 50;
  navbar.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('visible', window.scrollY > 400);
});

// ===== BACK TO TOP =====
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== MOBILE MENU =====
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

navToggle.addEventListener('click', () => mobileMenu.classList.add('open'));
mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
function closeMobile() { mobileMenu.classList.remove('open'); }

// ===== FADE-UP ANIMATION =====
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => observer.observe(el));

// ===== STAT NUMBER ANIMATION =====
const statNums = document.querySelectorAll('.stat__num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const duration = 1800;
      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statObserver.observe(el));


// ===== SHOWCASE GALLERY SLIDER =====
const slides = document.querySelectorAll('.showcase__slide');
const dotsContainer = document.getElementById('showcaseDots');
const prevBtn = document.getElementById('showcasePrev');
const nextBtn = document.getElementById('showcaseNext');
let currentSlide = 0;
let sliderTimer;

// Build dots
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('showcase__dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dotsContainer.children[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dotsContainer.children[currentSlide].classList.add('active');
  resetTimer();
}

function resetTimer() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 4500);
}

// Show first slide
slides[0].classList.add('active');
prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
resetTimer();

// ===== TESTIMONIAL INFINITE SLIDER =====
const testiTrack   = document.getElementById('testiTrack');
const testiPrevBtn = document.getElementById('testiPrev');
const testiNextBtn = document.getElementById('testiNext');
const CARD_W       = 280 + 24; // card width + gap
const origCards    = Array.from(testiTrack.querySelectorAll('.testimonial-card'));
const ORIG_COUNT   = origCards.length;

// Clone all cards and append — enables seamless forward loop
origCards.forEach(c => testiTrack.appendChild(c.cloneNode(true)));

let tIdx = 0;
let tBusy = false;

const setPos = (idx, animate) => {
  testiTrack.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none';
  testiTrack.style.transform  = `translateX(-${idx * CARD_W}px)`;
};

const goNext = () => {
  if (tBusy) return;
  tBusy = true;
  tIdx++;
  setPos(tIdx, true);
};

const goPrev = () => {
  if (tBusy) return;
  tBusy = true;
  if (tIdx === 0) {
    // Jump silently to clone position then slide back
    setPos(ORIG_COUNT, false);
    testiTrack.offsetHeight; // force reflow
    tIdx = ORIG_COUNT - 1;
    setTimeout(() => { setPos(tIdx, true); }, 20);
  } else {
    tIdx--;
    setPos(tIdx, true);
  }
};

// After animation: if we've slid into clones, silently reset to originals
testiTrack.addEventListener('transitionend', () => {
  if (tIdx >= ORIG_COUNT) {
    tIdx -= ORIG_COUNT;
    setPos(tIdx, false);
    testiTrack.offsetHeight;
  }
  tBusy = false;
});

testiNextBtn.addEventListener('click', goNext);
testiPrevBtn.addEventListener('click', goPrev);

let testiTimer = setInterval(goNext, 4000);
const resetTimer = () => { clearInterval(testiTimer); testiTimer = setInterval(goNext, 4000); };
testiNextBtn.addEventListener('click', resetTimer);
testiPrevBtn.addEventListener('click', resetTimer);

// ===== BEFORE & AFTER DRAG COMPARE =====
function initBA(wrapperId, beforeId, handleId) {
  const wrapper = document.getElementById(wrapperId);
  const before  = document.getElementById(beforeId);
  const handle  = document.getElementById(handleId);
  if (!wrapper || !before || !handle) return;

  const img = before.querySelector('.ba__before-img');
  let dragging = false;

  // Always keep before-image pixel width = wrapper width so it never squishes
  const syncImgWidth = () => {
    if (img) img.style.width = wrapper.offsetWidth + 'px';
  };
  syncImgWidth();
  window.addEventListener('resize', syncImgWidth);

  const move = (clientX) => {
    const rect = wrapper.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0.04, Math.min(0.96, pct));
    before.style.width = (pct * 100) + '%';
    handle.style.left  = (pct * 100) + '%';
    syncImgWidth();
  };

  // Only the handle starts the drag (not the whole image)
  handle.addEventListener('mousedown',  (e) => { e.preventDefault(); dragging = true; });
  window.addEventListener('mousemove',  (e) => { if (dragging) move(e.clientX); });
  window.addEventListener('mouseup',    ()  => { dragging = false; });

  handle.addEventListener('touchstart', (e) => { dragging = true; }, { passive: true });
  window.addEventListener('touchmove',  (e) => { if (dragging) { e.preventDefault(); move(e.touches[0].clientX); } }, { passive: false });
  window.addEventListener('touchend',   ()  => { dragging = false; });
}

initBA('ba1', 'ba1Before', 'ba1Handle');
initBA('ba2', 'ba2Before', 'ba2Handle');
initBA('ba3', 'ba3Before', 'ba3Handle');

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-item__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== CONTACT FORM =====
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

// ===== GOLD PARTICLES =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.life > this.maxLife) this.reset();
  }
  draw() {
    const fade = this.life < 20 ? this.life / 20 : this.life > this.maxLife - 20 ? (this.maxLife - this.life) / 20 : 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201, 168, 76, ${this.opacity * fade})`;
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

const animateParticles = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
};
animateParticles();

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
