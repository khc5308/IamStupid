// F1 HUB — Tracks Page JavaScript

let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];


let filteredTracks = [...tracks];

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const res = await fetch('/data/f1-data.json');
    const data = await res.json();
    teams = data.teams || [];
    tracks = data.tracks || [];
    machines = data.machines || [];
    raceEvents = data.raceEvents || [];
    ALL_DRIVERS = data.ALL_DRIVERS || [];
    filteredTracks = [...tracks];
  } catch (e) { console.error('Failed to load f1-data', e); }

  renderTracks();
  setupFilters();
  setupModalClose('track-modal');
});

// Render tracks
function renderTracks() {
  const grid = document.getElementById('tracks-grid');
  if (!grid) return;

  if (filteredTracks.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏁</div><p>검색 결과가 없습니다.</p></div>';
    return;
  }

  grid.innerHTML = filteredTracks.map(track => `
    <div class="card" onclick="showTrackModal('${track.id}')" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="height: 160px; background: #0f0f1a; display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; border-bottom: 1px solid var(--border-color); overflow: hidden; padding: 0.75rem;">
          ${track.image ? `<img src="${track.image}" alt="${track.name}" class="track-card-img" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 8px rgba(255,255,255,0.12)); transition: transform 0.3s ease;">` : `<div style="font-size: 3rem; opacity: 0.3;">🏁</div>`}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">${track.name}</h3>
            <p style="font-size: 0.875rem; margin: 0; color: #707080;">${track.city}, ${track.country}</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
            <div style="font-size: 0.75rem; color: #707080;">서킷 길이</div>
            <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${track.length} km</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
            <div style="font-size: 0.75rem; color: #707080;">랩 수</div>
            <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${track.laps}</div>
          </div>
        </div>
      </div>
      ${track.description ? `<p style="font-size: 0.875rem; margin: 0; color: #b0b0c0; line-height: 1.4;">${track.description}</p>` : ''}
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
        filteredTracks = [...tracks];
      } else {
        filteredTracks = tracks.filter(t => t.type === filter);
      }
      renderTracks();
    });
  });
}

// Show track modal
function showTrackModal(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (!track) return;

  document.getElementById('modal-track-name').textContent = track.name;
  document.getElementById('modal-track-location').textContent = `${track.city}, ${track.country}`;

  const hasLapRecord = track.lapRecord && track.lapRecord !== 'N/A' && track.lapRecordHolder && track.lapRecordHolder !== 'None';

  const content = `
    ${track.image ? `
    <div style="width: 100%; height: 240px; background: #0f0f1a; display: flex; align-items: center; justify-content: center; border-radius: 6px; overflow: hidden; margin-bottom: 1.5rem; padding: 1rem; border: 1px solid var(--border-color);">
      <img src="${track.image}" alt="${track.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,255,255,0.15));">
    </div>
    ` : ''}
    <div class="modal-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.5rem;">
      <div class="modal-field">
        <div class="modal-field-label">Circuit Length</div>
        <div class="modal-field-value">${track.length} km</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">First Grand Prix</div>
        <div class="modal-field-value">${track.firstGrandPrix}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">Number of Laps</div>
        <div class="modal-field-value">${track.laps}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">Race Distance</div>
        <div class="modal-field-value">${track.raceDistance} km</div>
      </div>
      <div class="modal-field" style="grid-column: span 2;">
        <div class="modal-field-label">Fastest lap time</div>
        <div class="modal-field-value">
          ${hasLapRecord ? `${track.lapRecord} <span style="font-size: 0.875rem; font-weight: normal; color: var(--text-secondary); margin-left: 0.5rem;">(${track.lapRecordHolder}, ${track.lapRecordYear})</span>` : 'N/A'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-track-content').innerHTML = content;
  toggleModal('track-modal', true);
}

console.log('Tracks page JS loaded');
