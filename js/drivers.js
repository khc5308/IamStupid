// F1 HUB — Drivers Page JavaScript (Refactored & Enhanced UI)

let allDriverData = []; // 전체 드라이버 저장소
let filteredDrivers = []; // 검색용 필터 데이터

let NATIONALITY_FLAGS = {};
let ACTIVE_2026_DRIVERS = {};
let DRIVER_IMAGES = {};

// 팀별 테마 컬러 매핑
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
    if (lower.includes('audi')) return '#d50000'; // Audi F1 Red/Black
    if (lower.includes('cadillac')) return '#c89d3c'; // Cadillac Gold
    return '#707080';
}



document.addEventListener('DOMContentLoaded', async function () {
    // 1. 초기 데이터 로드 (비동기)
    const data = await updateDriverLayout();

    if (data) {
        // 2. 검색을 위해 전체 데이터 합치기
        allDriverData = [...data.activeDrivers, ...data.inactiveDrivers];
        filteredDrivers = [...allDriverData];

        // 3. UI 렌더링 및 이벤트 설정
        renderDriverGrid(data.activeDrivers, data.inactiveDrivers);
        setupSearch();
    }

    setupModalClose('driver-modal');
});

/**
 * 개별 드라이버 카드 템플릿 생성 (국기 이모지 대신 얼굴 이미지로 변경)
 */
function renderCard(driver) {
    const teamColor = driver.teamColor || '#707080';
    const isSeatActive = driver.is_active;

    // 얼굴 이미지 선택 (없을 경우 fallback 기본 이미지 사용)
    const fallbackImage = 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp';
    const imageUrl = driver.image || fallbackImage;

    const logoUrl = getTeamLogoUrl(driver.team);
    const logoImg = logoUrl ? `<img src="${logoUrl}" alt="${driver.team}" style="height: 14px; max-width: 30px; object-fit: contain; vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));" />` : '🏎️ ';

    return `
        <div class="card" onclick="showDriverModal('${driver.id}')" style="border-top: 4px solid ${teamColor}; relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
                <div style="height: 200px; background: linear-gradient(135deg, ${teamColor}15 0%, ${teamColor}05 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.03); position: relative; overflow: hidden;">
                    <img src="${imageUrl}" alt="${driver.name}" style="height: 100%; width: 100%; object-fit: cover; object-position: center top; transition: transform 0.3s ease;" class="driver-card-img" />
                </div>
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.1rem; margin: 0 0 0.25rem 0; font-family: 'Exo 2', sans-serif; font-weight: 700; color: #fff;">${driver.name}</h3>
                        <p style="font-size: 0.825rem; margin: 0; color: ${isSeatActive ? '#a0a0b0' : '#6c6c7d'}; font-weight: 500; display: flex; align-items: center;">
                            ${isSeatActive ? logoImg + driver.team : '❌ ' + driver.team}
                        </p>
                    </div>
                    <span style="font-family: Orbitron; font-weight: 900; color: ${teamColor}; font-size: 1.35rem; text-shadow: 0 0 10px ${teamColor}20;">
                        ${driver.number !== 'N/A' ? '#' + driver.number : ''}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                    <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); text-align: center;">
                        <div style="font-size: 0.7rem; color: #707080; font-family: 'Exo 2'; text-transform: uppercase;">코드</div>
                        <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.95rem;">${driver.code !== 'N/A' ? driver.code : '-'}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); text-align: center;">
                        <div style="font-size: 0.7rem; color: #707080; font-family: 'Exo 2'; text-transform: uppercase;">나이</div>
                        <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.95rem;">${driver.age !== 'N/A' ? driver.age + '세' : '-'}</div>
                    </div>
                </div>
            </div>
            <p style="font-size: 0.8rem; margin: 0; color: #8e8e9e; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; margin-top: auto;">${driver.bio}</p>
        </div>
    `;
}

/**
 * 드라이버 그리드 렌더링 (참여/미참여 섹션 구분 및 구분선 추가)
 */
