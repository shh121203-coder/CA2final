(() => {
  "use strict";

  const DATA = window.BIO_LAB_DATA;
  const SAVE_KEY = "bio-lab-expanded-v2";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;

  const WORLD = {
    width: 1792,
    height: 1152
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
      x: 1030,
      y: 250,
      type: "shop"
    },
    {
      id: "scope",
      name: "현미경 관찰대",
      x: 800,
      y: 455,
      type: "scope"
    },
    {
      id: "terminal",
      name: "연구 기록 단말기",
      x: 925,
      y: 510,
      type: "terminal"
    },
    {
      id: "pcr",
      name: "PCR 장비",
      x: 475,
      y: 770,
      type: "pcr"
    },
    {
      id: "culture",
      name: "조직 배양대",
      x: 1465,
      y: 425,
      type: "culture"
    },
    {
      id: "pond",
      name: "물 표본 채취 지점",
      x: 360,
      y: 405,
      type: "pond"
    },
    {
      id: "bed",
      name: "연구원 숙소",
      x: 1080,
      y: 1030,
      type: "bed"
    }
  ];

  const baseSamples = [
    {
      key: "s1",
      sample: "moss",
      x: 120,
      y: 245
    },
    {
      key: "s2",
      sample: "soil",
      x: 235,
      y: 565
    },
    {
      key: "s3",
      sample: "pollen",
      x: 155,
      y: 875
    },
    {
      key: "s4",
      sample: "moss",
      x: 520,
      y: 170
    },
    {
      key: "s5",
      sample: "soil",
      x: 610,
      y: 1040
    },
    {
      key: "s6",
      sample: "pollen",
      x: 1640,
      y: 980
    },
    {
      key: "s7",
      sample: "moss",
      x: 1720,
      y: 150
    },
    {
      key: "s8",
      sample: "soil",
      x: 1180,
      y: 910
    }
  ];

  const treePositions = [];

  for (let i = 0; i < 36; i++) {
    treePositions.push({
      x: 50 + ((i * 137) % 570),
      y: 80 + ((i * 211) % 980)
    });
  }

  function newState(name, role) {
    return {
      version: 2,

      player: {
        name,
        role,
        x: 890,
        y: 690,
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
    if (x < 650 && y < 600) {
      return "생태 보존구역";
    }

    if (x < 720 && y >= 600) {
      return "분자 연구구역";
    }

    if (x > 1200 && y < 590) {
      return "스마트 온실";
    }

    if (x > 1200 && y >= 590) {
      return "시험 재배지";
    }

    if (y > 900) {
      return "연구원 생활관";
    }

    return "중앙 연구동";
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

    state.player.x = 1060;
    state.player.y = 990;

    updateAllUI();

    announceZone(
      "연구원 생활관"
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
      x: 1280 + (index % 4) * 98,
      y: 665 + Math.floor(index / 4) * 112
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
})();