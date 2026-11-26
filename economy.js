"use strict";

/* =========================================
   STARLIFE · ECONOMIA — banco, imobiliário, veículos, negócios e finanças
========================================= */

function getActiveCountryBanks() {
  const country = game ? game.player.country : "Portugal";
  const data = worldCountriesDatabase[country];
  return data ? data.banks : worldCountriesDatabase["Portugal"].banks;
}

function openBankAccount(bankId) {
  if (game.player.age < 18) { showToast("Precisas de ter 18 anos para abrir conta."); return; }
  const banks = getActiveCountryBanks();
  const bank = banks.find(b => b.id === bankId);
  if (!bank) return;
  game.player.bankAccount = { bankId: bank.id, bankName: bank.name, interestRate: bank.interestRate };
  addEvent(`Abriste conta bancária no ${bank.name}! 🏦`, "positive");
  saveGame();
  renderGame();
}

function renderBankSection() {
  const container = $("bankSectionContainer");
  if (!container) return;
  const player = game.player;
  const banks = getActiveCountryBanks();

  if (!player.bankAccount) {
    let html = `<div class="panel"><h3>🏦 Abrir Conta Bancária (${escapeHTML(player.country)})</h3><p class="muted">Escolhe um banco local para gerir dinheiro e crédito habitação${player.age < 18 ? " (a partir dos 18 anos)" : ""}:</p><div class="button-list">`;
    banks.forEach(b => {
      html += `
        <div class="person-card" style="flex-direction: column; align-items: flex-start; gap: 6px;">
          <strong>${escapeHTML(b.name)}</strong>
          <small>${escapeHTML(b.desc)} (Taxa Crédito: ${(b.interestRate * 100).toFixed(1)}%)</small>
          <button class="primary-btn full-width" ${player.age < 18 ? "disabled" : ""} onclick="openBankAccount('${b.id}')">Abrir Conta</button>
        </div>
      `;
    });
    html += `</div></div>`;
    container.innerHTML = html;
  } else {
    container.innerHTML = `
      <div class="panel">
        <h3>🏦 O Teu Banco</h3>
        <div class="info-row"><span>Instituição</span><strong>${escapeHTML(player.bankAccount.bankName)}</strong></div>
        <div class="info-row"><span>Taxa de Juro Crédito</span><strong>${(player.bankAccount.interestRate * 100).toFixed(1)}%</strong></div>
      </div>
    `;
  }
}

function generateYearlyMarket() {
  if (!game) return;
  const listings = [];
  const count = randomNumber(3, 4);
  for (let i = 0; i < count; i++) {
    const tpl = randomFrom(propertyTemplates);
    const variance = 0.9 + Math.random() * 0.25;
    listings.push({
      id: createId("house"),
      title: tpl.title,
      type: tpl.type,
      address: `${randomFrom(streetNames)}, n.º ${randomNumber(1, 240)}, ${game.player.city}`,
      buyPrice: Math.round((tpl.buyPrice * variance) / 500) * 500,
      rentMonthly: Math.round((tpl.rentMonthly * variance) / 10) * 10,
      happiness: tpl.happiness
    });
  }
  game.marketListings = listings;
}

function openPropertyModal(listingId) {
  const house = game.marketListings.find(h => h.id === listingId);
  if (!house) return;
  const modal = $("customModal");
  modal.innerHTML = `
    <div class="modal-card">
      <div style="text-align: center; margin-bottom: 10px;">${getHouseSVG(house.type)}</div>
      <h3>${escapeHTML(house.title)}</h3>
      <p class="muted" style="margin-bottom: 10px;">📍 ${escapeHTML(house.address)}</p>
      <div class="info-row"><span>Preço de Compra</span><strong>${money(house.buyPrice)}</strong></div>
      <div class="info-row"><span>Renda Mensal</span><strong>${money(house.rentMonthly)}/mês</strong></div>
      
      <div style="margin-top: 14px;">
        <h4>Arrendar Contrato</h4>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <button class="secondary-btn" style="flex:1" onclick="rentProperty('${house.id}', 12)">12 Meses</button>
          <button class="secondary-btn" style="flex:1" onclick="rentProperty('${house.id}', 24)">24 Meses</button>
          <button class="secondary-btn" style="flex:1" onclick="rentProperty('${house.id}', 36)">36 Meses</button>
        </div>
      </div>

      <div style="margin-top: 14px;">
        <h4>Comprar Imóvel</h4>
        <div class="modal-buttons" style="margin-top: 6px;">
          <button class="primary-btn full-width" onclick="buyPropertyTransfer('${house.id}')">💳 Transferência (${money(house.buyPrice)})</button>
          <button class="secondary-btn full-width" onclick="buyPropertyMortgage('${house.id}')">🏦 Crédito Habitação</button>
        </div>
      </div>

      <button class="danger-btn full-width" style="margin-top: 14px;" onclick="closeCustomModal()">Fechar</button>
    </div>
  `;
  modal.classList.remove("hidden");
}

