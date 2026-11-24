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

/* --- Motor 3D com Three.js --- */
const threeViewers = new Map();

function getEffectiveHairColor(person) {
  const stage = getLifeStage(person.age);
  const chosen = person.avatarCustom?.hairColor || "#3b2618";
  if (stage.id === "idoso") {
    return "#d8dee9";
  }
  return chosen;
}

function createAvatar3DGroup(person) {
  const THREE = window.THREE;
  const stage = getLifeStage(person.age);
  const custom = person.avatarCustom || createDefaultAvatarCustom(person.sex, person.presetIndex);
  const hairColor = getEffectiveHairColor(person);
  const skinTone = custom.skinTone || "#f2c29b";
  const eyeColor = custom.eyeColor || "#2563eb";
  const outfitColor = custom.outfitColor || "#3b82f6";

  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinTone,
    roughness: 0.55,
    metalness: 0.05
  });
  const outfitMat = new THREE.MeshStandardMaterial({
    color: outfitColor,
    roughness: 0.65,
    metalness: 0.08
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.5,
    metalness: 0.1
  });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.2
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: eyeColor,
    roughness: 0.25
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: "#111827",
    roughness: 0.5
  });

  // Escala por fase da vida
  const stageScale =
    stage.id === "bebe"
      ? 0.78
      : stage.id === "crianca"
      ? 0.88
      : stage.id === "adolescente"
      ? 0.95
      : 1.0;

  // Cabeça 3D
  const headGeo = new THREE.SphereGeometry(0.68, 32, 32);
  headGeo.scale(0.92, 1.06, 0.95);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.set(0, 0.62, 0);
  root.add(headMesh);

  // Orelhas
  const earGeo = new THREE.SphereGeometry(0.14, 16, 16);
  earGeo.scale(0.55, 1.0, 0.85);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.63, 0.6, 0);
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.63, 0.6, 0);
  root.add(leftEar, rightEar);

  // Olhos 3D (esclera + íris)
  const scleraGeo = new THREE.SphereGeometry(0.11, 16, 16);
  scleraGeo.scale(1.15, 0.85, 0.6);
  const irisGeo = new THREE.SphereGeometry(0.062, 14, 14);
  irisGeo.scale(1, 1, 0.65);

  const leftEyeWhite = new THREE.Mesh(scleraGeo, eyeWhiteMat);
  leftEyeWhite.position.set(-0.23, 0.66, 0.58);
  const rightEyeWhite = new THREE.Mesh(scleraGeo, eyeWhiteMat);
  rightEyeWhite.position.set(0.23, 0.66, 0.58);

  const leftIris = new THREE.Mesh(irisGeo, irisMat);
  leftIris.position.set(-0.23, 0.66, 0.62);
  const rightIris = new THREE.Mesh(irisGeo, irisMat);
  rightIris.position.set(0.23, 0.66, 0.62);
  root.add(leftEyeWhite, rightEyeWhite, leftIris, rightIris);

  // Sobrancelhas 3D
  const browGeo = new THREE.BoxGeometry(0.24, custom.browStyle === "thick" ? 0.08 : 0.05, 0.08);
  const leftBrow = new THREE.Mesh(browGeo, hairMat);
  leftBrow.position.set(-0.23, 0.83, 0.58);
  leftBrow.rotation.z = custom.browStyle === "arch" ? 0.12 : 0;

  const rightBrow = new THREE.Mesh(browGeo, hairMat);
  rightBrow.position.set(0.23, 0.83, 0.58);
  rightBrow.rotation.z = custom.browStyle === "arch" ? -0.12 : 0;
  root.add(leftBrow, rightBrow);

  // Nariz 3D
  const noseGeo = new THREE.ConeGeometry(0.09, 0.2, 12);
  const noseMesh = new THREE.Mesh(noseGeo, skinMat);
  noseMesh.position.set(0, 0.57, 0.67);
  noseMesh.rotation.x = Math.PI * 0.42;
  root.add(noseMesh);

  // Boca 3D
  const mouthGeo = new THREE.TorusGeometry(0.14, 0.032, 10, 20, Math.PI);
  const mouthMat = new THREE.MeshStandardMaterial({ color: "#9b4d3f", roughness: 0.4 });
  const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
  mouthMesh.position.set(0, 0.37, 0.6);
  mouthMesh.rotation.x = Math.PI;
  root.add(mouthMesh);

  // Barba / pelo facial (a partir dos 14 anos)
  if (Number(person.age) >= 14 && custom.facialHair && custom.facialHair !== "none") {
    if (custom.facialHair === "beard") {
      const beardGeo = new THREE.SphereGeometry(0.67, 24, 24, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.52);
      beardGeo.scale(0.93, 1.0, 0.96);
      const beardMesh = new THREE.Mesh(beardGeo, hairMat);
      beardMesh.position.set(0, 0.58, 0.03);
      root.add(beardMesh);
    } else if (custom.facialHair === "goatee") {
      const goateeGeo = new THREE.ConeGeometry(0.16, 0.25, 14);
      const goateeMesh = new THREE.Mesh(goateeGeo, hairMat);
      goateeMesh.position.set(0, 0.23, 0.6);
      goateeMesh.rotation.x = Math.PI;
      root.add(goateeMesh);
    } else if (custom.facialHair === "stubble") {
      const stubbleGeo = new THREE.SphereGeometry(0.66, 20, 20, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45);
      const stubbleMat = new THREE.MeshStandardMaterial({
        color: hairColor,
        transparent: true,
        opacity: 0.28,
        roughness: 0.8
      });
      const stubbleMesh = new THREE.Mesh(stubbleGeo, stubbleMat);
      stubbleMesh.position.set(0, 0.59, 0.02);
      root.add(stubbleMesh);
    }
  }

  // Cabelo 3D
  if (stage.id === "bebe") {
    const tuftGeo = new THREE.ConeGeometry(0.12, 0.22, 12);
    const tuft = new THREE.Mesh(tuftGeo, hairMat);
    tuft.position.set(0, 1.38, 0.04);
    root.add(tuft);
  } else if (custom.hairStyle === "long") {
    const capGeo = new THREE.SphereGeometry(0.72, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const capMesh = new THREE.Mesh(capGeo, hairMat);
    capMesh.position.set(0, 0.66, -0.02);

    const backGeo = new THREE.CylinderGeometry(0.56, 0.64, 1.35, 20);
    const backMesh = new THREE.Mesh(backGeo, hairMat);
    backMesh.position.set(0, 0.12, -0.22);
    root.add(capMesh, backMesh);
  } else if (custom.hairStyle === "ponytail") {
    const capGeo = new THREE.SphereGeometry(0.71, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const capMesh = new THREE.Mesh(capGeo, hairMat);
    capMesh.position.set(0, 0.66, 0);

    const tailGeo = new THREE.ConeGeometry(0.24, 0.85, 16);
    const tailMesh = new THREE.Mesh(tailGeo, hairMat);
    tailMesh.position.set(0, 0.68, -0.78);
    tailMesh.rotation.x = -Math.PI * 0.35;
    root.add(capMesh, tailMesh);
  } else if (custom.hairStyle === "buzz") {
    const buzzGeo = new THREE.SphereGeometry(0.695, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const buzzMesh = new THREE.Mesh(buzzGeo, hairMat);
    buzzMesh.position.set(0, 0.64, 0);
    root.add(buzzMesh);
  } else if (custom.hairStyle === "medium") {
    const medGeo = new THREE.SphereGeometry(0.73, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const medMesh = new THREE.Mesh(medGeo, hairMat);
    medMesh.position.set(0, 0.65, -0.02);
    root.add(medMesh);
  } else {
    const shortGeo = new THREE.SphereGeometry(0.71, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.56);
    const shortMesh = new THREE.Mesh(shortGeo, hairMat);
    shortMesh.position.set(0, 0.66, 0.02);
    root.add(shortMesh);
  }

  // Pescoço e Tronco / Roupa 3D
  const neckGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.32, 16);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.set(0, -0.08, 0);
  root.add(neckMesh);

  const torsoGeo = new THREE.CylinderGeometry(0.56, 0.66, 1.15, 24);
  const torsoMesh = new THREE.Mesh(torsoGeo, outfitMat);
  torsoMesh.position.set(0, -0.76, 0);
  root.add(torsoMesh);

  // Braços 3D + Tatuagem (a partir dos 18 anos)
  const armGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.92, 16);
  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.position.set(-0.78, -0.68, 0);
  leftArm.rotation.z = -0.14;

  const rightArm = new THREE.Mesh(armGeo, skinMat);
  rightArm.position.set(0.78, -0.68, 0);
  rightArm.rotation.z = 0.14;

  // Manga curta da roupa
  const sleeveGeo = new THREE.CylinderGeometry(0.18, 0.17, 0.36, 16);
  const leftSleeve = new THREE.Mesh(sleeveGeo, outfitMat);
  leftSleeve.position.set(-0.72, -0.38, 0);
  leftSleeve.rotation.z = -0.14;

  const rightSleeve = new THREE.Mesh(sleeveGeo, outfitMat);
  rightSleeve.position.set(0.72, -0.38, 0);
  rightSleeve.rotation.z = 0.14;

  root.add(leftArm, rightArm, leftSleeve, rightSleeve);

  if (Number(person.age) >= 18 && custom.tattoo && custom.tattoo !== "none") {
    const tatGeo =
      custom.tattoo === "sleeve"
        ? new THREE.CylinderGeometry(0.156, 0.142, 0.42, 16, 1, true)
        : new THREE.SphereGeometry(0.08, 12, 12);
    const tatMat = new THREE.MeshStandardMaterial({
      color: "#0f172a",
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const tatMesh = new THREE.Mesh(tatGeo, tatMat);
    tatMesh.position.set(0.81, -0.76, 0.04);
    root.add(tatMesh);
  }

  root.scale.setScalar(stageScale);
  root.position.set(0, -0.1, 0);
  return root;
}

function mount3DAvatar(container, person, options = {}) {
  const THREE = window.THREE;
  if (!container || !THREE) return;

  const size = options.size || Math.max(container.clientWidth, container.clientHeight, 128);
  let entry = threeViewers.get(container);

  if (!entry) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.15, 3.95);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size, false);

    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    keyLight.position.set(2.2, 3.2, 3.5);
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
    rimLight.position.set(-2.5, 1.5, -2.0);

    scene.add(ambient, keyLight, rimLight);

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    entry = { scene, camera, renderer, avatarGroup: null, animId: null };
    threeViewers.set(container, entry);

    const animate = () => {
      entry.animId = requestAnimationFrame(animate);
      if (entry.avatarGroup) {
        entry.avatarGroup.rotation.y = Math.sin(Date.now() * 0.0012) * 0.24;
      }
      entry.renderer.render(entry.scene, entry.camera);
    };
    animate();
  }

  if (entry.avatarGroup) {
    entry.scene.remove(entry.avatarGroup);
  }
  entry.renderer.setSize(size, size, false);
  entry.avatarGroup = createAvatar3DGroup(person);
  entry.scene.add(entry.avatarGroup);
  entry.renderer.render(entry.scene, entry.camera);
}

