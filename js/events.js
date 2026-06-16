// F1 HUB — Grand Prix (Events) Page JavaScript

const NATIONALITY_FLAGS = {
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
  'united arab emirates': '🇦🇪'
};

let nationalityFlags = { ...NATIONALITY_FLAGS };

let currentYearSelected = new Date().getFullYear();
let currentRoundNum = 1;
let currentDrivers = [];
let simulationInterval = null;
let currentSimIndex = 0;
let telemetryPoints1 = [];
let telemetryPoints2 = [];
let telemetryMeta1 = null;
let telemetryMeta2 = null;
let totalLaps = 0;

let trackMinX = 0, trackMaxX = 0, trackMinY = 0, trackMaxY = 0;
let trackScale = 1.0;
let trackPaddingX = 0, trackPaddingY = 0;

document.addEventListener('DOMContentLoaded', async function() {
  initSelectors();
  await loadInitialDashboard();
});

function initSelectors() {
  const yearSelector = document.getElementById('year-selector');
  const currentYear = new Date().getFullYear();
  let options = '';
  for (let y = currentYear; y >= 2018; y--) {
    options += `<option value="${y}">${y}</option>`;
  }
  yearSelector.innerHTML = options;
  yearSelector.addEventListener('change', onYearChange);
  
  const eventSelector = document.getElementById('event-selector');
  eventSelector.addEventListener('change', onEventChange);
}

async function loadInitialDashboard() {
  let targetRound = null;
  try {
    const res = await fetch('/events/last');
    if (res.ok) {
      const data = await res.json();
      if (data.event_name) {
        targetRound = data.event_name;
        currentYearSelected = new Date().getFullYear(); 
        document.getElementById('year-selector').value = currentYearSelected;
      }
    }
  } catch(e) {
    console.warn("Failed to fetch last event", e);
  }
  
  await fetchEventsForYear(currentYearSelected, targetRound);
}

