document.addEventListener('DOMContentLoaded', () => {
  // Scroll animations
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  animateElements.forEach(el => observer.observe(el));

  // Page load animation
  document.body.classList.add('loaded');
});