function rentProperty(listingId, months) {
  const house = game.marketListings.find(h => h.id === listingId);
  if (!house) return;
  if (game.player.age < 18) { showToast("Precisas de ter 18 anos."); return; }
  if (game.player.bank < house.rentMonthly * 2) { showToast("Precisas de 2 meses de caução."); return; }

  game.player.bank -= house.rentMonthly * 2;
  game.player.activeRental = { title: house.title, address: house.address, rentMonthly: house.rentMonthly, monthsRemaining: months, happiness: house.happiness };
  addEvent(`Assinaste contrato de arrendamento (${months} meses) em ${house.address}! 🔑`, "positive");
  closeCustomModal();
  saveGame();
  renderGame();
}

function buyPropertyTransfer(listingId) {
  const house = game.marketListings.find(h => h.id === listingId);
  if (!house) return;
  if (game.player.age < 18) { showToast("Precisas de ter 18 anos."); return; }
  if (!game.player.bankAccount) { showToast("Abre primeiro uma conta bancária!"); return; }
  if (game.player.bank < house.buyPrice) { showToast("Saldo insuficiente."); return; }

  game.player.bank -= house.buyPrice;
  const isFirst = game.properties.length === 0;
  game.properties.push({
    id: createId("prop"), title: house.title, type: house.type, address: house.address,
    value: house.buyPrice, mortgageRemaining: 0, annualPayment: 0,
    status: isFirst ? "primary" : "rented_out", rentalIncomeAnnual: house.rentMonthly * 12, happiness: house.happiness
  });
  game.marketListings = game.marketListings.filter(h => h.id !== listingId);
  addEvent(`Compraste "${house.title}" a pronto! 🏡`, "positive");
  closeCustomModal();
  saveGame();
  renderGame();
}

function buyPropertyMortgage(listingId) {
  const house = game.marketListings.find(h => h.id === listingId);
  if (!house) return;
  if (!game.player.bankAccount) { showToast("Abre primeiro uma conta bancária!"); return; }
  if (game.player.age < 18) { showToast("Precisas de ter 18 anos."); return; }

  const downPayment = Math.round(house.buyPrice * 0.15);
  if (game.player.bank < downPayment) { showToast(`Precisas de ${money(downPayment)} de entrada (15%).`); return; }

  const loanAmount = house.buyPrice - downPayment;
  const annualPayment = Math.round((loanAmount / 25) * (1 + game.player.bankAccount.interestRate));

  game.player.bank -= downPayment;
  game.player.debt += loanAmount;
  const isFirst = game.properties.length === 0;

  game.properties.push({
    id: createId("prop"), title: house.title, type: house.type, address: house.address,
    value: house.buyPrice, mortgageRemaining: loanAmount, annualPayment,
    status: isFirst ? "primary" : "rented_out", rentalIncomeAnnual: house.rentMonthly * 12, happiness: house.happiness
  });
  game.marketListings = game.marketListings.filter(h => h.id !== listingId);
  addEvent(`Crédito Habitação aprovado para "${house.title}"! 🏦🏡`, "positive");
  closeCustomModal();
  saveGame();
  renderGame();
}

function renderHousingSection() {
  const container = $("housingSectionContainer");
  if (!container) return;
  const player = game.player;

  let html = `<div class="panel"><h3>🏡 Loja de Imobiliário</h3>`;
  if (player.activeRental) {
    html += `<div class="person-card" style="flex-direction: column; align-items: flex-start; margin-bottom: 10px; border-left: 4px solid var(--accent-color);"><strong>Arrendado: ${escapeHTML(player.activeRental.title)}</strong><small>📍 ${escapeHTML(player.activeRental.address)}</small><small>Renda: ${money(player.activeRental.rentMonthly)}/mês (${player.activeRental.monthsRemaining} meses restantes)</small></div>`;
  }
  html += `<h4 style="margin-top: 8px;">Imóveis Disponíveis (Clica para ver e comprar)</h4><div class="button-list">`;
  game.marketListings.forEach(h => {
    html += `
      <div class="person-card house-card" onclick="openPropertyModal('${h.id}')">
        <div style="width: 65px; flex-shrink: 0;">${getHouseSVG(h.type)}</div>
        <div style="flex: 1; margin-left: 10px;"><strong>${escapeHTML(h.title)}</strong><small style="display:block;">Compra: ${money(h.buyPrice)} | Renda: ${money(h.rentMonthly)}/mês</small></div>
      </div>
    `;
  });
  html += `</div></div>`;
  container.innerHTML = html;
}

