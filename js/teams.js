// F1 HUB — Teams Page JavaScript

let teams = [];
let tracks = [];
let machines = [];
let raceEvents = [];
let ALL_DRIVERS = [];
let drivers = [];


// Load drivers to display in modal
async function loadDrivers() {
  try {
    const activeRes = await fetch('/data/active_2026_drivers.json');
    const activeDrivers = await activeRes.json();

    drivers = [];
    Object.keys(activeDrivers).forEach(key => {
      const active = activeDrivers[key];
      let id = key.replace('_', '-');
      let name = '';
      let flag = '🏁';

      if (key === 'max_verstappen') { id = 'max-verstappen'; name = 'Max Verstappen'; flag = '🇳🇱'; }
      else if (key === 'hadjar') { id = 'isack-hadjar'; name = 'Isack Hadjar'; flag = '🇫🇷'; }
      else if (key === 'hamilton') { id = 'lewis-hamilton'; name = 'Lewis Hamilton'; flag = '🇬🇧'; }
      else if (key === 'leclerc') { id = 'charles-leclerc'; name = 'Charles Leclerc'; flag = '🇲🇨'; }
      else if (key === 'norris') { id = 'lando-norris'; name = 'Lando Norris'; flag = '🇬🇧'; }
      else if (key === 'piastri') { id = 'oscar-piastri'; name = 'Oscar Piastri'; flag = '🇦🇺'; }
      else if (key === 'russell') { id = 'george-russell'; name = 'George Russell'; flag = '🇬🇧'; }
      else if (key === 'antonelli') { id = 'kimi-antonelli'; name = 'Kimi Antonelli'; flag = '🇮🇹'; }
      else if (key === 'alonso') { id = 'fernando-alonso'; name = 'Fernando Alonso'; flag = '🇪🇸'; }
      else if (key === 'stroll') { id = 'lance-stroll'; name = 'Lance Stroll'; flag = '🇨🇦'; }
      else if (key === 'sainz') { id = 'carlos-sainz'; name = 'Carlos Sainz'; flag = '🇪🇸'; }
      else if (key === 'albon') { id = 'alexander-albon'; name = 'Alexander Albon'; flag = '🇹🇭'; }
      else if (key === 'bearman') { id = 'oliver-bearman'; name = 'Oliver Bearman'; flag = '🇬🇧'; }
      else if (key === 'ocon') { id = 'esteban-ocon'; name = 'Esteban Ocon'; flag = '🇫🇷'; }
      else if (key === 'bortoleto') { id = 'gabriel-bortoleto'; name = 'Gabriel Bortoleto'; flag = '🇧🇷'; }
      else if (key === 'hulkenberg') { id = 'nico-hulkenberg'; name = 'Nico Hulkenberg'; flag = '🇩🇪'; }
      else if (key === 'colapinto') { id = 'franco-colapinto'; name = 'Franco Colapinto'; flag = '🇦🇷'; }
      else if (key === 'gasly') { id = 'pierre-gasly'; name = 'Pierre Gasly'; flag = '🇫🇷'; }
      else if (key === 'lawson') { id = 'liam-lawson'; name = 'Liam Lawson'; flag = '🇳🇿'; }
      else if (key === 'lindblad') { id = 'arvid-lindblad'; name = 'Arvid Lindblad'; flag = '🇬🇧'; }
      else if (key === 'perez') { id = 'sergio-perez'; name = 'Sergio Perez'; flag = '🇲🇽'; }
      else if (key === 'bottas') { id = 'valtteri-bottas'; name = 'Valtteri Bottas'; flag = '🇫🇮'; }

      const fallbackImage = 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp';
      const image = active.image || fallbackImage;

      drivers.push({
        id: id,
        name: name,
        number: active.number,
        flag: '',
        image: image
      });
    });
  } catch (e) {
    console.error('Failed to load drivers info', e);
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const res = await fetch('/data/f1-data.json');
    const data = await res.json();
    teams = data.teams || [];
    tracks = data.tracks || [];
    machines = data.machines || [];
    raceEvents = data.raceEvents || [];
    ALL_DRIVERS = data.ALL_DRIVERS || [];
  } catch (e) { console.error('Failed to load f1-data', e); }

  await loadDrivers();

  renderTeams();
  setupModalClose('team-modal');
});