async function fetchEventsForYear(year, defaultRound = null) {
  const eventSelector = document.getElementById('event-selector');
  const mainContent = document.getElementById('main-telemetry-content');
  
  mainContent.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
      <div style="font-size: 2rem; margin-bottom: 1rem; animation: spin 1s linear infinite;">⏳</div>
      <p>일정 정보를 불러오고 있습니다...</p>
    </div>
  `;
  
  try {
    const res = await fetch(`/events/${year}`);
    if (!res.ok) throw new Error('API response not ok');
    
    const data = await res.json();
    const events = data.events || [];

    if (events.length === 0) {
      eventSelector.innerHTML = '<option value="">일정 없음</option>';
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
          <p>등록된 그랑프리 일정이 없습니다.</p>
        </div>
      `;
      return;
    }

    eventSelector.innerHTML = events.map(e => `<option value="${e.round}">${e.official_name} (${e.location}, ${e.country})</option>`).join('');
    
    let selectedEvent = events[0];
    if (defaultRound) {
      // Find event by official name if passed from home page, otherwise fallback
      selectedEvent = events.find(e => e.official_name === defaultRound) || events[0];
      eventSelector.value = selectedEvent.round;
      currentRoundNum = selectedEvent.round;
    } else {
      const today = new Date();
      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].date !== 'N/A' && new Date(events[i].date) < today) {
          selectedEvent = events[i];
          break;
        }
      }
      if (selectedEvent) {
        eventSelector.value = selectedEvent.round;
        currentRoundNum = selectedEvent.round;
      }
    }
    
    const safeOfficialName = selectedEvent.official_name.replace(/'/g, "\\'");
    const safeLocationInfo = `${selectedEvent.location.replace(/'/g, "\\'")}, ${selectedEvent.country.replace(/'/g, "\\'")}`;
    
    loadTelemetryDashboard(safeOfficialName, safeLocationInfo, currentRoundNum);
  } catch (e) {
    console.error('Failed to load Grand Prix events', e);
    mainContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--accent);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <p>일정을 불러오는 데 실패했습니다.</p>
      </div>
    `;
  }
}

async function onYearChange(e) {
  currentYearSelected = document.getElementById('year-selector').value;
  await fetchEventsForYear(currentYearSelected);
}

async function onEventChange(e) {
  currentRoundNum = document.getElementById('event-selector').value;
  const sel = document.getElementById('event-selector');
  const text = sel.options[sel.selectedIndex].text;
  
  // Try to parse the name and location, it's rough but functional. Alternatively we can just pass the text.
  loadTelemetryDashboard(text, "해당 이벤트", currentRoundNum);
}

console.log('Grand Prix events page JS loaded successfully');

window.loadTelemetryDashboard = function(gpName, gpInfo, roundNum) {
  currentRoundNum = roundNum;
  
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  currentSimIndex = 0;
  telemetryPoints1 = [];
  telemetryPoints2 = [];
  
  const contentContainer = document.getElementById('main-telemetry-content');
  contentContainer.innerHTML = `
    <style>
      .telemetry-dashboard {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 1.5rem;
        margin-top: 1rem;
      }
      .telemetry-panel {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 8px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
      }
      .telemetry-controller {
        background: linear-gradient(135deg, rgba(225, 6, 0, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%);
        border: 1px solid rgba(225, 6, 0, 0.15);
        border-radius: 8px;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
      }
      .play-btn {
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, background-color 0.2s;
        box-shadow: 0 0 15px rgba(225, 6, 0, 0.4);
      }
      .play-btn:hover {
        transform: scale(1.08);
        background: #ff1e18;
      }
      .sim-slider {
        flex-grow: 1;
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.1);
        outline: none;
        cursor: pointer;
        transition: background 0.3s;
      }
      .sim-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--accent);
        border: 2px solid #fff;
        box-shadow: 0 0 10px rgba(225, 6, 0, 0.6);
        cursor: pointer;
        transition: transform 0.1s;
      }
      .sim-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      .time-display {
        font-family: 'Orbitron', sans-serif;
        font-weight: 900;
        font-size: 1.2rem;
        color: #fff;
        min-width: 130px;
        text-align: right;
        text-shadow: 0 0 10px rgba(255,255,255,0.2);
      }
      .driver-compare-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 0.5rem;
      }
      .driver-telemetry-card {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.03);
        padding: 1rem;
        position: relative;
        overflow: hidden;
      }
      .driver-badge {
        position: absolute;
        top: 0;
        right: 0;
        font-family: 'Orbitron', sans-serif;
        font-weight: 900;
        font-size: 3rem;
        color: rgba(255, 255, 255, 0.02);
        line-height: 1;
        pointer-events: none;
      }
      .stat-row {
        margin-bottom: 0.75rem;
      }
      .stat-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #8c8c9e;
        font-family: 'Exo 2';
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .stat-value {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        color: #fff;
        font-size: 0.95rem;
      }
      .meter-bar-container {
        height: 6px;
        background: rgba(255,255,255,0.05);
        border-radius: 3px;
        overflow: hidden;
        margin-top: 0.15rem;
        position: relative;
      }
      .meter-bar {
        height: 100%;
        border-radius: 3px;
        transition: width 0.1s linear;
      }
      .rpm-lights {
        display: flex;
        gap: 2px;
        margin-top: 0.25rem;
      }
      .rpm-led {
        height: 6px;
        flex-grow: 1;
        background: rgba(255,255,255,0.05);
        border-radius: 1px;
        transition: background-color 0.1s;
      }
      .gear-indicator-large {
        width: 55px;
        height: 55px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
      }
      .gear-val {
        font-family: 'Orbitron', sans-serif;
        font-weight: 900;
        font-size: 1.8rem;
        line-height: 1;
      }
      .drs-badge {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        font-size: 0.65rem;
        padding: 0.15rem 0.4rem;
        border-radius: 3px;
        margin-left: auto;
      }
      .drs-active {
        background: rgba(46, 204, 113, 0.15);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.3);
        box-shadow: 0 0 10px rgba(46, 204, 113, 0.2);
      }
      .drs-inactive {
        background: rgba(255,255,255,0.05);
        color: #707080;
        border: 1px solid rgba(255,255,255,0.08);
      }
      @media (max-width: 768px) {
        .telemetry-dashboard {
          grid-template-columns: 1fr;
        }
        .top-row-grid {
          grid-template-columns: 1fr;
        }
      }
      .top-row-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .driver-pill {
        background: rgba(255,255,255,0.1);
        color: #8c8c9e;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }
      .driver-pill.active {
        color: #fff;
        border-color: currentColor;
        box-shadow: 0 0 8px currentColor;
      }
    </style>

    
    <!-- 세션 및 드라이버 선택 바 -->
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; align-items: center; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">세션:</span>
        <select id="telemetry-session" style="background: #101026; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.35rem 0.75rem; border-radius: 4px; font-family: 'Exo 2'; font-weight: 600; outline: none; cursor: pointer;" onchange="onSessionChange()">
          <option value="R">Race</option>
          <option value="S">Sprint</option>
          <option value="SQ">Sprint Shootout</option>
          <option value="Q">Qualifying</option>
          <option value="FP3">Practice 3</option>
          <option value="FP2">Practice 2</option>
          <option value="FP1">Practice 1</option>
        </select>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;" id="telemetry-drivers-container">
        <!-- Dynamic driver pills will go here -->
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">차트 표시 랩:</span>
        <select id="telemetry-lap-select" style="background: #101026; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.35rem 0.75rem; border-radius: 4px; font-family: 'Exo 2'; font-weight: 600; outline: none; cursor: pointer;" onchange="onLapChange()">
          <option value="">데이터 없음</option>
        </select>
      </div>
    </div>
    
    <!-- 전체 화면 로더 -->
    <div id="telemetry-full-loader" style="display: none; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0; color: var(--text-secondary);">
      <div style="width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
      <h3 style="color: #fff; font-family: 'Exo 2'; margin-bottom: 0.5rem;">FastF1 데이터 로딩 중</h3>
      <p style="font-size: 0.9rem;">라이브 타이밍 및 텔레메트리 데이터를 분석하고 있습니다...</p>
    </div>

    <div id="telemetry-data-container" style="display: none;">
    <div class="top-row-grid">
    <!-- 라이브 타이밍 테이블 영역 -->
    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow-x: auto; height: 100%; display: flex; flex-direction: column;">
      <h3 style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:1rem; color:#fff; padding: 1rem; margin:0; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:0.5rem;">
        <span style="color:#9b59b6; font-size:1.2rem;">⏱️</span> 실시간 랩 타이밍 & 섹터 기록
      </h3>
      <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-family: 'Exo 2', sans-serif; font-size: 0.85rem; text-align: center; color: #fff;">
        <thead>
          <tr style="background: rgba(255,255,255,0.02); color: #8c8c9e;">
            <th style="padding: 0.75rem; font-weight: 600; width: 8%;">POS</th>
            <th style="padding: 0.75rem; font-weight: 600; text-align: left; width: 22%;">DRIVER</th>
            <th style="padding: 0.75rem; font-weight: 600; width: 22%;">TIME</th>
            <th style="padding: 0.75rem; font-weight: 600; width: 12%;">S1</th>
            <th style="padding: 0.75rem; font-weight: 600; width: 12%;">S2</th>
            <th style="padding: 0.75rem; font-weight: 600; width: 12%;">S3</th>
            <th style="padding: 0.75rem; font-weight: 600; width: 12%;">TYRE</th>
          </tr>
        </thead>
        <tbody id="live-timing-tbody">
          <tr><td colspan="7" style="padding: 2rem;">데이터를 불러오는 중입니다...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 실시간 트랙 트래커 -->
    <div class="telemetry-panel" style="justify-content:space-between; background: rgba(0,0,0,0.3);">
      <h3 style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:1rem; color:#fff; margin:0 0 1rem 0; display:flex; align-items:center; gap:0.5rem;">
        <span style="color:#00a2ff; font-size:1.2rem;">🗺️</span> 실시간 물리 트랙 GPS 맵
      </h3>
      
      <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; position:relative;">
        <svg viewBox="0 0 500 300" style="width:100%; height:230px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.04); overflow:visible;">
          <defs>
            <linearGradient id="track-grad-neon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#e10600" />
              <stop offset="100%" stop-color="#ff7f50" />
            </linearGradient>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <!-- Dynamic Circuit Path Layout -->
          <path id="circuit-track" d="" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-linecap="round" />
          
          <!-- Dynamic Driver Indicators Layer -->
          <g id="dynamic-drivers-layer"></g>
        </svg>
      </div>
      
      <div style="background:rgba(0,0,0,0.15); border-radius:6px; padding:0.6rem 0.8rem; font-size:0.75rem; color:#8c8c9e; font-family:'Exo 2'; display:flex; justify-content:space-between; margin-top:1rem; border:1px solid rgba(255,255,255,0.02); align-items: center;">
        <div id="dynamic-map-legend" style="display:flex; flex-wrap:wrap; gap:1rem;">
        </div>
        <span style="color:#00ffcc;">🟢 FastF1 동기화 완료</span>
      </div>
    </div>
    </div>

    <!-- 시뮬레이션 컨트롤러 -->
    <div class="telemetry-controller">
      <button id="sim-play-btn" class="play-btn" onclick="toggleSimulation()" disabled>▶</button>
      <input type="range" id="sim-time-slider" class="sim-slider" min="0" max="100" value="0" oninput="onSliderMove(this.value)" disabled>
      <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 140px;">
        <div id="sim-lap-display" style="font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 0.8rem; color: var(--accent); margin-bottom: 0.15rem; text-shadow: 0 0 5px rgba(225, 6, 0, 0.4);">Lap --</div>
        <div id="sim-time-display" class="time-display" style="min-width: unset;">00:00.000</div>
      </div>
    </div>

    <div class="telemetry-dashboard">

      <!-- 텔레메트리 트렌드 그래프 영역 -->
      <div class="telemetry-panel" style="grid-column: 1 / -1; margin-top: 1rem;">
        <h3 style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:1rem; color:#fff; margin:0 0 1rem 0; display:flex; align-items:center; gap:0.5rem;">
          <span style="color:#f1c40f; font-size:1.2rem;">📈</span> 텔레메트리 추이 분석 (RPM & 브레이크)
        </h3>
        <div style="position: relative; height: 350px; width: 100%;">
          <canvas id="telemetry-chart-canvas"></canvas>
        </div>
      </div>

    

    </div>
    </div>
  `;

  // RPM 인디케이터 조명 생성
  createRpmLights('dr1-rpm-lights');
  createRpmLights('dr2-rpm-lights');
  
  // 드라이버 리스트 로드
  loadSessionDrivers(roundNum);
};

function createRpmLights(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = Array.from({ length: 15 }).map(() => `<div class="rpm-led"></div>`).join('');
  }
}


window.onSessionChange = async function() {
  await loadSessionDrivers(currentRoundNum);
};

let myChart = null;

async function fetchLiveTiming() {
  const sessionType = document.getElementById('telemetry-session').value;
  const tbody = document.getElementById('live-timing-tbody');
  
  try {
    const res = await fetch(`/live-timing/${currentYearSelected}/${encodeURIComponent(currentRoundNum)}/${sessionType}`);
    const data = await res.json();
    const timing = data.timing || [];
    
    if (timing.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem;">이 세션에 대한 기록이 없습니다.</td></tr>';
      return;
    }
    
    tbody.innerHTML = timing.map((t, idx) => {
      const getColColor = (color) => {
        if (color === 'purple') return 'color: #9b59b6; text-shadow: 0 0 5px rgba(155, 89, 182, 0.5); font-weight: 700;';
        if (color === 'green') return 'color: #2ecc71; font-weight: 700;';
        if (color === 'yellow') return 'color: #f1c40f;';
        return 'color: #707080;';
      };
      
      const compColor = t.compound === 'SOFT' ? '#e10600' : (t.compound === 'MEDIUM' ? '#f1c40f' : (t.compound === 'HARD' ? '#fff' : '#2ecc71'));
      
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); display: ${selectedDrivers.includes(t.driver) ? 'table-row' : 'none'};" id="timing-row-${t.driver}">
          <td style="padding: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${idx + 1}</td>
          <td style="padding: 0.75rem; text-align: left; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.driver} <span style="font-size:0.7rem; color:#8c8c9e; font-weight:normal;">(${t.team})</span></td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.lap_color)} white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" class="timing-cell-lap">${t.lap_time || 'N/A'}</td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.s1_color)} white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" class="timing-cell-s1">${t.s1 || 'N/A'}</td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.s2_color)} white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" class="timing-cell-s2">${t.s2 || 'N/A'}</td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.s3_color)} white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" class="timing-cell-s3">${t.s3 || 'N/A'}</td>
          <td style="padding: 0.75rem; font-weight: 700; color: ${compColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" class="timing-cell-tyre">${t.compound}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem; color: var(--accent);">타이밍 기록을 불러오지 못했습니다.</td></tr>';
  }
}

function renderTelemetryChart() {
  const canvas = document.getElementById('telemetry-chart-canvas');
  if (!canvas) return;
  
  if (myChart) {
    myChart.destroy();
  }
  
  const activeDrivers = Object.keys(telemetryLapsData);
  if (activeDrivers.length === 0) return;
  
  // Use the driver with the most distance points for the X-axis labels
  let refDriver = activeDrivers[0];
  let maxLen = 0;
  activeDrivers.forEach(d => {
    if (telemetryLapsData[d].length > maxLen) {
      maxLen = telemetryLapsData[d].length;
      refDriver = d;
    }
  });
  
  const distances = telemetryLapsData[refDriver].map(p => p.distance);
  
  const datasets = [];
  
  activeDrivers.forEach(d => {
    const pts = telemetryLapsData[d];
    const info = currentDrivers.find(dr => dr.abbreviation === d);
    const color = getTeamColor(info ? info.team : 'Default');
    
    // Add RPM line
    datasets.push({
      label: `${d} RPM`,
      data: pts.map(p => p.rpm),
      borderColor: color,
      borderWidth: 1.5,
      yAxisID: 'yRpm',
      pointRadius: 0,
      tension: 0.1
    });
    
    // Add Brake line
    datasets.push({
      label: `${d} Brake`,
      data: pts.map(p => p.brake ? 100 : 0),
      borderColor: color,
      borderWidth: 1,
      borderDash: [5, 5],
      yAxisID: 'yBrake',
      fill: false,
      pointRadius: 0,
      stepped: true
    });
  });
  
  myChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: distances,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          labels: { color: '#fff', font: { family: '\'Exo 2\'' } }
        }
      },
      scales: {
        x: {
          display: false
        },
        yRpm: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8c8c9e' },
          min: 0,
          max: 14000
        },
        yBrake: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { display: false },
          min: 0,
          max: 150
        }
      }
    }
  });
}

async function loadSessionDrivers(roundNum) {
  const container = document.getElementById('telemetry-drivers-container');
  
  try {
    const res = await fetch(`/drivers/${currentYearSelected}/${encodeURIComponent(roundNum)}/${document.getElementById('telemetry-session').value}`);
    if (!res.ok) throw new Error('Failed to load drivers');
    const data = await res.json();
    currentDrivers = data.drivers || [];
    
    if (currentDrivers.length === 0) {
      if (container) container.innerHTML = '<span style="color:#8c8c9e;">No drivers found</span>';
      return;
    }
    
    // Default: select top 3 drivers
    selectedDrivers = currentDrivers.slice(0, 3).map(d => d.abbreviation);
    
    // Render pills
    renderDriverPills();
    
    // Initial fetch of telemetry
    const dataContainer = document.getElementById('telemetry-data-container');
    const fullLoader = document.getElementById('telemetry-full-loader');
    if (dataContainer && fullLoader) {
      dataContainer.style.display = 'none';
      fullLoader.style.display = 'flex';
    }
    
    await fetchLiveTiming(); 
    await fetchTelemetryForDrivers();
    
    if (dataContainer && fullLoader) {
      fullLoader.style.display = 'none';
      dataContainer.style.display = 'block';
    }
    
  } catch (err) {
    console.error('Error loading session drivers:', err);
  }
}

window.onDriverChange = async function() {
  const dataContainer = document.getElementById('telemetry-data-container');
  const fullLoader = document.getElementById('telemetry-full-loader');
  if (dataContainer && fullLoader) {
    dataContainer.style.display = 'none';
    fullLoader.style.display = 'flex';
  }
  
  await fetchLiveTiming(); 
  await fetchTelemetryForDrivers();
  
  if (dataContainer && fullLoader) {
    fullLoader.style.display = 'none';
    dataContainer.style.display = 'block';
  }
};

let raceSimData = null;
let trackData = [];
let maxSimTime = 0;
let selectedDrivers = [];

// Team color mapping (approximate for F1 2024/2023)
const teamColors = {
  "Red Bull Racing": "#3671C6",
  "Mercedes": "#27F4D2",
  "Ferrari": "#E80020",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine": "#0093cc",
  "Williams": "#64C4FF",
  "RB": "#6692FF",
  "AlphaTauri": "#2B4562",
  "Kick Sauber": "#52E252",
  "Alfa Romeo": "#C92D4B",
  "Haas F1 Team": "#B6BABD",
  "Default": "#FFFFFF"
};

function getTeamColor(teamName) {
  for (let key in teamColors) {
    if (teamName.toLowerCase().includes(key.toLowerCase())) return teamColors[key];
  }
  return teamColors["Default"];
}

function renderDriverPills() {
  const container = document.getElementById('telemetry-drivers-container');
  if (!container) return;
  
  container.innerHTML = currentDrivers.map(d => {
    const isActive = selectedDrivers.includes(d.abbreviation);
    const color = getTeamColor(d.team);
    return `<div class="driver-pill ${isActive ? 'active' : ''}" 
                 style="${isActive ? `color: ${color};` : ''}"
                 onclick="toggleDriver('${d.abbreviation}')">
              ${d.abbreviation}
            </div>`;
  }).join('');
}

window.toggleDriver = async function(abbr) {
  const isAdding = !selectedDrivers.includes(abbr);
  if (isAdding) {
    selectedDrivers.push(abbr);
    const row = document.getElementById(`timing-row-${abbr}`);
    if (row) {
      row.style.display = 'table-row';
      const lapCell = row.querySelector('.timing-cell-lap');
      if (lapCell) lapCell.innerHTML = '<span style="color:var(--accent); animation: pulse 1s infinite;">추가중...</span>';
    }
  } else {
    selectedDrivers = selectedDrivers.filter(d => d !== abbr);
    const row = document.getElementById(`timing-row-${abbr}`);
    if (row) row.style.display = 'none';
    delete telemetryLapsData[abbr];
  }
  
  renderDriverPills();
  
  // Refetch telemetry directly instead of calling onDriverChange to avoid full loader
  await fetchTelemetryForDrivers();
  
  if (isAdding) {
    await window.onLapChange(); // this updates telemetryLapsData for the new driver
  } else {
    renderTelemetryChart();
    drawMiniSectors();
  }
};

async function fetchTelemetryForDrivers() {
  const playBtn = document.getElementById('sim-play-btn');
  const slider = document.getElementById('sim-time-slider');
  const lapSelect = document.getElementById('telemetry-lap-select');
  const fullLoader = document.getElementById('telemetry-full-loader');
  
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  
  if (playBtn) playBtn.textContent = '▶';
  
  if (selectedDrivers.length === 0) {
    document.getElementById('main-telemetry-content').innerHTML = `
      <div style="text-align: center; padding: 5rem; color: var(--text-secondary);">
        <p>드라이버를 하나 이상 선택해주세요.</p>
      </div>
    `;
    return;
  }
  
  try {
    const driversStr = selectedDrivers.join(',');
    const res = await fetch(`/race-simulation/${currentYearSelected}/${encodeURIComponent(currentRoundNum)}/${document.getElementById('telemetry-session').value}?drivers=${driversStr}`);
    
    if (!res.ok) {
      document.getElementById('main-telemetry-content').innerHTML = `
        <div style="text-align: center; padding: 5rem; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
          <p>해당 세션의 데이터를 찾을 수 없습니다.</p>
        </div>
      `;
      return;
    }
    
    raceSimData = await res.json();
    trackData = raceSimData.track || [];
    
    if (trackData.length === 0) throw new Error('Simulation data is empty');
    
    // Render dynamic map layer and legend
    const mapLayer = document.getElementById('dynamic-drivers-layer');
    const legendLayer = document.getElementById('dynamic-map-legend');
    
    if (mapLayer && legendLayer) {
      mapLayer.innerHTML = '';
      legendLayer.innerHTML = '';
      
      selectedDrivers.forEach(d => {
        const info = currentDrivers.find(dr => dr.abbreviation === d);
        const color = getTeamColor(info ? info.team : 'Default');
        
        // Add to map layer
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.id = `dr-group-${d}`;
        g.style.transition = 'transform 0.08s linear';
        g.style.display = 'block';
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('r', '7.5');
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '1.5');
        circle.style.filter = `drop-shadow(0 0 5px ${color})`;
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute('font-size', '7.5');
        text.setAttribute('font-family', 'Orbitron');
        text.setAttribute('font-weight', '900');
        text.setAttribute('fill', '#fff');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dy', '2.8');
        text.textContent = d;
        
        const wrench = document.createElementNS("http://www.w3.org/2000/svg", "text");
        wrench.id = `dr-wrench-${d}`;
        wrench.setAttribute('font-size', '10');
        wrench.setAttribute('text-anchor', 'middle');
        wrench.setAttribute('y', '-10');
        wrench.textContent = '🔧';
        wrench.style.display = 'none';
        
        g.appendChild(circle);
        g.appendChild(text);
        g.appendChild(wrench);
        mapLayer.appendChild(g);
        
        // Add to legend
        legendLayer.innerHTML += `
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color};"></span>
            <span>${d} (${info ? info.team : 'Unknown'})</span>
          </span>
        `;
      });
    }

    // Compute max simulation time
    maxSimTime = 0;
    let minSimTime = Infinity;
    let maxLaps = 0;
    selectedDrivers.forEach(d => {
      if (raceSimData.positions[d] && raceSimData.positions[d].length > 0) {
        const lastPts = raceSimData.positions[d];
        const maxT = lastPts[lastPts.length - 1][0];
        const minT = lastPts[0][0];
        if (maxT > maxSimTime) maxSimTime = maxT;
        if (minT < minSimTime) minSimTime = minT;
      }
      if (raceSimData.laps[d] && raceSimData.laps[d].length > maxLaps) {
        maxLaps = raceSimData.laps[d].length;
      }
    });
    
    // Adjust minSimTime to skip pre-race wait
    let firstLapStart = Infinity;
    selectedDrivers.forEach(d => {
      if (raceSimData.laps[d] && raceSimData.laps[d].length > 0) {
        const t = raceSimData.laps[d][0].start_time;
        if (t < firstLapStart) firstLapStart = t;
      }
    });
    
    if (minSimTime === Infinity) minSimTime = 0;
    if (firstLapStart !== Infinity && firstLapStart < maxSimTime) {
      minSimTime = firstLapStart;
    }
    totalLaps = maxLaps;
    
    // Populate lap select
    lapSelect.innerHTML = '';
    for (let i = 1; i <= maxLaps; i++) {
      lapSelect.innerHTML += `<option value="${i}">Lap ${i}</option>`;
    }
    
    // Scale track coordinates and draw map
    computeTrackScale(trackData);
    drawBaseTrackPath();
    
    // Reset player elements
    currentSimIndex = minSimTime;
    if (slider) {
      slider.disabled = false;
      slider.min = minSimTime;
      slider.max = maxSimTime;
      slider.value = minSimTime;
      slider.step = 0.5;
    }
    if (playBtn) playBtn.disabled = false;
    
    // Dynamic SVG groups are already visible.
    // Initial UI state
    updateSimulationFrame(currentSimIndex);
    
    // Fetch initial lap telemetry for chart
    if (maxLaps > 0) {
      lapSelect.value = "1";
      await onLapChange();
    }
    
    if (fullLoader) fullLoader.style.display = 'none';
    
  } catch (err) {
    console.error('Error fetching telemetry:', err);
    if (fullLoader) fullLoader.style.display = 'none';
  }
}

let telemetryLapsData = {};

window.onLapChange = async function() {
  const lapSelect = document.getElementById('telemetry-lap-select');
  const sessionType = document.getElementById('telemetry-session').value;
  const lap = lapSelect.value;
  
  if (!lap || selectedDrivers.length === 0) return;
  
  try {
    const fetchPromises = selectedDrivers.map(d => 
      fetch(`/telemetry-lap/${currentYearSelected}/${encodeURIComponent(currentRoundNum)}/${sessionType}/${d}/${lap}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
    );
    
    const results = await Promise.all(fetchPromises);
    
    telemetryLapsData = {};
    results.forEach((data, i) => {
      const d = selectedDrivers[i];
      if (data && data.telemetry) {
        telemetryLapsData[d] = data.telemetry;
      }
    });
    
    renderTelemetryChart();
    drawMiniSectors();
  } catch (err) {
    console.error("Failed to fetch lap chart data", err);
  }
};

