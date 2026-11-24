const SAVE_KEY = "starlife_teste_save_v1";

const COUNTRIES_DATA = {
  "Portugal": ["Lisboa", "Porto", "Coimbra", "Braga", "Faro"],
  "Brasil": ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Salvador"],
  "Espanha": ["Madrid", "Barcelona", "Sevilha", "Valência"],
  "França": ["Paris", "Lyon", "Marselha"],
  "Reino Unido": ["Londres", "Manchester", "Edimburgo"],
  "Estados Unidos": ["Nova Iorque", "Los Angeles", "Chicago", "Miami"],
  "Outro": ["Outra Cidade"]
};

const NAME_HINTS = {
  "Masculino": "Ex: João, Lucas, Tiago",
  "Feminino": "Ex: Inês, Sofia, Beatriz"
};

function getLifeStage(age) {
  const safeAge = Math.max(0, Number(age) || 0);
  if (safeAge <= 3) return { id: "bebe", label: "Bebé" };
  if (safeAge <= 12) return { id: "crianca", label: "Criança" };
  if (safeAge <= 17) return { id: "adolescente", label: "Adolescente" };
  if (safeAge <= 59) return { id: "adulto", label: "Adulto" };
  return { id: "idoso", label: "Idoso" };
}

function getLegacyAvatarSrc(sex, presetIndex, age) {
  const genderFolder = sex === "Feminino" ? "feminino" : "masculino";
  const safePreset = Math.max(1, Number(presetIndex) || 1);
  const stage = getLifeStage(age).id;
  return `assets/modules/${genderFolder}/avatars/Avatar_${genderFolder}_${safePreset}_${stage}.png`;
}

function createDefaultAvatarCustom(sex = "Masculino", presetIndex = 1) {
  return {
    presetIndex,
    hairStyle: sex === "Feminino" ? "long" : "short",
    hairColor: "#3b2618",
    skinTone: "#f2c6a0",
    outfit: "casual",
    outfitColor: sex === "Feminino" ? "#ec4899" : "#3b82f6",
    tattoo: "none",
    showLegacyImg: false
  };
}

function createInitialGameState(overrides = {}) {
  const sex = overrides.sex || "Masculino";
  const presetIndex = overrides.presetIndex || 1;
  return {
    name: overrides.name || "Sem Nome",
    surname: overrides.surname || "",
    sex,
    country: overrides.country || "Portugal",
    city: overrides.city || "Lisboa",
    age: Number(overrides.age) || 0,
    health: 100,
    happiness: 80,
    money: 500,
    salary: 0,
    debt: 0,
    bankName: "Conta Jovem / Base",
    housing: "Casa dos Pais",
    education: "Sem escolaridade",
    job: "Sem profissão",
    illness: "Nenhuma",
    family: Array.isArray(overrides.family) ? overrides.family : [],
    avatarCustom: {
      ...createDefaultAvatarCustom(sex, presetIndex),
      ...(overrides.avatarCustom || {})
    },
    events: Array.isArray(overrides.events)
      ? overrides.events
      : ["Nasceu no StarLife teste! Começou com 0 anos."]
  };
}

let setupState = {
  sex: "Masculino",
  presetIndex: 1,
  family: []
};

let gameState = null;

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function pushEvent(text) {
  if (!gameState) return;
  gameState.events.unshift(`Idade ${gameState.age}: ${text}`);
  if (gameState.events.length > 40) {
    gameState.events.length = 40;
  }
}

function saveGame() {
  if (!gameState) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn("Erro ao guardar no localStorage:", e);
  }
}

function loadSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return createInitialGameState(parsed);
  } catch (e) {
    console.warn("Erro ao ler jogo guardado:", e);
    return null;
  }
}

function getEffectiveHairColor(person) {
  const stage = getLifeStage(person.age);
  const chosen = person.avatarCustom?.hairColor || "#3b2618";
  if (stage.id === "idoso") {
    return "#d8dee9";
  }
  return chosen;
}

