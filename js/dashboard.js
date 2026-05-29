// F1 HUB — Dashboard JavaScript

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
    ALL_DRIVERS = f1Data.ALL_DRIVERS || [];

    // 2. Fetch Grand Prix schedule events dynamically
    try {
      const currentYear = new Date().getFullYear();
      const gpRes = await fetch(`/events/${currentYear}`);
      if (gpRes.ok) {
        const gpData = await gpRes.json();
        raceEvents = gpData.events || [];
      }
    } catch (gpErr) {
      console.error('Failed to fetch Grand Prix events', gpErr);
      raceEvents = [];
    }

    // 3. Fetch flags and integrated active drivers safely
    let nationalityFlags = { ...NATIONALITY_FLAGS };
    let activeDriversData = {};
    let standingsData = {};

    try {
      const [flagsRes, activeDriversRes, standingsRes] = await Promise.all([
        fetch('/data/nationality_flags.json').catch(() => ({ ok: false })),
        fetch('/data/active_2026_drivers.json').catch(() => ({ ok: false })),
        fetch('/standings/2026').catch(() => ({ ok: false }))
      ]);

      if (flagsRes && flagsRes.ok) {
        try {
          const flagsData = await flagsRes.json();
          nationalityFlags = { ...nationalityFlags, ...flagsData };
        } catch (e) {}
      }

      if (activeDriversRes && activeDriversRes.ok) {
        try {
          activeDriversData = await activeDriversRes.json();
        } catch (e) {}
      }

      if (standingsRes && standingsRes.ok) {
        try {
          standingsData = await standingsRes.json();
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed in parallel fetches', err);
    }

    if (standingsData && standingsData.drivers) {
      const fallbackImage = 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp';
      drivers = standingsData.drivers.map(d => {
        const flag = nationalityFlags[d.driverNationality.toLowerCase()] || '';
        const image = (activeDriversData[d.driverId] && activeDriversData[d.driverId].image) || fallbackImage;
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
// Render recent events
async function renderRecentEvents() {
  const container = document.getElementById('recent-events');
  if (!container) return;

  let nationalityFlags = { ...NATIONALITY_FLAGS };
  try {
    const flagsRes = await fetch('/data/nationality_flags.json');
    if (flagsRes.ok) {
      const flagsData = await flagsRes.json();
      nationalityFlags = { ...nationalityFlags, ...flagsData };
    }
  } catch (e) {
    console.error('Failed to load flags for dashboard events, using fallback', e);
  }

  if (raceEvents.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
        표시할 그랑프리가 없습니다.
      </div>
    `;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Find the index of the most recently held Grand Prix
  let lastHeldIndex = -1;
  for (let i = 0; i < raceEvents.length; i++) {
    const event = raceEvents[i];
    if (event.date && event.date !== 'N/A') {
      const eventDate = new Date(event.date);
      if (eventDate < today) {
        lastHeldIndex = i; // Keep updating to find the latest held event
      }
    }
  }

  // 2. Select 5 events: 2 before and 2 after the last held event
  let recent = [];
  let startIndex = 0;
  if (lastHeldIndex === -1) {
    // No events held yet, show first 5
    recent = raceEvents.slice(0, 5);
  } else {
    let start = lastHeldIndex - 2;
    let end = lastHeldIndex + 2;

    // Adjust boundaries to always get 5 items if possible
    if (start < 0) {
      start = 0;
      end = Math.min(4, raceEvents.length - 1);
    }
    if (end >= raceEvents.length) {
      end = raceEvents.length - 1;
      start = Math.max(0, end - 4);
    }
    startIndex = start;
    recent = raceEvents.slice(start, end + 1);
  }

  container.innerHTML = recent.map((event, idx) => {
    const globalIdx = startIndex + idx;
    const isLatestHeld = globalIdx === lastHeldIndex;
    const countryKey = event.country ? event.country.toLowerCase() : '';
    const flag = nationalityFlags[countryKey] || '';

    // Highlight the latest held grand prix
    let extraBadge = "";
    let itemStyle = "border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.85rem; margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.25rem;";
    
    if (isLatestHeld) {
      extraBadge = `
        <span class="event-badge" style="background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); font-family: 'Exo 2'; font-weight: 700; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.25rem;">
          LATEST ⚡
        </span>
      `;
      itemStyle = "border: 1px solid rgba(46, 204, 113, 0.2); background: rgba(46, 204, 113, 0.03); border-radius: 6px; padding: 0.85rem; margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.25rem; box-shadow: 0 4px 12px rgba(46,204,113,0.05);";
    }

    return `
      <div class="event-item" style="${itemStyle}">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="event-badge" style="background: rgba(225, 6, 0, 0.1); color: var(--accent); border: 1px solid rgba(225, 6, 0, 0.2); font-family: 'Orbitron'; font-weight: 700; font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 4px; letter-spacing: 0.5px;">
              ROUND ${event.round}
            </span>
            ${extraBadge}
          </div>
          <span style="font-size: 1.25rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));">${flag}</span>
        </div>
        <div class="event-title" style="font-weight: 700; color: var(--text-primary); font-family: 'Exo 2'; font-size: 0.95rem; margin-top: 0.25rem;">
          ${event.official_name}
        </div>
        <div class="event-desc" style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem; margin-top: 0.1rem;">
          <span style="color: var(--accent);">📍</span>
          <span>${event.location}, ${event.country}</span>
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
