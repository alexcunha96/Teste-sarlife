"use strict";

/* =========================================
   STARLIFE · DADOS E ESTADO GLOBAL — constantes, listas e variáveis partilhadas
========================================= */

const SAVE_KEY = "starlife_v18_bitlife_perfect";

let game = null;

let initialFamily = [];

let toastTimer = null;

let currentAvatarIndex = 1;

const APPEARANCE_OPTIONS = {
  eyes: [
    { id: "default", label: "Olhos Normais" },
    { id: "happy", label: "Olhos Alegres" },
    { id: "wink", label: "Olhos Piscar" },
    { id: "squint", label: "Olhos Sérios" }
  ],
  skin: [
    { id: "#fbe3cf", label: "Pele Clara" },
    { id: "#f2c29b", label: "Pele Média Clara" },
    { id: "#d89b6c", label: "Pele Bronzeada" },
    { id: "#b06d3b", label: "Pele Morena" },
    { id: "#7c4722", label: "Pele Escura" }
  ],
  brows: [
    { id: "default", label: "Sobrancelhas Clássicas" },
    { id: "raisedExcited", label: "Sobrancelhas Erguidas" },
    { id: "frownNatural", label: "Sobrancelhas Franzidas" },
    { id: "sadConcerned", label: "Sobrancelhas Suaves" }
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
    { id: "none", label: "Sem Acessório" },
    { id: "star", label: "Óculos Redondos" },
    { id: "sleeve", label: "Óculos Retangulares" },
    { id: "tribal", label: "Óculos Escuros" }
  ]
};

const APPEARANCE_CATEGORIES = [
  { key: "eyes", label: "Olhos" },
  { key: "skin", label: "Pele" },
  { key: "brows", label: "Sobrancelhas" },
  { key: "facialHair", label: "Barba" },
  { key: "hair", label: "Cabelo" },
  { key: "outfit", label: "Roupa" },
  { key: "tattoo", label: "Acessório" }
];

// Paletas usadas para que cada "#N" do seletor de avatar seja realmente diferente.
const AVATAR_PRESET_PALETTE = {
  maleHair: ["short", "medium", "buzz", "ponytail"],
  femaleHair: ["long", "ponytail", "medium", "long"],
  hairColors: ["#3b2618", "#1c1c1c", "#7a4a2a", "#c9a14a", "#5a3a22", "#2c1b10"],
  skins: ["#f2c29b", "#fbe3cf", "#d89b6c", "#b06d3b", "#7c4722"],
  mouths: ["default", "smile", "serious"],
  maleOutfit: ["#3b82f6", "#ef4444", "#22c55e", "#a855f7", "#f59e0b"],
  femaleOutfit: ["#ec4899", "#a855f7", "#3b82f6", "#f59e0b", "#14b8a6"]
};

const VALID_MOUTHS = ["default", "smile", "twinkle", "serious", "concerned", "sad", "eating", "grimace", "disbelief", "screamFace", "tongue", "vomit"];