function renderHairSVG(hairStyle, hairColor, stageId) {
  if (stageId === "bebe") {
    return `<path d="M44 25 Q50 17 56 25 Q53 30 48 28 Z" fill="${hairColor}" />`;
  }

  switch (hairStyle) {
    case "long":
      return `
        <path d="M26 46 C26 19, 74 19, 74 46 L77 84 L64 84 L62 49 C62 34, 38 34, 38 49 L36 84 L23 84 Z" fill="${hairColor}" />
        <path d="M31 34 Q50 16 69 34 Q50 28 31 34 Z" fill="${hairColor}" />
      `;
    case "ponytail":
      return `
        <path d="M32 38 C32 20, 68 20, 68 38 C68 30, 32 30, 32 38 Z" fill="${hairColor}" />
        <path d="M66 30 C84 25, 87 49, 75 63 C74 48, 69 40, 63 37 Z" fill="${hairColor}" />
      `;
    case "buzz":
      return `
        <path d="M33 38 C33 22, 67 22, 67 38 C60 28, 40 28, 33 38 Z" fill="${hairColor}" />
      `;
    case "medium":
      return `
        <path d="M30 44 C30 20, 70 20, 70 44 L71 58 L63 58 L62 43 C62 32, 38 32, 38 43 L37 58 L29 58 Z" fill="${hairColor}" />
      `;
    case "short":
    default:
      return `
        <path d="M32 39 C32 20, 68 20, 68 39 C62 29, 38 29, 32 39 Z" fill="${hairColor}" />
      `;
  }
}

function renderOutfitSVG(outfit, outfitColor, skinTone, stageId) {
  const isChildOrBaby = stageId === "bebe" || stageId === "crianca";
  const topY = isChildOrBaby ? 67 : 63;

  let shirt = `
    <path d="M22 100 L26 ${topY} L39 ${topY - 3} Q50 ${topY + 8} 61 ${topY - 3} L74 ${topY} L78 100 Z" fill="${outfitColor}" />
  `;

  if (outfit === "smart") {
    shirt += `
      <polygon points="44,${topY - 3} 50,${topY + 9} 43,${topY + 12}" fill="#ffffff" opacity="0.92" />
      <polygon points="56,${topY - 3} 50,${topY + 9} 57,${topY + 12}" fill="#ffffff" opacity="0.92" />
      <line x1="50" y1="${topY + 9}" x2="50" y2="96" stroke="#1e293b" stroke-width="2.5" />
    `;
  } else if (outfit === "sport") {
    shirt += `
      <line x1="30" y1="${topY + 4}" x2="28" y2="98" stroke="#ffffff" stroke-width="2.5" opacity="0.85" />
      <line x1="70" y1="${topY + 4}" x2="72" y2="98" stroke="#ffffff" stroke-width="2.5" opacity="0.85" />
    `;
  } else if (outfit === "hoodie") {
    shirt += `
      <path d="M36 ${topY - 2} Q50 ${topY + 11} 64 ${topY - 2}" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="3" />
      <line x1="45" y1="${topY + 5}" x2="45" y2="82" stroke="#ffffff" stroke-width="1.8" />
      <line x1="55" y1="${topY + 5}" x2="55" y2="82" stroke="#ffffff" stroke-width="1.8" />
    `;
  }

  return `
    ${shirt}
    <rect x="44" y="54" width="12" height="11" rx="4" fill="${skinTone}" />
  `;
}

function renderTattooSVG(tattoo, age) {
  if (!tattoo || tattoo === "none" || Number(age) < 18) {
    return "";
  }

  if (tattoo === "sleeve") {
    return `
      <g stroke="#111827" stroke-width="2" fill="none" opacity="0.85">
        <path d="M27 72 Q32 76 27 81 Q32 86 27 91" />
        <path d="M73 72 Q68 76 73 81 Q68 86 73 91" />
      </g>
    `;
  }

  if (tattoo === "star") {
    return `
      <polygon points="30,76 31.8,80 36,80.5 33,83.4 33.8,87.5 30,85.4 26.2,87.5 27,83.4 24,80.5 28.2,80"
        fill="#111827" opacity="0.85" />
    `;
  }

  if (tattoo === "tribal") {
    return `
      <path d="M67 74 L74 80 L67 86 L71 80 Z" fill="#111827" opacity="0.85" />
    `;
  }

  return "";
}

