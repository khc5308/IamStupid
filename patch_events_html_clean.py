import re

filepath = 'js/events.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rewrite renderTelemetryUI
render_telemetry_ui_old = re.compile(r'function renderTelemetryUI\(\) \{.*?(?=function loadSessionDrivers)', re.DOTALL)
render_telemetry_ui_new = """function renderTelemetryUI() {
  const container = document.getElementById('main-telemetry-content');
  
  if (!currentYearSelected || !currentRoundNum) {
    container.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-secondary);">연도와 그랑프리를 선택해주세요.</div>';
    return;
  }
  
  container.style.display = 'block';
  
  container.innerHTML = `
    <!-- Top Controller Row -->
    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 2rem;">
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
    </div>
    
    <!-- 로더 -->
    <div id="telemetry-full-loader" style="display: none; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0; color: var(--text-secondary);">
      <div style="width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
      <h3 style="color: #fff; font-family: 'Exo 2'; margin-bottom: 0.5rem;">데이터 로딩 중</h3>
      <p style="font-size: 0.9rem;">사후 분석 데이터를 불러오고 있습니다...</p>
    </div>

    <div id="telemetry-data-container" style="display: none;">
      <!-- 정적 트랙 트래커 -->
      <div class="telemetry-panel" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.5rem;">
        <h3 style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:1rem; color:#fff; margin:0 0 1rem 0; display:flex; align-items:center; gap:0.5rem; justify-content: center;">
          <span style="color:#00a2ff; font-size:1.2rem;">🗺️</span> 그랑프리 서킷 레이아웃
        </h3>
        
        <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; position:relative; min-height: 300px; padding: 1rem;">
          <img id="static-circuit-image" src="" alt="Circuit Layout" style="max-width: 100%; max-height: 400px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));">
        </div>
      </div>
    </div>
  `;

  // 드라이버 리스트 로드
  loadSessionDrivers(currentRoundNum);
}

"""
content = render_telemetry_ui_old.sub(render_telemetry_ui_new, content)

# 2. Modify loadSimulationData to remove live playback UI setup and just load analysis
load_sim_pattern = re.compile(r'async function loadSimulationData\(\) \{.*?(?=let telemetryLapsData = \{\};)', re.DOTALL)
load_sim_new = """async function loadSimulationData() {
  const sessionType = document.getElementById('telemetry-session').value;
  const fullLoader = document.getElementById('telemetry-full-loader');
  const dataContainer = document.getElementById('telemetry-data-container');
  
  if (fullLoader) fullLoader.style.display = 'flex';
  if (dataContainer) dataContainer.style.display = 'none';
  
  try {
    const res = await fetch(`/race-simulation/${currentYearSelected}/${encodeURIComponent(currentRoundNum)}/${sessionType}`);
    if (!res.ok) throw new Error('Simulation endpoint failed');
    
    raceSimData = await res.json();
    
    if (dataContainer) dataContainer.style.display = 'block';
    
    // Set static track image
    const eventInfo = events.find(e => e.round.toString() === currentRoundNum.toString());
    const imgEl = document.getElementById('static-circuit-image');
    if (eventInfo && imgEl) {
        imgEl.src = eventInfo.circuit_image_url;
    }
    
    // Load post-race analysis data and render initial charts
    await loadAnalysisData();
    
  } catch (err) {
    console.error('Error fetching telemetry:', err);
  } finally {
    if (fullLoader) fullLoader.style.display = 'none';
  }
}

"""
content = load_sim_pattern.sub(load_sim_new, content)

# 3. Strip out old real-time functions
functions_to_remove = [
    'function createRpmLights',
    'async function fetchLiveTiming',
    'function renderTelemetryChart',
    'function updateTelemetryChart',
    'function computeTrackScale',
    'function getScreenCoordinates',
    'function drawBaseTrackPath',
    'window.toggleSimulation',
    'window.onSliderMove',
    'function getInterpolatedPosition',
    'function isDriverInPits',
    'function updateSimulationFrame',
    'function updateRpmLeds'
]

# Simple heuristic: remove everything from the start of the function to the next function definition or end of block.
# Actually, since these are at the top-level, it's easier to just overwrite them.
# The `let animationFrameId = null;` code we added earlier is also there.
# Let's just remove everything between `loadSimulationData` and `let analysisData = null;`

remove_middle_pattern = re.compile(r'(let telemetryLapsData = \{\};).*?(?=\n// ==========================================)', re.DOTALL)
content = remove_middle_pattern.sub('', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Events UI simplified!")
