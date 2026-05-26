// F1 HUB — Teams Page JavaScript

let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];


// Load drivers to display in modal
async function loadDrivers() {
  try {
    const [flagsRes, activeRes, imagesRes] = await Promise.all([
      fetch('/data/nationality_flags.json'),
      fetch('/data/active_2026_drivers.json'),
      fetch('/data/driver_images.json')
    ]);
    const nationalityFlags = await flagsRes.json();
    const activeDrivers = await activeRes.json();
    const driverImages = await imagesRes.json();

    drivers = [];
    Object.keys(activeDrivers).forEach(key => {
      const active = activeDrivers[key];
      let id = key.replace('_', '-');
      let name = '';
      let flag = '🏁';

      if (key === 'max_verstappen') { id = 'max-verstappen'; name = 'Max Verstappen'; flag = '🇳🇱'; }
      else if (key === 'hadjar') { id = 'isack-hadjar'; name = 'Isack Hadjar'; flag = '🇫🇷'; }
      else if (key === 'hamilton') { id = 'lewis-hamilton'; name = 'Lewis Hamilton'; flag = '🇬🇧'; }
      else if (key === 'leclerc') { id = 'charles-leclerc'; name = 'Charles Leclerc'; flag = '🇲🇨'; }
      else if (key === 'norris') { id = 'lando-norris'; name = 'Lando Norris'; flag = '🇬🇧'; }
      else if (key === 'piastri') { id = 'oscar-piastri'; name = 'Oscar Piastri'; flag = '🇦🇺'; }
      else if (key === 'russell') { id = 'george-russell'; name = 'George Russell'; flag = '🇬🇧'; }
      else if (key === 'antonelli') { id = 'kimi-antonelli'; name = 'Kimi Antonelli'; flag = '🇮🇹'; }
      else if (key === 'alonso') { id = 'fernando-alonso'; name = 'Fernando Alonso'; flag = '🇪🇸'; }
      else if (key === 'stroll') { id = 'lance-stroll'; name = 'Lance Stroll'; flag = '🇨🇦'; }
      else if (key === 'sainz') { id = 'carlos-sainz'; name = 'Carlos Sainz'; flag = '🇪🇸'; }
      else if (key === 'albon') { id = 'alexander-albon'; name = 'Alexander Albon'; flag = '🇹🇭'; }
      else if (key === 'bearman') { id = 'oliver-bearman'; name = 'Oliver Bearman'; flag = '🇬🇧'; }
      else if (key === 'ocon') { id = 'esteban-ocon'; name = 'Esteban Ocon'; flag = '🇫🇷'; }
      else if (key === 'bortoleto') { id = 'gabriel-bortoleto'; name = 'Gabriel Bortoleto'; flag = '🇧🇷'; }
      else if (key === 'hulkenberg') { id = 'nico-hulkenberg'; name = 'Nico Hulkenberg'; flag = '🇩🇪'; }
      else if (key === 'colapinto') { id = 'franco-colapinto'; name = 'Franco Colapinto'; flag = '🇦🇷'; }
      else if (key === 'gasly') { id = 'pierre-gasly'; name = 'Pierre Gasly'; flag = '🇫🇷'; }
      else if (key === 'lawson') { id = 'liam-lawson'; name = 'Liam Lawson'; flag = '🇳🇿'; }
      else if (key === 'lindblad') { id = 'arvid-lindblad'; name = 'Arvid Lindblad'; flag = '🇬🇧'; }
      else if (key === 'perez') { id = 'sergio-perez'; name = 'Sergio Perez'; flag = '🇲🇽'; }
      else if (key === 'bottas') { id = 'valtteri-bottas'; name = 'Valtteri Bottas'; flag = '🇫🇮'; }

      const fallbackImage = 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp';
      const image = driverImages[key] || fallbackImage;

      drivers.push({
        id: id,
        name: name,
        number: active.number,
        flag: flag,
        image: image
      });
    });
  } catch (e) {
    console.error('Failed to load drivers info', e);
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const res = await fetch('/data/f1-data.json');
    const data = await res.json();
    teams = data.teams || [];
    tracks = data.tracks || [];
    machines = data.machines || [];
    raceEvents = data.raceEvents || [];
    ALL_DRIVERS = data.ALL_DRIVERS || [];
  } catch (e) { console.error('Failed to load f1-data', e); }

  await loadDrivers();

  renderTeams();
  setupModalClose('team-modal');
});

