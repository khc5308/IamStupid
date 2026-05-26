// F1 HUB — Dashboard JavaScript

let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];

const MOCK_EVENTS = [
  {
    type: 'penalty',
    race: '호주 그랑프리 (Australian GP)',
    driver: '맥스 베르스타펜',
    description: '트랙 이탈 및 이득 획득으로 5초 페널티 부여.'
  },
  {
    type: 'incident',
    race: '호주 그랑프리 (Australian GP)',
    driver: '조지 러셀',
    description: '오스카 피아스트리와의 가벼운 접촉 사고로 차량 전면 프론트 윙 파손.'
  },
  {
    type: 'dnf',
    race: '호주 그랑프리 (Australian GP)',
    driver: '루이스 해밀턴',
    description: '레이스 24랩에서 엔진 하이브리드 시스템 고장으로 아쉬운 리타이어.'
  },
  {
    type: 'safety-car',
    race: '바레인 그랑프리 (Bahrain GP)',
    driver: '',
    description: '트랙 잔해 청소를 위해 세이프티카 발령.'
  },
  {
    type: 'red-flag',
    race: '사우디아라비아 그랑프리 (Saudi Arabian GP)',
    driver: '',
    description: '피트월 방호벽 파손 복구를 위해 세션 적기(Red Flag) 중단.'
  },
  {
    type: 'investigation',
    race: '중국 그랑프리 (Chinese GP)',
    driver: '샤를 르클레르',
    description: '황색 기 발령 중 감속 미이행 여부로 레이스 종료 후 심사 진행 중.'
  }
];

const TEAM_LOGOS = {
  'mclaren': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/mclaren/2025mclarenlogowhite.webp',
  'mercedes': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp',
  'red-bull': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp',
  'ferrari': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/ferrari/2025ferrarilogolight.webp',
  'williams': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/williams/2025williamslogowhite.webp',
  'racing-bulls': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/racingbulls/2025racingbullslogowhite.webp',
  'aston-martin': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp',
  'haas': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/haas/2025haaslogowhite.webp',
  'audi': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
  'alpine': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2025/alpine/2025alpinelogowhite.webp',
  'cadillac': 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp'
};

const constructorIdMap = {
  'red_bull': 'red-bull',
  'aston_martin': 'aston-martin',
  'haas_f1_team': 'haas',
  'rb_f1_team': 'racing-bulls',
  'rb': 'racing-bulls',
  'alpine': 'alpine',
  'audi': 'audi',
  'cadillac': 'cadillac',
  'mclaren': 'mclaren',
  'mercedes': 'mercedes',
  'ferrari': 'ferrari',
  'williams': 'williams'
};

async function loadDashboardData() {
  try {
    // 1. Fetch f1-data.json
    const f1Res = await fetch('/data/f1-data.json');
    const f1Data = await f1Res.json();
    teams = f1Data.teams || [];
    tracks = f1Data.tracks || [];
    machines = f1Data.machines || [];
    raceEvents = f1Data.raceEvents || [];
    ALL_DRIVERS = f1Data.ALL_DRIVERS || [];

    // 2. Fetch flags and images
    const [flagsRes, imagesRes, standingsRes] = await Promise.all([
      fetch('/data/nationality_flags.json'),
      fetch('/data/driver_images.json'),
      fetch('/standings/2026')
    ]);
    const nationalityFlags = await flagsRes.json();
    const driverImages = await imagesRes.json();
    const standingsData = await standingsRes.json();

    if (standingsData && standingsData.drivers) {
      const fallbackImage = 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp';
      drivers = standingsData.drivers.map(d => {
        const flag = nationalityFlags[d.driverNationality.toLowerCase()] || '';
        const image = driverImages[d.driverId] || fallbackImage;
        return {
          id: d.driverId,
          name: `${d.givenName} ${d.familyName}`,
          team: d.team,
          flag: flag,
          points: d.points,
          image: image
        };
      });
    }

    if (standingsData && standingsData.constructors) {
      // Map API constructor points back to our teams objects
      standingsData.constructors.forEach(c => {
        const localId = constructorIdMap[c.constructorId] || c.constructorId;
        const localTeam = teams.find(t => t.id === localId);
        if (localTeam) {
          localTeam.points = c.points;
        }
      });
    }
  } catch (e) {
    console.error('Failed to load dashboard data from FastF1', e);
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  await loadDashboardData();

  if (raceEvents.length === 0) {
    raceEvents = MOCK_EVENTS;
  }

  renderDriverStandings();
  renderConstructorStandings();
  renderRecentEvents();
});

// Render driver standings
function renderDriverStandings() {
  const container = document.getElementById('driver-standings');
  if (!container) return;

  // Render top 22
  const top22 = drivers.slice(0, 22);

  container.innerHTML = top22.map((driver, idx) => `
    <div class="standing-item" style="gap: 0.85rem;">
      <div class="standing-pos">${idx + 1}</div>
      <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
        <img src="${driver.image}" alt="${driver.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center top;" />
      </div>
      <div class="standing-info">
        <div class="standing-name" style="display: flex; align-items: center; gap: 0.35rem;">
          <span>${driver.name}</span>
          ${driver.flag ? `<span style="font-size: 0.75rem;">${driver.flag}</span>` : ''}
        </div>
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
  const top11 = sorted.slice(0, 11);

  container.innerHTML = top11.map((team, idx) => {
    const logoUrl = TEAM_LOGOS[team.id] || '';
    const logoHtml = logoUrl 
      ? `<div style="width: 32px; height: 32px; background: rgba(255,255,255,0.02); border-radius: 4px; display: flex; align-items: center; justify-content: center; padding: 0.2rem; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.05);">
           <img src="${logoUrl}" alt="${team.name}" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 1px 4px rgba(0,0,0,0.25));" />
         </div>`
      : `<div style="width: 32px; height: 32px; background: ${team.color}; border-radius: 4px; flex-shrink: 0;"></div>`;

    return `
      <div class="standing-item" style="gap: 0.85rem;">
        <div class="standing-pos">${idx + 1}</div>
        ${logoHtml}
        <div class="standing-info">
          <div class="standing-name">${team.shortName}</div>
          <div class="standing-team">${team.name}</div>
        </div>
        <div class="standing-points">${team.points}</div>
      </div>
    `;
  }).join('');
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

  container.innerHTML = recent.map(event => {
    const badgeColor = getCategoryColor(event.type);
    return `
      <div class="event-item">
        <div class="event-badge" style="background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}30;">
          ${eventTypes[event.type] || '이벤트'}
        </div>
        <div class="event-title">${event.race}</div>
        <div class="event-desc">
          ${event.driver ? `<strong style="color: #fff;">${event.driver}</strong> — ` : ''}${event.description}
        </div>
      </div>
    `;
  }).join('');

  // Update event count
  const eventCount = document.getElementById('event-count');
  if (eventCount) {
    eventCount.textContent = raceEvents.length;
  }
}

console.log('Dashboard JS loaded with FastF1 support');
