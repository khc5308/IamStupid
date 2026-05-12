// F1 HUB — Teams Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  renderTeams();
  setupModalClose('team-modal');
});

// Render teams
function renderTeams() {
  const grid = document.getElementById('teams-grid');
  if (!grid) return;

  grid.innerHTML = teams.map(team => `
    <div class="card" onclick="showTeamModal('${team.id}')" style="border-left: 4px solid ${team.color};">
      <div style="height: 100px; background: linear-gradient(135deg, ${team.color}20 0%, ${team.color}10 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; font-size: 2rem;">
        🏎️
      </div>
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div>
          <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">${team.name}</h3>
          <p style="font-size: 0.875rem; margin: 0; color: #707080;">${team.base}</p>
        </div>
        <span style="font-family: Orbitron; font-weight: 900; color: ${team.color}; font-size: 0.875rem;">${team.shortName}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
        <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; text-align: center;">
          <div style="font-size: 0.75rem; color: #707080;">포인트</div>
          <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${team.points}</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; text-align: center;">
          <div style="font-size: 0.75rem; color: #707080;">우승</div>
          <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${team.wins}</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; text-align: center;">
          <div style="font-size: 0.75rem; color: #707080;">챔피언</div>
          <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${team.championships}</div>
        </div>
      </div>
      <p style="font-size: 0.875rem; margin: 0; color: #b0b0c0; line-height: 1.4;">${team.bio}</p>
    </div>
  `).join('');
}

// Show team modal
function showTeamModal(teamId) {
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  document.getElementById('modal-team-name').textContent = team.name;
  document.getElementById('modal-team-info').textContent = `${team.base} • 설립 ${team.founded}년`;

  const content = `
    <div class="modal-section">
      <div class="modal-field">
        <div class="modal-field-label">팀 프린시펄</div>
        <div class="modal-field-value">${team.teamPrincipal}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">엔진</div>
        <div class="modal-field-value">${team.engine}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">포인트</div>
        <div class="modal-field-value">${team.points}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">우승</div>
        <div class="modal-field-value">${team.wins}</div>
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">드라이버 라인업</h3>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${team.drivers.map(driverId => {
          const driver = drivers.find(d => d.id === driverId);
          return driver ? `
            <div style="padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.25rem;">${driver.flag}</span>
              <div>
                <div style="font-weight: 600; font-size: 0.875rem;">${driver.name}</div>
                <div style="font-size: 0.75rem; color: #707080;">#${driver.number}</div>
              </div>
            </div>
          ` : '';
        }).join('')}
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1rem; margin: 0 0 0.5rem 0;">소개</h3>
      <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">${team.bio}</p>
    </div>
  `;

  document.getElementById('modal-team-content').innerHTML = content;
  toggleModal('team-modal', true);
}

console.log('Teams page JS loaded');
