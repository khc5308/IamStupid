// F1 HUB — Drivers Page JavaScript

let filteredDrivers = [...drivers];

document.addEventListener('DOMContentLoaded', function() {
  renderDrivers();
  setupSearch();
  setupModalClose('driver-modal');
});

// Render drivers
function renderDrivers() {
  const grid = document.getElementById('drivers-grid');
  if (!grid) return;

  if (filteredDrivers.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><p>검색 결과가 없습니다.</p></div>';
    return;
  }

  grid.innerHTML = filteredDrivers.map(driver => `
    <div class="card" onclick="showDriverModal('${driver.id}')">
      <div style="height: 120px; background: linear-gradient(135deg, ${driver.teamColor}20 0%, ${driver.teamColor}10 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; font-size: 3rem;">
        ${driver.flag}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div>
          <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">${driver.name}</h3>
          <p style="font-size: 0.875rem; margin: 0; color: #707080;">${driver.team}</p>
        </div>
        <span style="font-family: Orbitron; font-weight: 900; color: ${driver.teamColor}; font-size: 1.25rem;">#${driver.number}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
        <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
          <div style="font-size: 0.75rem; color: #707080;">포인트</div>
          <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${driver.points}</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
          <div style="font-size: 0.75rem; color: #707080;">우승</div>
          <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${driver.wins}</div>
        </div>
      </div>
      <p style="font-size: 0.875rem; margin: 0; color: #b0b0c0; line-height: 1.4;">${driver.bio}</p>
    </div>
  `).join('');
}

// Setup search
function setupSearch() {
  const searchInput = document.getElementById('driver-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredDrivers = drivers.filter(d => 
      d.name.toLowerCase().includes(term) || 
      d.team.toLowerCase().includes(term) ||
      d.nationality.toLowerCase().includes(term)
    );
    renderDrivers();
  });
}

// Show driver modal
function showDriverModal(driverId) {
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return;

  document.getElementById('modal-driver-name').textContent = driver.name;
  document.getElementById('modal-driver-team').textContent = `${driver.team} • ${driver.flag} ${driver.nationality}`;

  const content = `
    <div class="modal-section">
      <div class="modal-field">
        <div class="modal-field-label">번호</div>
        <div class="modal-field-value">#${driver.number}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">나이</div>
        <div class="modal-field-value">${driver.age}세</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">포인트</div>
        <div class="modal-field-value">${driver.points}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">우승</div>
        <div class="modal-field-value">${driver.wins}</div>
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">시즌 스탯</h3>
      <div class="modal-section">
        <div class="modal-field">
          <div class="modal-field-label">폴 포지션</div>
          <div class="modal-field-value">${driver.poles}</div>
        </div>
        <div class="modal-field">
          <div class="modal-field-label">포디엄</div>
          <div class="modal-field-value">${driver.podiums}</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1rem; margin: 0 0 0.5rem 0;">소개</h3>
      <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">${driver.bio}</p>
    </div>
  `;

  document.getElementById('modal-driver-content').innerHTML = content;
  toggleModal('driver-modal', true);
}

console.log('Drivers page JS loaded');
