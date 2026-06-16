import re
import os

filepath = 'js/events.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the table structure in renderTelemetryUI
table_header_old = """      <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-family: 'Exo 2', sans-serif; font-size: 0.85rem; text-align: center; color: #fff;">
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
      </table>"""

table_header_new = """      <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-family: 'Exo 2', sans-serif; font-size: 0.75rem; text-align: center; color: #fff; line-height: 1.2;">
        <thead>
          <tr style="background: rgba(255,255,255,0.02); color: #8c8c9e; font-size: 0.7rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <th style="padding: 0.4rem; font-weight: 700; width: 5%;">PIT</th>
            <th style="padding: 0.4rem; font-weight: 700; text-align: left; width: 17%;">DRIVER</th>
            <th style="padding: 0.4rem; font-weight: 700; width: 10%;">INTERVAL</th>
            <th style="padding: 0.4rem; font-weight: 700; width: 10%;">TYRE</th>
            <th style="padding: 0.4rem; font-weight: 700; width: 10%;">BEST LAP</th>
            <th style="padding: 0.4rem; font-weight: 700; width: 10%;">LEADER</th>
            <th style="padding: 0.4rem; font-weight: 700; width: 10%;">LAST LAP</th>
            <th style="padding: 0.4rem; font-weight: 700; width: 14%;">LAST SECTORS</th>
            <th style="padding: 0.4rem; font-weight: 700; width: 14%;">BEST SECTORS</th>
          </tr>
        </thead>
        <tbody id="live-timing-tbody">
          <tr><td colspan="9" style="padding: 2rem;">데이터를 불러오는 중입니다...</td></tr>
        </tbody>
      </table>"""

content = content.replace(table_header_old, table_header_new)

# 2. Replace toggleSimulation with 1x requestAnimationFrame
toggle_sim_old = """window.toggleSimulation = function() {
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
};"""

toggle_sim_new = """let lastFrameTime = 0;
let animationFrameId = null;

window.toggleSimulation = function() {
  const playBtn = document.getElementById('sim-play-btn');
  const slider = document.getElementById('sim-time-slider');
  
  if (!raceSimData) return;
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    playBtn.textContent = '▶';
  } else {
    playBtn.textContent = '⏸';
    lastFrameTime = performance.now();
    
    function loop(now) {
      const dt = (now - lastFrameTime) / 1000.0; // seconds
      lastFrameTime = now;
      
      currentSimIndex += dt; // 1x speed exactly
      if (currentSimIndex > maxSimTime) {
        currentSimIndex = 0;
      }
      if (slider) slider.value = currentSimIndex;
      updateSimulationFrame(currentSimIndex);
      
      animationFrameId = requestAnimationFrame(loop);
    }
    animationFrameId = requestAnimationFrame(loop);
  }
};"""

content = content.replace(toggle_sim_old, toggle_sim_new)

# 3. Replace onSliderMove to handle new state
on_slider_old = """window.onSliderMove = function(val) {
  currentSimIndex = parseFloat(val);
  updateSimulationFrame(currentSimIndex);
};"""
on_slider_new = """window.onSliderMove = function(val) {
  currentSimIndex = parseFloat(val);
  updateSimulationFrame(currentSimIndex);
  if (animationFrameId) lastFrameTime = performance.now(); // reset delta
};"""
content = content.replace(on_slider_old, on_slider_new)


# 4. Replace the entire updateSimulationFrame body.
# Using regex to find updateSimulationFrame and replace everything until updateRpmLeds
update_sim_pattern = re.compile(r'function updateSimulationFrame\(simTime\) \{.*?(?=function updateRpmLeds)', re.DOTALL)

