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
  // Menu drawer: toggle button, scrim click, in-menu link
  // clicks, and Escape all close it.
  // ---------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuScrim = document.getElementById('menuScrim');

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

  if (menuScrim) {
    menuScrim.addEventListener('click', closeMenu);
  }

  menuOverlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // ---------------------------------------------------------
  // Scroll cue — carries the visitor down to the tide transition
  // that follows the hero.
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

  // ---------------------------------------------------------
  // Adventure page — day-by-day itinerary accordion (only runs
  // if the markup exists on this page).
  // ---------------------------------------------------------
  const itineraryDays = document.querySelectorAll('.itinerary-day');
  if (itineraryDays.length) {
    itineraryDays.forEach((day, index) => {
      const trigger = day.querySelector('.itinerary-day-trigger');
      if (!trigger) return;
      if (index === 0) day.classList.add('is-open');
      trigger.addEventListener('click', () => {
        const isOpen = day.classList.contains('is-open');
        itineraryDays.forEach((d) => d.classList.remove('is-open'));
        if (!isOpen) day.classList.add('is-open');
      });
    });
  }

  // ---------------------------------------------------------
  // Lazy-loaded background images — mosaic cards on the "What
  // We Offer" grid use CSS background-image rather than <img>,
  // so native loading="lazy" can't reach them. This defers the
  // actual image fetch until each card is about to enter view.
  // ---------------------------------------------------------
  const lazyBgEls = document.querySelectorAll('.lazy-bg');

  if (lazyBgEls.length) {
    const applyBg = (el) => {
      const src = el.getAttribute('data-bg');
      if (!src) return;
      el.style.backgroundImage = `url('${src}')`;
      el.classList.add('bg-loaded');
    };

    if ('IntersectionObserver' in window) {
      const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            applyBg(entry.target);
            bgObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px 0px' });

      lazyBgEls.forEach((el) => bgObserver.observe(el));
    } else {
      lazyBgEls.forEach(applyBg);
    }
  }

  // ---------------------------------------------------------
  // Begin Your Journey — 3-step modal.
  // Handles open/close, step navigation with validation,
  // the step-3 summary, and the Formspree submission.
  // ---------------------------------------------------------
  const journeyModal = document.getElementById('journeyModal');

  if (journeyModal) {
    const journeyForm = document.getElementById('journeyForm');
    const journeySteps = Array.from(journeyModal.querySelectorAll('.journey-step'));
    const progressSteps = Array.from(journeyModal.querySelectorAll('.journey-progress-step'));
    const progressLines = Array.from(journeyModal.querySelectorAll('.journey-progress-line'));
    const journeySummary = document.getElementById('journeySummary');
    const journeySuccess = document.getElementById('journeySuccess');
    const journeySubmit = document.getElementById('journeySubmit');
    const closeButtons = journeyModal.querySelectorAll('#journeyModalClose, .journey-btn-close-success');

    let currentStep = 1;
    let lastFocusedEl = null;

    const setStep = (step) => {
      currentStep = step;

      journeySteps.forEach((el) => {
        el.classList.toggle('is-active', Number(el.dataset.step) === step);
      });

      progressSteps.forEach((el) => {
        const stepNum = Number(el.dataset.progress);
        el.classList.toggle('is-active', stepNum === step);
        el.classList.toggle('is-complete', stepNum < step);
      });

      progressLines.forEach((el, index) => {
        el.classList.toggle('is-complete', index < step - 1);
      });

      // Move focus to the new step's heading for accessibility.
      const activeStep = journeySteps.find((el) => Number(el.dataset.step) === step);
      const heading = activeStep && activeStep.querySelector('.journey-step-title');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }

      if (step === 3) buildSummary();
    };

    const validateStep = (step) => {
      const stepEl = journeySteps.find((el) => Number(el.dataset.step) === step);
      if (!stepEl) return true;
      const requiredFields = Array.from(stepEl.querySelectorAll('[required]'));

      for (const field of requiredFields) {
        if (field.type === 'radio') {
          const group = stepEl.querySelectorAll(`[name="${field.name}"]`);
          const checked = Array.from(group).some((r) => r.checked);
          if (!checked) {
            field.focus({ preventScroll: true });
            return false;
          }
        } else if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    };

    const buildSummary = () => {
      if (!journeySummary || !journeyForm) return;
      const data = new FormData(journeyForm);

      const numPeopleLabel = journeyForm.querySelector('#numPeople')?.selectedOptions[0]?.text || '—';
      const numDaysLabel = journeyForm.querySelector('#numDays')?.selectedOptions[0]?.text || '—';

      const rows = [
        ['Name', data.get('fullName') || '—'],
        ['Email', data.get('email') || '—'],
        ['Phone', data.get('phone') || '—'],
        ['Group Size', numPeopleLabel],
        ['Duration', numDaysLabel],
        ['Package Interest', data.get('packageInterest') || 'Not selected'],
        ['Accommodation Help', data.get('needAccommodation') || 'No'],
        ['Styling Help', data.get('needStyle') || 'No'],
        ['Water Sports', data.get('waterSports') || 'No'],
        ['E-Bike Ride', data.get('ebikeInterest') || 'No'],
      ];

      journeySummary.innerHTML = rows
        .map(
          ([label, value]) => `
        <div class="journey-summary-item">
          <span class="journey-summary-label">${label}</span>
          <span class="journey-summary-value">${value}</span>
        </div>`
        )
        .join('');
    };

    const openModal = () => {
      lastFocusedEl = document.activeElement;
      journeyModal.classList.add('is-open');
      journeyModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      setStep(1);
    };

    const closeModal = () => {
      journeyModal.classList.remove('is-open');
      journeyModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocusedEl) lastFocusedEl.focus({ preventScroll: true });
    };

    // Open triggers — every "Begin Your Journey" CTA on the page.
    document.querySelectorAll('[data-open-journey]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Close triggers.
    closeButtons.forEach((btn) => btn.addEventListener('click', closeModal));

    journeyModal.addEventListener('click', (e) => {
      if (e.target === journeyModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && journeyModal.classList.contains('is-open')) closeModal();
    });

    // Step navigation.
    journeyModal.querySelectorAll('[data-next]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        setStep(Number(btn.dataset.next));
      });
    });

    journeyModal.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setStep(Number(btn.dataset.back));
      });
    });

    // Submission.
    if (journeyForm) {
      journeyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        journeySubmit.classList.add('is-loading');
        journeySubmit.disabled = true;

        try {
          const response = await fetch(journeyForm.action, {
            method: 'POST',
            body: new FormData(journeyForm),
            headers: { Accept: 'application/json' },
          });

          if (response.ok) {
            journeyForm.style.display = 'none';
            journeyModal.querySelector('.journey-progress').style.display = 'none';
            journeySuccess.classList.add('is-visible');
            journeySuccess.setAttribute('aria-hidden', 'false');
          } else {
            throw new Error('Formspree submission failed');
          }
        } catch (err) {
          alert("Something went wrong sending your request — please try again, or reach us directly on WhatsApp.");
        } finally {
          journeySubmit.classList.remove('is-loading');
          journeySubmit.disabled = false;
        }
      });
    }
  }

  // ---------------------------------------------------------
  // GSAP entrance motion — the About image glides in from the
  // right after the copy has settled, "What We Offer" cards
  // reveal 01→05 in sequence, and testimonials reveal with the
  // center (signature-package) card rising into place first.
  // All three replay every time their section is re-entered,
  // scrolling down into it or back up into it from below.
  // Only runs on pages that load GSAP (currently index.html).
  // ---------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion) {
      // "Experience Kenya Differently" — the image glides in from
      // the visitor's right once the section is half scrolled into
      // view, with a short delay so the copy is read first. Replays
      // every time the section is re-entered, from either direction.
      const aboutVisual = document.querySelector('.about-visual');
      if (aboutVisual) {
        gsap.fromTo(
          aboutVisual,
          { opacity: 0, x: 64 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            delay: 0.25,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.about',
              start: 'top 50%',
              toggleActions: 'restart reverse restart reverse',
            },
          }
        );
      }

      // "What We Offer" — cards appear one by one, 01 through 05,
      // regardless of their position in the mosaic's DOM/grid order.
      // Replays each time the section is scrolled back into.
      //
      // Previously triggered off `.experiences` (the outer Four
      // Tides section, which begins with the sticky journey-strip
      // and a lot of scroll distance before the cards themselves
      // appear) at `top 15%` — that fires almost the moment the
      // section starts intersecting, well before the mosaic has
      // scrolled into view. By the time the cards were visible the
      // animation had already finished, so it read as "already
      // happened" and too fast. Triggering off the mosaic itself,
      // starting as it enters from the bottom of the viewport, and
      // slowing the tween down fixes both.
      const offerCardOrder = ['.card-wide', '.card-stack-a', '.card-square-a', '.card-square-b', '.card-stack-b'];
      const offerCards = offerCardOrder
        .map((sel) => document.querySelector(sel))
        .filter(Boolean);
      const offerMosaic = document.querySelector('.experience-mosaic');

      if (offerCards.length && offerMosaic) {
        gsap.from(offerCards, {
          opacity: 0,
          y: 40,
          duration: 1.1,
          stagger: 0.22,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: offerMosaic,
            start: 'top 80%',
            toggleActions: 'restart reverse restart reverse',
          },
        });
      }

      // "What Our Guests Say" — the center card (the 5-Day Diani
      // Adventure quote — our top-selling package) sits a level
      // higher than the other two (handled in CSS) and fades in
      // first; the two flanking cards follow just after. Opacity
      // only — no transform — on these specific cards: they hold
      // italic serif quote text, and animating transform on them
      // caused the text to render blurry mid-tween in some browsers.
      // The cards also carry a continuous ambient float in CSS
      // (shadowPulseRight / breezeFloatRight); leaving transform
      // untouched here means there's nothing for GSAP to fight it
      // over.
      //
      // Trigger point: fires as the grid enters from the bottom of
      // the viewport (`top 85%`), the same way the offer cards do —
      // well before the grid is anywhere near the sticky strip
      // pinned at the top. A previous attempt tried to time this
      // off the strip instead (firing only once the strip had
      // covered the grid by half), but that put the trigger much
      // later in the scroll — the cards stayed invisible until the
      // section had already scrolled mostly past. Entering-from-
      // below is simpler and matches what "Four Tides" already does.
      const guestGrid = document.querySelector('.guest-corner-grid');
      if (guestGrid) {
        const centerCard = guestGrid.querySelector('.guest-card:nth-child(2)');
        const sideCards = Array.from(guestGrid.querySelectorAll('.guest-card:nth-child(1), .guest-card:nth-child(3)'));

        if (centerCard) {
          gsap.fromTo(
            centerCard,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: guestGrid,
                start: 'top 85%',
                toggleActions: 'restart reverse restart reverse',
              },
            }
          );
        }

        if (sideCards.length) {
          gsap.fromTo(
            sideCards,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.9,
              delay: 0.3,
              stagger: 0.18,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: guestGrid,
                start: 'top 85%',
                toggleActions: 'restart reverse restart reverse',
              },
            }
          );
        }
      }
    }
  } else {
    // GSAP failed to load (e.g. CDN blocked) — the About image is
    // hidden by default in CSS awaiting a GSAP-driven reveal, so
    // make sure it still shows up rather than staying stuck hidden.
    const aboutVisualFallback = document.querySelector('.about-visual');
    if (aboutVisualFallback) {
      aboutVisualFallback.style.opacity = '1';
      aboutVisualFallback.style.transform = 'none';
    }
  }
});