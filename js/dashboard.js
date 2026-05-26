// F1 HUB — Dashboard JavaScript

let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];


document.addEventListener('DOMContentLoaded', async function() {
  try {
    const res = await fetch('/data/f1-data.json');
    const data = await res.json();
    teams = data.teams || [];
    tracks = data.tracks || [];
    machines = data.machines || [];
    raceEvents = data.raceEvents || [];
    ALL_DRIVERS = data.ALL_DRIVERS || [];
  } catch (e) { console.error('Failed to load f1-data', e); }

  renderDriverStandings();
  renderConstructorStandings();
  renderRecentEvents();
});

// Render driver standings
function renderDriverStandings() {
  const container = document.getElementById('driver-standings');
  if (!container) return;

  const sorted = sortArray(drivers, 'points', false);
  const top10 = sorted.slice(0, 10);

  container.innerHTML = top10.map((driver, idx) => `
    <div class="standing-item">
      <div class="standing-pos">${idx + 1}</div>
      <div class="standing-flag">${driver.flag}</div>
      <div class="standing-info">
        <div class="standing-name">${driver.name}</div>
        <div class="standing-team">${driver.team}</div>
      </div>
      <div class="standing-points">${driver.points}</div>
    </div>
  `).join('');
}

// Render constructor standings
function renderConstructorStandings() {
  const container = document.getElementById('constructor-standings');
  if (!container) return;

  const sorted = sortArray(teams, 'points', false);
  const top6 = sorted.slice(0, 6);

  container.innerHTML = top6.map((team, idx) => `
    <div class="standing-item">
      <div class="standing-pos">${idx + 1}</div>
      <div style="width: 12px; height: 12px; background: ${team.color}; border-radius: 2px;"></div>
      <div class="standing-info">
        <div class="standing-name">${team.shortName}</div>
        <div class="standing-team">${team.name}</div>
      </div>
      <div class="standing-points">${team.points}</div>
    </div>
  `).join('');
}

// Render recent events
function renderRecentEvents() {
  const container = document.getElementById('recent-events');
  if (!container) return;

  const eventTypes = {
    'penalty': '페널티',
    'incident': '사건',
    'dnf': 'DNF',
    'safety-car': '세이프티카',
    'red-flag': '레드 플래그',
    'investigation': '조사'
  };

  const recent = raceEvents.slice(0, 5);

  container.innerHTML = recent.map(event => `
    <div class="event-item">
      <div class="event-badge">${eventTypes[event.type]}</div>
      <div class="event-title">${event.race}</div>
      <div class="event-desc">
        ${event.driver ? event.driver + ' — ' : ''}${event.description}
      </div>
    </div>
  `).join('');

  // Update event count
  const eventCount = document.getElementById('event-count');
  if (eventCount) {
    eventCount.textContent = raceEvents.length;
  }
}

console.log('Dashboard JS loaded');
