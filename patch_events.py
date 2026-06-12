import sys

with open('js/events.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add session selector to the dropdown row
dropdown_row_idx = js.find('<!-- 드라이버 선택 선택창 바 -->')
dropdown_row_end = js.find('<!-- 시뮬레이션 컨트롤러 -->', dropdown_row_idx)

new_dropdown_html = """
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
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">비교군:</span>
        <select id="telemetry-driver-1" style="background: #101026; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.35rem 0.75rem; border-radius: 4px; font-family: 'Exo 2'; font-weight: 600; outline: none; cursor: pointer;" onchange="onDriverChange()"></select>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">대조군:</span>
        <select id="telemetry-driver-2" style="background: #101026; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.35rem 0.75rem; border-radius: 4px; font-family: 'Exo 2'; font-weight: 600; outline: none; cursor: pointer;" onchange="onDriverChange()"></select>
      </div>
      <div id="telemetry-loading-indicator" style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
        <div class="loading-spinner" style="border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block;"></div>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">데이터 로드 중...</span>
      </div>
    </div>
    
    <!-- 라이브 타이밍 테이블 영역 -->
    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 1.5rem; overflow-x: auto;">
      <h3 style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:1rem; color:#fff; padding: 1rem; margin:0; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:0.5rem;">
        <span style="color:#9b59b6; font-size:1.2rem;">⏱️</span> 실시간 랩 타이밍 & 섹터 기록
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-family: 'Exo 2', sans-serif; font-size: 0.85rem; text-align: center; color: #fff;">
        <thead>
          <tr style="background: rgba(255,255,255,0.02); color: #8c8c9e;">
            <th style="padding: 0.75rem; font-weight: 600;">POS</th>
            <th style="padding: 0.75rem; font-weight: 600; text-align: left;">DRIVER</th>
            <th style="padding: 0.75rem; font-weight: 600;">TIME</th>
            <th style="padding: 0.75rem; font-weight: 600;">S1</th>
            <th style="padding: 0.75rem; font-weight: 600;">S2</th>
            <th style="padding: 0.75rem; font-weight: 600;">S3</th>
            <th style="padding: 0.75rem; font-weight: 600;">TYRE</th>
          </tr>
        </thead>
        <tbody id="live-timing-tbody">
          <tr><td colspan="7" style="padding: 2rem;">데이터를 불러오는 중입니다...</td></tr>
        </tbody>
      </table>
    </div>
"""

js = js[:dropdown_row_idx] + new_dropdown_html + '\n    ' + js[dropdown_row_end:]

# 2. Add Chart.js container below the telemetry dashboard
dashboard_end_idx = js.find('<!-- 실시간 트랙 트래커 -->')
dashboard_end_div = js.rfind('</div>', 0, dashboard_end_idx)

chart_html = """
      <!-- 텔레메트리 트렌드 그래프 영역 -->
      <div class="telemetry-panel" style="grid-column: 1 / -1; margin-top: 1rem;">
        <h3 style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:1rem; color:#fff; margin:0 0 1rem 0; display:flex; align-items:center; gap:0.5rem;">
          <span style="color:#f1c40f; font-size:1.2rem;">📈</span> 텔레메트리 추이 분석 (RPM & 브레이크)
        </h3>
        <div style="position: relative; height: 350px; width: 100%;">
          <canvas id="telemetry-chart-canvas"></canvas>
        </div>
      </div>
"""
js = js[:dashboard_end_div+6] + chart_html + '\n    ' + js[dashboard_end_div+6:]

# 3. Update loadSessionDrivers to fetch session drivers and call fetchLiveTiming
js = js.replace('async function loadSessionDrivers(roundNum) {', """
window.onSessionChange = async function() {
  await loadSessionDrivers(currentRoundNum);
};

let myChart = null;

async function fetchLiveTiming() {
  const sessionType = document.getElementById('telemetry-session').value;
  const tbody = document.getElementById('live-timing-tbody');
  
  try {
    const res = await fetch(`/live-timing/2026/${currentRoundNum}/${sessionType}`);
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
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
          <td style="padding: 0.75rem;">${idx + 1}</td>
          <td style="padding: 0.75rem; text-align: left; font-weight: 700;">${t.driver} <span style="font-size:0.7rem; color:#8c8c9e; font-weight:normal;">(${t.team})</span></td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.lap_color)}">${t.lap_time || 'N/A'}</td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.s1_color)}">${t.s1 || 'N/A'}</td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.s2_color)}">${t.s2 || 'N/A'}</td>
          <td style="padding: 0.75rem; font-family: 'Orbitron'; ${getColColor(t.s3_color)}">${t.s3 || 'N/A'}</td>
          <td style="padding: 0.75rem; font-weight: 700; color: ${compColor};">${t.compound}</td>
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
  
  const d1 = document.getElementById('telemetry-driver-1').value;
  const d2 = document.getElementById('telemetry-driver-2').value;
  
  const distances = telemetryPoints1.map(p => p.distance);
  
  myChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: distances,
      datasets: [
        {
          label: `${d1} RPM`,
          data: telemetryPoints1.map(p => p.rpm),
          borderColor: '#e10600',
          borderWidth: 1.5,
          yAxisID: 'yRpm',
          pointRadius: 0,
          tension: 0.1
        },
        {
          label: `${d2} RPM`,
          data: telemetryPoints2.map(p => p.rpm),
          borderColor: '#00d4be',
          borderWidth: 1.5,
          yAxisID: 'yRpm',
          pointRadius: 0,
          tension: 0.1
        },
        {
          label: `${d1} Brake`,
          data: telemetryPoints1.map(p => p.brake ? 100 : 0),
          borderColor: 'rgba(225, 6, 0, 0.4)',
          borderWidth: 1,
          yAxisID: 'yBrake',
          fill: true,
          backgroundColor: 'rgba(225, 6, 0, 0.1)',
          pointRadius: 0,
          stepped: true
        },
        {
          label: `${d2} Brake`,
          data: telemetryPoints2.map(p => p.brake ? 100 : 0),
          borderColor: 'rgba(0, 212, 190, 0.4)',
          borderWidth: 1,
          yAxisID: 'yBrake',
          fill: true,
          backgroundColor: 'rgba(0, 212, 190, 0.1)',
          pointRadius: 0,
          stepped: true
        }
      ]
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
          labels: { color: '#fff', font: { family: '\\'Exo 2\\'' } }
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
""")

# 4. Modify loadSessionDrivers fetch URL
js = js.replace('fetch(`/drivers/2026/${roundNum}`);', "fetch(`/drivers/2026/${roundNum}/${document.getElementById('telemetry-session').value}`);")

# 5. Call fetchLiveTiming inside loadSessionDrivers
js = js.replace('await fetchTelemetryForDrivers();', 'await fetchLiveTiming(); await fetchTelemetryForDrivers();')

# 6. Modify fetchTelemetryForDrivers URLs
js = js.replace('fetch(`/telemetry/2026/${currentRoundNum}/${d1}`)', "fetch(`/telemetry/2026/${currentRoundNum}/${document.getElementById('telemetry-session').value}/${d1}`)")
js = js.replace('fetch(`/telemetry/2026/${currentRoundNum}/${d2}`)', "fetch(`/telemetry/2026/${currentRoundNum}/${document.getElementById('telemetry-session').value}/${d2}`)")

# 7. Render Chart after data loading in fetchTelemetryForDrivers
idx_draw_track = js.find('drawTrackPath(telemetryPoints1);')
js = js[:idx_draw_track] + 'drawTrackPath(telemetryPoints1);\n    renderTelemetryChart();\n    ' + js[idx_draw_track:]

with open('js/events.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Patched events.js successfully.')
