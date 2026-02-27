/* =====================================================
   PRASANTA BADATYA — WORLD-CLASS PORTFOLIO
   JavaScript: 3D Animations · Particles · GSAP
   ===================================================== */

// ============ GSAP REGISTRATION ============
gsap.registerPlugin(ScrollTrigger);

// ============ PRELOADER + SCROLLTRIGGER REFRESH ============
window.addEventListener('load', () => {
    // Dismiss preloader
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 900);
    }, 1800);

    // Recalculate all ScrollTrigger positions after fonts & images settle
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

document.querySelectorAll('a, button, .portfolio-item, .skill-item, .contact-item, .cta-button, .arsenal-cat').forEach(el => {
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
let mouse = { x: null, y: null };

const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
};
resize();
window.addEventListener('resize', () => { resize(); buildParticles(); });

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
document.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

class Particle {
    constructor() { this.init(); }
    init() {
        this.x    = Math.random() * canvas.width;
        this.y    = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.4;
        this.vx   = (Math.random() - 0.5) * 0.45;
        this.vy   = (Math.random() - 0.5) * 0.45;
        this.baseAlpha = Math.random() * 0.55 + 0.1;
        this.alpha     = this.baseAlpha;
        this.hue  = Math.random() > 0.65 ? 270 : 200;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (mouse.x !== null) {
            const dx   = this.x - mouse.x;
            const dy   = this.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            const R    = 130;
            if (dist < R) {
                const force = (R - dist) / R;
                this.x += (dx / dist) * force * 3.5;
                this.y += (dy / dist) * force * 3.5;
                this.alpha = Math.min(1, this.baseAlpha + force * 0.6);
            } else {
                this.alpha = this.baseAlpha;
            }
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
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(item.getAttribute('href'));
        if (!target) return;
        navMenu.classList.remove('active');
        const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
    });
});

// ============ GSAP SCROLL ANIMATIONS ============
// KEY RULE: every gsap.from() that animates opacity MUST have
// immediateRender: false — otherwise GSAP sets opacity:0 on page
// load and elements stay invisible if their trigger never fires.

// --- Section headers ---
document.querySelectorAll('.section-header').forEach(hdr => {
    gsap.from(Array.from(hdr.children), {
        immediateRender: false,
        scrollTrigger: { trigger: hdr, start: 'top 88%', once: true },
        opacity: 0, y: 36, duration: .8, stagger: .13, ease: 'power3.out'
    });
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
gsap.from('.arsenal-cat', {
    immediateRender: false,
    scrollTrigger: { trigger: '.tech-arsenal', start: 'top 88%', once: true },
    opacity: 0, y: 40, duration: .6, stagger: .1, ease: 'power3.out'
});
gsap.from('.a-tag', {
    immediateRender: false,
    scrollTrigger: { trigger: '.tech-arsenal', start: 'top 80%', once: true },
    opacity: 0, y: 10, duration: .35, stagger: .04, ease: 'power2.out'
});

// --- Portfolio ---
gsap.from('.portfolio-item', {
    immediateRender: false,
    scrollTrigger: { trigger: '.portfolio-grid', start: 'top 80%', once: true },
    opacity: 0, y: 60, duration: .7, stagger: .14, ease: 'power3.out'
});

// --- Experience ---
// Timeline line draws progressively as you scroll (scrub — silky smooth)
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

// Single sequenced GSAP timeline for ALL experience content.
// IMPORTANT: immediateRender:false on EVERY tween — including the
// first one — so nothing gets pre-hidden on page load.
gsap.timeline({
    scrollTrigger: {
        trigger: '.experience-section',
        start: 'top 60%',
        once: true
    }
})
.from('.timeline-dot', {
    immediateRender: false,
    scale: 0, opacity: 0, duration: .45, ease: 'back.out(2.5)'
})
.from('.timeline-date', {
    immediateRender: false,
    opacity: 0, y: 20, duration: .45, ease: 'power2.out'
}, '-=0.1')
.from('.timeline-title', {
    immediateRender: false,
    opacity: 0, y: 20, duration: .45, ease: 'power2.out'
}, '-=0.28')
.from('.timeline-company', {
    immediateRender: false,
    opacity: 0, y: 20, duration: .45, ease: 'power2.out'
}, '-=0.28')
.from('.timeline-description', {
    immediateRender: false,
    opacity: 0, y: 20, duration: .45, ease: 'power2.out'
}, '-=0.22')
.from('.achievement-item', {
    immediateRender: false,
    opacity: 0, y: 26, scale: 0.94,
    duration: .5, stagger: .12, ease: 'power2.out'
}, '-=0.1')
.from('#experience .tech-tag', {
    immediateRender: false,
    opacity: 0, y: 10, duration: .32, stagger: .05, ease: 'power2.out'
}, '-=0.1');

// --- Contact ---
// Use the section as trigger (more reliable than inner elements near page bottom)
gsap.from('.contact-item', {
    immediateRender: false,
    scrollTrigger: { trigger: '.contact-section', start: 'top 65%', once: true },
    opacity: 0, y: 40, duration: .6, stagger: .1, ease: 'power3.out'
});
gsap.from('.contact-actions .cta-button', {
    immediateRender: false,
    scrollTrigger: { trigger: '.contact-section', start: 'top 55%', once: true },
    opacity: 0, y: 22, duration: .55, stagger: .12, ease: 'power3.out'
});

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
// Runs after preloader completes
setTimeout(() => {
    gsap.from('.hero-badge',        { opacity: 0, y: 20, duration: .7, delay: .0, ease: 'power2.out' });
    gsap.from('.greeting',          { opacity: 0, y: 20, duration: .7, delay: .1, ease: 'power2.out' });
    gsap.from('.hero-name .n1',     { opacity: 0, y: 60, duration: .9, delay: .2, ease: 'power3.out' });
    gsap.from('.hero-name .n2',     { opacity: 0, y: 60, duration: .9, delay: .4, ease: 'power3.out' });
    gsap.from('.hero-title',        { opacity: 0, y: 20, duration: .7, delay: .6, ease: 'power2.out' });
    gsap.from('.hero-description',  { opacity: 0, y: 20, duration: .7, delay: .7, ease: 'power2.out' });
    gsap.from('.hero-stats',        { opacity: 0, y: 20, duration: .7, delay: .8, ease: 'power2.out' });
    gsap.from('.hero-actions',      { opacity: 0, y: 20, duration: .7, delay: .9, ease: 'power2.out' });
    gsap.from('.hero-links',        { opacity: 0, y: 20, duration: .7, delay: 1.0, ease: 'power2.out' });
    gsap.from('.hero-image-wrapper',{ opacity: 0, x: 60, duration: 1.1, delay: .3, ease: 'power3.out' });
}, 1950);

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
