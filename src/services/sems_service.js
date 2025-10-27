const {
  crosslogin,
  callApi,
  getInverterDataByColumn
} = require("./sems_client");

const { parseColumnTimeseries, summarize } = require("../utils/parse");
require("dotenv").config();

// IDs fixos
const FIXED_SN = "53600ERN238W0001"; // inversor
const FIXED_PLANT_ID = "7f9af1fc-3a9a-4779-a4c0-ca6ec87bd93a"; // planta

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Cache de sessão
let sessionCache = {
  token: null,
  apiBase: null,
  obtainedAt: 0,
  ttlMs: 5 * 60 * 1000,
};

async function ensureSession() {
  if (sessionCache.token && Date.now() - sessionCache.obtainedAt < sessionCache.ttlMs) {
    return sessionCache;
  }

  const loginRegion = process.env.SEMS_LOGIN_REGION || "us";
  const { token, apiBase } = await crosslogin(
    process.env.SEMS_ACCOUNT,
    process.env.SEMS_PASSWORD,
    loginRegion
  );

  sessionCache = { token, apiBase, obtainedAt: Date.now(), ttlMs: 5 * 60 * 1000 };
  return sessionCache;
}

// ⚡ Geração detalhada
async function getDetailedGeneration(column = "Eday") {
  const { token, apiBase } = await ensureSession();
  const dateStr = todayStr() + " 00:00:00";

  const raw = await getInverterDataByColumn({
    token,
    invId: FIXED_SN,
    column,
    date: dateStr,
    apiBase,
  });

  const series = parseColumnTimeseries(raw, column);
  const resumo = summarize(series, { column });
  return { series, resumo, rawHint: raw?.translationCode ?? raw?.code ?? null };
}

// ⚡ Fluxo de energia (funciona)
async function getPowerflowData() {
  const { token, apiBase } = await ensureSession();
  const payload = { powerStationId: FIXED_PLANT_ID };
  return await callApi(apiBase, token, "v2/PowerStation/GetPowerflow", payload);
}

// 🌿 Lista de plantas (funciona)
async function getPlantsList() {
  const { token, apiBase } = await ensureSession();
  return await callApi(apiBase, token, "PowerStationMonitor/QueryPowerStationMonitor");
}

// ⚙️ Detalhes dos inversores (corrigido)
async function getInvertersDetails() {
  const { token, apiBase } = await ensureSession();
  const payload = { stationId: FIXED_PLANT_ID }; // 👈 O campo correto é "stationId"
  return await callApi(apiBase, token, "v3/PowerStation/GetInverterAllPoint", payload);
}

// 🏠 Detalhes da planta (corrigido)
async function getPlantDetails() {
  const { token, apiBase } = await ensureSession();
  const payload = { stationId: FIXED_PLANT_ID }; // 👈 Campo certo também é "stationId"
  return await callApi(apiBase, token, "v3/PowerStation/GetPlantDetailByPowerstationId", payload);
}

// 📈 Estatísticas mensais (funciona)
async function getStatMonth() {
  const { token, apiBase } = await ensureSession();
  const payload = { stationId: FIXED_PLANT_ID };
  return await callApi(apiBase, token, "BigScreen/StatMonth12", payload);
}

// 🚨 Alertas (funciona, mas pode não ter alertas ativos)
async function getWarnings() {
  const { token, apiBase } = await ensureSession();
  const payload = { powerStationId: FIXED_PLANT_ID };
  return await callApi(
    apiBase,
    token,
    "SmartOperateMaintenance/GetPowerStationWariningInfoByMultiCondition",
    payload
  );
}

module.exports = {
  ensureSession,
  getDetailedGeneration,
  getPowerflowData,
  getPlantsList,
  getInvertersDetails,
  getPlantDetails,
  getStatMonth,
  getWarnings
};
