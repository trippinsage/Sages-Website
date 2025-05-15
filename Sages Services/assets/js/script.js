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

  // Contact form submission
  const contactForm = document.getElementById('contact-form');
  const submitButton = contactForm.querySelector('button');
  const buttonText = submitButton.querySelector('span');
  const spinner = submitButton.querySelector('.fa-spinner');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    buttonText.style.display = 'none';
    spinner.style.display = 'inline-block';
    submitButton.disabled = true;

    // Get form data
    const name = contactForm.querySelector('input[name="name"]').value;
    const email = contactForm.querySelector('input[name="email"]').value;
    const message = contactForm.querySelector('textarea[name="message"]').value;

    // Create mailto link
    const subject = encodeURIComponent('Website Inquiry');
    const body = encodeURIComponent(`Hi Sages Services,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nThanks,\n${name}`);
    const mailtoLink = `mailto:sages.services@outlook.com?subject=${subject}&body=${body}`;

    // Open email client
    window.location.href = mailtoLink;

    // Simulate submission delay, then reset form
    setTimeout(() => {
      contactForm.reset();
      alert('Your inquiry has been sent! Please check your email client to complete the submission.');
      buttonText.style.display = 'inline-block';
      spinner.style.display = 'none';
      submitButton.disabled = false;
    }, 1000);
  });

  // Portfolio modals
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalLink = document.getElementById('modal-link');
  const closeModal = document.querySelector('.close-modal');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  const projectData = {
    eastcoastpets: {
      img: 'assets/img/misc/ecp-logo.jpg',
      title: 'East Coast Pets',
      description: 'A vibrant site for a local pet care business, driving customer engagement.',
      link: 'https://eastcoastpets.ca'
    },
    ptmpets: {
      img: 'assets/img/misc/ptm.png',
      title: 'PTM Pets',
      description: 'A user-friendly site for a local pet service, optimized for mobile and SEO.',
      link: 'https://ptmpets.com'
    }
  };

  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const project = item.dataset.project;
      const data = projectData[project];
      if (data) {
        modalImg.src = data.img;
        modalImg.alt = `${data.title} Website`;
        modalTitle.textContent = data.title;
        modalDescription.textContent = data.description;
        modalLink.href = data.link;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
      }
    });
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
  });
});