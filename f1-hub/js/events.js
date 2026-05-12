// F1 HUB — Events Page JavaScript

let filteredEvents = [...raceEvents];

document.addEventListener('DOMContentLoaded', function() {
  renderEvents();
  setupFilters();
});

// Render events
function renderEvents() {
  const timeline = document.getElementById('events-timeline');
  if (!timeline) return;

  if (filteredEvents.length === 0) {
    timeline.innerHTML = '<div class="events-empty"><div class="events-empty-icon">⚠️</div><p>검색 결과가 없습니다.</p></div>';
    return;
  }

  const eventTypeLabels = {
    'penalty': '페널티',
    'incident': '사건',
    'dnf': 'DNF',
    'safety-car': '세이프티카',
    'red-flag': '레드 플래그',
    'investigation': '조사'
  };

  timeline.innerHTML = filteredEvents.map(event => `
    <div class="event-card severity-${event.severity}">
      <div class="event-header">
        <div class="event-title">
          <span class="event-badge ${event.type}">${eventTypeLabels[event.type] || event.type}</span>
          <div class="event-info">
            <div class="event-race">R${event.round} • ${event.race}</div>
            ${event.driver ? `<div class="event-driver">드라이버: ${event.driver}</div>` : ''}
          </div>
        </div>
        <div class="event-date">${formatDate(event.date)}</div>
      </div>
      <div class="event-body">
        <div class="event-description">
          <strong>상황:</strong> ${event.description}
        </div>
        <div class="event-outcome">
          <strong>결과:</strong> ${event.outcome}
        </div>
      </div>
      <div class="event-meta">
        <div class="event-meta-item">
          <span>🏁</span>
          <span>랩 ${event.lap}</span>
        </div>
        ${event.team ? `
          <div class="event-meta-item">
            <span>🏆</span>
            <span>${event.team}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
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
        filteredEvents = [...raceEvents];
      } else {
        filteredEvents = raceEvents.filter(e => e.type === filter);
      }
      renderEvents();
    });
  });
}

console.log('Events page JS loaded');