function renderAgeDetailsSVG(stageId) {
  if (stageId === "idoso") {
    return `
      <g stroke="#7c5c4b" stroke-width="1.4" fill="none" opacity="0.75">
        <path d="M36 37 Q39 35 42 37" />
        <path d="M58 37 Q61 35 64 37" />
        <path d="M36 51 Q38 54 40 55" />
        <path d="M64 51 Q62 54 60 55" />
      </g>
    `;
  }
  return "";
}

function renderAvatarSVGMarkup(person) {
  const stage = getLifeStage(person.age);
  const custom = person.avatarCustom || createDefaultAvatarCustom(person.sex);
  const hairColor = getEffectiveHairColor(person);
  const skinTone = custom.skinTone || "#f2c6a0";
  const outfitColor = custom.outfitColor || "#3b82f6";
  const fullName = `${person.name || ""} ${person.surname || ""}`.trim() || "Avatar";

  const headRadiusY = stage.id === "bebe" ? 20 : 18;
  const headRadiusX = stage.id === "bebe" ? 19 : 16.5;
  const headCenterY = stage.id === "bebe" ? 44 : 42;

  return `
    <svg class="svg-avatar-layer" viewBox="0 0 100 100" role="img" aria-label="${fullName}">
      ${renderOutfitSVG(custom.outfit, outfitColor, skinTone, stage.id)}
      ${renderTattooSVG(custom.tattoo, person.age)}
      ${renderHairSVG(custom.hairStyle, hairColor, stage.id)}
      <ellipse cx="50" cy="${headCenterY}" rx="${headRadiusX}" ry="${headRadiusY}" fill="${skinTone}" />
      <circle cx="43.5" cy="${headCenterY - 1}" r="2.2" fill="#1e293b" />
      <circle cx="56.5" cy="${headCenterY - 1}" r="2.2" fill="#1e293b" />
      <path d="M45 ${headCenterY + 6} Q50 ${headCenterY + 10} 55 ${headCenterY + 6}"
        stroke="#8c4a3c" stroke-width="2" fill="none" stroke-linecap="round" />
      ${renderAgeDetailsSVG(stage.id)}
    </svg>
  `;
}

function populateCountriesAndCities() {
  const countrySelect = document.getElementById("playerCountrySelect");
  if (!countrySelect) return;

  countrySelect.innerHTML = Object.keys(COUNTRIES_DATA)
    .map((country) => `<option value="${country}">${country}</option>`)
    .join("");

  onCountryChange();
}

function onCountryChange() {
  const countrySelect = document.getElementById("playerCountrySelect");
  const citySelect = document.getElementById("playerCitySelect");
  const customCountryGroup = document.getElementById("customCountryGroup");
  if (!countrySelect || !citySelect) return;

  const selectedCountry = countrySelect.value;
  if (customCountryGroup) {
    customCountryGroup.style.display = selectedCountry === "Outro" ? "flex" : "none";
  }

  const cities = COUNTRIES_DATA[selectedCountry] || ["Outra Cidade"];
  citySelect.innerHTML = cities
    .map((city) => `<option value="${city}">${city}</option>`)
    .join("");

  onCitySelectChange();
}

function onCitySelectChange() {
  const citySelect = document.getElementById("playerCitySelect");
  const customCityGroup = document.getElementById("customCityGroup");
  if (!citySelect || !customCityGroup) return;

  customCityGroup.style.display = citySelect.value === "Outra Cidade" ? "flex" : "none";
}

function onSetupGenderChange() {
  const sexSelect = document.getElementById("playerSex");
  const hintEl = document.getElementById("nameHint");
  if (!sexSelect) return;

  setupState.sex = sexSelect.value;
  if (hintEl) {
    hintEl.textContent = `(${NAME_HINTS[setupState.sex] || "Ex: João"})`;
  }
  renderSetupAvatar();
}

