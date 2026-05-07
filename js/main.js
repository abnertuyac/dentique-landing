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
let showcaseTimer;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dotsContainer.children[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dotsContainer.children[currentSlide].classList.add('active');
  resetShowcaseTimer();
}

function resetShowcaseTimer() {
  clearInterval(showcaseTimer);
  showcaseTimer = setInterval(() => goToSlide(currentSlide + 1), 4500);
}

if (slides.length > 0 && dotsContainer) {
  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('showcase__dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  slides[0].classList.add('active');
  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  resetShowcaseTimer();
}


// ===== TESTIMONIAL INFINITE SLIDER =====
const testiTrack   = document.getElementById('testiTrack');
const testiPrevBtn = document.getElementById('testiPrev');
const testiNextBtn = document.getElementById('testiNext');

if (testiTrack && testiPrevBtn && testiNextBtn) {
  const origCards  = Array.from(testiTrack.querySelectorAll('.testimonial-card'));
  const ORIG_COUNT = origCards.length;
  // Read actual rendered card width so it adapts to responsive CSS
  const gap = parseInt(getComputedStyle(testiTrack).gap) || 24;
  let CARD_W = (origCards[0]?.offsetWidth || 260) + gap;
  // Recompute on resize so slider stays aligned
  window.addEventListener('resize', () => {
    CARD_W = (origCards[0]?.offsetWidth || 260) + (parseInt(getComputedStyle(testiTrack).gap) || 24);
    setPos(tIdx, false);
  });

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
  const resetTestiTimer = () => { clearInterval(testiTimer); testiTimer = setInterval(goNext, 4000); };
  testiNextBtn.addEventListener('click', resetTestiTimer);
  testiPrevBtn.addEventListener('click', resetTestiTimer);
}


// ===== BEFORE & AFTER DRAG COMPARE =====
function initBA(compareId, beforeImgId, handleId) {
  const wrapper   = document.getElementById(compareId);
  const beforeImg = document.getElementById(beforeImgId);
  const handle    = document.getElementById(handleId);
  if (!wrapper || !beforeImg || !handle) return;

  let dragging = false;

  const move = (clientX) => {
    const rect = wrapper.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0.02, Math.min(0.98, pct));
    // clip-path trims the right side — image stays 100% wide, never moves
    beforeImg.style.clipPath = `inset(0 ${((1 - pct) * 100).toFixed(2)}% 0 0)`;
    handle.style.left = (pct * 100).toFixed(2) + '%';
  };

  handle.addEventListener('mousedown',  (e) => { e.preventDefault(); dragging = true; });
  window.addEventListener('mousemove',  (e) => { if (dragging) move(e.clientX); });
  window.addEventListener('mouseup',    ()  => { dragging = false; });
  handle.addEventListener('touchstart', ()  => { dragging = true; }, { passive: true });
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
if (form && formSuccess) {
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
}

// ===== GOLD PARTICLES =====
const canvas = document.getElementById('particles');
if (canvas) {
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
}

// ===== OFFERS COUNTDOWN TIMER =====
(function () {
  const pad = n => String(n).padStart(2, '0');
  // Count down to end of current month
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);

  const els = {
    d: document.getElementById('cdDays'),
    h: document.getElementById('cdHours'),
    m: document.getElementById('cdMins'),
    s: document.getElementById('cdSecs'),
  };
  if (!els.d) return;

  function tick() {
    const diff = Math.max(0, target - Date.now());
    els.d.textContent = pad(Math.floor(diff / 86400000));
    els.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    els.m.textContent = pad(Math.floor((diff % 3600000) / 60000));
    els.s.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
})();

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== THEME SWITCHER =====
const themes = {
  gold:     { '--gold': '#c9a84c', '--gold-light': '#e4c97e', '--gold-glow': 'rgba(201,168,76,0.4)', '--gold-dim': 'rgba(201,168,76,0.15)' },
  sapphire: { '--gold': '#4a9eff', '--gold-light': '#7ab8ff', '--gold-glow': 'rgba(74,158,255,0.4)', '--gold-dim': 'rgba(74,158,255,0.15)' },
  emerald:  { '--gold': '#27ae78', '--gold-light': '#4ecf9a', '--gold-glow': 'rgba(39,174,120,0.4)', '--gold-dim': 'rgba(39,174,120,0.15)' },
};

function applyTheme(name) {
  const vars = themes[name];
  if (!vars) return;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('dentiqueTheme', name);

  document.querySelectorAll('.theme-option').forEach(opt => {
    const isActive = opt.dataset.theme === name;
    opt.classList.toggle('active', isActive);
    const check = opt.querySelector('.fa-check');
    if (check) check.style.display = isActive ? 'block' : 'none';
  });
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themePanel     = document.getElementById('themePanel');

if (themeToggleBtn && themePanel) {
  themeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themePanel.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#themeSwitcher')) themePanel.classList.remove('open');
  });
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      applyTheme(opt.dataset.theme);
      themePanel.classList.remove('open');
    });
  });
  // Restore saved theme
  applyTheme(localStorage.getItem('dentiqueTheme') || 'gold');
}


