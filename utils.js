"use strict";

/* =========================================
   STARLIFE · UTILITÁRIOS — formatação, ids, toasts, eventos e ilustrações
========================================= */

const $ = id => document.getElementById(id);

function createId(prefix = "id") {
  return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Todos os valores do jogo são guardados em euros (valor base) e convertidos só ao mostrar.
function getPriceFactor() {
  const country = game ? game.player.country : "Portugal";
  const data = worldCountriesDatabase[country];
  return data && data.priceFactor ? data.priceFactor : 1;
}

function getCurrencySymbol() {
  const country = game ? game.player.country : "Portugal";
  const data = worldCountriesDatabase[country];
  return data ? data.symbol : "€";
}

function money(value) {
  const country = game ? game.player.country : "Portugal";
  const currData = worldCountriesDatabase[country] || { currency: "EUR", symbol: "€" };
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currData.currency,
    maximumFractionDigits: 0
  }).format((Number(value) || 0) * getPriceFactor());
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function getTotalWealth() {
  const player = game.player;
  const propsVal = game.properties.reduce((sum, p) => sum + p.value, 0);
  const vehVal = game.vehicles.reduce((sum, v) => sum + v.value, 0);
  return player.bank + propsVal + vehVal - player.debt;
}

function addEvent(message, type = "neutral") {
  if (!game) return;
  game.events.unshift({ message, type, age: game.player.age });
  game.events = game.events.slice(0, 60);
}

function addFinanceEvent(message) {
  if (!game) return;
  game.financeHistory.unshift({ message, age: game.player.age });
  game.financeHistory = game.financeHistory.slice(0, 50);
}

function getHouseSVG(type) {
  if (type === "studio") {
    return `<svg viewBox="0 0 120 80" class="house-illustration"><rect x="30" y="25" width="60" height="45" rx="4" fill="#3b82f6"/><polygon points="25,25 60,8 95,25" fill="#1d4ed8"/><rect x="52" y="45" width="16" height="25" fill="#93c5fd"/><rect x="36" y="34" width="12" height="12" fill="#fde047"/></svg>`;
  }
  if (type === "apartment") {
    return `<svg viewBox="0 0 120 80" class="house-illustration"><rect x="25" y="12" width="70" height="58" rx="3" fill="#6366f1"/><rect x="35" y="20" width="14" height="12" fill="#fef08a"/><rect x="71" y="20" width="14" height="12" fill="#fef08a"/><rect x="35" y="38" width="14" height="12" fill="#fef08a"/><rect x="71" y="38" width="14" height="12" fill="#fef08a"/><rect x="52" y="52" width="16" height="18" fill="#c7d2fe"/></svg>`;
  }
  if (type === "house") {
    return `<svg viewBox="0 0 120 80" class="house-illustration"><rect x="18" y="30" width="84" height="40" rx="3" fill="#10b981"/><polygon points="12,30 60,8 108,30" fill="#047857"/><rect x="52" y="45" width="16" height="25" fill="#d1fae5"/><rect x="26" y="40" width="16" height="14" fill="#fef08a"/><rect x="78" y="40" width="16" height="14" fill="#fef08a"/></svg>`;
  }
  return `<svg viewBox="0 0 120 80" class="house-illustration"><rect x="10" y="28" width="100" height="42" rx="4" fill="#f59e0b"/><polygon points="5,28 60,5 115,28" fill="#b45309"/><rect x="50" y="42" width="20" height="28" fill="#fef3c7"/><rect x="20" y="36" width="18" height="14" fill="#fef08a"/><rect x="82" y="36" width="18" height="14" fill="#fef08a"/></svg>`;
}

function closeCustomModal() {
  $("customModal").classList.add("hidden");
}