function computeTrackScale(points) {
  if (!points || points.length === 0) return;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  trackMinX = Math.min(...xs);
  trackMaxX = Math.max(...xs);
  trackMinY = Math.min(...ys);
  trackMaxY = Math.max(...ys);
  
  const width = trackMaxX - trackMinX;
  const height = trackMaxY - trackMinY;
  
  trackScale = Math.min(440 / width, 240 / height);
  trackPaddingX = (500 - width * trackScale) / 2;
  trackPaddingY = (300 - height * trackScale) / 2;
}

function getScreenCoordinates(p) {
  const screenX = trackPaddingX + (p.x - trackMinX) * trackScale;
  // Flip Y to match standard SVG coordinate system orientation
  const screenY = 300 - (trackPaddingY + (p.y - trackMinY) * trackScale);
  return { x: screenX, y: screenY };
}

function drawBaseTrackPath() {
  const pathEl = document.getElementById('circuit-track');
  if (!pathEl || !trackData || trackData.length === 0) return;
  
  // 1. Draw base faint track
  let d = '';
  trackData.forEach((p, idx) => {
    const screenPos = getScreenCoordinates(p);
    if (idx === 0) d += `M ${screenPos.x.toFixed(1)} ${screenPos.y.toFixed(1)}`;
    else d += ` L ${screenPos.x.toFixed(1)} ${screenPos.y.toFixed(1)}`;
  });
  d += ' Z';
  pathEl.setAttribute('d', d);
  
  // Draw static pit marker near trackData[0]
  let pitMarker = document.getElementById('circuit-pit-marker');
  if (trackData.length > 0) {
    if (pitMarker) pitMarker.remove();
    const firstPos = getScreenCoordinates(trackData[0]);
    const svg = pathEl.closest('svg');
    pitMarker = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pitMarker.id = 'circuit-pit-marker';
    pitMarker.setAttribute('transform', `translate(${(firstPos.x + 22).toFixed(1)}, ${(firstPos.y - 12).toFixed(1)})`);
    
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('x', '-25');
    rect.setAttribute('y', '-8');
    rect.setAttribute('width', '50');
    rect.setAttribute('height', '16');
    rect.setAttribute('rx', '3');
    rect.setAttribute('fill', 'rgba(0, 0, 0, 0.65)');
    rect.setAttribute('stroke', 'rgba(230, 126, 34, 0.5)');
    rect.setAttribute('stroke-width', '1.5');
    
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute('font-size', '8.5');
    txt.setAttribute('font-family', 'Orbitron');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('fill', '#e67e22');
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dy', '3');
    txt.textContent = '🔧 PIT';
    
    pitMarker.appendChild(rect);
    pitMarker.appendChild(txt);
    svg.insertBefore(pitMarker, document.getElementById('dynamic-drivers-layer'));
  }
}

