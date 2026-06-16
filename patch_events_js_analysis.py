import os

filepath = 'js/events.js'

new_js = """

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
  
  try {
    loader.style.display = 'flex';
    
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
            if (drvLap && drvLap.time > 0) crossingTimes.push({drv, time: drvLap.time});
        });
        crossingTimes.sort((a,b) => a.time - b.time);
        const posIndex = crossingTimes.findIndex(x => x.drv === d);
        if (posIndex !== -1) {
            data.push({x: i, y: posIndex + 1});
        } else {
            // Did not complete this lap
            data.push({x: i, y: null});
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
             label: function(context) { return `${context.dataset.label} : P${context.parsed.y}`; }
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
  // Sort drivers by final lap count, then total time
  drivers.sort((a,b) => {
      const lapsA = raceSimData.laps[a];
      const lapsB = raceSimData.laps[b];
      if (!lapsA.length) return 1;
      if (!lapsB.length) return -1;
      if (lapsA.length !== lapsB.length) return lapsB.length - lapsA.length;
      return lapsA[lapsA.length-1].time - lapsB[lapsB.length-1].time;
  });
  
  const labels = [];
  const datasetsMap = {
      'SOFT': [], 'MEDIUM': [], 'HARD': [], 'INTERMEDIATE': [], 'WET': [], 'UNKNOWN': []
  };
  
  // Format data for floating bar chart (x: [startLap, endLap])
  drivers.forEach((d, idx) => {
      labels.push(d);
      const laps = raceSimData.laps[d];
      
      let currentStint = null;
      
      laps.forEach(l => {
          if (!currentStint) {
              currentStint = { comp: l.compound, start: l.lap_num - 1, end: l.lap_num };
          } else if (currentStint.comp === l.compound) {
              currentStint.end = l.lap_num;
          } else {
              // push old stint
              let comp = currentStint.comp;
              if (!datasetsMap[comp]) comp = 'UNKNOWN';
              datasetsMap[comp].push({ x: [currentStint.start, currentStint.end], y: idx });
              // start new
              currentStint = { comp: l.compound, start: l.lap_num - 1, end: l.lap_num };
          }
      });
      if (currentStint) {
          let comp = currentStint.comp;
          if (!datasetsMap[comp]) comp = 'UNKNOWN';
          datasetsMap[comp].push({ x: [currentStint.start, currentStint.end], y: idx });
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
                      label: function(ctx) {
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
      }
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
  
  allLapTimes.sort((a,b) => a-b);
  const minTime = allLapTimes[0] * 0.95;
  const maxTime = allLapTimes[Math.floor(allLapTimes.length * 0.90)] * 1.05; // ignore top 10% outliers
  
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
                      label: function(ctx) {
                          const sec = ctx.raw.y;
                          const m = Math.floor(sec / 60);
                          const s = (sec % 60).toFixed(3);
                          return `${ctx.dataset.label}: ${m > 0 ? m+':' : ''}${s}`;
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
                      callback: function(val) {
                          const m = Math.floor(val / 60);
                          const s = (val % 60).toFixed(1);
                          return `${m > 0 ? m+':' : ''}${s}`;
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
  
  if (container.innerHTML !== '') return; // already populated
  
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
}

async function loadTelemetryCharts() {
  const sessionType = document.getElementById('telemetry-session').value;
  const checked = Array.from(document.querySelectorAll('.tel-drv-chk:checked')).map(c => c.value);
  if (checked.length === 0) return alert('드라이버를 최소 1명 선택하세요.');
  
  const loader = document.getElementById('analysis-loader');
  
  try {
      loader.style.display = 'flex';
      const res = await fetch(`/fastest-lap-telemetry/${currentYearSelected}/${encodeURIComponent(currentRoundNum)}/${sessionType}?drivers=${checked.join(',')}`);
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
                  fill: chartType === 'brake' ? {target: 'origin', above: color + '40'} : false,
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

"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(new_js)

print("Patch applied to events.js")

