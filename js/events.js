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

function getTeamColor(teamName = '') {
  const lower = teamName.toLowerCase();
  if (lower.includes('red bull') || lower.includes('rbr')) return '#0600ef';
  if (lower.includes('ferrari') || lower.includes('scuderia')) return '#dc0000';
  if (lower.includes('mclaren')) return '#ff8700';
  if (lower.includes('mercedes')) return '#00d4be';
  if (lower.includes('aston martin')) return '#006f62';
  if (lower.includes('alpine')) return '#0082fa';
  if (lower.includes('williams')) return '#00a0de';
  if (lower.includes('sauber') || lower.includes('kick') || lower.includes('stake')) return '#52e252';
  if (lower.includes('haas')) return '#e60000';
  if (lower.includes('rb') || lower.includes('racing bulls') || lower.includes('vcarb')) return '#1e41ff';
  if (lower.includes('audi')) return '#d50000';
  if (lower.includes('cadillac')) return '#c89d3c';
  return '#707080';
}

let currentYearSelected = new Date().getFullYear();
let currentRoundNum = 1;
let currentDrivers = [];
let globalEventsList = [];
let selectedDrivers = [];
let raceSimData = null;
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

let globalTracksList = [];

document.addEventListener('DOMContentLoaded', async function () {
  initSelectors();
  await loadTracksData();
  await loadInitialDashboard();
});

async function loadTracksData() {
  try {
    const res = await fetch('/data/f1-data.json');
    if (res.ok) {
      const data = await res.json();
      globalTracksList = data.tracks || [];
    }
  } catch (e) {
    console.warn("Failed to fetch tracks data", e);
  }
}

