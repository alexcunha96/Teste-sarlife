const SAVE_KEY = "starlife_teste_save_v2";
const DICEBEAR_API_BASE = "https://api.dicebear.com/9.x";

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
    diceStyle: "avataaars",
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
    diceStyle: "avataaars",
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
    diceStyle: "avataaars",
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
    diceStyle: "avataaars",
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
    { id: "#2563eb", label: "Olhos Azuis", diceEye: "happy" },
    { id: "#15803d", label: "Olhos Verdes", diceEye: "default" },
    { id: "#5c3a21", label: "Olhos Castanhos", diceEye: "surprised" },
    { id: "#475569", label: "Olhos Cinzentos", diceEye: "wink" },
    { id: "#92400e", label: "Olhos Âmbar / Mel", diceEye: "hearts" }
  ],
  skin: [
    { id: "#fbe3cf", label: "Pele Clara", diceSkin: "ffdbb4" },
    { id: "#f2c29b", label: "Pele Média Clara", diceSkin: "edb98a" },
    { id: "#d89b6c", label: "Pele Bronzeada", diceSkin: "d08b5b" },
    { id: "#b06d3b", label: "Pele Morena", diceSkin: "ae5d29" },
    { id: "#7c4722", label: "Pele Escura", diceSkin: "614335" }
  ],
  brows: [
    { id: "arch", label: "Sobrancelhas Arqueadas", diceBrow: "raisedExcitedNatural" },
    { id: "straight", label: "Sobrancelhas Retas", diceBrow: "flatNatural" },
    { id: "thick", label: "Sobrancelhas Densas", diceBrow: "defaultNatural" },
    { id: "soft", label: "Sobrancelhas Suaves", diceBrow: "upDownNatural" }
  ],
  facialHair: [
    { id: "none", label: "Sem Barba", diceBeard: "" },
    { id: "stubble", label: "Barba por Fazer", diceBeard: "beardLight" },
    { id: "goatee", label: "Cavanhaque / Bigode", diceBeard: "beardMajestic" },
    { id: "beard", label: "Barba Cheia", diceBeard: "beardMedium" }
  ],
  hair: [
    { id: "short", label: "Cabelo Curto", diceTop: "shortFlat" },
    { id: "medium", label: "Cabelo Médio", diceTop: "sidesBird" },
    { id: "long", label: "Cabelo Comprido", diceTop: "longButNotTooLong" },
    { id: "ponytail", label: "Rabo de Cavalo", diceTop: "bun" },
    { id: "buzz", label: "Rapado / Curto Alto", diceTop: "shaggy" }
  ],
  outfit: [
    { id: "casual", label: "T-Shirt Casual", diceCloth: "graphicShirt" },
    { id: "smart", label: "Camisa Social", diceCloth: "blazerAndShirt" },
    { id: "sport", label: "Fato de Treino", diceCloth: "shirtCrewNeck" },
    { id: "hoodie", label: "Sweat com Capuz", diceCloth: "hoodie" }
  ],
  tattoo: [
    { id: "none", label: "Sem Tatuagem", diceAcc: "" },
    { id: "star", label: "Estrela no Braço", diceAcc: "round" },
    { id: "sleeve", label: "Manga no Braço", diceAcc: "prescription02" },
    { id: "tribal", label: "Símbolo Tribal", diceAcc: "wayfarers" }
  ]
};

const DICE_STYLES = [
  { id: "avataaars", label: "Avataaars" },
  { id: "big-ears", label: "Big Ears" },
  { id: "big-smile", label: "Big Smile" }
];

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

