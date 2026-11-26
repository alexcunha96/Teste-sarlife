"use strict";

/* =========================================
   STARLIFE · VIDA — escola, carreira, família, relações, atividades, saúde, morte e avançar ano
========================================= */

function getCurrentEducationStage(age) {
  return educationStages.find(stage => age >= stage.start && age <= stage.end) || null;
}

function initializeEducation(player) {
  player.intelligence ??= randomNumber(35, 85);
  player.schoolGrade ??= 12;
  player.education ??= "Sem escolaridade";
  player.educationLevel ??= 0;
  player.universityCourse ??= null;
  player.universityProgress ??= 0;
  player.studiedThisYear ??= false;
  player.workedHardThisYear ??= false;
  player.jobPerformance ??= 50;
  player.retired ??= false;
  player.didLifestyleActionThisYear ??= false;
}

function processSchoolYear() {
  const player = game.player;
  const stage = getCurrentEducationStage(player.age);
  if (!stage || player.age > 17) return;
  const base = (player.intelligence / 100) * 12 + 6;
  player.schoolGrade = clamp(Math.round(base + randomNumber(-2, 2)), 5, 20);
  if (player.age === 14) { player.education = "Ensino básico"; player.educationLevel = 1; }
  if (player.age === 17) { player.education = "Ensino secundário"; player.educationLevel = 2; }
}

function studyHarder() {
  const player = game.player;
  if (player.studiedThisYear) { showToast("Já estudaste bastante este ano."); return; }
  player.studiedThisYear = true;
  player.intelligence = clamp(player.intelligence + 2);
  player.schoolGrade = clamp(player.schoolGrade + 1, 0, 20);
  addEvent("Estudaste com afinco. 📖");
  saveGame();
  renderGame();
}

function workHarder() {
  const player = game.player;
  if (!player.job || player.retired) { showToast("Precisas de um emprego ativo."); return; }
  if (player.workedHardThisYear) { showToast("Já deste o teu melhor este ano no trabalho."); return; }
  player.workedHardThisYear = true;
  player.jobPerformance = clamp((player.jobPerformance ?? 50) + randomNumber(8, 15));
  player.happiness = clamp(player.happiness - 2);
  addEvent(`Trabalhaste arduamente como ${player.job}. 💪`, "positive");
  showToast("Desempenho profissional aumentou!");
  saveGame();
  renderGame();
}

function processCareerYear() {
  const player = game.player;
  if (!player.job || player.retired) return;

  // Reforma automática aos 67 anos
  if (player.age >= 67) {
    const pension = Math.max(6000, Math.round(player.salary * 0.65));
    player.retired = true;
    player.job = "Reformado/a";
    player.salary = pension;
    addEvent(`ReFormaste-te aos 67 anos! Pensão anual: ${money(pension)}. 🧓`, "positive");
    return;
  }

  // Chance anual de promoção / aumento baseada no desempenho
  const perf = player.jobPerformance ?? 50;
  if (perf >= 75 && Math.random() < 0.35) {
    const currentCatalogEntry = jobCatalog.find(j => j.title === player.job);
    const raise = currentCatalogEntry ? currentCatalogEntry.promoBonus : Math.round(player.salary * 0.12);
    player.salary += raise;
    if (currentCatalogEntry?.nextTitle) {
      player.job = currentCatalogEntry.nextTitle;
      addEvent(`Foste promovido/a a ${player.job}! Novo salário: ${money(player.salary)}/ano. 🎉`, "positive");
    } else {
      addEvent(`Recebeste um aumento salarial! Novo salário: ${money(player.salary)}/ano. 📈`, "positive");
    }
    player.jobPerformance = 55;
  } else {
    player.jobPerformance = clamp(perf - 3);
  }
}

function enrollUniversity(index) {
  const player = game.player;
  const course = universityCourses[index];
  if (!course) return;
  if (player.age < 18 || player.educationLevel < 2) { showToast("Precisas do ensino secundário."); return; }
  if (player.universityCourse) { showToast("Já estás na universidade."); return; }
  if (player.bank < course.cost) { showToast(`Precisas de ${money(course.cost)} para pagar o 1.º ano.`); return; }

  player.bank -= course.cost;
  player.universityCourse = course.name;
  player.universityProgress = 0;
  addFinanceEvent(`Propinas de ${course.name}: ${money(course.cost)}.`);
  addEvent(`Entraste na Universidade para estudar ${course.name}! 🎓`);
  saveGame();
  renderGame();
}

