"use strict";

/* =========================================
   STARLIFE · PRINCIPAL — guardar/carregar, ecrãs, separadores e arranque
========================================= */

function saveGame() {
  if (!game) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    updateContinuePanel();
  } catch (error) {
    console.error("Erro ao guardar:", error);
  }
}

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    const loaded = JSON.parse(saved);
    if (!loaded || !loaded.player || !Array.isArray(loaded.family)) return null;
    if (loaded.player.alive === false) {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    loaded.player.avatarCustom ??= createDefaultAvatarCustom(loaded.player.sex || "Masculino", 1);
    loaded.player.avatarCustom.enabled = true;
    loaded.player.avatarCustom.presetIndex ??= 1;
    loaded.player.avatarCustom.mouthStyle ??= "default";
    loaded.player.licenses ??= { carB: false, bikeAM: false, bikeA1: false, bikeA2: false, bikeA: false };
    loaded.player.bankAccount ??= null;
    loaded.player.activeRental ??= null;
    loaded.player.personalDebt ??= 0;
    loaded.properties ??= [];
    loaded.marketListings ??= [];
    loaded.vehicles ??= [];
    loaded.businesses ??= [];
    loaded.events ??= [];
    loaded.financeHistory ??= [];
    loaded.player.illness ??= null;
    loaded.player.maxAge ??= randomNumber(78, 108);
    initializeEducation(loaded.player);
    loaded.family.forEach(f => {
      f.relationship ??= randomNumber(65, 95);
      f.alive ??= true;
      f.maxAge ??= randomNumber(78, 102);
      f.maritalStatus ??= "";
    });
    return loaded;
  } catch (error) {
    return null;
  }
}

function deleteSave() {
  if (!confirm("Tens a certeza de que queres apagar o jogo guardado?")) return;
  localStorage.removeItem(SAVE_KEY);
  game = null;
  updateContinuePanel();
  showSetup();
  showToast("Jogo guardado apagado.");
}

function updateContinuePanel() {
  const saved = loadGame();
  if ($("continuePanel")) {
    $("continuePanel").classList.toggle("hidden", !saved);
  }
}

function showGame() {
  $("setupScreen").classList.add("hidden");
  $("deathScreen").classList.add("hidden");
  $("gameScreen").classList.remove("hidden");
  showTab("homeTab");
}

function renderHome() {
  const player = game.player;
  $("homePlayerName").textContent = `${player.name} ${player.surname}`;
  $("homePlayerLocation").textContent = `${player.city}, ${player.country}`;
  $("homeAge").textContent = player.age;
  $("healthValue").textContent = `${Math.round(player.health)}%`;
  $("happinessValue").textContent = `${Math.round(player.happiness)}%`;
  $("healthBar").style.width = `${player.health}%`;
  $("healthBar").style.backgroundColor = player.health < 30 ? "var(--danger-color)" : player.health < 60 ? "#f59e0b" : "var(--success-color)";
  $("happinessBar").style.width = `${player.happiness}%`;
  $("educationValue").textContent = player.education;
  $("jobValue").textContent = player.job || "Sem profissão";
  $("illnessValue").textContent = player.illness ? player.illness.name : "Nenhuma";

  const hint = $("illnessHint");
  if (hint) {
    const info = getIllnessInfo(player.illness);
    if (info) {
      hint.textContent = `🩺 Sintomas: ${info.symptom}. Sugestão: ${specialtyLabels[info.specialty] || "Médico de Família"}.`;
      hint.style.display = "block";
    } else {
      hint.style.display = "none";
    }
  }

  if ($("headerAvatarContainer")) {
    $("headerAvatarContainer").innerHTML = renderAvatarImgHTML(player, false, "Avatar");
  }

  const primaryProp = game.properties.find(p => p.status === "primary");
  if (primaryProp) $("housingSummary").textContent = primaryProp.title;
  else if (player.activeRental) $("housingSummary").textContent = `${player.activeRental.title} (Arrendada)`;
  else $("housingSummary").textContent = "Casa dos Pais";

  const eventsContainer = $("recentEvents");
  eventsContainer.innerHTML = "";
  game.events.slice(0, 6).forEach(ev => {
    const el = document.createElement("div");
    el.className = `event-item ${ev.type || "neutral"}`;
    el.innerHTML = `${escapeHTML(ev.message)}<small>Idade: ${ev.age}</small>`;
    eventsContainer.appendChild(el);
  });
}

function renderPatrimony() {
  const player = game.player;
  $("totalWealth").textContent = money(getTotalWealth());
  $("bankBalance").textContent = money(player.bank);
  $("currentBankName").textContent = player.bankAccount ? player.bankAccount.bankName : "Sem conta aberta";
  $("annualSalary").textContent = money(player.salary);
  $("debtValue").textContent = money(player.debt);

  renderBankSection();
  renderMyAssets();
}

