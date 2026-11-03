/* CONTENTS
     0.  Config & data (services, care tips, add-ons)
     1.  Helpers (DOM builder, debounce, formatting)
     2.  Visual effects engine (canvas paint-splats, confetti, cursor trail)
     3.  Site-wide effects (scroll bar, sticky header, reveal, tilt, ripple,
         back-to-top, page transitions, toasts, Konami code)
     4.  Hero effects (before/after slider, typewriter, bubbles)
     5.  Interactive elements (accordion, tabs, modal)
     6.  Dynamic content (care tips, service finder: search/filter/sort)
     7.  Gallery (search/filter/sort + lightbox)
     8.  Interactive map (Leaflet)
     9.  Forms (validation, enquiry quote, contact email, AJAX)
     10. Start-up */
(() => {
    'use strict';

    /* 0. CONFIG & DATA */
    const CONFIG = {
        // Recipient of the contact-form email (used to build the mailto: link)
        contactEmail: 'info@solerevive.co.za',
        // Mamelodi hub (25°42'36.5"S 28°22'53.2"E)
        hub: { lat: -25.710139, lng: 28.381444 },
        // Pretoria East location (25°47'46.4"S 28°18'56.4"E)
        east: { lat: -25.796222, lng: 28.315667 },
        // Timeout for AJAX form submission (ms)
        ajaxTimeout: 10000
    };

    // Placeholder prices (R = South African rand). The enquiry quote, the
    // service finder and the quick-view modal all read from this one list.
    const SERVICES = [
        {
            id: 'standard-clean', name: 'Standard Sneaker Clean', category: 'Everyday',
            price: 120, days: 2,
            blurb: 'A quick, professional refresh for everyday dirt, dust and surface marks.',
            tags: ['wash', 'quick', 'dust', 'everyday', 'maintenance', 'light'],
            includes: ['Surface and upper cleaning', 'Lace wash', 'Air-dry finish'],
            best: 'Everyday sneakers with light dirt.',
            img: 'images/services/standard-sneaker-cleaning-service.webp',
            alt: 'Sneakers receiving a standard cleaning service'
        },
        {
            id: 'deep-clean', name: 'Deep Clean', category: 'Intensive',
            price: 220, days: 3,
            blurb: 'Intensive attention for heavily soiled sneakers and stubborn marks.',
            tags: ['stains', 'dirty', 'mud', 'soiled', 'intensive', 'stubborn'],
            includes: ['Full upper and midsole scrub', 'Stain treatment', 'Lace and insole refresh'],
            best: 'Heavily soiled pairs and stubborn marks.',
            img: 'images/services/deep-clean-sneaker-service.webp',
            alt: 'Sneakers receiving a detailed deep cleaning service'
        },
        {
            id: 'sole-care', name: 'Sole Care', category: 'Soles',
            price: 150, days: 2,
            blurb: 'Focused cleaning for soles, toe boxes and other high-contact areas.',
            tags: ['sole', 'midsole', 'toe', 'whitening', 'outsole'],
            includes: ['Outsole and midsole detail clean', 'Toe-box scuff treatment', 'Edge polish'],
            best: 'Dirty soles and scuffed toe boxes.',
            img: 'images/services/sneaker-sole-care-service.webp',
            alt: 'Clean sneaker sole receiving professional care'
        },
        {
            id: 'premium-care', name: 'Premium Shoe Care', category: 'Premium',
            price: 350, days: 4,
            blurb: 'Our most detailed option for special-occasion and collector pairs.',
            tags: ['premium', 'luxury', 'collector', 'special', 'detail', 'restore'],
            includes: ['Everything in Deep Clean + Sole Care', 'Hand-finished detailing', 'Protective finish', 'Presentation wrap'],
            best: 'Premium sneakers and special-occasion footwear.',
            img: 'images/services/premium-sneaker-care-service.webp',
            alt: 'Premium sneaker care service'
        }
    ];
    const serviceById = id => SERVICES.find(s => s.id === id);

    const ADDONS = {
        waterproof: { label: 'Water-repellent coating', price: 50 },
        laces: { label: 'Fresh lace replacement', price: 30 },
        whiten: { label: 'Midsole whitening', price: 40 }
    };
    const DELIVERY = {
        dropoff: { label: 'I will drop off and collect', price: 0 },
        collect: { label: 'Collection and delivery', price: 40 }
    };

    const TIPS = {
        leather: {
            label: 'Leather', title: 'Looking after leather',
            items: [
                'Wipe off dirt with a soft damp cloth before it dries into the grain.',
                'Never leave leather to dry on a heater or in direct sun; it cracks.',
                'Use a leather conditioner every few weeks to keep it supple.',
                'Stuff with paper or shoe trees to hold the shape while drying.'
            ]
        },
        suede: {
            label: 'Suede', title: 'Looking after suede',
            items: [
                'Keep suede dry. Water-repellent spray before the first wear is your friend.',
                'Brush gently in one direction with a suede brush to lift the nap.',
                'Treat stains when dry; an eraser-style block lifts marks without rubbing them in.',
                'Avoid rain days. If caught out, blot (never rub) and air-dry.'
            ]
        },
        knit: {
            label: 'Mesh & knit', title: 'Looking after mesh and knit',
            items: [
                'Use a soft brush with a little mild soap and cool water.',
                'Skip the washing machine; heat and tumbling warp the shape.',
                'Remove laces and insoles and wash them separately.',
                'Air-dry away from direct heat so the fabric does not shrink.'
            ]
        },
        soles: {
            label: 'White soles', title: 'Keeping soles fresh',
            items: [
                'Scrub with a firm brush and a baking-soda paste to lift yellowing and grime.',
                'Clean the soles after muddy days before the dirt sets.',
                'Rotate your pairs; shoes need a day to dry out between wears.',
                'Store them away from sunlight to slow yellowing.'
            ]
        }
    };

    /* 1. HELPERS */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionOK = () => !reduceMotion.matches;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    /** Tiny DOM builder. Text always goes in as text (never HTML), so
     *  user-supplied values can never inject markup. */
    function el(tag, props = {}, ...kids) {
        const node = document.createElement(tag);
        for (const [key, val] of Object.entries(props)) {
            if (val === null || val === undefined || val === false) continue;
            if (key === 'class') node.className = val;
            else if (key === 'text') node.textContent = val;
            else if (key.startsWith('on') && typeof val === 'function') node.addEventListener(key.slice(2), val);
            else node.setAttribute(key, val === true ? '' : String(val));
        }
        kids.flat(Infinity).forEach(k => {
            if (k === null || k === undefined || k === false) return;
            node.append(k.nodeType ? k : document.createTextNode(String(k)));
        });
        return node;
    }

    function debounce(fn, ms = 200) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    }

    const rand = n => 'R' + (Number.isInteger(n) ? n : n.toFixed(2));
    const pad = n => String(n).padStart(2, '0');
    const fmtDate = d => d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

    /** Wrap matches of `query` in <mark> (built with DOM nodes, not innerHTML). */
    function highlight(text, query) {
        if (!query) return text;
        const i = text.toLowerCase().indexOf(query.toLowerCase());
        if (i < 0) return text;
        const frag = document.createDocumentFragment();
        frag.append(text.slice(0, i), el('mark', { text: text.slice(i, i + query.length) }), text.slice(i + query.length));
        return frag;
    }

    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    function trapFocus(container, e) {
        if (e.key !== 'Tab') return;
        const items = $$(FOCUSABLE, container).filter(n => n.offsetParent !== null || n === document.activeElement);
        if (!items.length) { e.preventDefault(); return; }
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    /* 2. VISUAL EFFECTS ENGINE
          One full-screen canvas draws paint splats, the cursor trail and
          confetti. It only runs while there are particles on screen. */
    const fx = (() => {
        const none = { burst() {}, confetti() {}, trail() {}, rain() {} };
        if (!motionOK()) return none;
        const canvas = el('canvas', { id: 'fx-canvas', 'aria-hidden': 'true' });
        document.body.append(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return none;

        const COLORS = ['#E24B4A', '#378ADD', '#EF9F27', '#1D9E75', '#B5533C'];
        const pick = () => COLORS[Math.floor(Math.random() * COLORS.length)];
        const between = (a, b) => a + Math.random() * (b - a);
        let w = 0, h = 0, parts = [], running = false, last = 0;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', debounce(resize, 150));

        function add(p) {
            if (parts.length > 500) parts.shift();
            parts.push(p);
            if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
        }

        function tick(now) {
            const dt = Math.min((now - last) / 16.67, 3);
            last = now;
            ctx.clearRect(0, 0, w, h);
            parts = parts.filter(p => {
                p.life -= dt;
                if (p.life <= 0) return false;
                p.vx *= p.drag; p.vy = p.vy * p.drag + p.g * dt;
                p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
                const a = Math.max(p.life / p.max, 0);
                ctx.globalAlpha = Math.min(1, a * 1.6);
                ctx.fillStyle = p.color;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
                else { ctx.beginPath(); ctx.arc(0, 0, Math.max(p.size * (0.4 + a * 0.6), 0.5), 0, Math.PI * 2); ctx.fill(); }
                ctx.restore();
                return true;
            });
            ctx.globalAlpha = 1;
            if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, w, h); }
        }

        return {
            /** Paint splat: dots fly out from a point */
            burst(x, y, n = 14) {
                for (let i = 0; i < n; i++) {
                    const ang = Math.random() * Math.PI * 2, sp = between(1.5, 6);
                    add({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, g: 0.18, drag: 0.96,
                        life: between(28, 55), max: 55, size: between(3, 8), color: pick(), shape: 'dot', rot: 0, vr: 0 });
                }
            },
            /** Small fading dot that follows the cursor */
            trail(x, y) {
                add({ x: x + between(-4, 4), y: y + between(-4, 4), vx: between(-0.3, 0.3), vy: between(-0.2, 0.5), g: 0.02, drag: 0.98,
                    life: 26, max: 26, size: between(3, 6), color: pick(), shape: 'dot', rot: 0, vr: 0 });
            },
            /** Confetti cannon from the bottom corners (KaBoom) */
            confetti(count = 140) {
                for (let i = 0; i < count; i++) {
                    const left = i % 2 === 0;
                    const ang = (left ? between(-80, -35) : between(-145, -100)) * Math.PI / 180;
                    const sp = between(8, 17);
                    add({ x: left ? 0 : w, y: h, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 0.28, drag: 0.985,
                        life: between(90, 150), max: 150, size: between(6, 11), color: pick(), shape: 'rect', rot: Math.random() * 6, vr: between(-0.3, 0.3) });
                }
            },
            /** Colour rain from the top of the screen (Konami code) */
            rain(count = 160) {
                for (let i = 0; i < count; i++) {
                    setTimeout(() => add({ x: between(0, w), y: -10, vx: between(-0.8, 0.8), vy: between(2, 5), g: 0.05, drag: 1,
                        life: between(110, 170), max: 170, size: between(5, 10), color: pick(), shape: Math.random() > 0.5 ? 'rect' : 'dot', rot: Math.random() * 6, vr: between(-0.2, 0.2) }), i * 12);
                }
            }
        };
    })();

    /* 3. SITE-WIDE EFFECTS */
    /* ---- Toast notifications ---- */
    let toastRegion;
    function toast(message, ms = 3800) {
        if (!toastRegion) {
            toastRegion = el('div', { class: 'toast-region', role: 'status', 'aria-live': 'polite' });
            document.body.append(toastRegion);
        }
        const t = el('div', { class: 'toast', text: message });
        toastRegion.append(t);
        requestAnimationFrame(() => t.classList.add('is-in'));
        setTimeout(() => {
            t.classList.remove('is-in');
            setTimeout(() => t.remove(), 400);
        }, ms);
    }

    /* ---- Scroll progress bar, sticky-header shadow, back-to-top ---- */
    function initScrollEffects() {
        const bar = el('div', { class: 'scroll-progress', 'aria-hidden': 'true' });
        const toTop = el('button', { type: 'button', class: 'to-top', 'aria-label': 'Back to top' },
            el('span', { 'aria-hidden': 'true', text: '↑' }));
        document.body.append(bar, toTop);
        const header = $('header');
        let ticking = false;

        function update() {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
            toTop.classList.toggle('is-visible', y > 500);
            if (header) header.classList.toggle('is-scrolled', y > 20);
            ticking = false;
        }
        window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();

        toTop.addEventListener('click', e => {
            window.scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' });
            const r = toTop.getBoundingClientRect();
            fx.burst(r.left + r.width / 2, r.top + r.height / 2, 12);
        });
    }

    /* ---- Reveal-on-scroll with a small stagger ---- */
    function initReveal() {
        if (!motionOK() || !('IntersectionObserver' in window)) return;
        const targets = $$('main > section > h2, main > section > p, main article, main ol > li, main .toolbar, main fieldset, .marquee, .accordion > div');
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const t = entry.target;
                    t.classList.add('is-revealed');
                    io.unobserve(t);
                    setTimeout(() => { t.style.transitionDelay = ''; }, 1200); // so hover/tilt effects are not delayed afterwards
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        targets.forEach(node => {
            const idx = node.parentElement ? Array.from(node.parentElement.children).indexOf(node) : 0;
            node.classList.add('reveal');
            node.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
            io.observe(node);
        });
    }

    /* ---- 3D tilt with a moving glare on cards (mouse only) ---- */
    function bindTilt(node) {
        if (!finePointer.matches || !motionOK() || node.dataset.tiltBound) return;
        node.dataset.tiltBound = '1';
        node.classList.add('tilt');
        node.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            const r = node.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            node.style.transform = `perspective(800px) rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 7).toFixed(2)}deg) translateY(-4px)`;
            node.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
            node.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
        });
        node.addEventListener('pointerleave', () => { node.style.transform = ''; });
    }
    const initTilt = () => $$('.card-grid article').forEach(bindTilt);

    /* ---- Ripple + paint splat on buttons ---- */
    function initButtonEffects() {
        const SEL = '.hero div > a, main section > a, main article > a, .btn, input[type="submit"], input[type="reset"]';
        document.addEventListener('click', e => {
            const target = e.target.closest(SEL);
            if (!target) return;
            const r = target.getBoundingClientRect();
            const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
            fx.burst(x, y, 10);
            if (!motionOK() || target.tagName === 'INPUT') return;
            const size = Math.max(r.width, r.height) * 2;
            const ripple = el('span', { class: 'ripple', 'aria-hidden': 'true' });
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x - r.left - size / 2}px`;
            ripple.style.top = `${y - r.top - size / 2}px`;
            target.append(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    }

    /* ---- Cursor paint trail (mouse only) ---- */
    function initCursorTrail() {
        if (!finePointer.matches || !motionOK()) return;
        let lx = 0, ly = 0;
        window.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            if (Math.hypot(e.clientX - lx, e.clientY - ly) > 16) {
                lx = e.clientX; ly = e.clientY;
                fx.trail(lx, ly);
            }
        }, { passive: true });
    }

    /* ---- Fade out before navigating to another page of the site ---- */
    function initPageTransitions() {
        if (!motionOK()) return;
        document.addEventListener('click', e => {
            const a = e.target.closest('a[href]');
            if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (a.target || a.hasAttribute('download') || !/^(https?|file):$/.test(a.protocol) || a.origin !== location.origin) return;
            if (a.pathname === location.pathname && a.search === location.search) return; // same page / #hash
            e.preventDefault();
            document.body.classList.add('is-leaving');
            setTimeout(() => { window.location.href = a.href; }, 220);
        });
        // Coming back with the Back button (bfcache) must not leave the page faded out
        window.addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('is-leaving'); });
    }

    /* ---- Mobile menu: close on Escape / link tap ---- */
    function initNavExtras() {
        const toggle = $('#nav-toggle');
        if (!toggle) return;
        document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle.checked = false; });
        $$('header nav a').forEach(a => a.addEventListener('click', () => { toggle.checked = false; }));
    }

    /* ---- Easter egg: Konami code -> colour rain ---- */
    function initKonami() {
        const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let pos = 0;
        document.addEventListener('keydown', e => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            pos = key === code[pos] ? pos + 1 : (key === code[0] ? 1 : 0);
            if (pos === code.length) {
                pos = 0;
                fx.rain();
                toast('Squeaky clean mode unlocked! 🧼');
            }
        });
    }

    /* 4. HERO EFFECTS (home page) */
    /* ---- Before / after slider built from the two hero photos (The best part of the website in my opinion) ---- */
    function initHeroCompare() {
        const hero = $('.hero');
        if (!hero) return;
        const wrap = hero.querySelector(':scope > div:nth-of-type(2)');
        const imgs = wrap ? $$('img', wrap) : [];
        if (imgs.length < 2) return;
        const [before, after] = imgs;

        wrap.classList.add('hero-compare');
        before.classList.add('compare-before');
        after.classList.add('compare-after');
        const range = el('input', {
            type: 'range', class: 'compare-range', min: '0', max: '100', value: '50',
            'aria-label': 'Drag to compare the sneakers before and after cleaning'
        });
        const stage = el('div', { class: 'compare-stage' },
            after, before,
            el('span', { class: 'compare-tag compare-tag-before', 'aria-hidden': 'true', text: 'BEFORE' }),
            el('span', { class: 'compare-tag compare-tag-after', 'aria-hidden': 'true', text: 'AFTER' }),
            el('span', { class: 'compare-handle', 'aria-hidden': 'true' }),
            range);
        const hint = el('p', { class: 'compare-hint', text: 'Drag the slider to see the SOLE REVIVE difference.' });
        wrap.append(stage, hint);

        const set = v => stage.style.setProperty('--pos', `${v}%`);
        set(50);
        range.addEventListener('input', () => { touched = true; set(range.value); });
        let touched = false;
        ['pointerdown', 'keydown'].forEach(ev => range.addEventListener(ev, () => { touched = true; }));

        // A gentle auto-demo the first time the slider is seen, to show it is draggable
        if (motionOK() && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting) return;
                io.disconnect();
                const t0 = performance.now(), dur = 2400;
                (function step(now) {
                    if (touched) return;
                    const p = Math.min((now - t0) / dur, 1);
                    const v = 50 + Math.sin(p * Math.PI * 2) * 35 * (1 - p * 0.3);
                    set(v); range.value = v;
                    if (p < 1) requestAnimationFrame(step); else { set(50); range.value = 50; }
                })(t0);
            }, { threshold: 0.6 });
            io.observe(stage);
        }
    }

    /* ---- Typewriter that cycles through the shoes we revive ---- */
    function initTypewriter() {
        const node = $('.typed-text');
        if (!node) return;
        const phrases = (node.dataset.phrases || '').split('|').filter(Boolean);
        if (!phrases.length || !motionOK()) return;
        let p = 0, i = 0, deleting = false;
        (function loop() {
            const full = phrases[p];
            i += deleting ? -1 : 1;
            node.textContent = full.slice(0, i);
            let delay = deleting ? 45 : 90;
            if (!deleting && i === full.length) { deleting = true; delay = 1400; }
            else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 350; }
            setTimeout(loop, delay);
        })();
    }

    /* ---- Soap bubbles drifting up behind the hero (This is my second favourite part)---- */
    function initBubbles() {
        const hero = $('.hero');
        if (!hero || !motionOK()) return;
        const layer = el('span', { class: 'hero-bubbles', 'aria-hidden': 'true' });
        hero.append(layer);
        let visible = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(en => { visible = en[0].isIntersecting; }).observe(hero);
        }
        setInterval(() => {
            if (!visible || document.hidden || layer.childElementCount > 9) return;
            const size = 14 + Math.random() * 38;
            const b = el('span', { class: 'bubble' });
            b.style.width = b.style.height = `${size}px`;
            b.style.left = `${Math.random() * 100}%`;
            b.style.setProperty('--drift', `${(Math.random() - 0.5) * 80}px`);
            b.style.animationDuration = `${7 + Math.random() * 6}s`;
            b.addEventListener('animationend', () => b.remove());
            layer.append(b);
        }, 900);
    }

    /* 5. INTERACTIVE ELEMENTS: accordion, tabs, modal */
    /* ---- Accordion (FAQ). Markup lives in the HTML so it is crawlable. ---- */
    function initAccordions() {
        $$('.accordion').forEach(group => {
            const triggers = $$('.accordion-trigger', group);
            const setOpen = (btn, open) => {
                btn.setAttribute('aria-expanded', String(open));
                const panel = document.getElementById(btn.getAttribute('aria-controls'));
                if (panel) panel.classList.toggle('is-open', open);
            };
            triggers.forEach(btn => {
                btn.addEventListener('click', () => {
                    const open = btn.getAttribute('aria-expanded') !== 'true';
                    if (open) triggers.forEach(o => { if (o !== btn) setOpen(o, false); }); // one open at a time
                    setOpen(btn, open);
                });
                btn.addEventListener('keydown', e => {
                    const i = triggers.indexOf(btn);
                    let next = null;
                    if (e.key === 'ArrowDown') next = triggers[(i + 1) % triggers.length];
                    else if (e.key === 'ArrowUp') next = triggers[(i - 1 + triggers.length) % triggers.length];
                    else if (e.key === 'Home') next = triggers[0];
                    else if (e.key === 'End') next = triggers[triggers.length - 1];
                    if (next) { e.preventDefault(); next.focus(); }
                });
            });
        });
    }

    /* ---- Generic modal dialog ---- */
    const modal = (() => {
        let overlay = null, lastFocus = null, keyHandler = null;
        function close() {
            if (!overlay) return;
            const o = overlay;
            overlay = null;
            o.classList.remove('is-open');
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', keyHandler);
            setTimeout(() => o.remove(), 250);
            if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
        }
        function open({ title, body }) {
            if (overlay) close();
            lastFocus = document.activeElement;
            const closeBtn = el('button', { type: 'button', class: 'modal-close', 'aria-label': 'Close dialog', onclick: close, text: '×' });
            const dialog = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title', tabindex: '-1' },
                closeBtn, el('h2', { id: 'modal-title', text: title }), body);
            overlay = el('div', { class: 'modal-overlay' }, dialog);
            overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
            keyHandler = e => { if (e.key === 'Escape') close(); else trapFocus(dialog, e); };
            document.addEventListener('keydown', keyHandler);
            document.body.append(overlay);
            document.body.classList.add('modal-open');
            requestAnimationFrame(() => { overlay.classList.add('is-open'); dialog.focus(); });
        }
        return { open, close };
    })();

    /* 6. DYNAMIC CONTENT */
    /* ---- Typing animation helper ---- */
    function typeInto(node, text) {
        node.textContent = '';
        if (!motionOK()) { node.textContent = text; return; }
        let i = 0;
        const token = (node._typeToken = Symbol());
        (function step() {
            if (node._typeToken !== token) return;
            node.textContent = text.slice(0, ++i);
            if (i < text.length) setTimeout(step, 14);
        })();
    }

    /* ---- Home page: tabbed care tips + random tip generator ---- */
    function initCareTips() {
        const root = $('#care-tips-app');
        if (!root) return;
        const keys = Object.keys(TIPS);
        const tabs = [], panels = [];
        const tablist = el('div', { class: 'tab-list', role: 'tablist', 'aria-label': 'Choose your shoe material' });
        const panelWrap = el('div', { class: 'tab-panels' });

        function select(i, focus) {
            tabs.forEach((t, j) => {
                const on = i === j;
                t.setAttribute('aria-selected', String(on));
                t.tabIndex = on ? 0 : -1;
                panels[j].hidden = !on;
                if (on && focus) t.focus();
            });
            if (motionOK()) { panels[i].classList.remove('is-switching'); void panels[i].offsetWidth; panels[i].classList.add('is-switching'); }
        }

        keys.forEach((k, i) => {
            const tab = el('button', { type: 'button', role: 'tab', class: 'tab', id: `tip-tab-${i}`, 'aria-controls': `tip-panel-${i}`, 'aria-selected': 'false', tabindex: '-1', text: TIPS[k].label });
            const panel = el('div', { role: 'tabpanel', class: 'tab-panel', id: `tip-panel-${i}`, 'aria-labelledby': `tip-tab-${i}`, tabindex: '0', hidden: true },
                el('h3', { text: TIPS[k].title }),
                el('ul', {}, TIPS[k].items.map(t => el('li', { text: t }))));
            tab.addEventListener('click', () => select(i, false));
            tab.addEventListener('keydown', e => {
                let n = null;
                if (e.key === 'ArrowRight') n = (i + 1) % keys.length;
                else if (e.key === 'ArrowLeft') n = (i - 1 + keys.length) % keys.length;
                else if (e.key === 'Home') n = 0;
                else if (e.key === 'End') n = keys.length - 1;
                if (n !== null) { e.preventDefault(); select(n, true); }
            });
            tabs.push(tab); panels.push(panel);
            tablist.append(tab); panelWrap.append(panel);
        });

        // Random tip
        const all = keys.flatMap(k => TIPS[k].items);
        const output = el('p', { class: 'tip-output', 'aria-live': 'polite', text: 'Tap the button for a quick tip.' });
        let lastTip = -1;
        const shuffle = el('button', {
            type: 'button', class: 'btn btn-solid', text: 'Surprise me with a tip',
            onclick: () => {
                let n; do { n = Math.floor(Math.random() * all.length); } while (n === lastTip && all.length > 1);
                lastTip = n;
                typeInto(output, all[n]);
            }
        });

        root.replaceChildren(tablist, panelWrap, el('div', { class: 'tip-random' }, shuffle, output));
        select(0, false);
    }

    /* ---- Services page: search + filter + sort over the price list ---- */
    function initServiceFinder() {
        const root = $('#service-finder-app');
        if (!root) return;
        const state = { q: '', cat: 'All', sort: 'recommended' };
        const cats = ['All', ...new Set(SERVICES.map(s => s.category))];

        const search = el('input', { type: 'search', id: 'service-search', class: 'toolbar-search', placeholder: 'Search services, e.g. soles, stains, premium…', autocomplete: 'off', 'aria-label': 'Search services' });
        const sort = el('select', { id: 'service-sort', 'aria-label': 'Sort services' },
            el('option', { value: 'recommended', text: 'Sort: Recommended' }),
            el('option', { value: 'price-asc', text: 'Price: low to high' }),
            el('option', { value: 'price-desc', text: 'Price: high to low' }),
            el('option', { value: 'name', text: 'Name: A to Z' }),
            el('option', { value: 'fastest', text: 'Fastest turnaround' }));
        const chips = el('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by category' },
            cats.map(c => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(c === 'All'), text: c, 'data-cat': c })));
        const count = el('p', { class: 'result-count', role: 'status', 'aria-live': 'polite' });
        const grid = el('div', { class: 'service-grid' });
        const toolbar = el('div', { class: 'toolbar' }, el('div', { class: 'toolbar-row' }, search, sort), chips);

        function visible() {
            const q = state.q.trim().toLowerCase();
            let list = SERVICES.filter(s => {
                if (state.cat !== 'All' && s.category !== state.cat) return false;
                if (!q) return true;
                return [s.name, s.category, s.blurb, s.tags.join(' '), `r${s.price}`, `${s.days} days`].join(' ').toLowerCase().includes(q);
            });
            const by = {
                'price-asc': (a, b) => a.price - b.price,
                'price-desc': (a, b) => b.price - a.price,
                name: (a, b) => a.name.localeCompare(b.name),
                fastest: (a, b) => a.days - b.days || a.price - b.price
            }[state.sort];
            if (by) list = [...list].sort(by);
            return list;
        }

        function openQuickView(s) {
            const body = el('div', { class: 'quick-view' },
                el('img', { src: s.img, alt: s.alt, width: '400', height: '300', loading: 'lazy' }),
                el('div', {},
                    el('p', { class: 'quick-price', text: `From ${rand(s.price)}` }),
                    el('p', { text: `${s.blurb} Best for: ${s.best}` }),
                    el('h3', { text: 'What is included' }),
                    el('ul', {}, s.includes.map(t => el('li', { text: t }))),
                    el('p', { class: 'quick-meta', text: `Turnaround: about ${s.days} working days` }),
                    el('a', { class: 'btn btn-solid', href: `enquiry.html?service=${encodeURIComponent(s.id)}`, text: 'Enquire about this service' })));
            modal.open({ title: s.name, body });
        }

        function card(s) {
            const q = state.q.trim();
            const c = el('article', { class: 'service-card' },
                el('span', { class: 'badge', text: s.category }),
                el('h3', {}, highlight(s.name, q)),
                el('p', {}, highlight(s.blurb, q)),
                el('p', { class: 'meta' }, el('strong', { text: `From ${rand(s.price)}` }), el('span', { text: `~${s.days} working days` })),
                el('div', { class: 'card-actions' },
                    el('button', { type: 'button', class: 'btn btn-ghost', text: 'Quick view', 'aria-label': `Quick view of ${s.name}`, onclick: () => openQuickView(s) }),
                    el('a', { class: 'btn btn-solid', href: `enquiry.html?service=${encodeURIComponent(s.id)}`, text: 'Enquire', 'aria-label': `Enquire about ${s.name}` })));
            bindTilt(c);
            return c;
        }

        function render() {
            const list = visible();
            grid.replaceChildren();
            if (!list.length) {
                grid.append(el('div', { class: 'empty-state' },
                    el('p', { text: 'No services match that search.' }),
                    el('button', { type: 'button', class: 'btn btn-ghost', text: 'Clear search', onclick: () => { state.q = ''; state.cat = 'All'; search.value = ''; syncChips(); render(); } })));
            } else {
                list.forEach((s, i) => { const c = card(s); c.style.animationDelay = `${i * 60}ms`; grid.append(c); });
            }
            count.textContent = `${list.length} of ${SERVICES.length} services shown`;
        }
        function syncChips() { $$('.chip', chips).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat))); }

        search.addEventListener('input', debounce(() => { state.q = search.value; render(); }, 150));
        sort.addEventListener('change', () => { state.sort = sort.value; render(); });
        chips.addEventListener('click', e => {
            const b = e.target.closest('.chip');
            if (!b) return;
            state.cat = b.dataset.cat; syncChips(); render();
        });

        // "Dynamic loading": show skeleton cards, then render the list
        root.replaceChildren(toolbar, count, grid);
        if (motionOK()) {
            grid.append(...[0, 1, 2, 3].map(() => el('div', { class: 'skeleton', 'aria-hidden': 'true' })));
            count.textContent = 'Loading services…';
            setTimeout(render, 500);
        } else render();
    }

    /* 7. GALLERY: search / filter / sort + lightbox */
    function initGallery() {
        const grid = $('.gallery-grid');
        if (!grid) return;
        const figures = $$('figure', grid);
        const items = figures.map((fig, i) => {
            const img = $('img', fig);
            return { fig, i, src: img.getAttribute('src'), alt: img.alt, caption: $('figcaption', fig).textContent.trim(), brand: fig.dataset.brand || 'Other' };
        });
        const state = { q: '', brand: 'All', sort: 'default' };
        const brands = ['All', ...new Set(items.map(it => it.brand))];

        // Toolbar
        const search = el('input', { type: 'search', id: 'gallery-search', class: 'toolbar-search', placeholder: 'Search the gallery, e.g. Nike, slides…', autocomplete: 'off', 'aria-label': 'Search the gallery' });
        const sort = el('select', { id: 'gallery-sort', 'aria-label': 'Sort the gallery' },
            el('option', { value: 'default', text: 'Sort: Featured' }),
            el('option', { value: 'az', text: 'Name: A to Z' }),
            el('option', { value: 'za', text: 'Name: Z to A' }));
        const chips = el('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by brand' },
            brands.map(b => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(b === 'All'), text: b, 'data-cat': b })));
        const count = el('p', { class: 'result-count', role: 'status', 'aria-live': 'polite' });
        const empty = el('div', { class: 'empty-state', hidden: true }, el('p', { text: 'No shoes match that search.' }));
        grid.before(el('div', { class: 'toolbar' }, el('div', { class: 'toolbar-row' }, search, sort), chips), count);
        grid.after(empty);

        let shown = items.slice();
        function apply(animate = true) {
            const q = state.q.trim().toLowerCase();
            shown = items.filter(it => (state.brand === 'All' || it.brand === state.brand) &&
                (!q || `${it.caption} ${it.brand} ${it.alt}`.toLowerCase().includes(q)));
            if (state.sort === 'az') shown.sort((a, b) => a.caption.localeCompare(b.caption));
            else if (state.sort === 'za') shown.sort((a, b) => b.caption.localeCompare(a.caption));
            else shown.sort((a, b) => a.i - b.i);
            const order = state.sort === 'default' ? items.slice().sort((a, b) => a.i - b.i) : shown.concat(items.filter(it => !shown.includes(it)));
            order.forEach(it => grid.append(it.fig));
            items.forEach(it => {
                const on = shown.includes(it);
                it.fig.hidden = !on;
                if (on && animate && motionOK()) { it.fig.classList.remove('pop-in'); void it.fig.offsetWidth; it.fig.classList.add('pop-in'); }
            });
            empty.hidden = shown.length > 0;
            count.textContent = `Showing ${shown.length} of ${items.length} pairs`;
        }
        search.addEventListener('input', debounce(() => { state.q = search.value; apply(); }, 150));
        sort.addEventListener('change', () => { state.sort = sort.value; apply(); });
        chips.addEventListener('click', e => {
            const b = e.target.closest('.chip');
            if (!b) return;
            state.brand = b.dataset.cat;
            $$('.chip', chips).forEach(c => c.setAttribute('aria-pressed', String(c === b)));
            apply();
        });
        apply(false);

        /* ---- Lightbox ---- */
        let box = null, idx = 0, zoomed = false, lastFocus = null;
        const parts = {};

        function build() {
            parts.img = el('img', { class: 'lb-img', alt: '', draggable: 'false' });
            parts.caption = el('p', { class: 'lb-caption' });
            parts.count = el('p', { class: 'lb-count', 'aria-live': 'polite' });
            parts.spinner = el('span', { class: 'lb-spinner', 'aria-hidden': 'true' });
            parts.error = el('p', { class: 'lb-error', hidden: true, text: 'Sorry, this image could not be loaded.' });
            parts.close = el('button', { type: 'button', class: 'lb-btn lb-close', 'aria-label': 'Close image viewer', text: '×', onclick: close });
            parts.prev = el('button', { type: 'button', class: 'lb-btn lb-prev', 'aria-label': 'Previous image', text: '‹', onclick: () => step(-1) });
            parts.next = el('button', { type: 'button', class: 'lb-btn lb-next', 'aria-label': 'Next image', text: '›', onclick: () => step(1) });
            parts.stage = el('div', { class: 'lb-stage' }, parts.spinner, parts.img, parts.error);
            box = el('div', { class: 'lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image viewer', tabindex: '-1' },
                parts.close, parts.prev, parts.stage, parts.next, el('div', { class: 'lb-footer' }, parts.caption, parts.count));
            parts.img.addEventListener('load', () => { parts.stage.classList.remove('is-loading'); });
            parts.img.addEventListener('error', () => { parts.stage.classList.remove('is-loading'); parts.error.hidden = false; });
            parts.img.addEventListener('click', () => { zoomed = !zoomed; box.classList.toggle('is-zoomed', zoomed); });
            box.addEventListener('click', e => { if (e.target === box || e.target === parts.stage) close(); });
            box.addEventListener('keydown', e => {
                if (e.key === 'Escape') close();
                else if (e.key === 'ArrowLeft') step(-1);
                else if (e.key === 'ArrowRight') step(1);
                else trapFocus(box, e);
            });
            // Swipe on touch screens
            let sx = 0;
            box.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
            box.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - sx;
                if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }, { passive: true });
        }

        function show(i) {
            idx = (i + shown.length) % shown.length;
            const it = shown[idx];
            zoomed = false; box.classList.remove('is-zoomed');
            parts.error.hidden = true;
            parts.stage.classList.add('is-loading');
            parts.img.src = it.src;
            parts.img.alt = it.alt;
            parts.caption.textContent = it.caption;
            parts.count.textContent = `${idx + 1} / ${shown.length}`;
            const multi = shown.length > 1;
            parts.prev.hidden = parts.next.hidden = !multi;
            if (multi) [1, -1].forEach(d => { new Image().src = shown[(idx + d + shown.length) % shown.length].src; }); // preload neighbours
        }
        function step(d) { if (box && shown.length) show(idx + d); }
        function open(i) {
            if (!shown.length) return;
            if (!box) build();
            lastFocus = document.activeElement;
            document.body.append(box);
            document.body.classList.add('modal-open');
            show(i);
            requestAnimationFrame(() => { box.classList.add('is-open'); box.focus(); });
        }
        function close() {
            if (!box) return;
            box.classList.remove('is-open');
            document.body.classList.remove('modal-open');
            const b = box;
            setTimeout(() => { if (!b.classList.contains('is-open')) b.remove(); }, 250);
            if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
        }

        grid.addEventListener('click', e => {
            const trigger = e.target.closest('.gallery-item');
            if (!trigger) return;
            const fig = trigger.closest('figure');
            open(shown.findIndex(it => it.fig === fig));
        });
    }

    /* 8. INTERACTIVE MAP (Leaflet + OpenStreetMap)*/
    function initMap() {
        const mapEl = $('#map');
        if (!mapEl) return;
        const status = $('#map-status');
        const say = msg => { if (status) status.textContent = msg; };

        // If the Leaflet library failed to load (offline / blocked), degrade gracefully
        if (typeof window.L === 'undefined') {
            mapEl.replaceChildren(el('p', { class: 'map-fallback' },
                'The interactive map could not load. ',
                el('a', { href: `https://www.openstreetmap.org/?mlat=${CONFIG.hub.lat}&mlon=${CONFIG.hub.lng}#map=13/${CONFIG.hub.lat}/${CONFIG.hub.lng}`, target: '_blank', rel: 'noopener noreferrer', text: 'View Mamelodi on OpenStreetMap' }),
                '.'));
            return;
        }
        const L = window.L;
        const hub = [CONFIG.hub.lat, CONFIG.hub.lng];
        const east = [CONFIG.east.lat, CONFIG.east.lng];

        const map = L.map(mapEl, { center: hub, zoom: 12, scrollWheelZoom: false });
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        const hot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>'
        });
        osm.addTo(map);

        const pin = cls => L.divIcon({ className: 'map-pin-wrap', html: `<span class="map-pin ${cls}"></span>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
        const popup = (title, text, lat, lng) => {
            const box = el('div', { class: 'map-popup' },
                el('strong', { text: title }), el('br'), text, el('br'),
                el('a', { href: `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`, target: '_blank', rel: 'noopener noreferrer', text: 'Get directions' }));
            return box;
        };
        const hubMarker = L.marker(hub, { icon: pin('pin-main'), title: 'SOLE REVIVE, Mamelodi', alt: 'SOLE REVIVE hub in Mamelodi' })
            .bindPopup(popup('SOLE REVIVE Mamelodi', 'Our main drop-off and collection point.', hub[0], hub[1]));
        const eastMarker = L.marker(east, { icon: pin('pin-alt'), title: 'Pretoria East service area', alt: 'Pretoria East service area' })
            .bindPopup(popup('Pretoria East', 'Pick-up and delivery by arrangement.', east[0], east[1]));
        const hubArea = L.circle(hub, { radius: 2500, color: '#B5533C', weight: 2, fillColor: '#B5533C', fillOpacity: 0.12 });
        const eastArea = L.circle(east, { radius: 2500, color: '#378ADD', weight: 2, fillColor: '#378ADD', fillOpacity: 0.1 });

        const places = L.layerGroup([hubMarker, eastMarker]).addTo(map);
        const areas = L.layerGroup([hubArea, eastArea]).addTo(map);
        L.control.layers({ 'Street map': osm, 'Humanitarian style': hot }, { 'Our locations': places, 'Service areas': areas }, { collapsed: true }).addTo(map);
        L.control.scale({ imperial: false }).addTo(map);

        const fit = () => map.fitBounds(L.latLngBounds([hub, east]).pad(0.5));
        fit();

        // Scroll-wheel zoom only after the map has been clicked (so page scrolling is never hijacked)
        map.on('click', () => map.scrollWheelZoom.enable());
        map.on('blur', () => map.scrollWheelZoom.disable());
        mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

        // Location cards fly the map to the place
        $$('[data-map-target]').forEach(card => {
            const go = () => {
                const target = card.dataset.mapTarget === 'east' ? east : hub;
                if (motionOK()) map.flyTo(target, 16, { duration: 1.2 }); else map.setView(target, 16, { animate: false });
                (card.dataset.mapTarget === 'east' ? eastMarker : hubMarker).openPopup();
                say(`Showing ${card.dataset.mapTarget === 'east' ? 'Pretoria East' : 'Mamelodi'} on the map.`);
                mapEl.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'center' });
            };
            const btn = $('.map-go', card);
            if (btn) btn.addEventListener('click', go);
        });

        // Controls under the map
        const resetBtn = $('#map-reset');
        if (resetBtn) resetBtn.addEventListener('click', () => { fit(); say('Map reset to show all service areas.'); });

        let youMarker = null;
        const locateBtn = $('#map-locate');
        if (locateBtn) {
            if (!('geolocation' in navigator)) locateBtn.hidden = true;
            locateBtn.addEventListener('click', () => {
                say('Finding your location…');
                navigator.geolocation.getCurrentPosition(pos => {
                    const you = L.latLng(pos.coords.latitude, pos.coords.longitude);
                    if (youMarker) youMarker.remove();
                    youMarker = L.marker(you, { icon: pin('pin-you'), title: 'You are here', alt: 'Your location' }).addTo(map).bindPopup('You are here').openPopup();
                    const km = you.distanceTo(L.latLng(hub)) / 1000;
                    const inside = you.distanceTo(L.latLng(hub)) <= 2500 || you.distanceTo(L.latLng(east)) <= 2500;
                    map.fitBounds(L.latLngBounds([you, hub]).pad(0.4));
                    say(`You are about ${km.toFixed(1)} km from our Mamelodi hub. ${inside ? 'Good news: you are inside our service area!' : 'You are outside our usual area, but contact us and we may still be able to help.'}`);
                    if (inside) { toast('You are inside our service area!'); fx.confetti(60); }
                }, () => say('We could not get your location. You can still explore the map manually.'), { timeout: 8000 });
            });
        }
        // Leaflet needs a size refresh if its container was laid out late
        setTimeout(() => map.invalidateSize(), 300);
    }

    /* 9. FORMS */
    /** Validation rules. Each returns an error message, or '' when valid. */
    const V = {
        name: v => !v ? 'Please enter your full name.'
            : !/^[\p{L}][\p{L}\s'’.-]{1,59}$/u.test(v) ? 'Use letters only (2 to 60 characters), e.g. Thabo Mokoena.' : '',
        email: v => !v ? 'Please enter your email address.'
            : (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) ? 'That email does not look right. Try name@example.com.' : '',
        phone: (v, required) => {
            if (!v) return required ? 'Please enter your phone number.' : '';
            const digits = v.replace(/[\s\-()]/g, '');
            return /^(?:\+27|0027|0)[1-8]\d{8}$/.test(digits) ? '' : 'Enter a South African number, e.g. 012 345 6789 or +27 82 123 4567.';
        },
        select: label => v => v ? '' : `Please choose ${label}.`,
        text: (label, min, max) => v => !v ? `Please enter ${label}.`
            : v.length < min ? `Please enter at least ${min} characters.`
            : v.length > max ? `Please keep this under ${max} characters.` : '',
        quantity: v => {
            if (v === '') return 'Please enter the number of pairs.';
            const n = Number(v);
            return !Number.isInteger(n) ? 'Please use a whole number.' : (n < 1 || n > 20) ? 'We take between 1 and 20 pairs per enquiry.' : '';
        },
        date: v => {
            if (!v) return ''; // optional
            const d = parseISO(v);
            if (Number.isNaN(d.getTime())) return 'Please choose a valid date.';
            const today = startOfToday();
            const max = new Date(today); max.setDate(max.getDate() + 90);
            if (d < today) return 'That date is in the past. Please choose today or later.';
            if (d > max) return 'Please choose a date within the next 90 days.';
            if (d.getDay() === 0) return 'We are closed on Sundays. Please choose another day.';
            return '';
        },
        optionalText: max => v => v.length > max ? `Please keep this under ${max} characters.` : '',
        consent: (v, _r, checked) => checked ? '' : 'Please tick the box so we may reply to you.'
    };

    /** Attaches inline validation to a form. `fields` = [{ id, rule }]. */
    function setupValidation(form, fields, onValid) {
        form.noValidate = true; // we show our own, friendlier messages
        const summary = el('p', { class: 'form-summary', role: 'alert', hidden: true });
        form.prepend(summary);

        const entries = fields.map(f => {
            const input = document.getElementById(f.id);
            if (!input) return null;
            const holder = input.closest('.choice') || input;
            const error = el('p', { class: 'field-error', id: `${f.id}-error`, 'aria-live': 'polite' });
            holder.after(error);
            input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
            return { ...f, input, error, touched: false };
        }).filter(Boolean);

        const valueOf = en => en.input.type === 'checkbox' ? en.input.checked : en.input.value.trim();
        function check(en, show = true) {
            const val = valueOf(en);
            const msg = en.rule(en.input.type === 'checkbox' ? '' : val, en.required, en.input.checked) || '';
            if (show) {
                en.error.textContent = msg;
                en.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
                en.input.classList.toggle('is-invalid', !!msg);
                en.input.classList.toggle('is-valid', !msg && (en.input.type === 'checkbox' ? en.input.checked : val !== ''));
            }
            return msg;
        }
        entries.forEach(en => {
            const evt = en.input.tagName === 'SELECT' || en.input.type === 'checkbox' || en.input.type === 'date' ? 'change' : 'input';
            en.input.addEventListener('blur', () => { en.touched = true; check(en); });
            en.input.addEventListener(evt, () => { if (en.touched || en.input.classList.contains('is-invalid')) check(en); en.touched = true; });
        });

        // Live character counters
        $$('textarea[maxlength]', form).forEach(ta => {
            const c = el('p', { class: 'char-count', 'aria-hidden': 'true' });
            ta.after(c);
            const upd = () => { c.textContent = `${ta.value.length} / ${ta.maxLength}`; c.classList.toggle('is-near', ta.value.length > ta.maxLength * 0.9); };
            ta.addEventListener('input', upd); upd();
            form.addEventListener('reset', () => setTimeout(upd));
        });

        form.addEventListener('reset', () => {
            summary.hidden = true;
            entries.forEach(en => { en.error.textContent = ''; en.touched = false; en.input.classList.remove('is-invalid', 'is-valid'); en.input.removeAttribute('aria-invalid'); });
        });

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const bad = entries.filter(en => { en.touched = true; return check(en); });
            if (bad.length) {
                summary.textContent = `Please fix ${bad.length} ${bad.length === 1 ? 'field' : 'fields'} before sending.`;
                summary.hidden = false;
                bad[0].input.focus();
                if (motionOK()) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
                return;
            }
            summary.hidden = true;
            const btn = $('input[type="submit"]', form);
            const original = btn ? btn.value : '';
            if (btn) { btn.disabled = true; btn.value = 'Sending…'; }
            try { await onValid(); }
            finally { if (btn) { btn.disabled = false; btn.value = original; } }
        });
        return { check, entries };
    }

    /* ---- Quote + availability calculators (enquiry form) ---- */
    function calcQuote({ service, qty, addons, delivery }) {
        const s = serviceById(service);
        if (!s || !qty) return null;
        const lines = [{ label: `${s.name} × ${qty}`, amount: s.price * qty }];
        let cleaning = s.price * qty;
        const addonTotal = addons.reduce((sum, a) => sum + (ADDONS[a] ? ADDONS[a].price * qty : 0), 0);
        addons.forEach(a => { if (ADDONS[a]) lines.push({ label: `${ADDONS[a].label} × ${qty}`, amount: ADDONS[a].price * qty }); });
        const rate = qty >= 5 ? 0.15 : qty >= 3 ? 0.10 : 0;
        const discount = Math.round((cleaning + addonTotal) * rate);
        if (discount) lines.push({ label: `Multi-pair discount (${rate * 100}%)`, amount: -discount });
        const deliveryFee = (DELIVERY[delivery] || DELIVERY.dropoff).price;
        if (deliveryFee) lines.push({ label: DELIVERY[delivery].label, amount: deliveryFee });
        return { service: s, lines, total: cleaning + addonTotal - discount + deliveryFee, discount };
    }

    function addWorkingDays(date, n) {
        const d = new Date(date);
        while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) n--; } // we do not work Sundays
        return d;
    }
    function nextOpenDay(from) {
        const d = new Date(from); d.setDate(d.getDate() + 1);
        if (d.getDay() === 0) d.setDate(d.getDate() + 1);
        return d;
    }
    function calcAvailability({ service, qty, date }) {
        const s = serviceById(service);
        const start = date ? parseISO(date) : nextOpenDay(startOfToday());
        let days = s.days + (qty >= 5 ? 1 : 0);
        const ready = addWorkingDays(start, days);
        let status, note;
        if (date && start.getDay() === 6) { status = 'Limited'; note = 'Saturdays fill up fast. We will confirm your slot by email.'; }
        else if (date) { status = 'Available'; note = 'We have space on your preferred date.'; }
        else { status = 'Available'; note = `No date chosen, so the earliest drop-off is ${fmtDate(start)}.`; }
        return { status, note, start, ready, days };
    }

    /* ---- AJAX submit (Netlify Forms compatible) ---- */
    async function submitAjax(form) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), CONFIG.ajaxTimeout);
        try {
            const body = new URLSearchParams(new FormData(form)).toString();
            const res = await fetch(form.getAttribute('action') || '/', {
                method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: ctrl.signal
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
        } finally { clearTimeout(timer); }
    }

    /* ---- Enquiry page ---- */
    function initEnquiryForm() {
        const form = $('#enquiry-form');
        if (!form) return;

        // Only allow today onwards in the date picker (validation also checks this)
        const dateInput = $('#date');
        if (dateInput) { dateInput.min = isoDate(startOfToday()); }

        const required = true;
        setupValidation(form, [
            { id: 'fullname', rule: V.name },
            { id: 'email', rule: V.email },
            { id: 'phone', rule: V.phone, required },
            { id: 'service', rule: V.select('a service') },
            { id: 'shoes', rule: V.text('the type of footwear', 2, 60) },
            { id: 'quantity', rule: V.quantity },
            { id: 'date', rule: V.date },
            { id: 'message', rule: V.optionalText(500) },
            { id: 'consent', rule: V.consent }
        ], async () => {
            if (($('[name="bot-field"]', form) || {}).value) return; // honeypot: a bot filled the hidden field
            const data = readEnquiry();
            const q = calcQuote(data), av = calcAvailability(data);
            let delivered = true;
            try { await submitAjax(form); } catch (err) { delivered = false; }
            showResponse(data, q, av, delivered);
        });

        function readEnquiry() {
            return {
                name: $('#fullname').value.trim(), email: $('#email').value.trim(), phone: $('#phone').value.trim(),
                service: $('#service').value, shoes: $('#shoes').value.trim(), qty: parseInt($('#quantity').value, 10) || 0,
                date: $('#date').value, message: $('#message').value.trim(),
                addons: $$('input[name="addons"]:checked', form).map(i => i.value),
                delivery: ($('input[name="delivery"]:checked', form) || {}).value || 'dropoff'
            };
        }

        // Live estimate under the form fields
        const live = el('div', { class: 'quote-live', role: 'status', 'aria-live': 'polite' });
        const submitRow = $('input[type="submit"]', form);
        if (submitRow) submitRow.before(live);
        function updateLive() {
            const d = readEnquiry(), q = calcQuote(d);
            live.replaceChildren();
            if (!q) { live.append(el('span', { text: 'Choose a service and number of pairs to see an instant estimate.' })); return; }
            live.append(el('span', { text: 'Estimated total: ' }), el('strong', { text: rand(q.total) }));
            if (q.discount) live.append(el('span', { class: 'quote-save', text: ` (you save ${rand(q.discount)})` }));
        }
        form.addEventListener('input', updateLive);
        form.addEventListener('change', updateLive);
        form.addEventListener('reset', () => setTimeout(updateLive));

        // Pre-select a service when arriving from a "Enquire" button (?service=deep-clean)
        const preset = new URLSearchParams(location.search).get('service');
        if (preset && serviceById(preset)) {
            $('#service').value = preset;
            toast(`${serviceById(preset).name} pre-selected for you.`);
        }
        updateLive();

        function showResponse(d, q, av, delivered) {
            const box = $('#enquiry-response');
            const ref = `SR-${isoDate(new Date()).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            const first = d.name.split(/\s+/)[0];
            const table = el('table', { class: 'quote-table' },
                el('caption', { class: 'sr-only', text: 'Your quote breakdown' }),
                el('tbody', {}, q.lines.map(l => el('tr', {}, el('th', { scope: 'row', text: l.label }), el('td', { text: l.amount < 0 ? `−${rand(-l.amount)}` : rand(l.amount) })))),
                el('tfoot', {}, el('tr', {}, el('th', { scope: 'row', text: 'Estimated total' }), el('td', { text: rand(q.total) }))));
            box.replaceChildren(
                el('p', { class: 'eyebrow-lite', text: `Reference ${ref}` }),
                el('h2', { id: 'response-title', text: `Thank you, ${first}! Here is your quote.` }),
                el('p', { text: `We received your enquiry for ${d.qty} pair${d.qty > 1 ? 's' : ''} of ${d.shoes}.` }),
                table,
                el('div', { class: 'availability' },
                    el('p', {}, el('strong', { text: `Availability: ${av.status}` }), ` — ${av.note}`),
                    el('p', {}, el('strong', { text: 'Estimated ready date: ' }), fmtDate(av.ready), ` (about ${av.days} working days)`)),
                el('p', { text: `We will confirm everything by email at ${d.email} within one business day. Prices are estimates and may change after we assess your shoes.` }),
                delivered ? null : el('p', { class: 'form-note', text: 'Demo mode: this copy of the site is not connected to a form server, so your details were not stored. Your quote above is still valid.' }),
                el('div', { class: 'response-actions' },
                    el('button', { type: 'button', class: 'btn btn-solid', text: 'Print or save quote', onclick: () => window.print() }),
                    el('button', { type: 'button', class: 'btn btn-ghost', text: 'Make another enquiry', onclick: () => { box.hidden = true; form.hidden = false; form.reset(); $('#fullname').focus(); } })));
            box.hidden = false;
            form.hidden = true;
            box.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
            box.focus({ preventScroll: true });
            fx.confetti();
            toast('Enquiry sent! Check your quote below.');
            form.reset();
        }
    }

    /* ---- Contact page: validate, compile an email, let the visitor send it ---- */
    function initContactForm() {
        const form = $('#contact-form');
        if (!form) return;

        setupValidation(form, [
            { id: 'name', rule: V.name },
            { id: 'contact-email', rule: V.email },
            { id: 'contact-phone', rule: V.phone, required: false },
            { id: 'subject', rule: V.select('a message type') },
            { id: 'contact-message', rule: V.text('your message', 10, 1000) }
        ], async () => {
            if (($('[name="bot-field"]', form) || {}).value) return; // honeypot
            const typeSel = $('#subject');
            const data = {
                name: $('#name').value.trim(), email: $('#contact-email').value.trim(), phone: $('#contact-phone').value.trim(),
                type: typeSel.options[typeSel.selectedIndex].text, message: $('#contact-message').value.trim()
            };
            await wait(400);
            showEmail(data);
        });

        function buildEmail(d) {
            const subject = `${d.type}: message from ${d.name}`;
            const body = [
                'Hi SOLE REVIVE team,', '', d.message, '', '--- Contact details ---',
                `Name: ${d.name}`, `Email: ${d.email}`, `Phone: ${d.phone || 'Not provided'}`, `Message type: ${d.type}`, '',
                'Sent from the SOLE REVIVE website contact form.'
            ].join('\n');
            const href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            return { subject, body, href };
        }

        function showEmail(d) {
            const mail = buildEmail(d);
            const box = $('#email-preview');
            const copy = el('button', {
                type: 'button', class: 'btn btn-ghost', text: 'Copy email text',
                onclick: async () => {
                    try { await navigator.clipboard.writeText(`To: ${CONFIG.contactEmail}\nSubject: ${mail.subject}\n\n${mail.body}`); toast('Email text copied.'); }
                    catch (e) { toast('Could not copy automatically. Please select the text and copy it.'); }
                }
            });
            const send = el('a', { class: 'btn btn-solid', href: mail.href, text: 'Open in my email app' });
            send.addEventListener('click', () => { toast('Opening your email app…'); });
            box.replaceChildren(
                el('h2', { id: 'preview-title', text: 'Your email is ready to send' }),
                el('p', { text: 'We have put your message into an email. Check it below, then send it from your email app.' }),
                el('dl', { class: 'email-meta' },
                    el('dt', { text: 'To' }), el('dd', { text: CONFIG.contactEmail }),
                    el('dt', { text: 'Subject' }), el('dd', { text: mail.subject })),
                el('pre', { class: 'email-body', text: mail.body }),
                mail.href.length > 1900 ? el('p', { class: 'form-note', text: 'Your message is long, so some email apps may cut it off. Use "Copy email text" if that happens.' }) : null,
                el('div', { class: 'response-actions' }, send, copy,
                    el('button', { type: 'button', class: 'btn btn-ghost', text: 'Edit message', onclick: () => { box.hidden = true; form.hidden = false; $('#contact-message').focus(); } })));
            box.hidden = false;
            form.hidden = true;
            box.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
            box.focus({ preventScroll: true });
            fx.confetti(90);
            toast('Message ready! Press "Open in my email app".');
        }
    }

    /* =================================================================
       10. START-UP
       ================================================================= */
    function init() {
        document.documentElement.classList.add('js');
        initScrollEffects();
        initReveal();
        initTilt();
        initButtonEffects();
        initCursorTrail();
        initPageTransitions();
        initNavExtras();
        initKonami();
        initHeroCompare();
        initTypewriter();
        initBubbles();
        initAccordions();
        initCareTips();
        initServiceFinder();
        initGallery();
        initMap();
        initEnquiryForm();
        initContactForm();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
