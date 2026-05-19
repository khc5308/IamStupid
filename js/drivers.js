// F1 HUB — Drivers Page JavaScript (Refactored)

let allDriverData = []; // 전체 드라이버 저장소
let filteredDrivers = []; // 검색용 필터 데이터

document.addEventListener('DOMContentLoaded', async function() {
    // 1. 초기 데이터 로드 (비동기)
    const data = await updateDriverLayout();
    
    if (data) {
        // 2. 검색을 위해 전체 데이터 합치기 (필요 시)
        allDriverData = [...data.activeDrivers, ...data.inactiveDrivers];
        filteredDrivers = [...allDriverData];
        
        // 3. UI 렌더링 및 이벤트 설정
        renderDriverGrid(data.activeDrivers, data.inactiveDrivers);
        setupSearch();
    }
    
    setupModalClose('driver-modal');
});

/**
 * 드라이버 그리드 렌더링 (참여/미참여 섹션 구분)
 */
function renderDriverGrid(active = [], inactive = []) {
    const grid = document.getElementById('drivers-grid');
    if (!grid) return;

    if (active.length === 0 && inactive.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><p>데이터가 없습니다.</p></div>';
        return;
    }

    // 두 그룹을 합쳐서 렌더링하거나, 중간에 구분선을 넣을 수 있습니다.
    const renderCard = (driver) => `
        <div class="card" onclick="showDriverModal('${driver.id}')">
            <div style="height: 120px; background: linear-gradient(135deg, ${driver.teamColor || '#333'}20 0%, ${driver.teamColor || '#333'}10 100%); display: flex; align-items: center; justify-content: center; margin: -1.25rem -1.25rem 1rem; font-size: 3rem;">
                ${driver.flag || '🏁'}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">${driver.name}</h3>
                    <p style="font-size: 0.875rem; margin: 0; color: #707080;">${driver.team}</p>
                </div>
                <span style="font-family: Orbitron; font-weight: 900; color: ${driver.teamColor}; font-size: 1.25rem;">#${driver.number}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
                    <div style="font-size: 0.75rem; color: #707080;">포인트</div>
                    <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${driver.points}</div>
                </div>
                <div style="background: rgba(255,255,255,0.02); padding: 0.5rem; border-radius: 4px;">
                    <div style="font-size: 0.75rem; color: #707080;">우승</div>
                    <div style="font-family: Orbitron; font-weight: 900; color: #fff; font-size: 0.875rem;">${driver.wins}</div>
                </div>
            </div>
            <p style="font-size: 0.875rem; margin: 0; color: #b0b0c0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${driver.bio}</p>
        </div>
    `;

    let html = '';
    if (active.length > 0) {
        html += `<h2 style="grid-column: 1/-1; font-size: 1.2rem; margin: 1rem 0;">현재 레이스 참여 드라이버</h2>`;
        html += active.map(renderCard).join('');
    }
    if (inactive.length > 0) {
        html += `<h2 style="grid-column: 1/-1; font-size: 1.2rem; margin: 2rem 0 1rem;">기타 드라이버</h2>`;
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
            // 초기 로직 재실행 (참여 여부 다시 판단)
            const active = allDriverData.filter(d => d.is_active); // 데이터 구조에 따라 조정 필요
            const inactive = allDriverData.filter(d => !d.is_active);
            renderDriverGrid(active, inactive);
        }
    });
}

// 검색용 단순 그리드 렌더링
function renderSimpleGrid(list) {
    const grid = document.getElementById('drivers-grid');
    grid.innerHTML = list.map(driver => `/* 위 renderCard와 동일한 템플릿 사용 */`).join('');
    // (중복 방지를 위해 renderCard 함수를 외부로 빼서 쓰시면 좋습니다.)
}

