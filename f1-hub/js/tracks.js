// F1 HUB — Tracks Page JavaScript

let filteredTracks = [...tracks];

document.addEventListener('DOMContentLoaded', function() {
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
    <div class="card" onclick="showTrackModal('${track.id}')">
      <div style="height: 120px; background: linear-gradient(135deg, #1a1a2e 0%, #242438 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; font-size: 3rem; opacity: 0.3;">
        ${track.flag}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div>
          <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">${track.name}</h3>
          <p style="font-size: 0.875rem; margin: 0; color: #707080;">${track.city}, ${track.country}</p>
        </div>
        <span style="font-family: Orbitron; font-weight: 900; color: #e10600; font-size: 0.875rem;">R${track.round}</span>
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
      <p style="font-size: 0.875rem; margin: 0; color: #b0b0c0; line-height: 1.4;">${track.description}</p>
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
  document.getElementById('modal-track-location').textContent = `${track.city}, ${track.country} • ${track.flag}`;

  const content = `
    <div class="modal-section">
      <div class="modal-field">
        <div class="modal-field-label">서킷 길이</div>
        <div class="modal-field-value">${track.length} km</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">총 랩 수</div>
        <div class="modal-field-value">${track.laps}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">코너 수</div>
        <div class="modal-field-value">${track.turns}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">DRS 존</div>
        <div class="modal-field-value">${track.drsZones}</div>
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">랩 레코드</h3>
      <div class="modal-section">
        <div class="modal-field">
          <div class="modal-field-label">시간</div>
          <div class="modal-field-value">${track.lapRecord}</div>
        </div>
        <div class="modal-field">
          <div class="modal-field-label">기록자</div>
          <div class="modal-field-value">${track.lapRecordHolder}</div>
        </div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">연도</div>
        <div class="modal-field-value">${track.lapRecordYear}</div>
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1rem; margin: 0 0 0.5rem 0;">정보</h3>
      <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">${track.description}</p>
    </div>
  `;

  document.getElementById('modal-track-content').innerHTML = content;
  toggleModal('track-modal', true);
}

console.log('Tracks page JS loaded');