function processFurtherEducation() {
  const player = game.player;
  if (!player.universityCourse) return;
  const course = universityCourses.find(c => c.name === player.universityCourse);
  player.universityProgress++;
  const duration = course?.duration || 4;

  if (player.universityProgress >= duration) {
    player.education = `Licenciatura em ${player.universityCourse}`;
    player.educationLevel = 3;
    if (course) {
      player.job = course.job;
      player.salary = Math.max(player.salary, course.salary);
      player.retired = false;
    }
    player.universityCourse = null;
    addEvent(`🎓 Licenciatura concluída em ${course?.name}! Começaste a trabalhar como ${course?.job || "licenciado/a"}.`, "positive");
  } else if (course) {
    player.bank -= course.cost;
    addFinanceEvent(`Propinas de ${course.name}: ${money(course.cost)}.`);
  }
}

function renderSchoolAndUniversitySubmenu() {
  const player = game.player;
  const container = $("schoolSectionContainer");
  if (!container) return;
  const stage = getCurrentEducationStage(player.age);

  let html = `
    <div class="panel" style="margin-top: 6px;">
      <h3>📚 Estatísticas Escolares</h3>
      <div class="info-row"><span>Etapa atual</span><strong>${escapeHTML(stage?.name || player.education)}</strong></div>
      <div class="info-row"><span>Média</span><strong>${player.schoolGrade}/20</strong></div>
      <div class="info-row"><span>Inteligência</span><strong>${player.intelligence}%</strong></div>
    </div>
  `;

  if (player.age >= 6 && player.age <= 18) {
    html += `<div class="panel"><h3>Atividades de Estudante</h3><button class="primary-btn full-width" id="studyBtn" ${player.studiedThisYear ? "disabled" : ""}>${player.studiedThisYear ? "📖 Já estudaste este ano" : "📖 Estudar Mais"}</button></div>`;
  }

  if (player.age >= 18 && player.educationLevel >= 2) {
    html += `
      <div class="panel">
        <h3>🏛️ Ensino Superior</h3>
        ${player.universityCourse ? `<p>Curso atual: <strong>${escapeHTML(player.universityCourse)}</strong> (${player.universityProgress} anos)</p>` : `<p class="muted">Escolhe um curso:</p>`}
        ${universityCourses.map((c, idx) => `
          <div style="margin-top: 8px; padding: 8px; background: var(--panel-light); border-radius: 8px;">
            <strong>${escapeHTML(c.name)}</strong> (${money(c.cost)}/ano · ${c.duration} anos)
            ${!player.universityCourse ? `<button class="small-btn full-width" style="margin-top:6px;" data-uni-idx="${idx}">Inscrever-se</button>` : ""}
          </div>
        `).join("")}
      </div>
    `;
  }

  container.innerHTML = html;
  if ($("studyBtn")) $("studyBtn").onclick = studyHarder;
  container.querySelectorAll("[data-uni-idx]").forEach(b => {
    b.onclick = () => enrollUniversity(Number(b.dataset.uniIdx));
  });
}

function generateName(sex) {
  if (sex === "Feminino") return randomFrom(sampleFemaleNames);
  if (sex === "Masculino") return randomFrom(sampleMaleNames);
  return randomFrom([...sampleFemaleNames, ...sampleMaleNames]);
}

function sexFromRelation(relation) {
  if (relation === "Mãe" || relation === "Avó" || relation === "Namorada" || relation === "Esposa" || relation === "Filha") return "Feminino";
  if (relation === "Pai" || relation === "Avô" || relation === "Namorado" || relation === "Marido" || relation === "Filho") return "Masculino";
  return "Outro";
}

