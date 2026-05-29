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

document.addEventListener('DOMContentLoaded', async function() {
  await loadFlags();
  await loadGrandPrixEvents();
});

// Load nationality flags mapping
async function loadFlags() {
  try {
    const res = await fetch('/data/nationality_flags.json');
    if (res.ok) {
      const data = await res.json();
      nationalityFlags = { ...NATIONALITY_FLAGS, ...data };
    }
  } catch (e) {
    console.error('Failed to load nationality flags, using local fallback', e);
  }
}

// Fetch and render Grand Prix events for current year (2026)
async function loadGrandPrixEvents() {
  const timeline = document.getElementById('events-timeline');
  if (!timeline) return;

  // Show premium loading state
  timeline.innerHTML = `
    <div class="events-loading" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
      <div style="font-size: 2rem; margin-bottom: 1rem; animation: spin 1s linear infinite;">⏳</div>
      <p>금년 그랑프리 일정을 불러오고 있습니다...</p>
    </div>
  `;

  try {
    const currentYear = new Date().getFullYear(); // e.g. 2026
    const res = await fetch(`/events/${currentYear}`);
    if (!res.ok) throw new Error('API response not ok');
    
    const data = await res.json();
    const events = data.events || [];

    if (events.length === 0) {
      timeline.innerHTML = `
        <div class="events-empty" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
          <p>등록된 그랑프리 일정이 없습니다.</p>
        </div>
      `;
      return;
    }

    renderGrandPrixList(events, timeline);
  } catch (e) {
    console.error('Failed to load Grand Prix events', e);
    timeline.innerHTML = `
      <div class="events-error" style="text-align: center; padding: 3rem; color: var(--accent);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <p>그랑프리 일정을 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.</p>
      </div>
    `;
  }
}

// Render Grand Prix cards into timeline container
function renderGrandPrixList(events, container) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  container.innerHTML = events.map(event => {
    // Get flag icon if available
    const countryKey = event.country ? event.country.toLowerCase() : '';
    const flag = nationalityFlags[countryKey] || '';
    
    // Parse date and evaluate status
    let statusText = "2026 F1 공식 레이스";
    let statusColor = "var(--text-secondary)";
    
    if (event.date && event.date !== 'N/A') {
      const eventDate = new Date(event.date);
      if (eventDate < today) {
        statusText = "개최됨";
        statusColor = "#2ecc71"; // Modern Green
      } else {
        statusText = "개최전";
        statusColor = "#ff8700"; // Modern Orange
      }
    }
    
    const safeOfficialName = event.official_name.replace(/'/g, "\\'");
    const safeLocationInfo = `${event.location.replace(/'/g, "\\'")}, ${event.country.replace(/'/g, "\\'")}`;
    
    return `
      <div class="event-card severity-info" onclick="showTelemetryModal('${safeOfficialName}', '${safeLocationInfo}', '${event.round}')" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--accent); transition: all 0.3s ease; cursor: pointer;">
        <div class="event-header" style="margin-bottom: 0.75rem;">
          <div class="event-title" style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="event-badge penalty" style="background: rgba(225, 6, 0, 0.1); color: var(--accent); border: 1px solid rgba(225, 6, 0, 0.2); font-family: 'Orbitron'; font-weight: 700;">
              ROUND ${event.round}
            </span>
            <div class="event-info">
              <h3 class="event-race-name" style="font-size: 1.25rem; font-family: 'Exo 2'; color: var(--text-primary); margin: 0; font-weight: 700;">
                ${event.official_name}
              </h3>
            </div>
          </div>
          <div class="event-date" style="font-size: 1.5rem;">${flag}</div>
        </div>
        
        <div class="event-body" style="padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 0.5rem;">
          <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
              <span style="color: var(--accent);">📍</span>
              <span><strong>개최지:</strong> ${event.location}, ${event.country}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
              <span style="color: var(--accent);">🏁</span>
              <span><strong>상태:</strong> <span style="color: ${statusColor}; font-weight: bold; font-size: 0.9rem;">${statusText}</span></span>
            </div>
          </div>
          <div style="text-align: right; font-size: 0.75rem; color: var(--accent); font-weight: 600; margin-top: 0.5rem; font-family: 'Exo 2';">텔레메트리 정보 확인 ➔</div>
        </div>
      </div>
    `;
  }).join('');
}

console.log('Grand Prix events page JS loaded successfully');

let simulationInterval = null;
let currentSimIndex = 0;
let telemetryPoints1 = [];
let telemetryPoints2 = [];
let telemetryMeta1 = null;
let telemetryMeta2 = null;