/* --- Estado e Funções do Jogo --- */
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

/* --- Modal Editar Avatar 3D --- */
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
    const mount = modal.querySelector(".three-avatar-mount");
    if (mount && threeViewers.has(mount)) {
      cancelAnimationFrame(threeViewers.get(mount).animId);
      threeViewers.delete(mount);
    }
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
    pushEvent("Atualizou o avatar 3D.");
    saveGame();
    renderGameUI();
  }

  closeAppearanceModal();
  showToast("Avatar 3D guardado!");
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
      ? `<small class="muted">A tatuagem 3D fica visível a partir dos 18 anos (idade atual: ${modalState.draft.age}).</small>`
      : "";

  modal.innerHTML = `
    <div class="appearance-modal-card" role="dialog" aria-modal="true" aria-label="Editar Avatar 3D">
      <div class="appearance-header">
        <h2>✨ Editar Avatar 3D</h2>
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
        <div class="appearance-portrait-box">
          <div class="three-avatar-mount" id="modalThreeMount"></div>
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

  const mountEl = document.getElementById("modalThreeMount");
  if (mountEl) {
    mount3DAvatar(mountEl, draftPerson, { size: 184 });
  }

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

  let mountHolder = imgEl.parentElement.querySelector(".three-avatar-mount");
  if (!mountHolder) {
    mountHolder = document.createElement("div");
    mountHolder.className = "three-avatar-mount";
    imgEl.parentElement.appendChild(mountHolder);
  }

  const previewPerson = {
    name: document.getElementById("playerName")?.value.trim() || "Avatar",
    surname: "",
    sex: setupState.sex,
    age: 18,
    avatarCustom: setupState.avatarCustom
  };
  mount3DAvatar(mountHolder, previewPerson, { size: 132 });

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

  let innerCircle = container.querySelector(".avatar-circle-inner");
  let badge = container.querySelector(".life-stage-badge");
  let hairBar = container.querySelector(".avatar-hair-bar");

  if (!hairBar || !innerCircle || !badge) {
    container.innerHTML = `
      <div class="avatar-hair-bar" title="Cor do cabelo"></div>
      <div class="avatar-circle-inner">
        <img class="legacy-avatar-img" src="${legacySrc}" alt="Avatar PNG antigo">
        <div class="three-avatar-mount" id="headerThreeMount"></div>
      </div>
      <span class="life-stage-badge">${stage.label}</span>
    `;
    innerCircle = container.querySelector(".avatar-circle-inner");
    badge = container.querySelector(".life-stage-badge");
  } else {
    const imgEl = innerCircle.querySelector("img.legacy-avatar-img");
    if (imgEl) imgEl.src = legacySrc;
    badge.textContent = stage.label;
  }

  const mountEl = innerCircle.querySelector(".three-avatar-mount");
  if (mountEl) {
    mount3DAvatar(mountEl, gameState, { size: 74 });
  }
}

function renderAvatarEditorButton() {
  const container = document.getElementById("avatarEditorContainer");
  if (!container || !gameState) return;

  const custom = gameState.avatarCustom;
  container.className = custom.showLegacyImg ? "show-legacy-mode" : "";

  container.innerHTML = `
    <p class="muted" style="margin-top:0;">
      Personaliza olhos, pele, sobrancelhas, barba, cabelo, roupa e tatuagens num editor 3D com setas.
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
