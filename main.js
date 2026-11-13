(() => {
  "use strict";

  const DATA = window.BIO_LAB_DATA;
  const SAVE_KEY = "bio-lab-expanded-v2";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled =false;

  const WORLD = {
    width: 3200,
    height: 2200
  };

  const keys = Object.create(null);

  const camera = {
    x: 0,
    y: 0
  };

  let selectedRole = "botanist";
  let running = false;
  let lastTime = 0;
  let toastTimer = 0;
  let zoneTimer = 0;
  let lastZone = "";
  let interactionTarget = null;

  const stations = [
  {
    id: "shop",
    name: "연구 보급소",
    x: 1510,
    y: 420,
    type: "shop"
  },
  {
    id: "scope",
    name: "현미경 관찰대",
    x: 760,
    y: 1270,
    type: "scope"
  },
  {
    id: "terminal",
    name: "연구 기록 단말기",
    x: 1570,
    y: 1020,
    type: "terminal"
  },
  {
    id: "pcr",
    name: "PCR 장비",
    x: 430,
    y: 1330,
    type: "pcr"
  },
  {
    id: "culture",
    name: "조직 배양대",
    x: 2490,
    y: 570,
    type: "culture"
  },
  {
    id: "pond",
    name: "물 표본 채취 지점",
    x: 500,
    y: 650,
    type: "pond"
  },
  {
    id: "bed",
    name: "연구원 숙소",
    x: 1560,
    y: 1990,
    type: "bed"
  },
  {
    id: "gel",
    name: "DNA 전기영동 분석기",
    x: 610,
    y: 1470,
    type: "gel"
  },
  {
    id: "sequence",
    name: "염기서열 복원 단말기",
    x: 810,
    y: 1430,
    type: "sequence"
  },
  {
    id: "enzyme",
    name: "효소 반응기",
    x: 370,
    y: 1510,
    type: "enzyme"
  },
  {
    id: "contamination",
    name: "배양 오염 검사대",
    x: 2660,
    y: 590,
    type: "contamination"
  },
  {
    id: "cross",
    name: "인공수분 교배대",
    x: 2530,
    y: 1450,
    type: "cross"
  },
  {
    id: "climate",
    name: "기후 챔버",
    x: 2870,
    y: 890,
    type: "climate"
  },
  {
    id: "field-terminal",
    name: "야외 생육 기록대",
    x: 2250,
    y: 1310,
    type: "terminal"
  }
];

const baseSamples = [
  {
    key: "s1",
    sample: "moss",
    x: 150,
    y: 260
  },
  {
    key: "s2",
    sample: "soil",
    x: 300,
    y: 510
  },
  {
    key: "s3",
    sample: "pollen",
    x: 170,
    y: 790
  },
  {
    key: "s4",
    sample: "moss",
    x: 650,
    y: 180
  },
  {
    key: "s5",
    sample: "soil",
    x: 810,
    y: 720
  },
  {
    key: "s6",
    sample: "pollen",
    x: 930,
    y: 360
  },
  {
    key: "s7",
    sample: "moss",
    x: 160,
    y: 1810
  },
  {
    key: "s8",
    sample: "soil",
    x: 520,
    y: 1930
  },
  {
    key: "s9",
    sample: "pollen",
    x: 860,
    y: 1790
  },
  {
    key: "s10",
    sample: "moss",
    x: 2120,
    y: 270
  },
  {
    key: "s11",
    sample: "soil",
    x: 2980,
    y: 570
  },
  {
    key: "s12",
    sample: "pollen",
    x: 2800,
    y: 1210
  },
  {
    key: "s13",
    sample: "soil",
    x: 2100,
    y: 1870
  },
  {
    key: "s14",
    sample: "moss",
    x: 3000,
    y: 1910
  },
  {
    key: "s15",
    sample: "pollen",
    x: 1850,
    y: 620
  },
  {
    key: "s16",
    sample: "soil",
    x: 1240,
    y: 1540
  }
];

  const treePositions = [];

/* 북서쪽 생태숲과 북동쪽 온실 외곽 */
for (let i = 0; i < 64; i++) {
  const forestSide = i % 2 === 0;

  const tree = {
    x: forestSide
      ? 65 + ((i * 137) % 870)
      : 2110 + ((i * 149) % 1000),

    y: forestSide
      ? 70 + ((i * 211) % 770)
      : 35 + ((i * 173) % 90)
  };

  /* 연못 안에는 나무를 배치하지 않음 */
  const nearPond =
    ((tree.x - 500) ** 2) / (350 ** 2) +
    ((tree.y - 520) ** 2) / (255 ** 2) < 1;

  if (!nearPond) {
    treePositions.push(tree);
  }
}

/* 남서쪽 종자 보존림 */
for (let i = 0; i < 26; i++) {
  treePositions.push({
    x: 70 + ((i * 173) % 880),
    y: 1680 + ((i * 97) % 430)
  });
}

  function newState(name, role) {
    return {
      version: 2,

      player: {
  name,
  role,
  x: 1580,
  y: 1160,
  dir: "down"
},    

      day: 1,
      minutes: 8 * 60,
      weather: "sunny",

      rp: 80,
      materials: 4,
      stamina: 100,

      inventory: {
        seeds: {
          arabidopsis: 4,
          pea: 2,
          tomato: 1,
          strawberry: 0,
          luminara: 0,
          rice: 0,
          sunflower: 0,
          saltwort: 0
        },

        treatments: {
          gibberellin: 1,
          auxin: 1,
          cytokinin: 0,
          nitrogen: 2
        },

        samples: {
          moss: 0,
          soil: 0,
          water: 0,
          pollen: 0
        }
      },

      plots: Array.from(
        { length: 12 },
        (_, id) => ({
          id,
          crop: null,
          age: 0,
          watered: false,
          treatment: null,
          health: 100,
          treatmentsUsed: 0
        })
      ),

      equipment: [],
      completedQuests: [],
      questProgress: {},

      relationships: {
        mentor: 0,
        yuna: 0,
        jin: 0,
        min: 0,
        mira: 0,
        hae: 0,
        sol: 0
      },

      discovered: [],
      collectedToday: [],
      talkedToday: [],
      visitedToday: [],
      activitiesToday: [],

      daily: null,
      notebook: [],

      totalHarvest: 0,
      totalExperiments: 0,
      unlockedPlots: 8,
      weatherLog: []
    };
  }

  let state = null;

  function normalizeState(saved) {
    const fresh = newState(
      saved?.player?.name || "새봄",
      saved?.player?.role || "botanist"
    );

    const merged = {
      ...fresh,
      ...saved
    };

    merged.player = {
      ...fresh.player,
      ...(saved.player || {})
    };

    merged.inventory = {
      seeds: {
        ...fresh.inventory.seeds,
        ...(saved.inventory?.seeds || {})
      },

      treatments: {
        ...fresh.inventory.treatments,
        ...(saved.inventory?.treatments || {})
      },

      samples: {
        ...fresh.inventory.samples,
        ...(saved.inventory?.samples || {})
      }
    };

    merged.relationships = {
      ...fresh.relationships,
      ...(saved.relationships || {})
    };

    merged.plots = Array.from(
      { length: 12 },
      (_, id) => ({
        ...fresh.plots[id],
        ...(saved.plots?.[id] || {})
      })
    );

    return merged;
  }

  function saveGame(showMessage = true) {
    if (!state) {
      return;
    }

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(state)
    );

    if (showMessage) {
      showToast("연구 기록을 저장했습니다.");
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);

      return raw
        ? normalizeState(JSON.parse(raw))
        : null;
    } catch (error) {
      return null;
    }
  }

  function startGame(loaded = null) {
    const nameInput =
      document.getElementById("player-name");

    const name =
      nameInput.value.trim() || "새봄";

    state =
      loaded ||
      newState(name, selectedRole);

    if (!state.daily) {
      setDailyTask();
    }

    document
      .getElementById("start-screen")
      .classList.remove("active");

    document
      .getElementById("game-screen")
      .classList.add("active");

    running = true;
    lastTime = performance.now();

    updateAllUI();

    announceZone(
      zoneAt(
        state.player.x,
        state.player.y
      )
    );

    requestAnimationFrame(loop);
  }

  document
    .querySelectorAll(".role-card")
    .forEach((button) => {
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".role-card")
          .forEach((card) => {
            card.classList.remove("selected");
          });

        button.classList.add("selected");
        selectedRole = button.dataset.role;
      });
    });

  document
    .getElementById("start-btn")
    .addEventListener(
      "click",
      () => startGame()
    );

  const continueButton =
    document.getElementById("continue-btn");

  const savedGame = loadGame();

  if (savedGame) {
    continueButton.classList.remove("hidden");

    continueButton.textContent =
      `${savedGame.player.name} 연구 기록 이어하기 · DAY ${savedGame.day}`;

    continueButton.addEventListener(
      "click",
      () => startGame(savedGame)
    );
  }

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " "
        ].includes(event.key)
      ) {
        event.preventDefault();
      }

      keys[event.key.toLowerCase()] = true;

      if (
        (
          event.key === " " ||
          event.key.toLowerCase() === "e"
        ) &&
        running &&
        document
          .getElementById("modal")
          .classList.contains("hidden")
      ) {
        interact();
      }
    }
  );

  window.addEventListener(
    "keyup",
    (event) => {
      keys[event.key.toLowerCase()] = false;
    }
  );

  document
    .querySelectorAll(
      "#mobile-controls [data-key]"
    )
    .forEach((button) => {
      const key =
        button.dataset.key.toLowerCase();

      const pressButton = (event) => {
        event.preventDefault();
        keys[key] = true;
      };

      const releaseButton = (event) => {
        event.preventDefault();
        keys[key] = false;
      };

      button.addEventListener(
        "pointerdown",
        pressButton
      );

      button.addEventListener(
        "pointerup",
        releaseButton
      );

      button.addEventListener(
        "pointercancel",
        releaseButton
      );

      button.addEventListener(
        "pointerleave",
        releaseButton
      );
    });

  document
    .getElementById("mobile-action")
    .addEventListener(
      "click",
      interact
    );

  document
    .getElementById("save-btn")
    .addEventListener(
      "click",
      () => saveGame()
    );

  document
    .getElementById("modal-close")
    .addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById("modal")
    .addEventListener(
      "click",
      (event) => {
        if (event.target.id === "modal") {
          closeModal();
        }
      }
    );

  document
    .querySelectorAll(".tab")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(".tab")
            .forEach((tab) => {
              tab.classList.remove("active");
            });

          button.classList.add("active");

          renderSide(
            button.dataset.tab
          );
        }
      );
    });

  function loop(now) {
    if (!running) {
      return;
    }

    const dt = Math.min(
      (now - lastTime) / 1000,
      0.05
    );

    lastTime = now;

    update(dt);
    draw();

    requestAnimationFrame(loop);
  }

  function update(dt) {
    const modalIsOpen =
      !document
        .getElementById("modal")
        .classList.contains("hidden");

    if (modalIsOpen) {
      return;
    }

    let dx = 0;
    let dy = 0;

    if (keys.arrowleft || keys.a) {
      dx -= 1;
    }

    if (keys.arrowright || keys.d) {
      dx += 1;
    }

    if (keys.arrowup || keys.w) {
      dy -= 1;
    }

    if (keys.arrowdown || keys.s) {
      dy += 1;
    }

    if (dx || dy) {
      const length =
        Math.hypot(dx, dy);

      const sprint =
        keys.shift &&
        state.stamina > 0;

      const speed =
        sprint ? 190 : 125;

      dx =
        (dx / length) *
        speed *
        dt;

      dy =
        (dy / length) *
        speed *
        dt;

      const nextX = clamp(
        state.player.x + dx,
        18,
        WORLD.width - 18
      );

      const nextY = clamp(
        state.player.y + dy,
        18,
        WORLD.height - 18
      );

      if (
        !blocked(
          nextX,
          state.player.y
        )
      ) {
        state.player.x = nextX;
      }

      if (
        !blocked(
          state.player.x,
          nextY
        )
      ) {
        state.player.y = nextY;
      }

      if (
        Math.abs(dx) >
        Math.abs(dy)
      ) {
        state.player.dir =
          dx > 0
            ? "right"
            : "left";
      } else {
        state.player.dir =
          dy > 0
            ? "down"
            : "up";
      }

      if (sprint) {
        state.stamina =
          Math.max(
            0,
            state.stamina -
              3.2 * dt
          );
      }

      state.minutes +=
        dt *
        (sprint ? 1.8 : 1.15);

      if (
        state.minutes >=
        22 * 60
      ) {
        endDay(true);
      }
    }

    camera.x = clamp(
      state.player.x -
        canvas.width / 2,
      0,
      WORLD.width -
        canvas.width
    );

    camera.y = clamp(
      state.player.y -
        canvas.height / 2,
      0,
      WORLD.height -
        canvas.height
    );

    interactionTarget =
      findNearestInteractable();

    const hint =
      document.getElementById(
        "interaction-hint"
      );

    hint.classList.toggle(
      "hidden",
      !interactionTarget
    );

    if (interactionTarget) {
      hint.textContent =
        `SPACE · ${interactionTarget.name}`;
    }

    const zone = zoneAt(
      state.player.x,
      state.player.y
    );

    if (zone !== lastZone) {
      announceZone(zone);
    }

    updateHUD();
  }

  function blocked(x, y) {
    const insidePond =
      ((x - 330) ** 2) /
        (210 ** 2) +
      ((y - 300) ** 2) /
        (130 ** 2) <
      0.78;

    if (insidePond) {
      return true;
    }

    return treePositions.some(
      (tree) =>
        Math.abs(x - tree.x) < 18 &&
        Math.abs(y - tree.y) < 20
    );
  }

  function zoneAt(x, y) {
  if (x < 1040) {
    if (y < 930) {
      return "반딧불 생태숲";
    }

    if (y < 1650) {
      return "분자생물학 연구단지";
    }

    return "종자 보존림";
  }

  if (x > 2050) {
    if (y < 790) {
      return "유리돔 스마트 온실";
    }

    if (y < 1130) {
      return "기후 관측 고원";
    }

    if (y < 1810) {
      return "대규모 시험 재배지";
    }

    return "염생식물 습지";
  }

  if (y < 620) {
    return "연구 보급거리";
  }

  if (y < 1030) {
    return "중앙 연구동";
  }

  if (y < 1420) {
    return "BIO LAB 중앙광장";
  }

  if (y < 1660) {
    return "교육·교류 정원";
  }

  return "연구원 생활마을";
}

  function announceZone(zone) {
    lastZone = zone;

    if (
      state &&
      !state.visitedToday.includes(zone)
    ) {
      state.visitedToday.push(zone);
      progressDaily("distance", 1);
    }

    document.getElementById(
      "zone-name"
    ).textContent = zone;

    const banner =
      document.getElementById(
        "zone-banner"
      );

    banner.textContent = zone;
    banner.classList.remove("hidden");

    clearTimeout(zoneTimer);

    zoneTimer = setTimeout(
      () => {
        banner.classList.add("hidden");
      },
      1500
    );
  }

  function findNearestInteractable() {
    const candidates = [];

    DATA.npcs.forEach((npc) => {
      candidates.push({
        ...npc,
        kind: "npc"
      });
    });

    stations.forEach((station) => {
      candidates.push({
        ...station,
        kind: "station"
      });
    });

    baseSamples.forEach((item) => {
      if (
        !state.collectedToday.includes(
          item.key
        )
      ) {
        const sample =
          DATA.samples.find(
            (entry) =>
              entry.id === item.sample
          );

        candidates.push({
          ...item,
          name: sample.name,
          kind: "sample"
        });
      }
    });

    for (
      let i = 0;
      i < state.unlockedPlots;
      i++
    ) {
      const pos = plotPosition(i);

      candidates.push({
        id: i,
        name:
          state.plots[i].crop
            ? "작물 확인"
            : "빈 재배지",
        x: pos.x,
        y: pos.y,
        kind: "plot"
      });
    }

    let nearest = null;
    let best = 58;

    candidates.forEach((item) => {
      const distance = Math.hypot(
        state.player.x - item.x,
        state.player.y - item.y
      );

      if (distance < best) {
        best = distance;
        nearest = item;
      }
    });

    return nearest;
  }

  function interact() {
    if (
      !running ||
      !interactionTarget ||
      !document
        .getElementById("modal")
        .classList.contains("hidden")
    ) {
      return;
    }

    const target =
      interactionTarget;

    if (target.kind === "npc") {
      talkToNpc(target);
    }

    if (target.kind === "station") {
      useStation(target);
    }

    if (target.kind === "sample") {
      collectSample(target);
    }

    if (target.kind === "plot") {
      openPlot(target.id);
    }
  }

  function talkToNpc(npc) {
    spendStamina(1);

    if (
      !state.talkedToday.includes(
        npc.id
      )
    ) {
      state.talkedToday.push(
        npc.id
      );

      state.relationships[npc.id] =
        Math.min(
          10,
          state.relationships[npc.id] +
            1
        );

      progressDaily("talk", 1);
    }

    const dayInfo =
      currentDayInfo();

    const quest =
      DATA.quests[dayInfo.quest];

    const completed =
      state.completedQuests.includes(
        questKey()
      );

    if (
      !completed &&
      quest.npc === npc.id
    ) {
      if (quest.type === "quiz") {
        return openQuiz(
          quest.quizCategory,
          npc
        );
      }

      if (
        [
          "collect",
          "harvest",
          "care",
          "pond",
          "activities"
        ].includes(quest.type)
      ) {
        const progress =
          questProgressValue(
            quest.type
          );

        if (
          progress >=
          (quest.target || 1)
        ) {
          return completeMainQuest(
            npc
          );
        }

        return openModal(
          npc.name,
          `
            <p class="dialogue-name">
              ${npc.title}
            </p>

            <p class="dialogue-text">
              ${questPrompt(
                quest,
                progress
              )}
            </p>

            <div class="feedback">
              진행도
              ${progress}/
              ${quest.target || 1}
            </div>
          `
        );
      }

      if (
        quest.type ===
        "minigame"
      ) {
        return openMinigame(
          quest.game,
          true
        );
      }
    }

    const line =
      npc.dialogue[
        (
          state.day +
          state.relationships[npc.id]
        ) %
          npc.dialogue.length
      ];

    const bonus =
      state.relationships[npc.id] >= 5
        ? `
          <p class="feedback correct">
            호감도가 높아져 연구 재료를
            1개 받았습니다.
          </p>
        `
        : "";

    if (
      state.relationships[npc.id] === 5 &&
      !state.notebook.includes(
        `friend-${npc.id}`
      )
    ) {
      state.notebook.push(
        `friend-${npc.id}`
      );

      state.materials += 1;
    }

    openModal(
      npc.name,
      `
        <p class="dialogue-name">
          ${npc.title}
        </p>

        <p class="dialogue-text">
          ${line}
        </p>

        ${bonus}
      `
    );
  }

  function questPrompt(
    quest,
    progress
  ) {
    const messages = {
      collect:
        `숲과 길가에서 빛나는 표본을 찾아 줘. 오늘 아직 ${Math.max(
          0,
          quest.target - progress
        )}개가 더 필요해.`,

      harvest:
        "온실에서 씨앗을 심고 매일 물을 준 뒤 다 자란 작물을 수확해 줘.",

      care:
        "폭염에는 작물이 더 많은 관리를 필요로 해. 건강한 작물에 물을 공급해 줘.",

      pond:
        "연구 연못 남쪽 채취 지점에서 물 표본을 가져와 줘.",

      activities:
        "채집·재배·대화·실험 중 서로 다른 활동 세 가지를 완료해 줘."
    };

    return (
      messages[quest.type] ||
      "연구 목표를 확인해 줘."
    );
  }

  function questProgressValue(type) {
    if (type === "collect") {
      return totalSamples();
    }

    if (type === "harvest") {
      return (
        state.questProgress[
          questKey() + "-harvest"
        ] || 0
      );
    }

    if (type === "care") {
      return (
        state.questProgress[
          questKey() + "-water"
        ] || 0
      );
    }

    if (type === "pond") {
      return (
        state.inventory.samples.water ||
        0
      );
    }

    if (type === "activities") {
      return new Set(
        state.activitiesToday
      ).size;
    }

    return 0;
  }

  function useStation(station) {
    if (station.type === "shop") {
      openShop();
    }

    if (station.type === "terminal") {
      openResearchTerminal();
    }

    if (station.type === "bed") {
      confirmEndDay();
    }

    if (station.type === "pond") {
      collectPondWater();
    }

    if (
      [
        "pcr",
        "scope",
        "culture"
      ].includes(station.type)
    ) {
      const required =
        station.type === "scope"
          ? "microscope"
          : station.type === "pcr"
            ? "pcr"
            : "incubator";

      if (
        !state.equipment.includes(
          required
        )
      ) {
        const equipment =
          DATA.equipment.find(
            (item) =>
              item.id === required
          );

        openModal(
          station.name,
          `
            <p class="dialogue-text">
              이 장비는 아직 사용할 수
              없습니다. 연구 보급소에서
              <strong>
                ${equipment.name}
              </strong>
              을 구입하세요.
            </p>
          `
        );
      } else {
        openMinigame(
          station.type,
          false
        );
      }
    }
  }

  function collectSample(target) {
    if (!spendStamina(5)) {
      return;
    }

    const sample =
      DATA.samples.find(
        (item) =>
          item.id === target.sample
      );

    state.collectedToday.push(
      target.key
    );

    state.inventory.samples[
      target.sample
    ] += 1;

    if (
      !state.discovered.includes(
        target.sample
      )
    ) {
      state.discovered.push(
        target.sample
      );

      state.notebook.push(
        `sample-${target.sample}`
      );

      state.rp += 12;
    }

    markActivity("collect");
    progressDaily("collect", 1);

    showToast(
      `${sample.name} 채집 · ${sample.fact}`
    );

    updateAllUI();
  }

  function collectPondWater() {
    if (!spendStamina(6)) {
      return;
    }

    state.inventory.samples.water += 1;

    if (
      !state.discovered.includes(
        "water"
      )
    ) {
      state.discovered.push(
        "water"
      );
    }

    markActivity("collect");
    progressDaily("collect", 1);

    showToast(
      "연못 물 표본을 채취했습니다."
    );

    updateAllUI();
  }

  function openPlot(index) {
    const plot =
      state.plots[index];

    if (!plot.crop) {
      return openSeedSelection(
        index
      );
    }

    const crop =
      DATA.crops.find(
        (item) =>
          item.id === plot.crop
      );

    const ready =
      plot.age >= crop.grow;

    const growthPercent =
      Math.min(
        100,
        Math.round(
          (
            plot.age /
            crop.grow
          ) * 100
        )
      );

    let buttons = "";

    if (
      !plot.watered &&
      !ready
    ) {
      buttons += `
        <button
          class="pixel-button primary"
          data-plot-action="water"
        >
          물 주기 · 체력 4
        </button>
      `;
    }

    if (!ready) {
      buttons += `
        <button
          class="pixel-button"
          data-plot-action="treat"
        >
          처리제 사용
        </button>
      `;
    }

    if (ready) {
      buttons += `
        <button
          class="pixel-button primary"
          data-plot-action="harvest"
        >
          수확하기 · 체력 5
        </button>
      `;
    }

    buttons += `
      <button
        class="pixel-button danger"
        data-plot-action="remove"
      >
        작물 정리
      </button>
    `;

    openModal(
      `${crop.name} 재배 기록`,
      `
        <p>${crop.note}</p>

        <div class="progress-track">
          <i
            style="width:
            ${growthPercent}%"
          ></i>
        </div>

        <p>
          성장 ${plot.age}/${crop.grow}
          · 건강도 ${plot.health}
          ·
          ${
            plot.watered
              ? "오늘 물 공급 완료"
              : "물이 필요함"
          }
        </p>

        <p>
          최근 처리:
          ${
            plot.treatment
              ? treatmentName(
                  plot.treatment
                )
              : "없음"
          }
        </p>

        <div class="modal-actions">
          ${buttons}
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-plot-action]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            handlePlotAction(
              index,
              button.dataset.plotAction
            );
          }
        );
      });
  }

  function openSeedSelection(index) {
    const available =
      DATA.crops.filter(
        (crop, cropIndex) =>
          cropIndex < 4 ||
          (
            cropIndex === 4 &&
            state.equipment.includes(
              "greenhouse2"
            )
          ) ||
          (
            cropIndex >= 5 &&
            state.equipment.includes(
              "seedbank"
            )
          )
      );

    openModal(
      "씨앗 선택",
      `
        <div class="crop-grid">
          ${available
            .map(
              (crop) => `
                <article
                  class="crop-card"
                >
                  <h3>
                    ${crop.name}
                  </h3>

                  <p>
                    ${crop.note}
                  </p>

                  <p>
                    성장 ${crop.grow}일
                    · 보유
                    ${
                      state.inventory
                        .seeds[
                          crop.id
                        ] || 0
                    }
                  </p>

                  <button
                    class="pixel-button"
                    data-seed="${crop.id}"
                    ${
                      (
                        state.inventory
                          .seeds[
                            crop.id
                          ] || 0
                      ) < 1
                        ? "disabled"
                        : ""
                    }
                  >
                    심기
                  </button>
                </article>
              `
            )
            .join("")}
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-seed]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            plantSeed(
              index,
              button.dataset.seed
            );
          }
        );
      });
  }

  function plantSeed(
    index,
    cropId
  ) {
    if (!spendStamina(3)) {
      return;
    }

    if (
      (
        state.inventory.seeds[
          cropId
        ] || 0
      ) < 1
    ) {
      return;
    }

    state.inventory.seeds[
      cropId
    ] -= 1;

    state.plots[index] = {
      id: index,
      crop: cropId,
      age: 0,
      watered: false,
      treatment: null,
      health: 100,
      treatmentsUsed: 0
    };

    markActivity("plant");
    progressDaily("plant", 1);

    closeModal();

    showToast(
      `${cropName(cropId)} 씨앗을 심었습니다.`
    );

    updateAllUI();
  }

  function handlePlotAction(
    index,
    action
  ) {
    const plot =
      state.plots[index];

    if (action === "water") {
      const staminaCost =
        state.weather === "heat"
          ? 6
          : 4;

      if (
        !spendStamina(
          staminaCost
        )
      ) {
        return;
      }

      plot.watered = true;

      markActivity("water");
      progressDaily("water", 1);

      const progressKey =
        questKey() + "-water";

      state.questProgress[
        progressKey
      ] =
        (
          state.questProgress[
            progressKey
          ] || 0
        ) + 1;

      closeModal();

      showToast(
        "물을 공급했습니다. 토양 수분이 회복됩니다."
      );
    }

    if (action === "treat") {
      return openTreatmentSelection(
        index
      );
    }

    if (action === "harvest") {
      harvestPlot(index);
    }

    if (action === "remove") {
      state.plots[index] = {
        id: index,
        crop: null,
        age: 0,
        watered: false,
        treatment: null,
        health: 100,
        treatmentsUsed: 0
      };

      closeModal();
    }

    updateAllUI();
  }
    function openTreatmentSelection(index) {
    openModal(
      "성장 조건 선택",
      `
        <div class="shop-grid">
          ${DATA.treatments
            .slice(1)
            .map(
              (item) => `
                <article class="shop-card">
                  <h3>${item.name}</h3>
                  <p>${item.description}</p>
                  <p>
                    보유
                    ${
                      state.inventory
                        .treatments[
                          item.id
                        ] || 0
                    }
                  </p>

                  <button
                    class="pixel-button"
                    data-treatment="${item.id}"
                    ${
                      (
                        state.inventory
                          .treatments[
                            item.id
                          ] || 0
                      ) < 1
                        ? "disabled"
                        : ""
                    }
                  >
                    사용
                  </button>
                </article>
              `
            )
            .join("")}
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-treatment]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            applyTreatment(
              index,
              button.dataset.treatment
            );
          }
        );
      });
  }

  function applyTreatment(
    index,
    id
  ) {
    const plot =
      state.plots[index];

    if (
      (
        state.inventory
          .treatments[id] || 0
      ) < 1
    ) {
      return;
    }

    state.inventory
      .treatments[id] -= 1;

    plot.treatment = id;
    plot.treatmentsUsed += 1;

    if (
      id === "gibberellin"
    ) {
      plot.age += 1;

      plot.health = Math.max(
        45,
        plot.health - 5
      );
    }

    if (
      id === "nitrogen" &&
      plot.age <= 1
    ) {
      plot.age += 1;
    }

    state.notebook.push(
      `treatment-${id}-${state.day}`
    );

    markActivity("experiment");
    progressDaily("treatment", 1);

    closeModal();

    showToast(
      `${treatmentName(id)} 처리 완료. 조건에 따른 변화를 기록했습니다.`
    );

    updateAllUI();
  }

  function harvestPlot(index) {
    const plot =
      state.plots[index];

    const crop =
      DATA.crops.find(
        (item) =>
          item.id === plot.crop
      );

    if (
      !crop ||
      plot.age < crop.grow ||
      !spendStamina(5)
    ) {
      return;
    }

    let reward =
      Math.round(
        crop.reward *
        (
          plot.health / 100
        )
      );

    if (
      plot.treatment === "auxin"
    ) {
      reward = Math.round(
        reward * 1.2
      );
    }

    if (
      plot.treatment === "nitrogen" &&
      plot.treatmentsUsed > 1
    ) {
      reward = Math.round(
        reward * 0.8
      );
    }

    if (
      state.player.role ===
      "botanist"
    ) {
      reward = Math.round(
        reward * 1.1
      );
    }

    state.rp += reward;

    state.materials +=
      1 +
      (
        plot.treatment ===
        "cytokinin"
          ? 1
          : 0
      );

    state.totalHarvest += 1;

    const progressKey =
      questKey() + "-harvest";

    state.questProgress[
      progressKey
    ] =
      (
        state.questProgress[
          progressKey
        ] || 0
      ) + 1;

    progressDaily(
      "harvest",
      1
    );

    markActivity("harvest");

    state.notebook.push(
      `crop-${crop.id}-${state.day}`
    );

    state.plots[index] = {
      id: index,
      crop: null,
      age: 0,
      watered: false,
      treatment: null,
      health: 100,
      treatmentsUsed: 0
    };

    closeModal();

    showToast(
      `${crop.name} 수확 · ${reward} RP와 연구 재료를 획득했습니다.`
    );

    updateAllUI();
  }

  function openShop() {
    const seedCards =
      DATA.crops
        .map(
          (crop, index) => {
            const locked =
              (
                index === 4 &&
                !state.equipment.includes(
                  "greenhouse2"
                )
              ) ||
              (
                index >= 5 &&
                !state.equipment.includes(
                  "seedbank"
                )
              );

            return `
              <article
                class="shop-card
                ${
                  locked
                    ? "locked"
                    : ""
                }"
              >
                <h3>
                  ${crop.name} 씨앗
                </h3>

                <p>${crop.note}</p>

                <p>
                  재료
                  ${crop.seedCost}
                </p>

                <button
                  class="pixel-button"
                  data-buy-seed="${crop.id}"
                  ${
                    locked
                      ? "disabled"
                      : ""
                  }
                >
                  구입
                </button>
              </article>
            `;
          }
        )
        .join("");

    const treatmentCards =
      DATA.treatments
        .slice(1)
        .map(
          (item) => `
            <article
              class="shop-card"
            >
              <h3>
                ${item.name}
              </h3>

              <p>
                ${item.description}
              </p>

              <p>
                ${item.cost} RP
              </p>

              <button
                class="pixel-button"
                data-buy-treatment="${item.id}"
              >
                구입
              </button>
            </article>
          `
        )
        .join("");

    const equipmentCards =
      DATA.equipment
        .filter(
          (item) =>
            item.day <=
            state.day
        )
        .map((item) => {
          const owned =
            state.equipment.includes(
              item.id
            );

          return `
            <article
              class="shop-card
              ${
                owned
                  ? "locked"
                  : ""
              }"
            >
              <h3>
                ${item.name}
              </h3>

              <p>
                ${item.description}
              </p>

              <p>
                ${equipmentPrice(
                  item
                )} RP
              </p>

              <button
                class="pixel-button"
                data-buy-equipment="${item.id}"
                ${
                  owned
                    ? "disabled"
                    : ""
                }
              >
                ${
                  owned
                    ? "보유 중"
                    : "구입"
                }
              </button>
            </article>
          `;
        })
        .join("");

    openModal(
      "연구 보급소",
      `
        <h3>씨앗</h3>

        <div class="shop-grid">
          ${seedCards}
        </div>

        <h3>처리제</h3>

        <div class="shop-grid">
          ${treatmentCards}
        </div>

        <h3>연구 장비</h3>

        <div class="shop-grid">
          ${equipmentCards}
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-buy-seed]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            buySeed(
              button.dataset
                .buySeed
            );
          }
        );
      });

    document
      .querySelectorAll(
        "[data-buy-treatment]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            buyTreatment(
              button.dataset
                .buyTreatment
            );
          }
        );
      });

    document
      .querySelectorAll(
        "[data-buy-equipment]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            buyEquipment(
              button.dataset
                .buyEquipment
            );
          }
        );
      });
  }

  function buySeed(id) {
    const crop =
      DATA.crops.find(
        (item) =>
          item.id === id
      );

    if (
      state.materials <
      crop.seedCost
    ) {
      return showToast(
        "실험 재료가 부족합니다."
      );
    }

    state.materials -=
      crop.seedCost;

    state.inventory.seeds[id] =
      (
        state.inventory
          .seeds[id] || 0
      ) + 2;

    openShop();
    updateAllUI();
  }

  function buyTreatment(id) {
    const item =
      DATA.treatments.find(
        (treatment) =>
          treatment.id === id
      );

    if (
      state.rp < item.cost
    ) {
      return showToast(
        "RP가 부족합니다."
      );
    }

    state.rp -= item.cost;

    state.inventory
      .treatments[id] =
      (
        state.inventory
          .treatments[id] || 0
      ) + 1;

    openShop();
    updateAllUI();
  }

  function buyEquipment(id) {
    const item =
      DATA.equipment.find(
        (equipment) =>
          equipment.id === id
      );

    const price =
      equipmentPrice(item);

    if (state.rp < price) {
      return showToast(
        "RP가 부족합니다."
      );
    }

    state.rp -= price;

    state.equipment.push(id);

    if (
      id === "greenhouse2"
    ) {
      state.unlockedPlots = 12;

      state.inventory
        .seeds.luminara += 2;
    }

    if (
      id === "seedbank"
    ) {
      state.inventory
        .seeds.rice += 2;

      state.inventory
        .seeds.sunflower += 2;

      state.inventory
        .seeds.saltwort += 2;
    }

    openShop();
    updateAllUI();

    showToast(
      `${item.name}을 설치했습니다.`
    );
  }

  function equipmentPrice(item) {
    const discount =
      state.player.role ===
      "engineer"
        ? 0.9
        : 1;

    return Math.round(
      item.cost * discount
    );
  }

  function openQuiz(
    category,
    npc
  ) {
    const pool =
      DATA.quizzes.filter(
        (quiz) =>
          quiz.category ===
          category
      );

    const quiz =
      pool[
        (
          state.day +
          state.totalExperiments
        ) %
          pool.length
      ];

    const choices =
      quiz.answers
        .map(
          (answer, index) => ({
            answer,
            original: index
          })
        )
        .sort(
          () =>
            Math.random() - 0.5
        );

    openModal(
      `${category} 연구 질문`,
      `
        <p class="dialogue-name">
          ${npc.name}
        </p>

        <p class="dialogue-text">
          ${quiz.question}
        </p>

        <div class="choice-grid">
          ${choices
            .map(
              (choice) => `
                <button
                  class="choice-button"
                  data-answer="${choice.original}"
                >
                  ${choice.answer}
                </button>
              `
            )
            .join("")}
        </div>

        <div id="quiz-feedback">
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-answer]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            answerQuiz(
              quiz,
              Number(
                button.dataset.answer
              ),
              npc
            );
          }
        );
      });
  }

  function answerQuiz(
    quiz,
    answer,
    npc
  ) {
    const feedback =
      document.getElementById(
        "quiz-feedback"
      );

    document
      .querySelectorAll(
        "[data-answer]"
      )
      .forEach((button) => {
        button.disabled = true;
      });

    if (
      answer === quiz.correct
    ) {
      const reward =
        Math.round(
          25 *
          (
            state.player.role ===
            "molecular"
              ? 1.1
              : 1
          )
        );

      state.rp += reward;

      state.notebook.push(
        `quiz-${quiz.category}-${state.day}`
      );

      progressDaily("quiz", 1);
      markActivity("quiz");

      feedback.innerHTML = `
        <div
          class="feedback correct"
        >
          <strong>정답!</strong>
          <br>
          ${quiz.explanation}
          <br>
          +${reward} RP
        </div>

        <div class="modal-actions">
          <button
            id="quiz-complete"
            class="pixel-button primary"
          >
            연구 보고
          </button>
        </div>
      `;

      document
        .getElementById(
          "quiz-complete"
        )
        .addEventListener(
          "click",
          () => {
            completeMainQuest(
              npc
            );
          }
        );
    } else {
      feedback.innerHTML = `
        <div
          class="feedback wrong"
        >
          <strong>
            다시 관찰해 보세요.
          </strong>
          <br>
          ${quiz.hint}
        </div>

        <div class="modal-actions">
          <button
            id="quiz-retry"
            class="pixel-button"
          >
            다시 풀기
          </button>
        </div>
      `;

      document
        .getElementById(
          "quiz-retry"
        )
        .addEventListener(
          "click",
          () => {
            openQuiz(
              quiz.category,
              npc
            );
          }
        );
    }

    updateAllUI();
  }

  function openMinigame(
    type,
    mainQuest
  ) {
    if (type === "pcr") {
      return openPcrGame(
        mainQuest
      );
    }

    if (type === "scope") {
      return openScopeGame(
        mainQuest
      );
    }

    if (type === "culture") {
      return openCultureGame(
        mainQuest
      );
    }

    if (
      type ===
      "contamination"
    ) {
      return openContaminationGame(
        mainQuest
      );
    }

    if (type === "cross") {
      return openCrossGame(
        mainQuest
      );
    }

    if (type === "enzyme") {
      return openEnzymeGame(
        mainQuest
      );
    }

    if (type === "climate") {
      return openClimateGame(
        mainQuest
      );
    }

    if (type === "gel") {
      return openGelGame(
        mainQuest
      );
    }

    if (type === "sequence") {
      return openSequenceGame(
        mainQuest
      );
    }
  }

  function openCrossGame(
    mainQuest
  ) {
    openModal(
      "인공수분 교배 기록",
      `
        <p>
          보라색 꽃 대립유전자 P가
          흰색 p에 대해 완전 우성이라고
          가정합니다.
          Pp와 Pp를 교배할 때
          흰색 꽃 표현형의 예상 비율을
          선택하세요.
        </p>

        <div class="choice-grid">
          <button
            class="choice-button"
            data-cross="0"
          >
            0%
          </button>

          <button
            class="choice-button"
            data-cross="25"
          >
            25%
          </button>

          <button
            class="choice-button"
            data-cross="50"
          >
            50%
          </button>

          <button
            class="choice-button"
            data-cross="75"
          >
            75%
          </button>
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-cross]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            finishExperiment(
              Number(
                button.dataset.cross
              ) === 25,
              "Pp × Pp의 유전자형 비는 PP:Pp:pp = 1:2:1이므로 흰색 pp 표현형은 25%로 예상됩니다.",
              mainQuest
            );
          }
        );
      });
  }

  function openEnzymeGame(
    mainQuest
  ) {
    const target = 37;

    openModal(
      "효소 활성 조건",
      `
        <p>
          효소의 활성이 가장 높은
          온도를 찾아 반응기를 조절하세요.
          너무 낮으면 반응이 느리고,
          지나치게 높으면 단백질 구조가
          변할 수 있습니다.
        </p>

        <div class="range-wrap">
          <label>
            온도
            <strong id="enzyme-value">
              20
            </strong>℃
          </label>

          <input
            id="enzyme-range"
            type="range"
            min="5"
            max="70"
            value="20"
          >

          <div class="progress-track">
            <i
              id="enzyme-activity"
              style="width:35%"
            ></i>
          </div>
        </div>

        <div class="modal-actions">
          <button
            id="enzyme-check"
            class="pixel-button primary"
          >
            반응 시작
          </button>
        </div>
      `
    );

    const range =
      document.getElementById(
        "enzyme-range"
      );

    range.addEventListener(
      "input",
      () => {
        const value =
          Number(range.value);

        const activity =
          Math.max(
            5,
            100 -
            Math.abs(
              value - target
            ) * 4
          );

        document.getElementById(
          "enzyme-value"
        ).textContent = value;

        document.getElementById(
          "enzyme-activity"
        ).style.width =
          `${activity}%`;
      }
    );

    document
      .getElementById(
        "enzyme-check"
      )
      .addEventListener(
        "click",
        () => {
          finishExperiment(
            Math.abs(
              Number(range.value) -
              target
            ) <= 4,
            "효소마다 최적 온도가 다르며, 온도는 분자 운동과 단백질 구조 안정성에 영향을 줍니다.",
            mainQuest
          );
        }
      );
  }

  function openClimateGame(
    mainQuest
  ) {
    openModal(
      "기후 챔버",
      `
        <p>
          어린 토마토가 폭염 피해를
          받지 않도록 온도와 토양 수분을
          조절하세요.
        </p>

        <div class="range-wrap">
          <label>
            온도
            <strong
              id="climate-temp-value"
            >
              38
            </strong>℃
          </label>

          <input
            id="climate-temp"
            type="range"
            min="10"
            max="50"
            value="38"
          >

          <label>
            토양 수분
            <strong
              id="climate-water-value"
            >
              25
            </strong>%
          </label>

          <input
            id="climate-water"
            type="range"
            min="0"
            max="100"
            value="25"
          >
        </div>

        <div class="modal-actions">
          <button
            id="climate-check"
            class="pixel-button primary"
          >
            24시간 관찰
          </button>
        </div>
      `
    );

    const temp =
      document.getElementById(
        "climate-temp"
      );

    const water =
      document.getElementById(
        "climate-water"
      );

    temp.addEventListener(
      "input",
      () => {
        document.getElementById(
          "climate-temp-value"
        ).textContent =
          temp.value;
      }
    );

    water.addEventListener(
      "input",
      () => {
        document.getElementById(
          "climate-water-value"
        ).textContent =
          water.value;
      }
    );

    document
      .getElementById(
        "climate-check"
      )
      .addEventListener(
        "click",
        () => {
          const temperature =
            Number(temp.value);

          const moisture =
            Number(water.value);

          const success =
            temperature >= 22 &&
            temperature <= 29 &&
            moisture >= 50 &&
            moisture <= 75;

          finishExperiment(
            success,
            "적절한 온도와 수분 범위는 식물의 광합성, 효소 활성, 기공 조절과 세포의 수분 상태를 안정시키는 데 중요합니다.",
            mainQuest
          );
        }
      );
  }

  function openGelGame(
    mainQuest
  ) {
    const lanes = [
      "위쪽의 굵은 밴드",
      "가운데의 단일 밴드",
      "아래쪽의 두 밴드",
      "밴드 없음"
    ];

    openModal(
      "DNA 전기영동 판독",
      `
        <p>
          목표 DNA 조각은 대조군보다
          작습니다. 작은 DNA 조각이
          더 멀리 이동했다면 어떤 결과를
          선택해야 할까요?
        </p>

        <div class="choice-grid">
          ${lanes
            .map(
              (lane, index) => `
                <button
                  class="choice-button"
                  data-gel="${index}"
                >
                  레인 ${index + 1}
                  · ${lane}
                </button>
              `
            )
            .join("")}
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-gel]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            finishExperiment(
              Number(
                button.dataset.gel
              ) === 2,
              "겔 전기영동에서는 일반적으로 더 작은 DNA 조각이 겔 안에서 더 멀리 이동합니다.",
              mainQuest
            );
          }
        );
      });
  }

  function openSequenceGame(
    mainQuest
  ) {
    const template =
      "5′-ATGCC-3′";

    const options = [
      "3′-TACGG-5′",
      "5′-TACGG-3′",
      "3′-UACGG-5′",
      "3′-ATGCC-5′"
    ];

    openModal(
      "상보 서열 복원",
      `
        <p>
          손상된 기록의 주형 가닥은
          <strong>
            ${template}
          </strong>
          입니다. 정확한 상보 가닥을
          선택하세요.
        </p>

        <div class="choice-grid">
          ${options
            .map(
              (option, index) => `
                <button
                  class="choice-button"
                  data-sequence="${index}"
                >
                  ${option}
                </button>
              `
            )
            .join("")}
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-sequence]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            finishExperiment(
              Number(
                button.dataset
                  .sequence
              ) === 0,
              "DNA 염기쌍은 A-T, G-C이며 두 가닥은 서로 반대 방향으로 배열됩니다.",
              mainQuest
            );
          }
        );
      });
  }

  function openPcrGame(
    mainQuest
  ) {
    const stages = [
      "변성",
      "결합",
      "신장"
    ].sort(
      () =>
        Math.random() - 0.5
    );

    const chosen = [];

    openModal(
      "PCR 온도 순환",
      `
        <p>
          DNA 증폭의 세 단계를
          올바른 순서로 선택하세요.
        </p>

        <div class="sequence-buttons">
          ${stages
            .map(
              (stage) => `
                <button
                  data-stage="${stage}"
                >
                  ${stage}
                </button>
              `
            )
            .join("")}
        </div>

        <div
          id="sequence-result"
          class="sequence-result"
        >
          선택한 순서: -
        </div>

        <div class="modal-actions">
          <button
            id="sequence-reset"
            class="pixel-button"
          >
            초기화
          </button>
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-stage]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            if (
              chosen.includes(
                button.dataset.stage
              )
            ) {
              return;
            }

            chosen.push(
              button.dataset.stage
            );

            button.disabled = true;

            document.getElementById(
              "sequence-result"
            ).textContent =
              `선택한 순서: ${chosen.join(
                " → "
              )}`;

            if (
              chosen.length === 3
            ) {
              finishExperiment(
                chosen.join(",") ===
                "변성,결합,신장",
                "PCR은 변성 → 결합 → 신장 순서입니다.",
                mainQuest
              );
            }
          }
        );
      });

    document
      .getElementById(
        "sequence-reset"
      )
      .addEventListener(
        "click",
        () => {
          openPcrGame(
            mainQuest
          );
        }
      );
  }

  function openScopeGame(
    mainQuest
  ) {
    const target =
      62 +
      (
        (state.day * 7) %
        22
      );

    openModal(
      "현미경 초점 맞추기",
      `
        <p>
          조절 나사를 움직여 가장
          선명한 초점을 찾으세요.
          표본마다 위치가 다릅니다.
        </p>

        <div class="range-wrap">
          <label>
            초점
            <strong
              id="focus-value"
            >
              35
            </strong>
          </label>

          <input
            id="focus-range"
            type="range"
            min="0"
            max="100"
            value="35"
          >

          <div class="progress-track">
            <i
              id="clarity"
              style="width:15%"
            ></i>
          </div>

          <p id="clarity-text">
            세포의 윤곽이 흐립니다.
          </p>
        </div>

        <div class="modal-actions">
          <button
            id="focus-check"
            class="pixel-button primary"
          >
            관찰 기록
          </button>
        </div>
      `
    );

    const range =
      document.getElementById(
        "focus-range"
      );

    range.addEventListener(
      "input",
      () => {
        const difference =
          Math.abs(
            Number(range.value) -
            target
          );

        const clarity =
          Math.max(
            4,
            100 -
            difference * 3
          );

        document.getElementById(
          "focus-value"
        ).textContent =
          range.value;

        document.getElementById(
          "clarity"
        ).style.width =
          `${clarity}%`;

        document.getElementById(
          "clarity-text"
        ).textContent =
          clarity > 80
            ? "핵과 세포 경계가 선명하게 보입니다."
            : clarity > 45
              ? "형태가 보이지만 아직 흐립니다."
              : "초점이 맞지 않습니다.";
      }
    );

    document
      .getElementById(
        "focus-check"
      )
      .addEventListener(
        "click",
        () => {
          const success =
            Math.abs(
              Number(range.value) -
              target
            ) <= 7;

          finishExperiment(
            success,
            "초점은 표본과 대물렌즈 사이의 거리에 따라 달라집니다.",
            mainQuest
          );
        }
      );
  }

  function openCultureGame(
    mainQuest
  ) {
    const target =
      state.day % 2
        ? "root"
        : "shoot";

    openModal(
      "조직 배양 조건",
      `
        <p>
          ${
            target === "root"
              ? "뿌리"
              : "새싹"
          }
          형성을 유도하도록 호르몬의
          상대적 비율을 조절하세요.
        </p>

        <div class="range-wrap">
          <label>
            옥신
            <strong
              id="auxin-value"
            >
              50
            </strong>
          </label>

          <input
            id="auxin-range"
            type="range"
            min="0"
            max="100"
            value="50"
          >

          <label>
            사이토키닌
            <strong
              id="cytokinin-value"
            >
              50
            </strong>
          </label>

          <input
            id="cytokinin-range"
            type="range"
            min="0"
            max="100"
            value="50"
          >
        </div>

        <div class="modal-actions">
          <button
            id="culture-check"
            class="pixel-button primary"
          >
            배양 시작
          </button>
        </div>
      `
    );

    const auxin =
      document.getElementById(
        "auxin-range"
      );

    const cytokinin =
      document.getElementById(
        "cytokinin-range"
      );

    auxin.addEventListener(
      "input",
      () => {
        document.getElementById(
          "auxin-value"
        ).textContent =
          auxin.value;
      }
    );

    cytokinin.addEventListener(
      "input",
      () => {
        document.getElementById(
          "cytokinin-value"
        ).textContent =
          cytokinin.value;
      }
    );

    document
      .getElementById(
        "culture-check"
      )
      .addEventListener(
        "click",
        () => {
          const success =
            target === "root"
              ? Number(auxin.value) >
                Number(
                  cytokinin.value
                ) + 20
              : Number(
                  cytokinin.value
                ) >
                Number(
                  auxin.value
                ) + 20;

          finishExperiment(
            success,
            "조직 배양에서는 옥신과 사이토키닌의 상대적인 비율이 뿌리와 새싹 형성에 영향을 줄 수 있습니다.",
            mainQuest
          );
        }
      );
  }

  function openContaminationGame(
    mainQuest
  ) {
    const contaminated =
      new Set(
        state.day % 2
          ? [0, 2]
          : [1, 2]
      );

    const cleaned =
      new Set();

    openModal(
      "배양 접시 오염 검사",
      `
        <p>
          색과 형태가 불규칙한
          오염 접시 두 개를 찾아
          선택하세요.
        </p>

        <div class="dish-grid">
          ${[0, 1, 2]
            .map(
              (index) => `
                <button
                  class="
                    dish
                    ${
                      contaminated.has(
                        index
                      )
                        ? "contaminated"
                        : ""
                    }
                  "
                  data-dish="${index}"
                  aria-label="배양 접시 ${index + 1}"
                ></button>
              `
            )
            .join("")}
        </div>

        <div
          id="dish-feedback"
          class="sequence-result"
        >
          오염 의심 접시: 0/2
        </div>
      `
    );

    document
      .querySelectorAll(
        "[data-dish]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const id =
              Number(
                button.dataset.dish
              );

            if (
              !contaminated.has(id)
            ) {
              return finishExperiment(
                false,
                "정상 배양 조직은 비교적 균일하지만 오염은 낯선 색, 번짐, 불규칙한 집락으로 나타날 수 있습니다.",
                mainQuest
              );
            }

            cleaned.add(id);

            button.classList.remove(
              "contaminated"
            );

            button.classList.add(
              "cleaned"
            );

            button.disabled = true;

            document.getElementById(
              "dish-feedback"
            ).textContent =
              `오염 의심 접시: ${cleaned.size}/2`;

            if (
              cleaned.size === 2
            ) {
              finishExperiment(
                true,
                "오염 징후를 조기에 발견하면 실험 결과의 신뢰성을 지킬 수 있습니다.",
                mainQuest
              );
            }
          }
        );
      });
  }

  function finishExperiment(
    success,
    explanation,
    mainQuest
  ) {
    const content =
      document.getElementById(
        "modal-content"
      );

    if (!success) {
      content.insertAdjacentHTML(
        "beforeend",
        `
          <div
            class="feedback wrong"
          >
            실험 조건을 다시 확인하세요.
            <br>
            ${explanation}
          </div>

          <div class="modal-actions">
            <button
              id="experiment-retry"
              class="pixel-button"
            >
              다시 시도
            </button>
          </div>
        `
      );

      document
        .getElementById(
          "experiment-retry"
        )
        .addEventListener(
          "click",
          closeModal
        );

      return;
    }

    const reward =
      Math.round(
        35 *
        (
          state.player.role ===
          "molecular"
            ? 1.1
            : 1
        )
      );

    state.rp += reward;
    state.totalExperiments += 1;

    progressDaily(
      "experiment",
      1
    );

    markActivity(
      "experiment"
    );

    content.innerHTML = `
      <div
        class="feedback correct"
      >
        <strong>
          실험 성공!
        </strong>
        <br>
        ${explanation}
        <br>
        +${reward} RP
      </div>

      <div class="modal-actions">
        <button
          id="experiment-finish"
          class="pixel-button primary"
        >
          기록 완료
        </button>
      </div>
    `;

    document
      .getElementById(
        "experiment-finish"
      )
      .addEventListener(
        "click",
        () => {
          if (mainQuest) {
            const quest =
              DATA.quests[
                currentDayInfo()
                  .quest
              ];

            const npc =
              DATA.npcs.find(
                (entry) =>
                  entry.id ===
                  quest.npc
              );

            completeMainQuest(
              npc
            );
          } else {
            closeModal();
          }
        }
      );

    updateAllUI();
  }

  function completeMainQuest(npc) {
    if (
      state.completedQuests.includes(
        questKey()
      )
    ) {
      return closeModal();
    }

    const info =
      currentDayInfo();

    state.completedQuests.push(
      questKey()
    );

    let rewardRP =
      info.reward.rp;

    if (
      state.player.role ===
      "molecular"
    ) {
      rewardRP =
        Math.round(
          rewardRP * 1.1
        );
    }

    state.rp += rewardRP;

    state.materials +=
      info.reward.materials;

    state.relationships[npc.id] =
      Math.min(
        10,
        state.relationships[npc.id] +
          2
      );

    state.notebook.push(
      `main-${state.day}`
    );

    openModal(
      "연구 완료",
      `
        <p class="dialogue-name">
          ${info.title}
        </p>

        <p class="dialogue-text">
          관찰 결과를 연구 노트에
          기록했습니다. 새로운 장비와
          다음 연구가 준비됩니다.
        </p>

        <div
          class="feedback correct"
        >
          보상:
          ${rewardRP} RP
          · 실험 재료
          ${info.reward.materials}
        </div>

        <div class="modal-actions">
          <button
            id="complete-close"
            class="pixel-button primary"
          >
            계속 탐험
          </button>
        </div>
      `
    );

    document
      .getElementById(
        "complete-close"
      )
      .addEventListener(
        "click",
        closeModal
      );

    saveGame(false);
    updateAllUI();
  }

  function confirmEndDay() {
    const completed =
      state.completedQuests.includes(
        questKey()
      );

    openModal(
      "하루 마무리",
      `
        <p>
          현재 시각
          ${formatTime(
            state.minutes
          )}입니다.

          잠들면 작물이 성장하고
          새로운 의뢰가 시작됩니다.
        </p>

        ${
          !completed
            ? `
              <div
                class="feedback wrong"
              >
                오늘의 메인 연구를
                아직 완료하지 않았습니다.
                그래도 다음 날로
                갈 수 있습니다.
              </div>
            `
            : ""
        }

        <div class="modal-actions">
          <button
            id="sleep-confirm"
            class="pixel-button primary"
          >
            다음 날로
          </button>

          <button
            id="sleep-cancel"
            class="pixel-button"
          >
            조금 더 활동하기
          </button>
        </div>
      `
    );

    document
      .getElementById(
        "sleep-confirm"
      )
      .addEventListener(
        "click",
        () => endDay(false)
      );

    document
      .getElementById(
        "sleep-cancel"
      )
      .addEventListener(
        "click",
        closeModal
      );
  }

  function endDay(forced) {
    if (!state) {
      return;
    }

    state.plots.forEach(
      (plot) => {
        if (!plot.crop) {
          return;
        }

        if (
          plot.watered ||
          state.weather === "rain"
        ) {
          plot.age += 1;

          if (
            state.player.role ===
              "botanist" &&
            state.day % 3 === 0
          ) {
            plot.age += 1;
          }
        } else {
          plot.health =
            Math.max(
              20,
              plot.health -
              (
                state.weather ===
                "heat"
                  ? 18
                  : 9
              )
            );
        }

        plot.watered = false;
        plot.treatment = null;
      }
    );

    if (
      state.equipment.includes(
        "irrigation"
      )
    ) {
      state.plots
        .filter(
          (plot) =>
            plot.crop
        )
        .slice(0, 3)
        .forEach(
          (plot) => {
            plot.watered = true;
          }
        );
    }

    state.day += 1;
    state.minutes = 8 * 60;
    state.stamina = 100;

    state.collectedToday = [];
    state.talkedToday = [];
    state.visitedToday = [];
    state.activitiesToday = [];

    setWeather();
    setDailyTask();

    closeModal();
saveGame(false);

state.player.x = 1560;
state.player.y = 1990;

updateAllUI();

announceZone(
  "연구원 생활마을"
);

    showToast(
      `${
        forced
          ? "늦은 시간이 되어 연구를 마쳤습니다."
          : "새로운 아침입니다."
      } DAY ${state.day} · ${weatherName()}`
    );
  }

  function setWeather() {
    const weather =
      DATA.weather[
        (
          state.day * 5 +
          state.totalHarvest
        ) %
          DATA.weather.length
      ];

    state.weather =
      weather.id;

    state.weatherLog.push(
      weather.id
    );

    if (
      state.weather === "rain"
    ) {
      state.plots.forEach(
        (plot) => {
          if (plot.crop) {
            plot.watered = true;
          }
        }
      );
    }
  }

  function setDailyTask() {
    const item =
      DATA.dailyTasks[
        (
          state.day * 3 +
          state.totalExperiments
        ) %
          DATA.dailyTasks.length
      ];

    state.daily = {
      ...item,
      progress: 0,
      claimed: false
    };
  }

  function progressDaily(
    type,
    amount
  ) {
    if (
      !state.daily ||
      state.daily.type !== type ||
      state.daily.claimed
    ) {
      return;
    }

    state.daily.progress =
      Math.min(
        state.daily.target,
        state.daily.progress +
          amount
      );

    if (
      state.daily.progress >=
      state.daily.target
    ) {
      state.daily.claimed = true;

      state.rp +=
        state.daily.reward;

      showToast(
        `일일 의뢰 완료 · ${state.daily.reward} RP`
      );
    }
  }

  function markActivity(type) {
    if (
      !state.activitiesToday.includes(
        type
      )
    ) {
      state.activitiesToday.push(
        type
      );
    }
  }
    function openResearchTerminal() {
    const notes = state.notebook.slice(-8).reverse();

    openModal(
      "연구 기록 단말기",
      `<p>
        발견 표본 ${state.discovered.length}/${DATA.samples.length}
        · 수확 ${state.totalHarvest}회
        · 실험 ${state.totalExperiments}회
      </p>

      <div class="choice-grid">
        ${
          notes.length
            ? notes
                .map(
                  note =>
                    `<div class="choice-button">${noteText(note)}</div>`
                )
                .join("")
            : "<p>아직 작성된 기록이 없습니다.</p>"
        }
      </div>

      <div class="modal-actions">
        <button id="open-free-quiz" class="pixel-button">
          자유 퀴즈
        </button>

        <button id="open-pcr" class="pixel-button">
          PCR 연습
        </button>
      </div>`
    );

    document
      .getElementById("open-free-quiz")
      .addEventListener("click", () => {
        openQuiz("종합", DATA.npcs[0]);
      });

    document
      .getElementById("open-pcr")
      .addEventListener("click", () => {
        openPcrGame(false);
      });
  }

  function noteText(note) {
    if (note.startsWith("sample-")) {
      const sample = DATA.samples.find(
        item => item.id === note.split("-")[1]
      );

      return `표본 발견 · ${sample?.name || "미확인 표본"}`;
    }

    if (note.startsWith("crop-")) {
      return `재배 기록 · ${cropName(note.split("-")[1])}`;
    }

    if (note.startsWith("quiz-")) {
      return `학습 기록 · ${note.split("-")[1]}`;
    }

    if (note.startsWith("main-")) {
      return `메인 연구 완료 · DAY ${note.split("-")[1]}`;
    }

    if (note.startsWith("treatment-")) {
      return `처리 조건 관찰 · ${treatmentName(
        note.split("-")[1]
      )}`;
    }

    if (note.startsWith("friend-")) {
      return "연구원 협력 관계 형성";
    }

    return "새로운 연구 기록";
  }

  function renderSide(
    tab =
      document.querySelector(".tab.active")?.dataset.tab ||
      "bag"
  ) {
    const content =
      document.getElementById("side-content");

    if (!state) return;

    if (tab === "bag") {
      const seeds = DATA.crops
        .map(
          crop => `
            <div class="side-row">
              <span>${crop.name} 씨앗</span>
              <strong>
                ${state.inventory.seeds[crop.id] || 0}
              </strong>
            </div>
          `
        )
        .join("");

      const samples = DATA.samples
        .map(
          sample => `
            <div class="side-row">
              <span>${sample.name}</span>
              <strong>
                ${state.inventory.samples[sample.id] || 0}
              </strong>
            </div>
          `
        )
        .join("");

      content.innerHTML = `
        <h3>씨앗</h3>
        ${seeds}
        <h3>표본</h3>
        ${samples}
      `;
    }

    if (tab === "people") {
      content.innerHTML = DATA.npcs
        .map(
          npc => `
            <div class="side-row">
              <span>
                ${npc.name}
                <small>${npc.title}</small>
              </span>

              <span class="heart">
                ${"♥".repeat(
                  Math.ceil(state.relationships[npc.id] / 2)
                )}
                ${"♡".repeat(
                  5 -
                    Math.ceil(
                      state.relationships[npc.id] / 2
                    )
                )}
              </span>
            </div>
          `
        )
        .join("");
    }

    if (tab === "lab") {
      content.innerHTML = DATA.equipment
        .map(
          item => `
            <div class="side-row ${
              state.equipment.includes(item.id)
                ? ""
                : "locked"
            }">
              <span>
                ${item.name}
                <small>${item.description}</small>
              </span>

              <strong>
                ${
                  state.equipment.includes(item.id)
                    ? "설치"
                    : `DAY ${item.day}`
                }
              </strong>
            </div>
          `
        )
        .join("");
    }
  }

  function updateAllUI() {
    updateHUD();
    renderQuest();
    renderSide();
  }

  function updateHUD() {
    if (!state) return;

    document.getElementById("day-value").textContent =
      state.day;

    document.getElementById("weather-value").textContent =
      weatherName();

    document.getElementById("time-value").textContent =
      formatTime(state.minutes);

    document.getElementById("rp-value").textContent =
      state.rp;

    document.getElementById("material-value").textContent =
      state.materials;

    document.getElementById("stamina-value").textContent =
      Math.round(state.stamina);

    document.getElementById(
      "stamina-fill"
    ).style.width = `${state.stamina}%`;

    document.getElementById(
      "time-fill"
    ).style.width = `${clamp(
      ((state.minutes - 480) / 840) * 100,
      0,
      100
    )}%`;
  }

  function renderQuest() {
    const info = currentDayInfo();
    const quest = DATA.quests[info.quest];

    const complete =
      state.completedQuests.includes(questKey());

    const progress = complete
      ? quest.target || 1
      : questProgressValue(quest.type);

    const target = quest.target || 1;

    document.getElementById("quest-card").innerHTML = `
      <div class="quest-name">
        ${complete ? "✓ " : ""}${info.title}
      </div>

      <div class="quest-area">
        ${info.area}
      </div>

      <div class="quest-goal">
        ${info.goal}
      </div>

      <div class="progress-track">
        <i style="width:${
          complete
            ? 100
            : Math.min(100, (progress / target) * 100)
        }%"></i>
      </div>

      <div class="reward-line">
        보상 ${info.reward.rp} RP
        · 재료 ${info.reward.materials}
      </div>
    `;

    const daily = state.daily;

    document.getElementById("daily-card").innerHTML = `
      <div class="quest-goal ${
        daily.claimed ? "daily-done" : ""
      }">
        ${daily.claimed ? "✓ " : ""}${daily.label}
      </div>

      <div class="progress-track">
        <i style="width:${
          (daily.progress / daily.target) * 100
        }%"></i>
      </div>

      <div class="reward-line">
        ${daily.progress}/${daily.target}
        · ${daily.reward} RP
      </div>
    `;
  }

  function currentDayInfo() {
    if (state.day <= DATA.days.length) {
      return DATA.days[state.day - 1];
    }

    const repeat =
      DATA.days[7 + ((state.day - 15) % 7)];

    return {
      ...repeat,
      title: `자유 연구 · ${repeat.title}`
    };
  }

  function questKey() {
    return `day-${state.day}`;
  }

  function openModal(title, html) {
    keys.arrowup = false;
    keys.arrowdown = false;
    keys.arrowleft = false;
    keys.arrowright = false;
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;

    document.getElementById(
      "modal-title"
    ).textContent = title;

    document.getElementById(
      "modal-content"
    ).innerHTML = html;

    document
      .getElementById("modal")
      .classList.remove("hidden");
  }

  function closeModal() {
    document
      .getElementById("modal")
      .classList.add("hidden");
  }

  function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.remove("hidden");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.add("hidden");
    }, 2700);
  }

  function spendStamina(amount) {
    const weather = DATA.weather.find(
      item => item.id === state.weather
    );

    const adjusted = Math.max(
      1,
      amount + weather.stamina
    );

    if (state.stamina < adjusted) {
      showToast(
        "체력이 부족합니다. 생활관에서 하루를 마무리하세요."
      );

      return false;
    }

    state.stamina -= adjusted;
    return true;
  }

  function totalSamples() {
    return Object.values(
      state.inventory.samples
    ).reduce((total, amount) => total + amount, 0);
  }

  function cropName(id) {
    return (
      DATA.crops.find(item => item.id === id)?.name ||
      id
    );
  }

  function treatmentName(id) {
    return (
      DATA.treatments.find(item => item.id === id)
        ?.name || id
    );
  }

  function weatherName() {
    return (
      DATA.weather.find(
        item => item.id === state.weather
      )?.name || "맑음"
    );
  }

  function formatTime(minutes) {
    const hour =
      Math.floor(minutes / 60) % 24;

    const minute =
      Math.floor(minutes % 60);

    return `${String(hour).padStart(
      2,
      "0"
    )}:${String(minute).padStart(2, "0")}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