// Base de Países Mundiais com Moeda, Bancos e Cidades
// priceFactor: quanto vale 1 € (valor base do jogo) na moeda local, para os preços fazerem sentido.
const worldCountriesDatabase = {
  "Portugal": {
    currency: "EUR", symbol: "€", priceFactor: 1,
    banks: [
      { id: "atlantico", name: "Banco Atlântico", interestRate: 0.045, desc: "Taxas competitivas para crédito habitação." },
      { id: "caixa", name: "Caixa Popular", interestRate: 0.052, desc: "Aprovação facilitada para jovens." },
      { id: "novafinanca", name: "Nova Finança Digital", interestRate: 0.038, desc: "Juros baixos para clientes com boa poupança." }
    ],
    cities: ["Lisboa", "Porto", "Coimbra", "Braga", "Faro", "Funchal", "Aveiro", "Viseu"]
  },
  "Brasil": {
    currency: "BRL", symbol: "R$", priceFactor: 6,
    banks: [
      { id: "nubank", name: "NuBank Brasil", interestRate: 0.095, desc: "Cartão sem anuidade e conta digital." },
      { id: "itau", name: "Itaú Unibanco", interestRate: 0.110, desc: "Tradição e solidez no crédito imobiliário." },
      { id: "bancodobrasil", name: "Banco do Brasil", interestRate: 0.100, desc: "Crédito facilitado para cidadãos." }
    ],
    cities: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Curitiba", "Brasília", "Fortaleza", "Manaus"]
  },
  "Espanha": {
    currency: "EUR", symbol: "€", priceFactor: 1,
    banks: [
      { id: "santander", name: "Banco Santander", interestRate: 0.042, desc: "Líder ibérico em financiamento." },
      { id: "bbva", name: "BBVA España", interestRate: 0.046, desc: "Inovação e crédito habitação." }
    ],
    cities: ["Madrid", "Barcelona", "Valência", "Sevilha", "Málaga", "Bilbau", "Saragoça"]
  },
  "França": {
    currency: "EUR", symbol: "€", priceFactor: 1,
    banks: [
      { id: "bnp", name: "BNP Paribas", interestRate: 0.039, desc: "Soluções bancárias de alto nível." },
      { id: "societegenerale", name: "Société Générale", interestRate: 0.041, desc: "Crédito eficiente." }
    ],
    cities: ["Paris", "Lyon", "Marselha", "Nice", "Toulouse", "Bordéus", "Nantes"]
  },
  "Reino Unido": {
    currency: "GBP", symbol: "£", priceFactor: 0.85,
    banks: [
      { id: "barclays", name: "Barclays UK", interestRate: 0.048, desc: "Banca tradicional britânica." },
      { id: "hsbc", name: "HSBC London", interestRate: 0.045, desc: "Serviços financeiros globais." }
    ],
    cities: ["Londres", "Manchester", "Birmingham", "Edimburgo", "Glasgow", "Liverpool", "Bristol"]
  },
  "Estados Unidos": {
    currency: "USD", symbol: "$", priceFactor: 1.1,
    banks: [
      { id: "chase", name: "Chase Bank USA", interestRate: 0.055, desc: "Serviços financeiros a nível nacional." },
      { id: "bofa", name: "Bank of America", interestRate: 0.058, desc: "Crédito seguro e contas de investimento." }
    ],
    cities: ["Nova Iorque", "Los Angeles", "Chicago", "Miami", "San Francisco", "Las Vegas", "Boston", "Seattle"]
  },
  "Japão": {
    currency: "JPY", symbol: "¥", priceFactor: 160,
    banks: [
      { id: "mufg", name: "MUFG Bank Tokyo", interestRate: 0.015, desc: "Banca nacional com juros baixos." },
      { id: "smbc", name: "Sumitomo Mitsui", interestRate: 0.018, desc: "Instituição financeira japonesa de confiança." }
    ],
    cities: ["Tóquio", "Osaka", "Quioto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka"]
  }
};

const sampleMaleNames = ["João", "Pedro", "Miguel", "Francisco", "Tiago", "Diogo", "André", "Rafael", "Gonçalo", "Martim"];

const sampleFemaleNames = ["Maria", "Ana", "Beatriz", "Inês", "Sofia", "Matilde", "Leonor", "Carolina", "Mariana", "Margarida"];

const streetNames = ["Rua das Flores", "Avenida da Liberdade", "Travessa do Sol", "Alameda dos Oceanos", "Rua da Bela Vista", "Praceta das Oliveiras", "Avenida Central", "Rua do Miradouro"];

const propertyTemplates = [
  { title: "Estúdio T0 Acolhedor", type: "studio", buyPrice: 75000, rentMonthly: 480, happiness: 4 },
  { title: "Apartamento T1 Moderno", type: "apartment", buyPrice: 135000, rentMonthly: 720, happiness: 8 },
  { title: "Apartamento T2 Familiar", type: "apartment", buyPrice: 195000, rentMonthly: 950, happiness: 12 },
  { title: "Moradia Geminada T3", type: "house", buyPrice: 310000, rentMonthly: 1350, happiness: 18 },
  { title: "Moradia Isolada com Jardim", type: "house", buyPrice: 480000, rentMonthly: 1900, happiness: 24 },
  { title: "Mansão de Luxo Vista Mar", type: "mansion", buyPrice: 950000, rentMonthly: 3500, happiness: 35 }
];

const licenseRules = {
  bikeAM: { name: "Carta AM (Ciclomotores até 50cc)", minAge: 16, cost: 250 },
  bikeA1: { name: "Carta A1 (Motos até 125cc / 11kW)", minAge: 16, cost: 380 },
  bikeA2: { name: "Carta A2 (Motos até 35kW)", minAge: 18, cost: 500 },
  bikeA:  { name: "Carta A (Motos Pesadas)", minAge: 24, cost: 650 },
  carB:   { name: "Carta B (Carros Ligeiros)", minAge: 18, cost: 650 }
};

const availableCars = [
  { name: "Yaris City", brand: "Toyo", price: 2500, annualCost: 450, reqLicense: "carB" },
  { name: "Golf GTI", brand: "Volks", price: 12000, annualCost: 750, reqLicense: "carB" },
  { name: "Série 3 Desportivo", brand: "BWM", price: 28000, annualCost: 1300, reqLicense: "carB" }
];