update_sim_new = """function updateSimulationFrame(simTime) {
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
      if (totalLaps > 0) lapDisplay.textContent = `Lap ${currentLapNum} / ${totalLaps}`;
      else lapDisplay.textContent = `Lap ${currentLapNum}`;
    } else {
      if (totalLaps > 0 && simTime >= maxSimTime) lapDisplay.textContent = `Lap ${totalLaps} / ${totalLaps}`;
      else lapDisplay.textContent = 'Lap --';
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
    const wrench = document.getElementById(`dr-wrench-${d}`);
    if (wrench) {
      if (isDriverInPits(d, simTime)) wrench.style.display = 'block';
      else wrench.style.display = 'none';
    }
  });
  
  // Helper for formatting time (stopwatch)
  function formatStopwatch(sec) {
    if (sec <= 0 || isNaN(sec)) return '';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec - Math.floor(sec)) * 1000);
    return `${m > 0 ? m + ':' : ''}${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }
  
  function getCompoundColor(comp) {
    if (comp === 'SOFT') return '#e10600';
    if (comp === 'MEDIUM') return '#f1c40f';
    if (comp === 'HARD') return '#ffffff';
    if (comp === 'INTERMEDIATE') return '#2ecc71';
    if (comp === 'WET') return '#3498db';
    return '#8c8c9e';
  }
  function getCompoundIcon(comp) {
    if (comp === 'SOFT') return 'S';
    if (comp === 'MEDIUM') return 'M';
    if (comp === 'HARD') return 'H';
    if (comp === 'INTERMEDIATE') return 'I';
    if (comp === 'WET') return 'W';
    return '?';
  }

  // 3. Live Timing Update
  const tbody = document.getElementById('live-timing-tbody');
  if (!tbody) return;
  
  let allDriversData = [];
  const allDrvs = Object.keys(raceSimData.laps);
  
  allDrvs.forEach(drv => {
    const laps = raceSimData.laps[drv];
    if (!laps || laps.length === 0) return;
    
    let currentLap = null;
    let lapIndex = -1;
    for (let i = 0; i < laps.length; i++) {
      if (simTime >= laps[i].start_time && simTime <= laps[i].time) {
        currentLap = laps[i];
        lapIndex = i;
        break;
      }
    }
    
    if (!currentLap && simTime > laps[laps.length-1].time) {
      currentLap = laps[laps.length-1];
      lapIndex = laps.length - 1;
    }
    
    if (!currentLap) return; // Hasn't started
    
    let lastCompletedLap = lapIndex > 0 ? laps[lapIndex - 1] : null;
    if (simTime > currentLap.time) {
      lastCompletedLap = currentLap; // finished the race
    }
    
    let bestLap = null;
    let bestS1 = 0, bestS2 = 0, bestS3 = 0;
    
    for (let i = 0; i <= lapIndex; i++) {
        let l = laps[i];
        if (simTime > l.time) { // completed lap
            if (l.lap_time_sec > 0 && (!bestLap || l.lap_time_sec < bestLap.lap_time_sec)) bestLap = l;
            if (l.s1_sec > 0 && (!bestS1 || l.s1_sec < bestS1)) bestS1 = l.s1_sec;
            if (l.s2_sec > 0 && (!bestS2 || l.s2_sec < bestS2)) bestS2 = l.s2_sec;
            if (l.s3_sec > 0 && (!bestS3 || l.s3_sec < bestS3)) bestS3 = l.s3_sec;
        }
    }
    
    const inPit = isDriverInPits(drv, simTime);
    
    // Calculate sectors for current UI
    let currS1 = '', currS2 = '', currS3 = '';
    if (lastCompletedLap) {
       currS1 = lastCompletedLap.s1_sec > 0 ? lastCompletedLap.s1_sec.toFixed(3) : '';
       currS2 = lastCompletedLap.s2_sec > 0 ? lastCompletedLap.s2_sec.toFixed(3) : '';
       currS3 = lastCompletedLap.s3_sec > 0 ? lastCompletedLap.s3_sec.toFixed(3) : '';
    }
    if (!inPit) {
        if (simTime > currentLap.start_time + currentLap.s1_sec && currentLap.s1_sec > 0) currS1 = currentLap.s1_sec.toFixed(3);
        if (simTime > currentLap.start_time + currentLap.s1_sec + currentLap.s2_sec && currentLap.s2_sec > 0) currS2 = currentLap.s2_sec.toFixed(3);
    }
    
    const teamInfo = currentDrivers.find(d => d.abbreviation === drv);
    const teamColor = getTeamColor(teamInfo ? teamInfo.team : 'Default');
    
    allDriversData.push({
      drv,
      teamColor,
      lapNum: currentLap.lap_num,
      startTime: currentLap.start_time,
      isFinished: simTime > currentLap.time,
      inPit,
      compound: currentLap.compound,
      tyreLife: currentLap.tyre_life,
      lastLap: lastCompletedLap ? formatStopwatch(lastCompletedLap.lap_time_sec) : '',
      bestLap: bestLap ? formatStopwatch(bestLap.lap_time_sec) : '',
      lastCompletedTime: lastCompletedLap ? lastCompletedLap.time : 0,
      currS1, currS2, currS3,
      bestS1: bestS1 ? bestS1.toFixed(3) : '',
      bestS2: bestS2 ? bestS2.toFixed(3) : '',
      bestS3: bestS3 ? bestS3.toFixed(3) : ''
    });
  });
  
  if (allDriversData.length === 0) return;
  
  // Sort by progression: higher lapNum, then earlier startTime (meaning they crossed the line earlier)
  allDriversData.sort((a, b) => {
    if (a.lapNum !== b.lapNum) return b.lapNum - a.lapNum;
    return a.startTime - b.startTime;
  });
  
  const leader = allDriversData[0];
  
  // Calculate fastest sectors across ALL drivers up to now
  let purpleS1 = Infinity, purpleS2 = Infinity, purpleS3 = Infinity, purpleLap = Infinity;
  allDriversData.forEach(d => {
      if (d.bestS1 && parseFloat(d.bestS1) < purpleS1) purpleS1 = parseFloat(d.bestS1);
      if (d.bestS2 && parseFloat(d.bestS2) < purpleS2) purpleS2 = parseFloat(d.bestS2);
      if (d.bestS3 && parseFloat(d.bestS3) < purpleS3) purpleS3 = parseFloat(d.bestS3);
      
      const lapSecs = d.bestLap.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
      if (lapSecs > 0 && lapSecs < purpleLap) purpleLap = lapSecs;
  });

  tbody.innerHTML = allDriversData.map((d, idx) => {
    // Gap calculation
    let gapToLeader = '';
    let gapToNext = '';
    
    if (idx === 0) {
      gapToLeader = 'Leader';
      gapToNext = 'Interval';
    } else {
      const ahead = allDriversData[idx-1];
      if (d.lapNum === leader.lapNum) {
          if (d.lastCompletedTime > 0 && leader.lastCompletedTime > 0) {
              gapToLeader = '+' + (d.lastCompletedTime - leader.lastCompletedTime).toFixed(3);
          }
      } else {
          gapToLeader = (leader.lapNum - d.lapNum) + 'L';
      }
      
      if (d.lapNum === ahead.lapNum) {
          if (d.lastCompletedTime > 0 && ahead.lastCompletedTime > 0) {
              gapToNext = '+' + (d.lastCompletedTime - ahead.lastCompletedTime).toFixed(3);
          }
      } else {
          gapToNext = (ahead.lapNum - d.lapNum) + 'L';
      }
    }
    
    const compColor = getCompoundColor(d.compound);
    const compIcon = getCompoundIcon(d.compound);
    
    const isSelected = selectedDrivers.includes(d.drv);
    const bgStyle = isSelected ? 'background: rgba(255,255,255,0.05);' : 'background: transparent;';
    
    // Position styling
    const posBg = idx === 0 ? '#e10600' : (idx === 1 ? '#3498db' : (idx === 2 ? '#f1c40f' : (idx < 10 ? '#34495e' : 'transparent')));
    const posColor = idx < 3 ? '#fff' : '#8c8c9e';
    
    const fmtLapSecs = d.bestLap.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    const bestLapColor = Math.abs(fmtLapSecs - purpleLap) < 0.001 ? '#9b59b6' : '#2ecc71';
    
    return `
      <tr style="${bgStyle} border-bottom: 1px solid rgba(255,255,255,0.03);">
        <td style="padding: 0.2rem;">
          ${d.inPit ? '<span style="color: #fff; font-weight: 700; background: #c0392b; padding: 0.1rem 0.2rem; border-radius: 2px;">PIT</span>' : ''}
        </td>
        <td style="padding: 0.2rem; text-align: left; position: relative;">
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <div style="width: 18px; text-align: center; background: ${posBg}; color: ${posColor}; border-radius: 2px; font-weight: 700;">${idx + 1}</div>
            <div style="width: 3px; height: 14px; background: ${d.teamColor}; border-radius: 2px;"></div>
            <span style="font-weight: 700; font-size: 0.85rem;">${d.drv}</span>
          </div>
        </td>
        <td style="padding: 0.2rem; font-family: 'Orbitron'; font-weight: 700; color: ${idx===0 ? '#fff' : '#fff'};">${gapToNext}</td>
        <td style="padding: 0.2rem;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.2rem;">
            <span style="font-size: 0.8rem;">${d.tyreLife}</span>
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid ${compColor}; color: ${compColor}; font-size: 0.6rem; font-weight: 700; line-height: 12px;">${compIcon}</span>
          </div>
        </td>
        <td style="padding: 0.2rem; font-family: 'Orbitron'; font-weight: 700; color: ${d.bestLap ? bestLapColor : '#fff'};">${d.bestLap}</td>
        <td style="padding: 0.2rem; font-family: 'Orbitron'; color: #8c8c9e;">${gapToLeader}</td>
        <td style="padding: 0.2rem; font-family: 'Orbitron'; color: #ccc;">${d.lastLap}</td>
        <td style="padding: 0.2rem; font-family: 'Orbitron'; font-size: 0.65rem; color: #8c8c9e;">
          <span style="display:inline-block; width: 32px; text-align: right;">${d.currS1}</span>
          <span style="display:inline-block; width: 32px; text-align: right;">${d.currS2}</span>
          <span style="display:inline-block; width: 32px; text-align: right;">${d.currS3}</span>
        </td>
        <td style="padding: 0.2rem; font-family: 'Orbitron'; font-size: 0.65rem; font-weight: 700; color: #fff;">
          <span style="display:inline-block; width: 32px; text-align: right; color: ${Math.abs(parseFloat(d.bestS1) - purpleS1) < 0.001 ? '#9b59b6' : (d.bestS1 ? '#2ecc71' : '#fff')}">${d.bestS1}</span>
          <span style="display:inline-block; width: 32px; text-align: right; color: ${Math.abs(parseFloat(d.bestS2) - purpleS2) < 0.001 ? '#9b59b6' : (d.bestS2 ? '#2ecc71' : '#fff')}">${d.bestS2}</span>
          <span style="display:inline-block; width: 32px; text-align: right; color: ${Math.abs(parseFloat(d.bestS3) - purpleS3) < 0.001 ? '#9b59b6' : (d.bestS3 ? '#2ecc71' : '#fff')}">${d.bestS3}</span>
        </td>
      </tr>
    `;
  }).join('');
}
"""

content = update_sim_pattern.sub(update_sim_new, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to events.js")
