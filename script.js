
(function () {
    'use strict';

    const root = document.documentElement;
    root.classList.add('js');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touchOrSmall = () => window.matchMedia('(max-width: 1023.98px)').matches;


    const header = document.getElementById('navbarHeader');
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        if (header) header.classList.toggle('scrolled', y > 40);
        lastY = y;
        ticking = false;
        spyActive();
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });


    const toggle = document.getElementById('menuToggle');
    const panel = document.getElementById('mobileMenu');
    const scrim = document.getElementById('menuScrim');
    const body = document.body;
    let scrollbarGap = 0;

    function setMenu(open) {
        if (!toggle || !panel) return;
        if (open === isMenuOpen()) return;

        if (open) {
            scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
            if (scrollbarGap > 0) body.style.paddingRight = scrollbarGap + 'px';
            body.classList.add('menu-open');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close menu');
        } else {
            body.classList.remove('menu-open');
            panel.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open menu');
            window.setTimeout(function () { body.style.paddingRight = ''; }, 320);
        }
    }

    function isMenuOpen() {
        return body.classList.contains('menu-open');
    }

    if (toggle && panel) {
        toggle.addEventListener('click', function () { setMenu(!isMenuOpen()); });
        if (scrim) scrim.addEventListener('click', function () { setMenu(false); });

        panel.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function () { setMenu(false); });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isMenuOpen()) {
                setMenu(false);
                if (toggle) toggle.focus();
            }
            /* simple focus trap while the panel is open */
            if (e.key === 'Tab' && isMenuOpen()) {
                const focusables = panel.querySelectorAll('a[href], button');
                const all = [toggle].concat(Array.prototype.slice.call(focusables));
                const first = all[0];
                const last = all[all.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });


        let startX = null;
        panel.addEventListener('touchstart', function (e) {
            startX = e.changedTouches[0].clientX;
        }, { passive: true });
        panel.addEventListener('touchend', function (e) {
            if (startX === null) return;
            if (e.changedTouches[0].clientX - startX > 70) setMenu(false);
            startX = null;
        }, { passive: true });
    }

    window.addEventListener('resize', function () {
        if (!touchOrSmall() && isMenuOpen()) setMenu(false);
    });

    document.querySelectorAll('#navbarHeader a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
    });

    const revealGroups = [
        {
            selector: '#introduction',
            targets: ['#introTitle', '#introDesc', '#explore'],
            cls: 'show'
        },
        {
            selector: '#introInfo',
            targets: ['#rightContent', '#leftContent'],
            cls: 'animation'
        },
        {
            selector: '#works',
            targets: ['.workTitle', '.workProjects'],
            cls: 'animation'
        },
        {
            selector: '#services',
            targets: ['.serviceTitle', '.card1', '.card2', '.card3', '.card4'],
            cls: 'animation cardAnimate'
        },
        {
            selector: '#contact',
            targets: ['.contactTitle', '.contactDesc', '.contactBtn', '.contactLower'],
            cls: 'animation contactAnimate'
        }
    ];

    function reveal(group) {
        group.targets.forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) {
                group.cls.split(' ').forEach(function (c) { el.classList.add(c); });
            });
        });
    }

    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const group = revealGroups.find(function (g) { return g.selector === '#' + entry.target.id; });
                if (group) reveal(group);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

        revealGroups.forEach(function (group) {
            const section = document.querySelector(group.selector);
            if (section) io.observe(section);
        });

        window.addEventListener('load', function () {
            const hero = document.getElementById('introduction');
            if (hero) {
                const rect = hero.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    const g = revealGroups[0];
                    g.targets.forEach(function (sel) {
                        const el = document.querySelector(sel);
                        if (el) setTimeout(function () { el.classList.add('show'); }, 120);
                    });
                }
            }
        });
    } else {
        revealGroups.forEach(reveal);
    }

    const sections = ['introInfo', 'works', 'services', 'contact']
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);

    const navAnchors = document.querySelectorAll('.navbarLinks a, .menuLink');

    function spyActive() {
        if (!sections.length) return;
        const mark = window.scrollY + window.innerHeight * 0.36;
        let currentId = '';
        sections.forEach(function (s) {
            if (s.offsetTop <= mark) currentId = s.id;
        });
        navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
        });
    }

    document.querySelectorAll('[data-url]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const url = btn.getAttribute('data-url');
            if (!url) return;
            if (url.indexOf('mailto:') === 0) {
                window.location.href = url;
            } else {
                window.open(url, '_self', 'noopener');
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const offset = (header ? header.offsetHeight : 0) + 12;
            const top = target.getBoundingClientRect().top + window.scrollY - (id === '#introduction' ? 0 : offset);
            window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    });

    onScroll();
})();
