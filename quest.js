/* =========================================================
   BIO LAB - quest.js
   퀘스트, 생명공학 퀴즈, 작물, 처리제, 연구 장비 데이터
   ========================================================= */

window.BIO_LAB_DATA = {
  /* ---------------------------------------------------------
     7일간의 메인 퀘스트
     --------------------------------------------------------- */
  days: [
    {
      day: 1,
      title: "DNA의 첫 번째 기록",
      area: "기초 연구실",
      description:
        "선배 연구원 한 박사에게 DNA 상보적 결합에 대해 배우고 첫 번째 퀴즈를 해결하세요.",
      reward: {
        rp: 40,
        materials: 2
      }
    },
    {
      day: 2,
      title: "증폭되는 단서",
      area: "PCR 연구실",
      description:
        "PCR이 DNA를 증폭하는 과정과 온도 변화의 의미를 조사하세요.",
      reward: {
        rp: 60,
        materials: 3
      }
    },
    {
      day: 3,
      title: "RNA의 메시지",
      area: "분자생물학실",
      description:
        "DNA의 정보가 RNA로 전달되는 과정과 RNA의 구조적 특징을 학습하세요.",
      reward: {
        rp: 80,
        materials: 4
      }
    },
    {
      day: 4,
      title: "세포 배양의 시작",
      area: "세포 배양실",
      description:
        "세포가 자라기 위해 필요한 환경과 오염 방지의 중요성을 알아보세요.",
      reward: {
        rp: 100,
        materials: 5
      }
    },
    {
      day: 5,
      title: "유전자 가위",
      area: "유전자 편집실",
      description:
        "CRISPR-Cas 시스템이 표적 DNA를 찾아가는 원리를 조사하세요.",
      reward: {
        rp: 130,
        materials: 6
      }
    },
    {
      day: 6,
      title: "성장을 조절하는 신호",
      area: "스마트 온실",
      description:
        "옥신, 지베렐린, 사이토키닌이 식물의 성장에 미치는 영향을 비교하세요.",
      reward: {
        rp: 160,
        materials: 7
      }
    },
    {
      day: 7,
      title: "BIO LAB 최종 연구",
      area: "중앙 연구동",
      description:
        "지금까지 배운 생명공학 지식을 활용해 최종 연구 평가를 통과하세요.",
      reward: {
        rp: 250,
        materials: 10
      }
    }
  ],

  /* ---------------------------------------------------------
     생명공학 퀴즈
     correct는 정답 번호이며 0부터 시작합니다.
     예: correct: 1이면 두 번째 보기가 정답입니다.
     --------------------------------------------------------- */
  quizzes: [
    {
      id: "dna-complement",
      type: "multiple",
      category: "DNA",
      question:
        "DNA 한 가닥의 염기서열이 5′-ATGC-3′일 때, 상보적인 가닥은 무엇일까요?",
      answers: [
        "3′-ATGC-5′",
        "3′-TACG-5′",
        "5′-UACG-3′",
        "3′-AUGC-5′"
      ],
      correct: 1,
      hint:
        "DNA에서는 아데닌(A)이 티민(T)과 결합하고, 구아닌(G)이 사이토신(C)과 결합합니다.",
      explanation:
        "DNA의 상보적 염기쌍은 A-T, G-C입니다. 두 가닥은 서로 반대 방향으로 배열되므로 5′-ATGC-3′의 상보 가닥은 3′-TACG-5′입니다."
    },
    {
      id: "pcr-order",
      type: "multiple",
      category: "PCR",
      question:
        "PCR 한 사이클의 과정이 올바른 순서로 배열된 것은 무엇일까요?",
      answers: [
        "변성 → 결합 → 신장",
        "결합 → 변성 → 신장",
        "신장 → 결합 → 변성",
        "변성 → 신장 → 결합"
      ],
      correct: 0,
      hint:
        "먼저 DNA 두 가닥을 분리하고, 프라이머를 붙인 다음 새로운 DNA 가닥을 합성합니다.",
      explanation:
        "PCR은 변성, 결합, 신장 순서로 진행됩니다. 변성 단계에서 DNA 두 가닥이 분리되고, 결합 단계에서 프라이머가 표적 서열에 붙으며, 신장 단계에서 DNA 중합효소가 새로운 가닥을 합성합니다."
    },
    {
      id: "rna-base",
      type: "multiple",
      category: "RNA",
      question:
        "RNA에서 DNA의 티민(T) 대신 사용되는 염기는 무엇일까요?",
      answers: [
        "아데닌(A)",
        "구아닌(G)",
        "유라실(U)",
        "사이토신(C)"
      ],
      correct: 2,
      hint:
        "RNA에는 T가 없으며, 그 자리를 알파벳 U로 표시하는 염기가 대신합니다.",
      explanation:
        "RNA에서는 티민 대신 유라실이 사용됩니다. 따라서 RNA에서 아데닌은 유라실과 상보적으로 결합합니다."
    },
    {
      id: "cell-culture",
      type: "multiple",
      category: "세포 배양",
      question:
        "세포 배양 실험에서 멸균과 오염 방지가 중요한 가장 큰 이유는 무엇일까요?",
      answers: [
        "세포의 색을 진하게 만들기 위해",
        "원하지 않는 미생물이 자라지 못하게 하기 위해",
        "세포의 DNA를 모두 제거하기 위해",
        "배양액의 온도를 항상 낮추기 위해"
      ],
      correct: 1,
      hint:
        "세균이나 곰팡이가 배양 용기에 들어오면 연구 대상보다 빠르게 증식할 수 있습니다.",
      explanation:
        "세포 배양 과정에서 세균이나 곰팡이가 유입되면 배양 환경과 실험 결과가 달라질 수 있습니다. 따라서 멸균된 도구와 청결한 작업 환경이 중요합니다."
    },
    {
      id: "crispr-guide-rna",
      type: "multiple",
      category: "CRISPR",
      question:
        "CRISPR-Cas 시스템에서 가이드 RNA의 주된 역할은 무엇일까요?",
      answers: [
        "세포에 에너지를 공급한다",
        "Cas 단백질을 목표 DNA 서열로 안내한다",
        "DNA를 단백질로 직접 바꾼다",
        "모든 유전자를 무작위로 제거한다"
      ],
      correct: 1,
      hint:
        "가이드 RNA에는 목표 DNA와 상보적으로 결합할 수 있는 서열이 포함됩니다.",
      explanation:
        "가이드 RNA는 목표 DNA 서열을 인식하고 Cas 단백질을 해당 위치로 안내합니다. Cas 단백질은 안내받은 위치의 DNA에 작용합니다."
    },
    {
      id: "plant-hormone",
      type: "multiple",
      category: "식물 호르몬",
      question:
        "일반적으로 식물 줄기의 신장을 촉진하고 종자의 발아에 관여하는 호르몬은 무엇일까요?",
      answers: [
        "지베렐린",
        "에틸렌",
        "앱시스산",
        "멜라토닌"
      ],
      correct: 0,
      hint:
        "BIO LAB 온실에서 작물의 성장 속도를 높이는 처리제로도 등장하는 호르몬입니다.",
      explanation:
        "지베렐린은 여러 식물에서 줄기 신장과 종자 발아 등에 관여합니다. 다만 농도가 지나치거나 식물의 상태가 적절하지 않으면 균형 잡힌 성장이 어려울 수 있습니다."
    },
    {
      id: "cell-division",
      type: "multiple",
      category: "세포 분열",
      question:
        "유사분열을 통해 하나의 모세포에서 만들어지는 딸세포의 수는 몇 개일까요?",
      answers: [
        "1개",
        "2개",
        "4개",
        "8개"
      ],
      correct: 1,
      hint:
        "유사분열에서는 한 세포가 한 번 분열합니다.",
      explanation:
        "유사분열이 완료되면 하나의 모세포에서 일반적으로 유전적으로 유사한 두 개의 딸세포가 만들어집니다."
    }
  ],

  /* ---------------------------------------------------------
     온실에서 기를 수 있는 작물
     days는 수확에 필요한 기본 성장 수치입니다.
     --------------------------------------------------------- */
  crops: [
    {
      id: "arabidopsis",
      name: "애기장대",
      icon: "🌱",
      days: 3,
      seedCost: 1,
      harvestRP: 25,
      description:
        "식물 유전학 연구에 널리 사용되는 대표적인 모델 식물입니다."
    },
    {
      id: "pea",
      name: "완두",
      icon: "🫛",
      days: 4,
      seedCost: 2,
      harvestRP: 35,
      description:
        "멘델의 유전 법칙 연구로 잘 알려진 식물입니다."
    },
    {
      id: "tomato",
      name: "토마토",
      icon: "🍅",
      days: 5,
      seedCost: 3,
      harvestRP: 50,
      description:
        "과실 발달과 숙성 과정을 관찰하기 좋은 작물입니다."
    },
    {
      id: "strawberry",
      name: "딸기",
      icon: "🍓",
      days: 6,
      seedCost: 4,
      harvestRP: 70,
      description:
        "영양 번식과 조직 배양 연구에 활용할 수 있는 작물입니다."
    }
  ],

  /* ---------------------------------------------------------
     식물 성장 처리제
     --------------------------------------------------------- */
  treatments: [
    {
      id: "water",
      name: "정제수",
      icon: "💧",
      cost: 0,
      effect: "작물이 하루 동안 기본 성장할 수 있게 합니다.",
      principle:
        "물은 광합성과 물질 운반, 세포의 팽압 유지에 필요합니다. 모든 작물 성장의 기본 조건입니다."
    },
    {
      id: "gibberellin",
      name: "지베렐린 처리제",
      icon: "🧪",
      cost: 20,
      effect: "해당 날짜의 성장 수치를 추가로 1 올립니다.",
      principle:
        "지베렐린은 여러 식물에서 줄기 신장과 종자 발아를 촉진하는 신호로 작용합니다. 게임에서는 성장 속도를 높이지만 실제 효과는 식물의 종류와 발달 단계에 따라 달라집니다."
    },
    {
      id: "auxin",
      name: "옥신 처리제",
      icon: "⚗️",
      cost: 25,
      effect: "수확 시 얻는 연구 포인트가 증가합니다.",
      principle:
        "옥신은 세포 신장, 뿌리 형성, 굴광성 등 다양한 성장 반응에 관여합니다. 조직 배양에서는 사이토키닌과의 상대적인 비율이 기관 형성에 영향을 줄 수 있습니다."
    },
    {
      id: "cytokinin",
      name: "사이토키닌 처리제",
      icon: "🔬",
      cost: 30,
      effect: "작물 수확 시 실험 재료를 추가로 얻을 수 있습니다.",
      principle:
        "사이토키닌은 세포 분열과 새싹 형성 등에 관여합니다. 조직 배양에서는 옥신과 사이토키닌의 균형이 중요합니다."
    },
    {
      id: "nitrogen",
      name: "질소 영양액",
      icon: "N",
      cost: 15,
      effect: "어린 작물의 초기 성장 수치를 추가로 1 올립니다.",
      principle:
        "질소는 아미노산과 핵산을 구성하는 중요한 원소입니다. 부족하면 생장이 저하될 수 있지만, 지나치게 많으면 잎과 줄기의 성장에 치우치고 개화나 열매 형성이 불리해질 수 있습니다."
    }
  ],

  /* ---------------------------------------------------------
     연구 포인트로 구매할 수 있는 장비
     unlockDay는 장비가 상점에 등장하는 날짜입니다.
     --------------------------------------------------------- */
  equipment: [
    {
      id: "microscope",
      name: "광학 현미경",
      icon: "🔬",
      cost: 80,
      unlockDay: 1,
      description:
        "세포와 식물 조직을 확대해 관찰합니다. 연구 기록을 더 자세하게 작성할 수 있습니다."
    },
    {
      id: "irrigation",
      name: "자동 관수 장치",
      icon: "💧",
      cost: 130,
      unlockDay: 2,
      description:
        "하루가 끝날 때 온실에 심어진 작물에 자동으로 물을 공급합니다."
    },
    {
      id: "pcr",
      name: "PCR 장비",
      icon: "DNA",
      cost: 180,
      unlockDay: 2,
      description:
        "온도 변화를 반복해 목표 DNA 구간을 증폭하는 연구 장비입니다."
    },
    {
      id: "incubator",
      name: "정밀 배양기",
      icon: "▣",
      cost: 220,
      unlockDay: 3,
      description:
        "온도와 배양 환경을 일정하게 유지해 세포 배양 연구를 돕습니다."
    },
    {
      id: "culture",
      name: "조직 배양 작업대",
      icon: "⚗️",
      cost: 280,
      unlockDay: 4,
      description:
        "식물 조직의 생장과 기관 형성을 연구할 수 있는 작업대입니다."
    },
    {
      id: "sequencer",
      name: "DNA 분석기",
      icon: "A T",
      cost: 400,
      unlockDay: 6,
      description:
        "DNA 염기서열 정보를 분석해 최종 연구에 필요한 데이터를 제공합니다."
    }
  ]
};
