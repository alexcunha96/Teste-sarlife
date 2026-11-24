const SAVE_KEY = "starlife_teste_save_v2";

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

const PRESET_CONFIGS = {
  1: {
    skinTone: "#f2c29b",
    eyeColor: "#2563eb",
    browStyle: "arch",
    facialHair: "none",
    hairStyle: "short",
    hairColor: "#3b2618",
    outfit: "casual",
    outfitColor: "#3b82f6",
    tattoo: "none"
  },
  2: {
    skinTone: "#d89b6c",
    eyeColor: "#15803d",
    browStyle: "straight",
    facialHair: "stubble",
    hairStyle: "medium",
    hairColor: "#1f2937",
    outfit: "smart",
    outfitColor: "#1e3a8a",
    tattoo: "star"
  },
  3: {
    skinTone: "#8d5524",
    eyeColor: "#5c3a21",
    browStyle: "thick",
    facialHair: "goatee",
    hairStyle: "buzz",
    hairColor: "#111827",
    outfit: "hoodie",
    outfitColor: "#dc2626",
    tattoo: "sleeve"
  },
  4: {
    skinTone: "#fbe3cf",
    eyeColor: "#0284c7",
    browStyle: "soft",
    facialHair: "beard",
    hairStyle: "long",
    hairColor: "#b45309",
    outfit: "sport",
    outfitColor: "#0f766e",
    tattoo: "tribal"
  }
};

const APPEARANCE_OPTIONS = {
  eyes: [
    { id: "#2563eb", label: "Olhos Azuis" },
    { id: "#15803d", label: "Olhos Verdes" },
    { id: "#5c3a21", label: "Olhos Castanhos" },
    { id: "#475569", label: "Olhos Cinzentos" },
    { id: "#92400e", label: "Olhos Âmbar / Mel" }
  ],
  skin: [
    { id: "#fbe3cf", label: "Pele Clara" },
    { id: "#f2c29b", label: "Pele Média Clara" },
    { id: "#d89b6c", label: "Pele Bronzeada" },
    { id: "#b06d3b", label: "Pele Morena" },
    { id: "#7c4722", label: "Pele Escura" }
  ],
  brows: [
    { id: "arch", label: "Sobrancelhas Arqueadas" },
    { id: "straight", label: "Sobrancelhas Retas" },
    { id: "thick", label: "Sobrancelhas Densas" },
    { id: "soft", label: "Sobrancelhas Suaves" }
  ],
  facialHair: [
    { id: "none", label: "Sem Barba" },
    { id: "stubble", label: "Barba por Fazer" },
    { id: "goatee", label: "Cavanhaque / Bigode" },
    { id: "beard", label: "Barba Cheia" }
  ],
  hair: [
    { id: "short", label: "Cabelo Curto" },
    { id: "medium", label: "Cabelo Médio" },
    { id: "long", label: "Cabelo Comprido" },
    { id: "ponytail", label: "Rabo de Cavalo" },
    { id: "buzz", label: "Rapado / Curto Alto" }
  ],
  outfit: [
    { id: "casual", label: "T-Shirt Casual" },
    { id: "smart", label: "Camisa Social" },
    { id: "sport", label: "Fato de Treino" },
    { id: "hoodie", label: "Sweat com Capuz" }
  ],
  tattoo: [
    { id: "none", label: "Sem Tatuagem" },
    { id: "star", label: "Estrela no Braço" },
    { id: "sleeve", label: "Manga no Braço" },
    { id: "tribal", label: "Símbolo Tribal" }
  ]
};

const APPEARANCE_CATEGORIES = [
  { key: "eyes", label: "Olhos" },
  { key: "skin", label: "Pele" },
  { key: "brows", label: "Sobrancelhas" },
  { key: "facialHair", label: "Barba" },
  { key: "hair", label: "Cabelo" },
  { key: "outfit", label: "Roupa" },
  { key: "tattoo", label: "Tatuagem" }
];

const generatedLayerCache = new Map();

function getLifeStage(age) {
  const safeAge = Math.max(0, Number(age) || 0);
  if (safeAge <= 3) return { id: "bebe", label: "Bebé" };
  if (safeAge <= 12) return { id: "crianca", label: "Criança" };
  if (safeAge <= 17) return { id: "adolescente", label: "Adolescente" };
  if (safeAge <= 59) return { id: "adulto", label: "Adulto" };
  return { id: "idoso", label: "Idoso" };
}

