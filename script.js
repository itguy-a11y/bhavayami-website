/* ====================================================================
   BHAVAYAMI — script.js
   Apple-inspired interactions for the Bhavayami dance school website
   ====================================================================
   CONTENTS
     1.  Gallery data & state
     2.  Utility helpers
     3.  Navigation: scroll-aware highlight + hamburger + darkening
     4.  Gallery: build thumbnails & dots, image switching, autoplay
     5.  Scroll-reveal animations (IntersectionObserver)
     6.  Parallax on hero card
     7.  Animated stat counters
     8.  Contact form: validation + simulated submit
     9.  Keyboard navigation for gallery (← →)
    10.  Bootstrap (DOMContentLoaded)
   ==================================================================== */


/* ──────────────────────────────────────────────────────────────────── */
/*  1. GALLERY DATA                                                      */
/*     All 11 converted WebP images from images/full/ and images/thumb/ */
/* ──────────────────────────────────────────────────────────────────── */
const GALLERY_IMAGES = [
    { src: 'images/full/g01.webp',  thumb: 'images/thumb/g01.webp',  caption: 'Annual Recital 2023'     },
    { src: 'images/full/g02.webp',  thumb: 'images/thumb/g02.webp',  caption: 'Arangetram Ceremony'     },
    { src: 'images/full/g03.webp',  thumb: 'images/thumb/g03.webp',  caption: 'Varnam Performance'      },
    { src: 'images/full/g04.webp',  thumb: 'images/thumb/g04.webp',  caption: 'Tillana'                 },
    { src: 'images/full/g05.webp',  thumb: 'images/thumb/g05.webp',  caption: 'Jatiswaram'              },
    { src: 'images/full/g06.webp',  thumb: 'images/thumb/g06.webp',  caption: 'Padam'                   },
    { src: 'images/full/g07.webp',  thumb: 'images/thumb/g07.webp',  caption: 'Shlokam'                 },
    { src: 'images/full/g08.webp',  thumb: 'images/thumb/g08.webp',  caption: 'Tarangam — Brass Plate'  },
    { src: 'images/full/g09.webp',  thumb: 'images/thumb/g09.webp',  caption: 'Alarippu'                },
    { src: 'images/full/g10.webp',  thumb: 'images/thumb/g10.webp',  caption: 'Mangalam'                },
    { src: 'images/full/g11.webp',  thumb: 'images/thumb/g11.webp',  caption: 'Natya Darshan'           },
    { src: 'images/full/g14.webp',  thumb: 'images/thumb/g14.webp',  caption: 'Bhavayami Performance'   },
    { src: 'images/full/g15.webp',  thumb: 'images/thumb/g15.webp',  caption: 'Bhavayami Performance'   },
    { src: 'images/full/g16.webp',  thumb: 'images/thumb/g16.webp',  caption: 'Bhavayami Performance'   },
    { src: 'images/full/g17.webp',  thumb: 'images/thumb/g17.webp',  caption: 'Bhavayami Performance'   },
    { src: 'images/full/g18.webp',  thumb: 'images/thumb/g18.webp',  caption: 'Bhavayami Performance'   },
    { src: 'images/full/g19.webp',  thumb: 'images/thumb/g19.webp',  caption: 'Bhavayami Performance'   },
];

/* Gallery mutable state */
const gallery = {
    currentIndex:  0,
    autoplayTimer: null,
    transitioning: false,
    autoplayMs:    3200,    /* ms between automatic image advances */
};


/* ──────────────────────────────────────────────────────────────────── */
/*  2. UTILITY HELPERS                                                   */
/* ──────────────────────────────────────────────────────────────────── */

/** Clamp n between lo and hi. */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** Wrap index within [0, len). */
const wrap = (i, len) => ((i % len) + len) % len;

/** Returns true if el is at least partially in the viewport. */
function inViewport(el, threshold = 0) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight - threshold && r.bottom > threshold;
}


