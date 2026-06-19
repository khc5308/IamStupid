// F1 HUB — Machines Page JavaScript

const NATIONALITY_FLAGS = {
  // Countries
  'bahrain': '🇧🇭',
  'saudi arabia': '🇸🇦',
  'australia': '🇦🇺',
  'japan': '🇯🇵',
  'china': '🇨🇳',
  'usa': '🇺🇸',
  'italy': '🇮🇹',
  'monaco': '🇲🇨',
  'canada': '🇨🇦',
  'spain': '🇪🇸',
  'austria': '🇦🇹',
  'united kingdom': '🇬🇧',
  'great britain': '🇬🇧',
  'hungary': '🇭🇺',
  'belgium': '🇧🇪',
  'netherlands': '🇳🇱',
  'azerbaijan': '🇦🇿',
  'singapore': '🇸🇬',
  'mexico': '🇲🇽',
  'brazil': '🇧🇷',
  'qatar': '🇶🇦',
  'uae': '🇦🇪',
  
  // Nationalities
  'british': '🇬🇧',
  'monegasque': '🇲🇨',
  'australian': '🇦🇺',
  'spanish': '🇪🇸',
  'dutch': '🇳🇱',
  'french': '🇫🇷',
  'german': '🇩🇪',
  'canadian': '🇨🇦',
  'japanese': '🇯🇵',
  'finnish': '🇫🇮',
  'mexican': '🇲🇽',
  'danish': '🇩🇰',
  'chinese': '🇨🇳',
  'thai': '🇹🇭',
  'new zealander': '🇳🇿',
  'argentine': '🇦🇷',
  'american': '🇺🇸'
};

const MACHINE_IMAGES = {
  'mercedes': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/mercedes/2026mercedescarright.webp',
  'ferrari': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/ferrari/2026ferraricarright.webp',
  'mclaren': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/mclaren/2026mclarencarright.webp',
  'red-bull': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/redbullracing/2026redbullracingcarright.webp',
  'aston-martin': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/astonmartin/2026astonmartincarright.webp',
  'alpine': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/alpine/2026alpinecarright.webp',
  'racing-bulls': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/racingbulls/2026racingbullscarright.webp',
  'haas': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/haasf1team/2026haasf1teamcarright.webp',
  'williams': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/williams/2026williamscarright.webp',
  'audi': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/audi/2026audicarright.webp',
  'cadillac': 'https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/cadillac/2026cadillaccarright.webp'
};

let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];

