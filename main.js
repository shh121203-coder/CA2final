/* ==================================================
   BIO LAB
   Main Game Logic
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const DATA = window.BIO_LAB_DATA;

  if (!DATA) {
    alert("quest.js를 불러오지 못했습니다.");
    return;
  }

  const SAVE_KEY = "bio-lab-save-v1";

  const HAIR_COLORS = {
    brown: "#563829",
    yellow: "#e6b94f",
    navy: "#27394d",
    purple: "#824663"
  };

  const COAT_COLORS = {
    white: "#f7f0d8",
    mint: "#77c3b8",
    coral: "#e99a89",
    blue: "#8fa9d6"
  };


  /* ==================================================
     기본 저장 데이터
  ================================================== */

  function createDefaultState() {
    return {
      player: {
        name: "새봄",
        hair: "brown",
        coat: "white",
        specialty: "분자생물학",
        level: 1,
        experience: 0
      },

      day: 1,
      researchPoints: 60,
      materials: 4,

      quizCompleted: [
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ],

      plots: Array.from({ length: 8 }, () => ({
        crop: null,
        age: 0,
        watered: false,
        treatment: "water",
        ready: false
      })),

      equipment: [],

      notebook: [],

      culture: {
        unlocked: false,
        active: false,
        age: 0,
        contaminated: false
      }
    };
  }

  let gameState = createDefaultState();

  let selectedPlot = 0;
  let selectedQuizAnswer = null;
  let quizResult = null;
  let currentInteractionTarget = null;
  let animationFrame = null;
  let toastTimer = null;


  /* ==================================================
     플레이어 위치와 키 입력
  ================================================== */

  const playerPosition = {
    x: 320,
    y: 275
  };

  const pressedKeys = {};

  const interactionPoints = [
    {
      id: "mina",
      name: "미나 선배",
      x: 210,
      y: 208,
      radius: 48
    },
    {
      id: "greenhouse",
      name: "재배 구역",
      x: 485,
      y: 250,
      radius: 92
    },
    {
      id: "culture",
      name: "배양 관찰대",
      x: 205,
      y: 248,
      radius: 60
    }
  ];


  /* ==================================================
     HTML 요소
  ================================================== */

  const titleScreen = document.getElementById("title-screen");
  const characterScreen = document.getElementById("character-screen");
  const gameScreen = document.getElementById("game-screen");

  const newGameButton = document.getElementById("new-game-button");
  const continueButton = document.getElementById("continue-button");
  const helpButton = document.getElementById("help-button");

  const researcherNameInput =
    document.getElementById("researcher-name");

  const previewName =
    document.getElementById("preview-name");

  const previewSpecialty =
    document.getElementById("preview-specialty");

  const characterPreview =
    document.getElementById("character-preview");

  const titleCharacter =
    document.getElementById("title-character");

  const hudCharacter =
    document.getElementById("hud-character");

  const characterBackButton =
    document.getElementById("character-back-button");

  const enterLabButton =
    document.getElementById("enter-lab-button");

  const hudPlayerName =
    document.getElementById("hud-player-name");

  const hudPlayerLevel =
    document.getElementById("hud-player-level");

  const materialCount =
    document.getElementById("material-count");

  const rpCount =
    document.getElementById("rp-count");

  const dayCount =
    document.getElementById("day-count");

  const questDay =
    document.getElementById("quest-day");

  const questTitle =
    document.getElementById("quest-title");

  const questArea =
    document.getElementById("quest-area");

  const questDescription =
    document.getElementById("quest-description");

  const questProgressBar =
    document.getElementById("quest-progress-bar");

  const questStatus =
    document.getElementById("quest-status");

  const endDayButton =
    document.getElementById("end-day-button");

  const projectComplete =
    document.getElementById("project-complete");

  const interactionGuide =
    document.getElementById("interaction-guide");

  const interactionTarget =
    document.getElementById("interaction-target");

  const canvas =
    document.getElementById("game-canvas");

  const context =
    canvas.getContext("2d");

  context.imageSmoothingEnabled = false;


  /* ==================================================
     모달
  ================================================== */

  const dialogueModal =
    document.getElementById("dialogue-modal");

  const quizModal =
    document.getElementById("quiz-modal");

  const greenhouseModal =
    document.getElementById("greenhouse-modal");

  const cultureModal =
    document.getElementById("culture-modal");

  const equipmentModal =
    document.getElementById("equipment-modal");

  const notebookModal =
    document.getElementById("notebook-modal");

  const helpModal =
    document.getElementById("help-modal");

  const menuModal =
    document.getElementById("menu-modal");


  /* ==================================================
     화면 전환
  ================================================== */

  function showScreen(screen) {
    titleScreen.classList.add("hidden");
    characterScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");

    screen.classList.remove("hidden");

    if (screen === gameScreen) {
      startGameLoop();
      updateGameInterface();
    } else {
      stopGameLoop();
    }
  }

  function openModal(modal) {
    modal.classList.remove("hidden");
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
  }

  function closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.add("hidden");
    });
  }


  /* ==================================================
     저장 및 불러오기
  ================================================== */

  function saveGame() {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(gameState)
    );

    updateContinueButton();
  }

  function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);

    if (!savedData) {
      return false;
    }

    try {
      const parsedData = JSON.parse(savedData);

      gameState = {
        ...createDefaultState(),
        ...parsedData,

        player: {
          ...createDefaultState().player,
          ...(parsedData.player || {})
        },

        culture: {
          ...createDefaultState().culture,
          ...(parsedData.culture || {})
        }
      };

      return true;
    } catch (error) {
      console.error("저장 데이터를 불러오지 못했습니다.", error);
      return false;
    }
  }

  function updateContinueButton() {
    const hasSave = Boolean(localStorage.getItem(SAVE_KEY));

    continueButton.disabled = !hasSave;
  }

  function resetGame() {
    const confirmed = confirm(
      "저장된 연구 기록을 모두 삭제할까요?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(SAVE_KEY);

    gameState = createDefaultState();

    playerPosition.x = 320;
    playerPosition.y = 275;

    closeAllModals();
    updateContinueButton();
    updateCharacterPreview();
    showScreen(titleScreen);

    showToast("저장 데이터가 초기화되었습니다.");
  }


  /* ==================================================
     캐릭터 설정
  ================================================== */

  function applyCharacterStyle(element) {
    if (!element) {
      return;
    }

    const hairColor =
      HAIR_COLORS[gameState.player.hair];

    const coatColor =
      COAT_COLORS[gameState.player.coat];

    element.style.setProperty(
      "--hair-color",
      hairColor
    );

    element.style.setProperty(
      "--coat-color",
      coatColor
    );
  }

  function updateCharacterPreview() {
    const name =
      gameState.player.name.trim() || "이름 없음";

    previewName.textContent = name;

    previewSpecialty.textContent =
      `${gameState.player.specialty} 연구원`;

    applyCharacterStyle(characterPreview);
    applyCharacterStyle(titleCharacter);
    applyCharacterStyle(hudCharacter);

    document
      .querySelectorAll("[data-hair]")
      .forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.hair ===
            gameState.player.hair
        );
      });

    document
      .querySelectorAll("[data-coat]")
      .forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.coat ===
            gameState.player.coat
        );
      });

    document
      .querySelectorAll("[data-specialty]")
      .forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.specialty ===
            gameState.player.specialty
        );
      });
  }

  researcherNameInput.addEventListener("input", (event) => {
    gameState.player.name = event.target.value;
    updateCharacterPreview();
  });

  document
    .querySelectorAll("[data-hair]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        gameState.player.hair = button.dataset.hair;
        updateCharacterPreview();
      });
    });

  document
    .querySelectorAll("[data-coat]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        gameState.player.coat = button.dataset.coat;
        updateCharacterPreview();
      });
    });

  document
    .querySelectorAll("[data-specialty]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        gameState.player.specialty =
          button.dataset.specialty;

        updateCharacterPreview();
      });
    });


  /* ==================================================
     HUD와 퀘스트 갱신
  ================================================== */

  function getCurrentDayData() {
    return DATA.days[
      Math.min(gameState.day - 1, DATA.days.length - 1)
    ];
  }

  function isCurrentQuestComplete() {
    return Boolean(
      gameState.quizCompleted[gameState.day - 1]
    );
  }

  function updateGameInterface() {
    const dayData = getCurrentDayData();
    const completed = isCurrentQuestComplete();

    hudPlayerName.textContent =
      gameState.player.name || "연구원";

    hudPlayerLevel.textContent =
      `LV.${gameState.player.level} · ` +
      gameState.player.specialty;

    materialCount.textContent =
      gameState.materials;

    rpCount.textContent =
      gameState.researchPoints;

    dayCount.textContent =
      gameState.day;

    questDay.textContent =
      gameState.day;

    questTitle.textContent =
      dayData.title;

    questArea.textContent =
      dayData.area;

    questDescription.textContent =
      dayData.description;

    if (completed) {
      questProgressBar.style.width = "100%";

      questStatus.textContent =
        `완료 · ${dayData.reward}`;

      if (gameState.day < 7) {
        endDayButton.classList.remove("hidden");
      } else {
        endDayButton.classList.add("hidden");
        projectComplete.classList.remove("hidden");
      }
    } else {
      questProgressBar.style.width = "35%";
      questStatus.textContent = "진행 중";
      endDayButton.classList.add("hidden");
      projectComplete.classList.add("hidden");
    }

    applyCharacterStyle(hudCharacter);
    renderEquipmentList();
    renderNotebook();
    updateCulturePanel();
  }


  /* ==================================================
     알림
  ================================================== */

  function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.remove("hidden");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.add("hidden");
    }, 2300);
  }


  /* ==================================================
     Canvas 지도 그리기
  ================================================== */

  function drawMap() {
    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    drawGrass();
    drawPath();
    drawLaboratory();
    drawGreenhouse();
    drawPlots();
    drawPond();
    drawCultureStation();
    drawInstalledEquipment();
    drawNPC();
    drawPlayer();
  }

  function drawGrass() {
    for (let y = 0; y < 360; y += 20) {
      for (let x = 0; x < 640; x += 20) {
        const evenTile =
          (x / 20 + y / 20) % 2 === 0;

        context.fillStyle =
          evenTile ? "#91c3a8" : "#87b99f";

        context.fillRect(x, y, 20, 20);
      }
    }

    for (let i = 0; i < 40; i += 1) {
      const x = (i * 97) % 640;
      const y = (i * 53) % 350;

      context.fillStyle = "#5d9a65";
      context.fillRect(x, y, 4, 7);
    }
  }

  function drawPath() {
    context.fillStyle = "#d6b879";
    context.fillRect(0, 247, 640, 61);
    context.fillRect(282, 80, 76, 280);

    for (let x = 0; x < 640; x += 20) {
      context.fillStyle =
        x % 40 === 0 ? "#c6a465" : "#e0c58b";

      context.fillRect(x, 266, 20, 8);
    }

    for (let y = 90; y < 360; y += 22) {
      context.fillStyle =
        y % 44 === 0 ? "#c6a465" : "#e0c58b";

      context.fillRect(299, y, 42, 6);
    }
  }

  function drawLaboratory() {
    context.fillStyle = "#593c31";
    context.fillRect(28, 47, 214, 134);

    context.fillStyle = "#c8734e";
    context.fillRect(36, 58, 198, 113);

    context.fillStyle = "#244f48";
    context.fillRect(21, 41, 228, 25);

    context.fillStyle = "#163b38";
    context.fillRect(100, 125, 51, 56);

    context.fillStyle = "#f0cc6d";
    context.fillRect(50, 91, 39, 31);
    context.fillRect(172, 91, 39, 31);

    context.fillStyle = "#fff0c6";
    context.fillRect(92, 71, 68, 35);

    context.fillStyle = "#326c61";
    context.font = "bold 13px monospace";
    context.fillText("BIO LAB", 98, 93);

    context.fillStyle = "#edbd58";
    context.fillRect(139, 151, 5, 5);
  }

  function drawGreenhouse() {
    context.fillStyle = "#295b53";
    context.fillRect(414, 80, 192, 109);

    context.fillStyle = "#a5d5c8";
    context.fillRect(422, 88, 176, 93);

    context.strokeStyle = "#477f74";
    context.lineWidth = 4;

    for (let x = 430; x < 600; x += 28) {
      context.beginPath();
      context.moveTo(x, 88);
      context.lineTo(x, 181);
      context.stroke();
    }

    context.fillStyle = "#295b53";
    context.fillRect(490, 136, 41, 45);

    context.fillStyle = "#efbd58";
    context.fillRect(519, 157, 5, 5);

    for (let x = 440; x < 585; x += 32) {
      context.fillStyle = "#4b8b52";
      context.fillRect(x, 149, 7, 24);

      context.fillStyle = "#71aa5e";
      context.fillRect(x - 7, 151, 11, 8);
      context.fillRect(x + 4, 158, 11, 8);
    }
  }

  function drawPlots() {
    gameState.plots.forEach((plot, index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);

      const x = 390 + column * 57;
      const y = 214 + row * 59;

      context.fillStyle = "#553626";
      context.fillRect(x, y, 48, 44);

      context.fillStyle =
        plot.watered ? "#493126" : "#744a31";

      context.fillRect(x + 4, y + 4, 40, 36);

      context.fillStyle = "#9d7047";

      context.fillRect(x + 7, y + 13, 34, 3);
      context.fillRect(x + 7, y + 25, 34, 3);

      if (!plot.crop) {
        return;
      }

      const cropData =
        DATA.crops.find(
          (crop) => crop.id === plot.crop
        );

      drawCropSprite(
        x + 24,
        y + 25,
        cropData,
        plot
      );
    });
  }

  function drawCropSprite(x, y, cropData, plot) {
    const growthStage =
      plot.ready ? 3 : Math.min(plot.age, 2);

    const stemHeight =
      8 + growthStage * 5;

    context.fillStyle = "#3c7749";

    context.fillRect(
      x - 2,
      y - stemHeight,
      5,
      stemHeight
    );

    context.fillStyle = "#6ba658";

    context.fillRect(
      x - 10,
      y - stemHeight + 2,
      10,
      7
    );

    if (growthStage >= 1) {
      context.fillRect(
        x + 2,
        y - stemHeight + 7,
        10,
        7
      );
    }

    if (plot.ready) {
      if (cropData.id === "tomato") {
        context.fillStyle = "#d95b45";
      } else if (cropData.id === "berry") {
        context.fillStyle = "#db4860";
      } else {
        context.fillStyle = "#edbd58";
      }

      context.fillRect(
        x - 7,
        y - stemHeight + 10,
        7,
        7
      );

      context.fillRect(
        x + 5,
        y - stemHeight + 14,
        7,
        7
      );
    }
  }

  function drawPond() {
    context.fillStyle = "#3b7d88";
    context.fillRect(29, 217, 122, 72);

    context.fillStyle = "#72b6bc";
    context.fillRect(39, 227, 102, 52);

    context.fillStyle = "#b2e0d6";
    context.fillRect(50, 238, 38, 5);
    context.fillRect(93, 257, 28, 5);
  }

  function drawCultureStation() {
    context.fillStyle = "#e7ead8";
    context.fillRect(170, 212, 73, 64);

    context.fillStyle = "#56756f";
    context.fillRect(180, 222, 53, 44);

    context.fillStyle = "#a9ddd2";
    context.fillRect(190, 230, 33, 21);

    context.fillStyle = "#edbd58";
    context.fillRect(227, 228, 3, 3);
  }

  function drawInstalledEquipment() {
    gameState.equipment.forEach(
      (equipmentId, index) => {
        const x = 258 + index * 29;
        const y = 112;

        context.fillStyle = "#27494a";
        context.fillRect(x, y, 23, 33);

        context.fillStyle = "#74c0bb";
        context.fillRect(x + 5, y + 6, 13, 14);

        context.fillStyle = "#edbd58";
        context.fillRect(x + 8, y + 25, 6, 4);
      }
    );
  }

  function drawNPC() {
    context.fillStyle = "#74472f";
    context.fillRect(202, 174, 17, 8);

    context.fillStyle = "#e9bb98";
    context.fillRect(204, 182, 13, 10);

    context.fillStyle = "#f7f0d8";
    context.fillRect(200, 192, 21, 21);

    context.fillStyle = "#2b4145";
    context.fillRect(202, 213, 7, 10);
    context.fillRect(213, 213, 7, 10);

    context.fillStyle = "#3e7762";
    context.fillRect(208, 196, 5, 7);
  }

  function drawPlayer() {
    const x = Math.round(playerPosition.x);
    const y = Math.round(playerPosition.y);

    const hair =
      HAIR_COLORS[gameState.player.hair];

    const coat =
      COAT_COLORS[gameState.player.coat];

    context.fillStyle = "rgba(20, 42, 41, 0.28)";
    context.fillRect(x - 9, y + 25, 19, 5);

    context.fillStyle = hair;
    context.fillRect(x - 8, y - 15, 17, 8);

    context.fillStyle = "#e9bb98";
    context.fillRect(x - 6, y - 7, 13, 9);

    context.fillStyle = coat;
    context.fillRect(x - 9, y + 2, 19, 20);

    context.fillStyle = "#2b4145";
    context.fillRect(x - 8, y + 22, 6, 9);
    context.fillRect(x + 3, y + 22, 6, 9);

    context.fillStyle = "#3e7762";
    context.fillRect(x - 2, y + 7, 4, 9);
  }


  /* ==================================================
     게임 루프와 이동
  ================================================== */

  function gameLoop() {
    updatePlayerMovement();
    updateInteractionTarget();
    drawMap();

    animationFrame =
      requestAnimationFrame(gameLoop);
  }

  function startGameLoop() {
    if (animationFrame) {
      return;
    }

    animationFrame =
      requestAnimationFrame(gameLoop);
  }

  function stopGameLoop() {
    if (!animationFrame) {
      return;
    }

    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  function updatePlayerMovement() {
    const speed = 2.3;

    if (
      pressedKeys.ArrowUp ||
      pressedKeys.w ||
      pressedKeys.W
    ) {
      playerPosition.y -= speed;
    }

    if (
      pressedKeys.ArrowDown ||
      pressedKeys.s ||
      pressedKeys.S
    ) {
      playerPosition.y += speed;
    }

    if (
      pressedKeys.ArrowLeft ||
      pressedKeys.a ||
      pressedKeys.A
    ) {
      playerPosition.x -= speed;
    }

    if (
      pressedKeys.ArrowRight ||
      pressedKeys.d ||
      pressedKeys.D
    ) {
      playerPosition.x += speed;
    }

    playerPosition.x = Math.max(
      12,
      Math.min(628, playerPosition.x)
    );

    playerPosition.y = Math.max(
      187,
      Math.min(340, playerPosition.y)
    );
  }

  function updateInteractionTarget() {
    let nearestTarget = null;

    interactionPoints.forEach((point) => {
      const distance = Math.hypot(
        playerPosition.x - point.x,
        playerPosition.y - point.y
      );

      if (distance <= point.radius) {
        nearestTarget = point;
      }
    });

    currentInteractionTarget = nearestTarget;

    if (nearestTarget) {
      interactionTarget.textContent =
        nearestTarget.name;

      interactionGuide.classList.remove("hidden");
    } else {
      interactionGuide.classList.add("hidden");
    }
  }

  function performInteraction() {
    if (!currentInteractionTarget) {
      showToast("상호작용할 대상에게 가까이 가세요.");
      return;
    }

    switch (currentInteractionTarget.id) {
      case "mina":
        talkToMina();
        break;

      case "greenhouse":
        openGreenhouse();
        break;

      case "culture":
        openCultureLab();
        break;
    }
  }


  /* ==================================================
     NPC 퀘스트
  ================================================== */

  function talkToMina() {
    const dayData = getCurrentDayData();
    const completed = isCurrentQuestComplete();

    const dialogueText =
      document.getElementById("dialogue-text");

    const acceptButton =
      document.getElementById("accept-quest-button");

    if (completed) {
      dialogueText.textContent =
        `오늘 연구는 완료했어. ` +
        `보상으로 ${dayData.reward}를 받았으니 ` +
        `온실과 연구 장비도 확인해 봐!`;

      acceptButton.classList.add("hidden");
    } else {
      dialogueText.textContent =
        `${gameState.player.name}, 오늘 임무는 ` +
        `‘${dayData.title}’이야. ` +
        dayData.description;

      acceptButton.classList.remove("hidden");
    }

    openModal(dialogueModal);
  }


  /* ==================================================
     퀴즈
  ================================================== */

  function openQuiz() {
    selectedQuizAnswer = null;
    quizResult = null;

    const quiz =
      DATA.quizzes[gameState.day - 1];

    document.getElementById(
      "quiz-question"
    ).textContent = quiz.question;

    const answerList =
      document.getElementById("quiz-answer-list");

    answerList.innerHTML = "";

    quiz.answers.forEach((answer, index) => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "quiz-answer-button";

      button.textContent =
        `${index + 1}. ${answer}`;

      button.addEventListener("click", () => {
        if (quizResult === "correct") {
          return;
        }

        selectedQuizAnswer = index;

        answerList
          .querySelectorAll(".quiz-answer-button")
          .forEach((answerButton) => {
            answerButton.classList.remove("selected");
          });

        button.classList.add("selected");
      });

      answerList.appendChild(button);
    });

    const feedback =
      document.getElementById("quiz-feedback");

    feedback.className = "quiz-feedback hidden";

    const submitButton =
      document.getElementById("submit-answer-button");

    submitButton.textContent = "정답 제출";

    closeModal(dialogueModal);
    openModal(quizModal);
  }

  function submitQuizAnswer() {
    const quiz =
      DATA.quizzes[gameState.day - 1];

    if (quizResult === "correct") {
      closeModal(quizModal);
      updateGameInterface();
      return;
    }

    if (selectedQuizAnswer === null) {
      showToast("정답을 하나 선택하세요.");
      return;
    }

    const feedback =
      document.getElementById("quiz-feedback");

    const feedbackTitle =
      document.getElementById("quiz-feedback-title");

    const feedbackText =
      document.getElementById("quiz-feedback-text");

    const answerButtons =
      document.querySelectorAll(
        ".quiz-answer-button"
      );

    if (selectedQuizAnswer === quiz.correct) {
      quizResult = "correct";

      feedback.className =
        "quiz-feedback correct";

      feedbackTitle.textContent =
        "정답입니다! 연구 포인트 +100";

      feedbackText.textContent =
        quiz.explanation;

      answerButtons[quiz.correct]
        .classList.add("correct-answer");

      completeCurrentQuest(quiz);

      document.getElementById(
        "submit-answer-button"
      ).textContent = "연구소로 돌아가기";
    } else {
      quizResult = "wrong";

      feedback.className =
        "quiz-feedback wrong";

      feedbackTitle.textContent =
        "아직 아니에요. 다시 생각해 봅시다.";

      feedbackText.textContent =
        quiz.hint;

      answerButtons[selectedQuizAnswer]
        .classList.add("wrong-answer");

      selectedQuizAnswer = null;
    }
  }

  function completeCurrentQuest(quiz) {
    const questIndex = gameState.day - 1;

    if (gameState.quizCompleted[questIndex]) {
      return;
    }

    gameState.quizCompleted[questIndex] = true;
    gameState.researchPoints += 100;
    gameState.materials += 2;
    gameState.player.experience += 35;

    if (gameState.player.experience >= 100) {
      gameState.player.experience -= 100;
      gameState.player.level += 1;

      showToast(
        `연구원 레벨이 ${gameState.player.level}로 올랐습니다!`
      );
    }

    if (
      !gameState.notebook.includes(
        quiz.explanation
      )
    ) {
      gameState.notebook.push(
        quiz.explanation
      );
    }

    if (gameState.day >= 3) {
      gameState.culture.unlocked = true;
    }

    saveGame();
    updateGameInterface();
  }


  /* ==================================================
     온실
  ================================================== */

  function openGreenhouse() {
    selectedPlot = 0;
    renderGreenhouse();
    openModal(greenhouseModal);
  }

  function renderGreenhouse() {
    const plotList =
      document.getElementById("plot-list");

    plotList.innerHTML = "";

    gameState.plots.forEach((plot, index) => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "plot-button";

      if (index === selectedPlot) {
        button.classList.add("selected");
      }

      if (plot.watered) {
        button.classList.add("watered");
      }

      const icon =
        document.createElement("span");

      const status =
        document.createElement("small");

      if (!plot.crop) {
        icon.textContent = "＋";
        status.textContent = "빈 재배대";
      } else {
        const crop =
          DATA.crops.find(
            (item) => item.id === plot.crop
          );

        icon.textContent = crop.icon;

        status.textContent = plot.ready
          ? "수확 가능"
          : `${plot.age}일 성장`;
      }

      button.appendChild(icon);
      button.appendChild(status);

      button.addEventListener("click", () => {
        selectedPlot = index;
        renderGreenhouse();
      });

      plotList.appendChild(button);
    });

    renderSelectedPlot();
  }

  function renderSelectedPlot() {
    const plot =
      gameState.plots[selectedPlot];

    const emptyPanel =
      document.getElementById("empty-plot-panel");

    const cropPanel =
      document.getElementById("crop-control-panel");

    if (!plot.crop) {
      emptyPanel.classList.remove("hidden");
      cropPanel.classList.add("hidden");

      renderSeedList();
      return;
    }

    emptyPanel.classList.add("hidden");
    cropPanel.classList.remove("hidden");

    const crop =
      DATA.crops.find(
        (item) => item.id === plot.crop
      );

    document.getElementById(
      "selected-crop-icon"
    ).textContent = crop.icon;

    document.getElementById(
      "selected-crop-name"
    ).textContent = crop.name;

    document.getElementById(
      "selected-crop-status"
    ).textContent = plot.ready
      ? "수확할 수 있습니다."
      : `${plot.age}일 성장 · 목표 ${crop.days}일`;

    const waterButton =
      document.getElementById("water-crop-button");

    waterButton.disabled = plot.watered;

    waterButton.textContent = plot.watered
      ? "오늘 물주기 완료"
      : "💧 물주기";

    const harvestButton =
      document.getElementById("harvest-crop-button");

    harvestButton.classList.toggle(
      "hidden",
      !plot.ready
    );

    const treatmentSelect =
      document.getElementById("treatment-select");

    treatmentSelect.innerHTML = "";

    DATA.treatments.forEach((treatment) => {
      const option =
        document.createElement("option");

      option.value = treatment.id;

      option.textContent =
        `${treatment.name} · ${treatment.effect}`;

      option.selected =
        treatment.id === plot.treatment;

      treatmentSelect.appendChild(option);
    });

    updateTreatmentExplanation();
  }

  function renderSeedList() {
    const seedList =
      document.getElementById("seed-list");

    seedList.innerHTML = "";

    DATA.crops.forEach((crop) => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "seed-button";

      const name =
        document.createElement("span");

      const description =
        document.createElement("small");

      name.textContent =
        `${crop.icon} ${crop.name}`;

      description.textContent =
        crop.description;

      button.appendChild(name);
      button.appendChild(description);

      button.addEventListener("click", () => {
        plantCrop(crop.id);
      });

      seedList.appendChild(button);
    });
  }

  function plantCrop(cropId) {
    if (gameState.materials < 1) {
      showToast("실험 재료가 부족합니다.");
      return;
    }

    gameState.materials -= 1;

    gameState.plots[selectedPlot] = {
      crop: cropId,
      age: 0,
      watered: false,
      treatment: "water",
      ready: false
    };

    saveGame();
    renderGreenhouse();
    updateGameInterface();

    showToast("종자를 심었습니다.");
  }

  function waterSelectedCrop() {
    const plot =
      gameState.plots[selectedPlot];

    if (!plot.crop || plot.watered) {
      return;
    }

    plot.watered = true;

    saveGame();
    renderGreenhouse();

    showToast("식물에 물을 주었습니다.");
  }

  function changeTreatment() {
    const plot =
      gameState.plots[selectedPlot];

    plot.treatment =
      document.getElementById(
        "treatment-select"
      ).value;

    saveGame();
    updateTreatmentExplanation();

    const treatment =
      DATA.treatments.find(
        (item) => item.id === plot.treatment
      );

    showToast(
      `${treatment.name} 처리를 설정했습니다.`
    );
  }

  function updateTreatmentExplanation() {
    const plot =
      gameState.plots[selectedPlot];

    const treatment =
      DATA.treatments.find(
        (item) => item.id === plot.treatment
      );

    document.getElementById(
      "treatment-explanation"
    ).textContent = treatment.principle;
  }

  function harvestSelectedCrop() {
    const plot =
      gameState.plots[selectedPlot];

    if (!plot.ready) {
      return;
    }

    const crop =
      DATA.crops.find(
        (item) => item.id === plot.crop
      );

    gameState.researchPoints += 35;
    gameState.materials += 2;

    gameState.plots[selectedPlot] = {
      crop: null,
      age: 0,
      watered: false,
      treatment: "water",
      ready: false
    };

    saveGame();
    renderGreenhouse();
    updateGameInterface();

    showToast(
      `${crop.name} 수확 완료 · RP +35 · 재료 +2`
    );
  }


  /* ==================================================
     배양실
  ================================================== */

  function openCultureLab() {
    updateCulturePanel();
    openModal(cultureModal);
  }

  function updateCulturePanel() {
    const title =
      document.getElementById(
        "culture-status-title"
      );

    const text =
      document.getElementById(
        "culture-status-text"
      );

    const petriDish =
      document.getElementById("petri-dish");

    if (!gameState.culture.unlocked) {
      title.textContent =
        "아직 배양 키트가 없습니다.";

      text.textContent =
        "DAY 3 퀘스트를 해결하면 효모 배양을 시작할 수 있습니다.";

      petriDish.style.opacity = "0.35";
      return;
    }

    petriDish.style.opacity = "1";

    if (gameState.culture.contaminated) {
      title.textContent =
        "배양 오염이 발견되었습니다.";

      text.textContent =
        "예상하지 못한 색과 형태의 콜로니가 나타났습니다. 위생적인 조작과 배양 조건을 다시 확인하세요.";
    } else {
      title.textContent =
        `효모 배양 · ${gameState.culture.age}일 관찰`;

      text.textContent =
        "배지의 영양분과 적절한 온도 조건에서 효모가 증식하고 있습니다.";
    }
  }


  /* ==================================================
     연구 장비
  ================================================== */

  function renderEquipmentList() {
    const list =
      document.getElementById("equipment-list");

    if (!list) {
      return;
    }

    list.innerHTML = "";

    document.getElementById(
      "shop-rp-count"
    ).textContent = gameState.researchPoints;

    DATA.equipment.forEach((equipment) => {
      const card =
        document.createElement("article");

      card.className = "equipment-card";

      const locked =
        gameState.day < equipment.unlockDay;

      const owned =
        gameState.equipment.includes(
          equipment.id
        );

      if (locked) {
        card.classList.add("locked");
      }

      const information =
        document.createElement("div");

      const title =
        document.createElement("h3");

      const description =
        document.createElement("p");

      title.textContent = equipment.name;
      description.textContent =
        equipment.description;

      information.appendChild(title);
      information.appendChild(description);

      const button =
        document.createElement("button");

      button.type = "button";

      if (owned) {
        button.textContent = "설치 완료";
        button.disabled = true;
      } else if (locked) {
        button.textContent =
          `DAY ${equipment.unlockDay} 해금`;

        button.disabled = true;
      } else {
        button.textContent =
          `${equipment.cost} RP`;

        button.addEventListener("click", () => {
          buyEquipment(equipment.id);
        });
      }

      card.appendChild(information);
      card.appendChild(button);

      list.appendChild(card);
    });
  }

  function buyEquipment(equipmentId) {
    const equipment =
      DATA.equipment.find(
        (item) => item.id === equipmentId
      );

    if (
      gameState.equipment.includes(
        equipmentId
      )
    ) {
      return;
    }

    if (
      gameState.researchPoints <
      equipment.cost
    ) {
      showToast("연구 포인트가 부족합니다.");
      return;
    }

    gameState.researchPoints -=
      equipment.cost;

    gameState.equipment.push(
      equipmentId
    );

    saveGame();
    updateGameInterface();

    showToast(
      `${equipment.name} 설치 완료!`
    );
  }


  /* ==================================================
     연구 도감
  ================================================== */

  function renderNotebook() {
    const list =
      document.getElementById("notebook-list");

    const count =
      document.getElementById("notebook-count");

    if (!list || !count) {
      return;
    }

    count.textContent =
      gameState.notebook.length;

    list.innerHTML = "";

    if (gameState.notebook.length === 0) {
      const empty =
        document.createElement("p");

      empty.className = "empty-message";

      empty.textContent =
        "퀘스트를 해결하면 실험 결과와 학습 내용이 기록됩니다.";

      list.appendChild(empty);
      return;
    }

    gameState.notebook.forEach(
      (record, index) => {
        const article =
          document.createElement("article");

        article.className =
          "notebook-record";

        const title =
          document.createElement("strong");

        const description =
          document.createElement("p");

        title.textContent =
          `RECORD ${String(index + 1).padStart(2, "0")}`;

        description.textContent = record;

        article.appendChild(title);
        article.appendChild(description);

        list.appendChild(article);
      }
    );
  }


  /* ==================================================
     다음 날
  ================================================== */

  function advanceToNextDay() {
    if (!isCurrentQuestComplete()) {
      showToast("오늘의 퀘스트를 먼저 완료하세요.");
      return;
    }

    if (gameState.day >= 7) {
      return;
    }

    growPlants();
    growCulture();

    gameState.day += 1;

    saveGame();
    updateGameInterface();

    playerPosition.x = 320;
    playerPosition.y = 275;

    showToast(
      `DAY ${gameState.day} 연구를 시작합니다.`
    );
  }

  function growPlants() {
    gameState.plots.forEach((plot) => {
      if (!plot.crop) {
        return;
      }

      let growthAmount =
        plot.watered ? 1 : 0;

      if (plot.treatment === "gibberellin") {
        growthAmount += 1;
      }

      if (
        plot.treatment === "nitrogen" &&
        plot.age < 2
      ) {
        growthAmount += 1;
      }

      plot.age += growthAmount;

      const crop =
        DATA.crops.find(
          (item) => item.id === plot.crop
        );

      plot.ready =
        plot.age >= crop.days;

      plot.watered =
        gameState.equipment.includes(
          "irrigation"
        );
    });
  }

  function growCulture() {
    if (!gameState.culture.unlocked) {
      return;
    }

    gameState.culture.active = true;
    gameState.culture.age += 1;

    if (
      gameState.culture.age > 2 &&
      !gameState.equipment.includes("incubator")
    ) {
      gameState.culture.contaminated =
        Math.random() < 0.25;
    }
  }


  /* ==================================================
     키보드
  ================================================== */

  window.addEventListener("keydown", (event) => {
    pressedKeys[event.key] = true;

    if (
      event.key === " " ||
      event.code === "Space"
    ) {
      event.preventDefault();

      if (
        document.querySelectorAll(
          ".modal:not(.hidden)"
        ).length === 0
      ) {
        performInteraction();
      }
    }

    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  window.addEventListener("keyup", (event) => {
    pressedKeys[event.key] = false;
  });


  /* ==================================================
     모바일 이동
  ================================================== */

  function connectDirectionButton(
    buttonId,
    keyName
  ) {
    const button =
      document.getElementById(buttonId);

    const startMoving = (event) => {
      event.preventDefault();
      pressedKeys[keyName] = true;
    };

    const stopMoving = (event) => {
      event.preventDefault();
      pressedKeys[keyName] = false;
    };

    button.addEventListener(
      "pointerdown",
      startMoving
    );

    button.addEventListener(
      "pointerup",
      stopMoving
    );

    button.addEventListener(
      "pointerleave",
      stopMoving
    );

    button.addEventListener(
      "pointercancel",
      stopMoving
    );
  }

  connectDirectionButton(
    "move-up",
    "ArrowUp"
  );

  connectDirectionButton(
    "move-down",
    "ArrowDown"
  );

  connectDirectionButton(
    "move-left",
    "ArrowLeft"
  );

  connectDirectionButton(
    "move-right",
    "ArrowRight"
  );


  /* ==================================================
     버튼 연결
  ================================================== */

  newGameButton.addEventListener("click", () => {
    gameState = createDefaultState();

    researcherNameInput.value =
      gameState.player.name;

    updateCharacterPreview();
    showScreen(characterScreen);
  });

  continueButton.addEventListener("click", () => {
    if (!loadGame()) {
      showToast("저장된 연구 기록이 없습니다.");
      return;
    }

    updateCharacterPreview();
    updateGameInterface();
    showScreen(gameScreen);
  });

  helpButton.addEventListener("click", () => {
    openModal(helpModal);
  });

  characterBackButton.addEventListener(
    "click",
    () => {
      showScreen(titleScreen);
    }
  );

  enterLabButton.addEventListener(
    "click",
    () => {
      const name =
        researcherNameInput.value.trim();

      if (!name) {
        showToast("연구원 이름을 입력하세요.");
        return;
      }

      gameState.player.name = name;

      saveGame();
      updateGameInterface();
      showScreen(gameScreen);

      showToast(
        `${name} 연구원, BIO LAB에 오신 것을 환영합니다!`
      );
    }
  );

  document
    .getElementById("dialogue-cancel-button")
    .addEventListener("click", () => {
      closeModal(dialogueModal);
    });

  document
    .getElementById("accept-quest-button")
    .addEventListener("click", openQuiz);

  document
    .getElementById("submit-answer-button")
    .addEventListener(
      "click",
      submitQuizAnswer
    );

  document
    .getElementById("close-quiz-button")
    .addEventListener("click", () => {
      closeModal(quizModal);
    });

  document
    .getElementById(
      "open-greenhouse-button"
    )
    .addEventListener(
      "click",
      openGreenhouse
    );

  document
    .getElementById(
      "close-greenhouse-button"
    )
    .addEventListener("click", () => {
      closeModal(greenhouseModal);
    });

  document
    .getElementById(
      "water-crop-button"
    )
    .addEventListener(
      "click",
      waterSelectedCrop
    );

  document
    .getElementById(
      "harvest-crop-button"
    )
    .addEventListener(
      "click",
      harvestSelectedCrop
    );

  document
    .getElementById(
      "treatment-select"
    )
    .addEventListener(
      "change",
      changeTreatment
    );

  document
    .getElementById(
      "open-equipment-button"
    )
    .addEventListener("click", () => {
      renderEquipmentList();
      openModal(equipmentModal);
    });

  document
    .getElementById(
      "close-equipment-button"
    )
    .addEventListener("click", () => {
      closeModal(equipmentModal);
    });

  document
    .getElementById(
      "open-notebook-button"
    )
    .addEventListener("click", () => {
      renderNotebook();
      openModal(notebookModal);
    });

  document
    .getElementById(
      "close-notebook-button"
    )
    .addEventListener("click", () => {
      closeModal(notebookModal);
    });

  document
    .getElementById(
      "close-culture-button"
    )
    .addEventListener("click", () => {
      closeModal(cultureModal);
    });

  document
    .getElementById("close-help-button")
    .addEventListener("click", () => {
      closeModal(helpModal);
    });

  document
    .getElementById("game-menu-button")
    .addEventListener("click", () => {
      openModal(menuModal);
    });

  document
    .getElementById("close-menu-button")
    .addEventListener("click", () => {
      closeModal(menuModal);
    });

  document
    .getElementById("return-title-button")
    .addEventListener("click", () => {
      closeAllModals();
      showScreen(titleScreen);
    });

  document
    .getElementById("reset-game-button")
    .addEventListener("click", resetGame);

  document
    .getElementById("mobile-action-button")
    .addEventListener(
      "click",
      performInteraction
    );

  endDayButton.addEventListener(
    "click",
    advanceToNextDay
  );


  /* ==================================================
     모달 바깥쪽 클릭
  ================================================== */

  document.querySelectorAll(".modal").forEach(
    (modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    }
  );


  /* ==================================================
     게임 시작 준비
  ================================================== */

  function initialize() {
    updateContinueButton();
    updateCharacterPreview();
    renderEquipmentList();
    renderNotebook();
    updateCulturePanel();
    drawMap();
    showScreen(titleScreen);
  }

  initialize();
});