function createFamilyMember(data) {
  const age = Number(data.age) || 0;
  return {
    id: data.id || createId("person"),
    name: data.name || "Sem nome",
    surname: data.surname || "",
    relation: data.relation || "Outro",
    age,
    sex: data.sex || sexFromRelation(data.relation),
    maritalStatus: data.maritalStatus || data.relationshipStatus || "",
    alive: true,
    relationship: data.relationship ?? randomNumber(70, 95),
    maxAge: Math.max(randomNumber(78, 102), age + randomNumber(1, 8)),
    job: "",
    salary: 0
  };
}

function meetNewPerson(kind = "friend") {
  const player = game.player;
  if (player.age < 6) { showToast("Ainda és demasiado novo/a para sair sozinho/a."); return; }
  if (kind === "romance" && player.age < 16) { showToast("Encontros românticos disponíveis a partir dos 16 anos."); return; }

  const sex = Math.random() < 0.5 ? "Feminino" : "Masculino";
  const name = generateName(sex);
  const surname = randomFrom(sampleMaleNames).slice(0, 4) + randomFrom(["a", "o", "es", "s"]);
  const age = clamp(player.age + randomNumber(-3, 3), 16, 85);
  const relation = kind === "romance"
    ? (sex === "Feminino" ? "Namorada" : "Namorado")
    : "Amigo/a";

  const person = createFamilyMember({
    name,
    surname,
    relation,
    age,
    sex,
    maritalStatus: kind === "romance" ? "Em relacionamento" : "Solteiro/a",
    relationship: randomNumber(60, 82)
  });

  game.family.push(person);
  player.happiness = clamp(player.happiness + 4);
  addEvent(`Conheceste ${name} (${relation})! 👋`, "positive");
  showToast(`Conheceste ${name}!`);
  saveGame();
  renderGame();
}

function proposeMarriage(memberId) {
  const member = game.family.find(f => f.id === memberId);
  const player = game.player;
  if (!member || !member.alive) return;
  if (player.age < 18) { showToast("Precisas de ter 18 anos para casar."); return; }
  if (member.relationship < 70) { showToast("A relação ainda precisa de ser mais forte (70%+)."); return; }

  member.relation = member.sex === "Feminino" ? "Esposa" : (member.sex === "Masculino" ? "Marido" : "Cônjuge");
  member.maritalStatus = "Casado/a";
  player.happiness = clamp(player.happiness + 15);
  addEvent(`Casaste-te com ${member.name} ${member.surname}! 💍`, "positive");
  showToast(`Casamento com ${member.name}!`);
  closeCustomModal();
  saveGame();
  renderGame();
}

function haveChild() {
  const player = game.player;
  if (player.age < 18) { showToast("Precisas de ter pelo menos 18 anos."); return; }
  const childSex = Math.random() < 0.5 ? "Feminino" : "Masculino";
  const childName = generateName(childSex);
  const child = createFamilyMember({
    name: childName,
    surname: player.surname,
    relation: childSex === "Feminino" ? "Filha" : "Filho",
    age: 0,
    sex: childSex,
    maritalStatus: "",
    relationship: 95
  });
  game.family.push(child);
  player.happiness = clamp(player.happiness + 14);
  addEvent(`Nasceu o teu/tua ${child.relation.toLowerCase()}, ${childName}! 👶`, "positive");
  showToast(`Parabéns! Nasceu ${childName}!`);
  saveGame();
  renderGame();
}

function processFamilyYear() {
  if (!game || !Array.isArray(game.family)) return;
  let childSupport = 0;

  game.family.forEach(member => {
    if (!member.alive) return;
    member.age += 1;
    member.relationship = clamp(member.relationship - randomNumber(0, 2));

    if ((member.relation === "Filho" || member.relation === "Filha") && member.age < 18) {
      childSupport += 1800;
    }

    if (member.age >= member.maxAge && Math.random() < 0.25) {
      member.alive = false;
      game.player.happiness = clamp(game.player.happiness - 18);
      addEvent(`🕯️ O teu/tua ${member.relation.toLowerCase()}, ${member.name} ${member.surname}, faleceu aos ${member.age} anos.`, "negative");
    }
  });

  if (childSupport > 0) {
    game.player.bank -= childSupport;
    addFinanceEvent(`Despesas anuais com filhos: ${money(childSupport)}.`);
  }
}

