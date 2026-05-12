// F1 HUB — Common JavaScript
// Navigation, scroll effects, and shared utilities

document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initMobileMenu();
  setActiveNavLink();
});

// Navbar scroll effect
function initNavbar() {
  const navbar = document.querySelector('nav');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (!mobileMenuBtn || !navLinks) return;

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });

  // Close menu when link is clicked
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}

// Set active nav link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Utility: Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Utility: Create element with classes
function createElement(tag, classes = '', text = '') {
  const el = document.createElement(tag);
  if (classes) el.className = classes;
  if (text) el.textContent = text;
  return el;
}

// Utility: Toggle modal
function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  if (show) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Utility: Close modal on background click
function setupModalClose(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      toggleModal(modalId, false);
    }
  });

  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toggleModal(modalId, false);
    });
  }
}

// Utility: Smooth scroll to element
function smoothScroll(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Utility: Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility: Filter array
function filterArray(array, searchTerm, searchFields) {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
}

// Utility: Sort array
function sortArray(array, field, ascending = true) {
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'string') {
      return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    return ascending ? aVal - bVal : bVal - aVal;
  });
}

// Utility: Get color by category
function getCategoryColor(category) {
  const colors = {
    'street': '#e10600',
    'permanent': '#3498db',
    'hybrid': '#9b59b6',
    'penalty': '#e10600',
    'incident': '#ff8700',
    'dnf': '#9b59b6',
    'safety-car': '#d4af37',
    'red-flag': '#e10600',
    'investigation': '#3498db'
  };
  return colors[category] || '#ffffff';
}

// Utility: Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Utility: Create badge HTML
function createBadge(text, color) {
  return `<span class="badge" style="background: ${color}20; color: ${color};">${text}</span>`;
}

// Utility: Create card HTML
function createCard(content, classes = '') {
  const card = createElement('div', `card ${classes}`);
  card.innerHTML = content;
  return card;
}

console.log('F1 HUB Common JS loaded');
