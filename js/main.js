/* =====================================================
   PRASANTA BADATYA — WORLD-CLASS PORTFOLIO
   JavaScript: 3D Animations · Particles · GSAP
   ===================================================== */

// ============ SCROLL RESTORE FIX ============
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ============ GSAP REGISTRATION ============
gsap.registerPlugin(ScrollTrigger);

// ============ SCROLL PROGRESS BAR ============
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) progressBar.style.width = ((window.scrollY / maxScroll) * 100) + '%';
}, { passive: true });

// ============ TEXT SCRAMBLE ENGINE ============
class TextScramble {
    constructor(el) {
        this.el    = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#01█▓▒░│┤╢╖╕╣║╗╝┐└┴┬├─┼';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const len  = newText.length;
        const promise = new Promise(resolve => { this.resolve = resolve; });
        this.queue = [];
        for (let i = 0; i < len; i++) {
            const start = Math.floor(Math.random() * 10);
            const end   = start + Math.floor(Math.random() * 18) + 5;
            this.queue.push({ to: newText[i], start, end, char: '' });
        }
        cancelAnimationFrame(this.frameReq);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '', complete = 0;
        for (let i = 0; i < this.queue.length; i++) {
            const { to, start, end } = this.queue[i];
            let   { char }           = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += '';
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameReq = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// ============ PRELOADER + SCROLLTRIGGER REFRESH ============
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 900);
    }, 1800);
    setTimeout(() => ScrollTrigger.refresh(), 200);
});

// ============ CUSTOM CURSOR ============
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
});

(function trackRing() {
    ringX += (mouseX - ringX) * 0.11;
    ringY += (mouseY - ringY) * 0.11;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(trackRing);
})();

document.querySelectorAll('a, button, .portfolio-item, .skill-item, .contact-item, .cta-button, .arsenal-cat, .footer-social a, .footer-resume').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity  = '0';
    cursorRing.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity  = '1';
    cursorRing.style.opacity = '1';
});

// ============ PARTICLE CONSTELLATION ============
const canvas = document.getElementById('heroCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let mouse     = { x: null, y: null };
let mouseDown = false;

const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
};
resize();
window.addEventListener('resize', () => { resize(); buildParticles(); });

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
document.addEventListener('mouseleave',  () => { mouse.x = null; mouse.y = null; });
document.addEventListener('mousedown',   () => { mouseDown = true;  });
document.addEventListener('mouseup',     () => { mouseDown = false; });