function changeSetupAvatar(delta) {
  const maxPresets = 4;
  setupState.presetIndex =
    (((setupState.presetIndex - 1 + delta) % maxPresets) + maxPresets) % maxPresets + 1;
  renderSetupAvatar();
}

function renderSetupAvatar() {
  const imgEl = document.getElementById("setupAvatarImg");
  const indexEl = document.getElementById("setupAvatarIndex");
  if (indexEl) {
    indexEl.textContent = `#${setupState.presetIndex}`;
  }
  if (!imgEl || !imgEl.parentElement) return;

  imgEl.removeAttribute("style");
  imgEl.src = getLegacyAvatarSrc(setupState.sex, setupState.presetIndex, 18);

  let svgHolder = imgEl.parentElement.querySelector(".setup-svg-holder");
  if (!svgHolder) {
    svgHolder = document.createElement("div");
    svgHolder.className = "setup-svg-holder";
    svgHolder.style.width = "100%";
    svgHolder.style.height = "100%";
    imgEl.parentElement.appendChild(svgHolder);
  }

  const previewPerson = createInitialGameState({
    sex: setupState.sex,
    presetIndex: setupState.presetIndex,
    age: 18
  });
  svgHolder.innerHTML = renderAvatarSVGMarkup(previewPerson);
}

function renderSetupFamilyList() {
  const listEl = document.getElementById("setupFamilyList");
  if (!listEl) return;

  if (!setupState.family.length) {
    listEl.innerHTML = `<p class="muted">Nenhum familiar adicionado ainda.</p>`;
    return;
  }

  listEl.innerHTML = setupState.family
    .map(
      (member, idx) => `
      <div class="person-card">
        <strong>${member.name}</strong> (${member.relation}, ${member.age} anos, ${member.maritalStatus})
        <button type="button" class="danger-btn" style="margin-left: 8px; padding: 4px 8px;" onclick="removeSetupFamily(${idx})">X</button>
      </div>
    `
    )
    .join("");
}

function removeSetupFamily(index) {
  setupState.family.splice(index, 1);
  renderSetupFamilyList();
}

function addFamilyMemberFromSetup() {
  const nameInput = document.getElementById("famName");
  const relationSelect = document.getElementById("famRelation");
  const ageInput = document.getElementById("famAge");
  const statusSelect = document.getElementById("famMaritalStatus");

  const name = nameInput?.value.trim();
  if (!name) {
    showToast("Escreve o nome do familiar.");
    return;
  }

  setupState.family.push({
    name,
    relation: relationSelect?.value || "Outro",
    age: Math.max(0, Number(ageInput?.value) || 0),
    maritalStatus: statusSelect?.value || "Solteiro/a"
  });

  if (nameInput) nameInput.value = "";
  renderSetupFamilyList();
}

function getSelectedLocation() {
  const countrySelect = document.getElementById("playerCountrySelect");
  const customCountry = document.getElementById("playerCountryCustom")?.value.trim();
  const citySelect = document.getElementById("playerCitySelect");
  const customCity = document.getElementById("playerCityCustom")?.value.trim();

  const country =
    countrySelect?.value === "Outro"
      ? customCountry || "Outro País"
      : countrySelect?.value || "Portugal";

  const city =
    citySelect?.value === "Outra Cidade"
      ? customCity || "Outra Cidade"
      : citySelect?.value || "Lisboa";

  return { country, city };
}

function startNewGame() {
  const nameInput = document.getElementById("playerName");
  const surnameInput = document.getElementById("playerSurname");
  const sexSelect = document.getElementById("playerSex");

  const name = nameInput?.value.trim() || "João";
  const surname = surnameInput?.value.trim() || "";
  const sex = sexSelect?.value || setupState.sex || "Masculino";
  const { country, city } = getSelectedLocation();

  gameState = createInitialGameState({
    name,
    surname,
    sex,
    country,
    city,
    presetIndex: setupState.presetIndex,
    family: [...setupState.family],
    events: [`Nasceu em ${city}, ${country} com 0 anos.`]
  });

  saveGame();
  openGameScreen();
}