function getEffectiveHairColor(person) {
  const stage = getLifeStage(person.age);
  const chosen = person.avatarCustom?.hairColor || "#3b2618";
  return stage.id === "idoso" ? "#d8dee9" : chosen;
}

function createDefaultAvatarCustom(sex = "Masculino", presetIndex = 1) {
  const preset = PRESET_CONFIGS[presetIndex] || PRESET_CONFIGS[1];
  return {
    presetIndex,
    skinTone: preset.skinTone,
    eyeColor: preset.eyeColor,
    browStyle: preset.browStyle,
    facialHair: sex === "Feminino" ? "none" : preset.facialHair,
    hairStyle: sex === "Feminino" && presetIndex === 1 ? "long" : preset.hairStyle,
    hairColor: preset.hairColor,
    outfit: preset.outfit,
    outfitColor: sex === "Feminino" && presetIndex === 1 ? "#ec4899" : preset.outfitColor,
    tattoo: preset.tattoo
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
      : ["Nasceu no StarLife! Começou com 0 anos."]
  };
}

let setupState = {
  sex: "Masculino",
  presetIndex: 1,
  avatarCustom: createDefaultAvatarCustom("Masculino", 1),
  family: []
};

let gameState = null;

let modalState = {
  isOpen: false,
  target: "game",
  category: "hair",
  draft: null
};

