window.BIO_LAB_DATA = {
  roles: {
    botanist: {
      name: "식물 연구원",
      color: "#76c75b",
      bonus: "작물 성장에 필요한 물 공급 횟수가 줄어듭니다."
    },
    molecular: {
      name: "분자 연구원",
      color: "#6ca9e8",
      bonus: "퀴즈와 실험에서 얻는 RP가 10% 증가합니다."
    },
    engineer: {
      name: "바이오 엔지니어",
      color: "#e6a34b",
      bonus: "연구 장비를 10% 저렴하게 구입합니다."
    }
  },

  /* 28일 메인 스토리 */

  days: [
    {
      title: "사라진 연구 노트",
      area: "중앙 연구동",
      goal: "한 박사와 대화하고 DNA 퀴즈를 통과하세요.",
      reward: { rp: 60, materials: 2 },
      quest: "q_dna"
    },
    {
      title: "숲의 형광 표본",
      area: "생태 보존구역",
      goal: "야생 표본 3종을 모아 유나에게 전달하세요.",
      reward: { rp: 75, materials: 3 },
      quest: "q_samples"
    },
    {
      title: "온실의 첫 수확",
      area: "스마트 온실",
      goal: "서로 다른 작물 2종을 심고 하나를 수확하세요.",
      reward: { rp: 90, materials: 4 },
      quest: "q_harvest"
    },
    {
      title: "PCR 긴급 점검",
      area: "분자 연구실",
      goal: "PCR 단계 배열 실험을 성공시키세요.",
      reward: { rp: 110, materials: 4 },
      quest: "q_pcr"
    },
    {
      title: "초점 밖의 세포",
      area: "관찰 연구실",
      goal: "현미경의 초점을 맞추고 세포 구조를 판별하세요.",
      reward: { rp: 130, materials: 5 },
      quest: "q_scope"
    },
    {
      title: "호르몬의 균형",
      area: "조직 배양실",
      goal: "옥신과 사이토키닌의 비율을 조절해 기관을 유도하세요.",
      reward: { rp: 150, materials: 6 },
      quest: "q_culture"
    },
    {
      title: "유전자 가위의 표적",
      area: "유전자 편집실",
      goal: "CRISPR 퀴즈를 통과하고 표적 서열을 선택하세요.",
      reward: { rp: 190, materials: 7 },
      quest: "q_crispr"
    },
    {
      title: "메마른 온실",
      area: "스마트 온실",
      goal: "가뭄 조건에서 작물 3개를 건강하게 유지하세요.",
      reward: { rp: 150, materials: 8 },
      quest: "q_drought"
    },
    {
      title: "연못의 미생물",
      area: "연구 연못",
      goal: "연못에서 물 표본을 채취하고 현미경으로 분석하세요.",
      reward: { rp: 170, materials: 8 },
      quest: "q_pond"
    },
    {
      title: "돌연변이 씨앗",
      area: "시험 재배지",
      goal: "새로운 형질의 씨앗을 재배하고 표현형을 기록하세요.",
      reward: { rp: 190, materials: 9 },
      quest: "q_mutant"
    },
    {
      title: "오염 경보",
      area: "조직 배양실",
      goal: "배양 접시에서 오염 징후를 찾아 제거하세요.",
      reward: { rp: 210, materials: 10 },
      quest: "q_contamination"
    },
    {
      title: "설계된 생태계",
      area: "전 연구구역",
      goal: "서로 다른 연구 활동 3가지를 하루에 완료하세요.",
      reward: { rp: 230, materials: 10 },
      quest: "q_ecosystem"
    },
    {
      title: "후배 연구원의 질문",
      area: "중앙 광장",
      goal: "민에게 배운 지식을 설명하고 종합 퀴즈를 통과하세요.",
      reward: { rp: 260, materials: 12 },
      quest: "q_review"
    },
    {
      title: "1차 연구 발표",
      area: "중앙 연구동",
      goal: "2주간의 연구 기록을 정리하고 중간 평가를 통과하세요.",
      reward: { rp: 400, materials: 15 },
      quest: "q_final"
    },
    {
      title: "잠든 종자 은행",
      area: "지하 종자 보관소",
      goal: "보존 종자의 휴면과 발아 조건에 관한 퀴즈를 해결하세요.",
      reward: { rp: 220, materials: 9 },
      quest: "q_seedbank"
    },
    {
      title: "보이지 않는 운반자",
      area: "시험 재배지",
      goal: "꽃가루 표본을 모으고 인공수분 교배 실험을 완료하세요.",
      reward: { rp: 230, materials: 10 },
      quest: "q_cross"
    },
    {
      title: "효소의 적정 온도",
      area: "분자 연구구역",
      goal: "효소 반응 조건을 조절해 가장 높은 활성을 찾으세요.",
      reward: { rp: 240, materials: 10 },
      quest: "q_enzyme"
    },
    {
      title: "켜지고 꺼지는 유전자",
      area: "중앙 연구동",
      goal: "환경에 따른 유전자 발현 변화를 해석하세요.",
      reward: { rp: 250, materials: 11 },
      quest: "q_expression"
    },
    {
      title: "긴 밤, 짧은 낮",
      area: "스마트 온실",
      goal: "광주기에 따른 개화 반응을 조사하고 작물을 관리하세요.",
      reward: { rp: 260, materials: 11 },
      quest: "q_light"
    },
    {
      title: "뿌리 곁의 동료",
      area: "생태 보존구역",
      goal: "근권 토양을 채집하고 식물과 미생물의 관계를 조사하세요.",
      reward: { rp: 270, materials: 12 },
      quest: "q_microbe"
    },
    {
      title: "2차 연구 심사",
      area: "중앙 연구동",
      goal: "유전·식물·세포 분야의 종합 평가를 통과하세요.",
      reward: { rp: 450, materials: 16 },
      quest: "q_review2"
    },
    {
      title: "기후 챔버 가동",
      area: "환경 조절실",
      goal: "온도와 수분을 조절해 작물의 건강도를 유지하세요.",
      reward: { rp: 290, materials: 12 },
      quest: "q_climate"
    },
    {
      title: "소금기 어린 토양",
      area: "시험 재배지",
      goal: "염 스트레스 조건에서 생존한 식물을 관찰하세요.",
      reward: { rp: 300, materials: 13 },
      quest: "q_salt"
    },
    {
      title: "DNA 밴드의 암호",
      area: "분자 연구구역",
      goal: "전기영동 결과에서 목표 DNA 밴드를 찾으세요.",
      reward: { rp: 320, materials: 13 },
      quest: "q_gel"
    },
    {
      title: "상보 서열 복원",
      area: "유전자 편집실",
      goal: "손상된 DNA 기록의 상보적 염기서열을 복원하세요.",
      reward: { rp: 330, materials: 14 },
      quest: "q_sequence"
    },
    {
      title: "예상 밖의 형질",
      area: "시험 재배지",
      goal: "교배 작물을 수확하고 우성·열성 표현형을 기록하세요.",
      reward: { rp: 340, materials: 14 },
      quest: "q_trait"
    },
    {
      title: "연구 윤리 위원회",
      area: "중앙 연구동",
      goal: "유전자 편집 연구의 안전성과 윤리적 선택을 검토하세요.",
      reward: { rp: 360, materials: 15 },
      quest: "q_ethics"
    },
    {
      title: "바이오 야시장",
      area: "중앙 광장",
      goal: "연구원 세 명과 교류하고 시민용 연구 설명을 완성하세요.",
      reward: { rp: 380, materials: 16 },
      quest: "q_festival"
    },
    {
      title: "BIO LAB 최종 발표",
      area: "전 연구구역",
      goal: "연구소를 점검하고 최종 종합 평가를 통과하세요.",
      reward: { rp: 700, materials: 25 },
      quest: "q_grandfinal"
    }
  ],

  /* 퀘스트별 담당 NPC와 수행 방식 */

  quests: {
    q_dna: {
      npc: "mentor",
      type: "quiz",
      quizCategory: "DNA"
    },
    q_samples: {
      npc: "yuna",
      type: "collect",
      target: 3
    },
    q_harvest: {
      npc: "yuna",
      type: "harvest",
      target: 1
    },
    q_pcr: {
      npc: "jin",
      type: "minigame",
      game: "pcr"
    },
    q_scope: {
      npc: "mentor",
      type: "minigame",
      game: "scope"
    },
    q_culture: {
      npc: "yuna",
      type: "minigame",
      game: "culture"
    },
    q_crispr: {
      npc: "jin",
      type: "quiz",
      quizCategory: "CRISPR"
    },
    q_drought: {
      npc: "yuna",
      type: "care",
      target: 3
    },
    q_pond: {
      npc: "min",
      type: "pond",
      target: 1
    },
    q_mutant: {
      npc: "yuna",
      type: "harvest",
      target: 1
    },
    q_contamination: {
      npc: "mentor",
      type: "minigame",
      game: "contamination"
    },
    q_ecosystem: {
      npc: "jin",
      type: "activities",
      target: 3
    },
    q_review: {
      npc: "min",
      type: "quiz",
      quizCategory: "종합"
    },
    q_final: {
      npc: "mentor",
      type: "quiz",
      quizCategory: "최종"
    },
    q_seedbank: {
      npc: "mira",
      type: "quiz",
      quizCategory: "종자"
    },
    q_cross: {
      npc: "yuna",
      type: "minigame",
      game: "cross"
    },
    q_enzyme: {
      npc: "jin",
      type: "minigame",
      game: "enzyme"
    },
    q_expression: {
      npc: "mentor",
      type: "quiz",
      quizCategory: "발현"
    },
    q_light: {
      npc: "yuna",
      type: "care",
      target: 3
    },
    q_microbe: {
      npc: "hae",
      type: "collect",
      target: 3
    },
    q_review2: {
      npc: "mentor",
      type: "quiz",
      quizCategory: "종합"
    },
    q_climate: {
      npc: "sol",
      type: "minigame",
      game: "climate"
    },
    q_salt: {
      npc: "yuna",
      type: "harvest",
      target: 1
    },
    q_gel: {
      npc: "jin",
      type: "minigame",
      game: "gel"
    },
    q_sequence: {
      npc: "jin",
      type: "minigame",
      game: "sequence"
    },
    q_trait: {
      npc: "yuna",
      type: "minigame",
      game: "cross"
    },
    q_ethics: {
      npc: "mentor",
      type: "quiz",
      quizCategory: "윤리"
    },
    q_festival: {
      npc: "min",
      type: "activities",
      target: 3
    },
    q_grandfinal: {
      npc: "mentor",
      type: "quiz",
      quizCategory: "최종"
    }
  },

  /* 연구소 NPC */

  npcs: [
    {
      id: "mentor",
      name: "한 박사",
      title: "책임 연구원",
      x: 832,
      y: 512,
      color: "#8b69c7",
      dialogue: [
        "연구는 정답을 외우는 일이 아니라, 결과가 왜 달라졌는지 묻는 일이야.",
        "기록하지 않은 관찰은 금방 사라져. 작은 변화도 연구 노트에 남겨 두렴."
      ]
    },
    {
      id: "yuna",
      name: "유나",
      title: "식물 연구원",
      x: 1408,
      y: 480,
      color: "#58a85d",
      dialogue: [
        "같은 씨앗도 빛과 물, 영양 조건에 따라 전혀 다르게 자라.",
        "온실 서쪽 시험 재배지는 자유롭게 사용해도 돼."
      ]
    },
    {
      id: "jin",
      name: "진",
      title: "분자 연구원",
      x: 544,
      y: 800,
      color: "#4e8dcb",
      dialogue: [
        "PCR 장비는 순서가 핵심이야. DNA를 분리하고, 프라이머를 붙이고, 가닥을 늘려.",
        "장비를 업그레이드하면 실험 보상이 커져."
      ]
    },
    {
      id: "min",
      name: "민",
      title: "인턴 연구원",
      x: 1056,
      y: 896,
      color: "#d99146",
      dialogue: [
        "연못에서 반짝이는 물 표본을 봤어. 어떤 생물이 살고 있을까?",
        "선배, 오늘 배운 내용을 나한테 설명해 줄래?"
      ]
    },
    {
      id: "mira",
      name: "미라",
      title: "연구 보급관",
      x: 960,
      y: 352,
      color: "#c35f70",
      dialogue: [
        "필요한 씨앗과 처리제를 준비해 뒀어.",
        "무조건 빠른 성장이 좋은 결과를 만드는 건 아니야."
      ]
    },
    {
      id: "hae",
      name: "해오",
      title: "미생물 생태 연구원",
      x: 230,
      y: 520,
      color: "#4aa697",
      dialogue: [
        "식물은 혼자 자라지 않아. 뿌리 주변의 미생물도 함께 살고 있지.",
        "근권 토양은 평범해 보여도 복잡한 생태계야."
      ]
    },
    {
      id: "sol",
      name: "솔",
      title: "기후 적응 연구원",
      x: 1580,
      y: 720,
      color: "#9b7653",
      dialogue: [
        "같은 온도라도 습도와 빛이 달라지면 식물의 반응도 달라져.",
        "스트레스에 견뎠다는 것과 잘 자랐다는 것은 다른 의미야."
      ]
    }
  ],

  /* 생명공학 퀴즈 */

  quizzes: [
    {
      category: "DNA",
      question: "5′-ATGC-3′과 상보적으로 결합하는 DNA 가닥은?",
      answers: [
        "3′-TACG-5′",
        "5′-TACG-3′",
        "3′-UACG-5′",
        "3′-ATGC-5′"
      ],
      correct: 0,
      hint: "DNA의 염기쌍은 A-T, G-C이며 두 가닥의 방향은 반대입니다.",
      explanation: "A는 T와, G는 C와 결합합니다. 따라서 상보 가닥은 3′-TACG-5′입니다."
    },
    {
      category: "DNA",
      question: "DNA의 당-인산 골격 안쪽에서 유전 정보를 만드는 것은?",
      answers: [
        "염기의 배열",
        "인산의 개수",
        "물 분자의 방향",
        "세포막의 두께"
      ],
      correct: 0,
      hint: "A, T, G, C가 어떤 순서로 놓였는지 생각해 보세요.",
      explanation: "DNA의 유전 정보는 네 종류 염기의 배열에 저장됩니다."
    },
    {
      category: "PCR",
      question: "PCR 한 사이클의 올바른 순서는?",
      answers: [
        "변성-결합-신장",
        "결합-신장-변성",
        "신장-변성-결합",
        "변성-신장-결합"
      ],
      correct: 0,
      hint: "먼저 두 가닥을 분리한 뒤 프라이머를 붙입니다.",
      explanation: "변성에서 두 가닥을 분리하고, 결합에서 프라이머가 붙으며, 신장에서 새 DNA가 합성됩니다."
    },
    {
      category: "CRISPR",
      question: "CRISPR-Cas에서 가이드 RNA의 역할은?",
      answers: [
        "Cas 단백질을 표적 DNA로 안내",
        "모든 DNA를 무작위 절단",
        "세포에 에너지 공급",
        "RNA를 지질로 변환"
      ],
      correct: 0,
      hint: "가이드라는 이름에 주목하세요.",
      explanation: "가이드 RNA는 상보적인 표적 서열을 인식하여 Cas 단백질을 해당 위치로 안내합니다."
    },
    {
      category: "CRISPR",
      question: "유전자 편집에서 표적 이외의 위치가 변하는 현상은?",
      answers: [
        "오프타깃 효과",
        "삼투 현상",
        "증산 작용",
        "우성 표현"
      ],
      correct: 0,
      hint: "원래 목표에서 벗어났다는 의미입니다.",
      explanation: "오프타깃 효과는 의도하지 않은 유전체 위치에 편집이 발생하는 현상입니다."
    },
    {
      category: "식물",
      question: "줄기 신장과 종자 발아 촉진에 주로 관여하는 호르몬은?",
      answers: [
        "지베렐린",
        "앱시스산",
        "에틸렌",
        "멜라토닌"
      ],
      correct: 0,
      hint: "온실의 성장 촉진 처리제에 들어 있습니다.",
      explanation: "지베렐린은 여러 식물에서 줄기 신장과 발아를 촉진합니다."
    },
    {
      category: "식물",
      question: "질소 비료를 지나치게 공급했을 때 가능한 결과는?",
      answers: [
        "잎과 줄기 성장에 치우침",
        "모든 광합성 즉시 중단",
        "DNA가 모두 RNA로 변환",
        "뿌리가 항상 두 배 증가"
      ],
      correct: 0,
      hint: "영양 생장과 생식 생장의 균형을 생각해 보세요.",
      explanation: "질소가 과하면 영양 생장이 지나치게 활발해져 개화와 결실이 불리해질 수 있습니다."
    },
    {
      category: "세포",
      question: "유사분열 뒤 일반적으로 만들어지는 딸세포는 몇 개인가요?",
      answers: [
        "2개",
        "1개",
        "4개",
        "8개"
      ],
      correct: 0,
      hint: "한 세포가 한 번 나뉩니다.",
      explanation: "유사분열이 완료되면 일반적으로 유전적으로 유사한 딸세포 두 개가 형성됩니다."
    },
    {
      category: "세포",
      question: "세포 배양에서 멸균이 중요한 이유는?",
      answers: [
        "원하지 않는 미생물 오염 방지",
        "세포 색을 진하게 하기 위해",
        "DNA를 모두 제거하기 위해",
        "배양액을 얼리기 위해"
      ],
      correct: 0,
      hint: "세균과 곰팡이가 함께 자라면 어떻게 될까요?",
      explanation: "오염 미생물은 배양 환경과 결과를 바꾸므로 청결한 조작이 필수입니다."
    },
    {
      category: "종합",
      question: "RNA에서 티민 대신 사용되는 염기는?",
      answers: [
        "유라실",
        "구아닌",
        "사이토신",
        "인산"
      ],
      correct: 0,
      hint: "알파벳 U로 나타냅니다.",
      explanation: "RNA는 티민 대신 유라실을 사용합니다."
    },
    {
      category: "종합",
      question: "식물이 수분 손실을 줄이기 위해 기공을 닫을 때 관여하는 호르몬은?",
      answers: [
        "앱시스산",
        "지베렐린",
        "옥신",
        "사이토키닌"
      ],
      correct: 0,
      hint: "가뭄 스트레스와 관련된 호르몬입니다.",
      explanation: "수분 부족 시 앱시스산 신호가 증가하여 기공 폐쇄를 유도합니다."
    },
    {
      category: "최종",
      question: "실험군과 대조군을 함께 두는 가장 중요한 이유는?",
      answers: [
        "처리 조건의 효과를 비교하기 위해",
        "표본 수를 무조건 줄이기 위해",
        "결과를 항상 같게 만들기 위해",
        "오염을 일부러 늘리기 위해"
      ],
      correct: 0,
      hint: "달라진 조건 이외에는 같아야 합니다.",
      explanation: "대조군은 처리하지 않은 기준을 제공하여 관찰된 차이가 처리 조건 때문인지 판단하게 합니다."
    },
    {
      category: "최종",
      question: "좋은 연구 기록에 반드시 포함되어야 할 것은?",
      answers: [
        "조건·관찰·결과",
        "정답만",
        "예상과 같은 결과만",
        "실험자의 기분만"
      ],
      correct: 0,
      hint: "다른 사람이 같은 과정을 재현할 수 있어야 합니다.",
      explanation: "조건과 과정, 관찰 결과를 함께 기록해야 결과를 해석하고 재현할 수 있습니다."
    },
    {
      category: "종자",
      question: "종자가 적절한 조건에서도 바로 발아하지 않는 상태는?",
      answers: [
        "휴면",
        "전사",
        "번역",
        "증산"
      ],
      correct: 0,
      hint: "발아에 적합한 시기를 기다리는 생존 전략입니다.",
      explanation: "종자 휴면은 불리한 시기를 피하고 적절한 환경에서 발아하게 하는 생존 전략입니다."
    },
    {
      category: "발현",
      question: "DNA 정보로부터 RNA가 만들어지는 과정은?",
      answers: [
        "전사",
        "번역",
        "복제",
        "삼투"
      ],
      correct: 0,
      hint: "DNA의 정보를 RNA 문장으로 옮기는 과정입니다.",
      explanation: "전사 과정에서는 DNA의 특정 염기서열을 주형으로 RNA가 합성됩니다."
    },
    {
      category: "발현",
      question: "모든 체세포가 거의 같은 DNA를 가져도 기능이 다른 중요한 이유는?",
      answers: [
        "발현되는 유전자가 다르기 때문",
        "세포마다 염기가 전혀 없기 때문",
        "모든 단백질이 같기 때문",
        "세포막이 DNA를 만들기 때문"
      ],
      correct: 0,
      hint: "어떤 유전자를 켜고 끄는지가 중요합니다.",
      explanation: "세포 종류에 따라 발현되는 유전자 조합이 달라 서로 다른 단백질과 기능이 나타납니다."
    },
    {
      category: "윤리",
      question: "새로운 유전자 편집 연구를 시작할 때 가장 먼저 고려할 내용은?",
      answers: [
        "안전성·필요성·예상하지 못한 영향",
        "연구 속도만",
        "결과 홍보만",
        "표본 수를 무조건 한 개로 제한"
      ],
      correct: 0,
      hint: "연구의 이익뿐 아니라 위험과 영향을 함께 검토해야 합니다.",
      explanation: "책임 있는 연구는 목적과 필요성, 안전성, 대상의 권리, 장기적 영향을 함께 검토해야 합니다."
    },
    {
      category: "윤리",
      question: "실험 결과가 예상과 다를 때 가장 적절한 행동은?",
      answers: [
        "결과를 그대로 기록하고 원인을 검토",
        "원하는 값으로 수정",
        "불리한 결과만 삭제",
        "조건을 기록하지 않음"
      ],
      correct: 0,
      hint: "예상 밖의 결과도 중요한 연구 정보입니다.",
      explanation: "결과를 정직하게 기록하고 조건과 오차 가능성을 검토해야 연구의 신뢰성을 지킬 수 있습니다."
    }
  ],

  /* 재배 작물 */

  crops: [
    {
      id: "arabidopsis",
      name: "애기장대",
      grow: 2,
      seedCost: 1,
      reward: 32,
      color: "#73b84f",
      note: "짧은 생활사와 작은 유전체를 지닌 모델 식물"
    },
    {
      id: "pea",
      name: "완두",
      grow: 3,
      seedCost: 2,
      reward: 46,
      color: "#9dcc50",
      note: "멘델의 유전 연구에 사용된 식물"
    },
    {
      id: "tomato",
      name: "토마토",
      grow: 4,
      seedCost: 3,
      reward: 65,
      color: "#df594c",
      note: "과실 발달과 숙성 연구에 적합한 작물"
    },
    {
      id: "strawberry",
      name: "딸기",
      grow: 5,
      seedCost: 4,
      reward: 84,
      color: "#ef7180",
      note: "영양 번식과 조직 배양을 관찰하기 좋은 작물"
    },
    {
      id: "luminara",
      name: "루미나라",
      grow: 6,
      seedCost: 6,
      reward: 125,
      color: "#68d9c5",
      note: "게임 속 형광 표지 형질을 가진 연구용 품종"
    },
    {
      id: "rice",
      name: "벼",
      grow: 5,
      seedCost: 4,
      reward: 92,
      color: "#d8c867",
      note: "물과 온도 조건에 민감한 주요 식량 작물"
    },
    {
      id: "sunflower",
      name: "해바라기",
      grow: 5,
      seedCost: 4,
      reward: 96,
      color: "#e2b83d",
      note: "빛 반응과 꽃 발달을 관찰하기 좋은 작물"
    },
    {
      id: "saltwort",
      name: "퉁퉁마디",
      grow: 6,
      seedCost: 5,
      reward: 115,
      color: "#8fbd78",
      note: "염분이 높은 환경에 적응한 염생식물"
    }
  ],

  /* 식물 성장 처리제 */

  treatments: [
    {
      id: "water",
      name: "정제수",
      cost: 0,
      description: "기본 성장에 필요합니다."
    },
    {
      id: "gibberellin",
      name: "지베렐린",
      cost: 18,
      description: "성장 +1. 반복 사용 시 건강도 -5."
    },
    {
      id: "auxin",
      name: "옥신",
      cost: 22,
      description: "수확 RP +20%. 뿌리 발달 신호를 관찰합니다."
    },
    {
      id: "cytokinin",
      name: "사이토키닌",
      cost: 25,
      description: "수확 재료 +1. 세포 분열 신호를 관찰합니다."
    },
    {
      id: "nitrogen",
      name: "질소 영양액",
      cost: 15,
      description: "초기 성장 +1. 과다 사용 시 결실 보상이 감소합니다."
    }
  ],

  /* 연구소 장비 */

  equipment: [
    {
      id: "microscope",
      name: "광학 현미경",
      cost: 90,
      day: 1,
      description: "표본 분석과 현미경 미니게임을 엽니다."
    },
    {
      id: "irrigation",
      name: "자동 관수기",
      cost: 150,
      day: 2,
      description: "매일 작물 세 칸에 자동으로 물을 줍니다."
    },
    {
      id: "pcr",
      name: "PCR 장비",
      cost: 190,
      day: 3,
      description: "PCR 실험과 DNA 증폭 연구를 엽니다."
    },
    {
      id: "incubator",
      name: "정밀 배양기",
      cost: 240,
      day: 4,
      description: "조직 배양 보상을 높이고 오염 가능성을 낮춥니다."
    },
    {
      id: "sequencer",
      name: "소형 분석기",
      cost: 340,
      day: 6,
      description: "채집 표본의 분석 RP가 두 배가 됩니다."
    },
    {
      id: "greenhouse2",
      name: "온실 확장",
      cost: 480,
      day: 8,
      description: "시험 재배지 네 칸과 희귀 씨앗을 해금합니다."
    },
    {
      id: "gel",
      name: "전기영동 장치",
      cost: 520,
      day: 15,
      description: "DNA 밴드 분석 실험을 해금합니다."
    },
    {
      id: "climate",
      name: "기후 챔버",
      cost: 620,
      day: 20,
      description: "온도·수분 환경 조절 실험을 해금합니다."
    },
    {
      id: "seedbank",
      name: "종자 보존고",
      cost: 720,
      day: 22,
      description: "벼·해바라기·염생식물 씨앗을 해금합니다."
    },
    {
      id: "analysisAI",
      name: "패턴 분석 단말기",
      cost: 900,
      day: 25,
      description: "완료한 실험의 보상과 연구 기록 분석을 강화합니다."
    }
  ],

  /* 지도에서 채집하는 표본 */

  samples: [
    {
      id: "moss",
      name: "형광 이끼",
      color: "#70e07b",
      fact: "이끼는 관다발이 발달하지 않은 선태식물입니다."
    },
    {
      id: "soil",
      name: "근권 토양",
      color: "#a67a4d",
      fact: "근권은 식물 뿌리의 영향을 강하게 받는 토양 영역입니다."
    },
    {
      id: "water",
      name: "연못 물",
      color: "#58b9d6",
      fact: "물 한 방울에도 다양한 미생물과 미세 조류가 존재할 수 있습니다."
    },
    {
      id: "pollen",
      name: "야생화 꽃가루",
      color: "#e5c74f",
      fact: "꽃가루에는 식물의 수배우체가 들어 있습니다."
    }
  ],

  /* 매일 달라지는 서브 퀘스트 */

  dailyTasks: [
    {
      type: "water",
      label: "작물에 물 3번 주기",
      target: 3,
      reward: 25
    },
    {
      type: "talk",
      label: "연구원 2명과 대화하기",
      target: 2,
      reward: 25
    },
    {
      type: "collect",
      label: "야생 표본 2개 채집하기",
      target: 2,
      reward: 30
    },
    {
      type: "quiz",
      label: "퀴즈 1개 맞히기",
      target: 1,
      reward: 35
    },
    {
      type: "experiment",
      label: "실험 미니게임 1회 성공하기",
      target: 1,
      reward: 40
    },
    {
      type: "harvest",
      label: "작물 1개 수확하기",
      target: 1,
      reward: 45
    },
    {
      type: "plant",
      label: "씨앗 2개 심기",
      target: 2,
      reward: 35
    },
    {
      type: "treatment",
      label: "성장 처리 조건 2회 비교하기",
      target: 2,
      reward: 45
    },
    {
      type: "distance",
      label: "연구구역 세 곳 방문하기",
      target: 3,
      reward: 30
    }
  ],

  /* 날씨 */

  weather: [
    {
      id: "sunny",
      name: "맑음",
      crop: 0,
      stamina: 0
    },
    {
      id: "rain",
      name: "비",
      crop: 0,
      stamina: 0
    },
    {
      id: "heat",
      name: "폭염",
      crop: -1,
      stamina: 1
    },
    {
      id: "cloud",
      name: "흐림",
      crop: 0,
      stamina: 0
    },
    {
      id: "breeze",
      name: "산들바람",
      crop: 0,
      stamina: -1
    }
  ]
};