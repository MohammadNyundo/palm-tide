// ============================================================
// PALM & TIDE — hero behavior
// Structural JS only. Booking/contact/form logic to be added
// alongside their respective sections.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setTimeOfDay = () => {
    const hour = new Date().getHours();
    let period = 'afternoon';
    if (hour >= 5 && hour < 11) period = 'morning';
    else if (hour >= 11 && hour < 16) period = 'afternoon';
    else if (hour >= 16 && hour < 19) period = 'evening';
    else period = 'night';
    document.documentElement.setAttribute('data-time-of-day', period);
  };
  setTimeOfDay();

  // ---------------------------------------------------------
  // Nav: solid + blurred once the hero has been scrolled past.
  // ---------------------------------------------------------
  const nav = document.getElementById('siteNav');
  const onNavScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

  // ---------------------------------------------------------
  // Full-screen menu overlay.
  // ---------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const menuOverlay = document.getElementById('menuOverlay');

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    document.body.classList.add('menu-open');
    nav.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
  };

  menuToggle.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
  });

  menuOverlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // ---------------------------------------------------------
  // Scroll cue — the hero no longer hands its bottom strip off to
  // About via a scroll-linked transform (that trick is what buried
  // the anchor and the foam in the first place). The anchor now just
  // carries the visitor down to the tide transition that follows it.
  // ---------------------------------------------------------
  const scrollCue = document.getElementById('scrollCue');
  const heroToAbout = document.getElementById('heroToAbout');

  if (scrollCue && heroToAbout) {
    scrollCue.addEventListener('click', () => {
      heroToAbout.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // ---------------------------------------------------------
  // Stories From The Journey — a quiet auto-advancing rotator.
  // ---------------------------------------------------------
  const storyRotator = document.getElementById('storyRotator');
  const storyDots = document.getElementById('storyDots');

  if (storyRotator && storyDots) {
    const quotes = Array.from(storyRotator.querySelectorAll('[data-story]'));
    const dots = Array.from(storyDots.querySelectorAll('[data-story-dot]'));
    let activeIndex = 0;
    let timer = null;

    const showStory = (index) => {
      quotes[activeIndex].classList.remove('is-active');
      dots[activeIndex].classList.remove('is-active');
      dots[activeIndex].setAttribute('aria-selected', 'false');

      activeIndex = index;

      quotes[activeIndex].classList.add('is-active');
      dots[activeIndex].classList.add('is-active');
      dots[activeIndex].setAttribute('aria-selected', 'true');
    };

    const startAutoAdvance = () => {
      if (prefersReducedMotion) return;
      clearInterval(timer);
      timer = setInterval(() => {
        showStory((activeIndex + 1) % quotes.length);
      }, 6000);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showStory(index);
        startAutoAdvance();
      });
    });

    startAutoAdvance();
  }

  // ---------------------------------------------------------
  // Footer year.
  // ---------------------------------------------------------
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  // ---------------------------------------------------------
  // Sections emerge from the shoreline as they enter view.
  // ---------------------------------------------------------
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
});