class Particle {
    constructor() { this.init(); }
    init() {
        this.x         = Math.random() * canvas.width;
        this.y         = Math.random() * canvas.height;
        this.size      = Math.random() * 1.8 + 0.4;
        this.vx        = (Math.random() - 0.5) * 0.45;
        this.vy        = (Math.random() - 0.5) * 0.45;
        this.baseAlpha = Math.random() * 0.55 + 0.1;
        this.alpha     = this.baseAlpha;
        this.hue       = Math.random() > 0.65 ? 270 : 200;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (mouse.x !== null) {
            const dx   = this.x - mouse.x;
            const dy   = this.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (mouseDown) {
                // Click: attract particles toward cursor
                const R = 220;
                if (dist < R && dist > 1) {
                    const force = (R - dist) / R;
                    this.x    -= (dx / dist) * force * 5.5;
                    this.y    -= (dy / dist) * force * 5.5;
                    this.alpha = Math.min(1, this.baseAlpha + force * 0.8);
                }
            } else {
                // Hover: repel particles from cursor
                const R = 130;
                if (dist < R) {
                    const force = (R - dist) / R;
                    this.x    += (dx / dist) * force * 3.5;
                    this.y    += (dy / dist) * force * 3.5;
                    this.alpha = Math.min(1, this.baseAlpha + force * 0.6);
                } else {
                    this.alpha = this.baseAlpha;
                }
            }
        } else {
            this.alpha = this.baseAlpha;
        }
        if (this.x < 0)             this.x = canvas.width;
        if (this.x > canvas.width)  this.x = 0;
        if (this.y < 0)             this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle   = `hsl(${this.hue}, 90%, 65%)`;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = `hsl(${this.hue}, 90%, 65%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function buildParticles() {
    const count = Math.min(130, Math.floor(canvas.width * canvas.height / 7500));
    particles = Array.from({ length: count }, () => new Particle());
}

function drawLinks() {
    const maxD = 140;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx   = particles[i].x - particles[j].x;
            const dy   = particles[i].y - particles[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < maxD) {
                const alpha = (1 - dist / maxD) * 0.14;
                ctx.save();
                ctx.globalAlpha = alpha;
                const grad = ctx.createLinearGradient(
                    particles[i].x, particles[i].y,
                    particles[j].x, particles[j].y
                );
                grad.addColorStop(0, `hsl(${particles[i].hue}, 90%, 65%)`);
                grad.addColorStop(1, `hsl(${particles[j].hue}, 90%, 65%)`);
                ctx.strokeStyle = grad;
                ctx.lineWidth   = 0.6;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLinks();
    requestAnimationFrame(loop);
}

buildParticles();
loop();

// ============ HEADER SCROLL ============
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ============ MOBILE MENU ============
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const navMenu      = document.querySelector('.nav-menu');

mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const open = navMenu.classList.contains('active');
    mobileToggle.setAttribute('aria-expanded', open);
    const lines = mobileToggle.querySelectorAll('.hamburger-line');
    if (open) {
        gsap.to(lines[0], { rotation: 45,  y: 7,  duration: .3 });
        gsap.to(lines[1], { opacity: 0,          duration: .3 });
        gsap.to(lines[2], { rotation: -45, y: -7, duration: .3 });
    } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: .3 });
        gsap.to(lines[1], { opacity: 1,         duration: .3 });
        gsap.to(lines[2], { rotation: 0, y: 0, duration: .3 });
    }
});

// ============ SMOOTH NAV CLICK ============
function closeMobileMenu() {
    navMenu.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    const lines = mobileToggle.querySelectorAll('.hamburger-line');
    gsap.to(lines[0], { rotation: 0, y: 0, duration: .3 });
    gsap.to(lines[1], { opacity: 1,         duration: .3 });
    gsap.to(lines[2], { rotation: 0, y: 0, duration: .3 });
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(item.getAttribute('href'));
        if (!target) return;
        closeMobileMenu();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
    });
});

// ============ GSAP SCROLL ANIMATIONS ============
// KEY RULE: scroll-triggered from() tweens must use immediateRender: false
// so elements stay visible on load if their trigger never fires.

// --- Section headers — clip-path wipe reveal (unique per header) ---
document.querySelectorAll('.section-header').forEach(hdr => {
    const label    = hdr.querySelector('.section-label');
    const title    = hdr.querySelector('.section-title');
    const subtitle = hdr.querySelector('.section-subtitle');
    const tl = gsap.timeline({
        scrollTrigger: { trigger: hdr, start: 'top 86%', once: true }
    });
    if (label)    tl.from(label,    { immediateRender: false, opacity: 0, y: 18, duration: 0.55, ease: 'power2.out' });
    if (title)    tl.from(title,    { immediateRender: false, clipPath: 'inset(0 0 100% 0)', y: 14, opacity: 0, duration: 0.85, ease: 'power3.out' }, '-=0.1');
    if (subtitle) tl.from(subtitle, { immediateRender: false, opacity: 0, y: 12, duration: 0.65, ease: 'power2.out' }, '-=0.35');
});

// --- About ---
gsap.from('.about-bio-text', {
    immediateRender: false,
    scrollTrigger: { trigger: '.about-section', start: 'top 72%', once: true },
    opacity: 0, x: -55, duration: 1, ease: 'power3.out'
});
gsap.from('.about-stats-panel', {
    immediateRender: false,
    scrollTrigger: { trigger: '.about-section', start: 'top 72%', once: true },
    opacity: 0, x: 55, duration: 1, delay: .15, ease: 'power3.out'
});
gsap.from('.about-stat-row', {
    immediateRender: false,
    scrollTrigger: { trigger: '.about-stats-panel', start: 'top 88%', once: true },
    opacity: 0, x: 28, duration: .55, stagger: .13, ease: 'power2.out'
});
// Arsenal — 3D tilt entrance (rotateX drop-in)
gsap.from('.arsenal-cat', {
    immediateRender: false,
    scrollTrigger: { trigger: '.tech-arsenal', start: 'top 88%', once: true },
    opacity: 0, y: 50, rotateX: 20,
    transformPerspective: 600,
    duration: .7, stagger: .1, ease: 'power3.out'
});
gsap.from('.a-tag', {
    immediateRender: false,
    scrollTrigger: { trigger: '.tech-arsenal', start: 'top 80%', once: true },
    opacity: 0, y: 10, duration: .35, stagger: .04, ease: 'power2.out'
});

// --- Portfolio — 3D rotateY card entrance ---
gsap.from('.portfolio-item', {
    immediateRender: false,
    scrollTrigger: { trigger: '.portfolio-grid', start: 'top 80%', once: true },
    opacity: 0, y: 60, rotateY: 10,
    transformPerspective: 800,
    duration: .85, stagger: .18, ease: 'power3.out'
});

// --- Experience ---
gsap.fromTo('.timeline-line',
    { clipPath: 'inset(0 0 100% 0)' },
    {
        scrollTrigger: {
            trigger: '.experience-section',
            start: 'top 55%',
            end:   'bottom 80%',
            scrub: 1.5
        },
        clipPath: 'inset(0 0 0% 0)',
        ease: 'none'
    }
);

gsap.timeline({
    scrollTrigger: { trigger: '.experience-section', start: 'top 60%', once: true }
})
.from('.timeline-dot',  { immediateRender: false, scale: 0, opacity: 0, duration: .45, ease: 'back.out(2.5)' })
.from('.timeline-date', { immediateRender: false, opacity: 0, y: 20, duration: .45, ease: 'power2.out' }, '-=0.1')
.from('.timeline-title', {
    immediateRender: false,
    clipPath: 'inset(0 100% 0 0)', opacity: 0,
    duration: .65, ease: 'power3.out'
}, '-=0.2')
.from('.timeline-company',     { immediateRender: false, opacity: 0, y: 20, duration: .45, ease: 'power2.out' }, '-=0.28')
.from('.timeline-description', { immediateRender: false, opacity: 0, y: 20, duration: .45, ease: 'power2.out' }, '-=0.22')
.from('.achievement-item', {
    immediateRender: false,
    opacity: 0, y: 26, scale: 0.94,
    duration: .5, stagger: .12, ease: 'power2.out'
}, '-=0.1')
.from('#experience .tech-tag', { immediateRender: false, opacity: 0, y: 10, duration: .32, stagger: .05, ease: 'power2.out' }, '-=0.1');

// --- Contact — hologram rings scale in, then buttons bounce ---
gsap.timeline({
    scrollTrigger: { trigger: '.contact-section', start: 'top 68%', once: true }
})
.from('.hologram-ring', {
    immediateRender: false,
    scale: 0, opacity: 0,
    duration: 1.0, stagger: 0.18, ease: 'power3.out'
})
.from('.contact-cta-row .cta-button', {
    immediateRender: false,
    opacity: 0, y: 32, scale: 0.88,
    duration: 0.65, stagger: .18, ease: 'back.out(1.8)'
}, '-=0.5');

// ============ COUNTER ANIMATION ============
function animateCount(el, end, suffix) {
    const duration = 1600;
    let start = null;
    const step = ts => {
        if (!start) start = ts;
        const p    = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * end) + suffix;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el  = entry.target;
            const end = parseInt(el.dataset.target);
            const sfx = el.dataset.suffix || '';
            animateCount(el, end, sfx);
            counterObs.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

// ============ 3D CARD TILT ============
document.querySelectorAll('.portfolio-item').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = e.clientX - r.left;
        const y  = e.clientY - r.top;
        const cx = r.width  / 2;
        const cy = r.height / 2;
        const rx = ((y - cy) / cy) * -12;
        const ry = ((x - cx) / cx) *  12;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.04,1.04,1.04)`;
        card.style.setProperty('--mx', ((x / r.width)  * 100) + '%');
        card.style.setProperty('--my', ((y / r.height) * 100) + '%');
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
});