function renderCareer() {
  const player = game.player;
  $("careerJob").textContent = player.job || "Nenhuma";
  $("careerSalary").textContent = money(player.salary);
  $("careerEducation").textContent = player.education;

  const jobContainer = $("jobOptions");
  if (jobContainer) {
    jobContainer.innerHTML = "";
    if (player.age < 16) {
      jobContainer.innerHTML = `<p class="muted">Procura emprego a partir dos 16 anos.</p>`;
    } else if (player.retired) {
      jobContainer.innerHTML = `<p class="muted">Já estás reformado/a e a receber pensão anual.</p>`;
    } else {
      if (player.job) {
        jobContainer.innerHTML += `
          <button type="button" class="primary-btn full-width" ${player.workedHardThisYear ? "disabled" : ""} onclick="workHarder()">
            ${player.workedHardThisYear ? "💪 Já trabalhaste mais este ano" : `💪 Trabalhar Mais (Desempenho: ${player.jobPerformance ?? 50}%)`}
          </button>
        `;
      }

      const eligibleJobs = jobCatalog.filter(j => (player.educationLevel ?? 0) >= j.minEdu);
      eligibleJobs.forEach(j => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "secondary-btn full-width";
        btn.textContent = `${j.title} · ${money(j.salary)}/ano`;
        btn.onclick = () => applyJob(j.title, j.salary);
        jobContainer.appendChild(btn);
      });
    }
  }

  renderSchoolAndUniversitySubmenu();
  renderBusinesses();
}

function applyJob(name, salary) {
  if (game.player.age < 16) { showToast("Precisas de ter 16 anos."); return; }
  game.player.retired = false;
  game.player.job = name;
  game.player.salary = salary;
  game.player.jobPerformance = 55;
  addEvent(`Começaste a trabalhar como ${name}!`);
  saveGame();
  renderGame();
}

function renderGame() {
  if (!game) return;
  renderHome();
  renderPatrimony();
  renderCareer();
  renderHousingSection();
  renderVehiclesSection();
  renderPeople();
}

function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.add("hidden"));
  const target = $(tabId);
  if (target) target.classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));

  if (tabId !== "activitiesTab") {
    setMedicalCenterOpen(false);
  }
}

function showSubTab(subId) {
  const parentTab = document.querySelector(".tab-content:not(.hidden)");
  if (!parentTab) return;
  parentTab.querySelectorAll(".sub-content").forEach(c => c.classList.add("hidden"));
  parentTab.querySelectorAll(".sub-btn").forEach(b => b.classList.remove("active"));

  const target = $(subId);
  if (target) target.classList.remove("hidden");
  const activeBtn = parentTab.querySelector(`[data-sub="${subId}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

function boot() {
  const startBtn = $("startGameBtn");
  if (startBtn) {
    startBtn.addEventListener("click", startGame);
  }

  $("addFamilyMemberBtn")?.addEventListener("click", () => {
    const name = $("famName").value.trim();
    if (!name) return;
    initialFamily.push({
      name,
      surname: "",
      relation: $("famRelation").value,
      age: Number($("famAge").value) || 30,
      maritalStatus: $("famMaritalStatus").value
    });
    $("famName").value = "";
    updateSetupFamilyUI();
  });

  $("meetFriendBtn")?.addEventListener("click", () => meetNewPerson("friend"));
  $("meetRomanceBtn")?.addEventListener("click", () => meetNewPerson("romance"));
  $("haveChildBtn")?.addEventListener("click", haveChild);

  $("gymActivityBtn")?.addEventListener("click", () => doLifestyleActivity("gym"));
  $("vacationActivityBtn")?.addEventListener("click", () => doLifestyleActivity("vacation"));
  $("lotteryActivityBtn")?.addEventListener("click", () => doLifestyleActivity("lottery"));
  $("crimeActivityBtn")?.addEventListener("click", () => doLifestyleActivity("crime"));

  $("openMedicalCenterBtn")?.addEventListener("click", () => setMedicalCenterOpen(true));
  $("closeMedicalCenterBtn")?.addEventListener("click", () => setMedicalCenterOpen(false));

  document.querySelectorAll("[data-health]").forEach(btn => {
    btn.onclick = () => openHealthSpecialty(btn.dataset.health);
  });

  document.querySelectorAll(".sub-btn").forEach(btn => {
    btn.onclick = () => showSubTab(btn.dataset.sub);
  });

  $("createBusinessBtn")?.addEventListener("click", openBusinessModal);
  $("continueGameBtn")?.addEventListener("click", () => {
    const saved = loadGame();
    if (saved) { game = saved; showGame(); renderGame(); }
  });
  $("deleteSaveBtn")?.addEventListener("click", deleteSave);
  $("advanceYearBtn").addEventListener("click", advanceYear);

  $("bottomNav").addEventListener("click", e => {
    const btn = e.target.closest(".nav-btn");
    if (btn && btn.dataset.tab) showTab(btn.dataset.tab);
  });

  initSetupGeography();
  updateContinuePanel();
  updateSetupFamilyUI();
  updateSetupAvatarUI();
  updateNameHint();
}

document.addEventListener("DOMContentLoaded", boot);