const PAGE_TEAM_LOGOS = {
  'mclaren': 'https://i.namu.wiki/i/Tk9Y-bvcjMsfBOM2uActec41oOK2-e0iUDINXhSRe-igDyq4RvAur68DzhRBuyaDkSBzsxoHpwTYg2kLdQI4O-tTGPxsm5LrvMXYyFAtyX8i7EThUqZ83eO7r9cd7wnA0HdjVmAgwhdLprKlco7x4g.svg',
  'mercedes': 'https://i.namu.wiki/i/xNlYudSAuHf3HOVll-WToV2GuSg4RaZvUp1yqDynOX8n9aKwmRyJHDC5Un7-g2sGDOAGblhbzju0U15ADrlP5gGgpHo24nNdsG6JpSfXHDfqxO7rsxKbe6UdccDs2MAqV-BhKnu3oVl0JiLor1qcBQ.svg',
  'red-bull': 'https://i.namu.wiki/i/VvV7dEJFaFr86erEU7mq0K5KzzywwFMuCUzCDKaYfDU8h8LTx69OglO8M23GXXnVwmZSo4N25Hz-Q1Tlac7VSQ.svg',
  'ferrari': 'https://i.namu.wiki/i/MONRZRLGzYq1eK0nnY-KvAPp4lGpzMmdQFePYYh-8y4h-baL4mARuc5KugblZhJVh67Cka2V602BxJbzGZ6i9PWQwOoKPPVoWBRUO6XDYLOFRTFuTsNXyljVmmS3obgooVePrJAZfrJyQCVy9p9Fzw.svg',
  'williams': 'https://i.namu.wiki/i/qEsF0dKRLzyMUa-IuZjsvU3Xzgn9EHjNehVNebt3AA1pRNFf1GIBS3qFlbpY-OKyujjgP7wDT5n3urxyX1TNZ7y05n7X28--_P-6VSUpDr_PL3lW92qLdikUpjDnhez_rb2pkRMctAnavys1bJB_BA.webp',
  'racing-bulls': 'https://i.namu.wiki/i/VnacW1rvW7QynBB4x27L_G4PS4DvJw7ScDGHwFysrBOJDzmR2iucOZQvIHox7fSokittMT2yFZiIQcNj9-v8HMSUpXPvmDBY9kuwFqB8IWYXQXtnfYGrxO0xESKmD7tXV8Yzcq3ZlaUME5Rst3GKUQ.webp',
  'aston-martin': 'https://i.namu.wiki/i/J_BwWUROLfnwWxkYtGJMPEfMa7SwX9Is7gfnBx9QsW168EgrhfpFOV2ioy2W5PM_8Yk79UjWKpdihvCb01qCIVVVurzuSkBPQ7Rnm-UtyWuoHRIY2m68hjAyqyOKagrce6baXCIe5OuuCMVpLon0Cg.svg',
  'haas': 'https://i.namu.wiki/i/8K3G-XzYQ2LXUkQS5hBNU1IaGPz37tRxBhko59pbjcBqYgrfqahSxQ-xHQIAgjMJU2oIYZzR9nD0-WwQDTaF9igG1tJd53nofgtcpeo2cbaggnFMB4x5DW9nAK92BzT3admU9rdvUOnyjs8cYJtv3w.svg',
  'audi': 'https://i.namu.wiki/i/TkZMYLbELrsVvc5mphwSusaOxBf3A4D0paJc_hyPQZDcf31_UgxSE4lEK2Hf9SDIXKxtf2nqYpOpw4FrT_UkUa-Ws7ypcHICo6pDjIIyRs4y-JZsslKh8QUmYQGUjoobJU4s3rVxlJKgTSQrhz1f6g.webp',
  'alpine': 'https://i.namu.wiki/i/xAew5yszbtQ321huNdM4nFzpvW18RZAFGBFUMplWdYAgfgqKDeC1K38JhU4fGoTCiR-qoWrcu8twqAFcJRdXwOpdrdJeOwEgXhF7LVCxbZa9ILycOG2WUOXPY0hj7ldAYKh3XGiNYNoL4eqLbhNAbQ.svg',
  'cadillac': 'https://i.namu.wiki/i/37e05wDXlpbcAvWJl1kuqs60MY6P6nS8I5kTSM0H-99GDB6tPvKVxpd47pjLr7_2LiFPIIThILz6xmv0xSs8Tw.svg'
};

