/* ============================================
   HALDER HARDWARE & SANITARY
   Canva-Style Horizontal Slide Engine
   ============================================ */

// ---- SLIDE CONFIG ----
const SLIDE_IDS   = ['home', 'about', 'products', 'services', 'contact'];
const SLIDE_NAMES = ['Home', 'About', 'Products', 'Services', 'Contact'];
const TOTAL       = SLIDE_IDS.length;
let   currentSlide = 0;
let   isAnimating  = false;

// ---- DOM REFS ----
const html            = document.documentElement;
const slidesContainer = document.querySelector('.slides-container');
const slides          = document.querySelectorAll('.slide');
const navLinks        = document.querySelectorAll('.nav-link');
const prevBtn         = document.getElementById('prevSlide');
const nextBtn         = document.getElementById('nextSlide');
const slideCounter    = document.getElementById('slideCounter');
const dotsContainer   = document.querySelector('.slide-dots');

// ---- THEME ----
const themeToggle = document.getElementById('themeToggle');
const savedTheme  = localStorage.getItem('halderTheme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle && themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('halderTheme', next);
});

// ---- BUILD SLIDE DOTS ----
function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    SLIDE_NAMES.forEach((name, i) => {
        const dot = document.createElement('button');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to ${name}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
}
buildDots();

// ---- GO TO SLIDE ----
function goToSlide(index, skipAnim = false) {
    if (isAnimating && !skipAnim) return;
    if (index < 0 || index >= TOTAL) return;

    const prev = currentSlide;
    currentSlide = index;
    isAnimating = true;

    // Translate the container
    slidesContainer.style.transform = `translateX(-${index * (100 / TOTAL)}%)`;

    // Update active states
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    navLinks.forEach(l => {
        l.classList.toggle('active',
            l.getAttribute('href') === `#${SLIDE_IDS[index]}`);
    });

    // Dots
    document.querySelectorAll('.slide-dot').forEach((d, i) =>
        d.classList.toggle('active', i === index));

    // Counter
    if (slideCounter)
        slideCounter.textContent = `${index + 1} / ${TOTAL}`;

    // Buttons
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) nextBtn.disabled = (index === TOTAL - 1);

    // Reset scroll position of the new slide to top
    slides[index].scrollTop = 0;

    // Trigger entrance animations on the newly active slide
    triggerSlideAnimations(slides[index]);

    // Run counters on hero if going to slide 0
    if (index === 0) startCounters();

    // Release animation lock after transition
    setTimeout(() => { isAnimating = false; }, 700);
}

// ---- TRIGGER ENTRANCE ANIMATIONS ----
function triggerSlideAnimations(slide) {
    // Reset all data-animate children
    slide.querySelectorAll('[data-animate]').forEach(el => {
        el.classList.remove('in-view');
    });
    // Short delay then reveal
    requestAnimationFrame(() => {
        setTimeout(() => {
            slide.querySelectorAll('[data-animate]').forEach(el => {
                el.classList.add('in-view');
            });
        }, 120);
    });
}

// ---- COUNTER ANIMATION (Hero stats) ----
function animateCounter(el, target, duration = 1800) {
    let start = null;
    const suffix = el.dataset.suffix || '+';
    const step = ts => {
        if (!start) start = ts;
        const prog  = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

let countersRan = false;
function startCounters() {
    if (countersRan) return;
    countersRan = true;
    const statNums = document.querySelectorAll('.stat-number');
    const targets  = [500, 1000, 10];
    statNums.forEach((el, i) => animateCounter(el, targets[i]));
}

// ---- NAVIGATION CONTROLS ----
prevBtn && prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn && nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// ---- KEYBOARD ARROWS ----
document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        goToSlide(currentSlide + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')
        goToSlide(currentSlide - 1);
});

// ---- NAV LINK CLICK → SLIDE ----
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href'); // e.g. "#about"
        const idx  = SLIDE_IDS.indexOf(href.replace('#', ''));
        if (idx !== -1) goToSlide(idx);

        // Close mobile menu
        const navMenu = document.getElementById('navLinks');
        navMenu && navMenu.classList.remove('open');
        resetHamburger();
    });
});

// ---- INTERNAL ANCHOR CLICKS (e.g. hero buttons) ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.classList.contains('nav-link')) return; // handled above
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        const idx  = SLIDE_IDS.indexOf(href.replace('#', ''));
        if (idx !== -1) goToSlide(idx);
    });
});

// ---- TOUCH SWIPE SUPPORT ----
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only swipe horizontal if dx is dominant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) goToSlide(currentSlide + 1);
        else        goToSlide(currentSlide - 1);
    }
}, { passive: true });

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navLinks');

hamburger && hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    updateHamburger(navMenu.classList.contains('open'));
});

function updateHamburger(open) {
    const spans = hamburger.querySelectorAll('span');
    if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        resetHamburger();
    }
}

function resetHamburger() {
    if (!hamburger) return;
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
}

// ---- HERO PARTICLES ----
function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    const count = 18;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 6 + 2;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 14 + 8}s;
            animation-delay: ${Math.random() * 8}s;
            opacity: ${Math.random() * 0.12 + 0.03};
        `;
        container.appendChild(p);
    }
}
createParticles();

// ---- MARQUEE PAUSE ON HOVER ----
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () =>
        { marqueeTrack.style.animationPlayState = 'paused'; });
    marqueeTrack.addEventListener('mouseleave', () =>
        { marqueeTrack.style.animationPlayState = 'running'; });
}

// ---- FLOATING WHATSAPP SHOW/HIDE ----
// Always visible on desktop; only hide initially
const floatWA = document.getElementById('float-whatsapp');
if (floatWA) {
    // Fade in after a short delay
    floatWA.style.opacity = '0';
    setTimeout(() => {
        floatWA.style.transition = 'opacity 0.6s ease';
        floatWA.style.opacity = '1';
    }, 1200);
}

// ---- INIT ----
// Set initial state (slide 0 active)
goToSlide(0, true);

// Trigger counter on first load
startCounters();

console.log('✅ Halder Hardware — Canva-style slide engine loaded.');