function renderDriverGrid(active = [], inactive = []) {
    const grid = document.getElementById('drivers-grid');
    if (!grid) return;

    if (active.length === 0 && inactive.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><p>데이터가 없습니다.</p></div>';
        return;
    }

    let html = '';
    if (active.length > 0) {
        // "현재 시트 보유 드라이버" 글자 삭제
        html += active.map(renderCard).join('');
    }

    if (active.length > 0 && inactive.length > 0) {
        // 두 그룹 사이의 프리미엄 디자인 구분선
        html += `
            <div style="grid-column: 1 / -1; display: flex; align-items: center; margin: 3.5rem 0 2rem 0;">
                <div style="flex-grow: 1; height: 1px; background: linear-gradient(90deg, rgba(225,6,0,0.6) 0%, rgba(255,255,255,0.03) 100%);"></div>
                <span style="padding: 0 1.5rem; font-family: 'Exo 2', sans-serif; font-size: 0.8rem; color: #e10600; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem;">
                    🏁 시트 미보유 / 과거 드라이버 (${inactive.length}명)
                </span>
                <div style="flex-grow: 1; height: 1px; background: linear-gradient(270deg, rgba(225,6,0,0.6) 0%, rgba(255,255,255,0.03) 100%);"></div>
            </div>
        `;
    }

    if (inactive.length > 0) {
        if (active.length === 0) {
            html += `<h2 style="grid-column: 1/-1; font-size: 1.3rem; margin: 1rem 0; font-family: 'Exo 2', sans-serif; font-weight: 700; color: #8c8c9e; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="display:inline-block; width:8px; height:8px; background:#707080; border-radius:50%;"></span>
                        시트 미보유 / 과거 드라이버 (${inactive.length}명)
                     </h2>`;
        }
        html += inactive.map(renderCard).join('');
    }

    grid.innerHTML = html;
}

// 검색 설정
function setupSearch() {
    const searchInput = document.getElementById('driver-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        // 검색 시에는 구분을 없애고 통합 리스트에서 필터링
        const filtered = allDriverData.filter(d =>
            d.name.toLowerCase().includes(term) ||
            d.team.toLowerCase().includes(term) ||
            (d.nationality && d.nationality.toLowerCase().includes(term))
        );

        // 검색어가 있으면 통합 그리드로, 없으면 다시 섹션 구분 렌더링
        if (term.length > 0) {
            renderSimpleGrid(filtered);
        } else {
            const active = allDriverData.filter(d => d.is_active);
            const inactive = allDriverData.filter(d => !d.is_active);
            renderDriverGrid(active, inactive);
        }
    });
}

// 검색용 단순 그리드 렌더링 (검색 결과에서도 시트 보유 여부 분리 정렬 및 구분선 표시)
function renderSimpleGrid(list) {
    const grid = document.getElementById('drivers-grid');
    if (list.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-state-icon">🔍</div><p>검색 결과가 없습니다.</p></div>';
        return;
    }

    const active = list.filter(d => d.is_active);
    const inactive = list.filter(d => !d.is_active);

    let html = '';
    if (active.length > 0) {
        // "검색된 시트 보유 드라이버" 글자 삭제
        html += active.map(renderCard).join('');
    }

    if (active.length > 0 && inactive.length > 0) {
        // 검색 결과용 구분선
        html += `
            <div style="grid-column: 1 / -1; display: flex; align-items: center; margin: 3.5rem 0 2rem 0;">
                <div style="flex-grow: 1; height: 1px; background: linear-gradient(90deg, rgba(225,6,0,0.6) 0%, rgba(255,255,255,0.03) 100%);"></div>
                <span style="padding: 0 1.5rem; font-family: 'Exo 2', sans-serif; font-size: 0.8rem; color: #e10600; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem;">
                    🏁 검색된 시트 미보유 / 과거 드라이버 (${inactive.length}명)
                </span>
                <div style="flex-grow: 1; height: 1px; background: linear-gradient(270deg, rgba(225,6,0,0.6) 0%, rgba(255,255,255,0.03) 100%);"></div>
            </div>
        `;
    }

    if (inactive.length > 0) {
        if (active.length === 0) {
            html += `<h2 style="grid-column: 1/-1; font-size: 1.3rem; margin: 1rem 0; font-family: 'Exo 2', sans-serif; font-weight: 700; color: #8c8c9e; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="display:inline-block; width:8px; height:8px; background:#707080; border-radius:50%;"></span>
                        검색된 시트 미보유 / 과거 드라이버 (${inactive.length}명)
                     </h2>`;
        }
        html += inactive.map(renderCard).join('');
    }

    grid.innerHTML = html;
}