// Render teams
function renderTeams() {
  const grid = document.getElementById('teams-grid');
  if (!grid) return;

  grid.innerHTML = teams.map(team => {
    const logoUrl = PAGE_TEAM_LOGOS[team.id] || TEAM_LOGOS[team.id] || '';
    const logoImg = logoUrl ? `<img src="${logoUrl}" alt="${team.name}" style="max-height: 90px; max-width: 85%; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));" />` : '🏎️';
    return `
    <div class="card" onclick="showTeamModal('${team.id}')" style="border-top: 4px solid ${team.color}; relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
      <div>
        <div style="height: 200px; background: linear-gradient(135deg, ${team.color}15 0%, ${team.color}05 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.03); position: relative; overflow: hidden;">
          ${logoImg}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem; margin: 0 0 0.25rem 0; font-family: 'Exo 2', sans-serif; font-weight: 700; color: #fff;">${team.name}</h3>
            <p style="font-size: 0.825rem; margin: 0; color: #a0a0b0; font-weight: 500;">📍 ${team.base}</p>
          </div>
          <span style="font-family: Orbitron; font-weight: 900; color: ${team.color}; font-size: 1.35rem; text-shadow: 0 0 10px ${team.color}20;">${team.shortName}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); text-align: center;">
            <div style="font-size: 0.7rem; color: #707080; font-family: 'Exo 2'; text-transform: uppercase;">포인트</div>
            <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.95rem;">${team.points}</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); text-align: center;">
            <div style="font-size: 0.7rem; color: #707080; font-family: 'Exo 2'; text-transform: uppercase;">우승</div>
            <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.95rem;">${team.wins}</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); text-align: center;">
            <div style="font-size: 0.7rem; color: #707080; font-family: 'Exo 2'; text-transform: uppercase;">챔피언</div>
            <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.95rem;">${team.championships}</div>
          </div>
        </div>
      </div>
      <p style="font-size: 0.8rem; margin: 0; color: #8e8e9e; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; margin-top: auto;">${team.bio}</p>
    </div>
    `;
  }).join('');
}