let trackMinX = 0, trackMaxX = 0, trackMinY = 0, trackMaxY = 0;
let trackScale = 1.0;
let trackPaddingX = 0, trackPaddingY = 0;
let currentRoundNum = 1;
let currentDrivers = [];

window.showTelemetryModal = function(gpName, gpInfo, roundNum) {
  currentRoundNum = roundNum;
  // 모달 타이틀 설정
  document.getElementById('modal-gp-name').textContent = gpName;
  document.getElementById('modal-gp-info').innerHTML = `🏁 ROUND ${roundNum} • ${gpInfo}`;
  
  // 시뮬레이션 상태 리셋
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  currentSimIndex = 0;
  telemetryPoints1 = [];
  telemetryPoints2 = [];
  
  // 모달 바디 콘텐츠 채우기
  const contentContainer = document.getElementById('modal-telemetry-content');
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
      }
    </style>

    <!-- 드라이버 선택 선택창 바 -->
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; align-items: center; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">드라이버 1 (비교군):</span>
        <select id="telemetry-driver-1" style="background: #101026; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.35rem 0.75rem; border-radius: 4px; font-family: 'Exo 2'; font-weight: 600; outline: none; cursor: pointer;" onchange="onDriverChange()"></select>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">드라이버 2 (대조군):</span>
        <select id="telemetry-driver-2" style="background: #101026; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.35rem 0.75rem; border-radius: 4px; font-family: 'Exo 2'; font-weight: 600; outline: none; cursor: pointer;" onchange="onDriverChange()"></select>
      </div>
      <div id="telemetry-loading-indicator" style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
        <div class="loading-spinner" style="border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block;"></div>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">FastF1 데이터 로드 중...</span>
      </div>
    </div>

    <!-- 시뮬레이션 컨트롤러 -->
    <div class="telemetry-controller">
      <button id="sim-play-btn" class="play-btn" onclick="toggleSimulation()" disabled>▶</button>
      <input type="range" id="sim-time-slider" class="sim-slider" min="0" max="100" value="0" oninput="onSliderMove(this.value)" disabled>
      <div id="sim-time-display" class="time-display">00:00.000</div>
    </div>

    <div class="telemetry-dashboard">
      <!-- 텔레메트리 지표 패널 -->
      <div class="telemetry-panel">
        <h3 style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:1rem; color:#fff; margin:0 0 1rem 0; display:flex; align-items:center; gap:0.5rem;">
          <span style="color:#00ffcc; font-size:1.2rem;">📊</span> F1 공식 실시간 텔레메트리
        </h3>
        
        <div class="driver-compare-grid">
          <!-- 드라이버 1 카드 -->
          <div class="driver-telemetry-card" style="border-left: 3px solid var(--accent);">
            <div id="dr1-badge" class="driver-badge">D1</div>
            <div style="display:flex; align-items:center; margin-bottom:1rem;">
              <div class="gear-indicator-large" style="border-color: rgba(225, 6, 0, 0.3);">
                <div style="font-size:0.55rem; color:#8c8c9e; font-family:'Exo 2';">GEAR</div>
                <div id="dr1-gear" class="gear-val" style="color: var(--accent);">1</div>
              </div>
              <div style="flex-grow: 1;">
                <h4 id="dr1-name" style="margin:0; font-family:'Exo 2'; font-size:0.95rem; font-weight:700; color:#fff;">Driver 1</h4>
                <p id="dr1-team" style="margin:0; font-size:0.7rem; color:#8c8c9e; font-weight:500;">Team Info</p>
              </div>
              <div id="dr1-drs" class="drs-badge drs-inactive">DRS OFF</div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header"><span>SPEED</span><span id="dr1-speed-val" class="stat-value">0 km/h</span></div>
              <div class="meter-bar-container"><div id="dr1-speed-bar" class="meter-bar" style="background:var(--accent); width:0%;"></div></div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header"><span>THROTTLE (가속)</span><span id="dr1-throttle-val" class="stat-value">0%</span></div>
              <div class="meter-bar-container"><div id="dr1-throttle-bar" class="meter-bar" style="background:#2ecc71; width:0%;"></div></div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header"><span>BRAKE (제동)</span><span id="dr1-brake-val" class="stat-value">0%</span></div>
              <div class="meter-bar-container"><div id="dr1-brake-bar" class="meter-bar" style="background:#ff9f43; width:0%;"></div></div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header" style="margin-bottom:0;"><span>ENGINE RPM</span><span id="dr1-rpm-val" class="stat-value">0 RPM</span></div>
              <div id="dr1-rpm-lights" class="rpm-lights"></div>
            </div>
            
            <!-- 추가 가능한 모든 정보 표시 카드 -->
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.04); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.75rem; color: #8c8c9e; font-family: 'Exo 2';">
              <div>📏 이동 거리: <span id="dr1-dist-val" style="color: #fff; font-weight: 700;">0 m</span></div>
              <div>⛰️ 실시간 고도: <span id="dr1-elev-val" style="color: #fff; font-weight: 700;">0.0 m</span></div>
              <div style="grid-column: span 2; margin-top: 0.25rem;">⏱️ 최점속 랩타임: <span id="dr1-laptime-val" style="color: #00ffcc; font-weight: 700;">N/A</span></div>
            </div>
          </div>

          <!-- 드라이버 2 카드 -->
          <div class="driver-telemetry-card" style="border-left: 3px solid #00d4be;">
            <div id="dr2-badge" class="driver-badge">D2</div>
            <div style="display:flex; align-items:center; margin-bottom:1rem;">
              <div class="gear-indicator-large" style="border-color: rgba(0, 212, 190, 0.3);">
                <div style="font-size:0.55rem; color:#8c8c9e; font-family:'Exo 2';">GEAR</div>
                <div id="dr2-gear" class="gear-val" style="color: #00d4be;">1</div>
              </div>
              <div style="flex-grow: 1;">
                <h4 id="dr2-name" style="margin:0; font-family:'Exo 2'; font-size:0.95rem; font-weight:700; color:#fff;">Driver 2</h4>
                <p id="dr2-team" style="margin:0; font-size:0.7rem; color:#8c8c9e; font-weight:500;">Team Info</p>
              </div>
              <div id="dr2-drs" class="drs-badge drs-inactive">DRS OFF</div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header"><span>SPEED</span><span id="dr2-speed-val" class="stat-value">0 km/h</span></div>
              <div class="meter-bar-container"><div id="dr2-speed-bar" class="meter-bar" style="background:#00d4be; width:0%;"></div></div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header"><span>THROTTLE (가속)</span><span id="dr2-throttle-val" class="stat-value">0%</span></div>
              <div class="meter-bar-container"><div id="dr2-throttle-bar" class="meter-bar" style="background:#2ecc71; width:0%;"></div></div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header"><span>BRAKE (제동)</span><span id="dr2-brake-val" class="stat-value">0%</span></div>
              <div class="meter-bar-container"><div id="dr2-brake-bar" class="meter-bar" style="background:#ff9f43; width:0%;"></div></div>
            </div>
            
            <div class="stat-row">
              <div class="stat-header" style="margin-bottom:0;"><span>ENGINE RPM</span><span id="dr2-rpm-val" class="stat-value">0 RPM</span></div>
              <div id="dr2-rpm-lights" class="rpm-lights"></div>
            </div>
            
            <!-- 추가 가능한 모든 정보 표시 카드 -->
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.04); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.75rem; color: #8c8c9e; font-family: 'Exo 2';">
              <div>📏 이동 거리: <span id="dr2-dist-val" style="color: #fff; font-weight: 700;">0 m</span></div>
              <div>⛰️ 실시간 고도: <span id="dr2-elev-val" style="color: #fff; font-weight: 700;">0.0 m</span></div>
              <div style="grid-column: span 2; margin-top: 0.25rem;">⏱️ 최점속 랩타임: <span id="dr2-laptime-val" style="color: #00ffcc; font-weight: 700;">N/A</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 실시간 트랙 트래커 -->
      <div class="telemetry-panel" style="justify-content:space-between;">
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
            <path id="circuit-track" d="" 
                  fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-linecap="round" />
            <path id="circuit-track-active" d="" 
                  fill="none" stroke="url(#track-grad-neon)" stroke-width="3" stroke-linecap="round" filter="url(#neon-glow)" />
            
            <!-- Driver Indicators -->
            <g id="dr1-group" style="transition: transform 0.08s linear; display: none;">
              <circle r="7.5" fill="var(--accent)" stroke="#fff" stroke-width="1.5" style="filter: drop-shadow(0 0 5px var(--accent));" />
              <text id="dr1-map-label" font-size="7.5" font-family="Orbitron" font-weight="900" fill="#fff" text-anchor="middle" dy="2.8">D1</text>
            </g>
            
            <g id="dr2-group" style="transition: transform 0.08s linear; display: none;">
              <circle r="7.5" fill="#00d4be" stroke="#fff" stroke-width="1.5" style="filter: drop-shadow(0 0 5px #00d4be);" />
              <text id="dr2-map-label" font-size="7.5" font-family="Orbitron" font-weight="900" fill="#fff" text-anchor="middle" dy="2.8">D2</text>
            </g>
          </svg>
        </div>
        
        <div style="background:rgba(0,0,0,0.15); border-radius:6px; padding:0.6rem 0.8rem; font-size:0.75rem; color:#8c8c9e; font-family:'Exo 2'; display:flex; justify-content:space-between; margin-top:1rem; border:1px solid rgba(255,255,255,0.02); align-items: center;">
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--accent);"></span>
            <span id="map-legend-dr1">Driver 1</span>
          </span>
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#00d4be;"></span>
            <span id="map-legend-dr2">Driver 2</span>
          </span>
          <span style="color:#00ffcc;">🟢 FastF1 동기화 완료</span>
        </div>
      </div>
    </div>
  `;

  // RPM 인디케이터 조명 생성
  createRpmLights('dr1-rpm-lights');
  createRpmLights('dr2-rpm-lights');

  // 모달 띄우기
  toggleModal('telemetry-modal', true);
  
  // 드라이버 리스트 로드
  loadSessionDrivers(roundNum);
};

function createRpmLights(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = Array.from({ length: 15 }).map(() => `<div class="rpm-led"></div>`).join('');
  }
}

async function loadSessionDrivers(roundNum) {
  const loadingIndicator = document.getElementById('telemetry-loading-indicator');
  const d1Select = document.getElementById('telemetry-driver-1');
  const d2Select = document.getElementById('telemetry-driver-2');
  
  try {
    const res = await fetch(`/drivers/2026/${roundNum}`);
    if (!res.ok) throw new Error('Failed to load drivers');
    const data = await res.json();
    currentDrivers = data.drivers || [];
    
    if (currentDrivers.length === 0) {
      throw new Error('No drivers returned');
    }
    
    // Populate selects
    d1Select.innerHTML = currentDrivers.map(d => `<option value="${d.abbreviation}">${d.abbreviation} (${d.full_name})</option>`).join('');
    d2Select.innerHTML = currentDrivers.map(d => `<option value="${d.abbreviation}">${d.abbreviation} (${d.full_name})</option>`).join('');
    
    // Select default: Driver 1 as VER or first, Driver 2 as HAM or second
    const hasVer = currentDrivers.some(d => d.abbreviation === 'VER');
    const hasHam = currentDrivers.some(d => d.abbreviation === 'HAM');
    
    if (hasVer) {
      d1Select.value = 'VER';
    } else {
      d1Select.selectedIndex = 0;
    }
    
    if (hasHam) {
      d2Select.value = 'HAM';
    } else {
      d2Select.selectedIndex = Math.min(1, currentDrivers.length - 1);
    }
    
    // Initial fetch of telemetry
    await fetchTelemetryForDrivers();
    
  } catch (err) {
    console.error('Error loading session drivers:', err);
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `<span style="color: var(--accent);">⚠️ 드라이버 로드 실패</span>`;
    }
  }
}

window.onDriverChange = async function() {
  await fetchTelemetryForDrivers();
};

async function fetchTelemetryForDrivers() {
  const loadingIndicator = document.getElementById('telemetry-loading-indicator');
  const d1Select = document.getElementById('telemetry-driver-1');
  const d2Select = document.getElementById('telemetry-driver-2');
  const playBtn = document.getElementById('sim-play-btn');
  const slider = document.getElementById('sim-time-slider');
  
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  
  if (playBtn) playBtn.textContent = '▶';
  
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
    loadingIndicator.innerHTML = `
      <div class="loading-spinner" style="border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block;"></div>
      <span style="font-size: 0.8rem; color: var(--text-secondary);">FastF1 데이터 로드 중...</span>
    `;
  }
  
  const d1 = d1Select.value;
  const d2 = d2Select.value;
  
  try {
    const [res1, res2] = await Promise.all([
      fetch(`/telemetry/2026/${currentRoundNum}/${d1}`),
      fetch(`/telemetry/2026/${currentRoundNum}/${d2}`)
    ]);
    
    if (!res1.ok || !res2.ok) throw new Error('Failed to fetch telemetry data');
    
    telemetryMeta1 = await res1.json();
    telemetryMeta2 = await res2.json();
    
    telemetryPoints1 = telemetryMeta1.telemetry || [];
    telemetryPoints2 = telemetryMeta2.telemetry || [];
    
    if (telemetryPoints1.length === 0 || telemetryPoints2.length === 0) {
      throw new Error('Telemetry data is empty');
    }
    
    // Bind metadata
    const driverInfo1 = currentDrivers.find(d => d.abbreviation === d1) || { full_name: d1, team: 'N/A' };
    const driverInfo2 = currentDrivers.find(d => d.abbreviation === d2) || { full_name: d2, team: 'N/A' };
    
    document.getElementById('dr1-badge').textContent = d1;
    document.getElementById('dr1-name').textContent = driverInfo1.full_name;
    document.getElementById('dr1-team').textContent = driverInfo1.team;
    document.getElementById('dr1-laptime-val').textContent = telemetryMeta1.lap_time;
    
    document.getElementById('dr2-badge').textContent = d2;
    document.getElementById('dr2-name').textContent = driverInfo2.full_name;
    document.getElementById('dr2-team').textContent = driverInfo2.team;
    document.getElementById('dr2-laptime-val').textContent = telemetryMeta2.lap_time;
    
    document.getElementById('dr1-map-label').textContent = d1;
    document.getElementById('dr2-map-label').textContent = d2;
    
    document.getElementById('map-legend-dr1').textContent = `${d1} (${driverInfo1.team})`;
    document.getElementById('map-legend-dr2').textContent = `${d2} (${driverInfo2.team})`;
    
    // Scale track coordinates and draw
    computeTrackScale(telemetryPoints1);
    drawTrackPath(telemetryPoints1);
    
    // Reset player elements
    currentSimIndex = 0;
    if (slider) {
      slider.disabled = false;
      slider.max = telemetryPoints1.length - 1;
      slider.value = 0;
    }
    if (playBtn) playBtn.disabled = false;
    
    // Show groups
    document.getElementById('dr1-group').style.display = 'block';
    document.getElementById('dr2-group').style.display = 'block';
    
    // Render first frame
    updateSimulationFrame(0);
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
  } catch (err) {
    console.error('Error fetching telemetry:', err);
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `<span style="color: var(--accent);">⚠️ 데이터 추출 오류</span>`;
    }
  }
}

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

function drawTrackPath(points) {
  const pathEl = document.getElementById('circuit-track');
  const activePathEl = document.getElementById('circuit-track-active');
  if (!pathEl || !activePathEl || !points || points.length === 0) return;
  
  let d = '';
  points.forEach((p, idx) => {
    const screenPos = getScreenCoordinates(p);
    if (idx === 0) {
      d += `M ${screenPos.x.toFixed(1)} ${screenPos.y.toFixed(1)}`;
    } else {
      d += ` L ${screenPos.x.toFixed(1)} ${screenPos.y.toFixed(1)}`;
    }
  });
  d += ' Z';
  pathEl.setAttribute('d', d);
  activePathEl.setAttribute('d', d);
}

window.toggleSimulation = function() {
  const playBtn = document.getElementById('sim-play-btn');
  const slider = document.getElementById('sim-time-slider');
  
  if (!telemetryPoints1 || telemetryPoints1.length === 0) return;
  
  if (simulationInterval) {
    // Pause
    clearInterval(simulationInterval);
    simulationInterval = null;
    playBtn.textContent = '▶';
  } else {
    // Play
    playBtn.textContent = '⏸';
    simulationInterval = setInterval(() => {
      currentSimIndex++;
      if (currentSimIndex >= telemetryPoints1.length) {
        currentSimIndex = 0;
      }
      
      if (slider) slider.value = currentSimIndex;
      updateSimulationFrame(currentSimIndex);
    }, 100);
  }
};

window.onSliderMove = function(val) {
  currentSimIndex = parseInt(val);
  updateSimulationFrame(currentSimIndex);
};

function findClosestPointByDistance(points, distance) {
  if (!points || points.length === 0) return null;
  let closest = points[0];
  let minDiff = Math.abs(closest.distance - distance);
  for (let j = 1; j < points.length; j++) {
    let diff = Math.abs(points[j].distance - distance);
    if (diff < minDiff) {
      minDiff = diff;
      closest = points[j];
    }
  }
  return closest;
}

function updateSimulationFrame(index) {
  if (!telemetryPoints1 || telemetryPoints1.length === 0) return;
  
  // Safe bounds
  index = Math.max(0, Math.min(index, telemetryPoints1.length - 1));
  
  const p1 = telemetryPoints1[index];
  // Align Driver 2 by distance
  const p2 = findClosestPointByDistance(telemetryPoints2, p1.distance) || telemetryPoints2[0];
  
  // 1. Time display
  const time = p1.time;
  const seconds = Math.floor(time);
  const milliseconds = Math.floor((time - seconds) * 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySecs = seconds % 60;
  
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(displaySecs).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  const timeDisplay = document.getElementById('sim-time-display');
  if (timeDisplay) timeDisplay.textContent = timeStr;
  
  // 2. UI Bindings - Driver 1
  document.getElementById('dr1-gear').textContent = p1.gear === 0 ? 'N' : p1.gear;
  document.getElementById('dr1-speed-val').textContent = `${Math.round(p1.speed)} km/h`;
  document.getElementById('dr1-speed-bar').style.width = `${(p1.speed / 360) * 100}%`;
  
  document.getElementById('dr1-throttle-val').textContent = `${Math.round(p1.throttle)}%`;
  document.getElementById('dr1-throttle-bar').style.width = `${p1.throttle}%`;
  
  const p1BrakePct = p1.brake ? 100 : 0;
  document.getElementById('dr1-brake-val').textContent = p1.brake ? 'ON' : 'OFF';
  document.getElementById('dr1-brake-bar').style.width = `${p1BrakePct}%`;
  
  document.getElementById('dr1-rpm-val').textContent = `${Math.round(p1.rpm).toLocaleString()} RPM`;
  updateRpmLeds('dr1-rpm-lights', p1.rpm);
  
  const dr1DrsEl = document.getElementById('dr1-drs');
  if (p1.drs > 0) {
    dr1DrsEl.textContent = 'DRS ON';
    dr1DrsEl.className = 'drs-badge drs-active';
  } else {
    dr1DrsEl.textContent = 'DRS OFF';
    dr1DrsEl.className = 'drs-badge drs-inactive';
  }
  document.getElementById('dr1-dist-val').textContent = `${Math.round(p1.distance).toLocaleString()} m`;
  document.getElementById('dr1-elev-val').textContent = `${p1.z.toFixed(1)} m`;
  
  // 3. UI Bindings - Driver 2
  document.getElementById('dr2-gear').textContent = p2.gear === 0 ? 'N' : p2.gear;
  document.getElementById('dr2-speed-val').textContent = `${Math.round(p2.speed)} km/h`;
  document.getElementById('dr2-speed-bar').style.width = `${(p2.speed / 360) * 100}%`;
  
  document.getElementById('dr2-throttle-val').textContent = `${Math.round(p2.throttle)}%`;
  document.getElementById('dr2-throttle-bar').style.width = `${p2.throttle}%`;
  
  const p2BrakePct = p2.brake ? 100 : 0;
  document.getElementById('dr2-brake-val').textContent = p2.brake ? 'ON' : 'OFF';
  document.getElementById('dr2-brake-bar').style.width = `${p2BrakePct}%`;
  
  document.getElementById('dr2-rpm-val').textContent = `${Math.round(p2.rpm).toLocaleString()} RPM`;
  updateRpmLeds('dr2-rpm-lights', p2.rpm);
  
  const dr2DrsEl = document.getElementById('dr2-drs');
  if (p2.drs > 0) {
    dr2DrsEl.textContent = 'DRS ON';
    dr2DrsEl.className = 'drs-badge drs-active';
  } else {
    dr2DrsEl.textContent = 'DRS OFF';
    dr2DrsEl.className = 'drs-badge drs-inactive';
  }
  document.getElementById('dr2-dist-val').textContent = `${Math.round(p2.distance).toLocaleString()} m`;
  document.getElementById('dr2-elev-val').textContent = `${p2.z.toFixed(1)} m`;
  
  // 4. Update GPS markers on the track
  const screenPos1 = getScreenCoordinates(p1);
  const screenPos2 = getScreenCoordinates(p2);
  
  document.getElementById('dr1-group').setAttribute('transform', `translate(${screenPos1.x.toFixed(1)}, ${screenPos1.y.toFixed(1)})`);
  document.getElementById('dr2-group').setAttribute('transform', `translate(${screenPos2.x.toFixed(1)}, ${screenPos2.y.toFixed(1)})`);
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
const originalToggleModal = window.toggleModal;
window.toggleModal = function(modalId, show) {
  if (modalId === 'telemetry-modal' && !show) {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  }
  if (originalToggleModal) {
    originalToggleModal(modalId, show);
  } else {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.toggle('active', show);
  }
};


