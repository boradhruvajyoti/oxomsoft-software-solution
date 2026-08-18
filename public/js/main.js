/**
 * Oxomsoft Main Frontend Interactions
 * Handles navigation, mobile menu, scroll reveal animations, and UI states.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
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

    // Close menu when clicking outside or clicking any nav link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
      });
    });
  }

  // 2. Sticky Navbar Glass Effect on Scroll
  const navbar = document.getElementById('main-navbar');
  if (navbar) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 20) {
          navbar.classList.add('shadow-lg', 'shadow-sky-950/20', 'bg-opacity-95');
        } else {
          navbar.classList.remove('shadow-lg', 'shadow-sky-950/20', 'bg-opacity-95');
        }
      },
      { passive: true }
    );
  }

  // 3. Scroll Reveal Animation via IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Trigger once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach((el) => el.classList.add('active'));
  }

  // 4. Interactive Counter Animation (if present in view)
  const counters = document.querySelectorAll('.stat-counter');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
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
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }
});
