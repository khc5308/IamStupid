// F1 HUB — Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  initHeroAnimation();
  initScrollAnimation();
});

// Hero animation on load
function initHeroAnimation() {
  const heroText = document.querySelector('.hero-text');
  const heroImage = document.querySelector('.hero-image');
  
  if (heroText) {
    heroText.style.opacity = '0';
    heroText.style.transform = 'translateX(-30px)';
    setTimeout(() => {
      heroText.style.transition = 'all 0.8s ease-out';
      heroText.style.opacity = '1';
      heroText.style.transform = 'translateX(0)';
    }, 100);
  }

  if (heroImage) {
    heroImage.style.opacity = '0';
    heroImage.style.transform = 'translateX(30px)';
    setTimeout(() => {
      heroImage.style.transition = 'all 0.8s ease-out 0.2s';
      heroImage.style.opacity = '1';
      heroImage.style.transform = 'translateX(0)';
    }, 100);
  }
}

// Scroll animation for feature cards
function initScrollAnimation() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const cards = document.querySelectorAll('.feature-card, .stat-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
    observer.observe(card);
  });
}

console.log('Landing page JS loaded');
