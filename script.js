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

function shadeHexColor(hex, percent) {
  const clean = String(hex || "#888888").replace("#", "");
  if (clean.length !== 6) return hex || "#888888";
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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

function drawHairStrands(ctx, style, hairColor, stage) {
  const darkStrand = shadeHexColor(hairColor, -34);
  const lightStrand = shadeHexColor(hairColor, 28);

  ctx.save();
  ctx.lineJoin = "miter";
  ctx.lineCap = "round";

  if (stage === "bebe") {
    ctx.fillStyle = hairColor;
    ctx.strokeStyle = darkStrand;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-10, -82);
    ctx.lineTo(-4, -104);
    ctx.lineTo(2, -85);
    ctx.lineTo(9, -102);
    ctx.lineTo(12, -82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  const spikes = style === "buzz" ? 9 : 13;
  const startX =