function sanitizeSlug(val) {
  return String(val || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
}

function getLayerAssetUrls(person) {
  const stage = getLifeStage(person.age).id;
  const custom = person.avatarCustom || createDefaultAvatarCustom(person.sex, person.presetIndex);
  const hairColor = getEffectiveHairColor(person);
  const baseFolder = "assets/avatars";

  return [
    {
      layer: "base",
      z: 1,
      src: `${baseFolder}/base_${stage}_${sanitizeSlug(custom.skinTone)}.png`,
      person,
      color: custom.skinTone
    },
    {
      layer: "outfit",
      z: 2,
      src: `${baseFolder}/outfit_${sanitizeSlug(custom.outfit)}_${sanitizeSlug(custom.outfitColor)}.png`,
      person,
      color: custom.outfitColor
    },
    {
      layer: "tattoo",
      z: 3,
      src:
        Number(person.age) >= 18 && custom.tattoo !== "none"
          ? `${baseFolder}/tattoo_${sanitizeSlug(custom.tattoo)}.png`
          : "",
      person,
      color: "#0f172a"
    },
    {
      layer: "eyes",
      z: 4,
      src: `${baseFolder}/eyes_${sanitizeSlug(custom.eyeColor)}.png`,
      person,
      color: custom.eyeColor
    },
    {
      layer: "brows",
      z: 5,
      src: `${baseFolder}/brows_${sanitizeSlug(custom.browStyle)}_${sanitizeSlug(hairColor)}.png`,
      person,
      color: hairColor
    },
    {
      layer: "facialHair",
      z: 6,
      src:
        Number(person.age) >= 14 && custom.facialHair !== "none"
          ? `${baseFolder}/beard_${sanitizeSlug(custom.facialHair)}_${sanitizeSlug(hairColor)}.png`
          : "",
      person,
      color: hairColor
    },
    {
      layer: "hair",
      z: 7,
      src: `${baseFolder}/hair_${sanitizeSlug(custom.hairStyle)}_${sanitizeSlug(hairColor)}.png`,
      person,
      color: hairColor
    }
  ].filter((item) => Boolean(item.src));
}

function generateFallbackLayerDataUrl(layerSpec) {
  const key = `${layerSpec.layer}|${layerSpec.color}|${layerSpec.person.avatarCustom.hairStyle}|${layerSpec.person.avatarCustom.browStyle}|${layerSpec.person.avatarCustom.facialHair}|${layerSpec.person.avatarCustom.outfit}|${layerSpec.person.avatarCustom.tattoo}|${getLifeStage(layerSpec.person.age).id}`;
  if (generatedLayerCache.has(key)) {
    return generatedLayerCache.get(key);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const stage = getLifeStage(layerSpec.person.age).id;
  const custom = layerSpec.person.avatarCustom;
  const scale = stage === "bebe" ? 0.84 : stage === "crianca" ? 0.92 : 1.0;

  ctx.save();
  ctx.translate(160, 170);
  ctx.scale(scale, scale);

  if (layerSpec.layer === "base") {
    ctx.fillStyle = custom.skinTone;
    ctx.beginPath();
    ctx.roundRect(-24, 34, 48, 42, 12);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -18, 62, 74, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-63, -14, 11, 18, -0.1, 0, Math.PI * 2);
    ctx.ellipse(63, -14, 11, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(15, 23, 42, 0.35)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-5, 2);
    ctx.lineTo(6, 4);
    ctx.stroke();

    ctx.strokeStyle = "#9f4a3e";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 22, 16, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (layerSpec.layer === "outfit") {
    ctx.fillStyle = custom.outfitColor;
    ctx.beginPath();
    ctx.moveTo(-105, 145);
    ctx.quadraticCurveTo(-85, 58, -22, 52);
    ctx.lineTo(22, 52);
    ctx.quadraticCurveTo(85, 58, 105, 145);
    ctx.closePath();
    ctx.fill();

    if (custom.outfit === "smart") {
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(-18, 52);
      ctx.lineTo(0, 82);
      ctx.lineTo(18, 52);
      ctx.closePath();
      ctx.fill();
    } else if (custom.outfit === "hoodie") {
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, 62);
      ctx.lineTo(-10, 96);
      ctx.moveTo(10, 62);
      ctx.lineTo(10, 96);
      ctx.stroke();
    }
  } else if (layerSpec.layer === "tattoo") {
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#0f172a";
    if (custom.tattoo === "star") {
      ctx.beginPath();
      ctx.arc(68, 92, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (custom.tattoo === "sleeve") {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(54, 78);
      ctx.lineTo(84, 98);
      ctx.moveTo(58, 102);
      ctx.lineTo(82, 80);
      ctx.stroke();
    } else if (custom.tattoo === "tribal") {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(70, 94, 11, 0.4, Math.PI * 1.6);
      ctx.stroke();
    }
  } else if (layerSpec.layer === "eyes") {
    [-23, 23].forEach((x) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(x, -26, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = custom.eyeColor;
      ctx.beginPath();
      ctx.arc(x, -26, 6.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      ctx.arc(x, -26, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x - 2, -28.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (layerSpec.layer === "brows") {
    ctx.strokeStyle = getEffectiveHairColor(layerSpec.person);
    ctx.lineWidth = custom.browStyle === "thick" ? 6 : 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-36, -42);
    ctx.quadraticCurveTo(-23, custom.browStyle === "arch" ? -51 : -43, -10, -42);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(10, -42);
    ctx.quadraticCurveTo(23, custom.browStyle === "arch" ? -51 : -43, 36, -42);
    ctx.stroke();
  } else if (layerSpec.layer === "facialHair") {
    ctx.fillStyle = getEffectiveHairColor(layerSpec.person);
    if (custom.facialHair === "beard") {
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(0, 6, 56, 0.15, Math.PI - 0.15);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (custom.facialHair === "goatee") {
      ctx.beginPath();
      ctx.ellipse(0, 34, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (custom.facialHair === "stubble") {
      ctx.globalAlpha = 0.26;
      ctx.beginPath();
      ctx.arc(0, 8, 53, 0.2, Math.PI - 0.2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else if (layerSpec.layer === "hair") {
    ctx.fillStyle = getEffectiveHairColor(layerSpec.person);
    if (stage === "bebe") {
      ctx.beginPath();
      ctx.arc(0, -88, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (custom.hairStyle === "long") {
      ctx.beginPath();
      ctx.roundRect(-68, -92, 136, 152, 42);
      ctx.fill();
    } else if (custom.hairStyle === "ponytail") {
      ctx.beginPath();
      ctx.arc(0, -34, 65, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(52, -56, 26, 12, -0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (custom.hairStyle === "buzz") {
      ctx.beginPath();
      ctx.arc(0, -30, 63, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (custom.hairStyle === "medium") {
      ctx.beginPath();
      ctx.arc(0, -34, 67, Math.PI * 0.92, Math.PI * 2.08);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, -32, 65, Math.PI * 0.96, Math.PI * 2.04);
      ctx.fill();
    }
  }

  ctx.restore();

  const url = canvas.toDataURL("image/png");
  generatedLayerCache.set(key, url);
  return url;
}

function renderAvatarLayersHTML(person) {
  const layers = getLayerAssetUrls(person);
  return `
    <div class="avatar-stack">
      ${layers
        .map((item) => {
          const fallbackUrl = generateFallbackLayerDataUrl(item);
          return `<img class="avatar-layer-img" data-layer="${item.layer}" style="z-index:${item.z};" src="${item.src}" data-fallback="${fallbackUrl}" alt="${item.layer}">`;
        })
        .join("")}
    </div>
  `;
}

function bindAvatarFallbackHandlers(container) {
  if (!container) return;
  container.querySelectorAll("img.avatar-layer-img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const fallback = img.dataset.fallback;
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        }
      },
      { once: true }
    );
  });
}

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

function openAppearanceModal(target = "game") {
  modalState.isOpen = true;
  modalState.target = target;
  modalState.category = "hair";

  if (target === "setup") {
    modalState.draft = {
      ...setupState.avatarCustom,
      age: 18,
      sex: setupState.sex,
      name: document.getElementById("playerName")?.value.trim() || "Personagem"
    };
  } else if (gameState) {
    modalState.draft = {
      ...gameState.avatarCustom,
      age: gameState.age,
      sex: gameState.sex,
      name: gameState.name
    };
  }

  renderAppearanceModal();
}

function closeAppearanceModal() {
  modalState.isOpen = false;
  modalState.draft = null;
  const modal = document.getElementById("customModal");
  if (modal) {
    modal.innerHTML = "";
    modal.classList.add("hidden");
  }
}

function cycleDraftOption(delta) {
  if (!modalState.draft) return;
  const cat = modalState.category;
  const options = APPEARANCE_OPTIONS[cat] || [];
  if (!options.length) return;

  const currentMap = {
    eyes: modalState.draft.eyeColor,
    skin: modalState.draft.skinTone,
    brows: modalState.draft.browStyle,
    facialHair: modalState.draft.facialHair,
    hair: modalState.draft.hairStyle,
    outfit: modalState.draft.outfit,
    tattoo: modalState.draft.tattoo
  };

  const currentVal = currentMap[cat];
  let idx = options.findIndex((o) => o.id === currentVal);
  if (idx === -1) idx = 0;

  const nextIdx = (((idx + delta) % options.length) + options.length) % options.length;
  const nextVal = options[nextIdx].id;

  if (cat === "eyes") modalState.draft.eyeColor = nextVal;
  if (cat === "skin") modalState.draft.skinTone = nextVal;
  if (cat === "brows") modalState.draft.browStyle = nextVal;
  if (cat === "facialHair") modalState.draft.facialHair = nextVal;
  if (cat === "hair") modalState.draft.hairStyle = nextVal;
  if (cat === "outfit") modalState.draft.outfit = nextVal;
  if (cat === "tattoo") modalState.draft.tattoo = nextVal;

  renderAppearanceModal();
}

function getCurrentDraftOptionLabel() {
  if (!modalState.draft) return "";
  const cat = modalState.category;
  const options = APPEARANCE_OPTIONS[cat] || [];
  const currentMap = {
    eyes: modalState.draft.eyeColor,
    skin: modalState.draft.skinTone,
    brows: modalState.draft.browStyle,
    facialHair: modalState.draft.facialHair,
    hair: modalState.draft.hairStyle,
    outfit: modalState.draft.outfit,
    tattoo: modalState.draft.tattoo
  };
  const found = options.find((o) => o.id === currentMap[cat]);
  return found ? found.label : "";
}

function saveAppearanceModal() {
  if (!modalState.draft) return;

  const cleanedCustom = {
    presetIndex: modalState.draft.presetIndex,
    skinTone: modalState.draft.skinTone,
    eyeColor: modalState.draft.eyeColor,
    browStyle: modalState.draft.browStyle,
    facialHair: modalState.draft.facialHair,
    hairStyle: modalState.draft.hairStyle,
    hairColor: modalState.draft.hairColor,
    outfit: modalState.draft.outfit,
    outfitColor: modalState.draft.outfitColor,
    tattoo: modalState.draft.tattoo
  };

  if (modalState.target === "setup") {
    setupState.avatarCustom = cleanedCustom;
    renderSetupAvatar();
  } else if (gameState) {
    gameState.avatarCustom = cleanedCustom;
    pushEvent("Atualizou a aparência do avatar.");
    saveGame();
    renderGameUI();
  }

  closeAppearanceModal();
  showToast("Aparência guardada!");
}

function renderAppearanceModal() {
  const modal = document.getElementById("customModal");
  if (!modal || !modalState.isOpen || !modalState.draft) return;

  modal.classList.remove("hidden");

  const draftPerson = {
    name: modalState.draft.name,
    surname: "",
    sex: modalState.draft.sex,
    age: modalState.draft.age,
    avatarCustom: modalState.draft
  };

  const optionLabel = getCurrentDraftOptionLabel();
  const tattooAgeNote =
    modalState.category === "tattoo" && Number(modalState.draft.age) < 18
      ? `<small class="muted">A tatuagem fica visível a partir dos 18 anos (idade atual: ${modalState.draft.age}).</small>`
      : "";

  modal.innerHTML = `
    <div class="appearance-modal-card" role="dialog" aria-modal="true" aria-label="Editar Avatar">
      <div class="appearance-header">
        <h2>✨ Editar Avatar</h2>
        <p>Seleciona a categoria e usa as setas para alterar</p>
      </div>

      <div class="appearance-tabs">
        ${APPEARANCE_CATEGORIES.map(
          (c) => `
          <button type="button" class="app-cat-btn ${modalState.category === c.key ? "active" : ""}" data-app-cat="${c.key}">
            ${c.label}
          </button>
        `
        ).join("")}
      </div>

      <div class="appearance-stage-row">
        <button type="button" class="side-arrow-btn" id="appPrevBtn" aria-label="Anterior">◀</button>
        <div class="appearance-portrait-box" id="modalPortraitBox">
          ${renderAvatarLayersHTML(draftPerson)}
        </div>
        <button type="button" class="side-arrow-btn" id="appNextBtn" aria-label="Seguinte">▶</button>
      </div>

      <div class="appearance-option-label">${optionLabel}</div>
      ${tattooAgeNote ? `<div style="text-align:center;">${tattooAgeNote}</div>` : ""}

      <div class="appearance-extra-controls">
        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;">
          Cor Cabelo:
          <input type="color" id="modalHairColorInput" value="${modalState.draft.hairColor}" style="width:36px;height:30px;padding:1px;">
        </label>

        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;">
          Cor Roupa:
          <input type="color" id="modalOutfitColorInput" value="${modalState.draft.outfitColor}" style="width:36px;height:30px;padding:1px;">
        </label>
      </div>

      <button type="button" class="save-btn full-width" id="saveAppearanceBtn">Guardar</button>
      <button type="button" class="secondary-btn full-width" id="cancelAppearanceBtn">Cancelar</button>
    </div>
  `;

  bindAvatarFallbackHandlers(document.getElementById("modalPortraitBox"));

  modal.querySelectorAll("[data-app-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      modalState.category = btn.dataset.appCat;
      renderAppearanceModal();
    });
  });

  document.getElementById("appPrevBtn")?.addEventListener("click", () => cycleDraftOption(-1));
  document.getElementById("appNextBtn")?.addEventListener("click", () => cycleDraftOption(1));

  document.getElementById("modalHairColorInput")?.addEventListener("input", (e) => {
    modalState.draft.hairColor = e.target.value;
    renderAppearanceModal();
  });

  document.getElementById("modalOutfitColorInput")?.addEventListener("input", (e) => {
    modalState.draft.outfitColor = e.target.value;
    renderAppearanceModal();
  });

  document.getElementById("saveAppearanceBtn")?.addEventListener("click", saveAppearanceModal);
  document.getElementById("cancelAppearanceBtn")?.addEventListener("click", closeAppearanceModal);
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
  setupState.avatarCustom = createDefaultAvatarCustom(setupState.sex, setupState.presetIndex);
  if (hintEl) {
    hintEl.textContent = `(${NAME_HINTS[setupState.sex] || "Ex: João"})`;
  }
  renderSetupAvatar();
}

function changeSetupAvatar(delta) {
  const maxPresets = Object.keys(PRESET_CONFIGS).length;
  setupState.presetIndex =
    (((setupState.presetIndex - 1 + delta) % maxPresets) + maxPresets) % maxPresets + 1;
  setupState.avatarCustom = createDefaultAvatarCustom(setupState.sex, setupState.presetIndex);
  renderSetupAvatar();
}

function renderSetupAvatar() {
  const stageEl = document.getElementById("setupAvatarStage");
  const indexEl = document.getElementById("setupAvatarIndex");
  if (indexEl) {
    indexEl.textContent = `#${setupState.presetIndex}`;
  }
  if (!stageEl) return;

  const previewPerson = {
    name: document.getElementById("playerName")?.value.trim() || "Avatar",
    surname: "",
    sex: setupState.sex,
    age: 18,
    avatarCustom: setupState.avatarCustom
  };

  stageEl.innerHTML = renderAvatarLayersHTML(previewPerson);
  bindAvatarFallbackHandlers(stageEl);
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
        <button type="button" class="danger-btn" style="margin-left: 8px; padding: 4px 8px;" data-remove-fam="${idx}">X</button>
      </div>
    `
    )
    .join("");

  listEl.querySelectorAll("[data-remove-fam]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.removeFam);
      setupState.family.splice(index, 1);
      renderSetupFamilyList();
    });
  });
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
    avatarCustom: { ...setupState.avatarCustom },
    family: [...setupState.family],
    events: [`Nasceu em ${city}, ${country} com 0 anos.`]
  });

  saveGame();
  openGameScreen();
}

function openGameScreen() {
  document.getElementById("setupScreen")?.classList.add("hidden");
  document.getElementById("gameScreen")?.classList.remove("hidden");
  renderAvatarEditorButton();
  renderGameUI();
}

function renderHeaderAvatar() {
  const container = document.getElementById("headerAvatarContainer");
  if (!container || !gameState) return;

  const stage = getLifeStage(gameState.age);
  const effectiveHair = getEffectiveHairColor(gameState);

  container.className = "header-avatar";
  container.style.setProperty("--hair-color", effectiveHair);

  container.innerHTML = `
    <div class="avatar-hair-bar" title="Cor do cabelo"></div>
    <div class="avatar-circle-inner">
      ${renderAvatarLayersHTML(gameState)}
    </div>
    <span class="life-stage-badge">${stage.label}</span>
  `;

  bindAvatarFallbackHandlers(container);
}

function renderAvatarEditorButton() {
  const container = document.getElementById("avatarEditorContainer");
  if (!container || !gameState) return;

  container.innerHTML = `
    <p class="muted" style="margin-top:0;">
      Personaliza olhos, pele, sobrancelhas, barba, cabelo, roupa e tatuagens num editor com setas.
    </p>
    <button type="button" class="primary-btn full-width" id="openGameEditAvatarBtn">
      ✏️ Editar Avatar
    </button>
  `;

  document.getElementById("openGameEditAvatarBtn")?.addEventListener("click", () => {
    openAppearanceModal("game");
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

  const careerJobEl = document.getElementById("careerJob");
  const careerSalaryEl = document.getElementById("careerSalary");
  const careerEduEl = document.getElementById("careerEducation");
  if (careerJobEl) careerJobEl.textContent = gameState.job;
  if (careerSalaryEl) careerSalaryEl.textContent = `${gameState.salary} €`;
  if (careerEduEl) careerEduEl.textContent = gameState.education;

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
  document.getElementById("setupPrevAvatarBtn")?.addEventListener("click", () => changeSetupAvatar(-1));
  document.getElementById("setupNextAvatarBtn")?.addEventListener("click", () => changeSetupAvatar(1));
  document.getElementById("setupEditAvatarBtn")?.addEventListener("click", () => openAppearanceModal("setup"));
  document.getElementById("playerSex")?.addEventListener("change", onSetupGenderChange);
  document.getElementById("playerCountrySelect")?.addEventListener("change", onCountryChange);
  document.getElementById("playerCitySelect")?.addEventListener("change", onCitySelectChange);

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
  document.getElementById("customModal")?.classList.add("hidden");

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