// Show team modal
function showTeamModal(teamId) {
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  document.getElementById('modal-team-name').textContent = team.name;
  document.getElementById('modal-team-info').textContent = `${team.base} • 설립 ${team.founded}년`;

  const content = `
    <style>
        .premium-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        .premium-stat-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 6px;
            padding: 0.75rem;
            text-align: center;
            transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .premium-stat-card:hover {
            border-color: ${team.color}50;
            transform: translateY(-2px);
            background: linear-gradient(135deg, ${team.color}10 0%, rgba(255,255,255,0.01) 100%);
        }
        .premium-stat-label {
            font-size: 0.65rem;
            color: #8c8c9e;
            text-transform: uppercase;
            font-family: 'Exo 2', sans-serif;
            font-weight: 700;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }
        .premium-stat-value {
            font-family: 'Orbitron', sans-serif;
            font-weight: 900;
            font-size: 1.25rem;
            color: #fff;
        }
        .premium-stat-highlight {
            color: ${team.color};
            text-shadow: 0 0 10px ${team.color}40;
        }
        .detail-section-title {
            font-family: 'Exo 2', sans-serif;
            font-weight: 700;
            font-size: 0.9rem;
            margin: 1.75rem 0 0.75rem;
            padding-bottom: 0.35rem;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .stats-sub-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }
        .timeline-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }
        .timeline-item {
            background: rgba(255,255,255,0.02);
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.04);
            transition: border-color 0.2s ease;
        }
        .timeline-item:hover {
            border-color: rgba(255,255,255,0.08);
        }
        .timeline-label {
            font-size: 0.7rem;
            color: #707080;
            font-family: 'Exo 2', sans-serif;
            font-weight: 600;
        }
        .timeline-value {
            font-size: 0.85rem;
            font-weight: 700;
            color: #e2e2e7;
            margin-top: 0.25rem;
        }
        .bio-box {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255,255,255,0.03);
            border-radius: 6px;
            padding: 1rem;
            font-size: 0.825rem;
            line-height: 1.6;
            color: #b0b0c0;
            margin-top: 1.5rem;
        }
        .badge-indicator {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: ${team.color};
            box-shadow: 0 0 8px ${team.color};
        }
        @media (max-width: 576px) {
            .premium-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .stats-sub-grid {
                grid-template-columns: 1fr;
            }
            .timeline-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>

    <!-- 핵심 요약 정보 히어로 영역 -->
    <h3 class="detail-section-title"><span class="badge-indicator"></span> 팀 커리어 히어로</h3>
    <div class="premium-grid">
        <div class="premium-stat-card">
            <div class="premium-stat-label">컨스트럭터 챔피언</div>
            <div class="premium-stat-value premium-stat-highlight">${team.championships}</div>
        </div>
        <div class="premium-stat-card">
            <div class="premium-stat-label">GP 우승</div>
            <div class="premium-stat-value">${team.wins}</div>
        </div>
        <div class="premium-stat-card">
            <div class="premium-stat-label">현재 시즌 포인트</div>
            <div class="premium-stat-value">${team.points}</div>
        </div>
        <div class="premium-stat-card">
            <div class="premium-stat-label">설립 연도</div>
            <div class="premium-stat-value">${team.founded}년</div>
        </div>
    </div>

    <!-- 세부 운영진 및 스펙 정보 -->
    <h3 class="detail-section-title"><span class="badge-indicator"></span> 팀 프로필 및 사양</h3>
    <div class="stats-sub-grid">
        <div class="premium-stat-card">
            <div class="premium-stat-label">팀 프린시펄</div>
            <div class="premium-stat-value" style="font-size: 0.95rem; line-height: 1.4; padding-top: 0.25rem;">${team.teamPrincipal}</div>
        </div>
        <div class="premium-stat-card">
            <div class="premium-stat-label">공급 엔진 파워유닛</div>
            <div class="premium-stat-value" style="font-size: 0.95rem; line-height: 1.4; padding-top: 0.25rem;">${team.engine}</div>
        </div>
        <div class="premium-stat-card">
            <div class="premium-stat-label">본거지 연고지</div>
            <div class="premium-stat-value" style="font-size: 0.95rem; line-height: 1.4; padding-top: 0.25rem;">${team.base}</div>
        </div>
    </div>

    <!-- 드라이버 라인업 -->
    <h3 class="detail-section-title"><span class="badge-indicator"></span> 소속 드라이버 라인업</h3>
    <div class="timeline-grid">
        ${team.drivers.map(driverId => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `
            <div class="timeline-item" style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                <img src="${driver.image}" alt="${driver.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center top;" />
              </div>
              <div style="flex-grow: 1;">
                <div style="font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem; color: #fff;">
                  <span>${driver.flag}</span>
                  <span>${driver.name}</span>
                </div>
                <div style="font-size: 0.7rem; color: ${team.color}; font-family: Orbitron; font-weight: 700; margin-top: 0.15rem;">#${driver.number}</div>
              </div>
            </div>
          ` : '';
  }).join('')}
    </div>

    <!-- 바이오 -->
    <div class="bio-box">
        <div style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:0.75rem; color:#fff; text-transform:uppercase; margin-bottom:0.5rem; letter-spacing:0.05em;">팀 소개 / 히스토리</div>
        <div>${team.bio}</div>
    </div>
  `;

  document.getElementById('modal-team-content').innerHTML = content;
  toggleModal('team-modal', true);
}

console.log('Teams page JS loaded');