function openGameScreen() {
  const setupEl = document.getElementById("setupScreen");
  const gameEl = document.getElementById("gameScreen");
  setupEl?.classList.add("hidden");
  gameEl?.classList.remove("hidden");
  renderAvatarEditor();
  renderGameUI();
}

function renderHeaderAvatar() {
  const container = document.getElementById("headerAvatarContainer");
  if (!container || !gameState) return;

  const stage = getLifeStage(gameState.age);
  const custom = gameState.avatarCustom;
  const effectiveHair = getEffectiveHairColor(gameState);
  const legacySrc = getLegacyAvatarSrc(gameState.sex, custom.presetIndex, gameState.age);

  container.className = custom.showLegacyImg
    ? "header-avatar show-legacy-mode"
    : "header-avatar";
  container.style.setProperty("--hair-color", effectiveHair);

  container.innerHTML = `
    <div class="avatar-hair-bar" title="Cor do cabelo"></div>
    <div class="avatar-circle-inner">
      <img class="legacy-avatar-img" src="${legacySrc}" alt="Avatar PNG antigo">
      ${renderAvatarSVGMarkup(gameState)}
    </div>
    <span class="life-stage-badge">${stage.label}</span>
  `;
}

function renderAvatarEditor() {
  const container = document.getElementById("avatarEditorContainer");
  if (!container || !gameState) return;

  const custom = gameState.avatarCustom;

  container.innerHTML = `
    <div class="avatar-editor-grid">
      <div class="input-group" style="margin-top: 0;">
        <label for="editHairStyle">Estilo de Cabelo</label>
        <select id="editHairStyle">
          <option value="short" ${custom.hairStyle === "short" ? "selected" : ""}>Curto</option>
          <option value="medium" ${custom.hairStyle === "medium" ? "selected" : ""}>Médio</option>
          <option value="long" ${custom.hairStyle === "long" ? "selected" : ""}>Comprido</option>
          <option value="ponytail" ${custom.hairStyle === "ponytail" ? "selected" : ""}>Rabo de cavalo</option>
          <option value="buzz" ${custom.hairStyle === "buzz" ? "selected" : ""}>Rapado / Curto alto</option>
        </select>
      </div>

      <div class="input-group" style="margin-top: 0;">
        <label for="editHairColor">Cor do Cabelo</label>
        <div class="color-picker-inline">
          <input type="color" id="editHairColor" value="${custom.hairColor}">
          <span id="editHairColorHex">${custom.hairColor}</span>
        </div>
      </div>

      <div class="input-group" style="margin-top: 0;">
        <label for="editOutfit">Roupa</label>
        <select id="editOutfit">
          <option value="casual" ${custom.outfit === "casual" ? "selected" : ""}>Casual</option>
          <option value="smart" ${custom.outfit === "smart" ? "selected" : ""}>Social / Camisa</option>
          <option value="sport" ${custom.outfit === "sport" ? "selected" : ""}>Desporto</option>
          <option value="hoodie" ${custom.outfit === "hoodie" ? "selected" : ""}>Sweat / Capuz</option>
        </select>
      </div>

      <div class="input-group" style="margin-top: 0;">
        <label for="editOutfitColor">Cor da Roupa</label>
        <div class="color-picker-inline">
          <input type="color" id="editOutfitColor" value="${custom.outfitColor}">
          <span id="editOutfitColorHex">${custom.outfitColor}</span>
        </div>
      </div>

      <div class="input-group" style="margin-top: 0;">
        <label for="editTattoo">Tatuagem (18+ anos)</label>
        <select id="editTattoo">
          <option value="none" ${custom.tattoo === "none" ? "selected" : ""}>Nenhuma</option>
          <option value="sleeve" ${custom.tattoo === "sleeve" ? "selected" : ""}>Manga no braço</option>
          <option value="star" ${custom.tattoo === "star" ? "selected" : ""}>Estrela no braço</option>
          <option value="tribal" ${custom.tattoo === "tribal" ? "selected" : ""}>Símbolo tribal</option>
        </select>
      </div>
    </div>

    <div class="editor-actions-bar">
      <button type="button" class="secondary-btn" id="toggleLegacyAvatarBtn">
        Ver PNG Antigo: ${custom.showLegacyImg ? "ON" : "OFF"}
      </button>
    </div>
  `;

  document.getElementById("editHairStyle")?.addEventListener("change", (e) => {
    gameState.avatarCustom.hairStyle = e.target.value;
    pushEvent(`Alterou o cabelo para ${e.target.value}.`);
    saveGame();
    renderGameUI();
  });

  document.getElementById("editHairColor")?.addEventListener("input", (e) => {
    gameState.avatarCustom.hairColor = e.target.value;
    const hexLabel = document.getElementById("editHairColorHex");
    if (hexLabel) hexLabel.textContent = e.target.value;
    saveGame();
    renderGameUI();
  });

  document.getElementById("editOutfit")?.addEventListener("change", (e) => {
    gameState.avatarCustom.outfit = e.target.value;
    pushEvent(`Mudou a roupa para ${e.target.value}.`);
    saveGame();
    renderGameUI();
  });

  document.getElementById("editOutfitColor")?.addEventListener("input", (e) => {
    gameState.avatarCustom.outfitColor = e.target.value;
    const hexLabel = document.getElementById("editOutfitColorHex");
    if (hexLabel) hexLabel.textContent = e.target.value;
    saveGame();
    renderGameUI();
  });

  document.getElementById("editTattoo")?.addEventListener("change", (e) => {
    gameState.avatarCustom.tattoo = e.target.value;
    if (gameState.age < 18 && e.target.value !== "none") {
      pushEvent("Selecionou tatuagem (fica visível ao atingir os 18 anos).");
    } else if (e.target.value !== "none") {
      pushEvent(`Fez uma tatuagem (${e.target.value}).`);
    }
    saveGame();
    renderGameUI();
  });

  document.getElementById("toggleLegacyAvatarBtn")?.addEventListener("click", () => {
    gameState.avatarCustom.showLegacyImg = !gameState.avatarCustom.showLegacyImg;
    saveGame();
    renderAvatarEditor();
    renderGameUI();
  });
}

