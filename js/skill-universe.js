/* =====================================================
   SKILL UNIVERSE — 3D scroll journey (Three.js + GSAP)
   Act 1: Skill Galaxy  — technologies in orbital rings
   Act 2: Time Tunnel   — 3 years of milestones fly past
   Act 3: Convergence   — the core + final stats
   ===================================================== */

(function () {
    'use strict';

    const section = document.getElementById('skills');
    const canvas  = document.getElementById('skillUniverseCanvas');
    if (!section || !canvas) return;

    const pinEl      = section.querySelector('.su-pin');
    const fallbackEl = section.querySelector('.su-fallback');
    const hintEl     = section.querySelector('.su-hint');
    const actEls     = [
        section.querySelector('.su-act-1'),
        section.querySelector('.su-act-2'),
        section.querySelector('.su-act-3')
    ];

    // ---------- capability checks ----------
    function webglAvailable() {
        try {
            const c = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) { return false; }
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function showFallback() {
        pinEl.classList.add('su-static');
        if (fallbackEl) fallbackEl.hidden = false;
        actEls.forEach(el => { if (el) el.style.display = 'none'; });
    }

    if (!window.THREE || reducedMotion || !webglAvailable()) {
        showFallback();
        return;
    }

    // ---------- data ----------
    const RINGS = [
        { css: '#38bdf8', hex: 0x38bdf8, radius: 16, tilt:  0.42, speed:  0.120, skills: ['Python', 'Django', 'Django REST', 'Celery'] },
        { css: '#a78bfa', hex: 0xa78bfa, radius: 24, tilt: -0.30, speed: -0.085, skills: ['PostgreSQL', 'MySQL', 'Redis'] },
        { css: '#fb923c', hex: 0xfb923c, radius: 32, tilt:  0.22, speed:  0.060, skills: ['Angular', 'TypeScript', 'PWA', 'HTML / CSS'] },
        { css: '#34d399', hex: 0x34d399, radius: 40, tilt: -0.16, speed: -0.045, skills: ['AWS EC2', 'Sentry', 'Gemini AI', 'HDFC Gateway'] }
    ];

    const MILESTONES = [
        { date: 'JULY 2023', title: 'Joined Adhyay Infotech', sub: 'Software Development Engineer', z: -170, x: -30, y:  6 },
        { date: '2024',      title: 'Led a Team of 6',        sub: 'Backend · Frontend · Android · QA', z: -300, x: 30, y: -4 },
        { date: '2024',      title: '64+ Report Engine',      sub: 'Chunked processing & Excel export', z: -430, x: -30, y: 8 },
        { date: '2025',      title: 'HDFC Payment Gateway',   sub: 'SmartGateway with webhook callbacks', z: -560, x: 30, y: -6 },
        { date: '2026',      title: 'DailyTx — My Own SaaS',  sub: 'Daily delivery platform', z: -690, x: -26, y: 5 }
    ];

    const CAM_START = 95;
    const CAM_END   = -758;
    const CORE_Z    = -812;
    const isMobile  = window.innerWidth < 768;

    // camera keyframes: [progress, z] — slow galaxy approach, punch through, tunnel, arrive
    const CAM_PATH = [
        [0.00, CAM_START],
        [0.30, 28],
        [0.44, -85],
        [0.88, -690],
        [1.00, CAM_END]
    ];
    function camZ(p) {
        for (let i = 1; i < CAM_PATH.length; i++) {
            if (p <= CAM_PATH[i][0]) {
                const p0 = CAM_PATH[i - 1][0], z0 = CAM_PATH[i - 1][1];
                const p1 = CAM_PATH[i][0],     z1 = CAM_PATH[i][1];
                return z0 + (z1 - z0) * ((p - p0) / (p1 - p0));
            }
        }
        return CAM_END;
    }

    // ---------- scene ----------
    let scene, camera, renderer;
    let galaxy, ringGroups = [], starField, cardMeshes = [], core, coreGlow, coreParticles;
    let progress = 0, inView = false, statsPlayed = false, initialized = false;
    const mouseT = { x: 0, y: 0 }, mouseC = { x: 0, y: 0 };

    function roundRectPath(g, x, y, w, h, r) {
        g.beginPath();
        g.moveTo(x + r, y);
        g.arcTo(x + w, y,     x + w, y + h, r);
        g.arcTo(x + w, y + h, x,     y + h, r);
        g.arcTo(x,     y + h, x,     y,     r);
        g.arcTo(x,     y,     x + w, y,     r);
        g.closePath();
    }

    // Glowing text label rendered to a canvas texture → sprite
    function makeTextSprite(text, color) {
        const fontSize = 54, pad = 40;
        const measure = document.createElement('canvas').getContext('2d');
        measure.font = "600 " + fontSize + "px 'Space Grotesk', 'Segoe UI', sans-serif";
        const w = Math.ceil(measure.measureText(text).width) + pad * 2;
        const h = 120;

        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const g = c.getContext('2d');
        g.font = "600 " + fontSize + "px 'Space Grotesk', 'Segoe UI', sans-serif";
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.shadowColor = color;
        g.shadowBlur = 24;
        g.fillStyle = '#eef7ff';
        g.fillText(text, w / 2, h / 2);
        g.shadowBlur = 10;
        g.fillText(text, w / 2, h / 2);

        const tex = new THREE.CanvasTexture(c);
        tex.minFilter = THREE.LinearFilter;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        mat.fog = true;
        const spr = new THREE.Sprite(mat);
        const s = isMobile ? 0.052 : 0.062;
        spr.scale.set(w * s, h * s, 1);
        return spr;
    }

    function makeRingLine(radius, hex) {
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.22 });
        return new THREE.Line(geo, mat);
    }

    // Milestone card rendered to canvas texture → plane in the tunnel
    function makeCardMesh(m) {
        const c = document.createElement('canvas');
        c.width = 640; c.height = 320;
        const g = c.getContext('2d');

        roundRectPath(g, 8, 8, 624, 304, 26);
        g.fillStyle = 'rgba(4, 12, 28, 0.92)';
        g.fill();
        g.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        g.lineWidth = 3;
        g.stroke();

        g.fillStyle = '#38bdf8';
        g.fillRect(42, 58, 56, 5);

        g.font = "500 26px 'JetBrains Mono', monospace";
        g.fillStyle = '#38bdf8';
        g.fillText(m.date, 42, 116);

        g.font = "700 42px 'Space Grotesk', 'Segoe UI', sans-serif";
        g.fillStyle = '#f1f7ff';
        g.fillText(m.title, 42, 180);

        g.font = "400 27px 'Inter', 'Segoe UI', sans-serif";
        g.fillStyle = 'rgba(226, 236, 255, 0.62)';
        g.fillText(m.sub, 42, 238);

        const tex = new THREE.CanvasTexture(c);
        tex.minFilter = THREE.LinearFilter;
        const mat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide
        });
        const scale = isMobile ? 0.72 : 1;
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(30 * scale, 15 * scale), mat);
        mesh.position.set(isMobile ? m.x * 0.45 : m.x, m.y, m.z);
        mesh.rotation.y = m.x > 0 ? -0.5 : 0.5;
        return mesh;
    }

    function makeGlowTexture(inner, outer) {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, inner);
        grad.addColorStop(0.35, outer);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 256, 256);
        const tex = new THREE.CanvasTexture(c);
        tex.minFilter = THREE.LinearFilter;
        return tex;
    }

    function buildScene() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020817, 0.0042);

        camera = new THREE.PerspectiveCamera(55, pinEl.clientWidth / pinEl.clientHeight, 0.1, 1500);
        camera.position.set(0, 0, CAM_START);

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setClearColor(0x020817, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(pinEl.clientWidth, pinEl.clientHeight);

        // ----- starfield -----
        const starCount = isMobile ? 450 : 900;
        const pos = new Float32Array(starCount * 3);
        const col = new Float32Array(starCount * 3);
        const palette = [new THREE.Color(0x38bdf8), new THREE.Color(0xa78bfa), new THREE.Color(0xffffff)];
        for (let i = 0; i < starCount; i++) {
            pos[i * 3]     = (Math.random() - 0.5) * 700;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 420;
            pos[i * 3 + 2] = 140 - Math.random() * 1100;
            const c = palette[Math.floor(Math.random() * palette.length)];
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const starMat = new THREE.PointsMaterial({
            size: 1.5, vertexColors: true, transparent: true,
            opacity: 0.85, depthWrite: false, sizeAttenuation: true
        });
        starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);

        // ----- skill galaxy (Act 1) -----
        galaxy = new THREE.Group();
        const gScale = isMobile ? 0.6 : 1;
        galaxy.scale.set(gScale, gScale, gScale);

        RINGS.forEach(ring => {
            const grp = new THREE.Group();
            grp.rotation.x = ring.tilt;
            grp.add(makeRingLine(ring.radius, ring.hex));

            ring.skills.forEach((skill, i) => {
                const a = (i / ring.skills.length) * Math.PI * 2 + ring.radius; // radius as phase offset
                const spr = makeTextSprite(skill, ring.css);
                spr.position.set(Math.cos(a) * ring.radius, 0, Math.sin(a) * ring.radius);
                grp.add(spr);

                const dotGeo = new THREE.SphereGeometry(0.55, 12, 12);
                const dotMat = new THREE.MeshBasicMaterial({ color: ring.hex });
                const dot = new THREE.Mesh(dotGeo, dotMat);
                dot.position.copy(spr.position);
                dot.position.y -= 2.6;
                grp.add(dot);
            });

            ringGroups.push({ group: grp, speed: ring.speed });
            galaxy.add(grp);
        });

        // center emblem of the galaxy
        const emblem = new THREE.Mesh(
            new THREE.IcosahedronGeometry(3.2, 1),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.7 })
        );
        galaxy.add(emblem);
        galaxy.userData.emblem = emblem;
        scene.add(galaxy);

        // ----- milestone tunnel (Act 2) -----
        MILESTONES.forEach(m => {
            const mesh = makeCardMesh(m);
            cardMeshes.push(mesh);
            scene.add(mesh);
        });

        // ----- core (Act 3) -----
        core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(5, 2),
            new THREE.MeshBasicMaterial({ color: 0x67d5ff, wireframe: true, transparent: true, opacity: 0.9 })
        );
        core.position.set(0, -8, CORE_Z); // sits below the centered stats overlay
        scene.add(core);

        coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: makeGlowTexture('rgba(103, 213, 255, 0.9)', 'rgba(56, 130, 246, 0.28)'),
            transparent: true, depthWrite: false
        }));
        coreGlow.scale.set(58, 58, 1);
        coreGlow.position.copy(core.position);
        scene.add(coreGlow);

        const pCount = 130;
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount; i++) {
            const a = Math.random() * Math.PI * 2, r = 9 + Math.random() * 16;
            pPos[i * 3]     = Math.cos(a) * r;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
            pPos[i * 3 + 2] = CORE_Z + Math.sin(a) * r;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        coreParticles = new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: 0x38bdf8, size: 1.1, transparent: true, opacity: 0.8, depthWrite: false
        }));
        scene.add(coreParticles);
    }

    // ---------- overlay helpers ----------
    // opacity window: ramp up a→b, hold b→c, ramp down c→d
    function fadeWindow(p, a, b, c, d) {
        if (p <= a || p >= d) return 0;
        if (p < b) return (p - a) / (b - a);
        if (p > c) return 1 - (p - c) / (d - c);
        return 1;
    }

    function animateStat(el, end, suffix) {
        const dur = 1300;
        let t0 = null;
        const step = ts => {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(ease * end) + suffix;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    function playStats() {
        if (statsPlayed) return;
        statsPlayed = true;
        section.querySelectorAll('.su-num').forEach(el => {
            animateStat(el, parseInt(el.dataset.suTarget, 10), el.dataset.suSuffix || '');
        });
    }

    function updateOverlay(p) {
        if (hintEl) hintEl.style.opacity = p > 0.05 ? 0 : '';
        if (actEls[0]) actEls[0].style.opacity = fadeWindow(p, 0.03, 0.10, 0.26, 0.34);
        if (actEls[1]) actEls[1].style.opacity = fadeWindow(p, 0.38, 0.46, 0.70, 0.78);
        if (actEls[2]) {
            const o = fadeWindow(p, 0.85, 0.93, 1.01, 1.02);
            actEls[2].style.opacity = o;
            if (o > 0.35) playStats();
        }
    }

    // ---------- per-frame ----------
    function tick(t) {
        requestAnimationFrame(tick);
        if (!inView) return;

        const time = t * 0.001;

        // camera journey
        camera.position.z = camZ(progress);
        mouseC.x += (mouseT.x - mouseC.x) * 0.05;
        mouseC.y += (mouseT.y - mouseC.y) * 0.05;
        camera.position.x = mouseC.x * 13;
        camera.position.y = -mouseC.y * 8;
        camera.lookAt(mouseC.x * 5, -mouseC.y * 3, camera.position.z - 70);

        // galaxy motion
        ringGroups.forEach(r => { r.group.rotation.y = time * r.speed * 2; });
        galaxy.rotation.y = time * 0.02;
        if (galaxy.userData.emblem) {
            galaxy.userData.emblem.rotation.x = time * 0.4;
            galaxy.userData.emblem.rotation.y = time * 0.55;
        }

        // milestone cards: hidden during the galaxy act, fade out once the camera passes them
        const tunnelGate = THREE.MathUtils.clamp((progress - 0.30) / 0.10, 0, 1);
        cardMeshes.forEach(mesh => {
            const ahead = camera.position.z - mesh.position.z;
            mesh.material.opacity = tunnelGate * THREE.MathUtils.clamp(ahead / 10, 0, 1);
            mesh.position.y += Math.sin(time * 1.3 + mesh.position.z) * 0.004;
        });

        // core pulse + swirl
        const pulse = 1 + Math.sin(time * 2.2) * 0.07;
        core.scale.set(pulse, pulse, pulse);
        core.rotation.y = time * 0.5;
        core.rotation.x = time * 0.24;
        coreGlow.scale.set(58 * pulse, 58 * pulse, 1);
        coreParticles.rotation.y = time * 0.28;
        coreParticles.position.z = 0; // rotation around own origin; particles already placed at CORE_Z

        renderer.render(scene, camera);
    }

    // ---------- wiring ----------
    function init() {
        if (initialized) return;
        initialized = true;

        buildScene();

        // scroll-driven journey (pin + scrub)
        ScrollTrigger.create({
            trigger: pinEl,
            start: 'top top',
            end: '+=3200',
            pin: true,
            scrub: 1,
            onUpdate: self => {
                progress = self.progress;
                updateOverlay(progress);
            }
        });
        ScrollTrigger.refresh();

        // mouse parallax (desktop only)
        if (!isMobile) {
            pinEl.addEventListener('mousemove', e => {
                const r = pinEl.getBoundingClientRect();
                mouseT.x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
                mouseT.y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
            });
            pinEl.addEventListener('mouseleave', () => { mouseT.x = 0; mouseT.y = 0; });
        }

        // render only while the section is near the viewport
        new IntersectionObserver(entries => {
            entries.forEach(en => { inView = en.isIntersecting; });
        }, { rootMargin: '300px' }).observe(section);

        window.addEventListener('resize', () => {
            camera.aspect = pinEl.clientWidth / pinEl.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(pinEl.clientWidth, pinEl.clientHeight);
        });

        requestAnimationFrame(tick);
    }

    // start after fonts are ready so canvas-rendered labels use the real typefaces
    function start() {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(init);
            setTimeout(init, 2500); // safety net if fonts hang
        } else {
            init();
        }
    }

    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start);
})();