function openFamilyInteractionModal(memberId) {
  const member = game.family.find(f => f.id === memberId);
  if (!member) return;

  if (!member.alive) {
    showToast(`${member.name} já faleceu.`);
    return;
  }

  const isPartner = ["Namorado", "Namorada", "Esposa", "Marido", "Cônjuge"].includes(member.relation);
  const canMarry = isPartner && !["Esposa", "Marido", "Cônjuge"].includes(member.relation);

  const modal = $("customModal");
  modal.innerHTML = `
    <div class="modal-card">
      <h3>${escapeHTML(member.name)} ${escapeHTML(member.surname)}</h3>
      <p class="muted">${escapeHTML(member.relation)} · ${member.age} anos${member.maritalStatus ? " · " + escapeHTML(member.maritalStatus) : ""}</p>
      
      <div class="stat-bar" style="margin-top: 12px;">
        <span>Relação: <strong>${member.relationship}%</strong></span>
        <div class="bar"><div class="fill" style="width: ${member.relationship}%; background-color: ${member.relationship > 40 ? 'var(--success-color)' : 'var(--danger-color)'};"></div></div>
      </div>

      <div class="modal-buttons">
        <button class="primary-btn full-width" onclick="interactFamily('${member.id}', 'talk')">💬 Conversar / Passar Tempo</button>
        <button class="secondary-btn full-width" onclick="interactFamily('${member.id}', 'gift')">🎁 Dar Presente</button>
        ${canMarry ? `<button class="primary-btn full-width" onclick="proposeMarriage('${member.id}')">💍 Pedir em Casamento</button>` : ""}
        <button class="secondary-btn full-width" onclick="interactFamily('${member.id}', 'money')">💶 Pedir Dinheiro</button>
        <button class="danger-btn full-width" onclick="interactFamily('${member.id}', 'argue')">💢 Discutir</button>
      </div>

      <button class="small-btn full-width" style="margin-top: 14px;" onclick="closeCustomModal()">Fechar</button>
    </div>
  `;
  modal.classList.remove("hidden");
}

function interactFamily(memberId, action) {
  const member = game.family.find(f => f.id === memberId);
  if (!member || !member.alive) return;

  if (action === "talk") {
    const gain = randomNumber(4, 9);
    member.relationship = clamp(member.relationship + gain);
    game.player.happiness = clamp(game.player.happiness + 3);
    addEvent(`Tiveste uma ótima conversa com ${member.name} (${member.relation}).`, "positive");
    showToast(`Relação +${gain}%`);
  } 
  else if (action === "gift") {
    if (game.player.bank < 50) {
      showToast("Não tens saldo suficiente.");
      return;
    }
    game.player.bank -= 50;
    const gain = randomNumber(10, 18);
    member.relationship = clamp(member.relationship + gain);
    game.player.happiness = clamp(game.player.happiness + 4);
    addEvent(`Ofereceste um presente a ${member.name}! 🎁`, "positive");
    showToast(`Presente entregue! Relação +${gain}%`);
  } 
  else if (action === "money") {
    if (member.age < 18) {
      showToast(`${member.name} ainda é menor de idade.`);
      return;
    }
    if (member.relationship >= 55 && Math.random() < 0.7) {
      const amount = randomNumber(100, 450);
      game.player.bank += amount;
      member.relationship = clamp(member.relationship - 4);
      addFinanceEvent(`${member.name} (${member.relation}) deu-te ${money(amount)}.`);
      addEvent(`${member.name} ajudou-te com ${money(amount)}! 💶`, "positive");
      showToast(`Recebeste ${money(amount)}!`);
    } else {
      member.relationship = clamp(member.relationship - 6);
      showToast(`${member.name} recusou o pedido de dinheiro.`);
    }
  } 
  else if (action === "argue") {
    const loss = randomNumber(12, 22);
    member.relationship = clamp(member.relationship - loss);
    game.player.happiness = clamp(game.player.happiness - 6);
    addEvent(`Tiveste uma discussão séria com ${member.name}. 💢`, "negative");
    showToast(`Relação -${loss}%`);
  }

  closeCustomModal();
  saveGame();
  renderGame();
}