function renderGameUI() {
  if (!gameState) return;

  const stage = getLifeStage(gameState.age);
  const fullName = `${gameState.name} ${gameState.surname}`.trim();

  document.documentElement.style.setProperty(
    "--hair-color",
    getEffectiveHairColor(gameState)
  );

  const nameEl = document.getElementById("homePlayerName");
  const locEl = document.getElementById("homePlayerLocation");
  const ageEl = document.getElementById("homeAge");
  const stageEl = document.getElementById("lifeStageValue");
  const healthBar = document.getElementById("healthBar");
  const healthVal = document.getElementById("healthValue");
  const happyBar = document.getElementById("happinessBar");
  const happyVal = document.getElementById("happinessValue");
  const housingEl = document.getElementById("housingSummary");
  const eduEl = document.getElementById("educationValue");
  const jobEl = document.getElementById("jobValue");
  const illEl = document.getElementById("illnessValue");

  if (nameEl) nameEl.textContent = fullName;
  if (locEl) locEl.textContent = `${gameState.city}, ${gameState.country}`;
  if (ageEl) ageEl.textContent = String(gameState.age);
  if (stageEl) stageEl.textContent = stage.label;
  if (healthBar) healthBar.style.width = `${gameState.health}%`;
  if (healthVal) healthVal.textContent = `${gameState.health}%`;
  if (happyBar) happyBar.style.width = `${gameState.happiness}%`;
  if (happyVal) happyVal.textContent = `${gameState.happiness}%`;
  if (housingEl) housingEl.textContent = gameState.housing;
  if (eduEl) eduEl.textContent = gameState.education;
  if (jobEl) jobEl.textContent = gameState.job;
  if (illEl) illEl.textContent = gameState.illness;

  const totalWealthEl = document.getElementById("totalWealth");
  const bankBalanceEl = document.getElementById("bankBalance");
  const bankNameEl = document.getElementById("currentBankName");
  const salaryEl = document.getElementById("annualSalary");
  const debtEl = document.getElementById("debtValue");

  if (totalWealthEl) totalWealthEl.textContent = `${gameState.money - gameState.debt} €`;
  if (bankBalanceEl) bankBalanceEl.textContent = `${gameState.money} €`;
  if (bankNameEl) bankNameEl.textContent = gameState.bankName;
  if (salaryEl) salaryEl.textContent = `${gameState.salary} €`;
  if (debtEl) debtEl.textContent = `${gameState.debt} €`;

  const eventsEl = document.getElementById("recentEvents");
  if (eventsEl) {
    eventsEl.innerHTML = gameState.events
      .map((ev) => `<div class="event-item">${ev}</div>`)
      .join("");
  }

  const peopleListEl = document.getElementById("peopleList");
  if (peopleListEl) {
    if (!gameState.family.length) {
      peopleListEl.innerHTML = `<p class="muted">Sem familiares registados.</p>`;
    } else {
      peopleListEl.innerHTML = gameState.family
        .map(
          (m) => `
          <div class="person-card">
            <strong>${m.name}</strong> — ${m.relation} (${m.age} anos)
          </div>
        `
        )
        .join("");
    }
  }

  renderHeaderAvatar();
}