// 상세 모달 표시
function showDriverModal(driverId) {
    const driver = allDriverData.find(d => d.id === driverId);
    if (!driver) return;

    document.getElementById('modal-driver-name').textContent = driver.name;
    document.getElementById('modal-driver-team').textContent = `${driver.team} • ${driver.flag || ''} ${driver.nationality || ''}`;

    const content = `
        <div class="modal-section" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="modal-field">
                <div class="modal-field-label">번호</div>
                <div class="modal-field-value">#${driver.number}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">나이</div>
                <div class="modal-field-value">${driver.age || 'N/A'}세</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">포인트</div>
                <div class="modal-field-value">${driver.points}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">우승</div>
                <div class="modal-field-value">${driver.wins}</div>
            </div>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">시즌 스탯</h3>
            <div class="modal-section" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="modal-field">
                    <div class="modal-field-label">폴 포지션</div>
                    <div class="modal-field-value">${driver.poles || 0}</div>
                </div>
                <div class="modal-field">
                    <div class="modal-field-label">포디엄</div>
                    <div class="modal-field-value">${driver.podiums || 0}</div>
                </div>
            </div>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <h3 style="font-size: 1rem; margin: 0 0 0.5rem 0;">소개</h3>
            <p style="margin: 0; color: #b0b0c0; font-size: 0.875rem; line-height: 1.6;">${driver.bio}</p>
        </div>
    `;

    document.getElementById('modal-driver-content').innerHTML = content;
    if (typeof toggleModal === 'function') toggleModal('driver-modal', true);
}

/**
 * 데이터 업데이트 로직
 */
async function updateDriverLayout() {
    try {
        const eventRes = await fetch('/events/last');
        if (!eventRes.ok) throw new Error('이벤트 정보를 가져오는데 실패했습니다.');
        const eventData = await eventRes.json();
        
        const year = new Date(eventData.event_date).getFullYear();
        const eventName = eventData.event_name;

        const participantsRes = await fetch(`/drivers/${year}/${encodeURIComponent(eventName)}`);
        const { drivers: participatingNames } = await participantsRes.json();

        // /drivers/info/all API를 통해 전체 드라이버 정보를 한 번에 가져옵니다.
        const allInfoRes = await fetch('/drivers/info/all');
        if (!allInfoRes.ok) throw new Error('전체 드라이버 정보를 가져오는데 실패했습니다.');
        const driverInfoMap = await allInfoRes.json();
        
        const activeDrivers = [];
        const inactiveDrivers = [];

        // 반환된 Dictionary 데이터를 순회하며 UI용 데이터 객체로 매핑합니다.
        Object.keys(driverInfoMap).forEach(key => {
            const rawInfo = driverInfoMap[key];
            const driverName = `${rawInfo.givenName || ''} ${rawInfo.familyName || ''}`.trim();
            
            // 생년월일을 통한 나이 계산
            let age = 'N/A';
            if (rawInfo.dateOfBirth) {
                const birthYear = new Date(rawInfo.dateOfBirth).getFullYear();
                age = new Date().getFullYear() - birthYear;
            }
            
            // UI에 맞춘 드라이버 객체 생성
            const info = {
                id: rawInfo.driverId,
                name: driverName,
                number: rawInfo.number || 'N/A',
                code: rawInfo.code || 'N/A',
                nationality: rawInfo.nationality || '',
                age: age,
                team: 'Unknown Team', // Ergast 기본 데이터에는 팀이 포함되어 있지 않습니다.
                points: '-',
                wins: '-',
                bio: `국적: ${rawInfo.nationality || 'N/A'} | 출생: ${rawInfo.dateOfBirth || 'N/A'}`
            };

            // 참여 명단(participatingNames)은 대소문자가 다를 수 있으므로 소문자 변환 후 비교
            const isParticipating = participatingNames.some(
                pName => pName.toLowerCase() === driverName.toLowerCase()
            );

            if (isParticipating) {
                info.is_active = true;
                activeDrivers.push(info);
            } else {
                info.is_active = false;
                inactiveDrivers.push(info);
            }
        });

        return { activeDrivers, inactiveDrivers };
    } catch (error) {
        console.error("데이터 업데이트 중 오류 발생:", error);
        return null;
    }
}