function renderFamilyTree() {
  let targetContainer = $("familyTree");
  if (!targetContainer) {
    const panels = document.querySelectorAll("#peopleTab .panel");
    if (panels.length >= 2) {
      targetContainer = panels[1].querySelector("div:last-child") || panels[1];
    }
  }
  if (!targetContainer) return;

  const parents = game.family.filter(f => f.relation === "Mãe" || f.relation === "Pai");
  const children = game.family.filter(f => f.relation === "Filho" || f.relation === "Filha");
  const others = game.family.filter(f => !["Mãe", "Pai", "Filho", "Filha"].includes(f.relation));

  let html = `<div style="text-align: center; padding: 4px;">`;
  
  if (parents.length > 0) {
    html += `<div style="margin-bottom: 8px;"><small class="muted" style="display:block; margin-bottom: 4px;">Pais</small>`;
    parents.forEach(p => {
      html += `<span style="display:inline-block; background:var(--bg-color); border:1px solid var(--border-color); padding:4px 8px; border-radius:6px; margin:2px; font-size:0.85rem;">${p.alive ? '🟢' : '🕯️'} ${escapeHTML(p.name)} (${escapeHTML(p.relation)}, ${p.age}a)</span>`;
    });
    html += `</div><div style="color:var(--accent-color); font-weight:bold;">│</div>`;
  }

  html += `
    <div style="margin: 4px 0;">
      <span style="display:inline-block; background:var(--accent-color); color:#fff; padding:6px 12px; border-radius:8px; font-weight:bold; font-size:0.9rem;">
        ⭐ ${escapeHTML(game.player.name)} (${game.player.age} anos)
      </span>
    </div>
  `;

  if (children.length > 0) {
    html += `<div style="color:var(--accent-color); font-weight:bold;">│</div><div style="margin-top: 6px;"><small class="muted" style="display:block; margin-bottom: 4px;">Filhos/as</small>`;
    children.forEach(c => {
      html += `<span style="display:inline-block; background:var(--bg-color); border:1px solid var(--border-color); padding:4px 8px; border-radius:6px; margin:2px; font-size:0.85rem;">${c.alive ? '🟢' : '🕯️'} ${escapeHTML(c.name)} (${escapeHTML(c.relation)}, ${c.age}a)</span>`;
    });
    html += `</div>`;
  }

  if (others.length > 0) {
    html += `<div style="margin-top: 8px;"><small class="muted" style="display:block; margin-bottom: 4px;">Relações & Outros</small>`;
    others.forEach(o => {
      html += `<span style="display:inline-block; background:var(--bg-color); border:1px solid var(--border-color); padding:4px 8px; border-radius:6px; margin:2px; font-size:0.85rem;">${o.alive ? '🟢' : '🕯️'} ${escapeHTML(o.name)} (${escapeHTML(o.relation)}, ${o.age}a)</span>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  targetContainer.innerHTML = html;
}

function renderPeople() {
  const container = $("peopleList");
  if (!container) return;
  container.innerHTML = "";

  if (game.family.length === 0) {
    container.innerHTML = `<p class="muted">Sem familiares ou contactos registados.</p>`;
  } else {
    game.family.forEach(f => {
      const aliveBadge = f.alive ? `${f.age} anos` : `🕯️ Falecido/a (${f.age} anos)`;
      const marital = f.maritalStatus ? ` · ${escapeHTML(f.maritalStatus)}` : "";
      const barColor = f.relationship > 40 ? "var(--success-color)" : "var(--danger-color)";
      container.innerHTML += `
        <div class="person-card house-card" onclick="openFamilyInteractionModal('${f.id}')" style="flex-direction: column; align-items: stretch; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${escapeHTML(f.name)} ${escapeHTML(f.surname)}</strong>
              <small style="display:block; color: var(--text-muted);">${escapeHTML(f.relation)} · ${aliveBadge}${marital}</small>
            </div>
            ${f.alive ? `<span class="small-btn">Interagir ›</span>` : ""}
          </div>
          ${f.alive ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <small style="font-size: 0.75rem; color: var(--text-muted);">Relação:</small>
              <div class="bar" style="flex: 1; height: 6px; margin: 0;"><div class="fill" style="width: ${f.relationship}%; background-color: ${barColor};"></div></div>
              <small style="font-size: 0.75rem; font-weight: bold;">${f.relationship}%</small>
            </div>
          ` : ""}
        </div>
      `;
    });
  }

  renderFamilyTree();
}

function doLifestyleActivity(type) {
  const player = game.player;
  if (player.didLifestyleActionThisYear) {
    showToast("Já fizeste uma atividade de estilo de vida este ano.");
    return;
  }

  if (type === "gym") {
    const cost = 60;
    if (player.bank < cost) { showToast(`Precisas de ${money(cost)}.`); return; }
    player.bank -= cost;
    player.health = clamp(player.health + 8);
    player.happiness = clamp(player.happiness + 4);
    player.didLifestyleActionThisYear = true;
    addEvent("Treinaste no ginásio e melhoraste a forma física! 💪", "positive");
    showToast("Saúde +8%");
  } else if (type === "vacation") {
    const cost = 350;
    if (player.bank < cost) { showToast(`Precisas de ${money(cost)}.`); return; }
    player.bank -= cost;
    player.happiness = clamp(player.happiness + 16);
    player.health = clamp(player.health + 3);
    player.didLifestyleActionThisYear = true;
    addEvent("Tiraste férias e recarregaste baterias! 🏖️", "positive");
    showToast("Felicidade +16%");
  } else if (type === "lottery") {
    const cost = 25;
    if (player.bank < cost) { showToast(`Precisas de ${money(cost)}.`); return; }
    player.bank -= cost;
    player.didLifestyleActionThisYear = true;
    if (Math.random() < 0.08) {
      const prize = randomNumber(1500, 15000);
      player.bank += prize;
      player.happiness = clamp(player.happiness + 20);
      addFinanceEvent(`Prémio de lotaria: +${money(prize)}.`);
      addEvent(`🍀 Ganhas-te ${money(prize)} na lotaria!`, "positive");
      showToast(`Prémio de ${money(prize)}!`);
    } else {
      addEvent("Jogaste na lotaria, mas não saiu desta vez. 🎟️", "neutral");
      showToast("Sem prémio desta vez.");
    }
  } else if (type === "crime") {
    if (player.age < 16) { showToast("Disponível a partir dos 16 anos."); return; }
    player.didLifestyleActionThisYear = true;
    if (Math.random() < 0.45) {
      const loot = randomNumber(400, 2500);
      player.bank += loot;
      player.happiness = clamp(player.happiness + 6);
      addEvent(`O golpe resultou e ganhaste ${money(loot)}! 🕶️`, "positive");
      showToast(`Ganhaste ${money(loot)}!`);
    } else {
      const fine = randomNumber(300, 1200);
      player.bank -= fine;
      player.health = clamp(player.health - 10);
      player.happiness = clamp(player.happiness - 12);
      addFinanceEvent(`Multa/perda por atividade ilegal: -${money(fine)}.`);
      addEvent(`Foste apanhado/a e perdeste ${money(fine)}! 🚨`, "negative");
      showToast(`Apanhado/a! Perdeste ${money(fine)}.`);
    }
  }

  saveGame();
  renderGame();
}

function triggerRandomEvent() {
  if (!game || !game.player.alive) return;
  const age = game.player.age;
  const validEvents = lifeEventsPool.filter(ev => age >= ev.minAge && age <= ev.maxAge);
  if (validEvents.length === 0 || Math.random() > 0.4) return;
  const ev = randomFrom(validEvents);
  const modal = $("customModal");
  modal.innerHTML = `
    <div class="modal-card">
      <h3>⚠️ Acontecimento</h3>
      <p>${escapeHTML(ev.text)}</p>
      <div class="modal-buttons" id="eventOptionsContainer"></div>
    </div>
  `;
  modal.classList.remove("hidden");

  const btnContainer = $("eventOptionsContainer");
  btnContainer.innerHTML = "";
  ev.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "primary-btn full-width";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      opt.effect();
      modal.classList.add("hidden");
      saveGame();
      renderGame();
    });
    btnContainer.appendChild(btn);
  });
}

