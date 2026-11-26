"use strict";

/* =========================================
   STARLIFE · AVATAR — DiceBear, pré-visualização e editor de aparência
========================================= */

function pickFromPalette(list, index) {
  return list[index % list.length];
}

function createDefaultAvatarCustom(sex = "Masculino", presetIndex = 1) {
  const preset = Math.max(1, Number(presetIndex) || 1);
  const idx = preset - 1;
  const P = AVATAR_PRESET_PALETTE;
  const isFemale = sex === "Feminino";

  return {
    enabled: true,
    mouthStyle: pickFromPalette(P.mouths, idx),
    presetIndex: preset,
    skinTone: pickFromPalette(P.skins, idx),
    eyeColor: "default",
    browStyle: "default",
    facialHair: "none",
    facialHairColor: "#3b2618",
    hairStyle: pickFromPalette(isFemale ? P.femaleHair : P.maleHair, idx),
    hairColor: pickFromPalette(P.hairColors, idx),
    outfit: "casual",
    outfitColor: pickFromPalette(isFemale ? P.femaleOutfit : P.maleOutfit, idx),
    tattoo: "none",
    accessoryColor: "#262e33"
  };
}

let setupAvatarCustom = createDefaultAvatarCustom("Masculino", 1);

let appearanceModalState = {
  target: "setup",
  category: "facialHair",
  draft: null
};