// ===== CHATBOT =====
const chatBubble  = document.getElementById('chatBubble');
const chatWindow  = document.getElementById('chatWindow');
const chatClose   = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput   = document.getElementById('chatInput');
const chatSend    = document.getElementById('chatSend');
const quickReplies = document.getElementById('quickReplies');

const botReplies = {
  'Book appointment':    'Great! You can book an appointment by filling out our <a href="#contact" style="color:var(--gold)">contact form</a> or calling us. We\'ll get back to you within 24 hours.',
  'Our services':        'We offer Teeth Whitening, Porcelain Veneers, Dental Implants, Orthodontics, Root Canal, Cosmetic Dentistry, and Emergency Care. Which service are you interested in?',
  'Pricing & plans':     'We offer flexible pricing plans — from a basic plan at $49/mo to our full Premium plan at $149/mo. Check our <a href="#pricing" style="color:var(--gold)">Pricing section</a> for full details.',
  'Before & after':      'Our gallery shows real smile transformations! Check the <a href="#beforeafter" style="color:var(--gold)">Before & After section</a> to see whitening, veneers, and orthodontic results.',
  'Emergency dental':    'We handle dental emergencies same-day. Call us immediately and we\'ll fit you in. Knocked-out tooth? Keep it moist and come in within the hour!',
  'Insurance accepted':  'We accept most major insurance providers including Delta Dental, Cigna, Aetna, MetLife, BlueCross, and more. Bring your card and we\'ll verify coverage for free.',
};

const defaultReplies = [
  'Book appointment', 'Our services', 'Pricing & plans', 'Before & after',
];

function addMsg(text, who) {
  const msg = document.createElement('div');
  msg.className = `chat-msg chat-msg--${who}`;
  if (who === 'bot') {
    msg.innerHTML = `<div class="chat-msg__av"><i class="fas fa-tooth"></i></div><div class="chat-msg__bubble">${text}</div>`;
  } else {
    msg.innerHTML = `<div class="chat-msg__bubble">${text}</div>`;
  }
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const t = document.createElement('div');
  t.className = 'chat-msg chat-msg--bot';
  t.id = 'typingIndicator';
  t.innerHTML = `<div class="chat-msg__av"><i class="fas fa-tooth"></i></div><div class="typing-bubble"><span></span><span></span><span></span></div>`;
  chatMessages.appendChild(t);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function buildQuickReplies(list) {
  quickReplies.innerHTML = '';
  list.forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply';
    btn.textContent = label;
    btn.addEventListener('click', () => handleUserMsg(label));
    quickReplies.appendChild(btn);
  });
}

function handleUserMsg(text) {
  addMsg(text, 'user');
  quickReplies.innerHTML = '';
  showTyping();
  setTimeout(() => {
    removeTyping();
    const reply = botReplies[text] || 'Thanks for reaching out! Our team will get back to you shortly. You can also <a href="#contact" style="color:var(--gold)">send us a message</a> directly.';
    addMsg(reply, 'bot');
    buildQuickReplies(defaultReplies);
  }, 900);
}

if (chatBubble && chatWindow && chatClose && chatMessages) {
  chatBubble.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    const badge = chatBubble.querySelector('.chatbot__badge');
    if (badge) badge.style.display = 'none';
    // Show greeting on first open
    if (!chatMessages.dataset.greeted) {
      chatMessages.dataset.greeted = '1';
      setTimeout(() => addMsg('👋 Hello! Welcome to <strong>Dentique</strong>. How can we help your smile today?', 'bot'), 300);
      setTimeout(() => buildQuickReplies(defaultReplies), 700);
    }
  });

  chatClose.addEventListener('click', () => chatWindow.classList.remove('open'));

  function sendChatMsg() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    handleUserMsg(text);
  }

  chatSend.addEventListener('click', sendChatMsg);
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMsg(); });
}