function getCircuitImageUrl(eventInfo) {
  if (!eventInfo || !globalTracksList || globalTracksList.length === 0) return '';

  const locationLower = eventInfo.location.toLowerCase();
  const countryLower = eventInfo.country.toLowerCase();
  const nameLower = eventInfo.official_name.toLowerCase();

  let track = globalTracksList.find(t => {
    const trackId = t.id.toLowerCase();

    if (locationLower.includes(trackId) || trackId.includes(locationLower)) return true;

    if (locationLower.includes('miami') && trackId === 'miami') return true;
    if (locationLower.includes('montréal') && trackId === 'montreal') return true;
    if (locationLower.includes('monte carlo') && trackId === 'monaco') return true;
    if (locationLower.includes('barcelona') && trackId === 'catalunya') return true;
    if (locationLower.includes('spa-francorchamps') && trackId === 'spa') return true;
    if (locationLower.includes('budapest') && trackId === 'hungaroring') return true;
    if (locationLower.includes('marina bay') && trackId === 'singapore') return true;
    if (locationLower.includes('são paulo') && trackId === 'interlagos') return true;
    if (locationLower.includes('sao paulo') && trackId === 'interlagos') return true;

    return false;
  });

  return track ? track.image : '';
}

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
    const res = await fetch('/Grand-Prix/last');
    if (res.ok) {
      const data = await res.json();
      if (data.event_name) {
        targetRound = data.event_name;
        currentYearSelected = new Date().getFullYear();
        document.getElementById('year-selector').value = currentYearSelected;
      }
    }
  } catch (e) {
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
    const res = await fetch(`/Grand-Prix/${year}`);
    if (!res.ok) throw new Error('API response not ok');

    const data = await res.json();
    const events = data.events || [];
    globalEventsList = events;

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

window.loadTelemetryDashboard = function (gpName, gpInfo, roundNum) {
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

window.onSessionChange = async function () {
  await loadSessionDrivers(currentRoundNum);
};

async function loadSessionDrivers(roundNum) {
  const container = document.getElementById('telemetry-drivers-container');
  const dataContainer = document.getElementById('telemetry-data-container');
  const fullLoader = document.getElementById('telemetry-full-loader');

  if (dataContainer && fullLoader) {
    dataContainer.style.display = 'none';
    fullLoader.style.display = 'flex';
  }

  const analysisSec = document.getElementById('post-race-analysis-section');
  if (analysisSec) {
    analysisSec.style.display = 'none';
  }

  try {
    const res = await fetch(`/drivers/${currentYearSelected}/${encodeURIComponent(roundNum)}/${document.getElementById('telemetry-session').value}`);
    if (res.ok) {
      const data = await res.json();
      currentDrivers = data.drivers || [];
      selectedDrivers = currentDrivers.slice(0, 3).map(d => d.abbreviation);
    }

    // Set static track image from existing events JSON
    const eventInfo = globalEventsList.find(e => e.round.toString() === currentRoundNum.toString());
    const imgEl = document.getElementById('static-circuit-image');
    if (imgEl) {
      if (eventInfo) {
        try {
          imgEl.src = getCircuitImageUrl(eventInfo) || '';
        } catch (e) {
          console.warn("Failed to set circuit image", e);
          imgEl.src = '';
        }
      } else {
        imgEl.src = '';
      }
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
// ==========================================
// Post-Race Analysis Dashboard Logic
// ==========================================

let analysisData = null;
let activeAnalysisTab = 'results';
let analysisCharts = {};

function switchAnalysisTab(tabId) {
  activeAnalysisTab = tabId;

  // Update buttons
  document.querySelectorAll('.analysis-tab').forEach(btn => {
    btn.style.borderBottomColor = 'transparent';
    btn.style.color = '#8c8c9e';
  });
  const activeBtn = document.querySelector(`.analysis-tab[onclick="switchAnalysisTab('${tabId}')"]`);
  if (activeBtn) {
    activeBtn.style.borderBottomColor = '#e10600';
    activeBtn.style.color = '#fff';
  }

  // Update content visibility
  document.querySelectorAll('.analysis-content').forEach(content => {
    content.style.display = 'none';
  });
  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) activeContent.style.display = 'block';

  // Render specific tab content if needed
  if (tabId === 'position') renderLapPositionChart();
  if (tabId === 'tyre') renderTyreStrategyChart();
  if (tabId === 'pace') renderLapPaceChart();
  if (tabId === 'telemetry') setupTelemetryTab();
}

async function loadAnalysisData() {
  const sessionType = document.getElementById('telemetry-session').value;
  const loader = document.getElementById('analysis-loader');
  const tabsHeader = document.getElementById('analysis-tabs-header');

  try {
    loader.style.display = 'flex';
    if (tabsHeader) tabsHeader.style.display = 'none';

    // Show section
    document.getElementById('post-race-analysis-section').style.display = 'block';

    // Fetch Results
    const res = await fetch(`/race-results/${currentYearSelected}/${encodeURIComponent(currentRoundNum)}/${sessionType}`);
    if (res.ok) {
      const data = await res.json();
      analysisData = data;
      renderResultsTable();
    }

    // Render the active tab chart (usually results, so already done)
    switchAnalysisTab(activeAnalysisTab);

  } catch (err) {
    console.error('Error loading analysis data:', err);
  } finally {
    loader.style.display = 'none';
    if (tabsHeader) tabsHeader.style.display = 'flex';
  }
}

function renderResultsTable() {
  const container = document.getElementById('tab-results');
  if (!analysisData || !analysisData.results || analysisData.results.length === 0) {
    container.innerHTML = '<p style="color:var(--accent); padding:2rem; text-align:center;">결과 데이터가 없습니다.</p>';
    return;
  }

  let html = `
    <table style="width: 100%; border-collapse: collapse; font-family: 'Exo 2'; color: #fff; text-align: center; font-size: 0.9rem;">
      <thead>
        <tr style="background: rgba(255,255,255,0.05); color: #8c8c9e; font-size: 0.8rem;">
          <th style="padding: 0.8rem;">POS</th>
          <th style="padding: 0.8rem; text-align: left;">DRIVER</th>
          <th style="padding: 0.8rem; text-align: left;">TEAM</th>
          <th style="padding: 0.8rem;">TIME/RETIRED</th>
          <th style="padding: 0.8rem;">PTS</th>
          <th style="padding: 0.8rem;">GRID</th>
          <th style="padding: 0.8rem;">CHANGE</th>
        </tr>
      </thead>
      <tbody>
  `;

  analysisData.results.forEach(r => {
    let change = r.grid - r.position;
    let changeStr = change > 0 ? `<span style="color:#2ecc71;">▲ ${change}</span>` : (change < 0 ? `<span style="color:#e10600;">▼ ${Math.abs(change)}</span>` : `<span style="color:#8c8c9e;">-</span>`);

    const teamColor = getTeamColor(r.team);

    html += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
        <td style="padding: 0.8rem; font-weight: 700;">${r.position || 'DNF'}</td>
        <td style="padding: 0.8rem; text-align: left; font-weight: 700; position: relative;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div style="width:3px; height:15px; background:${teamColor}; border-radius:2px;"></div>
            ${r.driver}
          </div>
        </td>
        <td style="padding: 0.8rem; text-align: left; font-size: 0.8rem; color: #ccc;">${r.team}</td>
        <td style="padding: 0.8rem; font-family: 'Orbitron';">${r.status === 'Finished' || r.status.includes('+') ? r.gap : r.status}</td>
        <td style="padding: 0.8rem; font-weight: 700; color: #2ecc71;">${r.points > 0 ? '+' + r.points : 0}</td>
        <td style="padding: 0.8rem;">${r.grid || '-'}</td>
        <td style="padding: 0.8rem; font-weight: 700;">${changeStr}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function destroyChart(name) {
  if (analysisCharts[name]) {
    analysisCharts[name].destroy();
    analysisCharts[name] = null;
  }
}

function renderLapPositionChart() {
  if (!raceSimData || !raceSimData.laps) return;
  const canvas = document.getElementById('chart-position');
  if (!canvas) return;

  destroyChart('position');

  // Calculate lap-by-lap positions
  // For each lap, collect all drivers' lap_time_sec and start_time to sort them
  let maxLaps = 0;
  const drivers = Object.keys(raceSimData.laps);
  drivers.forEach(d => {
    if (raceSimData.laps[d].length > maxLaps) maxLaps = raceSimData.laps[d].length;
  });

  const datasets = [];

  drivers.forEach(d => {
    const laps = raceSimData.laps[d];
    if (laps.length === 0) return;
    const color = getTeamColor(currentDrivers.find(dr => dr.abbreviation === d)?.team || 'Default');

    // Generate position for each lap
    // FastF1 laps don't explicitly have "Position" that we pulled, so we estimate by `time` (end of lap time)
    // Actually, sorting by `time` at each lap_num gives the exact position crossing the line!
    const data = [];
    for (let i = 1; i <= maxLaps; i++) {
      // Find who crossed lap `i` and when
      let crossingTimes = [];
      drivers.forEach(drv => {
        const drvLap = raceSimData.laps[drv].find(l => l.lap_num === i);
        if (drvLap && drvLap.time > 0) crossingTimes.push({ drv, time: drvLap.time });
      });
      crossingTimes.sort((a, b) => a.time - b.time);
      const posIndex = crossingTimes.findIndex(x => x.drv === d);
      if (posIndex !== -1) {
        data.push({ x: i, y: posIndex + 1 });
      } else {
        // Did not complete this lap
        data.push({ x: i, y: null });
      }
    }

    datasets.push({
      label: d,
      data: data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.1,
      spanGaps: true
    });
  });

  analysisCharts['position'] = new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'nearest',
          intersect: false,
          callbacks: {
            label: function (context) { return `${context.dataset.label} : P${context.parsed.y}`; }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: 1,
          max: maxLaps,
          grid: { color: 'rgba(255,255,255,0.05)' },
          title: { display: true, text: 'Lap', color: '#8c8c9e' },
          ticks: { color: '#8c8c9e', stepSize: 5 }
        },
        y: {
          reverse: true,
          min: 1,
          max: 20,
          grid: { color: 'rgba(255,255,255,0.05)' },
          title: { display: true, text: 'Position', color: '#8c8c9e' },
          ticks: { color: '#8c8c9e', stepSize: 1 }
        }
      }
    }
  });
}

function renderTyreStrategyChart() {
  if (!raceSimData || !raceSimData.laps) return;
  const canvas = document.getElementById('chart-tyre');
  if (!canvas) return;

  destroyChart('tyre');

  const drivers = Object.keys(raceSimData.laps);
  // Sort drivers based on finishing position from results table, or fallback to custom sort
  if (analysisData && analysisData.results && analysisData.results.length > 0) {
    const resultsMap = {};
    analysisData.results.forEach((r, index) => {
      if (r.driver) {
        resultsMap[r.driver.toUpperCase()] = index;
      }
    });
    drivers.sort((a, b) => {
      const posA = resultsMap[a.toUpperCase()] !== undefined ? resultsMap[a.toUpperCase()] : 999;
      const posB = resultsMap[b.toUpperCase()] !== undefined ? resultsMap[b.toUpperCase()] : 999;
      return posA - posB;
    });
  } else {
    drivers.sort((a, b) => {
      const lapsA = raceSimData.laps[a];
      const lapsB = raceSimData.laps[b];
      if (!lapsA.length) return 1;
      if (!lapsB.length) return -1;
      if (lapsA.length !== lapsB.length) return lapsB.length - lapsA.length;
      return lapsA[lapsA.length - 1].time - lapsB[lapsB.length - 1].time;
    });
  }

  const labels = [];
  const datasetsMap = {
    'SOFT': [], 'MEDIUM': [], 'HARD': [], 'INTERMEDIATE': [], 'WET': [], 'UNKNOWN': []
  };

  // Format data for floating bar chart (x: [startLap, endLap])
  drivers.forEach((d, idx) => {
    labels.push(d);
    // Ensure laps are sorted chronologically by lap number
    const laps = [...raceSimData.laps[d]].sort((a, b) => a.lap_num - b.lap_num);

    let currentStint = null;

    const getNormalizedCompound = (compStr) => {
      if (!compStr) return 'UNKNOWN';
      const upper = compStr.toUpperCase().trim();
      if (upper.includes('SOFT')) return 'SOFT';
      if (upper.includes('MEDIUM')) return 'MEDIUM';
      if (upper.includes('HARD')) return 'HARD';
      if (upper.includes('INTER')) return 'INTERMEDIATE';
      if (upper.includes('WET')) return 'WET';
      return 'UNKNOWN';
    };

    laps.forEach(l => {
      const normComp = getNormalizedCompound(l.compound);
      if (!currentStint) {
        currentStint = { comp: normComp, start: l.lap_num - 1, end: l.lap_num };
      } else if (currentStint.comp === normComp) {
        currentStint.end = l.lap_num;
      } else {
        // push old stint
        let comp = currentStint.comp;
        if (!datasetsMap[comp]) comp = 'UNKNOWN';
        datasetsMap[comp].push({ x: [currentStint.start, currentStint.end], y: d });
        // start new
        currentStint = { comp: normComp, start: l.lap_num - 1, end: l.lap_num };
      }
    });
    if (currentStint) {
      let comp = currentStint.comp;
      if (!datasetsMap[comp]) comp = 'UNKNOWN';
      datasetsMap[comp].push({ x: [currentStint.start, currentStint.end], y: d });
    }
  });

  const colors = {
    'SOFT': '#e10600',
    'MEDIUM': '#f1c40f',
    'HARD': '#ffffff',
    'INTERMEDIATE': '#2ecc71',
    'WET': '#3498db',
    'UNKNOWN': '#8c8c9e'
  };

  const datasets = Object.keys(datasetsMap).filter(k => datasetsMap[k].length > 0).map(comp => ({
    label: comp,
    data: datasetsMap[comp],
    backgroundColor: colors[comp],
    barPercentage: 0.6
  }));

  const stintLabelsPlugin = {
    id: 'stintLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden) return;

        meta.data.forEach((element, index) => {
          const rawVal = dataset.data[index];
          if (!rawVal || !rawVal.x) return;

          const endLap = rawVal.x[1];
          const xPos = element.x;
          const barHeight = element.height || 15;
          const yPos = element.y - (barHeight / 2) - 2;

          ctx.fillText(endLap.toString(), xPos, yPos);
        });
      });
      ctx.restore();
    }
  };

  analysisCharts['tyre'] = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#fff', font: { family: 'Exo 2' } }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const start = ctx.raw.x[0] + 1;
              const end = ctx.raw.x[1];
              const laps = end - start + 1;
              return `${ctx.dataset.label}: Lap ${start} - ${end} (${laps} laps)`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8c8c9e' },
          title: { display: true, text: 'Lap Number', color: '#8c8c9e' }
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { color: '#fff', font: { weight: 'bold' } }
        }
      }
    },
    plugins: [stintLabelsPlugin]
  });
}