// ============ MAGNETIC BUTTONS ============
document.querySelectorAll('.cta-button').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        gsap.to(btn, { x: x * 0.28, y: y * 0.28, duration: .45, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, 0.35)' });
    });
});

// ============ ACTIVE NAV ON SCROLL ============
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section[id]');

function syncNav() {
    const pos = window.scrollY + 110;
    sections.forEach(s => {
        if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) {
            navItems.forEach(n => n.classList.remove('active'));
            const active = document.querySelector(`.nav-item[href="#${s.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}
window.addEventListener('scroll', syncNav, { passive: true });
syncNav();

// ============ HERO ENTRY ANIMATIONS ============
// Fires after preloader finishes (~1.95s)
// - Text scramble on .greeting + .n1 (Matrix hacker effect)
// - Clip-path wipe on .n2 (gradient name sweeps in from left)
// - 3D rotateY entrance on .hero-image-wrapper
setTimeout(() => {
    const greetingEl = document.querySelector('.greeting');
    const n1El       = document.querySelector('.hero-name .n1');

    // Clear scramble targets (hidden behind preloader, safe to clear)
    if (greetingEl) greetingEl.textContent = '';
    if (n1El)       n1El.textContent       = '';

    // ---- GSAP-controlled elements ----
    gsap.from('.hero-badge',         { opacity: 0, y: -22,                                          duration: 0.60, delay: 0.00, ease: 'power3.out' });
    gsap.from('.hero-image-wrapper', { opacity: 0, x: 80, rotateY: 16, transformPerspective: 1200,  duration: 1.15, delay: 0.15, ease: 'power3.out' });
    gsap.from('.hero-name .n2',      { opacity: 0, clipPath: 'inset(0 100% 0 0)',                    duration: 1.00, delay: 0.62, ease: 'power3.out' });
    gsap.from('.hero-title',         { opacity: 0, y: 22,                                           duration: 0.65, delay: 0.88, ease: 'power2.out' });
    gsap.from('.hero-description',   { opacity: 0, y: 18,                                           duration: 0.65, delay: 1.05, ease: 'power2.out' });
    gsap.from('.hero-stats',         { opacity: 0, y: 18,                                           duration: 0.60, delay: 1.20, ease: 'power2.out' });
    gsap.from('.hero-actions',       { opacity: 0, y: 18,                                           duration: 0.60, delay: 1.35, ease: 'power2.out' });
    gsap.from('.hero-links',         { opacity: 0, y: 18,                                           duration: 0.60, delay: 1.50, ease: 'power2.out' });

    // ---- Text scramble elements (Matrix/hacker entrance) ----
    if (greetingEl) setTimeout(() => new TextScramble(greetingEl).setText("// Hello, I'm"), 280);
    if (n1El)       setTimeout(() => new TextScramble(n1El).setText('Prasanta'),           440);

}, 1950);

// ============ SCROLL TO TOP ============
const scrollTopBtn = document.getElementById('scroll-top-btn');

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============ FOOTER YEAR ============
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ RESUME DOWNLOAD ============
function downloadResume(event) {
    event.preventDefault();
    const a = document.createElement('a');
    a.href     = 'assets/resume.pdf';
    a.download = 'Prasanta_Badatya_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/* =====================================================
   3D ENHANCEMENT LAYER — World-Class 3D Interactions
   ===================================================== */

// ============ HERO 3D MOUSE PARALLAX ============
const heroParallaxEl = document.getElementById('heroParallax');
const heroSect       = document.getElementById('home');
let hpTX = 0, hpTY = 0, hpCX = 0, hpCY = 0;
let heroReady = false;

// Wait for entry animations to finish before enabling parallax
setTimeout(() => { heroReady = true; }, 3300);

if (heroParallaxEl && heroSect) {
    heroSect.addEventListener('mousemove', e => {
        const rect = heroSect.getBoundingClientRect();
        hpTX = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -12;
        hpTY = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  12;
    });
    heroSect.addEventListener('mouseleave', () => { hpTX = 0; hpTY = 0; });

    (function heroParallaxLoop() {
        if (heroReady) {
            hpCX += (hpTX - hpCX) * 0.065;
            hpCY += (hpTY - hpCY) * 0.065;
            if (Math.abs(hpCX) > 0.005 || Math.abs(hpCY) > 0.005) {
                heroParallaxEl.style.transform =
                    `perspective(1000px) rotateX(${hpCX.toFixed(3)}deg) rotateY(${hpCY.toFixed(3)}deg)`;
            }
        }
        requestAnimationFrame(heroParallaxLoop);
    })();
}

// ============ HERO SCROLL PARALLAX ============
gsap.to('.hero-name', {
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1.2 },
    y: -80, ease: 'none'
});
gsap.to('.hero-description', {
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 2 },
    y: -50, ease: 'none'
});
gsap.to('.hero-visual', {
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 2.8 },
    y: -25, ease: 'none'
});

// ============ ARSENAL CARDS — 3D TILT (GSAP) ============
document.querySelectorAll('.arsenal-cat').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -8;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  8;
        gsap.to(card, {
            rotateX: rx, rotateY: ry, y: -8,
            transformPerspective: 700,
            duration: 0.22, ease: 'power2.out', overwrite: 'auto'
        });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateX: 0, rotateY: 0, y: 0,
            duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto'
        });
    });
});

