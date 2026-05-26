// F1 HUB — Machines Page JavaScript

let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];


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

  renderMachines();
  setupModalClose('machine-modal');
});

const TEAM_LOGOS = {
  'mclaren': 'https://i.namu.wiki/i/UmWlnoOQ7sQ9pROqTYqHr9UAI9k18K-9lOgqIOJDKgJUXNjISQbPXQrdqXfBTF82yq6cqiOtfgqS3IV3MEtLMpYX6uchDY9aQkMNXd0k4xb-COYQyfbYCx5ohGRV-noaURJoXuWRYeIri-Mjn40vfQ.svg',
  'mercedes': 'https://i.namu.wiki/i/k7PRpRwhmDOwhNcnteWFOYwCG8eSV1JjcobUjS0lnzMxWRLD2ogokzFr-7DLFXt8dAcm1ixImbwDOjuWPM9Aq3Jis58zAKYRua5Io6kBxV5S_MYz8l6v6ky9C5grutInP14UxQcG-ce1UtamTgIlGQ.svg',
  'red-bull': 'https://i.namu.wiki/i/mWd3sSjk55vh3IlK_txTBIMIJHTHTaRMQTOjRyD_jdLgC-GGeMqHaSXXL0cK5orMMF5pTd5SXrTD7LP3xiDlwe2RT1MAeg_DVrBmXm5-Krw_jSx7N16yvOQzTHAmmg51QP1LVnWtYQyOzVgEdUsrHw.svg',
  'ferrari': 'https://i.namu.wiki/i/90IqlN7dGX9wmfiXv0iXcxGxJhJBA6e2QD83Xd8i2YZAbPN_9kcx0Xi2uKl73bV3XtnOrgPYqMVyaq3n4K0WOlWHJ7YFLFWy29rBoxbXDdD78CUOYxlp370ZK3TK4ua1v4-IcGxWa0ukcQNxfnTczA.svg',
  'williams': 'https://i.namu.wiki/i/lZ0MJHxzTsQ7VZ5lafmry53hyZxlv6r4WsxFqXOHIsRUezRgpsqwtMO-bNUtYxwk1LYw8u137GnFFvbP-JO1DSXifySpaVO9mLZqfKcfZmBihuCNVhPJ_Rw5Rv-KOnSR5waIATUalLb-mnfyEUSMkA.webp',
  'racing-bulls': 'https://i.namu.wiki/i/KvLAZzWksv5hK-arTehPJic6aUjJoTUvDfxQuBY9RL7hJjTRifyzIVr74W3O3yT35Sygu-xoSLvQK1cKBQMH7qKvBBEFZa4465xw2DZroCqc9tKdrg3ZHy1xiSJ8M0c3HPxVSyvzB6WkMbUjh3cecg.webp',
  'aston-martin': 'https://i.namu.wiki/i/MGTWEGmUQGObWQ4YscnDLexQefkNrAfn9OucqFiFRM15a19DmytiZKk4UDSEAJ4SAC-ltrtP0KmFFSt4iPfnbZ-yA2JqZSmIQ_ewRqcFMBUbgyXG5_mnPW7885HgHj2AnRLTbdRMoZYYP5KlyQpXIQ.svg',
  'haas': 'https://i.namu.wiki/i/kWNwDiVS0Io-gEyvVVboatPIFn56TDxhNRnMTAUCj9UWaeYBoSMChM9igp5S6GbWExbFwQ3X-NdbW7sQwPuf3TinenV4LDsLEr10rqPxEXfBU67L0u1mgEWTwudocrEfVtObrrDFsWEScdtdZX0g.webp',
  'audi': 'https://i.namu.wiki/i/RgVhLL0JKUix55ccqVI9R8tnC-Nf45RpLBGYg-f9vwCezuMdOflq9Qu3dwc-DCEKK16ATIONPFDwfEK63ACZkIaWKdiOCsOLGv7i9_K61RrcPayBgf65ttHjvNI7_F6k82aEzWak56OQsbkc2dPUSA.svg',
  'alpine': 'https://i.namu.wiki/i/neoN1xAyZWtxwP8xB2meYp_j3qrdRhW4J2QW0JXxIIP4EleZsLjr0qczlLmFJlR_FRijyPbnbKS7BTpdx3aa5m1eFv0Yu8BVpkPYUQwAuVOxReeN1T9PPResq7X5_f9g303xnkNw5NWD30k1q0AKzQ.webp',
  'cadillac': 'https://i.namu.wiki/i/QuhzrjEDQy6kKyOr24iOftyiHXMG-M4AiM7P2c1lhDhWx6D_JQZ3zVJcsk51ScZxkCoy3THl7iCUyQoPUI56LeLHm-E3eGlLOnYwaKjKTVfDp577GLa4IMPPwXz2AN67bnjRVOVHfkAh5z8M3wwkeQ.svg'
};

// Render machines
function renderMachines() {
  const grid = document.getElementById('machines-grid');
  if (!grid) return;

  grid.innerHTML = machines.map(machine => {
    const team = teams.find(t => t.id === machine.teamId);
    const logoUrl = TEAM_LOGOS[machine.teamId] || '';
    const logoImg = logoUrl ? `<img src="${logoUrl}" alt="${team?.name || ''}" style="max-height: 60px; max-width: 80%; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));" />` : '🏎️';
    return `
      <div class="card" onclick="showMachineModal('${machine.id}')" style="border-left: 4px solid ${team?.color || '#fff'};">
        <div style="height: 100px; background: linear-gradient(135deg, ${team?.color || '#fff'}20 0%, ${team?.color || '#fff'}10 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; font-size: 2rem;">
          ${logoImg}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">${machine.name}</h3>
            <p style="font-size: 0.875rem; margin: 0; color: #707080;">${team?.name || 'Unknown'}</p>
          </div>
          <span style="font-family: Orbitron; font-weight: 900; color: ${team?.color || '#fff'}; font-size: 0.875rem;">${machine.year}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
            <div style="font-size: 0.75rem; color: #707080;">무게</div>
            <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${machine.weight} kg</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
            <div style="font-size: 0.75rem; color: #707080;">파워 유닛</div>
            <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${machine.powerUnit}</div>
          </div>
        </div>
        <p style="font-size: 0.875rem; margin: 0; color: #b0b0c0; line-height: 1.4;">${machine.description}</p>
      </div>
    `;
  }).join('');
}

// Show machine modal
function showMachineModal(machineId) {
  const machine = machines.find(m => m.id === machineId);
  if (!machine) return;

  const team = teams.find(t => t.id === machine.teamId);

  document.getElementById('modal-machine-name').textContent = machine.name;
  document.getElementById('modal-machine-team').textContent = `${team?.name || 'Unknown'} • ${machine.year}`;

  const specsHtml = machine.specs.map(spec => `
    <div class="modal-field">
      <div class="modal-field-label">${spec.label}</div>
      <div class="modal-field-value">${spec.value}</div>
    </div>
  `).join('');

  const content = `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">기술 사양</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        ${specsHtml}
      </div>
    </div>

    <div style="padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1rem; margin: 0 0 0.5rem 0;">설명</h3>
      <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">${machine.description}</p>
    </div>
  `;

  document.getElementById('modal-machine-content').innerHTML = content;
  toggleModal('machine-modal', true);
}

console.log('Machines page JS loaded');
