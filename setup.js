"use strict";

/* =========================================
   STARLIFE · ECRÃ INICIAL — países, cidades, família inicial e começar jogo
========================================= */

function initSetupGeography() {
  const countrySelect = $("playerCountrySelect");
  if (!countrySelect) return;

  countrySelect.innerHTML = "";
  Object.keys(worldCountriesDatabase).forEach(country => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });

  const optOther = document.createElement("option");
  optOther.value = "Outro";
  optOther.textContent = "Outro País...";
  countrySelect.appendChild(optOther);

  countrySelect.value = "Portugal";
  updateCityOptions("Portugal");
}

window.onCountryChange = function() {
  const countrySelect = $("playerCountrySelect");
  const customGroup = $("customCountryGroup");
  const isOther = countrySelect.value === "Outro";
  if (customGroup) customGroup.style.display = isOther ? "block" : "none";

  if (!isOther) {
    updateCityOptions(countrySelect.value);
  } else {
    const citySelect = $("playerCitySelect");
    if (citySelect) citySelect.innerHTML = `<option value="Outro">Outra Cidade...</option>`;
    const customCityGroup = $("customCityGroup");
    if (customCityGroup) customCityGroup.style.display = "block";
  }
};

function updateCityOptions(countryName) {
  const citySelect = $("playerCitySelect");
  const customCityGroup = $("customCityGroup");
  if (!citySelect) return;

  citySelect.innerHTML = "";
  const data = worldCountriesDatabase[countryName];
  if (data && data.cities) {
    data.cities.forEach(city => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }

  const optOther = document.createElement("option");
  optOther.value = "Outro";
  optOther.textContent = "Outra Cidade...";
  citySelect.appendChild(optOther);

  if (customCityGroup) customCityGroup.style.display = "none";
  citySelect.value = citySelect.options[0]?.value || "";
}

window.onCitySelectChange = function() {
  const citySelect = $("playerCitySelect");
  const customCityGroup = $("customCityGroup");
  if (citySelect && customCityGroup) {
    customCityGroup.style.display = citySelect.value === "Outro" ? "block" : "none";
  }
};

function startGame() {
  const name = $("playerName").value.trim();
  const surname = $("playerSurname").value.trim();
  if (!name || !surname) { showToast("Preenche o nome e apelido."); return; }

  const countrySel = $("playerCountrySelect").value;
  const country = countrySel === "Outro" ? ($("playerCountryCustom").value.trim() || "Portugal") : countrySel;

  const citySel = $("playerCitySelect").value;
  const city = citySel === "Outro" ? ($("playerCityCustom").value.trim() || "Lisboa") : citySel;

  const sex = $("playerSex").value;
  const avatarCustom = {
    ...(setupAvatarCustom || createDefaultAvatarCustom(sex, currentAvatarIndex)),
    enabled: true
  };

  const player = {
    id: createId("player"), name, surname,
    sex,
    country,
    city,
    avatarCustom,
    age: 0, alive: true,
    health: 100, happiness: 80,
    education: "Sem escolaridade", educationLevel: 0,
    job: "", salary: 0, bank: 1000, debt: 0, personalDebt: 0, expenses: 0,
    licenses: { carB: false, bikeAM: false, bikeA1: false, bikeA2: false, bikeA: false },
    bankAccount: null, activeRental: null,
    illness: null,
    maxAge: randomNumber(78, 108)
  };

  game = {
    player, family: [], socialPeople: [], events: [], financeHistory: [],
    properties: [], marketListings: [], businesses: [], vehicles: [],
    year: new Date().getFullYear(), started: true
  };

  initializeEducation(player);
  generateYearlyMarket();

  // Familiares adicionados manualmente herdam o apelido do jogador se ficou em branco.
  const manualFamily = initialFamily.map(f => createFamilyMember({ ...f, surname: f.surname || surname }));
  const hasParent = manualFamily.some(f => f.relation === "Mãe" || f.relation === "Pai");

  if (hasParent) {
    game.family = manualFamily;
  } else {
    // Sem pais indicados (mesmo que haja outros familiares), criam-se os pais por defeito.
    const mother = createFamilyMember({ name: generateName("Feminino"), surname, relation: "Mãe", age: 30, sex: "Feminino" });
    const father = createFamilyMember({ name: generateName("Masculino"), surname, relation: "Pai", age: 33, sex: "Masculino" });
    game.family = [mother, father, ...manualFamily];
  }

  saveGame();
  showGame();
  renderGame();
}

function showSetup() {
  $("gameScreen").classList.add("hidden");
  $("setupScreen").classList.remove("hidden");
  updateContinuePanel();
}

function updateSetupFamilyUI() {
  const container = $("setupFamilyList");
  if (!container) return;
  container.innerHTML = "";
  initialFamily.forEach((f, idx) => {
    container.innerHTML += `<div class="person-card"><strong>${escapeHTML(f.name)}</strong> <small>${escapeHTML(f.relation)}${f.maritalStatus ? " · " + escapeHTML(f.maritalStatus) : ""}</small> <button type="button" class="small-btn danger-btn" onclick="initialFamily.splice(${idx},1);updateSetupFamilyUI()">X</button></div>`;
  });
}
