const STORAGE_KEY = "starlife_teste_save_v2";
const LEGACY_AVATAR_SRC = "assets/avatar_antigo.png";

const DEFAULT_NAMES = ["Lucas", "Sofia", "Mateus", "Inês", "Tiago", "Beatriz"];

function getLifeStage(age) {
  const safeAge = Math.max(0, Number(age) || 0);
  if (safeAge <= 3) return { id: "bebe", label: "Bebé" };
  if (safeAge <= 12) return { id: "crianca", label: "Criança" };
  if (safeAge <= 17) return { id: "adolescente", label: "Adolescente" };
  if (safeAge <= 59) return { id: "adulto", label: "Adulto" };
  return { id: "idoso", label: "Idoso" };
}

function createNewLife(customName) {
  const randomName =
    DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];

  return {
    name: customName && customName.trim() ? customName.trim() : randomName,
    age: 0,
    money: 500,
    showLegacyImg: false,
    avatarCustom: {
      hairStyle: "short",
      hairColor: "#3b2618",
      skinTone: "#f2c6a0",
      outfit: "casual",
      outfitColor: "#3b82f6",
      tattoo: "none"
    },
    logs: ["Nasceu no StarLife teste! Começou com 0 anos."]
  };
}

let state = loadGame();

function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createNewLife();
    const parsed = JSON.parse(raw);
    return {
      ...createNewLife(),
      ...parsed,
      avatarCustom: {
        ...createNewLife().avatarCustom,
        ...(parsed.avatarCustom || {})
      },
      logs: Array.isArray(parsed.logs) ? parsed.logs : []
    };
  } catch (err) {
    console.warn("Erro ao carregar jogo guardado, a iniciar nova vida:", err);
    return createNewLife();
  }
}

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Não foi possível guardar no localStorage:", err);
  }
}

function addLog(message) {
  state.logs.unshift(message);
  if (state.logs.length > 30) {
    state.logs.length = 30;
  }
}

function getEffectiveHairColor(person) {
  const stage = getLifeStage(person.age);
  const chosenColor = person.avatarCustom?.hairColor || "#3b2618";
  if (stage.id === "idoso") {
    return "#d8dee9";
  }
  return chosenColor;
}