function getIllnessInfo(ill) {
  if (!ill) return null;
  const known = commonIllnesses.find(i => i.name === ill.name);
  return { ...ill, symptom: ill.symptom || known?.symptom || "mal-estar geral" };
}

function checkRandomIllness() {
  const player = game.player;
  if (player.illness || player.age < 3) return;
  const chance = 0.06 + (player.age * 0.001) - ((player.health - 50) * 0.001);
  if (Math.random() >= chance) return;

  const pool = commonIllnesses
    .filter(i => player.age >= i.minAge)
    .map(i => ({ ill: i, w: Math.max(0, i.weight(player.age)) }))
    .filter(x => x.w > 0);
  if (!pool.length) return;

  let roll = Math.random() * pool.reduce((sum, x) => sum + x.w, 0);
  let chosen = pool[pool.length - 1].ill;
  for (const x of pool) {
    roll -= x.w;
    if (roll <= 0) { chosen = x.ill; break; }
  }

  const { name, severity, cost, healthImpact, specialty, symptom } = chosen;
  player.illness = { name, severity, cost, healthImpact, specialty, symptom };
  addEvent(`⚠️ Foi-te diagnosticado/a: ${name}. Sintomas: ${symptom}. Procura ${specialtyLabels[specialty]}.`, "negative");
}