/* ──────────────────────────────────────────────────────────────────── */
/*  3. NAVIGATION                                                        */
/*     • Hamburger toggle                                                */
/*     • Navbar darkens after scrolling 40 px                           */
/*     • Active nav link tracks the section currently in view           */
/* ──────────────────────────────────────────────────────────────────── */
function initNav() {
    const navbar    = document.getElementById('navbar');
    const navList   = document.getElementById('navList');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.querySelectorAll('.nav-link[data-nav]');

    /* ── Hamburger toggle ── */
    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            const open = navList.classList.toggle('open');
            hamburger.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', String(open));
        });

        /* Close menu when a link is clicked */
        navList.addEventListener('click', e => {
            if (e.target.closest('.nav-link')) {
                navList.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        /* Close menu when clicking outside */
        document.addEventListener('click', e => {
            if (
                navList.classList.contains('open') &&
                !navList.contains(e.target) &&
                !hamburger.contains(e.target)
            ) {
                navList.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ── Navbar darkens on scroll ── */
    function updateNavbar() {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar(); /* run on load in case page is already scrolled */

    /* ── Active section tracking (IntersectionObserver) ── */
    if (!navLinks.length) return;

    const sections = ['home', 'gallery', 'classes', 'enroll']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(a => {
                a.classList.toggle('active', a.dataset.nav === id);
            });
        });
    }, {
        threshold: 0.25,
        rootMargin: `-${Math.floor(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64)}px 0px 0px 0px`,
    });

    sections.forEach(sec => sectionObserver.observe(sec));
}


/* ──────────────────────────────────────────────────────────────────── */
/*  4. GALLERY                                                           */
/* ──────────────────────────────────────────────────────────────────── */

/** Inject thumbnail elements into the thumb strip. */
function buildGalleryThumbs() {
    const container = document.getElementById('galleryThumbs');
    if (!container) return;
    container.innerHTML = '';

    GALLERY_IMAGES.forEach((img, i) => {
        const item = document.createElement('div');
        item.className   = 'g-thumb' + (i === 0 ? ' active' : '');
        item.role        = 'listitem';
        item.tabIndex    = 0;
        item.setAttribute('aria-label', img.caption);
        item.dataset.idx = i;

        item.innerHTML = `
            <img src="${img.thumb}" alt="${img.caption}" loading="lazy">
            <span class="g-thumb-label">${img.caption}</span>
        `;

        /* Click: switch to this image, reset autoplay */
        item.addEventListener('click', () => switchGallery(i, true));

        /* Keyboard: Enter / Space */
        item.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchGallery(i, true);
            }
        });

        container.appendChild(item);
    });
}

/** Inject dot indicator buttons below the main display. */
function buildGalleryDots() {
    const container = document.getElementById('galDots');
    if (!container) return;
    container.innerHTML = '';

    GALLERY_IMAGES.forEach((img, i) => {
        const dot = document.createElement('button');
        dot.className = 'g-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to image ${i + 1}: ${img.caption}`);
        dot.addEventListener('click', () => switchGallery(i, true));
        container.appendChild(dot);
    });
}

/**
 * switchGallery(index, resetAutoplay)
 * Crossfades the main display to the image at `index`.
 *
 * @param {number}  index         - target image index (auto-wrapped)
 * @param {boolean} resetAutoplay - if true, restart the autoplay countdown
 */
function switchGallery(index, resetAutoplay = false) {
    index = wrap(index, GALLERY_IMAGES.length);

    /* Ignore rapid clicks during transition */
    if (gallery.transitioning || index === gallery.currentIndex) {
        /* Still restart autoplay if user clicked */
        if (resetAutoplay) { stopGalleryAutoplay(); startGalleryAutoplay(); }
        return;
    }

    const data    = GALLERY_IMAGES[index];
    const mainImg = document.getElementById('mainGalleryImg');
    const caption = document.getElementById('displayCaption');

    if (!mainImg) return;
    gallery.transitioning = true;

    /* Phase 1: fade OUT */
    mainImg.classList.add('fading');

    setTimeout(() => {
        /* Swap source */
        mainImg.src = data.src;
        mainImg.alt = data.caption;
        if (caption) caption.textContent = data.caption;

        /* Phase 2: fade IN (browser paints new src, then we remove .fading) */
        requestAnimationFrame(() => {
            mainImg.classList.remove('fading');
            setTimeout(() => { gallery.transitioning = false; }, 500);
        });
    }, 320);

    /* Sync thumbnails */
    document.querySelectorAll('.g-thumb').forEach((el, i) =>
        el.classList.toggle('active', i === index));

    /* Sync dots */
    document.querySelectorAll('.g-dot').forEach((el, i) =>
        el.classList.toggle('active', i === index));

    gallery.currentIndex = index;

    if (resetAutoplay) {
        stopGalleryAutoplay();
        startGalleryAutoplay();
    }
}

