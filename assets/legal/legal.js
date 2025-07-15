document.addEventListener('DOMContentLoaded', () => {
  // Navbar functionality
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  hamburger.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

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

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});