function advanceYear() {
  if (!gameState) return;

  const prevStage = getLifeStage(gameState.age);
  gameState.age += 1;

  gameState.family = gameState.family.map((m) => ({
    ...m,
    age: (Number(m.age) || 0) + 1
  }));

  if (gameState.age >= 6 && gameState.age < 12) {
    gameState.education = "Ensino Básico";
  } else if (gameState.age >= 12 && gameState.age < 18) {
    gameState.education = "Ensino Secundário";
  } else if (gameState.age >= 18) {
    gameState.education = "Ensino Superior / Adulto";
    if (gameState.salary === 0) {
      gameState.salary = 14400;
      gameState.job = "Estagiário / Trabalhador";
    }
    gameState.money += gameState.salary;
  }

  const nextStage = getLifeStage(gameState.age);
  if (prevStage.id !== nextStage.id) {
    pushEvent(`Entrou na fase de vida: ${nextStage.label}.`);
  } else {
    pushEvent("Completou mais um ano de vida.");
  }

  saveGame();
  renderGameUI();
}

function bindTabsAndNavigation() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".tab-content").forEach((sec) => {
        sec.classList.toggle("hidden", sec.id !== targetTab);
      });
    });
  });

  document.querySelectorAll(".sub-nav").forEach((nav) => {
    nav.querySelectorAll(".sub-btn").forEach((subBtn) => {
      subBtn.addEventListener("click", () => {
        const targetSub = subBtn.dataset.sub;
        nav.querySelectorAll(".sub-btn").forEach((b) => b.classList.remove("active"));
        subBtn.classList.add("active");

        const parentSection = nav.parentElement;
        parentSection?.querySelectorAll(".sub-content").forEach((box) => {
          box.classList.toggle("hidden", box.id !== targetSub);
        });
      });
    });
  });
}

function bindMainButtons() {
  document.getElementById("addFamilyMemberBtn")?.addEventListener("click", addFamilyMemberFromSetup);
  document.getElementById("startGameBtn")?.addEventListener("click", startNewGame);
  document.getElementById("advanceYearBtn")?.addEventListener("click", advanceYear);

  document.getElementById("continueGameBtn")?.addEventListener("click", () => {
    const saved = loadSavedGame();
    if (saved) {
      gameState = saved;
      openGameScreen();
    }
  });

  document.getElementById("deleteSaveBtn")?.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    gameState = null;
    document.getElementById("continuePanel")?.classList.add("hidden");
    showToast("Jogo guardado apagado.");
  });
}

function initApp() {
  document.getElementById("setupScreen")?.classList.remove("hidden");
  document.getElementById("gameScreen")?.classList.add("hidden");
  document.getElementById("deathScreen")?.classList.add("hidden");

  populateCountriesAndCities();
  bindTabsAndNavigation();
  bindMainButtons();
  renderSetupAvatar();
  renderSetupFamilyList();

  const existingSave = loadSavedGame();
  if (existingSave) {
    document.getElementById("continuePanel")?.classList.remove("hidden");
  }
}

initApp();