const TEAM_LOGOS = {
  'mclaren': 'https://i.namu.wiki/i/UmWlnoOQ7sQ9pROqTYqHr9UAI9k18K-9lOgqIOJDKgJUXNjISQbPXQrdqXfBTF82yq6cqiOtfgqS3IV3MEtLMpYX6uchDY9aQkMNXd0k4xb-COYQyfbYCx5ohGRV-noaURJoXuWRYeIri-Mjn40vfQ.svg',
  'mercedes': 'https://i.namu.wiki/i/k7PRpRwhmDOwhNcnteWFOYwCG8eSV1JjcobUjS0lnzMxWRLD2ogokzFr-7DLFXt8dAcm1ixImbwDOjuWPM9Aq3Jis58zAKYRua5Io6kBxV5S_MYz8l6v6ky9C5grutInP14UxQcG-ce1UtamTgIlGQ.svg',
  'red-bull': 'https://i.namu.wiki/i/mWd3sSjk55vh3IlK_txTBIMIJHTHTaRMQTOjRyD_jdLgC-GGeMqHaSXXL0cK5orMMF5pTd5SXrTD7LP3xiDlwe2RT1MAeg_DVrBmXm5-Krw_jSx7N16yvOQzTHAmmg51QP1LVnWtYQyOzVgEdUsrHw.svg',
  'ferrari': 'https://i.namu.wiki/i/90IqlN7dGX9wmfiXv0iXcxGxJhJBA6e2QD83Xd8i2YZAbPN_9kcx0Xi2uKl73bV3XtnOrgPYqMVyaq3n4K0WOlWHJ7YFLFWy29rBoxbXDdD78CUOYxlp370ZK3TK4ua1v4-IcGxWa0ukcQNxfnTczA.svg',
  'williams': 'https://i.namu.wiki/i/lZ0MJHxzTsQ7VZ5lafmry53hyZxlv6r4WsxFqXOHIsRUezRgpsqwtMO-bNUtYxwk1LYw8u137GnFFvbP-JO1DSXifySpaVO9mLZqfKcfZmBihuCNVhPJ_Rw5Rv-KOnSR5waIATUalLb-mnfyEUSMkA.webp',
  'racing-bulls': 'https://i.namu.wiki/i/KvLAZzWksv5hK-arTehPJic6aUjJoTUvDfxQuBY9RL7hJjTRifyzIVr74W3O3yT35Sygu-xoSLvQK1cKBQMH7qKvBBEFZa4465xw2DZroCqc9tKdrg3ZHy1xiSJ8M0c3HPxVSyvzB6WkMbUjh3cecg.webp',
  'aston-martin': 'https://i.namu.wiki/i/MGTWEGmUQGObWQ4YscnDLexQefkNrAfn9OucqFiFRM15a19DmytiZKk4UDSEAJ4SAC-ltrtP0KmFFSt4iPfnbZ-yA2JqZSmIQ_ewRqcFMBUbgyXG5_mnPW7885HgHj2AnRLTbdRMoZYYP5KlyQpXIQ.svg',
  'haas': 'https://i.namu.wiki/i/kWNwDiVS0Io-gEyvVVboatPIFn56TDxhNRnMTAUCj9UWaeYBoSMChM9igp5S6GbWExbFwQ3X-NdbW7sQwBwPuf3TinenV4LDsLEr10rqPxEXfBU67L0u1mgEWTwudocrEfVtObrrDFsWEScdtdZX0g.webp',
  'audi': 'https://i.namu.wiki/i/RgVhLL0JKUix55ccqVI9R8tnC-Nf45RpLBGYg-f9vwCezuMdOflq9Qu3dwc-DCEKK16ATIONPFDwfEK63ACZkIaWKdiOCsOLGv7i9_K61RrcPayBgf65ttHjvNI7_F6k82aEzWak56OQsbkc2dPUSA.svg',
  'alpine': 'https://i.namu.wiki/i/neoN1xAyZWtxwP8xB2meYp_j3qrdRhW4J2QW0JXxIIP4EleZsLjr0qczlLmFJlR_FRijyPbnbKS7BTpdx3aa5m1eFv0Yu8BVpkPYUQwAuVOxReeN1T9PPResq7X5_f9g303xnkNw5NWD30k1q0AKzQ.webp',
  'cadillac': 'https://i.namu.wiki/i/QuhzrjEDQy6kKyOr24iOftyiHXMG-M4AiM7P2c1lhDhWx6D_JQZ3zVJcsk51ScZxkCoy3THl7iCUyQoPUI56LeLHm-E3eGlLOnYwaKjKTVfDp577GLa4IMPPwXz2AN67bnjRVOVHfkAh5z8M3wwkeQ.svg'
};

// Render teams
function renderTeams() {
  const grid = document.getElementById('teams-grid');
  if (!grid) return;

  grid.innerHTML = teams.map(team => {
    const logoUrl = TEAM_LOGOS[team.id] || '';
    const logoImg = logoUrl ? `<img src="${logoUrl}" alt="${team.name}" style="max-height: 60px; max-width: 80%; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));" />` : '🏎️';
    return `
    <div class="card" onclick="showTeamModal('${team.id}')" style="border-left: 4px solid ${team.color};">
      <div style="height: 100px; background: linear-gradient(135deg, ${team.color}20 0%, ${team.color}10 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; font-size: 2rem;">
        ${logoImg}
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
    `;
  }).join('');
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
            <div style="padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 6px; display: flex; align-items: center; gap: 0.75rem; border: 1px solid rgba(255,255,255,0.03);">
              <div style="width: 42px; height: 42px; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                <img src="${driver.image}" alt="${driver.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center top;" />
              </div>
              <div style="flex-grow: 1;">
                <div style="font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.35rem; color: #fff;">
                  <span>${driver.flag}</span>
                  <span>${driver.name}</span>
                </div>
                <div style="font-size: 0.75rem; color: #707080; font-family: Orbitron; font-weight: 700; margin-top: 0.15rem;">#${driver.number}</div>
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