/** Start the 3.2-second autoplay loop. */
function startGalleryAutoplay() {
    stopGalleryAutoplay();
    gallery.autoplayTimer = setInterval(() => {
        switchGallery(gallery.currentIndex + 1, false);
    }, gallery.autoplayMs);
}

/** Stop autoplay. */
function stopGalleryAutoplay() {
    clearInterval(gallery.autoplayTimer);
    gallery.autoplayTimer = null;
}

/** Wire up prev/next arrow buttons. */
function initGalleryArrows() {
    const prev = document.getElementById('galPrev');
    const next = document.getElementById('galNext');
    if (prev) prev.addEventListener('click', () => switchGallery(gallery.currentIndex - 1, true));
    if (next) next.addEventListener('click', () => switchGallery(gallery.currentIndex + 1, true));
}

/** Set the first image immediately (no transition). */
function setInitialGalleryImage() {
    const mainImg = document.getElementById('mainGalleryImg');
    const caption = document.getElementById('displayCaption');
    if (mainImg && GALLERY_IMAGES[0]) {
        mainImg.src = GALLERY_IMAGES[0].src;
        mainImg.alt = GALLERY_IMAGES[0].caption;
    }
    if (caption && GALLERY_IMAGES[0]) {
        caption.textContent = GALLERY_IMAGES[0].caption;
    }
}

/** Full gallery initialisation entry-point. */
function initGallery() {
    buildGalleryThumbs();
    buildGalleryDots();
    setInitialGalleryImage();
    initGalleryArrows();
    startGalleryAutoplay();

    /*
       Pause autoplay when the gallery is not visible to avoid
       cycling images the user can't see (saves CPU).
    */
    const gallerySection = document.getElementById('gallery');
    if (gallerySection && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) startGalleryAutoplay();
            else                      stopGalleryAutoplay();
        }, { threshold: 0.1 }).observe(gallerySection);
    }
}


/* ──────────────────────────────────────────────────────────────────── */
/*  5. SCROLL-REVEAL                                                     */
/*     Elements with [data-reveal] animate in when they enter view.     */
/* ──────────────────────────────────────────────────────────────────── */
let revealObserver = null;

function initScrollReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    /* Fallback for browsers without IntersectionObserver */
    if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('revealed'));
        return;
    }

    revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target); /* animate once */
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -44px 0px' });

    els.forEach(el => revealObserver.observe(el));
}




/* ──────────────────────────────────────────────────────────────────── */
/*  7. ANIMATED STAT COUNTERS                                           */
/*     Numbers count up from 0 when they scroll into view.              */
/* ──────────────────────────────────────────────────────────────────── */
function initStatCounters() {
    const statEls = document.querySelectorAll('.stat-num[data-count]');
    if (!statEls.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* If user prefers no motion, just set the final values */
    if (prefersReduced) {
        statEls.forEach(el => { el.textContent = el.dataset.count; });
        return;
    }

    /**
     * countUp(el, target, durationMs)
     * Animates a number from 0 → target over durationMs with ease-out.
     */
    function countUp(el, target, durationMs) {
        const start = performance.now();
        function frame(now) {
            const progress = clamp((now - start) / durationMs, 0, 1);
            /* Ease-out cubic */
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) {
        statEls.forEach(el => { el.textContent = el.dataset.count; });
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.count, 10);
            countUp(el, target, 1600);
            observer.unobserve(el);
        });
    }, { threshold: 0.55 });

    statEls.forEach(el => observer.observe(el));
}


