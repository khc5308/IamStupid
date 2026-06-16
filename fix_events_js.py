import re

filepath = 'js/events.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace loadTelemetryDashboard
new_load_dash = """window.loadTelemetryDashboard = function(gpName, gpInfo, roundNum) {
  currentRoundNum = roundNum;
  
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  
  const contentContainer = document.getElementById('main-telemetry-content');
  contentContainer.innerHTML = `
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
    
    <!-- 전체 화면 로더 -->
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
        
        <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; position:relative; min-height: 300px;">
          <img id="static-circuit-image" src="" alt="Circuit Layout" style="max-width: 100%; max-height: 400px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));">
        </div>
      </div>
    </div>
  `;
  
  loadSessionDrivers(roundNum);
};
"""
content = re.sub(r'window\.loadTelemetryDashboard = function\(gpName, gpInfo, roundNum\) \{.*?loadSessionDrivers\(roundNum\);\n\};', new_load_dash, content, flags=re.DOTALL)

# Replace loadSessionDrivers to NOT call fetchLiveTiming or fetchTelemetryForDrivers
new_load_drivers = """async function loadSessionDrivers(roundNum) {
  const container = document.getElementById('telemetry-drivers-container');
  const dataContainer = document.getElementById('telemetry-data-container');
  const fullLoader = document.getElementById('telemetry-full-loader');
  
  if (dataContainer && fullLoader) {
    dataContainer.style.display = 'none';
    fullLoader.style.display = 'flex';
  }
  
  try {
    const res = await fetch(`/drivers/${currentYearSelected}/${encodeURIComponent(roundNum)}/${document.getElementById('telemetry-session').value}`);
    if (res.ok) {
        const data = await res.json();
        currentDrivers = data.drivers || [];
    }
    
    // Set static track image from existing events JSON
    const eventInfo = events.find(e => e.round.toString() === currentRoundNum.toString());
    const imgEl = document.getElementById('static-circuit-image');
    if (eventInfo && imgEl) {
        imgEl.src = eventInfo.circuit_image_url;
    }
    
    // Fetch base simulation data just to get lap times for the pace chart
    const driversStr = currentDrivers.map(d => d.abbreviation).join(',');
    const simRes = await fetch(`/race-simulation/${currentYearSelected}/${encodeURIComponent(roundNum)}/${document.getElementById('telemetry-session').value}?drivers=${driversStr}`);
    if (simRes.ok) {
        raceSimData = await simRes.json();
    }
    
    // Load Analysis
    await loadAnalysisData();
    
    if (dataContainer && fullLoader) {
      fullLoader.style.display = 'none';
      dataContainer.style.display = 'block';
    }
    
  } catch (err) {
    console.error('Error:', err);
    if (fullLoader) fullLoader.style.display = 'none';
  }
}
"""
content = re.sub(r'async function loadSessionDrivers\(roundNum\) \{.*?(?=window\.onDriverChange = async function)', new_load_drivers, content, flags=re.DOTALL)

# Delete window.onDriverChange, fetchLiveTiming, fetchTelemetryForDrivers, and all other live timing functions.
content = re.sub(r'window\.onDriverChange = async function\(\) \{.*?(?=// ==========================================)', '', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed events.js!")
