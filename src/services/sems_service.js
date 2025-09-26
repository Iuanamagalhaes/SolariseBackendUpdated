const {
  crosslogin,
  getInverterDataByColumn
} = require("./sems_client");
const { parseColumnTimeseries, summarize } = require("../utils/parse");
require("dotenv").config();

// Configurações fixas
const FIXED_SN = "5010KETU229W6177"; // inversor

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Guarda token + apiBase em memória para não logar em todas as requisições
let sessionCache = {
  token: null,
  apiBase: null,
  obtainedAt: 0,
  ttlMs: 5 * 60 * 1000,
};

async function ensureSession() {
  if (
    sessionCache.token &&
    Date.now() - sessionCache.obtainedAt < sessionCache.ttlMs
  ) {
    return sessionCache;
  }

  const loginRegion = process.env.SEMS_LOGIN_REGION || "us";
  const { token, apiBase } = await crosslogin(
    process.env.SEMS_ACCOUNT,
    process.env.SEMS_PASSWORD,
    loginRegion
  );

  sessionCache = {
    token,
    apiBase,
    obtainedAt: Date.now(),
    ttlMs: 5 * 60 * 1000,
  };
  return sessionCache;
}

// Consumo detalhado (por coluna) // funciona
async function getDetailedConsumption(column = "Eday") {
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


module.exports = {
  ensureSession,
  getDetailedConsumption
};
