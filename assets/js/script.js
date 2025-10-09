document.addEventListener('DOMContentLoaded', () => {
  try {
    // Scroll animations
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    if (animateElements.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );
      animateElements.forEach((el) => observer.observe(el));
    }

    // Page load animation
    document.body.classList.add('loaded');

    // Debounce utility for performance
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (anchors.length > 0) {
      anchors.forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = anchor.getAttribute('href');
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }
          // Close mobile menu if open
          const navMenu = document.querySelector('.nav-menu');
          const navToggle = document.querySelector('.nav-toggle');
          if (navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
          }
        });
      });
    }

    // Mobile menu toggle with focus trapping
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-button');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
        navToggle.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        if (isExpanded) {
          navLinks[0]?.focus();
        }
      });

      // Focus trapping for accessibility
      navMenu.addEventListener('keydown', (e) => {
        if (!navMenu.classList.contains('active')) return;
        if (e.key === 'Tab') {
          const focusableElements = navMenu.querySelectorAll('a.nav-button');
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === 'Escape') {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.innerHTML = '<i class="fas fa-bars"></i>';
          navToggle.focus();
        }
      });
    }

    // External link accessibility
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach((link) => {
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // Social and gallery item interactions
    const socialItems = document.querySelectorAll('.social-item');
    const galleryItems = document.querySelectorAll('.gallery figure');

    const addTouchFeedback = (items) => {
      items.forEach((item) => {
        item.addEventListener('touchstart', () => {
          item.classList.add('touched');
          setTimeout(() => item.classList.remove('touched'), 200);
        }, { passive: true });
        item.addEventListener('click', () => {
          item.classList.add('touched');
          setTimeout(() => item.classList.remove('touched'), 200);
        });
      });
    };

    if (socialItems.length > 0) addTouchFeedback(socialItems);
    if (galleryItems.length > 0) addTouchFeedback(galleryItems);

    // Restore scroll position after page load
    window.addEventListener('load', () => {
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    // Close mobile menu on window resize
    const handleResize = debounce(() => {
      if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    }, 100);
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Error in script initialization:', error);
  }
});