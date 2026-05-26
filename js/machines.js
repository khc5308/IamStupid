// F1 HUB — Machines Page JavaScript

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

  renderMachines();
  setupModalClose('machine-modal');
});

// Render machines
function renderMachines() {
  const grid = document.getElementById('machines-grid');
  if (!grid) return;

  grid.innerHTML = machines.map(machine => {
    const team = teams.find(t => t.id === machine.teamId);
    return `
      <div class="card" onclick="showMachineModal('${machine.id}')" style="border-left: 4px solid ${team?.color || '#fff'};">
        <div style="height: 100px; background: linear-gradient(135deg, ${team?.color || '#fff'}20 0%, ${team?.color || '#fff'}10 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; font-size: 2rem;">
          🏎️
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