function renderHairSVG(hairStyle, hairColor, stageId) {
  if (stageId === "bebe") {
    return `<path d="M44 26 Q50 18 56 26 Q53 31 48 29 Z" fill="${hairColor}" />`;
  }

  switch (hairStyle) {
    case "long":
      return `
        <path d="M27 46 C27 20, 73 20, 73 46 L76 82 L64 82 L62 49 C62 35, 38 35, 38 49 L36 82 L24 82 Z" fill="${hairColor}" />
        <path d="M32 34 Q50 17 68 34 Q50 28 32 34 Z" fill="${hairColor}" />
      `;
    case "ponytail":
      return `
        <path d="M32 38 C32 20, 68 20, 68 38 C68 30, 32 30, 32 38 Z" fill="${hairColor}" />
        <path d="M66 30 C82 26, 86 48, 75 62 C74 48, 69 40, 63 37 Z" fill="${hairColor}" />
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

  let baseShirt = `
    <path d="M22 100 L26 ${topY} L39 ${topY - 3} Q50 ${topY + 8} 61 ${topY - 3} L74 ${topY} L78 100 Z" fill="${outfitColor}" />
  `;

  if (outfit === "smart") {
    baseShirt += `
      <polygon points="44,${topY - 3} 50,${topY + 9} 43,${topY + 12}" fill="#ffffff" opacity="0.9" />
      <polygon points="56,${topY - 3} 50,${topY + 9} 57,${topY + 12}" fill="#ffffff" opacity="0.9" />
      <line x1="50" y1="${topY + 9}" x2="50" y2="96" stroke="#1e293b" stroke-width="2.5" />
    `;
  } else if (outfit === "sport") {
    baseShirt += `
      <line x1="30" y1="${topY + 4}" x2="28" y2="98" stroke="#ffffff" stroke-width="2.5" opacity="0.85" />
      <line x1="70" y1="${topY + 4}" x2="72" y2="98" stroke="#ffffff" stroke-width="2.5" opacity="0.85" />
    `;
  } else if (outfit === "hoodie") {
    baseShirt += `
      <path d="M36 ${topY - 2} Q50 ${topY + 11} 64 ${topY - 2}" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="3" />
      <line x1="45" y1="${topY + 5}" x2="45" y2="82" stroke="#ffffff" stroke-width="1.8" />
      <line x1="55" y1="${topY + 5}" x2="55" y2="82" stroke="#ffffff" stroke-width="1.8" />
    `;
  }

  return `
    ${baseShirt}
    <rect x="44" y="54" width="12" height="11" rx="4" fill="${skinTone}" />
  `;
}

function renderTattooSVG(tattoo, age) {
  if (!tattoo || tattoo === "none" || age < 18) {
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

function renderPersonAvatarHTML(person) {
  const safePerson = person || createNewLife();
  const stage = getLifeStage(safePerson.age);
  const custom = safePerson.avatarCustom || createNewLife().avatarCustom;
  const hairColor = getEffectiveHairColor(safePerson);
  const skinTone = custom.skinTone || "#f2c6a0";
  const outfitColor = custom.outfitColor || "#3b82f6";

  const headRadiusY = stage.id === "bebe" ? 20 : 18;
  const headRadiusX = stage.id === "bebe" ? 19 : 16.5;
  const headCenterY = stage.id === "bebe" ? 44 : 42;

  const wrapperClass = safePerson.showLegacyImg
    ? "avatar-wrapper show-legacy-img"
    : "avatar-wrapper";

  return `
    <div class="${wrapperClass}" style="--hair-color: ${hairColor};">
      <div class="avatar-hair-bar" title="Cor atual do cabelo"></div>
      <div class="avatar-circle">
        <img
          class="legacy-avatar-img"
          src="${LEGACY_AVATAR_SRC}"
          alt="Avatar antigo de ${safePerson.name}"
        />
        <svg class="svg-avatar-layer" viewBox="0 0 100 100" role="img" aria-label="Avatar de ${safePerson.name}">
          ${renderOutfitSVG(custom.outfit, outfitColor, skinTone, stage.id)}
          ${renderTattooSVG(custom.tattoo, safePerson.age)}
          ${renderHairSVG(custom.hairStyle, hairColor, stage.id)}
          <ellipse cx="50" cy="${headCenterY}" rx="${headRadiusX}" ry="${headRadiusY}" fill="${skinTone}" />
          <circle cx="43.5" cy="${headCenterY - 1}" r="2.2" fill="#1e293b" />
          <circle cx="56.5" cy="${headCenterY - 1}" r="2.2" fill="#1e293b" />
          <path d="M45 ${headCenterY + 6} Q50 ${headCenterY + 10} 55 ${headCenterY + 6}"
            stroke="#8c4a3c" stroke-width="2" fill="none" stroke-linecap="round" />
          ${renderAgeDetailsSVG(stage.id)}
        </svg>
      </div>
      <span class="life-stage-badge">${stage.label}</span>
    </div>
  `;
}

function renderUI() {
  const stage = getLifeStage(state.age);
  const custom = state.avatarCustom;
  const effectiveHair = getEffectiveHairColor(state);

  document.documentElement.style.setProperty("--hair-color", effectiveHair);

  const avatarSlot = document.getElementById("avatarSlot");
  if (avatarSlot) {
    avatarSlot.innerHTML = renderPersonAvatarHTML(state);
  }

  const nameEl = document.getElementById("personName");
  const ageEl = document.getElementById("personAge");
  const stageEl = document.getElementById("personStage");
  const moneyEl = document.getElementById("personMoney");
  const toggleBtn = document.getElementById("btnToggleLegacy");

  if (nameEl) nameEl.textContent = state.name;
  if (ageEl) ageEl.textContent = `Idade: ${state.age}`;
  if (stageEl) stageEl.textContent = `Fase: ${stage.label}`;
  if (moneyEl) moneyEl.textContent = `Saldo: ${state.money} €`;
  if (toggleBtn) {
    toggleBtn.textContent = `Ver PNG Antigo: ${state.showLegacyImg ? "ON" : "OFF"}`;
  }

  const inputName = document.getElementById("inputName");
  const selectHairStyle = document.getElementById("selectHairStyle");
  const inputHairColor = document.getElementById("inputHairColor");
  const hairColorHex = document.getElementById("hairColorHex");
  const selectOutfit = document.getElementById("selectOutfit");
  const inputOutfitColor = document.getElementById("inputOutfitColor");
  const outfitColorHex = document.getElementById("outfitColorHex");
  const selectTattoo = document.getElementById("selectTattoo");

  if (inputName && document.activeElement !== inputName) {
    inputName.value = state.name;
  }
  if (selectHairStyle) selectHairStyle.value = custom.hairStyle;
  if (inputHairColor) inputHairColor.value = custom.hairColor;
  if (hairColorHex) hairColorHex.textContent = custom.hairColor;
  if (selectOutfit) selectOutfit.value = custom.outfit;
  if (inputOutfitColor) inputOutfitColor.value = custom.outfitColor;
  if (outfitColorHex) outfitColorHex.textContent = custom.outfitColor;
  if (selectTattoo) selectTattoo.value = custom.tattoo;

  const logBox = document.getElementById("lifeLog");
  if (logBox) {
    logBox.innerHTML = state.logs
      .map((entry) => `<div class="log-item">${entry}</div>`)
      .join("");
  }
}

function bindEvents() {
  document.getElementById("btnNextYear")?.addEventListener("click", () => {
    const prevStage = getLifeStage(state.age);
    state.age += 1;
    if (state.age >= 18) {
      state.money += 1200;
    }
    const nextStage = getLifeStage(state.age);

    if (prevStage.id !== nextStage.id) {
      addLog(`Completou ${state.age} anos e entrou na fase: ${nextStage.label}.`);
    } else {
      addLog(`Passou 1 ano (Idade: ${state.age}).`);
    }

    saveGame();
    renderUI();
  });

  document.getElementById("btnNewLife")?.addEventListener("click", () => {
    const typedName = document.getElementById("inputName")?.value;
    state = createNewLife(typedName);
    saveGame();
    renderUI();
  });

  document.getElementById("btnToggleLegacy")?.addEventListener("click", () => {
    state.showLegacyImg = !state.showLegacyImg;
    saveGame();
    renderUI();
  });

  document.getElementById("btnResetSave")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = createNewLife();
    saveGame();
    renderUI();
  });

  document.getElementById("inputName")?.addEventListener("input", (e) => {
    state.name = e.target.value || "Sem Nome";
    saveGame();
    renderUI();
  });

  document.getElementById("selectHairStyle")?.addEventListener("change", (e) => {
    state.avatarCustom.hairStyle = e.target.value;
    addLog(`Alterou o estilo de cabelo para "${e.target.value}".`);
    saveGame();
    renderUI();
  });

  document.getElementById("inputHairColor")?.addEventListener("input", (e) => {
    state.avatarCustom.hairColor = e.target.value;
    saveGame();
    renderUI();
  });

  document.getElementById("selectOutfit")?.addEventListener("change", (e) => {
    state.avatarCustom.outfit = e.target.value;
    addLog(`Alterou a roupa para "${e.target.value}".`);
    saveGame();
    renderUI();
  });

  document.getElementById("inputOutfitColor")?.addEventListener("input", (e) => {
    state.avatarCustom.outfitColor = e.target.value;
    saveGame();
    renderUI();
  });

  document.getElementById("selectTattoo")?.addEventListener("change", (e) => {
    state.avatarCustom.tattoo = e.target.value;
    if (state.age < 18 && e.target.value !== "none") {
      addLog("Tatuagem escolhida (só fica visível a partir dos 18 anos).");
    } else {
      addLog(`Alterou a tatuagem para "${e.target.value}".`);
    }
    saveGame();
    renderUI();
  });
}

bindEvents();
renderUI();
