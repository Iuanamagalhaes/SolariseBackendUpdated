const {
  crosslogin,
  callApi,
  getInverterDataByColumn
} = require("./sems_client");

const { parseColumnTimeseries, summarize } = require("../utils/parse");
require("dotenv").config();

// Inversor fixo (ajuste se quiser pegar dinamicamente)
const FIXED_SN = "5010KETU229W6177";

// Função utilitária
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

// Geração detalhada
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

// Fluxo de energia (bateria, rede, consumo)
async function getPowerflowData(powerStationId) {
  const { token, apiBase } = await ensureSession();
  const payload = { powerStationId };
  const data = await callApi(apiBase, token, "v2/PowerStation/GetPowerflow", payload);
  return data;
}

// Lista de plantas (PlantsListCall)
async function getPlantsList() {
  const { token, apiBase } = await ensureSession();
  return await callApi(apiBase, token, "PowerStationMonitor/QueryPowerStationMonitor");
}

// Detalhes dos inversores
async function getInvertersDetails(powerStationId) {
  const { token, apiBase } = await ensureSession();
  const payload = { powerStationId };
  return await callApi(apiBase, token, "PowerStation/GetInverterAllPoint", payload);
}

// Detalhes da planta
async function getPlantDetails(powerStationId) {
  const { token, apiBase } = await ensureSession();
  const payload = { powerStationId };
  return await callApi(apiBase, token, "PowerStation/GetPlantDetailByPowerstationId", payload);
}

// Estatísticas mensais
async function getStatMonth(powerStationId) {
  const { token, apiBase } = await ensureSession();
  const payload = { powerStationId };
  return await callApi(apiBase, token, "BigScreen/StatMonth12", payload);
}

// Alertas
async function getWarnings(powerStationId) {
  const { token, apiBase } = await ensureSession();
  const payload = { powerStationId };
  return await callApi(apiBase, token, "SmartOperateMaintenance/GetPowerStationWariningInfoByMultiCondition", payload);
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