function processHealthYear() {
  const player = game.player;

  if (player.illness && player.illness.severity === "Baixa" && Math.random() < 0.4) {
    addEvent(`Recuperaste sozinho/a de: ${player.illness.name}. 💪`, "positive");
    player.illness = null;
  }

  checkRandomIllness();

  if (player.illness) {
    player.health = clamp(player.health - player.illness.healthImpact);
  } else {
    const recovery = player.age < 40 ? randomNumber(3, 6) : player.age < 60 ? randomNumber(1, 3) : 0;
    const aging = player.age >= 60 ? randomNumber(1, 3) : 0;
    player.health = clamp(player.health + recovery - aging);
  }

  if (player.health > 0 && player.health < 30) {
    addEvent(`🚨 A tua saúde está em ${Math.round(player.health)}%. Procura ajuda no Centro Médico!`, "negative");
    showToast(`⚠️ Saúde crítica: ${Math.round(player.health)}%`);
  }
}

function getCauseOfDeath() {
  const player = game.player;
  if (player.health <= 0) {
    if (player.illness) return `Complicações de ${player.illness.name}`;
    return player.age >= 60 ? "Fragilidade da idade avançada" : "Saúde debilitada";
  }
  return "Causas naturais (velhice)";
}

function setMedicalCenterOpen(isOpen) {
  const btnCard = $("medicalCenterButtonCard");
  const content = $("medicalCenterContent");
  const actionContainer = $("healthActionContainer");
  if (!btnCard || !content) return;

  if (isOpen) {
    btnCard.classList.add("hidden");
    content.classList.remove("hidden");
  } else {
    content.classList.add("hidden");
    btnCard.classList.remove("hidden");
    if (actionContainer) actionContainer.innerHTML = "";
  }
}

function openHealthSpecialty(specialty) {
  const container = $("healthActionContainer");
  if (!container || !game) return;
  const ill = game.player.illness;
  const matches = Boolean(ill && ill.specialty === specialty);

  const base = {
    familyDoctor: { title: "👨‍⚕️ Médico de Família", desc: "Consulta de rotina e doenças comuns.", cost: 40 },
    urgency: { title: "🚑 Urgências Hospitalares", desc: "Atendimento imediato.", cost: 100 },
    cardiology: { title: "❤️ Cardiologia", desc: "Tratamento cardiovascular.", cost: 250 },
    orthopedics: { title: "🦴 Ortopedia", desc: "Tratamento de lesões.", cost: 180 },
    psychiatry: { title: "🧠 Psiquiatria", desc: "Saúde mental.", cost: 200 },
    oncology: { title: "🎗️ Oncologia", desc: "Rastreio e tratamento oncológico.", cost: 150 }
  }[specialty] || { title: "Centro Clínico", desc: "Serviços médicos especializados.", cost: 100 };

  let mode = "visit";
  let cost = base.cost;
  let label = `Efetuar Consulta (${money(cost)})`;
  let extra = "";

  if (specialty === "urgency") {
    mode = "urgency";
    label = `Ir às Urgências (${money(cost)})`;
  } else if (matches) {
    mode = "treat";
    cost = Math.max(base.cost, ill.cost || base.cost);
    label = `Iniciar Tratamento (${money(cost)})`;
    extra = `<p style="margin-top: 6px;">Diagnóstico atual: <strong style="color: var(--danger-color);">${escapeHTML(ill.name)}</strong></p>`;
  } else if (specialty === "oncology") {
    label = `Fazer Rastreio (${money(cost)})`;
  }

  container.innerHTML = `
    <div class="panel" style="margin-top: 12px;">
      <h3>${base.title}</h3>
      <p class="muted">${base.desc}</p>
      ${extra}
      <button class="primary-btn full-width" style="margin-top: 10px;" id="execHealthBtn">${label}</button>
    </div>
  `;
  $("execHealthBtn").onclick = () => executeHealthAction(mode, cost, specialty);
}