// Load drivers to display in machine modal
async function loadDrivers() {
  try {
    let activeDrivers = {};

    const activeRes = await fetch('/data/active_2026_drivers.json').catch(() => ({ ok: false }));

    if (activeRes && activeRes.ok) {
      try { activeDrivers = await activeRes.json(); } catch (e) {}
    }

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
      const image = active.image || fallbackImage;

      drivers.push({
        id: id,
        name: name,
        number: active.number,
        flag: '',
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
  renderMachines();
  setupModalClose('machine-modal');
});

// Render machines
function renderMachines() {
  const grid = document.getElementById('machines-grid');
  if (!grid) return;

  grid.innerHTML = machines.map(machine => {
    const team = teams.find(t => t.id === machine.teamId);
    const carImgUrl = MACHINE_IMAGES[machine.teamId] || 'https://media.formula1.com/image/upload/c_fill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp';
    const teamColor = team?.color || '#707080';

    return `
      <div class="card" onclick="showMachineModal('${machine.id}')" style="border-top: 4px solid ${teamColor}; relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        <div>
          <div style="height: 200px; background: linear-gradient(135deg, ${teamColor}15 0%, ${teamColor}05 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.03); position: relative; overflow: hidden;">
            <img src="${carImgUrl}" alt="${machine.name}" style="height: auto; width: 90%; object-fit: contain;" class="machine-card-img" />
          </div>
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
              <h3 style="font-size: 1.1rem; margin: 0 0 0.25rem 0; font-family: 'Exo 2', sans-serif; font-weight: 700; color: #fff;">${machine.name}</h3>
              <p style="font-size: 0.825rem; margin: 0; color: #a0a0b0; font-weight: 500; display: flex; align-items: center; gap: 0.35rem;">
                ${getTeamLogoUrl(team?.name) ? `<img src="${getTeamLogoUrl(team?.name)}" alt="${team?.name}" style="height: 12px; max-width: 25px; object-fit: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));" />` : '🏎️'} 
                ${team?.name || 'Unknown'}
              </p>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-bottom: 1rem;">
            <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); text-align: center;">
              <div style="font-size: 0.7rem; color: #707080; font-family: 'Exo 2'; text-transform: uppercase;">파워 유닛</div>
              <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.825rem; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${machine.powerUnit}">${machine.powerUnit}</div>
            </div>
          </div>
        </div>
        ${machine.description ? `<p style="font-size: 0.8rem; margin: 0; color: #8e8e9e; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; margin-top: auto;">${machine.description}</p>` : ''}
      </div>
    `;
  }).join('');
}

// Show machine modal
function showMachineModal(machineId) {
  const machine = machines.find(m => m.id === machineId);
  if (!machine) return;

  const team = teams.find(t => t.id === machine.teamId);
  const carImgUrl = MACHINE_IMAGES[machine.teamId] || 'https://media.formula1.com/image/upload/c_fill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp';
  const teamColor = team?.color || '#707080';

  const logoUrl = getTeamLogoUrl(team?.name || '');
  const logoImg = logoUrl ? `<img src="${logoUrl}" alt="${team?.name}" style="height: 16px; max-width: 40px; object-fit: contain; vertical-align: middle; margin-right: 6px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));" />` : '';
  
  document.getElementById('modal-machine-name').textContent = machine.name;
  document.getElementById('modal-machine-team').innerHTML = `${logoImg} ${team?.name || 'Unknown'}`;

  const content = `
    <style>
        .premium-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        .premium-stat-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 6px;
            padding: 0.75rem;
            text-align: center;
            transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .premium-stat-card:hover {
            border-color: ${teamColor}50;
            transform: translateY(-2px);
            background: linear-gradient(135deg, ${teamColor}10 0%, rgba(255,255,255,0.01) 100%);
        }
        .premium-stat-label {
            font-size: 0.65rem;
            color: #8c8c9e;
            text-transform: uppercase;
            font-family: 'Exo 2', sans-serif;
            font-weight: 700;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }
        .premium-stat-value {
            font-family: 'Orbitron', sans-serif;
            font-weight: 900;
            font-size: 1.25rem;
            color: #fff;
        }
        .premium-stat-highlight {
            color: ${teamColor};
            text-shadow: 0 0 10px ${teamColor}40;
        }
        .detail-section-title {
            font-family: 'Exo 2', sans-serif;
            font-weight: 700;
            font-size: 0.9rem;
            margin: 1.75rem 0 0.75rem;
            padding-bottom: 0.35rem;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .stats-sub-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
        }
        .timeline-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }
        .timeline-item {
            background: rgba(255,255,255,0.02);
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.04);
            transition: border-color 0.2s ease;
        }
        .timeline-item:hover {
            border-color: rgba(255,255,255,0.08);
        }
        .timeline-label {
            font-size: 0.7rem;
            color: #707080;
            font-family: 'Exo 2', sans-serif;
            font-weight: 600;
        }
        .timeline-value {
            font-size: 0.85rem;
            font-weight: 700;
            color: #e2e2e7;
            margin-top: 0.25rem;
        }
        .bio-box {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255,255,255,0.03);
            border-radius: 6px;
            padding: 1rem;
            font-size: 0.825rem;
            line-height: 1.6;
            color: #b0b0c0;
            margin-top: 1.5rem;
        }
        .badge-indicator {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: ${teamColor};
            box-shadow: 0 0 8px ${teamColor};
        }
        @media (max-width: 576px) {
            .premium-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .stats-sub-grid {
                grid-template-columns: 1fr;
            }
            .timeline-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>

    <!-- Machine Visual Spotlight Header -->
    <div style="height: 180px; background: linear-gradient(135deg, ${teamColor}15 0%, ${teamColor}05 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.03); overflow: hidden; position: relative;">
      <img src="${carImgUrl}" alt="${machine.name}" style="height: auto; width: 85%; object-fit: contain;" />
    </div>

    <!-- 핵심 차량 규격 히어로 -->
    <h3 class="detail-section-title"><span class="badge-indicator"></span> 레이스 카 제원 요약</h3>
    <div class="premium-grid">
        <div class="premium-stat-card">
            <div class="premium-stat-label">파워 유닛</div>
            <div class="premium-stat-value" style="font-size: 0.825rem; font-weight: 700; padding-top: 0.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${machine.powerUnit}">${machine.powerUnit}</div>
        </div>
        <div class="premium-stat-card">
            <div class="premium-stat-label">소속 드라이버</div>
            <div class="premium-stat-value">${team?.drivers?.length || 0}명</div>
        </div>
    </div>

    <!-- 세부 기술 사양 격자 -->
    <h3 class="detail-section-title"><span class="badge-indicator"></span> 세부 기술 규격</h3>
    <div class="stats-sub-grid">
        ${machine.specs.map(spec => `
            <div class="premium-stat-card" style="text-align: left; padding: 0.75rem 1rem;">
                <div class="premium-stat-label" style="text-align: left;">${spec.label}</div>
                <div class="premium-stat-value" style="font-size: 0.85rem; font-weight: 700; color: #e2e2e7; margin-top: 0.15rem; font-family: sans-serif; text-align: left;">${spec.value}</div>
            </div>
        `).join('')}
    </div>

    <!-- 탑승 드라이버 라인업 -->
    <h3 class="detail-section-title"><span class="badge-indicator"></span> 차량 드라이버 라인업</h3>
    <div class="timeline-grid">
        ${team?.drivers ? team.drivers.map(driverId => {
          const driver = drivers.find(d => d.id === driverId);
          return driver ? `
            <div class="timeline-item" style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                <img src="${driver.image}" alt="${driver.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center top;" />
              </div>
              <div style="flex-grow: 1;">
                <div style="font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem; color: #fff;">
                  <span>${driver.flag}</span>
                  <span>${driver.name}</span>
                </div>
                <div style="font-size: 0.7rem; color: ${teamColor}; font-family: Orbitron; font-weight: 700; margin-top: 0.15rem;">#${driver.number}</div>
              </div>
            </div>
          ` : '';
        }).join('') : '<p style="color: var(--text-secondary); font-size: 0.875rem;">드라이버 정보를 불러올 수 없습니다.</p>'}
    </div>

    <!-- 바이오 -->
    ${machine.description ? `
    <div class="bio-box">
        <div style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:0.75rem; color:#fff; text-transform:uppercase; margin-bottom:0.5rem; letter-spacing:0.05em;">차량 정보 및 특징</div>
        <div>${machine.description}</div>
    </div>
    ` : ''}
  `;

  document.getElementById('modal-machine-content').innerHTML = content;
  toggleModal('machine-modal', true);
}

console.log('Machines page JS loaded');
