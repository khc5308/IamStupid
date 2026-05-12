# F1 HUB — Pure HTML/CSS/JavaScript Version

Formula 1 정보 서비스 웹사이트의 순수 HTML/CSS/JavaScript 버전입니다.

## 프로젝트 구조

```
f1-hub-static/
├── index.html              # 랜딩 페이지
├── dashboard.html          # 대시보드 (드라이버/팀 스탠딩, 이벤트)
├── tracks.html             # 트랙 정보 (24개 서킷)
├── drivers.html            # 드라이버 프로필 (20명)
├── teams.html              # 팀 정보 (10개 팀)
├── machines.html           # 레이싱 머신 스펙
├── events.html             # 이벤트 & 페널티 타임라인
├── faq.html                # F1 규정 FAQ
├── css/
│   ├── style.css           # 글로벌 스타일
│   ├── landing.css         # 랜딩 페이지 스타일
│   ├── dashboard.css       # 대시보드 스타일
│   ├── list-page.css       # 리스트 페이지 공통 스타일
│   ├── events.css          # 이벤트 페이지 스타일
│   └── faq.css             # FAQ 페이지 스타일
├── js/
│   ├── common.js           # 공통 기능 (네비게이션, 유틸리티)
│   ├── landing.js          # 랜딩 페이지 스크립트
│   ├── dashboard.js        # 대시보드 스크립트
│   ├── tracks.js           # 트랙 페이지 스크립트
│   ├── drivers.js          # 드라이버 페이지 스크립트
│   ├── teams.js            # 팀 페이지 스크립트
│   ├── machines.js         # 머신 페이지 스크립트
│   ├── events.js           # 이벤트 페이지 스크립트
│   └── faq.js              # FAQ 페이지 스크립트
└── data/
    ├── f1-data.js          # F1 데이터 (드라이버, 팀, 트랙, 머신, 이벤트)
    └── f1-faq.js           # FAQ 데이터
```

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS4**: Tailwind 스타일 + 커스텀 CSS
- **JavaScript (Vanilla)**: 순수 JavaScript (프레임워크 없음)
- **Google Fonts**: Orbitron, Exo 2, Barlow Condensed

## 디자인

- **테마**: Editorial Racing Magazine
- **색상**: 다크 테마 (딥 블랙 배경, F1 레드 포인트, 챔피언십 골드)
- **폰트**: Orbitron (헤딩) + Exo 2 (본문)
- **레이아웃**: 반응형 (모바일 우선)

## 기능

### 페이지별 기능

1. **랜딩 페이지** (`index.html`)
   - 풀스크린 히어로 섹션
   - 기능 소개 카드
   - 스탯 섹션
   - CTA 버튼

2. **대시보드** (`dashboard.html`)
   - 드라이버 챔피언십 스탠딩 (Top 10)
   - 컨스트럭터 챔피언십 스탠딩 (Top 6)
   - 최근 이벤트 피드
   - 시즌 통계

3. **트랙** (`tracks.html`)
   - 24개 서킷 카드 뷰
   - 타입 필터 (퍼머넌트/스트리트)
   - 모달 상세 정보 (길이, 랩 수, 랩 레코드)

4. **드라이버** (`drivers.html`)
   - 20명 드라이버 카드 뷰
   - 검색 기능
   - 모달 상세 정보 (번호, 나이, 포인트, 스탯)

5. **팀** (`teams.html`)
   - 10개 팀 카드 뷰
   - 팀 컬러 강조
   - 모달 상세 정보 (팀 프린시펄, 엔진, 드라이버 라인업)

6. **머신** (`machines.html`)
   - 4개 팀 머신 카드 뷰
   - 모달 기술 사양 (엔진, 무게, 출력 등)

7. **이벤트** (`events.html`)
   - 이벤트 타임라인 뷰
   - 타입 필터 (페널티, 사건, 세이프티카, 레드 플래그)
   - 심각도 표시

8. **FAQ** (`faq.html`)
   - 20개 F1 규정 FAQ
   - 카테고리 필터 (경기, 페널티, 기술, 안전, 챔피언십)
   - 검색 기능
   - 아코디언 확장/축소

### 공통 기능

- **반응형 네비게이션**: 모바일 메뉴 토글
- **스크롤 효과**: 네비게이션 배경 변경
- **모달**: 상세 정보 표시
- **필터링**: 카테고리별 필터
- **검색**: 텍스트 검색
- **애니메이션**: 페이드인, 슬라이드 인 효과

## 설치 및 실행

### 로컬 개발 서버

```bash
# Python 3 내장 서버 (권장)
cd f1-hub-static
python3 -m http.server 8000

# 또는 Node.js http-server
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

### 정적 호스팅

모든 파일이 순수 정적 파일이므로 다음 서비스에 배포 가능:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Manus 호스팅

## 데이터 구조

### drivers (드라이버)
```javascript
{
  id, name, flag, number, team, nationality, points, wins, poles, podiums, 
  age, shortName, teamColor, bio
}
```

### teams (팀)
```javascript
{
  id, name, shortName, color, points, wins, championships, drivers, 
  base, teamPrincipal, founded, engine, bio
}
```

### tracks (트랙)
```javascript
{
  id, round, name, country, city, flag, date, type, length, laps, turns, 
  drsZones, firstGP, lapRecord, lapRecordHolder, lapRecordYear, description
}
```

### machines (머신)
```javascript
{
  id, name, year, teamId, powerUnit, weight, description, specs
}
```

### raceEvents (이벤트)
```javascript
{
  id, round, race, type, severity, driver, team, lap, date, description, outcome
}
```

### faqs (FAQ)
```javascript
{
  id, category, question, answer
}
```

## 커스터마이징

### 색상 변경
`css/style.css`의 `:root` 섹션에서 CSS 변수 수정:
```css
--accent-red: #e10600;
--accent-gold: #d4af37;
```

### 폰트 변경
`index.html`의 Google Fonts 링크 수정

### 데이터 업데이트
`data/f1-data.js` 및 `data/f1-faq.js` 파일 수정

## 브라우저 지원

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 성능

- **전체 크기**: ~168KB
- **코드 라인**: ~3,185줄
- **로드 시간**: < 1초 (일반적인 연결)
- **LCP**: < 2초
- **CLS**: < 0.1

## 라이선스

MIT License

## 지원

문제 발생 시 GitHub Issues에 보고해주세요.