/* ──────────────────────────────────────────────────────────────────── */
/*  8. CONTACT FORM                                                      */
/*     Client-side validation + simulated submission (replace the       */
/*     setTimeout with a real fetch() / EmailJS / Formspree call).      */
/* ──────────────────────────────────────────────────────────────────── */
function initContactForm() {
    const form       = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');
    const submitBtn  = document.getElementById('submitBtn');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        /* Collect values */
        const name  = form.cName.value.trim();
        const email = form.cEmail.value.trim();
        const phone = form.cPhone.value.trim();

        /* Simple validation */
        let valid = true;

        [
            { el: form.cName,  val: name },
            { el: form.cEmail, val: email },
            { el: form.cPhone, val: phone },
        ].forEach(({ el, val }) => {
            if (!val) {
                valid = false;
                el.classList.add('error');
                /* Remove error styling once the user starts typing */
                el.addEventListener('input', () => el.classList.remove('error'), { once: true });
            }
        });

        /* Basic email format check */
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            valid = false;
            form.cEmail.classList.add('error');
        }

        if (!valid) return;

        /* Show loading state on button */
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-label').textContent = 'Sending…';

        /*
         * ── Replace this setTimeout with your real API call, e.g.: ──
         *
         *   fetch('/api/contact', {
         *     method: 'POST',
         *     headers: { 'Content-Type': 'application/json' },
         *     body: JSON.stringify({ name, email, phone }),
         *   })
         *   .then(() => showSuccess())
         *   .catch(() => { submitBtn.disabled = false; ... });
         */
        setTimeout(() => {
            form.style.display = 'none';
            if (successMsg) {
                successMsg.removeAttribute('hidden');
            }
        }, 1500);
    });
}


/* ──────────────────────────────────────────────────────────────────── */
/*  9. KEYBOARD NAVIGATION (Gallery)                                     */
/*     Arrow keys ← → move through gallery images while the gallery     */
/*     section is scrolled into view.                                   */
/* ──────────────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
    const galSection = document.getElementById('gallery');
    if (!galSection || !inViewport(galSection, 80)) return;

    if (e.key === 'ArrowRight') {
        e.preventDefault();
        switchGallery(gallery.currentIndex + 1, true);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        switchGallery(gallery.currentIndex - 1, true);
    }
});


/* ──────────────────────────────────────────────────────────────────── */
/* 10. BOOTSTRAP                                                         */
/*     Initialise every module once the DOM is fully parsed.            */
/* ──────────────────────────────────────────────────────────────────── */
/*  HERO SLIDESHOW                                                       */
/*  Crossfade between hero photos every 4 s with Ken-Burns zoom.        */
/* ──────────────────────────────────────────────────────────────────── */
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;

    let current = 0;

    function next() {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }

    /* Switch every 4 000 ms */
    setInterval(next, 4000);
}

/* ──────────────────────────────────────────────────────────────────── */
/*  STORY SLIDESHOW                                                     */
/*  Elegant crossfade + Ken-Burns between story photos every 5 s.      */
/* ──────────────────────────────────────────────────────────────────── */
function initStorySlideshow() {
    const slides = document.querySelectorAll('.story-slide');
    if (!slides.length) return;

    let current = 0;

    function next() {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }

    /* Switch every 5 000 ms — slightly slower than hero for a calm feel */
    setInterval(next, 5000);
}

/* ──────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initNav();            /* Navigation: hamburger, scroll-darken, active link */
    initGallery();        /* Gallery: thumbs, dots, autoplay, arrows            */
    initScrollReveal();   /* Scroll-triggered reveal animations                 */
    initStatCounters();   /* Animated stat counter numbers                      */
    initContactForm();    /* Contact form validation & submit                   */
    initHeroSlideshow();  /* Hero photo crossfade slideshow                     */
    initStorySlideshow(); /* Our Story section photo crossfade slideshow        */
});