function renderLapPaceChart() {
  if (!raceSimData || !raceSimData.laps) return;
  const canvas = document.getElementById('chart-pace');
  if (!canvas) return;

  destroyChart('pace');

  const datasets = [];
  const drivers = Object.keys(raceSimData.laps);
  let maxLaps = 0;

  // Calculate a reasonable Y-axis max (filter out outliers like pit in/out laps)
  let allLapTimes = [];

  drivers.forEach(d => {
    const laps = raceSimData.laps[d];
    if (laps.length === 0) return;
    if (laps.length > maxLaps) maxLaps = laps.length;

    const color = getTeamColor(currentDrivers.find(dr => dr.abbreviation === d)?.team || 'Default');
    const data = [];

    laps.forEach(l => {
      if (l.lap_time_sec > 0 && l.pit_in === null && l.pit_out === null) {
        data.push({ x: l.lap_num, y: l.lap_time_sec });
        allLapTimes.push(l.lap_time_sec);
      } else {
        data.push({ x: l.lap_num, y: null });
      }
    });

    // Only show selected drivers to reduce clutter, or show top 5
    if (selectedDrivers.includes(d)) {
      datasets.push({
        label: d,
        data: data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.2,
        spanGaps: false
      });
    }
  });

  if (datasets.length === 0) return;

  const plottedTimes = [];
  datasets.forEach(d => {
    d.data.forEach(pt => {
      if (pt.y !== null && pt.y !== undefined && pt.y > 0) {
        plottedTimes.push(pt.y);
      }
    });
  });

  let minTime = undefined;
  let maxTime = undefined;
  if (plottedTimes.length > 0) {
    const minVal = Math.min(...plottedTimes);
    const maxVal = Math.max(...plottedTimes);
    const range = maxVal - minVal;
    minTime = Math.max(0, minVal - Math.max(1, range * 0.05));
    maxTime = maxVal + Math.max(1, range * 0.05);
  }

  analysisCharts['pace'] = new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#fff' } },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const sec = ctx.raw.y;
              const m = Math.floor(sec / 60);
              const s = (sec % 60).toFixed(3);
              return `${ctx.dataset.label}: ${m > 0 ? m + ':' : ''}${s}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: 1, max: maxLaps,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8c8c9e' }
        },
        y: {
          min: minTime, max: maxTime,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#8c8c9e',
            callback: function (val) {
              const m = Math.floor(val / 60);
              const s = (val % 60).toFixed(1);
              return `${m > 0 ? m + ':' : ''}${s}`;
            }
          }
        }
      }
    }
  });
}

function setupTelemetryTab() {
  const container = document.getElementById('telemetry-driver-selectors');
  if (!container) return;

  const currentKey = `${currentYearSelected}-${currentRoundNum}-${document.getElementById('telemetry-session').value}`;
  if (container.getAttribute('data-event-key') === currentKey) {
    return; // Already populated for this event/session
  }
  container.setAttribute('data-event-key', currentKey);

  const drivers = Object.keys(raceSimData.laps);
  let html = '';
  drivers.forEach(d => {
    const isChecked = selectedDrivers.includes(d) ? 'checked' : '';
    html += `
        <label style="display:flex; align-items:center; gap:0.25rem; background:rgba(255,255,255,0.05); padding:0.25rem 0.5rem; border-radius:4px; cursor:pointer;">
            <input type="checkbox" class="tel-drv-chk" value="${d}" ${isChecked}>
            <span style="color:#fff; font-size:0.85rem; font-weight:600;">${d}</span>
        </label>
      `;
  });
  container.innerHTML = html;

  // enforce max 3 checkboxes
  const chks = document.querySelectorAll('.tel-drv-chk');
  chks.forEach(chk => {
    chk.addEventListener('change', () => {
      const checked = document.querySelectorAll('.tel-drv-chk:checked');
      if (checked.length > 3) chk.checked = false;
    });
  });

  // Populate Lap Selector
  const lapSelector = document.getElementById('telemetry-lap-selector');
  if (lapSelector) {
    let maxLaps = 0;
    drivers.forEach(d => {
      if (raceSimData.laps[d].length > maxLaps) maxLaps = raceSimData.laps[d].length;
    });

    let lapHtml = '<option value="fastest">가장 빠른 랩 (Fastest Lap)</option>';
    for (let i = 1; i <= maxLaps; i++) {
      lapHtml += `<option value="${i}">Lap ${i}</option>`;
    }
    lapSelector.innerHTML = lapHtml;
  }
}

async function loadTelemetryCharts() {
  const sessionType = document.getElementById('telemetry-session').value;
  const checked = Array.from(document.querySelectorAll('.tel-drv-chk:checked')).map(c => c.value);
  if (checked.length === 0) return alert('드라이버를 최소 1명 선택하세요.');

  const lapVal = document.getElementById('telemetry-lap-selector')?.value || 'fastest';
  const loader = document.getElementById('analysis-loader');

  try {
    loader.style.display = 'flex';
    const res = await fetch(`/fastest-lap-telemetry/${currentYearSelected}/${encodeURIComponent(currentRoundNum)}/${sessionType}?drivers=${checked.join(',')}&lap=${lapVal}`);
    if (!res.ok) throw new Error('Failed to fetch telemetry');

    const data = await res.json();

    ['speed', 'throttle', 'brake', 'rpm', 'gear'].forEach(chartType => {
      destroyChart(`tel_${chartType}`);
      const canvas = document.getElementById(`chart-tel-${chartType}`);

      const datasets = [];
      checked.forEach(d => {
        if (!data[d]) return;
        const color = getTeamColor(currentDrivers.find(dr => dr.abbreviation === d)?.team || 'Default');

        datasets.push({
          label: d,
          data: data[d].map(p => ({ x: p.distance, y: p[chartType] })),
          borderColor: color,
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1,
          fill: chartType === 'brake' ? { target: 'origin', above: color + '40' } : false,
          stepped: chartType === 'gear' ? 'middle' : false
        });
      });

      let yMax = undefined;
      if (chartType === 'throttle') yMax = 105;
      if (chartType === 'brake') yMax = 1.2;
      if (chartType === 'gear') yMax = 9;

      analysisCharts[`tel_${chartType}`] = new Chart(canvas, {
        type: 'line',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: chartType === 'speed', labels: { color: '#fff' } },
            title: { display: true, text: chartType.toUpperCase(), color: '#fff', align: 'start' }
          },
          scales: {
            x: { type: 'linear', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8c8c9e' } },
            y: {
              max: yMax,
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#8c8c9e', stepSize: chartType === 'brake' ? 1 : undefined }
            }
          }
        }
      });
    });

  } catch (err) {
    console.error(err);
    alert('텔레메트리 데이터를 불러오지 못했습니다.');
  } finally {
    loader.style.display = 'none';
  }
}