// 상세 모달 표시
async function showDriverModal(driverId) {
    const driver = allDriverData.find(d => d.id === driverId);
    if (!driver) return;

    const teamColor = driver.teamColor || '#707080';

    // 모달 헤더 커스텀 스타일 업데이트
    const nameEl = document.getElementById('modal-driver-name');
    const teamEl = document.getElementById('modal-driver-team');

    nameEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span>${driver.name}</span>
            <span style="font-family: Orbitron; font-size: 1.1rem; color: ${teamColor}; background: rgba(255,255,255,0.03); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); font-weight: 900;">
                ${driver.number !== 'N/A' ? '#' + driver.number : 'N/A'}
            </span>
        </div>
    `;

    teamEl.innerHTML = `
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem;">
            <span style="font-weight: 600; color: #fff;">${driver.team}</span>
            <span style="color: #8c8c9e;">• ${driver.nationality || 'N/A'}</span>
        </div>
    `;

    // 로딩 화면 표시
    document.getElementById('modal-driver-content').innerHTML = `
        <div style="text-align: center; padding: 3rem 2rem;">
            <div class="loading-spinner" style="border: 3px solid rgba(255,255,255,0.05); border-top-color: ${teamColor}; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
            <p style="color: #8c8c9e; font-size: 0.9rem; font-family: 'Exo 2', sans-serif;">상세 기록 및 통계를 불러오는 중...</p>
        </div>
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    `;

    if (typeof toggleModal === 'function') toggleModal('driver-modal', true);

    try {
        const res = await fetch(`/driver-stats/${driverId}`);
        if (!res.ok) throw new Error('API 오류');
        const s = await res.json();

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
                    border-color: ${teamColor}50;
                    transform: translateY(-2px);
                    background: linear-gradient(135deg, ${teamColor}10 0%, rgba(255,255,255,0.01) 100%);
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
                    color: ${teamColor};
                    text-shadow: 0 0 10px ${teamColor}40;
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
                    background: ${teamColor};
                    box-shadow: 0 0 8px ${teamColor};
                }
                @media (max-width: 576px) {
                    .premium-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .stats-sub-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .timeline-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>

            <!-- 기본 신상정보 카드 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                <div class="timeline-item">
                    <div class="timeline-label">약어 / 코드</div>
                    <div class="timeline-value" style="font-family: Orbitron; font-size:1.05rem; color:${teamColor};">${driver.code !== 'N/A' ? driver.code : '-'}</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">나이</div>
                    <div class="timeline-value" style="font-family: Orbitron; font-size:1.05rem;">${driver.age !== 'N/A' ? driver.age + '세' : '-'}</div>
                </div>
            </div>

            <!-- 핵심 통계 히어로 영역 -->
            <h3 class="detail-section-title"><span class="badge-indicator"></span> 주요 커리어 히어로</h3>
            <div class="premium-grid">
                <div class="premium-stat-card">
                    <div class="premium-stat-label">월드 챔피언</div>
                    <div class="premium-stat-value premium-stat-highlight">${s.championships !== 'N/A' ? s.championships : 0}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">그랑프리 우승</div>
                    <div class="premium-stat-value">${s.wins}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">포디움</div>
                    <div class="premium-stat-value">${s.podiums}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">참가 레이스 수</div>
                    <div class="premium-stat-value">${s.entries}</div>
                </div>
            </div>

            <!-- 세부 통계 목록 -->
            <h3 class="detail-section-title"><span class="badge-indicator"></span> 세부 기록 및 지표</h3>
            <div class="stats-sub-grid">
                <div class="premium-stat-card">
                    <div class="premium-stat-label">폴 포지션</div>
                    <div class="premium-stat-value">${s.poles}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">패스티스트 랩</div>
                    <div class="premium-stat-value">${s.fastest_laps}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">커리어 포인트</div>
                    <div class="premium-stat-value" style="font-size:1.1rem;">${s.points}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">폴 투 윈</div>
                    <div class="premium-stat-value">${s.pole_to_win}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">해트트릭</div>
                    <div class="premium-stat-value">${s.hat_tricks}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">그랜드슬램</div>
                    <div class="premium-stat-value">${s.grand_slams !== 'N/A' ? s.grand_slams : 0}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">스프린트 우승</div>
                    <div class="premium-stat-value">${s.sprint_wins}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">스프린트 폴</div>
                    <div class="premium-stat-value">${s.sprint_poles}</div>
                </div>
                <div class="premium-stat-card">
                    <div class="premium-stat-label">최고 챔피언십 순위</div>
                    <div class="premium-stat-value" style="font-size:1.1rem; color:${teamColor};">${s.highest_champ !== 'N/A' ? s.highest_champ + '위' : 'N/A'}</div>
                </div>
            </div>

            <!-- 타임라인 기록 -->
            <h3 class="detail-section-title"><span class="badge-indicator"></span> 주요 역사적 기록</h3>
            <div class="timeline-grid">
                <div class="timeline-item">
                    <div class="timeline-label">첫 레이스 참가</div>
                    <div class="timeline-value">${s.first_race}</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">최고 레이스 결과</div>
                    <div class="timeline-value">${s.highest_finish !== 'N/A' ? s.highest_finish + '위' : 'N/A'} (그리드 최고: ${s.highest_grid !== 'N/A' ? s.highest_grid + '위' : 'N/A'})</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">첫 우승</div>
                    <div class="timeline-value">${s.first_win}</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">최근 우승</div>
                    <div class="timeline-value">${s.latest_win}</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">첫 포디움</div>
                    <div class="timeline-value">${s.first_podium}</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">최근 포디움</div>
                    <div class="timeline-value">${s.latest_podium}</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">첫 폴 포지션</div>
                    <div class="timeline-value">${s.first_pole}</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-label">최근 폴 포지션</div>
                    <div class="timeline-value">${s.latest_pole}</div>
                </div>
            </div>

            <!-- 바이오 -->
            <div class="bio-box">
                <div style="font-family: 'Exo 2', sans-serif; font-weight:700; font-size:0.75rem; color:#fff; text-transform:uppercase; margin-bottom:0.5rem; letter-spacing:0.05em;">드라이버 소개</div>
                <div>${driver.bio}</div>
            </div>
        `;

        document.getElementById('modal-driver-content').innerHTML = content;
    } catch (e) {
        console.error(e);
        document.getElementById('modal-driver-content').innerHTML = '<p style="text-align: center; color: #E10600; padding: 2rem; font-family:\'Exo 2\'">드라이버 상세 기록을 불러오는데 실패했습니다.</p>';
    }
}

