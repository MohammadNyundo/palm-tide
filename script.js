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
  // FAQ accordion — only the question shows by default; clicking
  // reveals the full answer. Each item toggles independently
  // (unlike the itinerary accordion below, opening one doesn't
  // close the others). Shared markup/classes across every page
  // that has a FAQ section.
  // ---------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      question.setAttribute('aria-expanded', String(isOpen));
    });
  });

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
  // Things to Do in Diani — package details modal. Only runs if
  // the markup exists on this page. Card content lives here (not
  // in the HTML) so every package's copy/price/image is defined
  // once and reused by both the card face and its modal. Modelled
  // on the client's own poster layout (highlights / itinerary /
  // rates / good-to-know) — the modal leads with information, not
  // the photo, so a guest has enough to decide without leaving
  // the page.
  // ---------------------------------------------------------
  const packageModal = document.getElementById('packageModal');

  if (packageModal) {
    const PRICE_DISCLAIMER =
      'Indicative price, converted at ~KES 129 = $1 (today’s rate). Kenya’s standard 16% VAT and a typical 3% card conversion fee may apply depending on payment method — confirmed in your personalised quotation.';

    const PACKAGES = {
      '3-day': {
        formValue: 'The 3-Day Diani Escape',
        image: 'assets/images/ngalawa.jpg',
        imageAlt: 'Traditional dhow sailing the Diani coastline, Kenya',
        duration: '3 Days / 2 Nights',
        name: 'The 3-Day Diani Escape',
        keywords: 'Quick Escape &middot; One Signature Excursion &middot; Easy Pace',
        highlights: [
          'Two nights at a stay that already feels like home',
          'One full day on the water — Sunset Mangrove Escape',
          'Airport transfers both ways, no itinerary rush',
          'Built for long weekends and short windows off work',
        ],
        price: '$86 &ndash; $340',
        priceExtra: 'Covers 2 nights across the stays we offer, plus the excursion below.',
        includes: [
          '2 nights at your chosen stay',
          'Daily breakfast',
          'Airport transfers, both ways',
          'The Sunset Mangrove Escape excursion',
        ],
        itinerary: [
          { day: 'Day 1', text: 'Airport pickup, check-in, and an evening to settle in.' },
          { day: 'Day 2', text: 'Sunset Mangrove Escape — glass-bottom boat, guided snorkelling, then a private sunset cruise through the mangroves.' },
          { day: 'Day 3', text: 'A final morning on the beach, check-out, and airport transfer.' },
          { day: 'Add-On', text: 'Prefer something else on the water? Swap in the <a href="follow-the-tide.html">Wasini Dolphin Swim or Chale Island</a> excursion — just ask when you book.' },
        ],
        goodToKnow: [
          { label: 'Pace', value: 'Easy' },
          { label: 'Group Size', value: '1–6 People' },
          { label: 'Best Time', value: 'Dec–Mar & Jul–Oct' },
          { label: 'Ideal For', value: 'Couples, Friends' },
        ],
        signature: {
          label: 'Signature Inclusion',
          name: 'Sunset Mangrove Escape',
          image: 'assets/images/sunsetmangro.jpeg',
          desc: 'Glass-bottom boat, guided snorkelling and a private sunset cruise through the mangroves.',
          price: 'From $73 for up to 3 guests',
        },
      },
      '5-day': {
        formValue: 'The 5-Day Diani Adventure',
        image: 'assets/images/family.jpeg',
        imageAlt: 'Guests snorkelling in a hidden sea cave, Diani, Kenya',
        duration: '5 Days / 4 Nights',
        name: 'The 5-Day Diani Adventure',
        keywords: 'Curated Stay &middot; Local Style &middot; Dolphins &middot; Village Connection',
        highlights: [
          'Our signature journey — four tides in five days',
          'Curated stay + local styling guide',
          'Dolphin swim & coral reef snorkelling',
          'Village e-bike tour with Mijikenda communities',
          'A surprise, courtesy of Palm & Tide',
        ],
        price: '$172 &ndash; $680',
        priceExtra: 'Covers 4 nights across the stays we offer, plus everything below.',
        includes: [
          '4 nights at your chosen stay',
          'Daily breakfast & the welcome meal',
          'Airport transfers, styling guide, dolphin & snorkelling excursion, village e-bike tour',
          'A surprise, courtesy of Palm & Tide',
        ],
        itinerary: [
          { day: 'Day 1', text: 'Arrival — airport pickup, check-in, home-prepared Swahili welcome meal.' },
          { day: 'Day 2', text: 'Discovery — visit local designers for linen, kanga and handcrafted jewellery.' },
          { day: 'Day 3', text: 'Adventure — sail a traditional jahazi, swim with dolphins, snorkel the coral gardens, sunset cruise back.' },
          { day: 'Day 4', text: 'Connection — e-bike through Mijikenda’s villages, tea with a local family, traditional coastal dances.' },
          { day: 'Day 5', text: 'Farewell — a surprise experience, a final beach walk, and airport transfer.' },
          { day: 'Add-On', text: 'Want more time on the water? Add the <a href="follow-the-tide.html">Kongo River Sunset Cruise or Funzi Island</a> excursion to your days.' },
        ],
        goodToKnow: [
          { label: 'Pace', value: 'Easy, Fully Guided' },
          { label: 'Group Size', value: '2–12 People' },
          { label: 'Best Time', value: 'Dec–Mar & Jul–Oct' },
          { label: 'Ideal For', value: 'Couples, Friends, Families' },
        ],
      },
      '7-day': {
        formValue: 'The 7-Day Diani Immersion',
        image: 'assets/images/meet.png',
        imageAlt: 'Guests meeting a local community, Diani, Kenya',
        duration: '7 Days / 6 Nights',
        name: 'The 7-Day Diani Immersion',
        keywords: 'Slow Travel &middot; Full Coast Immersion &middot; Marine Park Day Trip',
        highlights: [
          'Six nights, no itinerary rush',
          'A free day built in — just be at your stay',
          'Full-day Kisite Dolphin Escape to Wasini–Kisite Mpunguti',
          'Local styling guide & village e-bike tour',
        ],
        price: '$258 &ndash; $1,020',
        priceExtra: 'Covers 6 nights across the stays we offer, plus everything below.',
        includes: [
          '6 nights at your chosen stay',
          'Daily breakfast',
          'Airport transfers, both ways',
          'Local styling guide & village e-bike tour',
          'The Kisite Dolphin Escape excursion',
        ],
        itinerary: [
          { day: 'Day 1', text: 'Arrival — airport pickup, check-in, evening to settle in.' },
          { day: 'Day 2', text: 'Discovery — local designers, linen, kanga and handcrafted jewellery.' },
          { day: 'Day 3', text: 'Rest day — free time at your stay, beach and pool, no itinerary.' },
          { day: 'Day 4', text: 'Kisite Dolphin Escape — a full day sailing to Wasini–Kisite Mpunguti for dolphins, snorkelling and a Swahili seafood lunch.' },
          { day: 'Day 5', text: 'Connection — e-bike through Mijikenda’s villages, tea with a local family.' },
          { day: 'Day 6', text: 'Free day — your own pace, optional add-ons available.' },
          { day: 'Day 7', text: 'Farewell — final beach walk, check-out, airport transfer.' },
          { day: 'Add-On', text: 'Fill a free day with <a href="follow-the-tide.html">Funzi Island</a> or the <a href="meet-the-coast.html">Shimba Hills</a> track — just ask when you book.' },
        ],
        goodToKnow: [
          { label: 'Pace', value: 'Relaxed' },
          { label: 'Group Size', value: '2–12 People' },
          { label: 'Best Time', value: 'Dec–Mar & Jul–Oct' },
          { label: 'Ideal For', value: 'Slow Travellers, Couples, Friends' },
        ],
        signature: {
          label: 'Signature Inclusion',
          name: 'Kisite Dolphin Escape',
          image: 'assets/images/kisite.jpeg',
          desc: 'A full day sailing to Wasini–Kisite Mpunguti: dolphin encounters, snorkelling the reef, and a Swahili seafood lunch.',
          price: 'From $27 per person',
        },
      },
      family: {
        formValue: 'Family Journeys',
        image: 'assets/images/villa2.jpeg',
        imageAlt: 'Villa courtyard and pool, Diani, Kenya',
        duration: 'Flexible Duration',
        name: 'Family Journeys',
        keywords: 'Kid-Friendly Pace &middot; Wildlife Day &middot; Family Stays',
        highlights: [
          'Kid-friendly pace, family-sized stays',
          'One full day at a wildlife conservation centre',
          'Free beach day built in — pool, sand, no rush',
          'Tell us the kids’ ages, we adjust the pace',
          'Shown below as a 5-day sample',
        ],
        price: 'From $43/night',
        priceExtra: 'Accommodation-based, across the stays we offer — tell us your dates for a full quotation.',
        includes: [
          'Your chosen stay, priced per night (family rooms & villas available)',
          'Daily breakfast',
          'Airport transfers, both ways',
          'The Family Wildlife Adventure excursion',
        ],
        itinerary: [
          { day: 'Day 1', text: 'Arrival — check-in, settle in, easy evening at your stay.' },
          { day: 'Day 2', text: 'Family Wildlife Adventure — guided visit to a leading wildlife conservation centre, giraffe feeding, monkeys and more.' },
          { day: 'Day 3', text: 'Beach day — free time, pool, sandcastles, no itinerary.' },
          { day: 'Day 4', text: 'Find Your Style (optional) — light shopping for the family.' },
          { day: 'Day 5', text: 'Farewell — check-out and airport transfer.' },
          { day: 'Add-On', text: 'Swap in the <a href="meet-the-coast.html">Shimba Hills</a> wildlife track for another family-friendly day out.' },
        ],
        goodToKnow: [
          { label: 'Pace', value: 'Easy, Kid-Friendly' },
          { label: 'Group Size', value: 'Any Family Size' },
          { label: 'Best Time', value: 'Dec–Mar & Jul–Oct' },
          { label: 'Ideal For', value: 'Families with Children' },
        ],
        signature: {
          label: 'Signature Inclusion',
          name: 'Family Wildlife Adventure',
          image: 'assets/images/familyad.jpeg',
          desc: 'A guided visit to a leading wildlife conservation centre — giraffe feeding, monkeys and more — with pickup and drop-off included.',
          price: 'From $104 for 2 adults + 2 children',
        },
      },
      team: {
        formValue: 'Team Building',
        image: 'assets/images/kongo-cruise.jpg',
        imageAlt: 'Group boat ride at sunset on the Kongo River, Diani, Kenya',
        duration: 'Flexible Duration',
        name: 'Team Building',
        keywords: 'Group Stays &middot; One Bonding Night &middot; Flexible Pace',
        highlights: [
          'Group stays, group rates',
          'One evening built around a real coastal bonfire',
          'Coastal walk, hidden caves, snorkelling, boat ride',
          'We handle the logistics, you handle the team',
          'Shown below as a 3-day sample',
        ],
        price: 'From $43/night',
        priceExtra: 'Accommodation-based, across the stays we offer — tell us your group size for a full quotation.',
        includes: [
          'Your chosen stay, priced per night (group rates available)',
          'Daily breakfast',
          'Airport transfers, both ways',
          'A Tide-Led Coastal Escape excursion',
        ],
        itinerary: [
          { day: 'Day 1', text: 'Arrival — group check-in, welcome dinner.' },
          { day: 'Day 2', text: 'A Tide-Led Coastal Escape — coastal nature walk, hidden caves, snorkelling, a traditional boat ride, beach bonfire dinner.' },
          { day: 'Day 3', text: 'Farewell — check-out and airport transfer.' },
          { day: 'Add-On', text: 'Add the <a href="follow-the-tide.html">Kongo River Sunset Cruise</a> for a second evening built around the group.' },
        ],
        goodToKnow: [
          { label: 'Pace', value: 'Flexible, Group-Paced' },
          { label: 'Group Size', value: '6+ People' },
          { label: 'Best Time', value: 'Dec–Mar & Jul–Oct' },
          { label: 'Ideal For', value: 'Teams, Colleagues, Retreats' },
        ],
        signature: {
          label: 'Signature Inclusion',
          name: 'A Tide-Led Coastal Escape',
          image: 'assets/images/tide_led.jpeg',
          desc: 'Coastal nature walk, hidden caves, snorkelling, a traditional boat ride and a beach bonfire dinner.',
          price: 'From $77 for 2 people sharing',
        },
      },
      romantic: {
        formValue: 'Romantic Escape',
        image: 'assets/images/romantic1.jpeg',
        imageAlt: 'Candlelit beach bonfire for two at dusk, Diani, Kenya',
        duration: '2 Days',
        name: 'Romantic Escape',
        keywords: 'Private Boat Ride &middot; Cave Dinner &middot; Sunset Canoe',
        highlights: [
          'Two days built entirely around the two of you',
          'Private glass-bottom boat ride',
          'Candlelit dinner inside a coastal cave',
          'Couples spa session with a private masseuse (Premium)',
          'Sunset canoe through the mangroves',
        ],
        includes: [
          'Private glass-bottom boat ride',
          'Cave dinner with a romantic setup',
          'African Pool / cave swimming',
          'Sunset canoe or kayak experience',
          'Beach bonfire dinner with candles',
          'Couples spa session with a private masseuse (Premium)',
          'Dedicated experience host',
        ],
        itinerary: [
          { day: 'Day 1', text: 'Private glass-bottom boat ride, optional photography, free time to explore & swim, cave dinner with a romantic setup.' },
          { day: 'Day 2', text: 'Couples spa session with a private masseuse, African Pool / cave swimming, sunset canoe or kayak, beach bonfire dinner. Photoshoot available on request.' },
          { day: 'Add-On', text: 'Make it three days: add a private morning on <a href="follow-the-tide.html">Funzi Island</a>, a sandbank just for the two of you.' },
        ],
        priceOptions: [
          { label: 'Standard Escape', price: '$325', desc: 'For 2 guests. Pickup & drop-off within Diani included. Does not include a beachfront stay or spa.' },
          { label: 'Premium Escape', price: '$468', desc: 'For 2 guests. Adds a beachfront stay (1 night), breakfast, a couples spa session with a private masseuse, and airport/train transfers.' },
        ],
        goodToKnow: [
          { label: 'Pace', value: 'Easy' },
          { label: 'Booking', value: 'In advance — limited slots' },
          { label: 'Ideal For', value: 'Honeymoons, Anniversaries' },
          { label: 'Note', value: 'Drinks & photoshoot not included' },
        ],
      },
      'day-tide-led': {
        formValue: 'A Tide-Led Coastal Escape',
        image: 'assets/images/cave.jpeg',
        imageAlt: 'A Tide-Led Coastal Escape, Diani, Kenya',
        duration: '1 Day',
        name: 'A Tide-Led Coastal Escape',
        keywords: 'Hidden Caves &middot; Snorkelling &middot; Beach Bonfire',
        highlights: [
          'Coastal nature walk to hidden caves & pools',
          'Snorkelling among coral & reef life',
          'Traditional boat ride',
          'Beach bonfire dinner to close the day',
        ],
        priceOptions: [
          { label: '2 People Sharing', price: '$77', desc: 'Total for 2 guests sharing the experience.' },
          { label: 'Per Person', price: '$48', desc: 'Booking solo or want individual pricing.' },
        ],
        includes: [
          'Complimentary pickup & drop-off within Diani',
          'Coastal nature walk & discovery',
          'Hidden caves & pools',
          'Snorkelling & swimming',
          'Traditional boat ride',
          'Beach bonfire dinner',
        ],
        itinerary: [
          { day: 'Morning', text: 'Pickup, coastal nature walk and discovery of hidden caves & pools.' },
          { day: 'Midday', text: 'Snorkelling & swimming, then a traditional boat ride.' },
          { day: 'Evening', text: 'Beach bonfire dinner to close the day, then return to your stay.' },
        ],
        goodToKnow: [
          { label: 'Tide', value: 'Low Tide Experience' },
          { label: 'Walking', value: 'Moderate' },
          { label: 'Swimmers', value: 'Confident Swimmers' },
          { label: 'Bonus', value: 'Photography Opportunities' },
        ],
      },
      'day-kisite': {
        formValue: 'Kisite Dolphin Escape',
        image: 'assets/images/dolphine.jpg',
        imageAlt: 'Kisite Dolphin Escape, Wasini, Kenya',
        duration: '1 Day',
        name: 'Kisite Dolphin Escape',
        keywords: 'Dolphin Encounters &middot; Snorkelling &middot; Island Lunch',
        highlights: [
          'Dolphin encounters in the channel',
          '45–60 minutes snorkelling at Kisite Island',
          'Swahili-themed lunch included',
          'Scenic transfer to Wasini (about 1 hour)',
        ],
        price: '$27/person',
        includes: [
          'Complimentary pickup & drop-off within Diani',
          'Scenic transfer to Wasini (~55km / 1 hour)',
          'Change room facilities',
          '1–2 hour boat ride chasing dolphins',
          '45–60 minutes snorkelling at Kisite Island',
          'Swahili-themed lunch',
        ],
        itinerary: [
          { day: 'Morning', text: 'Pickup and scenic transfer to Wasini (about 1 hour).' },
          { day: 'Midday', text: '1–2 hour boat ride chasing dolphins, then 45–60 minutes snorkelling at Kisite Island.' },
          { day: 'Afternoon', text: 'Swahili-themed lunch, then return to Diani.' },
        ],
        goodToKnow: [
          { label: 'Transfer', value: '~55km / 1 Hour' },
          { label: 'What to Bring', value: 'Swimwear & Towel' },
          { label: 'Subject to', value: 'Weather & Sea Conditions' },
          { label: 'Ideal For', value: 'Couples, Friends, Families' },
        ],
      },
      'day-mangrove': {
        formValue: 'Sunset Mangrove Escape',
        image: 'assets/images/kongo.jpeg',
        imageAlt: 'Sunset Mangrove Escape, Diani, Kenya',
        duration: '1 Day',
        name: 'Sunset Mangrove Escape',
        keywords: 'Glass-Bottom Boat &middot; Snorkelling &middot; Sunset Cruise',
        highlights: [
          'Glass-bottom boat ride over the reef',
          'Guided snorkelling with tropical fish',
          'Private sunset cruise through the mangroves',
          'Choice of traditional canoe or private kayak',
        ],
        price: '$73 for up to 3 guests',
        includes: [
          'Complimentary pickup & drop-off within Diani',
          'Glass-bottom boat ride',
          'Guided snorkelling',
          'Private sunset mangrove cruise',
          'Choice of canoe or kayak',
          'Professional local guide',
        ],
        itinerary: [
          { day: 'Afternoon', text: 'Pickup, glass-bottom boat ride and guided snorkelling with tropical fish.' },
          { day: 'Sunset', text: 'Private mangrove cruise by traditional canoe or kayak, then return to your stay.' },
        ],
        goodToKnow: [
          { label: 'Max Group', value: '3 Guests' },
          { label: 'What to Bring', value: 'Swimwear & Towel' },
          { label: 'Subject to', value: 'Weather & Tide' },
          { label: 'Best For', value: 'Small Groups & Couples' },
        ],
      },
      'day-watersports': {
        formValue: 'Water Sports',
        image: 'assets/images/sports.jpeg',
        imageAlt: 'Kayaking at sunset, Diani, Kenya',
        duration: '1 Day',
        name: 'Water Sports',
        keywords: 'Kayaking &middot; Paddleboarding &middot; Snorkelling',
        highlights: [
          'Kayaking and stand-up paddleboarding',
          'Reef snorkelling with full gear included',
          'Half or full-day options available',
          'Guided throughout, suits all experience levels',
        ],
        price: 'Price on request',
        priceExtra: 'Rates vary by activity and duration — tell us what you’re after and we’ll quote you directly.',
        includes: [
          'Guided kayaking or paddleboarding',
          'Snorkelling gear',
          'Local safety guide',
          'Pickup & drop-off within Diani',
        ],
        itinerary: [
          { day: 'Your Day', text: 'Choose kayaking, paddleboarding, snorkelling or a mix — we build the day around what you want to do.' },
        ],
        goodToKnow: [
          { label: 'Pace', value: 'Flexible' },
          { label: 'Experience', value: 'All Levels' },
          { label: 'Duration', value: 'Half or Full-Day' },
          { label: 'Ideal For', value: 'Friends, Families, Solo' },
        ],
      },
    };

    const packageModalBody = document.getElementById('packageModalBody');
    const packageCloseButtons = packageModal.querySelectorAll('#packageModalClose');
    let lastPackageFocusedEl = null;

    const renderPackage = (key) => {
      const pkg = PACKAGES[key];
      if (!pkg || !packageModalBody) return;

      const highlightsHtml = pkg.highlights.map((item) => `<li>${item}</li>`).join('');

      const includesHtml = pkg.includes.map((item) => `<li>${item}</li>`).join('');

      const itineraryHtml = pkg.itinerary
        .map(
          (step) => `
        <li>
          <span class="pkg-modal-itinerary-day">${step.day}</span>
          <span class="pkg-modal-itinerary-text">${step.text}</span>
        </li>`
        )
        .join('');

      const goodToKnowHtml = pkg.goodToKnow
        .map(
          (item) => `
        <div class="pkg-modal-good-item">
          <span class="pkg-modal-good-label">${item.label}</span>
          <span class="pkg-modal-good-value">${item.value}</span>
        </div>`
        )
        .join('');

      const priceHtml = pkg.priceOptions
        ? `
        <div class="pkg-modal-price-options">
          ${pkg.priceOptions
            .map(
              (opt) => `
            <div class="pkg-modal-price-option">
              <span class="pkg-modal-price-option-label">${opt.label}</span>
              <span class="pkg-modal-price-option-price">${opt.price}</span>
              <span class="pkg-modal-price-option-desc">${opt.desc}</span>
            </div>`
            )
            .join('')}
        </div>
        <p class="pkg-modal-price-note">${PRICE_DISCLAIMER}</p>`
        : `
        <div class="pkg-modal-price-block">
          <p class="pkg-modal-price">${pkg.price}</p>
          <p class="pkg-modal-price-note">${pkg.priceExtra ? pkg.priceExtra + ' ' : ''}${PRICE_DISCLAIMER}</p>
        </div>`;

      const signatureHtml = pkg.signature
        ? `
        <div class="pkg-modal-signature">
          <img src="${pkg.signature.image}" alt="${pkg.signature.name}" loading="lazy">
          <div class="pkg-modal-signature-body">
            <span class="pkg-modal-signature-label">${pkg.signature.label}</span>
            <span class="pkg-modal-signature-name">${pkg.signature.name}</span>
            <span class="pkg-modal-signature-desc">${pkg.signature.desc}</span>
            <span class="pkg-modal-signature-price">${pkg.signature.price}</span>
          </div>
        </div>`
        : '';

      packageModalBody.innerHTML = `
        <div class="pkg-modal-header">
          <img class="pkg-modal-thumb" src="${pkg.image}" alt="${pkg.imageAlt}" loading="lazy">
          <div class="pkg-modal-header-text">
            <p class="pkg-modal-duration">${pkg.duration}</p>
            <h2 class="pkg-modal-title" id="packageModalTitle">${pkg.name}</h2>
            <p class="pkg-modal-keywords">${pkg.keywords}</p>
          </div>
        </div>
        <div class="pkg-modal-content">
          <div class="pkg-modal-highlights-box">
            <ul class="pkg-modal-highlights">${highlightsHtml}</ul>
          </div>
          ${priceHtml}
          ${signatureHtml}
          <details class="pkg-modal-reveal">
            <summary class="pkg-modal-reveal-summary">What&rsquo;s Included</summary>
            <ul class="pkg-modal-includes">${includesHtml}</ul>
          </details>
          <details class="pkg-modal-reveal">
            <summary class="pkg-modal-reveal-summary">Your Itinerary</summary>
            <ol class="pkg-modal-itinerary">${itineraryHtml}</ol>
          </details>
          <details class="pkg-modal-reveal">
            <summary class="pkg-modal-reveal-summary">Good to Know</summary>
            <div class="pkg-modal-good-grid">${goodToKnowHtml}</div>
          </details>
          <div class="pkg-modal-actions">
            <button type="button" class="btn btn-journey" data-open-journey data-package-value="${pkg.formValue}">Choose Your Stay &amp; Begin &rarr;</button>
          </div>
        </div>
      `;

      // Accordion behaviour: opening one reveal closes any other
      // that's open, so the modal doesn't grow tall with every
      // section stacked open at once.
      const revealDetails = packageModalBody.querySelectorAll('.pkg-modal-reveal');
      revealDetails.forEach((detailsEl) => {
        detailsEl.addEventListener('toggle', () => {
          if (!detailsEl.open) return;
          revealDetails.forEach((other) => {
            if (other !== detailsEl) other.open = false;
          });
        });
      });
    };

    const openPackageModal = (key) => {
      lastPackageFocusedEl = document.activeElement;
      renderPackage(key);
      packageModal.classList.add('is-open');
      packageModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    };

    const closePackageModal = () => {
      packageModal.classList.remove('is-open');
      packageModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastPackageFocusedEl) lastPackageFocusedEl.focus({ preventScroll: true });
    };

    document.querySelectorAll('[data-package]').forEach((card) => {
      card.addEventListener('click', () => openPackageModal(card.dataset.package));
    });

    packageCloseButtons.forEach((btn) => btn.addEventListener('click', closePackageModal));

    packageModal.addEventListener('click', (e) => {
      if (e.target === packageModal) closePackageModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && packageModal.classList.contains('is-open')) closePackageModal();
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
    // Every submission also goes to this second Formspree endpoint,
    // in addition to whatever the form's own `action` attribute is,
    // so leads land in both inboxes.
    const JOURNEY_FORM_SECONDARY_ACTION = 'https://formspree.io/f/mrenlgkd';
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
        ['Accommodation Preference', data.get('accommodationType') || 'Not specified'],
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

    // Open triggers — every "Begin Your Journey" CTA on the page, plus
    // any CTA injected later (e.g. from the package details modal), so
    // this uses delegation on document rather than a one-time
    // querySelectorAll snapshot. A trigger can optionally carry
    // data-package-value to pre-select that package's radio option —
    // used by the package modal's "Choose Your Stay" button so a
    // guest who picked a package doesn't have to pick it again.
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-journey]');
      if (!trigger) return;
      e.preventDefault();

      const packageValue = trigger.dataset.packageValue;
      if (packageValue && journeyForm) {
        const radio = journeyForm.querySelector(
          `input[name="packageInterest"][value="${CSS.escape(packageValue)}"]`
        );
        if (radio) radio.checked = true;
      }

      openModal();
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
          const formData = new FormData(journeyForm);
          const submissions = await Promise.allSettled([
            fetch(journeyForm.action, {
              method: 'POST',
              body: formData,
              headers: { Accept: 'application/json' },
            }),
            fetch(JOURNEY_FORM_SECONDARY_ACTION, {
              method: 'POST',
              body: formData,
              headers: { Accept: 'application/json' },
            }),
          ]);

          // Treat it as a success if either endpoint accepted the
          // submission — one Formspree form having an issue shouldn't
          // block the user from getting their confirmation, since the
          // lead still landed somewhere.
          const anySucceeded = submissions.some(
            (result) => result.status === 'fulfilled' && result.value.ok
          );

          if (anySucceeded) {
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
    // Mobile browsers resize the viewport as the address bar shows/hides
    // on scroll — without this, ScrollTrigger treats that as a real
    // resize and recalculates/refreshes mid-scroll, which is what made
    // triggers fire inconsistently (or not at all) on mobile.
    ScrollTrigger.config({ ignoreMobileResize: true });

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

      // All the trigger positions above are computed the moment this
      // script runs, using whatever the layout measures at that instant.
      // Web fonts swapping in (Fraunces/Inter load async) and the hero
      // photo/lazy images finishing after that reflow the page, so the
      // pixel offsets ScrollTrigger baked in are stale by the time the
      // user actually scrolls — on desktop that shows up as the "What
      // We Offer" cards and testimonials having already finished
      // animating by the time they're in view; on mobile, where the
      // layout shift is larger (single-column stacking), the stale
      // start position can land above the very top of the page, so
      // ScrollTrigger treats it as already-passed and the cards just
      // appear with no animation at all. Refreshing once everything
      // (images + fonts) has actually settled fixes both.
      window.addEventListener('load', () => ScrollTrigger.refresh());
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
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