function drawMiniSectors() {
  const pathEl = document.getElementById('circuit-track');
  if (!pathEl) return;
  const svg = pathEl.closest('svg');
  let group = document.getElementById('circuit-track-minisectors');
  if (!group) {
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.id = 'circuit-track-minisectors';
    svg.insertBefore(group, document.getElementById('dynamic-drivers-layer'));
  }
  group.innerHTML = '';
  
  const activeDrivers = Object.keys(telemetryLapsData);
  if (activeDrivers.length === 0) return;
  
  // Choose the driver with the most distance as reference for sectors
  let refDriver = activeDrivers[0];
  let maxDist = 0;
  activeDrivers.forEach(d => {
    const pts = telemetryLapsData[d];
    if (pts.length > 0 && pts[pts.length-1].distance > maxDist) {
      maxDist = pts[pts.length-1].distance;
      refDriver = d;
    }
  });
  
  const numSectors = 25;
  const sectorLength = maxDist / numSectors;
  
  for (let i = 0; i < numSectors; i++) {
    const startDist = i * sectorLength;
    const endDist = (i + 1) * sectorLength;
    
    let fastestDriver = null;
    let minDuration = Infinity;
    
    activeDrivers.forEach(d => {
      const pts = telemetryLapsData[d];
      const pStart = findClosestPointByDistance(pts, startDist);
      const pEnd = findClosestPointByDistance(pts, endDist);
      if (pStart && pEnd) {
        const duration = pEnd.time - pStart.time;
        if (duration > 0 && duration < minDuration) {
          minDuration = duration;
          fastestDriver = d;
        }
      }
    });
    
    if (!fastestDriver) continue;
    
    const info = currentDrivers.find(dr => dr.abbreviation === fastestDriver);
    const color = getTeamColor(info ? info.team : 'Default');
    
    const refPts = telemetryLapsData[refDriver];
    const sectorPoints = refPts.filter(p => p.distance >= startDist && p.distance <= endDist);
    if (sectorPoints.length < 2) continue;
    
    let sd = '';
    sectorPoints.forEach((p, idx) => {
      const screenPos = getScreenCoordinates(p);
      if (idx === 0) sd += `M ${screenPos.x.toFixed(1)} ${screenPos.y.toFixed(1)}`;
      else sd += ` L ${screenPos.x.toFixed(1)} ${screenPos.y.toFixed(1)}`;
    });
    
    const sectorPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    sectorPath.setAttribute('d', sd);
    sectorPath.setAttribute('fill', 'none');
    sectorPath.setAttribute('stroke', color);
    sectorPath.setAttribute('stroke-width', '4');
    sectorPath.setAttribute('stroke-linecap', 'round');
    sectorPath.style.filter = 'drop-shadow(0 0 2px ' + color + ')';
    
    group.appendChild(sectorPath);
  }
}