function plotPosition(index) {
  return {
    x: 2240 + (index % 4) * 165,
    y: 1250 + Math.floor(index / 4) * 150
  };
}

  function draw() {
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.save();

    ctx.translate(
      -Math.floor(camera.x),
      -Math.floor(camera.y)
    );

    drawGround();
    drawRegions();
    drawTrees();
    drawSamples();
    drawPlots();
    drawStations();
    drawNpcs();
    drawPlayer();

    ctx.restore();

    drawLightOverlay();

    if (state.weather === "rain") {
      drawRain();
    }
  }

  function drawGround() {
    ctx.fillStyle = "#6eaa60";

    ctx.fillRect(
      0,
      0,
      WORLD.width,
      WORLD.height
    );

    for (
      let y = 0;
      y < WORLD.height;
      y += 32
    ) {
      for (
        let x = 0;
        x < WORLD.width;
        x += 32
      ) {
        const number =
          ((x / 32) * 17 +
            (y / 32) * 31) %
          7;

        ctx.fillStyle =
          number < 2
            ? "#72ae63"
            : "#69a45b";

        ctx.fillRect(x, y, 32, 32);

        if (number === 0) {
          ctx.fillStyle = "#88bd70";

          ctx.fillRect(
            x + 7,
            y + 9,
            3,
            6
          );

          ctx.fillRect(
            x + 11,
            y + 12,
            3,
            3
          );
        }
      }
    }

    ctx.fillStyle = "#c6ae78";

    ctx.fillRect(
      650,
      0,
      34,
      WORLD.height
    );

    ctx.fillRect(
      0,
      590,
      WORLD.width,
      38
    );

    ctx.fillRect(
      835,
      160,
      42,
      900
    );

    ctx.fillRect(
      650,
      300,
      750,
      32
    );
  }

  function drawRegions() {
    ctx.fillStyle = "#386f79";
    ellipse(330, 300, 220, 140);

    ctx.fillStyle = "#4f96a1";
    ellipse(330, 296, 188, 112);

    ctx.fillStyle = "#75b8b6";

    for (let i = 0; i < 8; i++) {
      ctx.fillRect(
        210 + i * 33,
        260 + (i % 2) * 28,
        18,
        4
      );
    }

    drawFloor(
      700,
      350,
      310,
      245,
      "#c7c3ad",
      "#647b75"
    );

    ctx.fillStyle = "#305c56";
    ctx.fillRect(700, 350, 310, 38);

    drawLabel(
      "CENTRAL LAB",
      730,
      376,
      "#eef3d6"
    );

    drawFloor(
      280,
      670,
      390,
      250,
      "#a9c6c5",
      "#466970"
    );

    drawLabel(
      "MOLECULAR LAB",
      330,
      704,
      "#173538"
    );

    drawFloor(
      1215,
      225,
      420,
      325,
      "#b9d7ab",
      "#3c7259"
    );

    ctx.strokeStyle = "#e8f2cf";
    ctx.lineWidth = 7;

    for (
      let x = 1240;
      x < 1630;
      x += 65
    ) {
      ctx.beginPath();
      ctx.moveTo(x, 235);
      ctx.lineTo(x, 540);
      ctx.stroke();
    }

    drawLabel(
      "SMART GREENHOUSE",
      1280,
      260,
      "#234c3c"
    );

    ctx.fillStyle = "#a27b4f";

    ctx.fillRect(
      1225,
      610,
      500,
      380
    );

    ctx.fillStyle = "#b88a57";

    for (
      let y = 630;
      y < 980;
      y += 56
    ) {
      ctx.fillRect(
        1240,
        y,
        470,
        26
      );
    }

    drawLabel(
      "TEST FIELD",
      1390,
      1025,
      "#f2e5bd"
    );

    drawFloor(
      900,
      940,
      250,
      170,
      "#d1b58a",
      "#6d5545"
    );

    drawLabel(
      "DORM",
      980,
      975,
      "#3b3028"
    );

    drawFloor(
      920,
      145,
      225,
      145,
      "#ddbd83",
      "#8a5642"
    );

    drawLabel(
      "SUPPLY",
      975,
      180,
      "#4f3028"
    );
  }

  function drawFloor(
    x,
    y,
    width,
    height,
    fill,
    border
  ) {
    ctx.fillStyle = border;

    ctx.fillRect(
      x - 8,
      y - 8,
      width + 16,
      height + 16
    );

    ctx.fillStyle = fill;

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle =
      "rgba(255,255,255,.12)";

    for (
      let yy = y;
      yy < y + height;
      yy += 32
    ) {
      for (
        let xx = x;
        xx < x + width;
        xx += 32
      ) {
        ctx.fillRect(
          xx,
          yy,
          29,
          29
        );
      }
    }
  }

  function drawTrees() {
    treePositions.forEach(tree => {
      ctx.fillStyle = "#59442c";

      ctx.fillRect(
        tree.x - 7,
        tree.y + 4,
        14,
        28
      );

      ctx.fillStyle = "#244e3b";

      ctx.fillRect(
        tree.x - 22,
        tree.y - 28,
        44,
        35
      );

      ctx.fillStyle = "#36704a";

      ctx.fillRect(
        tree.x - 14,
        tree.y - 39,
        29,
        32
      );

      ctx.fillStyle = "#56915b";

      ctx.fillRect(
        tree.x - 17,
        tree.y - 28,
        12,
        10
      );
    });
  }

  function drawSamples() {
    baseSamples.forEach(item => {
      if (
        state.collectedToday.includes(
          item.key
        )
      ) {
        return;
      }

      const sample = DATA.samples.find(
        entry => entry.id === item.sample
      );

      const pulse =
        2 +
        Math.sin(
          performance.now() / 250 +
            item.x
        ) *
          2;

      ctx.fillStyle =
        "rgba(255,245,150,.22)";

      ctx.fillRect(
        item.x - 12 - pulse,
        item.y - 12 - pulse,
        24 + pulse * 2,
        24 + pulse * 2
      );

      ctx.fillStyle = sample.color;

      ctx.fillRect(
        item.x - 7,
        item.y - 7,
        14,
        14
      );

      ctx.fillStyle = "#efffc9";

      ctx.fillRect(
        item.x - 2,
        item.y - 5,
        4,
        4
      );
    });
  }

  function drawPlots() {
    for (
      let i = 0;
      i < state.unlockedPlots;
      i++
    ) {
      const position =
        plotPosition(i);

      const plot =
        state.plots[i];

      ctx.fillStyle = plot.watered
        ? "#624c36"
        : "#78593b";

      ctx.fillRect(
        position.x - 34,
        position.y - 28,
        68,
        56
      );

      ctx.fillStyle = "#a67a4b";

      for (
        let row = -18;
        row <= 18;
        row += 12
      ) {
        ctx.fillRect(
          position.x - 28,
          position.y + row,
          56,
          3
        );
      }

      if (plot.crop) {
        const crop = DATA.crops.find(
          item => item.id === plot.crop
        );

        const stage = Math.min(
          3,
          Math.floor(
            (plot.age / crop.grow) * 4
          )
        );

        ctx.fillStyle = "#285638";

        ctx.fillRect(
          position.x - 3,
          position.y - 8 - stage * 4,
          6,
          18 + stage * 4
        );

        ctx.fillStyle = crop.color;

        ctx.fillRect(
          position.x - 9 - stage * 2,
          position.y - 10 - stage * 4,
          9 + stage * 2,
          8 + stage * 2
        );

        ctx.fillRect(
          position.x + 1,
          position.y - 17 - stage * 3,
          9 + stage * 2,
          8 + stage * 2
        );

        if (plot.age >= crop.grow) {
          ctx.fillStyle = "#fff0a1";

          ctx.fillRect(
            position.x - 3,
            position.y - 28,
            6,
            6
          );
        }
      }
    }
  }

  function drawStations() {
    stations.forEach(station => {
      ctx.fillStyle =
        interactionTarget?.kind ===
          "station" &&
        interactionTarget.id ===
          station.id
          ? "#fff19a"
          : "#263d3d";

      if (station.type === "bed") {
        ctx.fillRect(
          station.x - 28,
          station.y - 18,
          56,
          36
        );

        ctx.fillStyle = "#e5d3a2";

        ctx.fillRect(
          station.x - 22,
          station.y - 12,
          46,
          24
        );
      } else if (
        station.type === "pond"
      ) {
        ctx.fillRect(
          station.x - 25,
          station.y - 6,
          50,
          12
        );

        ctx.fillStyle = "#a97943";

        ctx.fillRect(
          station.x - 20,
          station.y - 2,
          40,
          16
        );
      } else {
        ctx.fillRect(
          station.x - 18,
          station.y - 15,
          36,
          30
        );

        ctx.fillStyle = "#74a7a0";

        ctx.fillRect(
          station.x - 12,
          station.y - 10,
          24,
          14
        );

        ctx.fillStyle = "#bff3d2";

        ctx.fillRect(
          station.x - 8,
          station.y - 7,
          16,
          8
        );
      }
    });
  }

  function drawNpcs() {
    DATA.npcs.forEach(npc => {
      drawCharacter(
        npc.x,
        npc.y,
        npc.color,
        npc.name,
        false
      );
    });
  }

  function drawPlayer() {
    const role =
      DATA.roles[state.player.role];

    drawCharacter(
      state.player.x,
      state.player.y,
      role.color,
      state.player.name,
      true
    );

    const direction =
      state.player.dir;

    ctx.fillStyle = "#fff2a8";

    if (direction === "up") {
      ctx.fillRect(
        state.player.x - 3,
        state.player.y - 31,
        6,
        5
      );
    }

    if (direction === "down") {
      ctx.fillRect(
        state.player.x - 3,
        state.player.y + 22,
        6,
        5
      );
    }

    if (direction === "left") {
      ctx.fillRect(
        state.player.x - 22,
        state.player.y - 3,
        5,
        6
      );
    }

    if (direction === "right") {
      ctx.fillRect(
        state.player.x + 17,
        state.player.y - 3,
        5,
        6
      );
    }
  }

  function drawCharacter(
    x,
    y,
    color,
    name,
    player
  ) {
    ctx.fillStyle =
      "rgba(10,25,24,.28)";

    ctx.fillRect(
      x - 14,
      y + 17,
      28,
      7
    );

    ctx.fillStyle = "#efbd89";

    ctx.fillRect(
      x - 10,
      y - 19,
      20,
      18
    );

    ctx.fillStyle = player
      ? "#253c35"
      : "#3f3631";

    ctx.fillRect(
      x - 12,
      y - 24,
      24,
      8
    );

    ctx.fillStyle = color;

    ctx.fillRect(
      x - 13,
      y - 2,
      26,
      22
    );

    ctx.fillStyle = "#f1efe1";

    ctx.fillRect(
      x - 8,
      y + 1,
      16,
      13
    );

    ctx.fillStyle = "#263434";

    ctx.fillRect(
      x - 11,
      y + 18,
      8,
      8
    );

    ctx.fillRect(
      x + 3,
      y + 18,
      8,
      8
    );

    drawLabel(
      name,
      x - name.length * 5,
      y - 32,
      "#fff5c9"
    );
  }

  function drawLabel(
    text,
    x,
    y,
    color
  ) {
    ctx.font = "bold 12px monospace";

    ctx.fillStyle =
      "rgba(10,25,24,.72)";

    ctx.fillRect(
      x - 3,
      y - 12,
      ctx.measureText(text).width + 6,
      16
    );

    ctx.fillStyle = color;

    ctx.fillText(text, x, y);
  }

  function ellipse(
    x,
    y,
    radiusX,
    radiusY
  ) {
    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  function drawLightOverlay() {
    const hour =
      state.minutes / 60;

    let alpha = 0;

    if (hour >= 18) {
      alpha = Math.min(
        0.48,
        (hour - 18) * 0.12
      );
    }

    if (hour < 7) {
      alpha = 0.46;
    }

    if (state.weather === "cloud") {
      alpha += 0.08;
    }

    if (alpha > 0) {
      ctx.fillStyle =
        `rgba(19,30,66,${alpha})`;

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }

  function drawRain() {
    ctx.strokeStyle =
      "rgba(190,225,238,.65)";

    ctx.lineWidth = 2;

    const time =
      performance.now() / 9;

    for (let i = 0; i < 48; i++) {
      const x =
        (i * 83 + time) %
          (canvas.width + 30) -
        15;

      const y =
        (i * 47 + time * 1.7) %
          (canvas.height + 30) -
        15;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 7, y + 13);
      ctx.stroke();
    }
  }
    /* ==================================================
     BIO LAB — DETAILED WARM PIXEL MAP
     기존 게임 구조를 유지하는 그래픽 개선 패치
  ================================================== */

  function drawGround() {
    ctx.fillStyle = "#74aa4f";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    /* 작은 잔디 타일 */
    for (let y = 0; y < WORLD.height; y += 16) {
      for (let x = 0; x < WORLD.width; x += 16) {
        const pattern =
          ((x / 16) * 13 +
            (y / 16) * 19) %
          17;

        if (pattern < 3) {
          ctx.fillStyle = "#80b65a";
          ctx.fillRect(x + 2, y + 3, 3, 3);
          ctx.fillRect(x + 7, y + 1, 2, 5);
        }

        if (pattern === 4) {
          ctx.fillStyle = "#5f963f";
          ctx.fillRect(x + 3, y + 9, 3, 5);
          ctx.fillRect(x + 8, y + 7, 3, 7);
        }

        if (pattern === 7) {
          ctx.fillStyle = "#a0cc68";
          ctx.fillRect(x + 5, y + 5, 3, 3);
        }

        if (pattern === 11) {
          ctx.fillStyle = "#f1df72";
          ctx.fillRect(x + 6, y + 5, 3, 3);
          ctx.fillStyle = "#fff3a5";
          ctx.fillRect(x + 7, y + 4, 1, 1);
        }
      }
    }

    /* 세로 흙길 */
    drawDirtPath(
      635,
      0,
      62,
      WORLD.height
    );

    drawDirtPath(
      815,
      135,
      72,
      980
    );

    /* 가로 흙길 */
    drawDirtPath(
      0,
      570,
      WORLD.width,
      78
    );

    drawDirtPath(
      630,
      285,
      790,
      62
    );

    /* 길 가장자리 작은 돌 */
    for (let y = 20; y < WORLD.height; y += 72) {
      drawPebble(630, y);
      drawPebble(701, y + 31);
    }

    for (let x = 24; x < WORLD.width; x += 88) {
      drawPebble(x, 566);
      drawPebble(x + 42, 650);
    }
  }

  function drawDirtPath(x, y, width, height) {
    ctx.fillStyle = "#c9974d";
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = "#d9aa5d";
    ctx.fillRect(
      x + 4,
      y + 4,
      width - 8,
      height - 8
    );

    for (
      let yy = y + 9;
      yy < y + height - 7;
      yy += 21
    ) {
      for (
        let xx = x + 7;
        xx < x + width - 7;
        xx += 27
      ) {
        const offset =
          ((xx + yy) / 3) % 9;

        ctx.fillStyle =
          offset < 4
            ? "#bd873e"
            : "#e3b86d";

        ctx.fillRect(
          xx + (offset % 4),
          yy,
          4,
          3
        );
      }
    }
  }

  function drawPebble(x, y) {
    ctx.fillStyle = "#786c55";
    ctx.fillRect(x, y + 3, 8, 5);

    ctx.fillStyle = "#b1a276";
    ctx.fillRect(x + 2, y + 1, 5, 5);

    ctx.fillStyle = "#d2c18b";
    ctx.fillRect(x + 3, y + 1, 2, 2);
  }

  function drawRegions() {
    /* 연구 연못 */
    ctx.fillStyle = "#315e5d";
    ellipse(330, 304, 229, 149);

    ctx.fillStyle = "#417f84";
    ellipse(330, 299, 212, 132);

    ctx.fillStyle = "#5da2a0";
    ellipse(330, 293, 193, 113);

    ctx.fillStyle = "#8dc9b8";

    for (let i = 0; i < 9; i++) {
      ctx.fillRect(
        203 + i * 36,
        262 + (i % 3) * 23,
        19,
        4
      );
    }

    /* 수련잎 */
    for (let i = 0; i < 6; i++) {
      const x = 240 + i * 43;
      const y = 320 + (i % 2) * 30;

      ctx.fillStyle = "#376f43";
      ctx.fillRect(x, y, 17, 10);

      ctx.fillStyle = "#63a954";
      ctx.fillRect(x + 3, y - 3, 11, 11);

      if (i % 2 === 0) {
        ctx.fillStyle = "#f0a8b1";
        ctx.fillRect(x + 7, y - 6, 5, 5);
      }
    }

    /* 연못 주변 갈대 */
    for (let i = 0; i < 11; i++) {
      const x = 145 + i * 37;
      const y = 410 + (i % 2) * 8;

      ctx.fillStyle = "#426936";
      ctx.fillRect(x, y - 17, 3, 18);
      ctx.fillRect(x + 7, y - 12, 3, 13);

      ctx.fillStyle = "#90622d";
      ctx.fillRect(x - 1, y - 21, 5, 7);
    }

    /* 중앙 연구소 */
    drawPixelBuilding(
      700,
      350,
      310,
      245,
      {
        wall: "#d7b674",
        wallLight: "#ebcf91",
        roof: "#a84f37",
        roofLight: "#d46d47",
        trim: "#633b27",
        door: "#5b3829",
        window: "#70aeb1",
        sign: "CENTRAL LAB"
      }
    );

    /* 분자생물학 연구소 */
    drawPixelBuilding(
      280,
      670,
      390,
      250,
      {
        wall: "#91b8af",
        wallLight: "#b8d5c4",
        roof: "#365f65",
        roofLight: "#4c7f82",
        trim: "#29484d",
        door: "#51392d",
        window: "#9dd7cf",
        sign: "MOLECULAR LAB"
      }
    );

    /* 스마트 온실 */
    drawGreenhouse(
      1215,
      225,
      420,
      325
    );

    /* 시험 재배지 */
    drawFarmArea();

    /* 생활관 */
    drawPixelBuilding(
      900,
      940,
      250,
      170,
      {
        wall: "#d7aa69",
        wallLight: "#ebc680",
        roof: "#884634",
        roofLight: "#b85d40",
        trim: "#563424",
        door: "#633e2d",
        window: "#7eafb0",
        sign: "DORM"
      }
    );

    /* 보급소 */
    drawPixelBuilding(
      920,
      145,
      225,
      145,
      {
        wall: "#d6a45e",
        wallLight: "#eac47d",
        roof: "#874431",
        roofLight: "#bd603b",
        trim: "#573421",
        door: "#5d3826",
        window: "#78a9a4",
        sign: "SUPPLY"
      }
    );

    /* 울타리 */
    drawFence(1190, 190, 475, true);
    drawFence(1190, 1048, 565, true);
    drawFence(1185, 205, 835, false);
    drawFence(1750, 205, 835, false);

    /* 꽃밭 */
    drawFlowerPatch(1080, 410, 5);
    drawFlowerPatch(1090, 760, 7);
    drawFlowerPatch(750, 875, 6);
    drawFlowerPatch(1030, 1110, 5);
  }

  function drawPixelBuilding(
    x,
    y,
    width,
    height,
    colors
  ) {
    const roofHeight = Math.min(
      75,
      Math.floor(height * 0.32)
    );

    /* 건물 그림자 */
    ctx.fillStyle = "rgba(50,35,22,.28)";
    ctx.fillRect(
      x + 15,
      y + height + 6,
      width,
      14
    );

    /* 벽 외곽 */
    ctx.fillStyle = colors.trim;
    ctx.fillRect(
      x - 8,
      y + roofHeight - 5,
      width + 16,
      height - roofHeight + 13
    );

    ctx.fillStyle = colors.wall;
    ctx.fillRect(
      x,
      y + roofHeight,
      width,
      height - roofHeight
    );

    /* 나무 벽 타일 */
    for (
      let wallX = x + 7;
      wallX < x + width - 5;
      wallX += 18
    ) {
      ctx.fillStyle = colors.wallLight;
      ctx.fillRect(
        wallX,
        y + roofHeight + 8,
        4,
        height - roofHeight - 15
      );
    }

    /* 삼각형 느낌의 계단형 지붕 */
    for (
      let row = 0;
      row < roofHeight;
      row += 6
    ) {
      const inset = Math.floor(
        (roofHeight - row) * 0.72
      );

      ctx.fillStyle =
        row % 12 === 0
          ? colors.roofLight
          : colors.roof;

      ctx.fillRect(
        x + inset,
        y + row,
        width - inset * 2,
        7
      );
    }

    /* 지붕 아래 그림자 */
    ctx.fillStyle = colors.trim;
    ctx.fillRect(
      x - 7,
      y + roofHeight - 1,
      width + 14,
      11
    );

    /* 지붕 타일선 */
    ctx.fillStyle = "rgba(78,39,29,.35)";

    for (
      let roofX = x + 18;
      roofX < x + width - 10;
      roofX += 28
    ) {
      ctx.fillRect(
        roofX,
        y + roofHeight - 24,
        4,
        22
      );
    }

    /* 출입문 */
    const doorX =
      x + Math.floor(width / 2) - 21;

    ctx.fillStyle = colors.trim;
    ctx.fillRect(
      doorX - 5,
      y + height - 69,
      52,
      69
    );

    ctx.fillStyle = colors.door;
    ctx.fillRect(
      doorX,
      y + height - 64,
      42,
      64
    );

    ctx.fillStyle = "#92613d";
    ctx.fillRect(
      doorX + 7,
      y + height - 57,
      28,
      17
    );

    ctx.fillStyle = "#e1b653";
    ctx.fillRect(
      doorX + 31,
      y + height - 31,
      5,
      5
    );

    /* 창문 */
    drawWindow(
      x + 28,
      y + roofHeight + 35,
      colors.window,
      colors.trim
    );

    drawWindow(
      x + width - 72,
      y + roofHeight + 35,
      colors.window,
      colors.trim
    );

    /* 간판 */
    ctx.fillStyle = colors.trim;
    ctx.fillRect(
      x + 20,
      y + roofHeight + 8,
      width - 40,
      25
    );

    drawLabel(
      colors.sign,
      x + 30,
      y + roofHeight + 26,
      "#fff0b1"
    );

    /* 굴뚝 */
    ctx.fillStyle = "#4d4540";
    ctx.fillRect(
      x + width - 58,
      y + 7,
      26,
      47
    );

    ctx.fillStyle = "#796d61";
    ctx.fillRect(
      x + width - 53,
      y + 3,
      17,
      42
    );

    ctx.fillStyle = "#393532";
    ctx.fillRect(
      x + width - 58,
      y,
      27,
      8
    );
  }

  function drawWindow(x, y, glass, frame) {
    ctx.fillStyle = frame;
    ctx.fillRect(x, y, 48, 43);

    ctx.fillStyle = glass;
    ctx.fillRect(
      x + 6,
      y + 6,
      36,
      31
    );

    ctx.fillStyle = "#d4f0d2";
    ctx.fillRect(
      x + 9,
      y + 8,
      10,
      9
    );

    ctx.fillStyle = frame;
    ctx.fillRect(
      x + 22,
      y + 5,
      4,
      34
    );

    ctx.fillRect(
      x + 5,
      y + 20,
      38,
      4
    );
  }

  function drawGreenhouse(
    x,
    y,
    width,
    height
  ) {
    ctx.fillStyle = "rgba(42,54,34,.3)";
    ctx.fillRect(
      x + 14,
      y + height + 7,
      width,
      13
    );

    ctx.fillStyle = "#315c46";
    ctx.fillRect(
      x - 8,
      y + 58,
      width + 16,
      height - 50
    );

    ctx.fillStyle = "#8fc9aa";
    ctx.fillRect(
      x,
      y + 65,
      width,
      height - 65
    );

    /* 유리 지붕 */
    for (let row = 0; row < 66; row += 6) {
      const inset =
        Math.floor((66 - row) * 0.8);

      ctx.fillStyle =
        row % 12 === 0
          ? "#d7edbd"
          : "#9fd6ad";

      ctx.fillRect(
        x + inset,
        y + row,
        width - inset * 2,
        7
      );
    }

    /* 유리 반사 */
    ctx.fillStyle =
      "rgba(237,255,214,.48)";

    for (
      let panelX = x + 26;
      panelX < x + width - 20;
      panelX += 67
    ) {
      ctx.fillRect(
        panelX,
        y + 75,
        9,
        height - 92
      );
    }

    /* 온실 골조 */
    ctx.fillStyle = "#416e55";

    for (
      let panelX = x;
      panelX <= x + width;
      panelX += 66
    ) {
      ctx.fillRect(
        panelX,
        y + 62,
        6,
        height - 62
      );
    }

    ctx.fillRect(
      x,
      y + 157,
      width,
      6
    );

    ctx.fillRect(
      x,
      y + 245,
      width,
      6
    );

    /* 온실 내부 화단 */
    for (let row = 0; row < 3; row++) {
      ctx.fillStyle = "#745132";
      ctx.fillRect(
        x + 31,
        y + 105 + row * 73,
        width - 62,
        29
      );

      for (let i = 0; i < 9; i++) {
        const plantX =
          x + 47 + i * 39;

        const plantY =
          y + 102 + row * 73;

        ctx.fillStyle = "#315f3a";
        ctx.fillRect(
          plantX,
          plantY - 10,
          4,
          13
        );

        ctx.fillStyle =
          (i + row) % 3 === 0
            ? "#e28c73"
            : "#70ad50";

        ctx.fillRect(
          plantX - 5,
          plantY - 14,
          7,
          7
        );

        ctx.fillRect(
          plantX + 3,
          plantY - 18,
          7,
          7
        );
      }
    }

    /* 온실 문 */
    ctx.fillStyle = "#315b47";
    ctx.fillRect(
      x + width / 2 - 29,
      y + height - 75,
      58,
      75
    );

    ctx.fillStyle = "#95cdb1";
    ctx.fillRect(
      x + width / 2 - 21,
      y + height - 67,
      42,
      67
    );

    drawLabel(
      "SMART GREENHOUSE",
      x + 98,
      y + 87,
      "#254532"
    );
  }

  function drawFarmArea() {
    ctx.fillStyle = "#765037";
    ctx.fillRect(
      1215,
      600,
      530,
      420
    );

    ctx.fillStyle = "#9b683f";
    ctx.fillRect(
      1224,
      609,
      512,
      402
    );

    /* 밭고랑 */
    for (
      let row = 0;
      row < 7;
      row++
    ) {
      const y = 626 + row * 56;

      ctx.fillStyle = "#69452f";
      ctx.fillRect(
        1237,
        y,
        486,
        29
      );

      ctx.fillStyle = "#b47b47";
      ctx.fillRect(
        1237,
        y,
        486,
        6
      );

      ctx.fillStyle = "#855938";

      for (
        let x = 1245;
        x < 1710;
        x += 21
      ) {
        ctx.fillRect(
          x,
          y + 14,
          9,
          3
        );
      }
    }

    drawLabel(
      "TEST FIELD",
      1412,
      1001,
      "#ffe8a1"
    );
  }

  function drawFence(
    x,
    y,
    length,
    horizontal
  ) {
    ctx.fillStyle = "#593823";

    if (horizontal) {
      for (
        let fenceX = x;
        fenceX < x + length;
        fenceX += 34
      ) {
        ctx.fillRect(
          fenceX,
          y - 7,
          9,
          29
        );

        ctx.fillStyle = "#986039";
        ctx.fillRect(
          fenceX + 2,
          y - 5,
          4,
          24
        );

        ctx.fillStyle = "#593823";
      }

      ctx.fillRect(
        x,
        y + 1,
        length,
        7
      );

      ctx.fillRect(
        x,
        y + 13,
        length,
        6
      );
    } else {
      for (
        let fenceY = y;
        fenceY < y + length;
        fenceY += 34
      ) {
        ctx.fillRect(
          x - 7,
          fenceY,
          29,
          9
        );

        ctx.fillStyle = "#986039";
        ctx.fillRect(
          x - 5,
          fenceY + 2,
          24,
          4
        );

        ctx.fillStyle = "#593823";
      }

      ctx.fillRect(
        x + 1,
        y,
        7,
        length
      );

      ctx.fillRect(
        x + 13,
        y,
        6,
        length
      );
    }
  }

  function drawFlowerPatch(
    x,
    y,
    amount
  ) {
    const colors = [
      "#edc75f",
      "#e9868f",
      "#d6a1df",
      "#f3eee0",
      "#de7954"
    ];

    for (let i = 0; i < amount; i++) {
      const flowerX =
        x + (i % 4) * 17;

      const flowerY =
        y + Math.floor(i / 4) * 18;

      ctx.fillStyle = "#3c763e";
      ctx.fillRect(
        flowerX + 4,
        flowerY + 7,
        3,
        9
      );

      ctx.fillStyle =
        colors[i % colors.length];

      ctx.fillRect(
        flowerX + 1,
        flowerY + 2,
        5,
        5
      );

      ctx.fillRect(
        flowerX + 6,
        flowerY,
        5,
        5
      );

      ctx.fillStyle = "#f7d75c";
      ctx.fillRect(
        flowerX + 5,
        flowerY + 4,
        3,
        3
      );
    }
  }

  function drawTrees() {
    treePositions.forEach(
      (tree, index) => {
        /* 나무 그림자 */
        ctx.fillStyle =
          "rgba(36,52,28,.25)";

        ctx.fillRect(
          tree.x - 27,
          tree.y + 23,
          58,
          10
        );

        /* 줄기 */
        ctx.fillStyle = "#4a2d1d";

        ctx.fillRect(
          tree.x - 9,
          tree.y - 4,
          18,
          39
        );

        ctx.fillStyle = "#805033";

        ctx.fillRect(
          tree.x - 5,
          tree.y - 4,
          7,
          36
        );

        ctx.fillStyle = "#a16a3d";

        ctx.fillRect(
          tree.x - 3,
          tree.y + 2,
          3,
          18
        );

        /* 나뭇잎 바깥쪽 */
        ctx.fillStyle = "#254e31";

        ctx.fillRect(
          tree.x - 30,
          tree.y - 35,
          60,
          33
        );

        ctx.fillRect(
          tree.x - 23,
          tree.y - 50,
          46,
          21
        );

        /* 중간 잎 */
        ctx.fillStyle =
          index % 3 === 0
            ? "#438345"
            : "#39773e";

        ctx.fillRect(
          tree.x - 24,
          tree.y - 41,
          48,
          34
        );

        ctx.fillRect(
          tree.x - 17,
          tree.y - 57,
          34,
          25
        );

        /* 밝은 잎 */
        ctx.fillStyle =
          index % 4 === 0
            ? "#70aa4e"
            : "#589849";

        ctx.fillRect(
          tree.x - 17,
          tree.y - 47,
          16,
          13
        );

        ctx.fillRect(
          tree.x + 5,
          tree.y - 34,
          13,
          11
        );

        ctx.fillRect(
          tree.x - 8,
          tree.y - 57,
          12,
          9
        );

        /* 작은 열매 */
        if (index % 5 === 0) {
          ctx.fillStyle = "#d9664e";

          ctx.fillRect(
            tree.x - 15,
            tree.y - 25,
            5,
            5
          );

          ctx.fillRect(
            tree.x + 11,
            tree.y - 39,
            5,
            5
          );
        }
      }
    );
  }
    function drawSamples() {
    baseSamples.forEach(
      (item, index) => {
        if (
          state.collectedToday.includes(
            item.key
          )
        ) {
          return;
        }

        const sample = DATA.samples.find(
          entry =>
            entry.id === item.sample
        );

        const pulse =
          1 +
          Math.floor(
            (Math.sin(
              performance.now() / 280 +
                item.x
            ) +
              1) *
              1.5
          );

        /* 표본 주위 빛 */
        ctx.fillStyle =
          "rgba(255,238,129,.18)";

        ctx.fillRect(
          item.x - 13 - pulse,
          item.y - 14 - pulse,
          27 + pulse * 2,
          28 + pulse * 2
        );

        /* 줄기 */
        ctx.fillStyle = "#315f38";

        ctx.fillRect(
          item.x - 2,
          item.y - 2,
          4,
          13
        );

        /* 잎 */
        ctx.fillStyle = sample.color;

        ctx.fillRect(
          item.x - 10,
          item.y - 7,
          9,
          8
        );

        ctx.fillRect(
          item.x + 1,
          item.y - 12,
          10,
          9
        );

        ctx.fillStyle = "#b8d878";

        ctx.fillRect(
          item.x - 7,
          item.y - 6,
          4,
          3
        );

        ctx.fillRect(
          item.x + 4,
          item.y - 10,
          4,
          3
        );

        /* 일부 표본의 꽃 또는 버섯 */
        if (index % 3 === 0) {
          ctx.fillStyle = "#ec9b8d";

          ctx.fillRect(
            item.x - 4,
            item.y - 15,
            8,
            6
          );

          ctx.fillStyle = "#f5df72";

          ctx.fillRect(
            item.x - 1,
            item.y - 13,
            3,
            3
          );
        }
      }
    );
  }

  function drawPlots() {
    for (
      let i = 0;
      i < state.unlockedPlots;
      i++
    ) {
      const position =
        plotPosition(i);

      const plot =
        state.plots[i];

      /* 밭 그림자 */
      ctx.fillStyle =
        "rgba(55,34,23,.28)";

      ctx.fillRect(
        position.x - 37,
        position.y - 25,
        76,
        61
      );

      /* 밭 외곽 */
      ctx.fillStyle = "#543620";

      ctx.fillRect(
        position.x - 38,
        position.y - 31,
        76,
        62
      );

      /* 흙 */
      ctx.fillStyle = plot.watered
        ? "#553c2d"
        : "#795035";

      ctx.fillRect(
        position.x - 33,
        position.y - 26,
        66,
        52
      );

      /* 밭고랑 */
      ctx.fillStyle = plot.watered
        ? "#73543d"
        : "#a36d42";

      for (
        let row = -19;
        row <= 19;
        row += 13
      ) {
        ctx.fillRect(
          position.x - 29,
          position.y + row,
          58,
          4
        );
      }

      /* 물 반짝임 */
      if (plot.watered) {
        ctx.fillStyle = "#789398";

        ctx.fillRect(
          position.x - 23,
          position.y - 16,
          10,
          2
        );

        ctx.fillRect(
          position.x + 8,
          position.y + 11,
          13,
          2
        );
      }

      if (!plot.crop) {
        /* 비어 있는 밭의 작은 씨앗 표시 */
        ctx.fillStyle = "#c79654";

        ctx.fillRect(
          position.x - 2,
          position.y - 2,
          4,
          3
        );

        continue;
      }

      const crop = DATA.crops.find(
        entry =>
          entry.id === plot.crop
      );

      const stage = Math.min(
        3,
        Math.floor(
          (plot.age / crop.grow) * 4
        )
      );

      drawCropSprite(
        position.x,
        position.y,
        crop,
        stage,
        plot.age >= crop.grow,
        plot.health
      );

      /* 약품 처리 표시 */
      if (plot.treatment) {
        ctx.fillStyle =
          "rgba(213,241,116,.38)";

        ctx.fillRect(
          position.x - 23,
          position.y - 38,
          46,
          5
        );

        ctx.fillStyle = "#e8ee8a";

        ctx.fillRect(
          position.x - 4,
          position.y - 42,
          8,
          8
        );
      }
    }
  }

  function drawCropSprite(
    x,
    y,
    crop,
    stage,
    ready,
    health
  ) {
    const healthy =
      health >= 50;

    const leafColor = healthy
      ? "#397745"
      : "#8b7939";

    const leafLight = healthy
      ? "#69a84f"
      : "#b09a4c";

    /* 줄기 */
    ctx.fillStyle = leafColor;

    ctx.fillRect(
      x - 3,
      y - 8 - stage * 5,
      6,
      22 + stage * 5
    );

    if (stage >= 1) {
      /* 왼쪽 잎 */
      ctx.fillStyle = leafColor;

      ctx.fillRect(
        x - 16,
        y - 6 - stage * 4,
        14,
        8
      );

      ctx.fillStyle = leafLight;

      ctx.fillRect(
        x - 13,
        y - 8 - stage * 4,
        9,
        6
      );

      /* 오른쪽 잎 */
      ctx.fillStyle = leafColor;

      ctx.fillRect(
        x + 2,
        y - 15 - stage * 4,
        15,
        8
      );

      ctx.fillStyle = leafLight;

      ctx.fillRect(
        x + 4,
        y - 17 - stage * 4,
        9,
        6
      );
    }

    if (stage >= 2) {
      ctx.fillStyle = leafColor;

      ctx.fillRect(
        x - 12,
        y - 27 - stage * 3,
        10,
        8
      );

      ctx.fillRect(
        x + 2,
        y - 32 - stage * 2,
        11,
        8
      );
    }

    if (stage === 0) {
      ctx.fillStyle = "#6d9c48";

      ctx.fillRect(
        x - 7,
        y - 4,
        7,
        6
      );

      ctx.fillRect(
        x + 1,
        y - 8,
        7,
        6
      );
    }

    if (ready) {
      /* 수확 가능한 열매나 꽃 */
      ctx.fillStyle = crop.color;

      ctx.fillRect(
        x - 10,
        y - 38,
        9,
        9
      );

      ctx.fillRect(
        x + 2,
        y - 43,
        10,
        10
      );

      ctx.fillRect(
        x - 3,
        y - 50,
        9,
        9
      );

      ctx.fillStyle = "#ffe593";

      ctx.fillRect(
        x,
        y - 47,
        3,
        3
      );

      /* 수확 가능 반짝임 */
      ctx.fillStyle = "#fff5bd";

      ctx.fillRect(
        x - 18,
        y - 45,
        3,
        7
      );

      ctx.fillRect(
        x - 20,
        y - 43,
        7,
        3
      );
    }
  }

  function drawStations() {
    stations.forEach(
      (station, index) => {
        const selected =
          interactionTarget?.kind ===
            "station" &&
          interactionTarget.id ===
            station.id;

        if (selected) {
          ctx.fillStyle =
            "rgba(255,237,130,.46)";

          ctx.fillRect(
            station.x - 27,
            station.y - 29,
            54,
            58
          );
        }

        if (station.type === "bed") {
          drawBedStation(station);
          return;
        }

        if (station.type === "pond") {
          drawPondStation(station);
          return;
        }

        drawLabStation(
          station,
          index
        );
      }
    );
  }

  function drawBedStation(station) {
    ctx.fillStyle =
      "rgba(53,35,24,.27)";

    ctx.fillRect(
      station.x - 31,
      station.y + 17,
      66,
      9
    );

    ctx.fillStyle = "#553521";

    ctx.fillRect(
      station.x - 32,
      station.y - 22,
      64,
      45
    );

    ctx.fillStyle = "#d7b66f";

    ctx.fillRect(
      station.x - 26,
      station.y - 16,
      52,
      33
    );

    ctx.fillStyle = "#f3e5b5";

    ctx.fillRect(
      station.x - 21,
      station.y - 12,
      17,
      25
    );

    ctx.fillStyle = "#69916a";

    ctx.fillRect(
      station.x,
      station.y - 12,
      21,
      25
    );

    ctx.fillStyle = "#9bb389";

    ctx.fillRect(
      station.x + 4,
      station.y - 8,
      13,
      17
    );
  }

  function drawPondStation(station) {
    ctx.fillStyle = "#4b3322";

    ctx.fillRect(
      station.x - 27,
      station.y - 8,
      54,
      19
    );

    ctx.fillStyle = "#98603a";

    ctx.fillRect(
      station.x - 22,
      station.y - 4,
      44,
      20
    );

    ctx.fillStyle = "#b47b48";

    ctx.fillRect(
      station.x - 16,
      station.y,
      32,
      12
    );

    ctx.fillStyle = "#d4ae6c";

    ctx.fillRect(
      station.x - 12,
      station.y + 2,
      24,
      3
    );
  }

  function drawLabStation(
    station,
    index
  ) {
    /* 실험대 그림자 */
    ctx.fillStyle =
      "rgba(38,43,33,.28)";

    ctx.fillRect(
      station.x - 22,
      station.y + 18,
      48,
      8
    );

    /* 실험대 몸체 */
    ctx.fillStyle = "#394a47";

    ctx.fillRect(
      station.x - 22,
      station.y - 19,
      44,
      39
    );

    ctx.fillStyle = "#799b8c";

    ctx.fillRect(
      station.x - 17,
      station.y - 14,
      34,
      29
    );

    /* 화면 */
    ctx.fillStyle = "#263b3d";

    ctx.fillRect(
      station.x - 13,
      station.y - 11,
      26,
      16
    );

    ctx.fillStyle =
      index % 2 === 0
        ? "#9dd5af"
        : "#83c4cc";

    ctx.fillRect(
      station.x - 9,
      station.y - 8,
      18,
      10
    );

    /* 화면 픽셀 */
    ctx.fillStyle = "#e1f5c5";

    ctx.fillRect(
      station.x - 7,
      station.y - 6,
      8,
      2
    );

    ctx.fillRect(
      station.x - 7,
      station.y - 2,
      12,
      2
    );

    /* 버튼 */
    ctx.fillStyle = "#d7a342";

    ctx.fillRect(
      station.x - 11,
      station.y + 9,
      5,
      4
    );

    ctx.fillStyle = "#c85b4d";

    ctx.fillRect(
      station.x - 2,
      station.y + 9,
      5,
      4
    );

    ctx.fillStyle = "#74b75c";

    ctx.fillRect(
      station.x + 7,
      station.y + 9,
      5,
      4
    );

    /* 기계 다리 */
    ctx.fillStyle = "#283733";

    ctx.fillRect(
      station.x - 17,
      station.y + 19,
      7,
      8
    );

    ctx.fillRect(
      station.x + 10,
      station.y + 19,
      7,
      8
    );
  }

  function drawNpcs() {
    DATA.npcs.forEach(
      (npc, index) => {
        drawCharacter(
          npc.x,
          npc.y,
          npc.color,
          npc.name,
          false,
          index
        );
      }
    );
  }

  function drawPlayer() {
    const role =
      DATA.roles[state.player.role];

    drawCharacter(
      state.player.x,
      state.player.y,
      role.color,
      state.player.name,
      true,
      0
    );

    /* 플레이어가 바라보는 방향 */
    const direction =
      state.player.dir;

    ctx.fillStyle = "#fff0a4";

    if (direction === "up") {
      ctx.fillRect(
        state.player.x - 2,
        state.player.y - 36,
        5,
        5
      );
    }

    if (direction === "down") {
      ctx.fillRect(
        state.player.x - 2,
        state.player.y + 26,
        5,
        5
      );
    }

    if (direction === "left") {
      ctx.fillRect(
        state.player.x - 27,
        state.player.y - 2,
        5,
        5
      );
    }

    if (direction === "right") {
      ctx.fillRect(
        state.player.x + 22,
        state.player.y - 2,
        5,
        5
      );
    }
  }

  function drawCharacter(
    x,
    y,
    color,
    name,
    player,
    variant = 0
  ) {
    const walking =
      Math.floor(
        performance.now() / 180
      ) % 2;

    const moving =
      player &&
      (
        keys.arrowup ||
        keys.arrowdown ||
        keys.arrowleft ||
        keys.arrowright ||
        keys.w ||
        keys.a ||
        keys.s ||
        keys.d
      );

    const step =
      moving ? walking * 2 : 0;

    /* 그림자 */
    ctx.fillStyle =
      "rgba(42,35,25,.28)";

    ctx.fillRect(
      x - 15,
      y + 20,
      30,
      7
    );

    ctx.fillRect(
      x - 10,
      y + 25,
      20,
      3
    );

    /* 다리 */
    ctx.fillStyle = "#3c3530";

    ctx.fillRect(
      x - 10,
      y + 12 + step,
      8,
      14 - step
    );

    ctx.fillRect(
      x + 3,
      y + 14 - step,
      8,
      12 + step
    );

    /* 신발 */
    ctx.fillStyle = "#39271d";

    ctx.fillRect(
      x - 12,
      y + 23,
      10,
      5
    );

    ctx.fillRect(
      x + 3,
      y + 23,
      11,
      5
    );

    /* 몸통 외곽 */
    ctx.fillStyle = "#35302b";

    ctx.fillRect(
      x - 14,
      y - 5,
      28,
      23
    );

    /* 연구복 */
    ctx.fillStyle = color;

    ctx.fillRect(
      x - 11,
      y - 3,
      22,
      19
    );

    ctx.fillStyle = "#f3ead3";

    ctx.fillRect(
      x - 7,
      y - 1,
      14,
      16
    );

    /* 연구복 중심선 */
    ctx.fillStyle = "#b8b09f";

    ctx.fillRect(
      x - 1,
      y,
      2,
      15
    );

    /* 주머니 */
    ctx.fillStyle = color;

    ctx.fillRect(
      x + 3,
      y + 7,
      5,
      5
    );

    /* 팔 */
    ctx.fillStyle = color;

    ctx.fillRect(
      x - 16,
      y,
      5,
      15
    );

    ctx.fillRect(
      x + 11,
      y,
      5,
      15
    );

    /* 목 */
    ctx.fillStyle = "#d99a69";

    ctx.fillRect(
      x - 5,
      y - 10,
      10,
      8
    );

    /* 얼굴 외곽 */
    ctx.fillStyle = "#513426";

    ctx.fillRect(
      x - 12,
      y - 27,
      24,
      19
    );

    /* 얼굴 */
    ctx.fillStyle =
      variant % 3 === 0
        ? "#e5a873"
        : variant % 3 === 1
          ? "#d79365"
          : "#efb986";

    ctx.fillRect(
      x - 9,
      y - 24,
      18,
      16
    );

    /* 머리카락 */
    ctx.fillStyle =
      player
        ? "#3a2c25"
        : variant % 2 === 0
          ? "#493226"
          : "#5d4532";

    ctx.fillRect(
      x - 12,
      y - 31,
      24,
      9
    );

    ctx.fillRect(
      x - 12,
      y - 25,
      5,
      9
    );

    ctx.fillRect(
      x + 8,
      y - 25,
      4,
      8
    );

    /* 머리 하이라이트 */
    ctx.fillStyle =
      player
        ? "#65473a"
        : "#786047";

    ctx.fillRect(
      x - 7,
      y - 29,
      10,
      3
    );

    /* 눈 */
    ctx.fillStyle = "#332821";

    ctx.fillRect(
      x - 6,
      y - 19,
      3,
      3
    );

    ctx.fillRect(
      x + 4,
      y - 19,
      3,
      3
    );

    /* 코와 볼 */
    ctx.fillStyle = "#c77e5f";

    ctx.fillRect(
      x - 1,
      y - 15,
      3,
      2
    );

    ctx.fillStyle = "#e68f78";

    ctx.fillRect(
      x - 8,
      y - 14,
      3,
      2
    );

    ctx.fillRect(
      x + 6,
      y - 14,
      3,
      2
    );

    /* 플레이어 배지 */
    if (player) {
      ctx.fillStyle = "#efd153";

      ctx.fillRect(
        x - 9,
        y + 2,
        4,
        4
      );
    }

    drawLabel(
      name,
      x - name.length * 5,
      y - 37,
      "#fff2bb"
    );
  }

  function drawLabel(
    text,
    x,
    y,
    color
  ) {
    ctx.font =
      "bold 12px monospace";

    const width =
      Math.ceil(
        ctx.measureText(text).width
      );

    ctx.fillStyle =
      "rgba(52,39,25,.82)";

    ctx.fillRect(
      x - 5,
      y - 13,
      width + 10,
      18
    );

    ctx.fillStyle = "#bb8547";

    ctx.fillRect(
      x - 3,
      y - 11,
      width + 6,
      2
    );

    ctx.fillStyle = color;

    ctx.fillText(
      text,
      x,
      y + 1
    );
  }

  function drawRain() {
    ctx.strokeStyle =
      "rgba(191,226,231,.72)";

    ctx.lineWidth = 2;

    const time =
      performance.now() / 8;

    for (let i = 0; i < 62; i++) {
      const x =
        (i * 67 + time) %
          (canvas.width + 40) -
        20;

      const y =
        (i * 43 + time * 1.8) %
          (canvas.height + 40) -
        20;

      ctx.beginPath();

      ctx.moveTo(x, y);

      ctx.lineTo(
        x - 8,
        y + 15
      );

      ctx.stroke();
    }
  }
/* =====================================================
   BIO LAB 확장 지도 통합 패치
   파일 마지막의 })(); 바로 위에 붙이기
===================================================== */

function bioRegions() {
  return [
    {
      name: "반딧불 생태숲",
      x: 0, y: 0, w: 1040, h: 930,
      color: "#56844c"
    },
    {
      name: "분자생물학 연구단지",
      x: 0, y: 930, w: 1040, h: 720,
      color: "#86a58a"
    },
    {
      name: "종자 보존림",
      x: 0, y: 1650, w: 1040, h: 550,
      color: "#557344"
    },
    {
      name: "연구 보급거리",
      x: 1040, y: 0, w: 1010, h: 620,
      color: "#b3a174"
    },
    {
      name: "중앙 연구동",
      x: 1040, y: 620, w: 1010, h: 410,
      color: "#83ac60"
    },
    {
      name: "BIO LAB 중앙광장",
      x: 1040, y: 1030, w: 1010, h: 390,
      color: "#a8b17b"
    },
    {
      name: "교육·교류 정원",
      x: 1040, y: 1420, w: 1010, h: 240,
      color: "#8db16b"
    },
    {
      name: "연구원 생활마을",
      x: 1040, y: 1660, w: 1010, h: 540,
      color: "#91a66c"
    },
    {
      name: "유리돔 스마트 온실",
      x: 2050, y: 0, w: 1150, h: 790,
      color: "#78a967"
    },
    {
      name: "기후 관측 고원",
      x: 2050, y: 790, w: 1150, h: 340,
      color: "#8b9b6b"
    },
    {
      name: "대규모 시험 재배지",
      x: 2050, y: 1130, w: 1150, h: 680,
      color: "#a18a55"
    },
    {
      name: "염생식물 습지",
      x: 2050, y: 1810, w: 1150, h: 390,
      color: "#799a80"
    }
  ];
}

function bioBuildings() {
  return [
    {
      x: 1240, y: 660, w: 590, h: 315,
      name: "중앙 연구동", roof: "#a95843"
    },
    {
      x: 1190, y: 150, w: 330, h: 240,
      name: "종자 상점", roof: "#ad6346"
    },
    {
      x: 1600, y: 190, w: 300, h: 230,
      name: "연구 보급소", roof: "#6b887c"
    },
    {
      x: 130, y: 1040, w: 430, h: 230,
      name: "분자 연구실", roof: "#648397"
    },
    {
      x: 610, y: 1040, w: 310, h: 180,
      name: "관찰 연구실", roof: "#738b98"
    },
    {
      x: 340, y: 1740, w: 370, h: 270,
      name: "종자 보존고", roof: "#747450"
    },
    {
      x: 1180, y: 1760, w: 330, h: 220,
      name: "연구원 숙소", roof: "#b06c4b"
    },
    {
      x: 1640, y: 1760, w: 280, h: 220,
      name: "작은 도서관", roof: "#957250"
    },
    {
      x: 2190, y: 150, w: 470, h: 360,
      name: "스마트 온실", roof: "#76aaa0"
    },
    {
      x: 2740, y: 190, w: 350, h: 300,
      name: "배양 연구동", roof: "#6c9a94"
    },
    {
      x: 2700, y: 690, w: 350, h: 150,
      name: "기후 관측소", roof: "#8b7e68"
    }
  ];
}

/* 새 지도에 맞는 지역 이름 */
function zoneAt(x, y) {
  const region = bioRegions().find(item =>
    x >= item.x &&
    x < item.x + item.w &&
    y >= item.y &&
    y < item.y + item.h
  );

  return region ? region.name : "BIO LAB 연구지구";
}

/* 작물 재배 위치 */
function plotPosition(index) {
  return {
    x: 2240 + (index % 4) * 165,
    y: 1250 + Math.floor(index / 4) * 150
  };
}

/* 건물·연못·나무 충돌 */
function blocked(x, y) {
  const insidePond =
    ((x - 500) ** 2) / (260 ** 2) +
    ((y - 520) ** 2) / (170 ** 2) < 0.85;

  if (insidePond) return true;

  const insideBuilding = bioBuildings().some(item =>
    x > item.x - 10 &&
    x < item.x + item.w + 10 &&
    y > item.y - 8 &&
    y < item.y + item.h + 10
  );

  if (insideBuilding) return true;

  return treePositions.some(tree =>
    Math.abs(x - tree.x) < 18 &&
    Math.abs(y - tree.y) < 14
  );
}

/* 화면 밖 물체는 그리지 않기 */
function bioVisible(x, y, w, h) {
  return (
    x + w >= camera.x - 80 &&
    y + h >= camera.y - 80 &&
    x <= camera.x + canvas.width + 80 &&
    y <= camera.y + canvas.height + 80
  );
}

function bioRect(x, y, w, h, color) {
  ctx.fillStyle = color;

  ctx.fillRect(
    Math.floor(x),
    Math.floor(y),
    Math.floor(w),
    Math.floor(h)
  );
}

/* 흙길 */
function bioPath(x, y, w, h) {
  bioRect(x - 5, y - 5, w + 10, h + 10, "#8c8150");
  bioRect(x, y, w, h, "#c8ad74");

  const left = Math.max(x, Math.floor(camera.x / 32) * 32);
  const top = Math.max(y, Math.floor(camera.y / 32) * 32);
  const right = Math.min(x + w, camera.x + canvas.width + 32);
  const bottom = Math.min(y + h, camera.y + canvas.height + 32);

  for (let yy = top; yy < bottom; yy += 32) {
    for (let xx = left; xx < right; xx += 32) {
      const pattern =
        Math.floor(xx / 32) + Math.floor(yy / 32);

      if (pattern % 3 === 0) {
        bioRect(xx + 7, yy + 9, 5, 3, "#ac915f");
        bioRect(xx + 17, yy + 22, 3, 2, "#dfc58c");
      }
    }
  }
}

/* 지역별 바닥·길·연못 */
function bioDrawGround() {
  bioRegions().forEach(region => {
    if (!bioVisible(region.x, region.y, region.w, region.h)) {
      return;
    }

    bioRect(
      region.x,
      region.y,
      region.w,
      region.h,
      region.color
    );
  });

  const startX = Math.max(0, Math.floor(camera.x / 24) * 24);
  const startY = Math.max(0, Math.floor(camera.y / 24) * 24);
  const endX = Math.min(WORLD.width, camera.x + canvas.width + 24);
  const endY = Math.min(WORLD.height, camera.y + canvas.height + 24);

  for (let y = startY; y < endY; y += 24) {
    for (let x = startX; x < endX; x += 24) {
      const pattern = (
        Math.floor(x / 24) * 13 +
        Math.floor(y / 24) * 19
      ) % 23;

      if (pattern < 5) {
        bioRect(x + 4, y + 7, 3, 6, "rgba(37,75,34,.25)");
        bioRect(x + 9, y + 10, 3, 3, "rgba(225,238,166,.3)");
      }

      if (pattern === 12) {
        bioRect(x + 14, y + 12, 3, 3, "#ead798");
        bioRect(x + 15, y + 15, 2, 4, "#507744");
      }
    }
  }

  /* 지역을 연결하는 큰길 */
  bioPath(990, 0, 100, WORLD.height);
  bioPath(1995, 0, 110, WORLD.height);
  bioPath(0, 880, WORLD.width, 92);
  bioPath(0, 1600, WORLD.width, 92);
  bioPath(1440, 420, 110, 1780);
  bioPath(990, 1080, 1115, 92);

  /* 중앙광장 */
  if (bioVisible(1190, 990, 670, 500)) {
    bioRect(1190, 990, 670, 500, "#947f5a");
    bioRect(1200, 1000, 650, 480, "#c4b284");

    for (let y = 1000; y < 1480; y += 32) {
      for (let x = 1200; x < 1850; x += 32) {
        bioRect(x + 2, y + 2, 28, 28, "#d2bf92");
      }
    }
  }

  /* 생태숲 연못 */
  ctx.fillStyle = "#456f6b";
  ctx.beginPath();
  ctx.ellipse(500, 520, 280, 190, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#539b9b";
  ctx.beginPath();
  ctx.ellipse(500, 514, 258, 170, 0, 0, Math.PI * 2);
  ctx.fill();

  const wave = Math.floor(performance.now() / 350) % 3;

  for (let i = 0; i < 12; i++) {
    const x = 310 + ((i * 73) % 360);
    const y = 420 + ((i * 47) % 180);

    bioRect(x + wave * 3, y, 20, 3, "#8bbfba");
  }

  /* 습지 물웅덩이 */
  for (let i = 0; i < 7; i++) {
    bioRect(
      2130 + i * 135,
      1900 + (i % 2) * 55,
      100,
      34,
      "#65918f"
    );
  }
}

/* 건물은 내부 대신 지붕과 외벽 표시 */
function bioDrawBuilding(building) {
  const { x, y, w, h, roof, name } = building;

  if (!bioVisible(x - 20, y - 30, w + 40, h + 70)) {
    return;
  }

  const roofHeight = Math.min(100, Math.floor(h * 0.45));
  const doorX = Math.floor(x + w / 2 - 18);
  const doorY = y + h - 55;

  bioRect(x + 12, y + 18, w, h + 12, "rgba(37,40,26,.28)");
  bioRect(x, y + roofHeight, w, h - roofHeight, "#59432c");

  bioRect(
    x + 7,
    y + roofHeight,
    w - 14,
    h - roofHeight - 7,
    "#d2ae71"
  );

  /* 목재 외벽 결 */
  for (let yy = y + roofHeight + 12; yy < y + h - 5; yy += 14) {
    bioRect(x + 8, yy, w - 16, 2, "#ba955d");
  }

  /* 기와지붕 */
  bioRect(x - 12, y, w + 24, roofHeight, "#4b3b2b");
  bioRect(x - 7, y + 6, w + 14, roofHeight - 12, roof);

  for (let yy = y + 14; yy < y + roofHeight - 5; yy += 16) {
    bioRect(x - 5, yy, w + 10, 3, "rgba(54,38,29,.3)");

    for (let xx = x + 8; xx < x + w; xx += 28) {
      bioRect(xx, yy - 9, 2, 9, "rgba(255,230,182,.22)");
    }
  }

  /* 창문 */
  [x + 30, x + w - 74].forEach(windowX => {
    const windowY = y + roofHeight + 18;

    bioRect(windowX, windowY, 44, 44, "#62472d");
    bioRect(windowX + 5, windowY + 5, 34, 34, "#9fc9bc");
    bioRect(windowX + 20, windowY + 5, 4, 34, "#eee0b4");
    bioRect(windowX + 5, windowY + 20, 34, 4, "#eee0b4");
    bioRect(windowX - 3, windowY + 43, 50, 5, "#735332");
  });

  /* 문과 계단 */
  bioRect(doorX - 5, doorY - 5, 46, 60, "#60452b");
  bioRect(doorX, doorY, 36, 55, "#94683e");
  bioRect(doorX + 6, doorY + 6, 24, 25, "#b8c6a0");
  bioRect(doorX + 27, doorY + 38, 4, 4, "#f1d47b");
  bioRect(doorX - 12, y + h, 60, 8, "#b29a73");
  bioRect(doorX - 18, y + h + 8, 72, 8, "#917f60");

  /* 건물 간판 */
  ctx.font = "bold 13px sans-serif";
  const labelWidth = Math.ceil(ctx.measureText(name).width) + 24;

  bioRect(
    x + w / 2 - labelWidth / 2,
    y - 25,
    labelWidth,
    25,
    "#59452d"
  );

  bioRect(
    x + w / 2 - labelWidth / 2 + 3,
    y - 22,
    labelWidth - 6,
    19,
    "#82633a"
  );

  ctx.fillStyle = "#fff0b9";
  ctx.textAlign = "center";
  ctx.fillText(name, x + w / 2, y - 8);
  ctx.textAlign = "left";
}

/* 야외 실험 시설 */
function bioDrawStations() {
  stations.forEach(station => {
    if (!bioVisible(station.x - 35, station.y - 60, 100, 110)) {
      return;
    }

    const x = station.x;
    const y = station.y;

    bioRect(x - 25, y + 10, 56, 10, "rgba(31,43,30,.25)");
    bioRect(x - 24, y - 18, 48, 32, "#5b4b34");
    bioRect(x - 20, y - 22, 40, 28, "#d9d4b3");
    bioRect(x - 14, y - 35, 28, 21, "#425b56");
    bioRect(x - 9, y - 30, 18, 11, "#9bd3ba");
    bioRect(x + 11, y - 8, 5, 5, "#e8bc62");

    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#332b20";
    ctx.fillText(station.name, x, y - 45);
    ctx.textAlign = "left";
  });
}

/* 전체 지도와 플레이어 위치 */
function bioDrawMiniMap() {
  const width = Math.min(166, canvas.width * 0.27);
  const height = width * WORLD.height / WORLD.width;
  const x = canvas.width - width - 15;
  const y = 16;
  const sx = width / WORLD.width;
  const sy = height / WORLD.height;

  ctx.save();

  bioRect(x - 5, y - 5, width + 10, height + 10, "#463a29");

  bioRegions().forEach(region => {
    bioRect(
      x + region.x * sx,
      y + region.y * sy,
      region.w * sx + 1,
      region.h * sy + 1,
      region.color
    );
  });

  bioBuildings().forEach(building => {
    bioRect(
      x + building.x * sx,
      y + building.y * sy,
      Math.max(3, building.w * sx),
      Math.max(3, building.h * sy),
      "#654d39"
    );
  });

  stations.forEach(station => {
    bioRect(
      x + station.x * sx - 1,
      y + station.y * sy - 1,
      3,
      3,
      "#ffe5a1"
    );
  });

  ctx.strokeStyle = "#fff3ce";
  ctx.lineWidth = 1;

  ctx.strokeRect(
    x + camera.x * sx,
    y + camera.y * sy,
    canvas.width * sx,
    canvas.height * sy
  );

  bioRect(
    x + state.player.x * sx - 2,
    y + state.player.y * sy - 2,
    5,
    5,
    "#e64f49"
  );

  ctx.restore();
}

/* 기존 화면 그리기를 확장 지도 버전으로 교체 */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  ctx.save();

  ctx.translate(
    -Math.floor(camera.x),
    -Math.floor(camera.y)
  );

  bioDrawGround();
  bioBuildings().forEach(bioDrawBuilding);

  drawTrees();
  drawSamples();
  drawPlots();
  bioDrawStations();
  drawNpcs();
  drawPlayer();

  ctx.restore();

  drawLightOverlay();

  if (state.weather === "rain") {
    drawRain();
  }

  bioDrawMiniMap();
}

/* 기존 시설 기능은 보존하고 새 실험 시설만 연결 */
const bioPreviousUseStation = useStation;

useStation = function(station) {
  const extraExperiments = [
    "gel",
    "sequence",
    "enzyme",
    "contamination",
    "cross",
    "climate"
  ];

  if (extraExperiments.includes(station.type)) {
    return openMinigame(station.type, false);
  }

  return bioPreviousUseStation(station);
};

/* BIO LAB 확장 지도 통합 패치 끝 */
/* =====================================================
   BIO LAB · WARM PIXEL V6
   참고 이미지의 배치·건물은 복제하지 않는 독자 그래픽
===================================================== */

/* 위치에 따라 항상 같은 무늬를 만드는 함수 */
function warmNoise(x, y, seed = 0) {
  let n =
    Math.imul(x | 0, 374761393) ^
    Math.imul(y | 0, 668265263) ^
    seed;

  n = Math.imul(n ^ (n >>> 13), 1274126177);

  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/* 정수 좌표로 그려 도트 가장자리 유지 */
function warmBox(x, y, w, h, color) {
  ctx.fillStyle = color;

  ctx.fillRect(
    Math.round(x),
    Math.round(y),
    Math.round(w),
    Math.round(h)
  );
}

function warmFlower(x, y, color) {
  warmBox(x, y, 2, 7, "#466e36");
  warmBox(x - 3, y - 3, 8, 3, color);
  warmBox(x, y - 6, 3, 9, color);
  warmBox(x, y - 3, 2, 2, "#f6d477");
}

/* 흙길: 가장자리와 작은 자갈 */
function warmPath(x, y, w, h) {
  warmBox(x - 4, y - 4, w + 8, h + 8, "#9a944d");
  warmBox(x, y, w, h, "#d8b875");

  const left = Math.max(
    x,
    Math.floor(camera.x / 16) * 16
  );

  const top = Math.max(
    y,
    Math.floor(camera.y / 16) * 16
  );

  const right = Math.min(
    x + w,
    camera.x + canvas.width + 16
  );

  const bottom = Math.min(
    y + h,
    camera.y + canvas.height + 16
  );

  for (let yy = top; yy < bottom; yy += 16) {
    for (let xx = left; xx < right; xx += 16) {
      const n = warmNoise(xx, yy);

      if (n < 0.4) {
        warmBox(xx + 4, yy + 7, 3, 2, "#bda066");
      }

      if (n > 0.7) {
        warmBox(xx + 9, yy + 3, 4, 2, "#edcf8e");
      }
    }
  }
}

/* 지역별 지면 전체 교체 */
function bioDrawGround() {
  const colors = [
    "#668b42",
    "#8f9f65",
    "#557a3c",
    "#9ba66b",
    "#83a34e",
    "#9dad65",
    "#79a24d",
    "#8da556",
    "#76a34d",
    "#95a165",
    "#9f8652",
    "#7c9871"
  ];

  bioRegions().forEach((region, index) => {
    warmBox(
      region.x,
      region.y,
      region.w,
      region.h,
      colors[index]
    );
  });

  /* 현재 화면 주변의 잔디만 그리기 */
  const startX = Math.max(
    0,
    Math.floor(camera.x / 16) * 16
  );

  const startY = Math.max(
    0,
    Math.floor(camera.y / 16) * 16
  );

  const endX = Math.min(
    WORLD.width,
    camera.x + canvas.width + 16
  );

  const endY = Math.min(
    WORLD.height,
    camera.y + canvas.height + 16
  );

  for (let y = startY; y < endY; y += 16) {
    for (let x = startX; x < endX; x += 16) {
      const n = warmNoise(x, y, 16);

      if (n < 0.52) {
        warmBox(
          x + 3, y + 5,
          2, 5,
          "#6c903d"
        );

        warmBox(
          x + 6, y + 3,
          2, 7,
          "#9eb951"
        );

        warmBox(
          x + 9, y + 8,
          3, 2,
          "#b4c66a"
        );
      }

      if (n > 0.975) {
        warmFlower(
          x + 7,
          y + 8,
          "#e9dfb0"
        );
      }
    }
  }

  /* 기존 이동 경로 유지 */
  warmPath(990, 0, 100, WORLD.height);
  warmPath(1995, 0, 110, WORLD.height);
  warmPath(0, 880, WORLD.width, 92);
  warmPath(0, 1600, WORLD.width, 92);
  warmPath(1440, 420, 110, 1780);
  warmPath(990, 1080, 1115, 92);

  /* 중앙광장 석재 바닥 */
  warmBox(
    1190, 990,
    670, 500,
    "#92835e"
  );

  for (let y = 994; y < 1486; y += 24) {
    for (let x = 1194; x < 1854; x += 32) {
      const n = warmNoise(x, y);

      warmBox(
        x + 1,
        y + 1,
        29,
        21,
        n > 0.5 ? "#cfbc8a" : "#c4af7c"
      );

      warmBox(
        x + 3,
        y + 2,
        24,
        2,
        "#dfcd9c"
      );
    }
  }

  /* 계단식 도트로 만드는 연못 가장자리 */
  for (let row = -23; row <= 23; row++) {
    const half =
      Math.floor(
        Math.sqrt(
          Math.max(
            0,
            1 - (row / 24) ** 2
          )
        ) * 35
      ) * 8;

    warmBox(
      500 - half,
      520 + row * 8,
      half * 2,
      8,
      "#596d42"
    );

    if (half > 24) {
      warmBox(
        524 - half,
        520 + row * 8,
        half * 2 - 48,
        8,
        "#4a8f8a"
      );
    }

    if (
      half > 64 &&
      row > -18 &&
      row < 18
    ) {
      warmBox(
        548 - half,
        520 + row * 8,
        half * 2 - 96,
        8,
        "#5baba0"
      );
    }
  }

  /* 잔잔한 수면 */
  const wave =
    Math.floor(performance.now() / 450) % 3;

  for (let i = 0; i < 18; i++) {
    const x = 330 + (i * 71) % 330;
    const y = 420 + (i * 43) % 190;

    warmBox(
      x + wave * 2,
      y,
      12 + i % 3 * 4,
      2,
      "#9ac9b4"
    );
  }

  /* 연구 정원과 온실 앞 화단 */
  const flowerBeds = [
    [1130, 1510],
    [1660, 1510],
    [2140, 650],
    [2850, 650]
  ];

  flowerBeds.forEach(([x, y]) => {
    warmBox(
      x - 5, y - 5,
      128, 48,
      "#937345"
    );

    warmBox(
      x, y,
      118, 38,
      "#654c30"
    );

    for (let i = 0; i < 12; i++) {
      warmFlower(
        x + 7 + i % 6 * 20,
        y + 10 + Math.floor(i / 6) * 20,
        i % 2 ? "#dba56f" : "#cf91ab"
      );
    }
  });
}

/* 건물 전체 외관 교체 */
function bioDrawBuilding(building) {
  const {
    x, y, w, h, name
  } = building;

  if (
    !bioVisible(
      x - 30,
      y - 60,
      w + 60,
      h + 110
    )
  ) {
    return;
  }

  const glass = /온실|배양/.test(name);

  const roofHeight = Math.min(
    110,
    Math.floor(h * 0.44)
  );

  const roofColor = glass
    ? "#6b9681"
    : /숙소|상점/.test(name)
      ? "#a65d3b"
      : "#637d7c";

  /* 건물 아래 그림자 */
  warmBox(
    x + 14,
    y + 24,
    w + 7,
    h + 5,
    "rgba(40,41,25,.25)"
  );

  /* 외벽과 기초 */
  warmBox(
    x,
    y + roofHeight,
    w,
    h - roofHeight,
    "#58452e"
  );

  warmBox(
    x + 6,
    y + roofHeight,
    w - 12,
    h - roofHeight - 8,
    "#c7a16a"
  );

  /* 세로 목재 판자와 나뭇결 */
  for (
    let xx = x + 10;
    xx < x + w - 8;
    xx += 12
  ) {
    warmBox(
      xx,
      y + roofHeight + 3,
      2,
      h - roofHeight - 12,
      "#aa804f"
    );

    warmBox(
      xx + 3,
      y + roofHeight + 3,
      2,
      h - roofHeight - 12,
      "#d7b77e"
    );

    if (warmNoise(xx, y) > 0.5) {
      warmBox(
        xx + 4,
        y + h - 28,
        4,
        3,
        "#9c7549"
      );
    }
  }

  /* 지붕 윤곽 */
  warmBox(
    x - 12,
    y + 12,
    w + 24,
    roofHeight - 8,
    "#493d2d"
  );

  /* 기와 또는 유리 패널 */
  for (
    let row = 0;
    row < roofHeight;
    row += 12
  ) {
    const inset = Math.max(
      0,
      Math.floor((roofHeight - row) / 12) * 2
    );

    warmBox(
      x - 8 + inset,
      y + row,
      w + 16 - inset * 2,
      12,
      roofColor
    );

    const offset = row % 24 ? 10 : 0;

    for (
      let xx = x - 6 + inset + offset;
      xx < x + w + 6 - inset;
      xx += 22
    ) {
      const n = warmNoise(xx, row);

      const panelColor = glass
        ? n > 0.5
          ? "#a4c6a6"
          : "#83af9b"
        : n > 0.5
          ? "#be8354"
          : roofColor;

      warmBox(
        xx,
        y + row + 1,
        19,
        8,
        panelColor
      );

      warmBox(
        xx,
        y + row + 1,
        17,
        2,
        glass ? "#c4d7b1" : "#ce9b67"
      );

      warmBox(
        xx + 19,
        y + row + 3,
        2,
        8,
        "#53635b"
      );
    }
  }

  /* 처마 */
  warmBox(
    x - 10,
    y + roofHeight - 2,
    w + 20,
    7,
    "#5a422d"
  );

  warmBox(
    x - 8,
    y + roofHeight - 1,
    w + 16,
    2,
    "#d5af73"
  );

  /* 환기 굴뚝 */
  if (!glass) {
    warmBox(
      x + w - 65,
      y - 20,
      24,
      53,
      "#605f51"
    );

    for (
      let yy = y - 16;
      yy < y + 30;
      yy += 8
    ) {
      warmBox(
        x + w - 63,
        yy,
        20,
        2,
        "#96917c"
      );
    }

    warmBox(
      x + w - 69,
      y - 24,
      32,
      7,
      "#454d45"
    );
  }

  /* 창문과 덧창 */
  [
    x + 28,
    x + w - 74
  ].forEach(windowX => {
    const windowY =
      y + roofHeight + 17;

    warmBox(
      windowX - 5,
      windowY - 3,
      54, 52,
      "#6c7046"
    );

    warmBox(
      windowX,
      windowY,
      44, 44,
      "#58462f"
    );

    warmBox(
      windowX + 4,
      windowY + 4,
      36, 36,
      "#b5cfb1"
    );

    warmBox(
      windowX + 7,
      windowY + 5,
      6, 31,
      "#d8e0b8"
    );

    warmBox(
      windowX + 20,
      windowY + 4,
      3, 36,
      "#e7cc8e"
    );

    warmBox(
      windowX + 4,
      windowY + 20,
      36, 3,
      "#e7cc8e"
    );

    warmBox(
      windowX - 5,
      windowY + 44,
      54, 5,
      "#795734"
    );
  });

  /* 문 */
  const doorX = x + w / 2 - 18;
  const doorY = y + h - 56;

  warmBox(
    doorX - 7,
    doorY - 7,
    50, 63,
    "#6b4d30"
  );

  warmBox(
    doorX,
    doorY,
    36, 56,
    "#9a6d40"
  );

  warmBox(
    doorX + 4,
    doorY + 4,
    28, 24,
    "#cfbc88"
  );

  warmBox(
    doorX + 7,
    doorY + 7,
    22, 18,
    "#8baf9c"
  );

  warmBox(
    doorX + 5,
    doorY + 33,
    26, 17,
    "#805931"
  );

  warmBox(
    doorX + 27,
    doorY + 32,
    4, 4,
    "#edcf79"
  );

  /* 현관 계단 */
  warmBox(
    doorX - 18,
    y + h,
    72, 8,
    "#ae9060"
  );

  warmBox(
    doorX - 24,
    y + h + 8,
    84, 7,
    "#8b7855"
  );

  /* 입구 화분 */
  [
    x + 14,
    x + w - 29
  ].forEach(potX => {
    warmBox(
      potX,
      y + h - 16,
      17, 16,
      "#a45e3d"
    );

    warmBox(
      potX - 2,
      y + h - 19,
      21, 5,
      "#cb8d59"
    );

    warmFlower(
      potX + 8,
      y + h - 22,
      "#d5a5b8"
    );

    warmFlower(
      potX + 2,
      y + h - 18,
      "#e8c97e"
    );
  });

  /* 현관등 */
  warmBox(
    doorX - 19,
    doorY + 3,
    7, 13,
    "#594b31"
  );

  warmBox(
    doorX - 18,
    doorY + 5,
    5, 8,
    "#e8ca79"
  );

  /* 목재 간판 */
  ctx.font = "bold 12px sans-serif";

  const labelWidth =
    Math.ceil(ctx.measureText(name).width) + 20;

  warmBox(
    x + w / 2 - labelWidth / 2,
    y + roofHeight - 15,
    labelWidth,
    23,
    "#57472e"
  );

  warmBox(
    x + w / 2 - labelWidth / 2 + 3,
    y + roofHeight - 12,
    labelWidth - 6,
    17,
    "#8b7544"
  );

  ctx.fillStyle = "#f5e4b1";
  ctx.textAlign = "center";

  ctx.fillText(
    name,
    x + w / 2,
    y + roofHeight + 1
  );

  ctx.textAlign = "left";
}

/* 나무: 여러 층의 수관과 잎 명암 */
function drawTrees() {
  treePositions.forEach((tree, index) => {
    if (
      !bioVisible(
        tree.x - 45,
        tree.y - 100,
        90,
        130
      )
    ) {
      return;
    }

    const x = Math.round(tree.x);
    const y = Math.round(tree.y);

    warmBox(
      x - 25,
      y + 8,
      56, 13,
      "rgba(36,50,26,.24)"
    );

    /* 줄기와 뿌리 */
    warmBox(
      x - 8,
      y - 43,
      16, 57,
      "#635036"
    );

    warmBox(
      x - 3,
      y - 41,
      4, 53,
      "#967445"
    );

    warmBox(
      x - 13,
      y + 9,
      27, 5,
      "#635036"
    );

    const crownLayers = [
      [-24, -70, 48, 24],
      [-36, -55, 72, 27],
      [-30, -34, 60, 22],
      [-17, -89, 34, 24]
    ];

    crownLayers.forEach(([a, b, w, h]) => {
      warmBox(
        x + a,
        y + b,
        w, h,
        "#355c36"
      );

      warmBox(
        x + a + 3,
        y + b + 2,
        w - 6,
        h - 7,
        "#527c3e"
      );
    });

    /* 일정한 잎 무늬: 프레임마다 깜빡이지 않음 */
    for (let j = 0; j < 75; j++) {
      const leafX =
        -30 +
        Math.floor(
          warmNoise(index, j, 1) * 60 / 3
        ) * 3;

      const leafY =
        -81 +
        Math.floor(
          warmNoise(index, j, 2) * 59 / 3
        ) * 3;

      if (
        Math.abs(leafX) +
        Math.abs(leafY + 52) * 0.65 > 36
      ) {
        continue;
      }

      warmBox(
        x + leafX,
        y + leafY,
        5,
        3,
        j % 3 ? "#789c48" : "#9cb35a"
      );
    }
  });
}

/* 캐릭터: 연구복·머리카락·얼굴·신발 디테일 */
function drawCharacter(
  x,
  y,
  color,
  name,
  player,
  variant = 0
) {
  x = Math.round(x);
  y = Math.round(y);

  /* 기존의 간단한 걷기 표현만 유지 */
  const moving =
    player &&
    (
      keys.arrowup ||
      keys.arrowdown ||
      keys.arrowleft ||
      keys.arrowright ||
      keys.w ||
      keys.a ||
      keys.s ||
      keys.d
    );

  const step = moving
    ? Math.floor(performance.now() / 180) % 2 * 2
    : 0;

  const direction = player
    ? state.player.dir
    : "down";

  /* 발밑 그림자 */
  warmBox(
    x - 11,
    y + 20,
    24, 5,
    "rgba(39,44,28,.25)"
  );

  /* 바지와 신발 */
  warmBox(
    x - 7,
    y + 10 + step,
    6, 13,
    "#535b51"
  );

  warmBox(
    x + 2,
    y + 10 - step,
    6, 13,
    "#535b51"
  );

  warmBox(
    x - 8,
    y + 20 + step,
    8, 4,
    "#493e31"
  );

  warmBox(
    x + 2,
    y + 20 - step,
    8, 4,
    "#493e31"
  );

  /* 연구복 외곽 */
  warmBox(
    x - 11,
    y - 9,
    23, 22,
    "#756f54"
  );

  warmBox(
    x - 9,
    y - 9,
    19, 19,
    "#e0dbbb"
  );

  /* 직군별 안쪽 옷 */
  warmBox(
    x - 4,
    y - 7,
    9, 19,
    color
  );

  /* 연구복 좌우 깃 */
  warmBox(
    x - 8,
    y - 7,
    4, 18,
    "#f2ebcf"
  );

  warmBox(
    x + 5,
    y - 7,
    4, 18,
    "#f2ebcf"
  );

  warmBox(
    x - 2,
    y - 6,
    4, 3,
    "#e8d39f"
  );

  /* 주머니 */
  warmBox(
    x + 5,
    y + 3,
    4, 3,
    "#a7ad97"
  );

  /* 팔과 손 */
  warmBox(
    x - 13,
    y - 5 + step,
    4, 13,
    "#e7dec1"
  );

  warmBox(
    x + 11,
    y - 5 - step,
    4, 13,
    "#e7dec1"
  );

  warmBox(
    x - 13,
    y + 7 + step,
    4, 5,
    "#d7a773"
  );

  warmBox(
    x + 11,
    y + 7 - step,
    4, 5,
    "#d7a773"
  );

  /* 머리와 얼굴 */
  warmBox(
    x - 9,
    y - 30,
    19, 20,
    "#604734"
  );

  warmBox(
    x - 7,
    y - 25,
    15, 15,
    "#dfb180"
  );

  warmBox(
    x - 5,
    y - 23,
    11, 12,
    "#efc395"
  );

  warmBox(
    x - 10,
    y - 31,
    20, 7,
    variant % 2 ? "#66513b" : "#514531"
  );

  warmBox(
    x - 10,
    y - 26,
    5, 8,
    "#604734"
  );

  warmBox(
    x + 7,
    y - 26,
    4, 8,
    "#604734"
  );

  if (direction !== "up") {
    if (direction !== "right") {
      warmBox(
        x - 4,
        y - 20,
        2, 3,
        "#483d31"
      );
    }

    if (direction !== "left") {
      warmBox(
        x + 4,
        y - 20,
        2, 3,
        "#483d31"
      );
    }

    warmBox(
      x,
      y - 14,
      3, 1,
      "#b77e5b"
    );
  } else {
    warmBox(
      x - 7,
      y - 24,
      15, 12,
      "#604734"
    );
  }

  /* 이름표 */
  if (name) {
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";

    const labelWidth =
      ctx.measureText(name).width + 12;

    warmBox(
      x - labelWidth / 2,
      y - 51,
      labelWidth,
      16,
      "rgba(54,64,37,.85)"
    );

    ctx.fillStyle = "#f4e5b6";

    ctx.fillText(
      name,
      x,
      y - 39
    );

    ctx.textAlign = "left";
  }
}

/* WARM PIXEL V6 끝 */
/* =====================================================
   BIO LAB · BLOOM V7
   main.js 마지막 })(); 바로 위에 한 번만 삽입
===================================================== */

const BLOOM = (() => {
  const cache = new Map();

  const grass = [
    "#67b62e",
    "#72c533",
    "#87d83b",
    "#9ae345",
    "#51a32b"
  ];

  const leaf = [
    "#164d34",
    "#196537",
    "#23873c",
    "#36a541",
    "#66c747",
    "#a1df56"
  ];

  function noise(x, y, seed = 0) {
    let a =
      Math.imul(x | 0, 374761393) ^
      Math.imul(y | 0, 668265263) ^
      seed;

    a = Math.imul(a ^ (a >>> 13), 1274126177);

    return ((a ^ (a >>> 16)) >>> 0) / 4294967296;
  }

  function box(g, x, y, w, h, color) {
    g.fillStyle = color;

    g.fillRect(
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h)
    );
  }

  function polygon(g, points, color) {
    g.fillStyle = color;
    g.beginPath();

    points.forEach((point, index) => {
      if (index === 0) {
        g.moveTo(...point);
      } else {
        g.lineTo(...point);
      }
    });

    g.closePath();
    g.fill();
  }

  /* 도트 이미지는 한 번 제작하고 재사용 */
  function sprite(key, width, height, paint) {
    if (!cache.has(key)) {
      const image = document.createElement("canvas");

      image.width = width;
      image.height = height;

      const g = image.getContext("2d");
      g.imageSmoothingEnabled = false;

      paint(g);
      cache.set(key, image);
    }

    return cache.get(key);
  }

  function flower(g, x, y, color) {
    box(g, x, y, 1, 5, "#287631");
    box(g, x - 2, y - 3, 5, 2, color);
    box(g, x, y - 5, 2, 6, color);
    box(g, x, y - 2, 1, 1, "#ffe883");
  }

  function bush(g, x, y, seed = 0, flowers = false) {
    for (let j = 0; j < 30; j++) {
      const a = noise(seed, j, 4) * 20 - 10;
      const b = noise(seed, j, 7) * 12 - 6;

      if (a * a / 110 + b * b / 42 > 1) {
        continue;
      }

      box(
        g,
        x + a,
        y + b,
        5,
        4,
        leaf[Math.floor(noise(seed, j, 9) * 5)]
      );

      box(
        g,
        x + a + 1,
        y + b,
        2,
        1,
        "#94d541"
      );
    }

    if (flowers) {
      for (let j = 0; j < 4; j++) {
        flower(
          g,
          x - 7 + j * 4,
          y - 1 - j % 2 * 4,
          j % 2 ? "#ffb8c8" : "#ffe264"
        );
      }
    }
  }

  /* 둥근 활엽수와 층이 나뉜 침엽수 */
  function tree(kind) {
    return sprite("tree-" + kind, 88, 120, g => {
      box(g, 23, 107, 48, 7, "#245b3480");

      polygon(
        g,
        [
          [38, 70], [49, 70],
          [50, 106], [60, 112],
          [45, 109], [31, 114],
          [37, 104]
        ],
        "#5c3c26"
      );

      box(g, 41, 73, 5, 34, "#b87935");
      box(g, 43, 77, 2, 25, "#e2a24a");

      const lobes = kind === 1
        ? [
            [44, 18, 11],
            [44, 32, 18],
            [44, 49, 25],
            [44, 69, 33]
          ]
        : [
            [43, 24, 19],
            [27, 42, 22],
            [58, 42, 23],
            [40, 55, 29],
            [23, 64, 17],
            [61, 64, 18],
            [43, 76, 23]
          ];

      lobes.forEach(([cx, cy, radius], index) => {
        /* 수관의 짙은 외곽 */
        for (
          let yy = -radius;
          yy <= radius;
          yy += 2
        ) {
          const half = Math.floor(
            Math.sqrt(
              Math.max(0, radius * radius - yy * yy)
            ) / 2
          ) * 2;

          box(
            g,
            cx - half,
            cy + yy,
            half * 2,
            2,
            leaf[0]
          );
        }

        /* 잎 덩어리의 기본색 */
        for (
          let yy = -radius + 3;
          yy < radius - 3;
          yy += 2
        ) {
          const half = Math.floor(
            Math.sqrt(
              Math.max(
                0,
                (radius - 3) ** 2 - yy * yy
              )
            ) / 2
          ) * 2;

          box(
            g,
            cx - half - 1,
            cy + yy - 2,
            half * 2,
            2,
            leaf[2]
          );
        }

        /* 왼쪽 위가 밝고 아래쪽이 어두운 잎 */
        for (let j = 0; j < 55; j++) {
          const xx = Math.floor(
            noise(j * 7 + index, kind * 31 + index, 17) *
            radius * 2
          ) - radius;

          const yy = Math.floor(
            noise(j * 11 + index, kind * 29 + index, 71) *
            radius * 2
          ) - radius;

          if (
            xx * xx + yy * yy >
            (radius - 4) ** 2
          ) {
            continue;
          }

          const lit = xx + yy < 0;

          const color = lit
            ? j % 4 ? leaf[4] : leaf[5]
            : j % 3 ? leaf[3] : leaf[1];

          box(
            g,
            cx + xx,
            cy + yy - 2,
            3 + j % 3,
            2,
            color
          );
        }
      });
    });
  }

  function windowSprite(g, x, y, w = 20, h = 24) {
    box(g, x - 3, y - 3, w + 6, h + 7, "#643d24");
    box(g, x - 1, y - 1, w + 2, h + 2, "#f6cf74");
    box(g, x, y, w, h, "#4a9bb2");

    polygon(
      g,
      [
        [x + 1, y + 1],
        [x + w - 2, y + 1],
        [x + 1, y + h - 3]
      ],
      "#b9edf0"
    );

    box(g, x + w / 2 - 1, y, 2, h, "#fff1b5");
    box(g, x, y + h / 2, w, 2, "#fff1b5");
    box(g, x - 5, y + h + 2, w + 10, 3, "#a3642e");
  }

  /* 자체 제작 건물 스프라이트 */
  function house(kind) {
    return sprite("house-" + kind, 256, 224, g => {
      const greenhouse = kind === 2;

      const roofColor = kind === 1
        ? "#427b92"
        : "#bb4326";

      box(g, 22, 193, 221, 18, "#343c3560");

      /* 목재 외벽 */
      box(g, 29, 100, 197, 90, "#68412b");

      for (let y = 105; y < 188; y += 8) {
        for (let x = 33; x < 223; x += 20) {
          box(
            g,
            x,
            y,
            19,
            7,
            noise(x, y) > 0.5 ? "#dca84e" : "#efbc62"
          );

          box(g, x, y, 19, 1, "#ffe09a");
          box(g, x, y + 6, 19, 1, "#aa7135");
        }
      }

      /* 돌기단 */
      box(g, 32, 179, 192, 16, "#665b44");

      for (let y = 180; y < 194; y += 7) {
        for (
          let x = 33 + y % 2 * 7;
          x < 221;
          x += 18
        ) {
          box(g, x, y, 16, 5, "#96977a");
          box(g, x, y, 15, 1, "#c3b994");
        }
      }

      /* 비대칭 측면 증축부 */
      box(g, 8, 115, 44, 70, "#96602d");

      for (let y = 119; y < 180; y += 8) {
        box(g, 10, y, 38, 2, "#d99a45");
      }

      polygon(
        g,
        [[4, 118], [20, 74], [64, 81], [52, 126]],
        "#74371e"
      );

      /* 경사진 주 지붕 */
      polygon(
        g,
        [
          [18, 111], [54, 29], [183, 22],
          [239, 105], [226, 116]
        ],
        "#592e22"
      );

      polygon(
        g,
        [[24, 105], [58, 33], [178, 28], [225, 103]],
        roofColor
      );

      /* 기와 한 장씩 명암 */
      for (let row = 0; row < 6; row++) {
        const y = 34 + row * 12;
        const left = 59 - row * 5;
        const right = 180 + row * 7;

        for (
          let x = left + row % 2 * 10;
          x < right;
          x += 21
        ) {
          const tileColor = kind === 1
            ? "#588fa3"
            : noise(x, y) > 0.5
              ? "#d35b30"
              : "#bb4529";

          box(g, x, y, 19, 10, tileColor);

          box(
            g, x, y, 18, 2,
            kind === 1 ? "#9bc9cd" : "#f6934b"
          );

          box(
            g, x + 18, y + 2, 2, 8,
            kind === 1 ? "#34697e" : "#8b3423"
          );
        }
      }

      /* 정면 박공 */
      polygon(
        g,
        [[79, 110], [126, 48], [175, 110]],
        "#603a24"
      );

      polygon(
        g,
        [[85, 107], [126, 57], [168, 107]],
        "#efc271"
      );

      for (let x = 92; x < 162; x += 8) {
        box(g, x, 90, 2, 16, "#bf883b");
      }

      windowSprite(g, 117, 79, 18, 18);

      box(g, 20, 108, 212, 6, "#653b22");
      box(g, 22, 108, 208, 2, "#e4a44b");

      if (greenhouse) {
        for (let x = 39; x < 215; x += 34) {
          windowSprite(g, x, 122, 27, 40);
        }
      } else {
        windowSprite(g, 56, 126, 24, 28);
        windowSprite(g, 176, 126, 24, 28);
      }

      /* 현관문 */
      box(g, 109, 129, 36, 63, "#603923");
      box(g, 113, 132, 28, 56, "#bf7335");

      windowSprite(g, 119, 137, 16, 20);

      box(g, 118, 168, 19, 15, "#d99346");
      box(g, 134, 166, 3, 3, "#ffe59a");

      /* 데크와 계단 */
      box(g, 24, 190, 206, 13, "#79451f");

      for (let y = 190; y < 203; y += 4) {
        box(g, 26, y, 202, 2, "#ca8942");
      }

      box(g, 95, 202, 65, 5, "#b58243");
      box(g, 88, 207, 79, 5, "#d5a357");

      /* 현관 화분 */
      [26, 225].forEach(x => {
        box(g, x, 174, 15, 16, "#a45229");
        box(g, x - 2, 172, 19, 4, "#f1a251");
        bush(g, x + 7, 167, x, true);
      });

      /* 처마등 */
      box(g, 98, 122, 2, 13, "#5f492b");
      box(g, 94, 134, 9, 12, "#62492c");
      box(g, 96, 136, 5, 7, "#fff1a4");

      /* 굴뚝 */
      if (!greenhouse) {
        box(g, 191, 24, 19, 48, "#5c5c4e");

        for (let y = 27; y < 69; y += 7) {
          box(g, 193, y, 15, 4, "#92917c");
          box(g, 194, y, 12, 1, "#c4b79b");
        }

        box(g, 187, 20, 27, 6, "#444d43");
      }

      /* 측면 장작 */
      for (let j = 0; j < 15; j++) {
        const x = 15 + j % 3 * 9;
        const y = 155 + Math.floor(j / 3) * 7;

        box(g, x, y, 8, 6, "#633c22");
        box(g, x + 2, y + 1, 4, 4, "#d39a50");
        box(g, x + 3, y + 2, 2, 2, "#8b592d");
      }

      /* 벽면 덩굴 */
      for (let j = 0; j < 12; j++) {
        const x = 205 + j % 3 * 4;
        const y = 119 + Math.floor(j / 3) * 9;

        box(g, x, y, 3, 10, "#3f8b35");
        box(g, x - 3, y + 2, 6, 3, "#77bc39");
      }
    });
  }

  function terrain() {
    const viewWidth = canvas.width / 0.8;
    const viewHeight = canvas.height / 0.8;

    box(
      ctx,
      0, 0,
      WORLD.width,
      WORLD.height,
      "#79c936"
    );

    const startX = Math.max(
      0, Math.floor(camera.x / 16) * 16
    );

    const startY = Math.max(
      0, Math.floor(camera.y / 16) * 16
    );

    const endX = Math.min(
      WORLD.width,
      camera.x + viewWidth + 20
    );

    const endY = Math.min(
      WORLD.height,
      camera.y + viewHeight + 20
    );

    /* 균일한 체커보드 대신 풀잎 묘사 */
    for (let y = startY; y < endY; y += 16) {
      for (let x = startX; x < endX; x += 16) {
        const s = noise(x, y, 2);

        for (let j = 0; j < 9; j++) {
          const xx =
            x + Math.floor(noise(x + j * 11, y, 4) * 14);

          const yy =
            y + Math.floor(noise(x, y + j * 13, 9) * 14);

          box(
            ctx,
            xx, yy,
            2, 2 + j % 2,
            grass[j % 5]
          );
        }

        if (s > 0.989) {
          flower(ctx, x + 7, y + 9, "#fff0ab");
        }
      }
    }

    const paths = [
      [990, 0, 100, 2200],
      [1995, 0, 110, 2200],
      [0, 880, 3200, 92],
      [0, 1600, 3200, 92],
      [1440, 420, 110, 1780],
      [990, 1080, 1115, 92]
    ];

    paths.forEach(([x, y, w, h]) => {
      box(
        ctx,
        x - 4, y - 4,
        w + 8, h + 8,
        "#689a2f"
      );

      box(ctx, x, y, w, h, "#edbd55");
    });

    /* 길 위 작은 자갈 */
    for (let y = startY; y < endY; y += 16) {
      for (let x = startX; x < endX; x += 16) {
        const onPath = paths.some(([a, b, w, h]) =>
          x > a &&
          x < a + w - 8 &&
          y > b &&
          y < b + h - 8
        );

        if (!onPath) continue;

        const s = noise(x, y);

        if (s < 0.5) {
          box(ctx, x + 4, y + 6, 3, 2, "#dca444");
        }

        if (s > 0.7) {
          box(ctx, x + 10, y + 9, 4, 1, "#ffda78");
        }
      }
    }

    /* 광장 돌길: 가운데에는 식물 전시 정원 */
    for (let y = 1010; y < 1450; y += 24) {
      for (let x = 1210; x < 1840; x += 30) {
        if (
          x > 1290 && x < 1720 &&
          y > 1190 && y < 1400
        ) {
          continue;
        }

        box(ctx, x, y, 28, 22, "#a28e60");

        box(
          ctx,
          x + 2, y + 2,
          24, 17,
          noise(x, y) > 0.5 ? "#e4d397" : "#d2bd85"
        );

        box(ctx, x + 3, y + 2, 22, 2, "#f9e5ac");
      }
    }

    /* 연못 */
    for (let row = -23; row <= 23; row++) {
      const half = Math.floor(
        Math.sqrt(
          Math.max(0, 1 - (row / 24) ** 2)
        ) * 35
      ) * 8;

      box(
        ctx,
        500 - half,
        520 + row * 8,
        half * 2,
        8,
        "#b28b38"
      );

      if (half > 18) {
        box(
          ctx,
          518 - half,
          520 + row * 8,
          half * 2 - 36,
          8,
          "#39798d"
        );
      }

      if (half > 36) {
        box(
          ctx,
          536 - half,
          520 + row * 8,
          half * 2 - 72,
          8,
          "#59b5ca"
        );
      }
    }

    for (let j = 0; j < 35; j++) {
      const x = 300 + j * 67 % 390;
      const y = 405 + j * 41 % 200;

      box(
        ctx,
        x, y,
        8 + j % 4 * 3,
        2,
        j % 2 ? "#8edbe0" : "#419bb7"
      );
    }
  }

  function decor() {
    /* 광장 식물 전시섬 */
    [
      [1370, 1300],
      [1650, 1300]
    ].forEach(([x, y]) => {
      box(ctx, x - 53, y - 35, 106, 78, "#725a32");
      box(ctx, x - 49, y - 31, 98, 68, "#e4c97d");
      box(ctx, x - 44, y - 26, 88, 58, "#3b8038");

      for (let j = 0; j < 7; j++) {
        bush(
          ctx,
          x - 30 + j % 4 * 20,
          y - 10 + Math.floor(j / 4) * 24,
          j,
          true
        );
      }
    });

    /* 화단 */
    [
      [1150, 1490, 10],
      [1670, 1490, 8],
      [2140, 690, 10],
      [2760, 650, 9],
      [1150, 580, 6]
    ].forEach(([x, y, count]) => {
      box(
        ctx,
        x - 8, y + 6,
        count * 20 + 16, 11,
        "#86612d"
      );

      box(
        ctx,
        x - 7, y + 7,
        count * 20 + 14, 3,
        "#d9a84d"
      );

      for (let i = 0; i < count; i++) {
        bush(ctx, x + i * 20, y, i, true);
      }
    });

    /* 짧은 목재 울타리 */
    [
      [1170, 1020],
      [1830, 1020],
      [2160, 1180],
      [2900, 1540],
      [1200, 1710]
    ].forEach(([x, y]) => {
      for (let j = 0; j < 5; j++) {
        box(ctx, x + j * 18, y, 6, 27, "#67431f");

        box(
          ctx,
          x + j * 18 + 1,
          y + 2,
          3, 21,
          "#d3933a"
        );
      }

      box(ctx, x, y + 7, 78, 4, "#aa6b29");
      box(ctx, x, y + 18, 78, 4, "#bd7d30");
    });

    /* 큰길 밖의 낮은 덤불 */
    for (let i = 0; i < 80; i++) {
      const x = 100 + noise(i, 4) * 2900;
      const y = 100 + noise(i, 8) * 1900;

      if (
        (x > 950 && x < 2110) ||
        (y > 850 && y < 990) ||
        (y > 1570 && y < 1720)
      ) {
        continue;
      }

      bush(ctx, x, y, i, i % 5 === 0);
    }
  }

  function drawHouse(building, index) {
    if (
      !bioVisible(
        building.x - 10,
        building.y - 40,
        building.w + 20,
        building.h + 90
      )
    ) {
      return;
    }

    const kind = /온실|배양/.test(building.name)
      ? 2
      : index % 3 === 0 ? 1 : 0;

    ctx.drawImage(
      house(kind),
      building.x - 12,
      building.y - 32,
      building.w + 24,
      building.h + 75
    );

    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#493821";

    ctx.fillText(
      building.name,
      building.x + building.w / 2,
      building.y + building.h + 46
    );

    ctx.textAlign = "left";
  }

  function character(
    x,
    y,
    color,
    name,
    player,
    variant = 0
  ) {
    const image = sprite(
      "person-" + color + "-" + variant,
      32,
      48,
      g => {
        box(g, 8, 42, 18, 4, "#24482d60");

        box(g, 10, 32, 5, 10, "#3b5363");
        box(g, 18, 32, 5, 10, "#3b5363");

        box(g, 9, 40, 7, 3, "#543b2a");
        box(g, 18, 40, 7, 3, "#543b2a");

        polygon(
          g,
          [
            [9, 20], [22, 20], [26, 25],
            [24, 34], [8, 34], [6, 25]
          ],
          "#596c56"
        );

        box(g, 9, 22, 15, 11, "#fff3d1");
        box(g, 14, 22, 6, 12, color);
        box(g, 10, 22, 3, 13, "#fff8e2");
        box(g, 21, 22, 3, 13, "#e5d7a9");

        box(g, 6, 25, 4, 8, "#f9eac6");
        box(g, 24, 25, 3, 8, "#f9eac6");
        box(g, 7, 32, 3, 4, "#e9af72");
        box(g, 24, 32, 3, 4, "#e9af72");

        box(g, 10, 7, 14, 15, "#693d27");
        box(g, 12, 10, 11, 12, "#f4bc83");
        box(g, 13, 11, 8, 9, "#ffd59d");

        box(g, 9, 6, 16, 6, "#593e28");
        box(g, 10, 11, 3, 6, "#80532b");
        box(g, 23, 10, 2, 7, "#80532b");

        box(g, 14, 15, 2, 2, "#433626");
        box(g, 20, 15, 2, 2, "#433626");
        box(g, 17, 20, 3, 1, "#bd7955");
        box(g, 11, 7, 9, 2, "#a57238");
      }
    );

    ctx.drawImage(
      image,
      Math.round(x) - 22,
      Math.round(y) - 42,
      44,
      66
    );

    if (name) {
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";

      ctx.fillStyle = "#fff5ce";
      ctx.strokeStyle = "#3e5130";
      ctx.lineWidth = 3;

      ctx.strokeText(name, x, y - 49);
      ctx.fillText(name, x, y - 49);

      ctx.textAlign = "left";
    }
  }

  function stationsDraw() {
    stations.forEach(station => {
      const x = station.x;
      const y = station.y;

      box(ctx, x - 22, y + 12, 50, 7, "#3d563c60");
      box(ctx, x - 22, y - 4, 45, 21, "#86572b");
      box(ctx, x - 25, y - 7, 51, 5, "#e0b86d");

      box(ctx, x - 18, y - 29, 37, 22, "#536b68");
      box(ctx, x - 15, y - 26, 31, 16, "#e5e7c6");
      box(ctx, x - 9, y - 23, 20, 10, "#56aebb");
      box(ctx, x - 7, y - 22, 8, 3, "#c0efce");
      box(ctx, x + 13, y - 8, 4, 3, "#fbd674");

      if (
        station.type === "culture" ||
        station.type === "cross"
      ) {
        bush(ctx, x, y - 23, 2);
      }

      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#453c23";

      ctx.fillText(station.name, x, y + 31);
      ctx.textAlign = "left";
    });
  }

  return {
    terrain,
    decor,
    drawHouse,
    tree,
    character,
    stationsDraw
  };
})();

/* 건물 크기 축소: 기존 중심과 앞쪽 위치 유지 */
const bloomOriginalBuildings = bioBuildings;

bioBuildings = function() {
  return bloomOriginalBuildings().map(building => {
    const width = Math.min(building.w, 330);
    const height = Math.min(building.h, 245);

    return {
      ...building,
      x: building.x + (building.w - width) / 2,
      y: building.y + building.h - height,
      w: width,
      h: height
    };
  });
};

/* 광장과 연구동 외곽에 나무 추가 */
[
  [1140, 740],
  [1195, 810],
  [1850, 760],
  [1900, 835],
  [1140, 1190],
  [1130, 1320],
  [1870, 1180],
  [1910, 1330],
  [1160, 1510],
  [1810, 1510],
  [1260, 560],
  [1830, 550],
  [2170, 770],
  [2690, 700],
  [2630, 1100]
].forEach(([x, y]) => {
  const occupied = treePositions.some(tree =>
    Math.abs(tree.x - x) < 35 &&
    Math.abs(tree.y - y) < 35
  );

  if (!occupied) {
    treePositions.push({ x, y });
  }
});

drawCharacter = BLOOM.character;

/* 새 렌더러 연결 */
draw = function() {
  const zoom = 0.8;
  const viewWidth = canvas.width / zoom;
  const viewHeight = canvas.height / zoom;

  camera.x = Math.max(
    0,
    Math.min(
      WORLD.width - viewWidth,
      state.player.x - viewWidth / 2
    )
  );

  camera.y = Math.max(
    0,
    Math.min(
      WORLD.height - viewHeight,
      state.player.y - viewHeight / 2
    )
  );

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.imageSmoothingEnabled = false;
  ctx.save();

  ctx.scale(zoom, zoom);

  ctx.translate(
    -Math.floor(camera.x),
    -Math.floor(camera.y)
  );

  BLOOM.terrain();
  BLOOM.decor();

  drawSamples();
  drawPlots();
  BLOOM.stationsDraw();

  /* 발 위치를 기준으로 앞뒤 관계 결정 */
  const layers = bioBuildings().map((building, index) => ({
    y: building.y + building.h,

    paint: () => {
      BLOOM.drawHouse(building, index);
    }
  }));

  treePositions.forEach((tree, index) => {
    layers.push({
      y: tree.y,

      paint: () => {
        if (
          !bioVisible(
            tree.x - 55,
            tree.y - 140,
            110,
            160
          )
        ) {
          return;
        }

        ctx.drawImage(
          BLOOM.tree(index % 3 === 0 ? 1 : 0),
          tree.x - 48,
          tree.y - 116,
          96,
          132
        );
      }
    });
  });

  DATA.npcs.forEach((npc, index) => {
    layers.push({
      y: npc.y,

      paint: () => {
        BLOOM.character(
          npc.x,
          npc.y,
          npc.color,
          npc.name,
          false,
          index
        );
      }
    });
  });

  layers.push({
    y: state.player.y,

    paint: () => {
      BLOOM.character(
        state.player.x,
        state.player.y,
        DATA.roles[state.player.role].color,
        state.player.name,
        true
      );
    }
  });

  layers.sort((a, b) => a.y - b.y);

  layers.forEach(item => {
    item.paint();
  });

  ctx.restore();

  drawLightOverlay();

  if (state.weather === "rain") {
    drawRain();
  }

  bioDrawMiniMap();
};

/* BLOOM V7 끝 */
/* =====================================================
   BLOOM V7 · 작물과 재배지 그래픽
===================================================== */

drawCropSprite = function(
  x,
  y,
  crop,
  stage,
  ready,
  health
) {
  const box = (a, b, w, h, color) => {
    ctx.fillStyle = color;

    ctx.fillRect(
      Math.round(x + a),
      Math.round(y + b),
      w,
      h
    );
  };

  const healthy = (health ?? 100) >= 50;

  const dark = healthy
    ? "#246735"
    : "#79662e";

  const light = healthy
    ? "#78cf43"
    : "#c6a84e";

  function leaf(a, b) {
    box(a, b, 8, 3, dark);
    box(a + 2, b - 3, 7, 4, dark);
    box(a + 2, b - 2, 5, 2, light);
  }

  /* 새싹 */
  if (stage === 0) {
    box(-1, 0, 2, 8, dark);
    leaf(-8, 0);
    leaf(1, -3);
    return;
  }

  const height = 14 + stage * 9;

  box(-1, -height, 3, height + 8, dark);
  box(0, -height + 2, 1, height + 3, light);

  leaf(-10, -6);
  leaf(2, -12);
  leaf(-10, -height + 7);

  function fruit(a, b, color) {
    box(a - 1, b, 9, 7, "#7e3c26");
    box(a, b - 1, 7, 8, color);
    box(a + 1, b, 3, 2, "#ffd29b");
    box(a + 2, b - 3, 4, 2, dark);
  }

  if (crop.id === "tomato") {
    /* 지지대와 토마토 열매 */
    box(-15, -height + 3, 2, height + 12, "#b98642");
    box(14, -height + 3, 2, height + 12, "#b98642");
    box(-15, -height + 10, 31, 2, "#d6ad68");

    if (stage >= 2) {
      fruit(
        -11,
        -16,
        ready ? "#f44830" : "#82bd41"
      );

      fruit(
        5,
        -24,
        ready ? "#e93826" : "#82bd41"
      );

      fruit(
        1,
        -7,
        ready ? "#ff6c35" : "#91cb47"
      );
    }
  } else if (crop.id === "strawberry") {
    /* 낮게 퍼지는 잎과 딸기 */
    leaf(-16, -4);
    leaf(5, -5);
    leaf(-8, -13);

    if (stage >= 2) {
      fruit(
        -12,
        -1,
        ready ? "#ed3552" : "#d7df85"
      );

      fruit(
        4,
        2,
        ready ? "#fa4d59" : "#d7df85"
      );

      box(-10, 2, 1, 1, "#ffe296");
      box(6, 5, 1, 1, "#ffe296");
    }
  } else if (crop.id === "pea") {
    /* 지지대와 완두 꼬투리 */
    box(8, -height - 5, 2, height + 12, "#bb934d");

    for (let i = 0; i < stage; i++) {
      box(
        3,
        -height + 7 + i * 10,
        6,
        11,
        "#2b8038"
      );

      box(
        4,
        -height + 8 + i * 10,
        3,
        8,
        "#a8dc4a"
      );
    }
  } else if (crop.id === "sunflower") {
    /* 해바라기 꽃 */
    const top = -height - 8;

    box(-10, top + 3, 22, 10, "#dd8a1f");
    box(-6, top - 2, 14, 20, "#ffc834");
    box(-10, top + 6, 22, 4, "#ffdf53");

    box(-4, top + 3, 10, 10, "#7c4a23");
    box(-2, top + 5, 6, 6, "#a66c2b");
    box(-1, top + 5, 2, 2, "#e0a94a");
  } else if (crop.id === "rice") {
    /* 여러 줄기와 벼 이삭 */
    for (let i = 0; i < 5; i++) {
      const a = -10 + i * 5;
      const b = -height + Math.abs(i - 2) * 4;

      box(a, b, 2, -b + 9, dark);

      if (stage >= 2) {
        for (let j = 0; j < 4; j++) {
          box(
            a + 2,
            b + j * 4,
            3,
            2,
            ready ? "#f3d15d" : "#a7cc48"
          );
        }
      }
    }
  } else if (crop.id === "saltwort") {
    /* 통통한 다육질 줄기 */
    for (let i = 0; i < 5; i++) {
      const a = -10 + i * 5;
      const b = -height + Math.abs(i - 2) * 6;

      box(
        a,
        b,
        4,
        -b + 8,
        ready ? "#69bb8d" : "#4ca776"
      );

      box(a, b, 2, -b + 6, "#a6dd95");
    }
  } else if (crop.id === "luminara") {
    /* 게임 속 형광 연구 품종 */
    for (let i = 0; i < 3; i++) {
      const a = -10 + i * 10;
      const b = -height + i % 2 * 8;

      box(a, b, 6, 8, "#187b7d");
      box(a + 1, b - 2, 4, 7, "#73f0cf");
      box(a + 2, b, 2, 2, "#e1ffb8");
    }
  } else {
    /* 애기장대의 작은 흰 꽃 */
    for (let i = 0; i < stage + 1; i++) {
      const a = i % 2 ? -6 : 4;
      const b = -height + i * 7;

      box(a, b, 5, 5, "#fff1c7");
      box(a + 1, b + 1, 2, 2, "#f6c94c");
    }
  }

  /* 수확 가능 표시 */
  if (ready) {
    box(17, -height - 6, 1, 7, "#fff7bc");
    box(14, -height - 3, 7, 1, "#fff7bc");
  }
};

/* 넓은 재배 구획과 정돈된 밭고랑 */
drawPlots = function() {
  for (let i = 0; i < state.unlockedPlots; i++) {
    const position = plotPosition(i);
    const plot = state.plots[i];

    if (!plot) continue;

    if (
      !bioVisible(
        position.x - 75,
        position.y - 85,
        150,
        150
      )
    ) {
      continue;
    }

    const box = (x, y, w, h, color) => {
      ctx.fillStyle = color;

      ctx.fillRect(
        Math.round(x),
        Math.round(y),
        w,
        h
      );
    };

    const x = position.x;
    const y = position.y;

    /* 그림자와 목재 테두리 */
    box(x - 71, y - 48, 146, 108, "#4b552d40");
    box(x - 73, y - 51, 146, 104, "#88602a");
    box(x - 70, y - 48, 140, 98, "#e0ae55");

    box(
      x - 66,
      y - 44,
      132,
      90,
      plot.watered ? "#73502d" : "#b17c36"
    );

    /* 밭고랑 */
    for (let row = 0; row < 6; row++) {
      box(
        x - 62,
        y - 38 + row * 14,
        124,
        3,
        "#684321"
      );

      box(
        x - 61,
        y - 35 + row * 14,
        122,
        2,
        plot.watered ? "#9a753c" : "#d8a24b"
      );
    }

    if (plot.watered) {
      box(x - 48, y + 28, 10, 2, "#a1c6aa");
      box(x + 25, y + 13, 8, 2, "#a1c6aa");
    }

    if (!plot.crop) {
      for (let j = 0; j < 6; j++) {
        box(
          x - 36 + j % 3 * 35,
          y - 20 + Math.floor(j / 3) * 35,
          3,
          2,
          "#e3bc72"
        );
      }

      continue;
    }

    const crop = DATA.crops.find(
      entry => entry.id === plot.crop
    );

    if (!crop) continue;

    const stage = Math.max(
      0,
      Math.min(
        3,
        Math.floor(plot.age / crop.grow * 4)
      )
    );

    const ready = plot.age >= crop.grow;

    /* 한 재배 구획을 세 포기의 군락으로 표현 */
    [
      [-35, -7],
      [32, -7],
      [0, 28]
    ].forEach(([a, b]) => {
      drawCropSprite(
        x + a,
        y + b,
        crop,
        stage,
        ready,
        plot.health
      );
    });

    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";

    const label =
      crop.name + (ready ? " · 수확 가능" : "");

    const labelWidth =
      ctx.measureText(label).width + 12;

    box(
      x - labelWidth / 2,
      y + 56,
      labelWidth,
      17,
      "#fff0bf"
    );

    ctx.fillStyle = "#65431e";
    ctx.fillText(label, x, y + 68);
    ctx.textAlign = "left";

    /* 처리제를 사용한 구획의 작은 표식 */
    if (plot.treatment) {
      box(x + 54, y - 55, 8, 14, "#638a80");
      box(x + 56, y - 57, 4, 3, "#e9d9ad");
      box(x + 56, y - 51, 4, 7, "#a5e986");
    }
  }
};

/* 작물 패치 끝 */
/* =====================================================
   BLOOM V9 · 장비별 외형과 지역별 풍경
===================================================== */

const BLOOM9 = (() => {
  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;

    ctx.fillRect(
      Math.round(x),
      Math.round(y),
      w,
      h
    );
  }

  function line(points, color, width = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(...point);
      } else {
        ctx.lineTo(...point);
      }
    });

    ctx.stroke();
  }

  function pot(x, y, color = "#ef6994") {
    rect(x - 7, y, 14, 13, "#a4542a");
    rect(x - 9, y - 3, 18, 5, "#edaa55");

    rect(x - 2, y - 17, 3, 14, "#367c37");
    rect(x - 10, y - 12, 9, 4, "#64b739");
    rect(x + 1, y - 17, 8, 4, "#87cd42");

    rect(x - 4, y - 22, 8, 7, color);
    rect(x - 7, y - 19, 14, 3, color);
    rect(x - 1, y - 20, 3, 3, "#ffe98a");
  }

  function rock(x, y, size = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);

    rect(-12, -3, 25, 13, "#68715b");
    rect(-9, -9, 17, 17, "#9b9d78");
    rect(-5, -11, 9, 5, "#c6bd8b");
    rect(-8, -6, 3, 8, "#b9b58b");
    rect(3, 0, 6, 7, "#828669");

    ctx.restore();
  }

  function sign(x, y, label) {
    rect(x - 2, y, 5, 31, "#805528");
    rect(x - 42, y - 22, 84, 24, "#694422");
    rect(x - 39, y - 19, 78, 17, "#d6a854");
    rect(x - 37, y - 18, 74, 2, "#ffe09b");

    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#56391f";
    ctx.fillText(label, x, y - 7);
    ctx.textAlign = "left";
  }

  function bench(x, y) {
    rect(x - 23, y - 18, 46, 5, "#d99b43");
    rect(x - 23, y - 10, 46, 5, "#c58635");
    rect(x - 26, y, 52, 7, "#e7b65b");

    rect(x - 21, y + 7, 5, 10, "#76502b");
    rect(x + 16, y + 7, 5, 10, "#76502b");

    rect(x - 22, y - 20, 3, 25, "#76502b");
    rect(x + 19, y - 20, 3, 25, "#76502b");
  }

  function screen(x, y, w = 22, h = 14) {
    rect(x - 3, y - 3, w + 6, h + 6, "#4a665f");
    rect(x, y, w, h, "#6ecbc8");
    rect(x + 2, y + 2, w - 4, 2, "#cdf7d9");
    rect(x + 3, y + 6, 5, 2, "#f6e798");
    rect(x + 10, y + 6, w - 13, 2, "#358c96");
  }

  function tube(x, y, color) {
    rect(x, y, 5, 17, "#d3ebd7");
    rect(x + 1, y + 6, 3, 9, color);
    rect(x - 1, y - 2, 7, 4, "#78958b");
  }

  /* 시설별로 서로 다른 형태를 그린다 */
  function equipment(station) {
    if (
      !bioVisible(
        station.x - 55,
        station.y - 85,
        110,
        145
      )
    ) {
      return;
    }

    ctx.save();

    ctx.translate(
      Math.round(station.x),
      Math.round(station.y)
    );

    rect(-30, 17, 62, 7, "#3e583b40");

    const type = station.type;

    if (type === "shop") {
      /* 씨앗 상점 */
      rect(-41, -8, 82, 29, "#9e6630");
      rect(-44, -12, 88, 6, "#efc279");

      rect(-37, -63, 4, 51, "#84532a");
      rect(33, -63, 4, 51, "#84532a");

      for (let i = 0; i < 8; i++) {
        rect(
          -48 + i * 12,
          -66,
          12,
          19,
          i % 2 ? "#fff2bd" : "#e76b45"
        );
      }

      rect(-48, -47, 96, 5, "#874c29");

      const seedColors = [
        "#75b84a",
        "#efbc45",
        "#e96a54",
        "#c98bb8"
      ];

      for (let i = 0; i < 4; i++) {
        rect(-31 + i * 18, -27, 13, 14, "#e8cf8c");
        rect(-28 + i * 18, -24, 7, 7, seedColors[i]);
      }
    } else if (type === "scope") {
      /* 현미경 */
      rect(-29, 0, 58, 6, "#e6bc77");
      rect(-24, 6, 5, 15, "#8a6335");
      rect(19, 6, 5, 15, "#8a6335");

      rect(-13, -6, 27, 6, "#3f6262");
      rect(-8, -14, 21, 5, "#b9d2bf");

      line(
        [[11, -12], [13, -30], [3, -43]],
        "#547d79",
        7
      );

      line(
        [[9, -12], [10, -29], [0, -42]],
        "#b8dacc",
        3
      );

      line(
        [[-4, -46], [7, -38]],
        "#425d5a",
        9
      );

      rect(-10, -49, 9, 7, "#7ca8a1");
      rect(-11, -51, 7, 3, "#c8ece0");

      rect(-8, -18, 21, 3, "#4c6b64");
      rect(3, -21, 8, 3, "#f8f0c7");
    } else if (type === "pcr") {
      /* PCR 장비 */
      rect(-27, -30, 54, 45, "#526e69");
      rect(-24, -28, 48, 39, "#f1e6be");

      rect(-23, -40, 46, 13, "#6f9d96");
      rect(-19, -37, 38, 7, "#c7e3cc");

      screen(-17, -21, 22, 13);

      [
        "#79c951",
        "#eec958",
        "#ed8161"
      ].forEach((color, i) => {
        rect(12, -18 + i * 7, 5, 4, color);
      });

      rect(-20, 7, 40, 3, "#a8b59d");
    } else if (
      type === "culture" ||
      type === "contamination"
    ) {
      /* 배양 장비 */
      rect(-31, -51, 62, 65, "#506f63");
      rect(-27, -47, 54, 56, "#d9dfb4");
      rect(-23, -43, 46, 41, "#96ccbb");

      rect(-21, -41, 3, 34, "#e7f4cd");
      rect(-23, -20, 46, 3, "#5d9281");
      rect(-26, 0, 52, 6, "#f5edc5");

      for (let i = 0; i < 3; i++) {
        tube(
          -16 + i * 14,
          -38,
          type === "culture"
            ? "#64b964"
            : "#cba85a"
        );

        tube(
          -16 + i * 14,
          -16,
          "#7bcc91"
        );
      }

      rect(17, -45, 4, 46, "#689b86");
    } else if (type === "pond") {
      /* 표본 채취대 */
      rect(-24, -3, 48, 19, "#8b673c");

      for (let i = 0; i < 4; i++) {
        rect(
          -23 + i * 12,
          -2,
          10,
          17,
          "#d7ac64"
        );
      }

      tube(-7, -23, "#6dc6db");

      rect(5, -13, 12, 10, "#e8dca4");
      rect(7, -11, 8, 5, "#87c2a8");
    } else if (type === "bed") {
      /* 숙소 휴식 지점 */
      rect(-33, -14, 66, 27, "#76502b");
      rect(-30, -13, 60, 20, "#e4bf74");
      rect(-27, -12, 19, 16, "#fff2c9");

      rect(-5, -12, 32, 20, "#78a7a0");
      rect(-2, -10, 26, 3, "#acd8c2");

      rect(-34, -23, 5, 44, "#996c36");
      rect(29, -15, 5, 36, "#996c36");
    } else if (type === "cross") {
      /* 교배 실험대 */
      rect(-37, -4, 74, 23, "#81572d");
      rect(-34, -1, 68, 15, "#d7a354");

      pot(-19, -11, "#f7c959");
      pot(17, -11, "#f18ab1");

      line(
        [[-11, -36], [0, -43], [12, -36]],
        "#f7e7b0",
        2
      );
    } else if (type === "climate") {
      /* 기후 관측 장비 */
      rect(-28, -40, 56, 53, "#6a8780");
      rect(-24, -36, 48, 45, "#e0e4be");

      screen(-17, -29, 29, 20);

      rect(-2, -75, 4, 35, "#657c6a");

      line(
        [[-18, -67], [18, -67]],
        "#87633b",
        3
      );

      rect(12, -72, 9, 8, "#edb94a");
      rect(-22, -69, 6, 5, "#a8d4bd");

      rect(14, -28, 4, 19, "#b3cfc0");
      rect(15, -18, 2, 8, "#e97b56");
    } else if (type === "gel") {
      /* 전기영동 장비 */
      rect(-30, -22, 60, 34, "#537477");
      rect(-26, -19, 52, 27, "#a5d6c9");
      rect(-21, -15, 42, 19, "#3b929e");

      for (let i = 0; i < 4; i++) {
        rect(
          -16 + i * 10,
          -11,
          5,
          2,
          "#dbf3a4"
        );

        rect(
          -16 + i * 10,
          -4 + i % 2 * 3,
          5,
          2,
          "#96e2b5"
        );
      }

      rect(-26, -25, 52, 4, "#dfecc7");
    } else if (type === "enzyme") {
      /* 효소 반응대 */
      rect(-29, 4, 58, 9, "#a47b41");

      rect(-17, -35, 7, 37, "#769283");
      rect(12, -35, 5, 37, "#769283");
      rect(-21, -37, 42, 4, "#b4c8aa");

      tube(-6, -24, "#edbf54");
      tube(4, -24, "#a5d971");

      rect(-10, -1, 27, 4, "#e5e4be");
    } else {
      /* 기록·서열 분석 단말기 */
      rect(-27, 0, 54, 19, "#94632e");
      rect(-30, -4, 60, 6, "#e6b970");

      screen(-21, -35, 42, 25);

      rect(-2, -8, 4, 4, "#7a8a70");
      rect(-17, -1, 34, 3, "#f4e5ba");

      if (type === "sequence") {
        const bases = [
          "#ea9773",
          "#edcf68",
          "#a4de8b",
          "#b0bce6"
        ];

        for (let i = 0; i < 5; i++) {
          rect(
            -17 + i * 7,
            -22,
            4,
            4,
            bases[i % 4]
          );
        }
      }
    }

    /* 장비 이름 */
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";

    ctx.strokeStyle = "#fff2c7";
    ctx.lineWidth = 3;
    ctx.strokeText(station.name, 0, 37);

    ctx.fillStyle = "#5a4325";
    ctx.fillText(station.name, 0, 37);

    ctx.textAlign = "left";
    ctx.restore();
  }

  function landscape() {
    /* 생태숲 수변 */
    for (let i = 0; i < 16; i++) {
      const angle = i / 16 * Math.PI * 2;

      const x = 500 + Math.cos(angle) * 300;
      const y = 520 + Math.sin(angle) * 205;

      rock(x, y, 0.8 + i % 3 * 0.2);
    }

    sign(790, 760, "생태 관찰로");
    bench(720, 800);

    for (let i = 0; i < 14; i++) {
      const x = 240 + i * 31;
      const y = 735 + i % 3 * 11;

      rect(x, y - 20, 2, 23, "#648834");
      rect(x - 2, y - 23, 6, 10, "#c3a653");
    }

    /* 분자 연구단지 보조 작업대 */
    [
      [330, 1410],
      [720, 1510]
    ].forEach(([x, y]) => {
      rect(x - 28, y, 56, 27, "#6d887a");
      rect(x - 24, y - 4, 48, 5, "#d3d8b2");

      for (let i = 0; i < 4; i++) {
        tube(
          x - 17 + i * 11,
          y - 22,
          i % 2 ? "#82c9c9" : "#e9ad6d"
        );
      }
    });

    sign(810, 1570, "분자 연구단지");

    /* 종자 보존림의 종자 서랍 */
    rect(770, 1870, 70, 65, "#79502a");

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 4; column++) {
        rect(
          774 + column * 16,
          1874 + row * 19,
          14,
          16,
          "#c08a41"
        );

        rect(
          778 + column * 16,
          1880 + row * 19,
          6,
          3,
          "#f1d396"
        );
      }
    }

    for (let i = 0; i < 5; i++) {
      pot(
        210 + i * 27,
        1990,
        i % 2 ? "#d39ddd" : "#ffcb68"
      );
    }

    sign(820, 2010, "종자 보존림");

    /* 생활마을 */
    bench(1740, 2100);
    pot(1690, 2100);
    pot(1790, 2100, "#9fbded");

    /* 우편함 */
    rect(1560, 2080, 5, 35, "#8e6936");
    rect(1547, 2066, 31, 20, "#e8be67");
    rect(1549, 2070, 27, 2, "#fff0b0");
    rect(1554, 2077, 16, 3, "#826331");

    /* 온실 구역 생육 트레이 */
    for (let i = 0; i < 4; i++) {
      const x = 2200 + i * 115;
      const y = 750;

      rect(x, y, 83, 30, "#855b2d");
      rect(x + 3, y + 3, 77, 24, "#b38b48");

      for (let j = 0; j < 6; j++) {
        rect(
          x + 9 + j * 11,
          y + 10,
          7,
          10,
          "#537a2d"
        );

        rect(
          x + 11 + j * 11,
          y + 5,
          3,
          8,
          "#a6dc54"
        );
      }
    }

    /* 시험 재배지 관수관 */
    const irrigation = [
      [2150, 1200],
      [2150, 1730],
      [2910, 1730]
    ];

    line(irrigation, "#4f7e78", 5);
    line(irrigation, "#97c3a2", 2);

    /* 물탱크 */
    rect(2990, 1410, 64, 74, "#577d76");
    rect(2996, 1415, 52, 62, "#8ac0b3");
    rect(2990, 1410, 64, 8, "#c3dcc3");
    rect(3019, 1484, 5, 22, "#6a8d7a");

    sign(2900, 1765, "시험 재배지");

    /* 습지의 얕은 물과 갈대 */
    for (let i = 0; i < 7; i++) {
      const x = 2210 + i * 119;
      const y = 1980 + i % 2 * 47;

      rect(x, y, 73, 23, "#578e8c");
      rect(x + 5, y + 3, 62, 16, "#82bdb0");
      rect(x + 12, y + 7, 25, 2, "#c1dfbd");

      for (let j = 0; j < 4; j++) {
        rect(
          x + j * 17,
          y - 20 - j % 2 * 7,
          2,
          26,
          "#628940"
        );

        rect(
          x + j * 17 - 2,
          y - 23 - j % 2 * 7,
          6,
          8,
          "#ceb665"
        );
      }
    }

    sign(2160, 2100, "염생식물 관찰지");
  }

  return {
    equipment,
    landscape
  };
})();

/* 기존 정원을 유지하고 지역별 장식 추가 */
const bloom9PreviousDecor = BLOOM.decor;

BLOOM.decor = function() {
  bloom9PreviousDecor();
  BLOOM9.landscape();
};

/* 기존 시설의 상호작용은 유지하고 외형만 교체 */
BLOOM.stationsDraw = function() {
  stations.forEach(BLOOM9.equipment);
};

/* BLOOM V9 끝 */
})();