function processHousingYear() {
  const player = game.player;
  if (player.activeRental) {
    player.bank -= player.activeRental.rentMonthly * 12;
    player.activeRental.monthsRemaining -= 12;
    player.happiness = clamp(player.happiness + 2);
    if (player.activeRental.monthsRemaining <= 0) {
      addEvent(`O contrato de arrendamento de "${player.activeRental.title}" terminou.`, "neutral");
      player.activeRental = null;
    }
  }
  game.properties.forEach(p => {
    if (p.mortgageRemaining > 0) {
      player.bank -= p.annualPayment;
      p.mortgageRemaining = Math.max(0, p.mortgageRemaining - p.annualPayment);
      player.debt = Math.max(0, player.debt - p.annualPayment);
    }
    if (p.status === "rented_out") {
      player.bank += p.rentalIncomeAnnual;
      addFinanceEvent(`Recebeste ${money(p.rentalIncomeAnnual)} de rendas.`);
    } else if (p.status === "primary") {
      player.happiness = clamp(player.happiness + 3);
    }
  });
}

function togglePropertyStatus(propId) {
  const prop = game.properties.find(p => p.id === propId);
  if (!prop) return;
  if (prop.status === "primary") {
    prop.status = "rented_out";
    addEvent(`Colocaste "${prop.title}" a arrendar.`, "positive");
  } else {
    game.properties.forEach(p => { if (p.status === "primary") p.status = "rented_out"; });
    prop.status = "primary";
    addEvent(`Definiste "${prop.title}" como tua moradia principal.`, "positive");
  }
  saveGame();
  renderGame();
}

function sellProperty(propId) {
  const idx = game.properties.findIndex(p => p.id === propId);
  if (idx === -1) return;
  const prop = game.properties[idx];
  const mortgage = prop.mortgageRemaining || 0;
  const net = prop.value - mortgage;

  const msg = mortgage > 0
    ? `Vender "${prop.title}" por ${money(prop.value)}? O crédito em dívida (${money(mortgage)}) é pago com a venda e recebes ${money(net)}.`
    : `Tens a certeza de que queres vender "${prop.title}" por ${money(prop.value)}?`;
  if (!confirm(msg)) return;

  // O crédito habitação é liquidado com o valor da venda (antes ficava dinheiro grátis).
  game.player.bank += net;
  if (mortgage > 0) {
    game.player.debt = Math.max(0, game.player.debt - mortgage);
  }
  game.properties.splice(idx, 1);
  addEvent(`Vendeste o imóvel "${prop.title}" e recebeste ${money(net)}.`, "positive");
  saveGame();
  renderGame();
}

function sellVehicle(vehId) {
  const idx = game.vehicles.findIndex(v => v.id === vehId);
  if (idx === -1) return;
  const veh = game.vehicles[idx];
  const sellPrice = Math.round(veh.value * 0.75);
  if (!confirm(`Queres vender "${veh.name}" por ${money(sellPrice)}?`)) return;

  game.player.bank += sellPrice;
  game.vehicles.splice(idx, 1);
  addEvent(`Vendeste o veículo "${veh.name}" por ${money(sellPrice)}.`, "positive");
  saveGame();
  renderGame();
}