function executeHealthAction(mode, cost, specialty) {
  const player = game.player;
  if (player.bank < cost) { showToast("Saldo insuficiente."); return; }
  player.bank -= cost;

  const ill = player.illness;

  if (mode === "urgency") {
    player.health = clamp(player.health + 12);
    showToast("Urgência efetuada.");
  } else if (mode === "treat" && ill && ill.specialty === specialty) {
    addEvent(`Curaste com sucesso: ${ill.name}! 🎉`, "positive");
    player.illness = null;
    player.health = clamp(player.health + 25);
    showToast("Tratamento bem-sucedido!");
  } else if (specialty === "familyDoctor") {
    player.health = clamp(player.health + 3);
    if (ill) {
      showToast(`Atenção: tens ${ill.name}. Procura ${specialtyLabels[ill.specialty] || "um especialista"}.`);
    } else {
      showToast("Check-up limpo!");
    }
  } else {
    player.health = clamp(player.health + 2);
    showToast(specialty === "oncology" ? "Rastreio concluído: nada de preocupante." : "Consulta concluída: nada a tratar nesta especialidade.");
  }

  saveGame();
  renderGame();
  openHealthSpecialty(specialty);
}

function triggerDeath(cause = "Causas naturais") {
  const player = game.player;
  player.alive = false;
  player.causeOfDeath = cause;
  localStorage.removeItem(SAVE_KEY);

  $("gameScreen").classList.add("hidden");
  $("deathScreen").classList.remove("hidden");

  $("tombstoneName").textContent = `${player.name} ${player.surname}`;
  $("tombstoneYears").textContent = `${game.year - player.age} - ${game.year} (${player.age} anos)`;
  $("tombstoneQuote").textContent = `"${randomFrom(tombstoneQuotes)}"`;

  $("deathReportStats").innerHTML = `
    <div class="info-row"><span>Causa da morte</span><strong style="color: var(--danger-color);">${escapeHTML(cause)}</strong></div>
    <div class="info-row"><span>Património Final</span><strong>${money(getTotalWealth())}</strong></div>
    <div class="info-row"><span>Profissão</span><strong>${escapeHTML(player.job || "Nenhuma")}</strong></div>
    <div class="info-row"><span>Escolaridade</span><strong>${escapeHTML(player.education)}</strong></div>
  `;

  $("newLifeBtn").onclick = () => {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  };
}

function advanceYear() {
  if (!game || !game.player.alive) return;
  const player = game.player;

  const prevAge = player.age;
  player.age += 1;
  game.year += 1;
  player.bank += player.salary;
  player.studiedThisYear = false;
  player.workedHardThisYear = false;
  player.didLifestyleActionThisYear = false;

  if (prevAge < 18 && player.age >= 18 && player.avatarCustom?.facialHair !== "none") {
    addEvent("Completaste 18 anos e a barba cresceu! 🧔", "positive");
  }

  processFamilyYear();
  processSchoolYear();
  processFurtherEducation();
  processCareerYear();
  processHousingYear();
  processVehiclesYear();
  processBusinessesYear();
  settleFinances();
  processHealthYear();
  generateYearlyMarket();

  if (player.age >= player.maxAge || player.health <= 0) {
    triggerDeath(getCauseOfDeath());
    return;
  }

  triggerRandomEvent();
  saveGame();
  renderGame();
}