function drawRoundedBox(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

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
    diceStyle: preset.diceStyle || "avataaars",
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

function cleanHex(hex, fallback = "3b2618") {
  const cleaned = String(hex || fallback).replace("#", "").trim();
  return /^[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned.toLowerCase() : fallback;
}

function shadeHexColor(hex, percent) {
  const clean = cleanHex(hex, "888888");
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function buildDiceBearUrl(person) {
  const custom = person.avatarCustom || createDefaultAvatarCustom(person.sex, person.presetIndex);
  const style = custom.diceStyle || "avataaars";
  const hairHex = cleanHex(getEffectiveHairColor(person), "3b2618");
  const clothHex = cleanHex(custom.outfitColor, "3b82f6");

  const skinOpt =
    APPEARANCE_OPTIONS.skin.find((o) => o.id === custom.skinTone) || APPEARANCE_OPTIONS.skin[1];
  const eyeOpt =
    APPEARANCE_OPTIONS.eyes.find((o) => o.id === custom.eyeColor) || APPEARANCE_OPTIONS.eyes[0];
  const browOpt =
    APPEARANCE_OPTIONS.brows.find((o) => o.id === custom.browStyle) || APPEARANCE_OPTIONS.brows[0];
  const beardOpt =
    APPEARANCE_OPTIONS.facialHair.find((o) => o.id === custom.facialHair) ||
    APPEARANCE_OPTIONS.facialHair[0];
  const hairOpt =
    APPEARANCE_OPTIONS.hair.find((o) => o.id === custom.hairStyle) || APPEARANCE_OPTIONS.hair[0];
  const clothOpt =
    APPEARANCE_OPTIONS.outfit.find((o) => o.id === custom.outfit) || APPEARANCE_OPTIONS.outfit[0];
  const accOpt =
    APPEARANCE_OPTIONS.tattoo.find((o) => o.id === custom.tattoo) || APPEARANCE_OPTIONS.tattoo[0];

  const seed = encodeURIComponent(
    `${person.name || "star"}_${person.sex || "M"}_${custom.hairStyle}_${custom.facialHair}_${custom.outfit}`
  );
  const params = new URLSearchParams();
  params.set("seed", seed);
  params.set("radius", "50");

  if (style === "avataaars") {
    params.set("skinColor", skinOpt.diceSkin);
    params.set("hairColor", hairHex);
    params.set("clothingColor", clothHex);
    params.set("eyes", eyeOpt.diceEye);
    params.set("eyebrows", browOpt.diceBrow);
    params.set("top", hairOpt.diceTop);
    params.set("clothing", clothOpt.diceCloth);
    params.set("mouth", "smile");

    if (Number(person.age) >= 14 && beardOpt.diceBeard) {
      params.set("facialHair", beardOpt.diceBeard);
      params.set("facialHairColor", hairHex);
      params.set("facialHairProbability", "100");
    } else {
      params.set("facialHairProbability", "0");
    }

    if (Number(person.age) >= 18 && accOpt.diceAcc) {
      params.set("accessories", accOpt.diceAcc);
      params.set("accessoriesProbability", "100");
    } else {
      params.set("accessoriesProbability", "0");
    }
  } else {
    params.set("hairColor", hairHex);
  }

  return `${DICEBEAR_API_BASE}/${style}/svg?${params.toString()}`;
}

function drawNaturalHair(ctx, style, hairColor, stage) {
  const darkHair = shadeHexColor(hairColor, -28);
  const lightHair = shadeHexColor(hairColor, 24);

  const grad = ctx.createLinearGradient(-60, -96, 60, 15);
  grad.addColorStop(0, lightHair);
  grad.addColorStop(0.5, hairColor);
  grad.addColorStop(1, darkHair);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (stage === "bebe") {
    ctx.fillStyle = hairColor;
    ctx.strokeStyle = darkHair;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -82);
    ctx.quadraticCurveTo(-14, -98, -2, -102);
    ctx.quadraticCurveTo(4, -90, 6, -101);
    ctx.quadraticCurveTo(15, -94, 8, -82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.fillStyle = grad;
  ctx.strokeStyle = darkHair;
  ctx.lineWidth = 2.2;

  if (style === "long") {
    ctx.beginPath();
    ctx.moveTo(-61, -36);
    ctx.bezierCurveTo(-66, -88, -24, -96, 0, -94);
    ctx.bezierCurveTo(28, -96, 66, -86, 61, -36);
    ctx.lineTo(65, 58);
    ctx.quadraticCurveTo(50, 64, 42, 46);
    ctx.lineTo(40, -24);
    ctx.lineTo(-40, -24);
    ctx.lineTo(-42, 46);
    ctx.quadraticCurveTo(-50, 64, -65, 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (style === "ponytail") {
    ctx.beginPath();
    ctx.moveTo(-59, -38);
    ctx.bezierCurveTo(-62, -86, -20, -94, 2, -90);
    ctx.bezierCurveTo(32, -92, 58, -76, 59, -38);
    ctx.quadraticCurveTo(34, -56, 0, -56);
    ctx.quadraticCurveTo(-34, -56, -59, -38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(42, -74);
    ctx.bezierCurveTo(78, -82, 92, -46, 76, -14);
    ctx.bezierCurveTo(68, -28, 62, -46, 44, -56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (style === "buzz") {
    ctx.beginPath();
    ctx.moveTo(-58, -40);
    ctx.bezierCurveTo(-58, -78, -24, -84, 0, -83);
    ctx.bezierCurveTo(24, -84, 58, -78, 58, -40);
    ctx.quadraticCurveTo(28, -54, 0, -54);
    ctx.quadraticCurveTo(-28, -54, -58, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (style === "medium") {
    ctx.beginPath();
    ctx.moveTo(-61, -34);
    ctx.bezierCurveTo(-65, -88, -22, -96, 2, -93);
    ctx.bezierCurveTo(32, -95, 65, -84, 61, -34);
    ctx.quadraticCurveTo(56, 2, 44, 6);
    ctx.lineTo(40, -48);
    ctx.quadraticCurveTo(0, -58, -40, -48);
    ctx.lineTo(-44, 6);
    ctx.quadraticCurveTo(-56, 2, -61, -34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-59, -38);
    ctx.bezierCurveTo(-62, -86, -20, -94, 4, -91);
    ctx.bezierCurveTo(32, -92, 60, -78, 59, -38);
    ctx.quadraticCurveTo(36, -54, 10, -48);
    ctx.quadraticCurveTo(-18, -56, -59, -38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  const strokes = style === "buzz" ? 8 : 13;
  for (let i = 0; i < strokes; i++) {
    const t = strokes === 1 ? 0.5 : i / (strokes - 1);
    const sx = -46 + t * 92;
    const sy = style === "buzz" ? -72 : -82 + Math.sin(t * Math.PI) * -6;
    const ex = sx + (t - 0.5) * 14;
    const ey = sy + (style === "buzz" ? 12 : style === "long" ? 32 : 22);

    ctx.strokeStyle = i % 2 === 0 ? lightHair : darkHair;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = style === "buzz" ? 1.5 : 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) * 0.5 + 4, (sy + ey) * 0.5, ex, ey);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function generateCanvasFallbackDataUrl(person) {
  const custom = person.avatarCustom || createDefaultAvatarCustom(person.sex, person.presetIndex);
  const stage = getLifeStage(person.age).id;
  const hairColor = getEffectiveHairColor(person);
  const key = `full2d|${stage}|${custom.skinTone}|${custom.eyeColor}|${custom.browStyle}|${custom.facialHair}|${custom.hairStyle}|${hairColor}|${custom.outfit}|${custom.outfitColor}|${custom.tattoo}`;

  if (generatedLayerCache.has(key)) {
    return generatedLayerCache.get(key);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const scale = stage === "bebe" ? 0.85 : stage === "crianca" ? 0.92 : 1.0;

  ctx.save();
  ctx.translate(160, 174);
  ctx.scale(scale, scale);

  const skinDark = shadeHexColor(custom.skinTone, -22);
  const skinLight = shadeHexColor(custom.skinTone, 14);
  const clothDark = shadeHexColor(custom.outfitColor, -26);
  const clothLight = shadeHexColor(custom.outfitColor, 18);

  const torsoGrad = ctx.createLinearGradient(-95, 52, 95, 145);
  torsoGrad.addColorStop(0, clothLight);
  torsoGrad.addColorStop(0.5, custom.outfitColor);
  torsoGrad.addColorStop(1, clothDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-98, 145);
  ctx.quadraticCurveTo(-84, 62, -25, 54);
  ctx.quadraticCurveTo(0, 68, 25, 54);
  ctx.quadraticCurveTo(84, 62, 98, 145);
  ctx.closePath();
  ctx.fill();

  const neckGrad = ctx.createLinearGradient(0, 28, 0, 78);
  neckGrad.addColorStop(0, skinDark);
  neckGrad.addColorStop(0.35, custom.skinTone);
  neckGrad.addColorStop(1, skinDark);
  ctx.fillStyle = neckGrad;
  drawRoundedBox(ctx, -21, 28, 42, 50, 12);
  ctx.fill();

  [-57, 57].forEach((ex, idx) => {
    const dir = idx === 0 ? -1 : 1;
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.ellipse(ex, -14, 10, 16, dir * 0.1, 0, Math.PI * 2);
    ctx.fill();
  });

  const faceGrad = ctx.createRadialGradient(-18, -42, 10, 0, -16, 76);
  faceGrad.addColorStop(0, skinLight);
  faceGrad.addColorStop(0.65, custom.skinTone);
  faceGrad.addColorStop(1, skinDark);
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(0, -16, 57, 68, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = shadeHexColor(custom.skinTone, -32);
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(1, -22);
  ctx.lineTo(-4, 2);
  ctx.quadraticCurveTo(0, 7, 7, 4);
  ctx.stroke();

  ctx.strokeStyle = shadeHexColor(custom.skinTone, -45);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-14, 22);
  ctx.quadraticCurveTo(0, 27, 14, 22);
  ctx.stroke();

  [-22, 22].forEach((x) => {
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(x, -23, 12.2, 7.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = custom.eyeColor;
    ctx.beginPath();
    ctx.arc(x, -23, 6.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#090d16";
    ctx.beginPath();
    ctx.arc(x, -23, 2.7, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = hairColor;
  ctx.lineWidth = custom.browStyle === "thick" ? 5 : 3.6;
  [-1, 1].forEach((dir) => {
    ctx.beginPath();
    ctx.moveTo(dir * 10, -36);
    ctx.quadraticCurveTo(dir * 22, custom.browStyle === "arch" ? -45 : -37, dir * 35, -35);
    ctx.stroke();
  });

  if (Number(person.age) >= 14 && custom.facialHair !== "none") {
    ctx.fillStyle = hairColor;
    ctx.globalAlpha = 0.85;
    if (custom.facialHair === "beard") {
      ctx.beginPath();
      ctx.moveTo(-51, -8);
      ctx.quadraticCurveTo(-54, 46, 0, 52);
      ctx.quadraticCurveTo(54, 46, 51, -8);
      ctx.lineTo(41, -6);
      ctx.quadraticCurveTo(38, 36, 0, 41);
      ctx.quadraticCurveTo(-38, 36, -41, -6);
      ctx.closePath();
      ctx.fill();
      drawRoundedBox(ctx, -18, 10, 36, 6, 3);
      ctx.fill();
    } else if (custom.facialHair === "goatee") {
      ctx.beginPath();
      ctx.ellipse(0, 36, 11, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawNaturalHair(ctx, custom.hairStyle, hairColor, stage);

  ctx.restore();

  const url = canvas.toDataURL("image/png");
  generatedLayerCache.set(key, url);
  return url;
}

function renderAvatarLayersHTML(person) {
  const diceUrl = buildDiceBearUrl(person);
  const fallbackUrl = generateCanvasFallbackDataUrl(person);
  return `
    <div class="avatar-stack">
      <img
        class="avatar-layer-img"
        style="z-index:2;"
        src="${diceUrl}"
        data-fallback="${fallbackUrl}"
        alt="Avatar"
        onerror="if(this.dataset.fallback && this.src !== this.dataset.fallback){this.src=this.dataset.fallback;}"
      >
    </div>
  `;
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
  } else {
    modalState.draft = {
      ...setupState.avatarCustom,
      age: 18,
      sex: setupState.sex,
      name: "Personagem"
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
    diceStyle: modalState.draft.diceStyle || "avataaars",
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

      <div class="appearance-extra-controls">
        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;">
          Estilo:
          <select id="modalDiceStyleSelect" style="padding:4px 8px;font-size:0.82rem;">
            ${DICE_STYLES.map(
              (s) => `<option value="${s.id}" ${modalState.draft.diceStyle === s.id ? "selected" : ""}>${s.label}</option>`
            ).join("")}
          </select>
        </label>

        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;">
          Cabelo:
          <input type="color" id="modalHairColorInput" value="${modalState.draft.hairColor}" style="width:34px;height:28px;padding:1px;">
        </label>

        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;">
          Roupa:
          <input type="color" id="modalOutfitColorInput" value="${modalState.draft.outfitColor}" style="width:34px;height:28px;padding:1px;">
        </label>
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

  document.getElementById("appPrevBtn")?.addEventListener("click