window.toggleSimulation = function() {
  const playBtn = document.getElementById('sim-play-btn');
  const slider = document.getElementById('sim-time-slider');
  
  if (!raceSimData) return;
  
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    playBtn.textContent = '▶';
  } else {
    playBtn.textContent = '⏸';
    simulationInterval = setInterval(() => {
      currentSimIndex += 0.5;
      if (currentSimIndex > maxSimTime) currentSimIndex = 0;
      if (slider) slider.value = currentSimIndex;
      updateSimulationFrame(currentSimIndex);
    }, 100); // 5x speed
  }
};

window.onSliderMove = function(val) {
  currentSimIndex = parseFloat(val);
  updateSimulationFrame(currentSimIndex);
};

function getInterpolatedPosition(driver, simTime) {
  if (!raceSimData || !raceSimData.positions[driver]) return null;
  const pts = raceSimData.positions[driver];
  if (pts.length === 0) return null;
  
  // pts is array of [time, x, y]
  if (simTime <= pts[0][0]) return {x: pts[0][1], y: pts[0][2]};
  if (simTime >= pts[pts.length-1][0]) return {x: pts[pts.length-1][1], y: pts[pts.length-1][2]};
  
  // binary search or simple loop
  for (let i = 0; i < pts.length - 1; i++) {
    if (simTime >= pts[i][0] && simTime <= pts[i+1][0]) {
      const t1 = pts[i][0], t2 = pts[i+1][0];
      const x1 = pts[i][1], x2 = pts[i+1][1];
      const y1 = pts[i][2], y2 = pts[i+1][2];
      const ratio = (simTime - t1) / (t2 - t1);
      return {
        x: x1 + (x2 - x1) * ratio,
        y: y1 + (y2 - y1) * ratio
      };
    }
  }
  return null;
}

