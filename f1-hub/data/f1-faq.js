// F1 HUB — FAQ Data

const faqCategories = {
  'racing': { label: '경기 규정', color: '#e10600' },
  'penalty': { label: '페널티', color: '#ff8700' },
  'technical': { label: '기술 규정', color: '#3498db' },
  'safety': { label: '안전 규정', color: '#d4af37' },
  'championship': { label: '챔피언십', color: '#9b59b6' }
};

const faqs = [
  {
    id: 'faq-001',
    category: 'racing',
    question: 'F1 경기는 몇 랩을 달리나요?',
    answer: 'F1 경기는 정해진 거리(약 305km)를 달리거나 2시간이 경과할 때까지 진행됩니다. 각 서킷마다 다른 수의 랩이 필요합니다. 예를 들어 모나코는 78랩, 모나코는 78랩입니다.'
  },
  {
    id: 'faq-002',
    category: 'racing',
    question: '그리드란 무엇인가요?',
    answer: '그리드는 경기 시작 전 드라이버들이 서 있는 위치를 말합니다. 그리드 포지션은 예선(Qualifying)의 결과에 따라 결정됩니다. 가장 빠른 드라이버가 1번 그리드(폴 포지션)에 서게 됩니다.'
  },
  {
    id: 'faq-003',
    category: 'racing',
    question: 'DRS(Drag Reduction System)란?',
    answer: 'DRS는 직선 구간에서 리어윙의 플랩을 열어 공기 저항을 줄이는 시스템입니다. 앞 차와 1초 이내의 거리에 있을 때만 사용할 수 있으며, 추월을 용이하게 합니다.'
  },
  {
    id: 'faq-004',
    category: 'penalty',
    question: '드라이브 스루 페널티란?',
    answer: '드라이브 스루 페널티는 피트 레인을 통과해야 하는 페널티입니다. 드라이버는 피트 레인 속도 제한을 지켜 통과해야 하며, 약 20초의 시간 손실이 발생합니다.'
  },
  {
    id: 'faq-005',
    category: 'penalty',
    question: '5초 타임 페널티는 어떻게 작동하나요?',
    answer: '5초 타임 페널티는 경기 후 최종 결과에 5초가 추가됩니다. 드라이버는 경기 중 특별한 조치를 취할 필요가 없으며, 결과 집계 시 자동으로 적용됩니다.'
  },
  {
    id: 'faq-006',
    category: 'penalty',
    question: '그리드 페널티란?',
    answer: '그리드 페널티는 다음 경기의 그리드 포지션을 뒤로 옮기는 페널티입니다. 예를 들어 5그리드 페널티를 받으면 예선 결과보다 5칸 뒤에서 출발하게 됩니다.'
  },
  {
    id: 'faq-007',
    category: 'technical',
    question: 'F1 머신의 최소 무게는?',
    answer: 'F1 머신의 최소 무게는 798kg입니다. 이는 드라이버와 연료를 제외한 차량 자체의 무게입니다. 드라이버를 포함하면 약 798kg 이상이 됩니다.'
  },
  {
    id: 'faq-008',
    category: 'technical',
    question: 'F1 엔진의 출력은?',
    answer: 'F1 엔진은 약 1000마력(HP)의 출력을 냅니다. 이는 1.6L 터보차저 V6 엔진과 하이브리드 시스템(ERS)의 조합으로 달성됩니다.'
  },
  {
    id: 'faq-009',
    category: 'technical',
    question: 'F1 타이어는 몇 종류인가요?',
    answer: 'F1 타이어는 3가지 종류가 있습니다: 하드(흰색), 미디엄(노란색), 소프트(빨간색). 각 타이어는 다른 그립과 내구성을 가지고 있으며, 경기 중 최소 2가지 종류를 사용해야 합니다.'
  },
  {
    id: 'faq-010',
    category: 'safety',
    question: '세이프티카란?',
    answer: '세이프티카는 경기 중 위험한 상황(사고, 악천후 등)이 발생했을 때 배치되는 안전 자동차입니다. 모든 드라이버는 세이프티카 뒤를 따라 감속 주행하게 됩니다.'
  },
  {
    id: 'faq-011',
    category: 'safety',
    question: '레드 플래그란?',
    answer: '레드 플래그는 경기를 중단하는 신호입니다. 심각한 사고나 악천후로 경기를 계속할 수 없을 때 발생합니다. 레드 플래그 후 경기는 재시작되거나 중단될 수 있습니다.'
  },
  {
    id: 'faq-012',
    category: 'safety',
    question: 'VSC(Virtual Safety Car)란?',
    answer: 'VSC는 가상 세이프티카로, 실제 세이프티카 없이 드라이버들의 속도를 제한하는 시스템입니다. 경미한 사고나 장애물 제거 시 사용되며, 세이프티카보다 경기 진행이 빠릅니다.'
  },
  {
    id: 'faq-013',
    category: 'championship',
    question: 'F1 드라이버 챔피언십 포인트는?',
    answer: '2025년 F1 포인트 시스템: 1위 25점, 2위 18점, 3위 15점, 4위 12점, 5위 10점, 6위 8점, 7위 6점, 8위 4점, 9위 2점, 10위 1점입니다.'
  },
  {
    id: 'faq-014',
    category: 'championship',
    question: '컨스트럭터 챔피언십이란?',
    answer: '컨스트럭터 챔피언십은 팀 간의 경쟁입니다. 각 팀의 두 드라이버가 얻은 포인트를 합산하여 팀 순위를 결정합니다. 우승 팀에게는 큰 상금이 주어집니다.'
  },
  {
    id: 'faq-015',
    category: 'racing',
    question: '예선(Qualifying)은 어떻게 진행되나요?',
    answer: '예선은 3단계로 나뉩니다: Q1(18분), Q2(15분), Q3(12분). 각 단계에서 가장 느린 드라이버들이 탈락합니다. Q3에 진출한 10명이 그리드 포지션을 결정합니다.'
  },
  {
    id: 'faq-016',
    category: 'racing',
    question: '피트스톱이란?',
    answer: '피트스톱은 경기 중 타이어 교체, 연료 보급, 차량 조정을 위해 피트 레인에 들어가는 것입니다. 최신 F1에서 피트스톱은 약 2-3초 정도 소요됩니다.'
  },
  {
    id: 'faq-017',
    category: 'technical',
    question: 'ERS(Energy Recovery System)란?',
    answer: 'ERS는 에너지 회수 시스템으로, 제동과 터보차저에서 발생하는 에너지를 회수하여 저장합니다. 드라이버는 경기 중 이 에너지를 사용하여 추가 출력을 얻을 수 있습니다.'
  },
  {
    id: 'faq-018',
    category: 'penalty',
    question: '불공정한 방어(Unsafe Defense)란?',
    answer: '불공정한 방어는 드라이버가 추월을 시도하는 상대 드라이버를 위험하게 방어하는 것입니다. 이는 페널티 대상이 될 수 있으며, 심각한 경우 드라이브 스루 페널티가 부과됩니다.'
  },
  {
    id: 'faq-019',
    category: 'racing',
    question: '트랙 리밋(Track Limit)이란?',
    answer: '트랙 리밋은 경주로의 경계입니다. 드라이버가 의도적으로 또는 반복적으로 트랙 리밋을 벗어나면 페널티를 받을 수 있습니다. 일반적으로 흰 선이 트랙 리밋을 나타냅니다.'
  },
  {
    id: 'faq-020',
    category: 'safety',
    question: 'F1 헬멧의 안전 기준은?',
    answer: 'F1 헬멧은 매우 엄격한 안전 기준을 만족해야 합니다. 최신 헬멧은 극도의 충격을 견딜 수 있으며, 드라이버의 생명 보호를 위해 지속적으로 개선되고 있습니다.'
  }
];
