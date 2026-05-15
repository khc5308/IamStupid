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
    answer: 'F1 경기는 정해진 랩 수가 아니라 원칙적으로 305km를 넘는 가장 적은 완주 랩 수로 진행됩니다. 모나코는 예외적으로 260km를 넘는 가장 적은 랩 수로 진행됩니다. 레이스 시간 제한은 기본 2시간이며, 레드플래그 중단 시간이 있으면 최대 3시간까지 적용됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.5.2, B2.5.3.'
  },
  {
    id: 'faq-002',
    category: 'racing',
    question: 'DNF, DNS, DNQ, DSQ, NC는 각각 무슨 뜻인가요?',
    answer: 'DNF는 Did Not Finish, 즉 레이스를 완주하지 못했다는 뜻입니다. DNS는 Did Not Start, 즉 레이스를 시작하지 못했다는 뜻이고, DNQ는 Did Not Qualify, 즉 예선 통과 실패를 뜻합니다. DSQ는 Disqualified, 즉 실격입니다. NC 또는 Not Classified는 보통 우승자 랩 수의 90% 미만을 달려 공식 분류되지 않은 경우를 뜻합니다. 근거: Formula1.com Official F1 Glossary, FIA 2026 F1 Sporting Regulations, Art. B2.5.5.'
  },
  {
    id: 'faq-003',
    category: 'racing',
    question: '차가 리타이어했는데도 순위가 있는 이유는 뭔가요?',
    answer: 'F1에서는 체커기를 받지 못하고 멈췄더라도 우승자 랩 수의 90% 이상을 완료하면 공식 분류될 수 있습니다. 그래서 DNF처럼 보이는 상황이어도 최종 결과표에는 순위가 남을 수 있습니다. 반대로 90% 미만이면 Not Classified로 처리될 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.5.5.'
  },
  {
    id: 'faq-004',
    category: 'racing',
    question: '기본 그랑프리 주말은 어떤 순서로 진행되나요?',
    answer: '일반적인 F1 주말은 FP1, FP2, FP3 세 번의 연습 세션, 퀄리파잉, 레이스 순서로 진행됩니다. 스프린트 주말은 구조가 달라져 연습 세션이 줄고 Sprint Qualifying과 Sprint가 추가됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.'
  },
  {
    id: 'faq-005',
    category: 'racing',
    question: '퀄리파잉 Q1, Q2, Q3는 어떻게 진행되나요?',
    answer: '2026년 5월 15일 기준 FIA 2026 F1 Sporting Regulations Issue 06에서는 22대 참가 기준으로 Q1은 18분, Q2는 15분, Q3는 13분으로 진행됩니다. Q1 종료 후 가장 느린 6대가 탈락하고, Q2 종료 후 다시 가장 느린 6대가 탈락하며, Q3에서는 남은 10대가 상위 그리드와 폴 포지션을 결정합니다. 단, 참가 차량 수가 20대라면 Q1/Q2에서 각각 5대, 24대라면 각각 7대가 탈락합니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.4.2, B2.4.3.'
  },
  {
    id: 'faq-006',
    category: 'racing',
    question: '스프린트 퀄리파잉은 일반 퀄리파잉과 뭐가 다른가요?',
    answer: 'Sprint Qualifying은 스프린트 레이스의 출발 순서를 정하는 세션입니다. 2026년 5월 15일 기준 22대 참가 기준으로 SQ1은 12분, SQ2는 10분, SQ3는 8분으로 진행되며, SQ1과 SQ2에서 각각 가장 느린 6대가 탈락합니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.2.2.'
  },
  {
    id: 'faq-007',
    category: 'racing',
    question: '107% 룰이 뭔가요?',
    answer: 'Q1에서 가장 빠른 기록의 107%보다 느린 기록을 낸 드라이버는 원칙적으로 레이스 출전이 제한될 수 있습니다. 다만 트랙이 젖은 상태였거나, 연습 세션 기록 등으로 충분한 속도를 증명했다고 스튜어드가 판단하면 출전이 허용될 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.4.3.'
  },
  {
    id: 'faq-008',
    category: 'racing',
    question: '폴 포지션을 했는데 왜 실제 출발 위치가 달라질 수 있나요?',
    answer: '퀄리파잉 결과는 기본 그리드를 정하지만, 파워유닛·기어박스·부품 교체 페널티나 스튜어드 페널티가 적용되면 실제 출발 위치가 바뀔 수 있습니다. 그래서 퀄리파잉 1위가 항상 실제 1번 그리드에서 출발하는 것은 아닙니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.5.4, B8.'
  },
  {
    id: 'faq-009',
    category: 'racing',
    question: '그리드 페널티가 15그리드를 넘으면 어떻게 되나요?',
    answer: '레이스에 적용될 누적 미소화 그리드 페널티가 15그리드를 초과한 드라이버는 다른 분류된 드라이버들보다 뒤에서 출발합니다. 이때 같은 조건의 드라이버들끼리는 퀄리파잉 순서 등을 기준으로 상대 순서가 정해집니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.5.4.'
  },
  {
    id: 'faq-010',
    category: 'racing',
    question: 'F1 레이스 스타트는 어떻게 시작되나요?',
    answer: '포메이션 랩 후 차량들이 그리드에 정렬하면 5개의 빨간 불이 차례로 켜지고, 모든 빨간 불이 꺼지는 순간 레이스가 시작됩니다. 출발 직전 문제가 생기면 스타트가 지연되거나 추가 포메이션 랩이 진행될 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.5, B5.7, B5.8.'
  },
  {
    id: 'faq-011',
    category: 'racing',
    question: '피트레인 스타트는 언제 발생하나요?',
    answer: '차량 세팅 변경, 파크 페르메 위반, 정해진 절차 미준수, 그리드 진입 실패 등의 이유로 정상 그리드에서 출발하지 못하면 피트레인에서 출발할 수 있습니다. 이 경우 전체 차량이 피트 출구를 지난 뒤 레이스에 합류합니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.3.'
  },
  {
    id: 'faq-012',
    category: 'racing',
    question: '레드플래그가 나오면 레이스 시간은 멈추나요?',
    answer: '레드플래그로 레이스가 중단되면 레이스 절차는 멈추지만, 규정상 전체 레이스 시간 제한에는 중단 시간이 반영됩니다. 기본 레이스 제한은 2시간이고, 중단 시간이 더해져도 최대 3시간 제한이 적용됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B2.5.3, B5.14.'
  },
  {
    id: 'faq-013',
    category: 'racing',
    question: '레드플래그 후 재출발은 항상 스탠딩 스타트인가요?',
    answer: '항상 스탠딩 스타트는 아닙니다. 상황에 따라 standing start, rolling start, 세이프티카 뒤 재개 등으로 달라질 수 있으며, Race Control의 지시와 레이스 디렉터 절차에 따라 결정됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.15.'
  },
  {
    id: 'faq-014',
    category: 'racing',
    question: '세이프티카 상황에서 뒤처진 차들은 왜 앞으로 지나가게 하나요?',
    answer: 'Race Director가 안전하다고 판단하면 한 랩 뒤처진 차량들에게 세이프티카와 선두 차량들을 추월해 대열 뒤로 돌아가도록 지시할 수 있습니다. 이렇게 하면 재시작 때 선두권 사이에 랩다운 차량이 끼는 상황을 줄일 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.13.'
  },
  {
    id: 'faq-015',
    category: 'technical',
    question: 'F1 레이스 중 급유가 가능한가요?',
    answer: '아닙니다. F1은 레이스 중 차량에 연료를 추가하거나 제거할 수 없습니다. 그래서 팀은 레이스 시작 전 필요한 연료량을 계산해서 출발하며, 피트스톱에서는 타이어 교체와 일부 허용된 작업만 할 수 있습니다. 근거: FIA 2026 F1 Technical Regulations, Art. C6.4.4.'
  },
  {
    id: 'faq-016',
    category: 'technical',
    question: 'F1 타이어는 어떤 종류가 있나요?',
    answer: 'F1에서는 드라이 타이어, 인터미디어트 타이어, 웻 타이어를 사용합니다. 드라이 타이어는 한 경기에서 여러 스펙이 지정되며, 팬들에게는 보통 소프트·미디엄·하드처럼 설명됩니다. 비가 오거나 트랙이 젖으면 인터미디어트 또는 웻 타이어를 사용할 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B6.'
  },
  {
    id: 'faq-017',
    category: 'racing',
    question: '레이스에서 반드시 두 종류의 타이어를 써야 하나요?',
    answer: '네. 비가 와서 인터미디어트나 웻 타이어를 사용한 경우가 아니라면, 각 드라이버는 레이스 중 최소 두 가지 다른 드라이 타이어 스펙을 사용해야 합니다. 이 조건을 지키지 못하면 원칙적으로 실격될 수 있으며, 레이스가 중단되어 재개되지 못한 경우에는 30초가 추가될 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B6.3.6.'
  },
  {
    id: 'faq-018',
    category: 'technical',
    question: '파크 페르메가 뭔가요?',
    answer: '파크 페르메는 차량 세팅과 부품 변경을 제한하는 규정 상태입니다. 일반적으로 퀄리파잉 이후 레이스 전까지 차량을 마음대로 바꿀 수 없으며, 허용되지 않은 변경을 하면 피트레인 스타트나 페널티로 이어질 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B3.4, Appendix B2.'
  },
  {
    id: 'faq-019',
    category: 'technical',
    question: 'F1 팀은 예비차를 마음대로 쓸 수 있나요?',
    answer: '아닙니다. 한 팀은 한 대회 기간 동안 사용할 수 있는 차량과 주요 구성품 수가 제한됩니다. 과거처럼 완성된 예비차를 마음대로 준비해 바로 갈아타는 방식은 현재 F1에서 허용되지 않습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B8.1.'
  },
  {
    id: 'faq-020',
    category: 'technical',
    question: '파워유닛을 많이 바꾸면 왜 그리드 페널티를 받나요?',
    answer: '시즌 중 사용할 수 있는 파워유닛 구성품 수에는 제한이 있습니다. 허용 수량을 초과해 새 부품을 사용하면 그리드 페널티가 적용됩니다. 이는 비용을 줄이고, 팀들이 무제한으로 새 부품을 투입해 성능 이득을 얻는 것을 막기 위한 규정입니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B8.2.'
  },
  {
    id: 'faq-021',
    category: 'technical',
    question: '기어박스 부품도 교체 제한이 있나요?',
    answer: '네. 기어박스 케이스, 카세트, 드라이브라인 관련 제한 수량 부품은 시즌 중 사용 가능 수량이 정해져 있습니다. 허용량을 초과해 사용하면 그리드 페널티가 적용될 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B8.3.'
  },
  {
    id: 'faq-022',
    category: 'technical',
    question: 'F1 차량의 최소 무게는 정해져 있나요?',
    answer: '네. 2026 기술 규정에서는 세션 종류에 따라 차량 최소 질량이 정해져 있으며, 차량은 경기 중 어떤 시점에도 규정된 최소 질량보다 가벼워서는 안 됩니다. 너무 가벼운 차량은 성능 이득을 얻을 수 있기 때문에 엄격히 검사됩니다. 근거: FIA 2026 F1 Technical Regulations, Art. C4.1.'
  },
  {
    id: 'faq-023',
    category: 'technical',
    question: 'DRS는 2026년에도 그대로 쓰이나요?',
    answer: '2026 규정에서는 기존 DRS라는 표현보다 Driver Adjustable Bodywork, 즉 드라이버가 조정할 수 있는 공력 장치 개념이 핵심입니다. 사용 가능한 구역과 조건은 Sporting Regulations와 Race Control 지시에 따라 제한됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B7.1, FIA 2026 F1 Technical Regulations, Art. C3.'
  },
  {
    id: 'faq-024',
    category: 'penalty',
    question: '5초 페널티와 10초 페널티는 어떻게 적용되나요?',
    answer: '5초 또는 10초 페널티는 보통 다음 피트스톱에서 정지 시간으로 소화합니다. 해당 피트스톱에서 정해진 시간 동안 차량 작업을 시작할 수 없고, 피트스톱을 하지 않으면 레이스 종료 후 총 기록에 시간이 더해질 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B1.9.5, B1.9.6.'
  },
  {
    id: 'faq-025',
    category: 'penalty',
    question: '드라이브 스루 페널티와 10초 스톱앤고 페널티는 뭐가 다른가요?',
    answer: '드라이브 스루는 피트레인에 들어갔다가 정차 없이 통과하는 페널티입니다. 10초 스톱앤고는 피트 위치에 멈춰 최소 10초 동안 정지한 뒤 다시 출발해야 하며, 그 시간 동안 차량 작업을 할 수 없습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B1.9.5, B1.9.6.'
  },
  {
    id: 'faq-026',
    category: 'penalty',
    question: '점프 스타트는 어떤 경우에 페널티를 받나요?',
    answer: '출발 신호 전에 차량이 움직이거나, 정해진 그리드 박스 위치를 벗어난 상태에서 출발하면 false start로 판정될 수 있습니다. 이 경우 시간 페널티나 더 강한 페널티가 적용될 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.11.'
  },
  {
    id: 'faq-027',
    category: 'penalty',
    question: '트랙 리밋은 정확히 무엇인가요?',
    answer: '드라이버는 트랙을 사용해야 하며, 흰색 라인은 트랙에 포함되지만 커브는 트랙으로 보지 않습니다. 차량이 트랙 밖으로 나가 이득을 얻거나 반복적으로 한계를 넘으면 랩타임 삭제, 경고, 시간 페널티가 나올 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B1.8.'
  },
  {
    id: 'faq-028',
    category: 'penalty',
    question: '트랙 밖으로 나갔다가 다시 들어오면 무조건 페널티인가요?',
    answer: '항상 페널티는 아닙니다. 하지만 안전하게 복귀해야 하고, 트랙을 벗어나 지속적인 이득을 얻어서는 안 됩니다. 이득을 얻었다고 판단되면 포지션을 돌려주거나 페널티를 받을 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B1.8.'
  },
  {
    id: 'faq-029',
    category: 'penalty',
    question: '노란 깃발 구간에서 랩타임이 삭제되는 이유는 뭔가요?',
    answer: '노란 깃발은 위험 상황을 의미하므로 드라이버는 감속하고 추월하지 않아야 합니다. 특히 더블 옐로우에서는 크게 감속하고 방향 전환이나 정지를 준비해야 하며, 연습·퀄리파잉 중에는 의미 있는 빠른 랩을 시도하지 않았다는 점이 명확해야 합니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.5.'
  },
  {
    id: 'faq-030',
    category: 'penalty',
    question: '블랙 앤 화이트 플래그는 페널티인가요?',
    answer: '블랙 앤 화이트 플래그는 즉시 시간 페널티라기보다 경고에 가깝습니다. 비신사적 행동이나 반복될 경우 페널티가 될 수 있는 행동에 대해 해당 드라이버에게 한 번 표시됩니다. 이후 같은 행동이 반복되면 스튜어드 조사와 페널티로 이어질 수 있습니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.4.'
  },
  {
    id: 'faq-031',
    category: 'penalty',
    question: '블랙 플래그는 무슨 뜻인가요?',
    answer: '블랙 플래그는 해당 드라이버가 세션에서 제외되었음을 뜻합니다. 보통 차량 번호와 함께 표시되며, 드라이버는 정해진 절차에 따라 피트로 돌아와야 합니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.4.'
  },
  {
    id: 'faq-032',
    category: 'penalty',
    question: '블랙 오렌지 플래그는 무슨 뜻인가요?',
    answer: '검은색 바탕에 주황색 원이 있는 플래그는 차량에 기계적 문제가 있어 본인이나 다른 참가자에게 위험할 수 있음을 알리는 신호입니다. 보통 해당 차량은 다음 랩에 피트로 들어가 문제를 해결해야 하며, 문제가 해결되면 다시 경기에 복귀할 수 있습니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.4.'
  },
  {
    id: 'faq-033',
    category: 'penalty',
    question: '스튜어드의 공식 경고가 쌓이면 어떻게 되나요?',
    answer: '스튜어드는 사고나 규정 위반에 대해 드라이버에게 공식 경고(Driver reprimand)를 줄 수 있습니다. 같은 시즌에 공식 경고를 5번 받았고, 그중 최소 4번이 주행 위반으로 인한 것이라면 5번째 공식 경고를 받은 시점에 10그리드 페널티가 부과됩니다. 5번째 공식 경고가 레이스 사고 이후 내려졌다면 다음 대회 레이스에 적용됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B1.9.5.'
  },
  {
    id: 'faq-034',
    category: 'penalty',
    question: '모든 페널티에 항소할 수 있나요?',
    answer: '아닙니다. FIA 규정에는 일부 시간 페널티, 드라이브 스루, 스톱앤고, 랩타임 삭제 등 항소가 제한되는 결정들이 있습니다. 따라서 팀이 불만이 있어도 모든 판정에 대해 항소할 수 있는 것은 아닙니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B1.9.'
  },
  {
    id: 'faq-035',
    category: 'safety',
    question: '세이프티카는 언제 나오나요?',
    answer: '세이프티카는 트랙 위 사고, 멈춘 차량, 위험한 잔해물, 악천후 등으로 정상 속도 주행이 위험하지만 레이스를 완전히 중단할 필요까지는 없을 때 사용됩니다. 세이프티카가 나오면 모든 차량은 속도를 줄이고 대열을 유지해야 합니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.13.'
  },
  {
    id: 'faq-036',
    category: 'safety',
    question: 'VSC는 세이프티카와 뭐가 다른가요?',
    answer: 'VSC는 Virtual Safety Car의 약자로, 실제 세이프티카 차량이 나오지 않더라도 모든 드라이버가 정해진 기준 속도 이하로 달리게 하는 절차입니다. 보통 위험 상황은 있지만 실제 세이프티카 투입까지는 필요하지 않을 때 사용됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.12.'
  },
  {
    id: 'faq-037',
    category: 'safety',
    question: 'VSC나 세이프티카 상황에서 추월이 가능한가요?',
    answer: '원칙적으로 추월은 금지됩니다. 다만 피트 진입·이탈 과정, 명백히 문제 있는 차량을 지나는 경우, Race Control이 랩다운 차량 추월을 허용한 경우 등 규정상 예외가 있을 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.12, B5.13.'
  },
  {
    id: 'faq-038',
    category: 'safety',
    question: '세이프티카 재시작 때 선두 차량은 마음대로 속도를 조절할 수 있나요?',
    answer: '선두 차량은 세이프티카가 들어간 뒤 재시작 속도를 조절할 수 있지만, 지나친 급가속·급감속이나 다른 차량을 위험하게 만드는 행동은 허용되지 않습니다. 재시작 절차는 Race Control의 지시와 Sporting Regulations에 따라 진행됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.13.'
  },
  {
    id: 'faq-039',
    category: 'safety',
    question: '레드플래그가 나오면 드라이버는 무엇을 해야 하나요?',
    answer: '레드플래그가 표시되면 세션 또는 레이스가 중단됩니다. 드라이버는 속도를 줄이고 추월하지 않으며, Race Control의 지시에 따라 피트레인이나 지정된 위치로 이동해야 합니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5.14, FIA International Sporting Code Appendix H.'
  },
  {
    id: 'faq-040',
    category: 'safety',
    question: '노란 깃발과 더블 옐로우는 어떻게 다른가요?',
    answer: '싱글 옐로우는 위험 구간이 있으니 감속하고 추월하지 말라는 의미입니다. 더블 옐로우는 위험이 더 크거나 트랙이 막혔거나 마샬이 작업 중일 수 있다는 뜻으로, 크게 감속하고 방향 전환 또는 정지를 준비해야 합니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.5.'
  },
  {
    id: 'faq-041',
    category: 'safety',
    question: '파란 깃발은 무슨 뜻인가요?',
    answer: '파란 깃발은 더 빠른 차량이 뒤에서 접근 중임을 알려주는 신호입니다. 레이스에서는 특히 한 랩 뒤처진 차량에게 뒤의 빠른 차량을 먼저 보내라는 의미로 사용됩니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.5, Formula1.com Official F1 Glossary.'
  },
  {
    id: 'faq-042',
    category: 'safety',
    question: '초록 깃발은 무슨 뜻인가요?',
    answer: '초록 깃발은 위험 구간이 끝났고 트랙이 정상 상태로 돌아왔음을 뜻합니다. 보통 옐로우 플래그 구간 이후에 표시되며, 이 지점 이후부터 정상 주행이 가능합니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.5.'
  },
  {
    id: 'faq-043',
    category: 'safety',
    question: '흰 깃발은 무슨 뜻인가요?',
    answer: '흰 깃발은 해당 구간에 매우 느린 차량이 있다는 뜻입니다. 드라이버는 앞쪽에 느린 차량이나 작업 차량이 있을 수 있다고 보고 주의해야 합니다. 근거: FIA International Sporting Code Appendix H, Art. 2.5.5.'
  },
  {
    id: 'faq-044',
    category: 'safety',
    question: '차가 트랙에서 멈췄다가 외부 도움을 받아 다시 달리면 어떻게 되나요?',
    answer: '차량이 트랙 위에서 멈춘 뒤 외부의 물리적 도움을 받아 다시 세션에 복귀하면 문제가 될 수 있습니다. 안전을 위한 차량 회수는 가능하지만, 경기 복귀에 외부 도움을 받는 것은 규정 위반이나 실격 사유가 될 수 있습니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B5, ISC.'
  },
  {
    id: 'faq-045',
    category: 'safety',
    question: 'F1 드라이버 안전벨트도 규정이 있나요?',
    answer: '네. F1 드라이버는 FIA 표준을 만족하는 안전 하네스를 착용해야 하며, 하네스는 제조사 지시에 따라 사용되고 차량에 안전하게 고정되어야 합니다. 근거: FIA 2026 F1 Technical Regulations, Art. C14.5.'
  },
  {
    id: 'faq-046',
    category: 'safety',
    question: '더운 경기에서 드라이버 냉각 장치가 사용되나요?',
    answer: '네. 2026 기술 규정에는 Heat Hazard가 선언되는 상황을 위한 드라이버 냉각 시스템 규정이 포함되어 있습니다. 이 시스템은 드라이버에게 추가 냉각을 제공하기 위한 장치이며, 드라이아이스 사용은 금지됩니다. 근거: FIA 2026 F1 Technical Regulations, Art. C14.6.'
  },
  {
    id: 'faq-047',
    category: 'technical',
    question: '레이스가 끝난 뒤에도 차량 검사를 하나요?',
    answer: '네. 레이스가 끝난 뒤에도 FIA는 차량이 기술 규정을 지켰는지 검사할 수 있습니다. 차량 무게, 부품 규정, 연료 샘플, 플랭크 마모 같은 항목에서 위반이 발견되면 실격으로 이어질 수 있습니다. 그래서 체커기를 받았더라도 최종 결과는 검차와 스튜어드 절차 이후 확정됩니다. 근거: FIA 2026 F1 Sporting Regulations, Art. B3.1, B3.2, FIA 2026 F1 Technical Regulations.'
  }
];