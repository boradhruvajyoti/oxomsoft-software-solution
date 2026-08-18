/**
 * Oxomsoft Main Frontend Interactions & Cinematic Controllers
 * Handles navigation, cursor spotlight, 3D tilt, architecture sandbox,
 * dynamic typewriter animations, interactive scope estimator, and scroll reveals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Global Ambient Cursor Spotlight Tracking
  const updateMousePosition = (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  };
  window.addEventListener('mousemove', updateMousePosition, { passive: true });

  // 2. 3D Card Perspective Tilt & Local Hover Spotlight
  const tiltCards = document.querySelectorAll('.tilt-card, .glass-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--card-mouse-x', `${x}px`);
      card.style.setProperty('--card-mouse-y', `${y}px`);

      if (card.classList.contains('tilt-card')) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('tilt-card')) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      }
    });
  });

  // 3. Mobile Drawer Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOpenIcon = document.getElementById('menu-open-icon');
  const menuCloseIcon = document.getElementById('menu-close-icon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.add('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
      }
    });

    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
      });
    });
  }

  // 4. Sticky Navbar Glass Effect on Scroll
  const navbar = document.getElementById('main-navbar');
  if (navbar) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 20) {
          navbar.classList.add('shadow-xl', 'shadow-sky-950/30', 'bg-opacity-95');
        } else {
          navbar.classList.remove('shadow-xl', 'shadow-sky-950/30', 'bg-opacity-95');
        }
      },
      { passive: true }
    );
  }

  // 5. Scroll Reveal Animation via IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('active'));
  }

  // 6. Interactive Stat Counters with Easing
  const counters = document.querySelectorAll('.stat-counter');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = +entry.target.getAttribute('data-target');
            const suffix = entry.target.getAttribute('data-suffix') || '';
            let count = 0;
            const speed = 40;
            const increment = Math.max(1, Math.ceil(target / speed));

            const updateCount = () => {
              count += increment;
              if (count < target) {
                entry.target.innerText = count + suffix;
                requestAnimationFrame(updateCount);
              } else {
                entry.target.innerText = target + suffix;
              }
            };

            updateCount();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  // 7. Dynamic Hero Typewriter / Keyword Rotator
  const typewriterElement = document.getElementById('hero-typewriter');
  if (typewriterElement) {
    const words = [
      'High-Performance Web Platforms',
      'Scalable Multi-Tenant SaaS',
      'Native iOS & Android Apps',
      'High-Throughput Cloud APIs',
      'Enterprise Digital Ecosystems',
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typeEffect() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 70;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2200; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 400; // Pause before typing new word
      }

      setTimeout(typeEffect, typeSpeed);
    }

    typeEffect();
  }

  // 8. Interactive Architecture Sandbox Controller
  const sandboxTabs = document.querySelectorAll('.sandbox-tab');
  const sandboxPanels = document.querySelectorAll('.sandbox-panel');

  if (sandboxTabs.length > 0 && sandboxPanels.length > 0) {
    sandboxTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        // Update active tab styles
        sandboxTabs.forEach((t) => {
          t.classList.remove('bg-sky-500/20', 'border-sky-500/50', 'text-sky-300', 'shadow-sky-500/20');
          t.classList.add('bg-slate-900/60', 'border-slate-800', 'text-slate-400');
        });
        tab.classList.remove('bg-slate-900/60', 'border-slate-800', 'text-slate-400');
        tab.classList.add('bg-sky-500/20', 'border-sky-500/50', 'text-sky-300', 'shadow-sky-500/20');

        // Switch panels with smooth fade
        sandboxPanels.forEach((panel) => {
          if (panel.id === `sandbox-${targetTab}`) {
            panel.classList.remove('hidden');
            panel.classList.add('animate-fadeIn');
          } else {
            panel.classList.add('hidden');
            panel.classList.remove('animate-fadeIn');
          }
        });
      });
    });
  }

  // 9. Interactive Scope & Cost Estimator Engine
  const calcType = document.getElementById('calc-type');
  const calcScale = document.getElementById('calc-scale');
  const calcSpeed = document.getElementById('calc-speed');
  const calcTimeline = document.getElementById('calc-timeline');
  const calcStack = document.getElementById('calc-stack');
  const calcCta = document.getElementById('calc-cta');

  function updateEstimator() {
    if (!calcType || !calcScale || !calcTimeline || !calcStack) return;

    const type = calcType.value;
    const scale = calcScale.value;
    const speed = calcSpeed ? calcSpeed.value : 'standard';

    let timeline = '3 - 5 Weeks';
    let stack = 'Node.js, Express, TailwindCSS, MySQL';
    let serviceParam = 'Website+Development';

    if (type === 'web') {
      if (scale === 'mvp') timeline = speed === 'rush' ? '2 - 3 Weeks' : '3 - 4 Weeks';
      else if (scale === 'growth') timeline = speed === 'rush' ? '4 - 6 Weeks' : '6 - 8 Weeks';
      else timeline = speed === 'rush' ? '8 - 10 Weeks' : '10 - 14 Weeks';
      stack = 'Next.js 14, TypeScript, TailwindCSS, Node.js Cluster, Caddy TLS';
      serviceParam = 'Website+Development';
    } else if (type === 'saas') {
      if (scale === 'mvp') timeline = speed === 'rush' ? '4 - 6 Weeks' : '6 - 8 Weeks';
      else if (scale === 'growth') timeline = speed === 'rush' ? '8 - 12 Weeks' : '12 - 16 Weeks';
      else timeline = speed === 'rush' ? '14 - 18 Weeks' : '18 - 24 Weeks';
      stack = 'Node.js Cluster, Redis, Stripe Billing, PostgreSQL, Docker, AWS VPS';
      serviceParam = 'SaaS+Development';
    } else if (type === 'mobile') {
      if (scale === 'mvp') timeline = speed === 'rush' ? '4 - 5 Weeks' : '6 - 8 Weeks';
      else if (scale === 'growth') timeline = speed === 'rush' ? '8 - 10 Weeks' : '10 - 14 Weeks';
      else timeline = speed === 'rush' ? '12 - 16 Weeks' : '16 - 22 Weeks';
      stack = 'Flutter / React Native, Google Play & App Store CI/CD, Node.js API, SQLite';
      serviceParam = 'Mobile+App+Development';
    } else if (type === 'custom') {
      timeline = 'Custom Architecture Timeline';
      stack = 'Full-Stack Dedicated Tech Fleet & Cloud DevOps';
      serviceParam = 'Custom+Software';
    }

    calcTimeline.textContent = timeline;
    calcStack.textContent = stack;
    if (calcCta) {
      calcCta.href = `/contact?service=${serviceParam}&scale=${scale}`;
    }
  }

  if (calcType && calcScale) {
    calcType.addEventListener('change', updateEstimator);
    calcScale.addEventListener('change', updateEstimator);
    if (calcSpeed) calcSpeed.addEventListener('change', updateEstimator);
    updateEstimator();
  }
});