function isDriverInPits(drv, simTime) {
  if (!raceSimData || !raceSimData.laps[drv]) return false;
  const laps = raceSimData.laps[drv];
  for (let i = 0; i < laps.length; i++) {
    const lap = laps[i];
    if (lap.pit_in !== null) {
      if (simTime >= lap.pit_in) {
        if (lap.pit_out === null) return true;
        if (simTime <= lap.pit_out) return true;
      }
    }
  }
  return false;
}

function updateSimulationFrame(simTime) {
  if (!raceSimData) return;
  
  // 1. Time display
  const seconds = Math.floor(simTime);
  const milliseconds = Math.floor((simTime - seconds) * 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySecs = seconds % 60;
  
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(displaySecs).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  const timeDisplay = document.getElementById('sim-time-display');
  if (timeDisplay) timeDisplay.textContent = timeStr;
  
  // 1b. Lap Display
  let currentLapNum = null;
  for (let d of selectedDrivers) {
    if (raceSimData.laps[d]) {
      const curLap = raceSimData.laps[d].find(l => simTime >= l.start_time && simTime <= l.time);
      if (curLap) {
        currentLapNum = curLap.lap_num;
        break;
      }
    }
  }
  
  const lapDisplay = document.getElementById('sim-lap-display');
  if (lapDisplay) {
    if (currentLapNum) {
      if (totalLaps > 0) {
        lapDisplay.textContent = `Lap ${currentLapNum} / ${totalLaps}`;
      } else {
        lapDisplay.textContent = `Lap ${currentLapNum}`;
      }
    } else {
      if (totalLaps > 0 && simTime >= maxSimTime) {
        lapDisplay.textContent = `Lap ${totalLaps} / ${totalLaps}`;
      } else {
        lapDisplay.textContent = 'Lap --';
      }
    }
  }
  
  // 2. Map Update
  selectedDrivers.forEach(d => {
    const p = getInterpolatedPosition(d, simTime);
    if (p) {
      const screenPos = getScreenCoordinates(p);
      const g = document.getElementById(`dr-group-${d}`);
      if (g) g.setAttribute('transform', `translate(${screenPos.x.toFixed(1)}, ${screenPos.y.toFixed(1)})`);
    }
    
    // Toggle pit wrench
    const wrench = document.getElementById(`dr-wrench-${d}`);
    if (wrench) {
      if (isDriverInPits(d, simTime)) {
        wrench.style.display = 'block';
      } else {
        wrench.style.display = 'none';
      }
    }
  });
  
  // Helper for formatting time (stopwatch)
  function formatStopwatch(sec) {
    if (sec < 0) return '--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec - Math.floor(sec)) * 1000);
    return `${m > 0 ? m + ':' : ''}${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  // 3. Live Timing Update
  const updateDriverTiming = (drv) => {
    if (!raceSimData.laps[drv]) return;
    const laps = raceSimData.laps[drv];
    
    // Find current lap
    let currentLap = null;
    let lapIndex = 0;
    for (let i = 0; i < laps.length; i++) {
      if (simTime >= laps[i].start_time && simTime <= laps[i].time) {
        currentLap = laps[i];
        lapIndex = i;
        break;
      }
    }
    
    // If not in a lap, maybe race finished or hasn't started
    if (!currentLap) {
      if (laps.length > 0 && simTime > laps[laps.length-1].time) {
        currentLap = laps[laps.length-1];
        lapIndex = laps.length - 1;
      }
    }
    
    const row = document.getElementById(`timing-row-${drv}`);
    if (!row) return;
    
    // Highlight selected driver rows
    if (selectedDrivers.includes(drv)) {
      row.style.background = 'rgba(255,255,255,0.08)';
      row.style.borderLeft = `3px solid ${getTeamColor(currentDrivers.find(d => d.abbreviation === drv)?.team || 'Default')}`;
    } else {
      row.style.background = 'transparent';
      row.style.borderLeft = 'none';
    }
    
    const lapCell = row.querySelector('.timing-cell-lap');
    const s1Cell = row.querySelector('.timing-cell-s1');
    const s2Cell = row.querySelector('.timing-cell-s2');
    const s3Cell = row.querySelector('.timing-cell-s3');
    const tyreCell = row.querySelector('.timing-cell-tyre');
    
    if (!currentLap) {
      // Race hasn't started for this driver
      if (lapCell) lapCell.textContent = '--';
      if (s1Cell) s1Cell.textContent = '--';
      if (s2Cell) s2Cell.textContent = '--';
      if (s3Cell) s3Cell.textContent = '--';
      return;
    }
    
    // Is lap finished in this simulation time?
    const isFinished = simTime > currentLap.time;
    const inPit = isDriverInPits(drv, simTime);
    
    if (lapCell) {
      if (inPit) {
        lapCell.innerHTML = `<span style="color: #e67e22; font-weight: 700; border: 1px solid rgba(230, 126, 34, 0.4); background: rgba(230, 126, 34, 0.1); padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.75rem;">🔧 PIT</span>`;
      } else if (isFinished) {
        lapCell.textContent = currentLap.lap_time;
      } else {
        lapCell.textContent = `[L${currentLap.lap_num}] ${formatStopwatch(simTime - currentLap.start_time)}`;
      }
    }
    
    if (s1Cell) {
      if (inPit) s1Cell.textContent = '--';
      else if (simTime > currentLap.start_time + currentLap.s1_sec && currentLap.s1_sec > 0) s1Cell.textContent = currentLap.s1;
      else s1Cell.textContent = '--';
    }
    if (s2Cell) {
      if (inPit) s2Cell.textContent = '--';
      else if (simTime > currentLap.start_time + currentLap.s1_sec + currentLap.s2_sec && currentLap.s2_sec > 0) s2Cell.textContent = currentLap.s2;
      else s2Cell.textContent = '--';
    }
    if (s3Cell) {
      if (inPit) s3Cell.textContent = '--';
      else if (isFinished && currentLap.s3_sec > 0) s3Cell.textContent = currentLap.s3;
      else s3Cell.textContent = '--';
    }
    if (tyreCell && currentLap.compound && currentLap.compound !== 'N/A') {
      tyreCell.textContent = `${currentLap.compound} (${currentLap.tyre_life}L)`;
      let compColor = '#707080';
      if (currentLap.compound === 'SOFT') compColor = '#e10600';
      else if (currentLap.compound === 'MEDIUM') compColor = '#f1c40f';
      else if (currentLap.compound === 'HARD') compColor = '#ffffff';
      else if (currentLap.compound === 'INTERMEDIATE') compColor = '#2ecc71';
      else if (currentLap.compound === 'WET') compColor = '#3498db';
      tyreCell.style.color = compColor;
    }
  };

  selectedDrivers.forEach(d => updateDriverTiming(d));
}

function updateRpmLeds(containerId, rpm) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const leds = container.querySelectorAll('.rpm-led');
  
  const maxRpm = 13000;
  const activeCount = Math.floor((rpm / maxRpm) * 15);
  
  leds.forEach((led, index) => {
    if (index < activeCount) {
      if (index < 5) led.style.backgroundColor = '#2ecc71';      // Green
      else if (index < 10) led.style.backgroundColor = '#f1c40f'; // Yellow
      else led.style.backgroundColor = '#e10600';                 // Red
    } else {
      led.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }
  });
}

// 모달이 닫힐 때 시뮬레이션 인터벌 안전하게 정리
// Modal toggling removed completely as it's no longer used.