/**
 * 데이터 업데이트 로직
 */
async function updateDriverLayout() {
    try {
        const [flagsRes, activeRes] = await Promise.all([
            fetch('/data/nationality_flags.json'),
            fetch('/data/active_2026_drivers.json')
        ]);
        NATIONALITY_FLAGS = await flagsRes.json();
        ACTIVE_2026_DRIVERS = await activeRes.json();
        DRIVER_IMAGES = {};

        const eventRes = await fetch('/events/last');
        if (!eventRes.ok) throw new Error('이벤트 정보를 가져오는데 실패했습니다.');
        const eventData = await eventRes.json();

        const year = new Date(eventData.event_date).getFullYear();
        const eventName = eventData.event_name;

        // 드라이버 페이지의 헤더 연도를 동적으로 업데이트
        const sectionTag = document.querySelector('.section-tag');
        if (sectionTag) {
            sectionTag.textContent = `👤 ${year} 시즌`;
        }
        const pageHeaderP = document.querySelector('.page-header p');
        if (pageHeaderP) {
            pageHeaderP.textContent = `${year} Formula 1 시즌의 드라이버. 각 드라이버의 프로필, 스탯, 팀 정보를 확인하세요.`;
        }

        // /drivers/info/all API를 통해 전체 드라이버 정보를 한 번에 가져옵니다.
        const allInfoRes = await fetch('/drivers/info/all');
        if (!allInfoRes.ok) throw new Error('전체 드라이버 정보를 가져오는데 실패했습니다.');
        const driverInfoMap = await allInfoRes.json();

        const activeDrivers = [];
        const inactiveDrivers = [];
        const foundActiveIds = new Set();

        // 반환된 Dictionary 데이터를 순회하며 UI용 데이터 객체로 매핑합니다.
        Object.keys(driverInfoMap).forEach(key => {
            const rawInfo = driverInfoMap[key];
            const driverId = rawInfo.driverId; // Ergast 드라이버 ID (e.g. hamilton, max_verstappen)
            const driverName = `${rawInfo.givenName || ''} ${rawInfo.familyName || ''}`.trim();

            // 생년월일을 통한 나이 계산 (현재 dynamic 시점 기준)
            let age = 'N/A';
            if (rawInfo.dateOfBirth) {
                const birthDate = new Date(rawInfo.dateOfBirth);
                const targetDate = new Date(); // 오늘 날짜 기준으로 동적 계산
                age = targetDate.getFullYear() - birthDate.getFullYear();
                const m = targetDate.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            const nationalityLower = (rawInfo.driverNationality || rawInfo.nationality || '').toLowerCase();
            const flag = NATIONALITY_FLAGS[nationalityLower] || '';

            // 2026 시즌 활성 시트 보유 드라이버 여부 체크
            const active2026 = ACTIVE_2026_DRIVERS[driverId];

            if (active2026) {
                const info = {
                    id: driverId,
                    name: driverName,
                    number: active2026.number,
                    code: active2026.code,
                    nationality: rawInfo.driverNationality || rawInfo.nationality || '',
                    flag: flag,
                    age: age,
                    team: active2026.team,
                    points: '-',
                    wins: '-',
                    bio: `국적: ${rawInfo.driverNationality || rawInfo.nationality || 'N/A'} | 출생: ${rawInfo.dateOfBirth || 'N/A'}`,
                    teamColor: getTeamColor(active2026.team),
                    is_active: true,
                    image: active2026.image || 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp'
                };
                activeDrivers.push(info);
                foundActiveIds.add(driverId);
            } else {
                // 시트 미보유 드라이버
                const info = {
                    id: driverId,
                    name: driverName,
                    number: rawInfo.driverNumber || rawInfo.number || 'N/A',
                    code: rawInfo.driverCode || rawInfo.code || 'N/A',
                    nationality: rawInfo.driverNationality || rawInfo.nationality || '',
                    flag: flag,
                    age: age,
                    team: '시트 미보유 (No Active Seat)',
                    points: '-',
                    wins: '-',
                    bio: `국적: ${rawInfo.driverNationality || rawInfo.nationality || 'N/A'} | 출생: ${rawInfo.dateOfBirth || 'N/A'}`,
                    teamColor: '#707080',
                    is_active: false,
                    image: 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp'
                };
                inactiveDrivers.push(info);
            }
        });

        // 2026 활성 드라이버 중 API 응답에 없는 신인 드라이버 강제 추가
        Object.keys(ACTIVE_2026_DRIVERS).forEach(driverId => {
            if (!foundActiveIds.has(driverId)) {
                const active2026 = ACTIVE_2026_DRIVERS[driverId];

                let driverName = driverId;
                let nationality = 'Unknown';
                let dob = 'Unknown';

                if (driverId === 'antonelli') { driverName = 'Kimi Antonelli'; nationality = 'Italian'; dob = '2006-08-25'; }
                else if (driverId === 'bortoleto') { driverName = 'Gabriel Bortoleto'; nationality = 'Brazilian'; dob = '2004-10-14'; }
                else if (driverId === 'hadjar') { driverName = 'Isack Hadjar'; nationality = 'French'; dob = '2004-09-28'; }
                else if (driverId === 'lindblad') { driverName = 'Arvid Lindblad'; nationality = 'British'; dob = '2007-08-08'; }
                else if (driverId === 'bearman') { driverName = 'Oliver Bearman'; nationality = 'British'; dob = '2005-05-08'; }
                else if (driverId === 'colapinto') { driverName = 'Franco Colapinto'; nationality = 'Argentine'; dob = '2003-05-27'; }
                else if (driverId === 'lawson') { driverName = 'Liam Lawson'; nationality = 'New Zealander'; dob = '2002-02-11'; }
                else if (driverId === 'bottas') { driverName = 'Valtteri Bottas'; nationality = 'Finnish'; dob = '1989-08-28'; }
                else if (driverId === 'stroll') { driverName = 'Lance Stroll'; nationality = 'Canadian'; dob = '1998-10-29'; }

                let age = 'N/A';
                if (dob !== 'Unknown') {
                    const birthDate = new Date(dob);
                    const targetDate = new Date();
                    age = targetDate.getFullYear() - birthDate.getFullYear();
                    const m = targetDate.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
                        age--;
                    }
                }
                const flag = NATIONALITY_FLAGS[nationality.toLowerCase()] || '';

                activeDrivers.push({
                    id: driverId,
                    name: driverName,
                    number: active2026.number,
                    code: active2026.code,
                    nationality: nationality,
                    flag: flag,
                    age: age,
                    team: active2026.team,
                    points: '-',
                    wins: '-',
                    bio: `국적: ${nationality} | 출생: ${dob}`,
                    teamColor: getTeamColor(active2026.team),
                    is_active: true,
                    image: active2026.image || 'https://media.formula1.com/image/upload/c_fill,w_440,h_440,g_north/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp'
                });
            }
        });

        // 이름순 정렬
        activeDrivers.sort((a, b) => a.name.localeCompare(b.name));
        inactiveDrivers.sort((a, b) => a.name.localeCompare(b.name));

        return { activeDrivers, inactiveDrivers };
    } catch (error) {
        console.error("데이터 업데이트 중 오류 발생:", error);
        return null;
    }
}