function renderMyAssets() {
  const container = $("myAssetsContainer");
  if (!container) return;
  
  let html = `<div class="panel"><h3>🏡 Os Teus Imóveis & Bens</h3>`;
  if (game.properties.length === 0 && game.vehicles.length === 0) {
    html += `<p class="muted">Ainda não tens imóveis nem veículos comprados. Visita a Loja!</p>`;
  }

  game.properties.forEach(p => {
    const statusLbl = p.status === "primary" ? "🏠 Moradia Principal" : `💰 A Arrendar (+${money(p.rentalIncomeAnnual)}/ano)`;
    html += `
      <div class="person-card" style="flex-direction: column; align-items: flex-start; margin-bottom: 8px;">
        <div style="display:flex; align-items:center; gap:10px; width:100%;">
          <div style="width:55px;">${getHouseSVG(p.type)}</div>
          <div style="flex:1;"><strong>${escapeHTML(p.title)}</strong><small style="display:block;">${escapeHTML(p.address)}</small><small style="color: var(--success-color);">${statusLbl}</small>${p.mortgageRemaining > 0 ? `<small style="display:block; color: var(--danger-color);">Crédito em dívida: ${money(p.mortgageRemaining)}</small>` : ""}</div>
        </div>
        <div style="display: flex; gap: 6px; width: 100%; margin-top: 6px;">
          <button class="small-btn" style="flex: 1;" onclick="togglePropertyStatus('${p.id}')">${p.status === "primary" ? "Arrendar" : "Tornar Principal"}</button>
          <button class="small-btn danger-btn" style="flex: 1;" onclick="sellProperty('${p.id}')">Vender (${money(p.value)})</button>
        </div>
      </div>
    `;
  });

  if (game.vehicles.length > 0) {
    html += `<h4 style="margin-top: 15px;">Veículos na Garagem</h4>`;
    game.vehicles.forEach(v => {
      html += `
        <div class="person-card" style="margin-bottom: 6px;">
          <div><strong>${escapeHTML(v.name)}</strong><small style="display:block;">Valor: ${money(v.value)} · Custo anual: ${money(v.annualCost)}</small></div>
          <button class="small-btn danger-btn" onclick="sellVehicle('${v.id}')">Vender</button>
        </div>
      `;
    });
  }

  html += `</div>`;
  container.innerHTML = html;
}

function takeLicense(licenseKey) {
  const player = game.player;
  const rule = licenseRules[licenseKey];
  if (!rule) return;

  if (player.age < rule.minAge) {
    showToast(`Precisas de ter pelo menos ${rule.minAge} anos.`);
    return;
  }
  if (player.bank < rule.cost) {
    showToast(`Sem saldo suficiente (${money(rule.cost)}).`);
    return;
  }

  player.bank -= rule.cost;
  player.licenses[licenseKey] = true;
  addEvent(`Obtiveste a ${rule.name}! 🚗🏍️`, "positive");
  saveGame();
  renderGame();
}

function buyVehicle(type, idx) {
  const player = game.player;
  let vehicle = null;
  if (type === "car") {
    vehicle = availableCars[idx];
    if (!player.licenses[vehicle.reqLicense]) { showToast("Não tens carta para este carro!"); return; }
  } else {
    vehicle = availableBikes[idx];
    if (!player.licenses[vehicle.reqLicense]) { showToast("Não tens a carta de mota adequada!"); return; }
  }

  if (player.bank < vehicle.price) { showToast("Sem saldo na conta."); return; }
  player.bank -= vehicle.price;
  game.vehicles.push({ id: createId("veh"), name: `${vehicle.brand} ${vehicle.name}`, type: type, value: vehicle.price, annualCost: vehicle.annualCost });
  addEvent(`Compraste o veículo ${vehicle.brand} ${vehicle.name}! 🚘🏍️`, "positive");
  saveGame();
  renderGame();
}

// Custos anuais dos veículos (seguro, manutenção, imposto) — antes nunca eram cobrados.
function processVehiclesYear() {
  if (!game || !game.vehicles.length) return;
  const total = game.vehicles.reduce((sum, v) => sum + (v.annualCost || 0), 0);
  if (total <= 0) return;
  game.player.bank -= total;
  addFinanceEvent(`Gastaste ${money(total)} em seguro e manutenção de veículos.`);
}

function renderVehiclesSection() {
  const container = $("vehiclesSectionContainer");
  if (!container) return;
  const player = game.player;

  let html = `<div class="panel"><h3>📜 Cartas de Condução</h3><div class="button-list">`;
  Object.keys(licenseRules).forEach(key => {
    const rule = licenseRules[key];
    const hasIt = player.licenses[key];
    const ageOk = player.age >= rule.minAge;
    html += `
      <div class="person-card" style="flex-direction: column; align-items: flex-start; gap: 4px;">
        <strong>${escapeHTML(rule.name)}</strong>
        <small>Idade mín: ${rule.minAge} anos | Custo: ${money(rule.cost)}</small>
        ${hasIt ? `<span style="color: var(--success-color); font-weight:bold;">✔ Obtida</span>` : `<button class="secondary-btn full-width" ${!ageOk ? 'disabled' : ''} onclick="takeLicense('${key}')">Tirar Carta (${money(rule.cost)})</button>`}
      </div>
    `;
  });
  html += `</div></div>`;

  html += `<div class="panel" style="margin-top: 15px;"><h3>🚗🏍️ Concessionário de Veículos</h3>`;
  html += `<h4 style="margin-top: 4px;">Comprar Carros</h4><div class="button-list">`;
  availableCars.forEach((c, idx) => {
    html += `<button class="secondary-btn full-width" onclick="buyVehicle('car', ${idx})">${escapeHTML(c.brand)} ${escapeHTML(c.name)} (${money(c.price)})</button>`;
  });
  html += `</div>`;

  html += `<h4 style="margin-top: 12px;">Comprar Motas</h4><div class="button-list">`;
  availableBikes.forEach((b, idx) => {
    html += `<button class="secondary-btn full-width" onclick="buyVehicle('bike', ${idx})">${escapeHTML(b.brand)} ${escapeHTML(b.name)} [${b.cc}] (${money(b.price)})</button>`;
  });
  html += `</div></div>`;

  container.innerHTML = html;
}

