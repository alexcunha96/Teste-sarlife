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

const PRESET_CONFIGS = {
  1: {
    label: "Estilo #1 — Clássico",
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
    label: "Estilo #2 — Moderno",
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
    label: "Estilo #3 — Urbano",
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
    label: "Estilo #4 — Elegante",
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
    tattoo: preset.tattoo,
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

function darkenOrLighten(hex, amount = -24) {
  const clean = (hex || "#888888").replace("#", "");
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (num & 255) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function renderEyesSVG(eyeColor, cy) {
  return `
    <g>
      <ellipse cx="42.5" cy="${cy}" rx="4.4" ry="3.2" fill="#ffffff" />
      <circle cx="42.5" cy="${cy}" r="2.4" fill="${eyeColor}" />
      <circle cx="42.5" cy="${cy}" r="1.15" fill="#0f172a" />
      <circle cx="43.4" cy="${cy - 0.9}" r="0.75" fill="#ffffff" />

      <ellipse cx="57.5" cy="${cy}" rx="4.4" ry="3.2" fill="#ffffff" />
      <circle cx="57.5" cy="${cy}" r="2.4" fill="${eyeColor}" />
      <circle cx="57.5" cy="${cy}" r="1.15" fill="#0f172a" />
      <circle cx="58.4" cy="${cy - 0.9}" r="0.75" fill="#ffffff" />
    </g>
  `;
}

function renderBrowsSVG(browStyle, hairColor, cy) {
  const strokeW = browStyle === "thick" ? 2.7 : browStyle === "soft" ? 1.5 : 2.1;
  if (browStyle === "straight") {
    return `
      <line x1="38" y1="${cy - 5.5}" x2="46.5" y2="${cy - 5.5}" stroke="${hairColor}" stroke-width="${strokeW}" stroke-linecap="round" />
      <line x1="53.5" y1="${cy - 5.5}" x2="62" y2="${cy - 5.5}" stroke="${hairColor}" stroke-width="${strokeW}" stroke-linecap="round" />
    `;
  }
  return `
    <path d="M38 ${cy - 5} Q42.5 ${cy - 8.2} 47 ${cy - 5.2}" fill="none" stroke="${hairColor}" stroke-width="${strokeW}" stroke-linecap="round" />
    <path d="M53 ${cy - 5.2} Q57.5 ${cy - 8.2} 62 ${cy - 5}" fill="none" stroke="${hairColor}" stroke-width="${strokeW}" stroke-linecap="round" />
  `;
}

function renderFacialHairSVG(facialHair, hairColor, age, cy) {
  if (!facialHair || facialHair === "none" || Number(age) < 14) {
    return "";
  }
  const shade = darkenOrLighten(hairColor, -14);
  if (facialHair === "stubble") {
    return `
      <g fill="${shade}" opacity="0.34">
        <circle cx="38" cy="${cy + 9}" r="0.8" />
        <circle cx="41" cy="${cy + 11}" r="0.8" />
        <circle cx="45" cy="${cy + 13}" r="0.8" />
        <circle cx="50" cy="${cy + 14}" r="0.8" />
        <circle cx="55" cy="${cy + 13}" r="0.8" />
        <circle cx="59" cy="${cy + 11}" r="0.8" />
        <circle cx="62" cy="${cy + 9}" r="0.8" />
      </g>
    `;
  }
  if (facialHair === "goatee") {
    return `
      <path d="M45 ${cy + 5.5} Q50 ${cy + 4} 55 ${cy + 5.5} Q50 ${cy + 7.5} 45 ${cy + 5.5} Z" fill="${shade}" opacity="0.85" />
      <path d="M46.5 ${cy + 11} Q50 ${cy + 17.5} 53.5 ${cy + 11} Q50 ${cy + 13} 46.5 ${cy + 11} Z" fill="${shade}" opacity="0.85" />
    `;
  }
  if (facialHair === "beard") {
    return `
      <path d="M34.5 ${cy + 2} C34.5 ${cy + 15}, 42 ${cy + 20.5}, 50 ${cy + 20.5} C58 ${cy + 20.5}, 65.5 ${cy + 15}, 65.5 ${cy + 2} C62.5 ${cy + 10}, 57 ${cy + 13}, 50 ${cy + 13} C43 ${cy + 13}, 37.5 ${cy + 10}, 34.5 ${cy + 2} Z" fill="${shade}" opacity="0.88" />
    `;
  }
  return "";
}

function renderHairSVG(hairStyle, hairColor, stageId) {
  const highlight = darkenOrLighten(hairColor, 26);
  const shadow = darkenOrLighten(hairColor, -24);

  if (stageId === "bebe") {
    return `
      <path d="M44.5 24 Q50 15 55.5 24 Q52.5 29 48 27 Z" fill="${hairColor}" />
      <path d="M47 22 Q50 17.5 53 22" fill="none" stroke="${highlight}" stroke-width="1.2" stroke-linecap="round" />
    `;
  }

  switch (hairStyle) {
    case "long":
      return `
        <path d="M25 46 C25 18, 75 18, 75 46 L78 86 L64 86 L62 49 C62 34, 38 34, 38 49 L36 86 L22 86 Z" fill="${shadow}" />
        <path d="M27 45 C27 20, 73 20, 73 45 L75 84 L65 84 L63 48 C63 34, 37 34, 37 48 L35 84 L25 84 Z" fill="${hairColor}" />
        <path d="M33 32 Q50 16 67 32" fill="none" stroke="${highlight}" stroke-width="2" stroke-linecap="round" opacity="0.7" />
      `;
    case "ponytail":
      return `
        <path d="M31 38 C31 19, 69 19, 69 38 C69 29, 31 29, 31 38 Z" fill="${hairColor}" />
        <path d="M66 29 C86 24, 89 50, 75 65 C74 49, 69 40, 63 36 Z" fill="${shadow}" />
        <path d="M65 28 C82 24, 85 47, 73 61 C72 47, 68 39, 62 35 Z" fill="${hairColor}" />
        <circle cx="65" cy="32" r="2.6" fill="#e11d48" />
      `;
    case "buzz":
      return `
        <path d="M33 38 C33 21, 67 21, 67 38 C60 27, 40 27, 33 38 Z" fill="${hairColor}" />
        <path d="M37 29 Q50 22 63 29" fill="none" stroke="${highlight}" stroke-width="1.6" stroke-linecap="round" opacity="0.6" />
      `;
    case "medium":
      return `
        <path d="M29 44 C29 19, 71 19, 71 44 L72 60 L63 60 L62 43 C62 31, 38 31, 38 43 L37 60 L28 60 Z" fill="${hairColor}" />
        <path d="M34 31 Q50 18 66 31" fill="none" stroke="${highlight}" stroke-width="1.8" stroke-linecap="round" opacity="0.65" />
      `;
    case "short":
    default:
      return `
        <path d="M31 39 C31 19, 69 19, 69 39 C62 28, 38 28, 31 39 Z" fill="${hairColor}" />
        <path d="M36 30 Q50 20 64 30" fill="none" stroke="${highlight}" stroke-width="1.8" stroke-linecap="round" opacity="0.65" />
      `;
  }
}

function renderOutfitSVG(outfit, outfitColor, skinTone, stageId) {
  const isChildOrBaby = stageId === "bebe" || stageId === "crianca";
  const topY = isChildOrBaby ? 67 : 63;
  const neckShade = darkenOrLighten(skinTone, -22);
  const shirtShade = darkenOrLighten(outfitColor, -22);

  let shirt = `
    <path d="M20 100 L25 ${topY} L39 ${topY - 3} Q50 ${topY + 9} 61 ${topY - 3} L75 ${topY} L80 100 Z" fill="${outfitColor}" />
    <path d="M25 ${topY} L22 100 L29 100 L31 ${topY + 4} Z" fill="${shirtShade}" opacity="0.45" />
    <path d="M75 ${topY} L78 100 L71 100 L69 ${topY + 4} Z" fill="${shirtShade}" opacity="0.45" />
  `;

  if (outfit === "smart") {
    shirt += `
      <polygon points="43.5,${topY - 3} 50,${topY + 9.5} 42.5,${topY + 13}" fill="#ffffff" />
      <polygon points="56.5,${topY - 3} 50,${topY + 9.5} 57.5,${topY + 13}" fill="#ffffff" />
      <polygon points="48.5,${topY + 8} 51.5,${topY + 8} 52.5,98 47.5,98" fill="#1e293b" />
    `;
  } else if (outfit === "sport") {
    shirt += `
      <line x1="29.5" y1="${topY + 3}" x2="27.5" y2="99" stroke="#ffffff" stroke-width="2.4" opacity="0.85" />
      <line x1="70.5" y1="${topY + 3}" x2="72.5" y2="99" stroke="#ffffff" stroke-width="2.4" opacity="0.85" />
    `;
  } else if (outfit === "hoodie") {
    shirt += `
      <path d="M35 ${topY - 2} Q50 ${topY + 12} 65 ${topY - 2}" fill="none" stroke="${shirtShade}" stroke-width="3.2" />
      <line x1="45" y1="${topY + 5}" x2="45" y2="83" stroke="#f8fafc" stroke-width="1.8" stroke-linecap="round" />
      <line x1="55" y1="${topY + 5}" x2="55" y2="83" stroke="#f8fafc" stroke-width="1.8" stroke-linecap="round" />
    `;
  }

  return `
    ${shirt}
    <rect x="44" y="53" width="12" height="12" rx="4" fill="${skinTone}" />
    <path d="M44 55 Q50 60 56 55 L56 59 Q50 63 44 59 Z" fill="${neckShade}" opacity="0.55" />
  `;
}

function renderTattooSVG(tattoo, age) {
  if (!tattoo || tattoo === "none" || Number(age) < 18) {
    return "";
  }

  if (tattoo === "sleeve") {
    return `
      <g stroke="#0f172a" stroke-width="2.1" fill="none" opacity="0.82">
        <path d="M26 72 Q32 76 26 81 Q32 86 26 92" />
        <path d="M74 72 Q68 76 74 81 Q68 86 74 92" />
      </g>
    `;
  }

  if (tattoo === "star") {
    return `
      <polygon points="29,76 30.8,80 35,80.5 32,83.4 32.8,87.5 29,85.4 25.2,87.5 26,83.4 23,80.5 27.2,80"
        fill="#0f172a" opacity="0.82" />
    `;
  }

  if (tattoo === "tribal") {
    return `
      <path d="M68 74 L75 80.5 L68 87 L71.5 80.5 Z" fill="#0f172a" opacity="0.82" />
    `;
  }

  return "";
}

function renderAgeDetailsSVG(stageId, cy) {
  if (stageId === "idoso") {
    return `
      <g stroke="#6b4f3f" stroke-width="1.35" fill="none" opacity="0.72" stroke-linecap="round">
        <path d="M36 ${cy - 4} Q39 ${cy - 6} 42 ${cy - 4}" />
        <path d="M58 ${cy - 4} Q61 ${cy - 6} 64 ${cy - 4}" />
        <path d="M36 ${cy + 9} Q38.5 ${cy + 12.5} 41 ${cy + 13.5}" />
        <path d="M64 ${cy + 9} Q61.5 ${cy + 12.5} 59 ${cy + 13.5}" />
      </g>
    `;
  }
  return "";
}

function renderAvatarSVGMarkup(person) {
  const stage = getLifeStage(person.age);
  const custom = person.avatarCustom || createDefaultAvatarCustom(person.sex, person.presetIndex);
  const hairColor = getEffectiveHairColor(person);
  const skinTone = custom.skinTone || "#f2c29b";
  const eyeColor = custom.eyeColor || "#2563eb";
  const browStyle = custom.browStyle || "arch";
  const facialHair = custom.facialHair || "none";
  const outfitColor = custom.outfitColor || "#3b82f6";
  const fullName = `${person.name || ""} ${person.surname || ""}`.trim() || "Avatar";

  const headRadiusY = stage.id === "bebe" ? 20 : 18.2;
  const headRadiusX = stage.id === "bebe" ? 19 : 16.5;
  const headCenterY = stage.id === "bebe" ? 44 : 42;
  const cheekShade = darkenOrLighten(skinTone, -18);
  const noseShade = darkenOrLighten(skinTone, -34);

  return `
    <svg class="svg-avatar-layer" viewBox="0 0 100 100" role="img" aria-label="${fullName}">
      ${renderOutfitSVG(custom.outfit, outfitColor, skinTone, stage.id)}
      ${renderTattooSVG(custom.tattoo, person.age)}
      ${renderHairSVG(custom.hairStyle, hairColor, stage.id)}

      <ellipse cx="${50 - headRadiusX}" cy="${headCenterY + 1}" rx="3.2" ry="5.2" fill="${skinTone}" />
      <ellipse cx="${50 + headRadiusX}" cy="${headCenterY + 1}" rx="3.2" ry="5.2" fill="${skinTone}" />

      <ellipse cx="50" cy="${headCenterY}" rx="${headRadiusX}" ry="${headRadiusY}" fill="${skinTone}" />

      <ellipse cx="39.5" cy="${headCenterY + 4}" rx="3.5" ry="2.1" fill="${cheekShade}" opacity="0.28" />
      <ellipse cx="60.5" cy="${headCenterY + 4}" rx="3.5" ry="2.1" fill="${cheekShade}" opacity="0.28" />

      ${renderBrowsSVG(browStyle, hairColor, headCenterY)}
      ${renderEyesSVG(eyeColor, headCenterY)}

      <path d="M50 ${headCenterY - 1} L48.6 ${headCenterY + 4.5} Q50 ${headCenterY + 5.8} 51.8 ${headCenterY + 4.8}"
        fill="none" stroke="${noseShade}" stroke-width="1.5" stroke-linecap="round" />

      ${renderFacialHairSVG(facialHair, hairColor, person.age, headCenterY)}

      <path d="M45 ${headCenterY + 9.5} Q50 ${headCenterY + 13} 55 ${headCenterY + 9.5}"
        stroke="#9b4d3f" stroke-width="2.1" fill="none" stroke-linecap="round" />

      ${renderAgeDetailsSVG(stage.id, headCenterY)}
    </svg>
  `;
}

/* --- Modal Editar Avatar (estilo Appearance com setas laterais) --- */
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
    tattoo: modalState.draft.tattoo,
    showLegacyImg: Boolean(modalState.draft.showLegacyImg)
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
      ? `<small class="muted">A tatuagem só aparece no avatar a partir dos 18 anos (idade atual: ${modalState.draft.age}).</small>`
      : "";

  modal.innerHTML = `
    <div class="appearance-modal-card" role="dialog" aria-modal="true" aria-label="Editar Avatar">
      <div class="appearance-header">
        <h2>✨ Editar Avatar</h2>
        <p>Seleciona a aparência e usa as setas para alterar</p>
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
        <div class="appearance-portrait-box">
          ${renderAvatarSVGMarkup(draftPerson)}
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

        <button type="button" class="secondary-btn" id="modalToggleLegacyBtn" style="padding:6px 10px;font-size:0.8rem;">
          PNG Antigo: ${modalState.draft.showLegacyImg ? "ON" : "OFF"}
        </button>
      </div>

      <button type="button" class="save-btn full-width" id="saveAppearanceBtn">Guardar</button>
      <button type="button" class="secondary-btn full-width" id="cancelAppearanceBtn">Cancelar</button>
    </div>
  `;

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

  document.getElementById("modalToggleLegacyBtn")?.addEventListener("click", () => {
    modalState.draft.showLegacyImg = !modalState.draft.showLegacyImg;
    renderAppearanceModal();
  });

  document.getElementById("saveAppearanceBtn")?.addEventListener("click", saveAppearanceModal);
  document.getElementById("cancelAppearanceBtn")?.addEventListener("click", closeAppearanceModal);
}

/* --- Ecrã Inicial (#setupScreen) --- */
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

  const previewPerson = {
    name: document.getElementById("playerName")?.value.trim() || "Avatar",
    surname: "",
    sex: setupState.sex,
    age: 18,
    avatarCustom: setupState.avatarCustom
  };
  svgHolder.innerHTML = renderAvatarSVGMarkup(previewPerson);

  const navRow = document.querySelector(".avatar-nav-row");
  if (navRow && !document.getElementById("setupEditAvatarBtn")) {
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.id = "setupEditAvatarBtn";
    editBtn.className = "secondary-btn";
    editBtn.textContent = "Editar Avatar";
    editBtn.style.marginTop = "10px";
    editBtn.addEventListener("click", () => openAppearanceModal("setup"));
    navRow.parentElement.appendChild(editBtn);
  }
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
    avatarCustom: { ...setupState.avatarCustom },
    family: [...setupState.family],
    events: [`Nasceu em ${city}, ${country} com 0 anos.`]
  });

  saveGame();
  openGameScreen();
}

/* --- Ecrã Principal do Jogo (#gameScreen) --- */
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

function renderAvatarEditorButton() {
  const container = document.getElementById("avatarEditorContainer");
  if (!container || !gameState) return;

  const custom = gameState.avatarCustom;
  container.className = custom.showLegacyImg ? "show-legacy-mode" : "";

  container.innerHTML = `
    <p class="muted" style="margin-top:0;">
      Personaliza olhos, pele, sobrancelhas, barba, cabelo, roupa e tatuagens num editor visual com setas.
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