const availableBikes = [
  { name: "Scooter Urban 50", brand: "Yamah", cc: "50cc", price: 1800, annualCost: 200, reqLicense: "bikeAM" },
  { name: "CBR 125R", brand: "Hona", cc: "125cc", price: 3400, annualCost: 320, reqLicense: "bikeA1" },
  { name: "Ninja 400 Sport", brand: "Kawas", cc: "400cc", price: 6200, annualCost: 480, reqLicense: "bikeA2" },
  { name: "Monster 821 Naked", brand: "Ducati", cc: "821cc", price: 10500, annualCost: 700, reqLicense: "bikeA2" },
  { name: "R1 Superbike", brand: "Yamah", cc: "1000cc", price: 17500, annualCost: 1100, reqLicense: "bikeA" }
];

const educationStages = [
  { name: "Creche", start: 0, end: 2, level: 0 },
  { name: "Jardim de infância", start: 3, end: 5, level: 0 },
  { name: "1.º Ciclo do Ensino Básico", start: 6, end: 9, level: 1 },
  { name: "2.º Ciclo do Ensino Básico", start: 10, end: 11, level: 1 },
  { name: "3.º Ciclo do Ensino Básico", start: 12, end: 14, level: 1 },
  { name: "Ensino Secundário", start: 15, end: 17, level: 2 }
];

const universityCourses = [
  { name: "Medicina", cost: 3500, duration: 6, salary: 42000, job: "Médico/a" },
  { name: "Direito", cost: 2500, duration: 4, salary: 35000, job: "Advogado/a" },
  { name: "Engenharia", cost: 2800, duration: 5, salary: 32000, job: "Engenheiro/a" },
  { name: "Gestão", cost: 2300, duration: 3, salary: 30000, job: "Gestor/a" }
];

const tombstoneQuotes = [
  "Viveu intensamente, partiu em paz.",
  "Deixou saudades em todos os que cruzaram o seu caminho.",
  "Descansa em paz. A jornada foi longa e bela.",
  "Amou, riu, aprendeu e agora descansa.",
  "Uma lenda nunca morre, apenas descansa."
];

// minAge: idade mínima para aparecer | weight(idade): peso relativo de sair sorteada
// (doenças graves são raras nos jovens e ficam mais prováveis com a idade).
const commonIllnesses = [
  { name: "Gripe Sazonal", severity: "Baixa", cost: 50, healthImpact: 4, specialty: "familyDoctor",
    symptom: "febre, tosse e dores no corpo", minAge: 3, weight: () => 40 },
  { name: "Entorse no Tornozelo", severity: "Baixa", cost: 120, healthImpact: 6, specialty: "orthopedics",
    symptom: "dor e inchaço no tornozelo", minAge: 6, weight: () => 25 },
  { name: "Hipertensão Arterial", severity: "Média", cost: 350, healthImpact: 7, specialty: "cardiology",
    symptom: "dores de cabeça e tonturas frequentes", minAge: 30, weight: age => 2 + (age - 30) * 0.6 },
  { name: "Depressão Crónica", severity: "Média", cost: 500, healthImpact: 8, specialty: "psychiatry",
    symptom: "tristeza persistente e falta de energia", minAge: 14, weight: () => 10 },
  { name: "Cancro em Estádio Inicial", severity: "Alta", cost: 6000, healthImpact: 30, specialty: "oncology",
    symptom: "cansaço extremo, perda de peso e um nódulo suspeito", minAge: 25, weight: age => (age < 40 ? 0.5 : (age - 35) * 0.35) }
];

const specialtyLabels = {
  familyDoctor: "Médico de Família",
  cardiology: "Cardiologia",
  orthopedics: "Ortopedia",
  psychiatry: "Psiquiatria",
  oncology: "Oncologia"
};

const lifeEventsPool = [
  { minAge: 0, maxAge: 3, text: "Deste os teus primeiros passos na sala de estar.", options: [{ text: "Sorrir", effect: () => { game.player.happiness = clamp(game.player.happiness + 5); addEvent("Os pais celebraram.", "positive"); } }] },
  { minAge: 6, maxAge: 11, text: "Participaste numa atividade desportiva na escola.", options: [{ text: "Dar o máximo", effect: () => { game.player.health = clamp(game.player.health + 3); addEvent("Ganhaste uma medalha!", "positive"); } }] },
  { minAge: 12, maxAge: 17, text: "Tiveste um teste difícil de História e tiraste excelente nota.", options: [{ text: "Celebrar", effect: () => { game.player.intelligence = clamp(game.player.intelligence + 2); addEvent("O esforço valeu a pena.", "positive"); } }] },
  { minAge: 18, maxAge: 65, text: "Fizeste horas extra no trabalho.", options: [{ text: "Aceitar", effect: () => { game.player.bank += 180; addFinanceEvent("Ganhaste bónus extra."); addEvent("Recebeste um bónus.", "positive"); } }] }
];