function openBusinessModal() {
  if (game.player.age < 18) { showToast("Precisas de ter 18 anos."); return; }
  const minLocal = Math.round(500 * getPriceFactor());
  const modal = $("customModal");
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Criar Negócio">
      <h3>🏢 Criar Novo Negócio</h3>
      <div class="input-group" style="margin-top: 10px;">
        <label>Nome do negócio</label>
        <input type="text" id="bizNameInput" maxlength="30" placeholder="Ex: Café Estrela">
      </div>
      <div class="input-group">
        <label>Investimento inicial (${escapeHTML(getCurrencySymbol())}) — mínimo ${money(500)}</label>
        <input type="number" id="bizInvestInput" min="${minLocal}" step="100" placeholder="${minLocal}">
      </div>
      <p class="muted">Saldo disponível: ${money(game.player.bank)}</p>
      <div class="modal-buttons">
        <button type="button" class="primary-btn full-width" onclick="confirmCreateBusiness()">Criar Negócio</button>
        <button type="button" class="secondary-btn full-width" onclick="closeCustomModal()">Cancelar</button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
  setTimeout(() => $("bizNameInput")?.focus(), 50);
}

function confirmCreateBusiness() {
  const name = ($("bizNameInput")?.value || "").trim().slice(0, 30);
  const localAmount = Number($("bizInvestInput")?.value);
  if (!name) { showToast("Escreve o nome do negócio."); return; }
  // O jogador escreve na moeda local; internamente guardamos em valor base.
  const inv = Math.round((localAmount || 0) / getPriceFactor());
  if (!inv || inv < 500) { showToast(`Investimento mínimo: ${money(500)}.`); return; }
  if (game.player.bank < inv) { showToast("Sem saldo suficiente."); return; }

  game.player.bank -= inv;
  game.businesses.push({ id: createId("biz"), name, investment: inv, yearlyProfit: Math.round(inv * 0.25) });
  addEvent(`Criaste o negócio "${name}"! 🏢`, "positive");
  closeCustomModal();
  saveGame();
  renderGame();
}

function renderBusinesses() {
  const container = $("businessList");
  if (!container) return;
  container.innerHTML = "";
  if (!game.businesses.length) {
    container.innerHTML = "<p class='muted'>Sem negócios ativos.</p>";
    return;
  }
  game.businesses.forEach(b => {
    container.innerHTML += `
      <div class="person-card">
        <div class="person-info">
          <strong>${escapeHTML(b.name)}</strong>
          <small>Investimento: ${money(b.investment)} · Lucro Anual: ${money(b.yearlyProfit)}</small>
        </div>
      </div>
    `;
  });
}

function processBusinessesYear() {
  if (!game || !game.businesses.length) return;
  game.businesses.forEach(b => {
    game.player.bank += b.yearlyProfit;
    addFinanceEvent(`O teu negócio "${b.name}" gerou ${money(b.yearlyProfit)} de lucro.`);
  });
}

// Saldo negativo vira dívida pessoal; saldo positivo vai pagando essa dívida.
function settleFinances() {
  const player = game.player;
  player.personalDebt ??= 0;

  if (player.bank < 0) {
    const owed = Math.abs(player.bank);
    player.bank = 0;
    player.personalDebt += owed;
    player.debt += owed;
    player.happiness = clamp(player.happiness - 5);
    addEvent(`Ficaste sem saldo e contraíste ${money(owed)} em dívidas. 📉`, "negative");
  } else if (player.bank > 0 && player.personalDebt > 0) {
    const pay = Math.min(player.bank, player.personalDebt);
    player.bank -= pay;
    player.personalDebt -= pay;
    player.debt = Math.max(0, player.debt - pay);
    addEvent(`Pagaste ${money(pay)} das tuas dívidas pessoais.`, "positive");
  }
}
