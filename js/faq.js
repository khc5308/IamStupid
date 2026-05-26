// F1 HUB — FAQ Page JavaScript

let faqCategories = {};
let faqs = [];


let filteredFaqs = [...faqs];

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const res = await fetch('/data/f1-faq.json');
    const data = await res.json();
    faqCategories = data.faqCategories || {};
    faqs = data.faqs || [];
  } catch (e) { console.error('Failed to load f1-faq', e); }

  renderFaqs();
  setupSearch();
  setupFilters();
});

// Render FAQs
function renderFaqs() {
  const list = document.getElementById('faq-list');
  if (!list) return;

  if (filteredFaqs.length === 0) {
    list.innerHTML = '<div class="faq-empty"><div class="faq-empty-icon">❓</div><p>검색 결과가 없습니다.</p></div>';
    return;
  }

  list.innerHTML = filteredFaqs.map(faq => `
    <div class="faq-item" data-id="${faq.id}">
      <div class="faq-header" onclick="toggleFaq('${faq.id}')">
        <div class="faq-badge">Q</div>
        <div class="faq-content">
          <div class="faq-question">${faq.question}</div>
          <div class="faq-category">${faqCategories[faq.category].label}</div>
        </div>
        <div class="faq-toggle">▼</div>
      </div>
      <div class="faq-answer">${faq.answer}</div>
    </div>
  `).join('');
}

// Toggle FAQ
function toggleFaq(faqId) {
  const item = document.querySelector(`[data-id="${faqId}"]`);
  if (!item) return;

  item.classList.toggle('expanded');
}

// Setup search
function setupSearch() {
  const searchInput = document.getElementById('faq-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredFaqs = faqs.filter(f => 
      f.question.toLowerCase().includes(term) || 
      f.answer.toLowerCase().includes(term)
    );
    renderFaqs();
  });
}

// Setup filters
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      if (filter === 'all') {
        filteredFaqs = [...faqs];
      } else {
        filteredFaqs = faqs.filter(f => f.category === filter);
      }
      renderFaqs();
    });
  });
}

console.log('FAQ page JS loaded');
