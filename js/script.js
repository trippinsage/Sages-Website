document.addEventListener('DOMContentLoaded', () => {
  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Header Scroll Effect and Animations
  const header = document.querySelector('.site-header');
  let lastScrollY = 0;
  const handleScroll = () => {
    if (!header) {
      console.error('Header element not found');
      return;
    }
    const scrollY = window.scrollY;
    const isScrollingDown = scrollY > lastScrollY && scrollY > 30;

    // Toggle scrolled class
    if (scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Toggle fade-up effect (more pronounced on mobile)
    if (isScrollingDown) {
      header.classList.add('fade-up');
    } else {
      header.classList.remove('fade-up');
    }

    lastScrollY = scrollY;
  };

  // Debounce Scroll Event
  let scrollTimeout;
  const debounceScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, 50);
  };
  window.addEventListener('scroll', debounceScroll);
  handleScroll(); // Initial call

  // Header Interactions
  if (header) {
    const profileImg = header.querySelector('.profile-img');
    const siteTitle = header.querySelector('.site-title');

    // Hover and Focus
    header.addEventListener('mouseenter', () => {
      profileImg.style.transform = 'scale(1.1)';
      siteTitle.style.transform = 'scale(1.05)';
    });
    header.addEventListener('mouseleave', () => {
      profileImg.style.transform = 'scale(1)';
      siteTitle.style.transform = 'scale(1)';
    });
    header.addEventListener('focus', () => {
      profileImg.style.transform = 'scale(1.1)';
      siteTitle.style.transform = 'scale(1.05)';
    });
    header.addEventListener('blur', () => {
      profileImg.style.transform = 'scale(1)';
      siteTitle.style.transform = 'scale(1)';
    });

    // Touch Interaction
    header.addEventListener('touchstart', () => {
      if ('vibrate' in navigator) navigator.vibrate(30);
      profileImg.style.transform = 'scale(1.1)';
      siteTitle.style.transform = 'scale(1.05)';
    });
    header.addEventListener('touchend', () => {
      profileImg.style.transform = 'scale(1)';
      siteTitle.style.transform = 'scale(1)';
    });
  }

  // Scroll-Triggered Animations
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.hero-section, .social-section, .journey-section');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.85) {
        el.classList.add('animate-in');
      }
    });
  };

  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll();

  // Gallery Interactions
  const galleryImages = document.querySelectorAll('.gallery img');
  galleryImages.forEach(img => {
    img.setAttribute('tabindex', '0'); // Keyboard accessibility
    img.addEventListener('mouseenter', () => {
      img.style.transform = 'scale(1.06)';
      img.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.4)';
    });
    img.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
      img.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.25)';
    });
    img.addEventListener('focus', () => {
      img.style.transform = 'scale(1.06)';
      img.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.4)';
    });
    img.addEventListener('blur', () => {
      img.style.transform = 'scale(1)';
      img.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.25)';
    });
    // Touch support
    img.addEventListener('touchstart', () => {
      if ('vibrate' in navigator) navigator.vibrate(50);
      img.style.transform = 'scale(1.06)';
      img.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.4)';
    });
    img.addEventListener('touchend', () => {
      img.style.transform = 'scale(1)';
      img.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.25)';
    });
  });

  // Social Item Effects
  const socialItems = document.querySelectorAll('.social-item');
  socialItems.forEach(item => {
    item.setAttribute('tabindex', '0'); // Keyboard accessibility
    item.addEventListener('mouseenter', () => {
      item.querySelector('img').style.transform = 'scale(1.1) rotate(5deg)';
    });
    item.addEventListener('mouseleave', () => {
      item.querySelector('img').style.transform = 'scale(1) rotate(0)';
    });
    item.addEventListener('focus', () => {
      item.querySelector('img').style.transform = 'scale(1.1) rotate(5deg)';
    });
    item.addEventListener('blur', () => {
      item.querySelector('img').style.transform = 'scale(1) rotate(0)';
    });
    // Touch support
    item.addEventListener('touchstart', () => {
      if ('vibrate' in navigator) navigator.vibrate(50);
      item.querySelector('img').style.transform = 'scale(1.1) rotate(5deg)';
    });
    item.addEventListener('touchend', () => {
      item.querySelector('img').style.transform = 'scale(1) rotate(0)';
    });
  });

  // Optimized Jellyfish Particles
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  let particles = [];
  const particleCount = window.innerWidth < 768 ? 25 : 40;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1.5;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.speedY = Math.random() * 0.2 - 0.1;
      this.opacity = Math.random() * 0.25 + 0.15;
      this.hue = Math.random() * 60 + 180; // Cyan to purple
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      this.opacity = Math.max(0.15, this.opacity + Math.random() * 0.008 - 0.004);
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animateParticles);
    } catch (error) {
      console.error('Particle animation failed:', error);
    }
  }

  try {
    initParticles();
    animateParticles();
  } catch (error) {
    console.error('Failed to initialize particles:', error);
  }

  // Lazy Load Images
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    images.forEach(img => observer.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src || img.src;
    });
  }
});