function normalizeHexWithHash(colorValue, fallbackHex) {
  const cleaned = String(colorValue || fallbackHex).replace(/^#/, "").trim();
  return /^[0-9a-fA-F]{6}$/.test(cleaned) ? `#${cleaned.toLowerCase()}` : fallbackHex;
}

function normalizeHexNoHash(colorValue, fallbackHex) {
  return normalizeHexWithHash(colorValue, fallbackHex).slice(1);
}

function getCategoryColorConfig(draft, category) {
  if (!draft) return null;

  const configs = {
    facialHair: { prop: "facialHairColor", label: "Cor da Barba", fallback: "#3b2618" },
    hair: { prop: "hairColor", label: "Cor do Cabelo", fallback: "#3b2618" },
    outfit: { prop: "outfitColor", label: "Cor da Roupa", fallback: "#3b82f6" },
    tattoo: { prop: "accessoryColor", label: "Cor do Acessório", fallback: "#262e33" }
  };

  const cfg = configs[category];
  if (!cfg) return null;

  return {
    ...cfg,
    value: normalizeHexWithHash(draft[cfg.prop], cfg.fallback)
  };
}

function buildDiceBearUrl(person, previewInEditor = false) {
  const sex = person?.sex || "Masculino";
  const custom = person?.avatarCustom || createDefaultAvatarCustom(sex, currentAvatarIndex);
  const preset = Number(custom.presetIndex) || 1;
  const ageNum = Number(person?.age) || 0;
  // Seed estável: depende só do género e do preset, nunca do id do jogador.
  // Assim o avatar escolhido no ecrã inicial é igual ao que aparece durante o jogo.
  const baseSeed = `starlife-${sex}-preset-${preset}`;

  const params = new URLSearchParams();
  params.set("seed", baseSeed);
  params.set("skinColor", normalizeHexNoHash(custom.skinTone, "#f2c29b"));
  params.set("hairColor", normalizeHexNoHash(custom.hairColor, "#3b2618"));
  params.set("facialHairColor", normalizeHexNoHash(custom.facialHairColor || custom.hairColor, "#3b2618"));
  params.set("clothesColor", normalizeHexNoHash(custom.outfitColor, "#3b82f6"));
  params.set("accessoriesColor", normalizeHexNoHash(custom.accessoryColor, "#262e33"));

  const validEyes = ["default", "happy", "wink", "squint"];
  const eyeVal = validEyes.includes(custom.eyeColor) ? custom.eyeColor : "default";
  params.set("eyes", eyeVal);

  const validBrows = ["default", "raisedExcited", "frownNatural", "sadConcerned"];
  const browVal = validBrows.includes(custom.browStyle) ? custom.browStyle : "default";
  params.set("eyebrows", browVal);

  const mouthVal = VALID_MOUTHS.includes(custom.mouthStyle) ? custom.mouthStyle : "default";
  params.set("mouth", mouthVal);

  const hairMap = {
    short: "shortFlat",
    medium: "shortWaved",
    long: "straight01",
    ponytail: "bun",
    buzz: "theCaesar"
  };
  if (hairMap[custom.hairStyle]) {
    params.set("top", hairMap[custom.hairStyle]);
  }

  const showBeard = Boolean(custom.facialHair && custom.facialHair !== "none") && (previewInEditor || ageNum >= 18);
  const beardMap = {
    stubble: "beardLight",
    goatee: "moustacheFancy",
    beard: "beardMedium"
  };
  if (showBeard && beardMap[custom.facialHair]) {
    params.set("facialHair", beardMap[custom.facialHair]);
    params.set("facialHairProbability", "100");
  } else {
    params.set("facialHairProbability", "0");
  }

  const outfitMap = {
    casual: "graphicShirt",
    smart: "blazerAndShirt",
    sport: "hoodie",
    hoodie: "hoodie"
  };
  if (outfitMap[custom.outfit]) {
    // A DiceBear 9.x usa "clothing"; "clothes" fica por compatibilidade com versões antigas.
    params.set("clothing", outfitMap[custom.outfit]);
    params.set("clothes", outfitMap[custom.outfit]);
  }

  const showAcc = Boolean(custom.tattoo && custom.tattoo !== "none") && (previewInEditor || ageNum >= 13);
  const accMap = {
    star: "round",
    sleeve: "prescription02",
    tribal: "sunglasses"
  };
  if (showAcc && accMap[custom.tattoo]) {
    params.set("accessories", accMap[custom.tattoo]);
    params.set("accessoriesProbability", "100");
  } else {
    params.set("accessoriesProbability", "0");
  }

  return `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}`;
}

// Avatar de reserva (sem internet): círculo com a inicial do nome.
function avatarFallbackDataUri(person) {
  const initial = String(person?.name || "?").trim().charAt(0).toUpperCase() || "?";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#2b446e'/><text x='50' y='65' font-size='46' text-anchor='middle' fill='#f8fafc' font-family='sans-serif'>${escapeHTML(initial)}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27");
}

function renderAvatarImgHTML(person, previewInEditor = false, altText = "Avatar") {
  const url = buildDiceBearUrl(person, previewInEditor);
  const fallback = avatarFallbackDataUri(person);
  return `<img src="${escapeHTML(url)}" alt="${escapeHTML(altText)}" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${fallback}'">`;
}

function refreshAppearancePreviewOnly() {
  const draft = appearanceModalState.draft;
  const box = document.querySelector(".appearance-portrait-box");
  if (!draft || !box) return;
  box.innerHTML = renderAvatarImgHTML(
    {
      name: appearanceModalState.target === "game" ? game.player.name : ($("playerName")?.value.trim() || "Avatar"),
      sex: draft.sex || "Masculino",
      age: 18,
      avatarCustom: draft
    },
    true,
    "Pré-visualização do Avatar"
  );
}

function updateNameHint() {
  const nameHint = $("nameHint");
  if (!nameHint) return;
  const sex = $("playerSex")?.value || "Masculino";
  const suggestedName = sex === "Feminino" ? randomFrom(sampleFemaleNames) : randomFrom(sampleMaleNames);
  nameHint.textContent = `(Ex: ${suggestedName})`;
}

function updateSetupAvatarUI() {
  const sexEl = $("playerSex");
  const sex = sexEl ? sexEl.value : "Masculino";

  if (currentAvatarIndex < 1) currentAvatarIndex = 1;
  setupAvatarCustom.presetIndex = currentAvatarIndex;

  const stageEl = $("setupAvatarStage");
  const indexEl = $("setupAvatarIndex");
  if (stageEl) {
    stageEl.innerHTML = renderAvatarImgHTML(
      { name: $("playerName")?.value.trim() || "Avatar", sex, age: 0, avatarCustom: setupAvatarCustom },
      false,
      "Avatar"
    );
  }
  if (indexEl) indexEl.textContent = `#${currentAvatarIndex}`;
}

window.changeSetupAvatar = function(dir) {
  currentAvatarIndex = Math.max(1, currentAvatarIndex + dir);
  setupAvatarCustom = createDefaultAvatarCustom($("playerSex")?.value || "Masculino", currentAvatarIndex);
  updateSetupAvatarUI();
};

window.onSetupGenderChange = function() {
  const sex = $("playerSex")?.value || "Masculino";
  currentAvatarIndex = 1;
  setupAvatarCustom = {
    ...createDefaultAvatarCustom(sex, currentAvatarIndex),
    facialHair: setupAvatarCustom.facialHair || "none",
    facialHairColor: setupAvatarCustom.facialHairColor || "#3b2618",
    tattoo: setupAvatarCustom.tattoo || "none",
    accessoryColor: setupAvatarCustom.accessoryColor || "#262e33",
    eyeColor: setupAvatarCustom.eyeColor || "default",
    browStyle: setupAvatarCustom.browStyle || "default"
  };
  updateSetupAvatarUI();
  updateNameHint();
};

function getDraftOptionLabel(draft, category) {
  const options = APPEARANCE_OPTIONS[category] || [];
  const map = {
    eyes: draft.eyeColor,
    skin: draft.skinTone,
    brows: draft.browStyle,
    facialHair: draft.facialHair,
    hair: draft.hairStyle,
    outfit: draft.outfit,
    tattoo: draft.tattoo
  };
  const found = options.find(o => o.id === map[category]);
  return found ? found.label : "";
}

function cycleAppearanceDraft(delta) {
  const draft = appearanceModalState.draft;
  if (!draft) return;
  const cat = appearanceModalState.category;
  const options = APPEARANCE_OPTIONS[cat] || [];
  if (!options.length) return;

  const map = {
    eyes: draft.eyeColor,
    skin: draft.skinTone,
    brows: draft.browStyle,
    facialHair: draft.facialHair,
    hair: draft.hairStyle,
    outfit: draft.outfit,
    tattoo: draft.tattoo
  };

  let idx = options.findIndex(o => o.id === map[cat]);
  if (idx === -1) idx = 0;
  const nextIdx = (((idx + delta) % options.length) + options.length) % options.length;
  const nextVal = options[nextIdx].id;

  if (cat === "eyes") draft.eyeColor = nextVal;
  if (cat === "skin") draft.skinTone = nextVal;
  if (cat === "brows") draft.browStyle = nextVal;
  if (cat === "facialHair") draft.facialHair = nextVal;
  if (cat === "hair") draft.hairStyle = nextVal;
  if (cat === "outfit") draft.outfit = nextVal;
  if (cat === "tattoo") draft.tattoo = nextVal;

  const labelEl = document.querySelector(".appearance-option-label");
  if (labelEl) labelEl.textContent = getDraftOptionLabel(draft, cat);
  refreshAppearancePreviewOnly();
}

function saveAppearanceDraft() {
  const draft = appearanceModalState.draft;
  if (!draft) return;

  const cleaned = {
    enabled: true,
    mouthStyle: draft.mouthStyle || "default",
    // Mantém o preset do próprio avatar (antes usava o índice global e mudava a boca ao guardar).
    presetIndex: Number(draft.presetIndex) || currentAvatarIndex,
    skinTone: draft.skinTone,
    eyeColor: draft.eyeColor,
    browStyle: draft.browStyle,
    facialHair: draft.facialHair,
    facialHairColor: normalizeHexWithHash(draft.facialHairColor, "#3b2618"),
    hairStyle: draft.hairStyle,
    hairColor: normalizeHexWithHash(draft.hairColor, "#3b2618"),
    outfit: draft.outfit,
    outfitColor: normalizeHexWithHash(draft.outfitColor, "#3b82f6"),
    tattoo: draft.tattoo,
    accessoryColor: normalizeHexWithHash(draft.accessoryColor, "#262e33")
  };

  if (appearanceModalState.target === "setup") {
    setupAvatarCustom = cleaned;
    updateSetupAvatarUI();
  } else if (game && game.player) {
    game.player.avatarCustom = cleaned;
    addEvent("Atualizaste a aparência do teu avatar. ✏️", "positive");
    saveGame();
    renderGame();
  }

  closeCustomModal();
  showToast("Aparência guardada!");
}

function renderAppearanceModal() {
  const modal = $("customModal");
  const draft = appearanceModalState.draft;
  if (!modal || !draft) return;

  const previewImgHtml = renderAvatarImgHTML(
    {
      name: appearanceModalState.target === "game" ? game.player.name : ($("playerName")?.value.trim() || "Avatar"),
      sex: draft.sex || "Masculino",
      age: 18,
      avatarCustom: draft
    },
    true,
    "Pré-visualização do Avatar"
  );

  const label = getDraftOptionLabel(draft, appearanceModalState.category);
  const colorCfg = getCategoryColorConfig(draft, appearanceModalState.category);

  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Editar Avatar">
      <h3>✨ Editar Avatar</h3>
      <p class="muted" style="margin-bottom: 8px;">Seleciona a categoria e usa as setas para alterar.</p>

      <div class="appearance-tabs">
        ${APPEARANCE_CATEGORIES.map(c => `
          <button type="button" class="app-cat-btn ${appearanceModalState.category === c.key ? "active" : ""}" data-app-cat="${c.key}">${escapeHTML(c.label)}</button>
        `).join("")}
      </div>

      <div class="appearance-stage-row">
        <button type="button" class="avatar-arrow-btn" id="appPrevBtn">◀</button>
        <div class="appearance-portrait-box">${previewImgHtml}</div>
        <button type="button" class="avatar-arrow-btn" id="appNextBtn">▶</button>
      </div>

      <div class="appearance-option-label">${escapeHTML(label)}</div>

      ${colorCfg ? `
        <div class="appearance-extra-controls" style="justify-content: center;">
          <label style="display:flex;align-items:center;gap:8px;font-size:0.88rem;">
            ${escapeHTML(colorCfg.label)}:
            <input type="color" id="modalCategoryColorInput" value="${escapeHTML(colorCfg.value)}" style="width:34px;height:28px;padding:1px;">
          </label>
        </div>
      ` : ""}

      <div class="modal-buttons">
        <button type="button" class="primary-btn full-width" id="saveAppearanceBtn">Guardar</button>
        <button type="button" class="secondary-btn full-width" onclick="closeCustomModal()">Cancelar</button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");

  modal.querySelectorAll("[data-app-cat]").forEach(btn => {
    btn.addEventListener("click", () => {
      appearanceModalState.category = btn.dataset.appCat;
      renderAppearanceModal();
    });
  });

  $("appPrevBtn")?.addEventListener("click", () => cycleAppearanceDraft(-1));
  $("appNextBtn")?.addEventListener("click", () => cycleAppearanceDraft(1));

  if (colorCfg) {
    const colorInput = $("modalCategoryColorInput");
    const applyColorChange = e => {
      appearanceModalState.draft[colorCfg.prop] = e.target.value;
      refreshAppearancePreviewOnly();
    };
    colorInput?.addEventListener("input", applyColorChange);
    colorInput?.addEventListener("change", applyColorChange);
  }

  $("saveAppearanceBtn")?.addEventListener("click", saveAppearanceDraft);
}

window.openAppearanceModal = function(target = "game") {
  appearanceModalState.target = target;
  appearanceModalState.category = "facialHair";

  if (target === "game" && game && game.player) {
    const base = game.player.avatarCustom || createDefaultAvatarCustom(game.player.sex, currentAvatarIndex);
    appearanceModalState.draft = { ...base, sex: game.player.sex };
  } else {
    const sex = $("playerSex")?.value || "Masculino";
    const base = setupAvatarCustom || createDefaultAvatarCustom(sex, currentAvatarIndex);
    appearanceModalState.draft = { ...base, sex };
  }

  renderAppearanceModal();
};
