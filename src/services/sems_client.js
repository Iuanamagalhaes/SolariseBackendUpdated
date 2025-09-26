const axios = require("axios");
const { Buffer } = require("buffer");

const LOGIN_BASE = {
  us: "https://us.semsportal.com",
  eu: "https://eu.semsportal.com",
};

// Token inicial (antes do login)
function initialToken() {
  const obj = {
    uid: "",
    timestamp: 0,
    token: "",
    client: "web",
    version: "",
    language: "en",
  };
  return Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");
}

async function crosslogin(account, pwd, loginRegion = "us") {
  const base = LOGIN_BASE[loginRegion] || LOGIN_BASE.us;
  const headers = {
    Token: initialToken(),
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  const payload = { account, pwd, agreement_agreement: 0, is_local: false };

  const tries = [`${base}/api/v2/common/crosslogin`];

  let lastErr = null;
  for (const url of tries) {
    try {
      const resp = await axios.post(url, payload, { headers, timeout: 20000 });
      if (resp && resp.data && (resp.data.code === 0 || resp.data.hasError === false)) {
        const data = resp.data.data || resp.data;
        const apiCandidate = (resp.data.data && resp.data.data.api) || resp.data.api || null;

        const dataStr = JSON.stringify(resp.data.data ?? resp.data);
        const tokenBase64 = Buffer.from(dataStr, "utf-8").toString("base64");

        const apiBase = apiCandidate ? String(apiCandidate) : `${base}/api/`;

        return { token: tokenBase64, apiBase, raw: resp.data };
      } else {
        lastErr = resp.data;
      }
    } catch (err) {
      lastErr = err?.response?.data || err?.message || err;
    }
  }

  throw new Error(`Crosslogin falhou: ${JSON.stringify(lastErr)}`);
}

async function callApi(apiBase, token, path, payload = {}) {
  const base = apiBase.endsWith("/") ? apiBase : apiBase + "/";
  const url = `${base}${path}`;

  const headers = {
    Token: token,
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  const resp = await axios.post(url, payload, { headers, timeout: 20000 });
  return resp.data;
}

async function getInverterDataByColumn({ token, invId, column, date, apiBase }) {
  const payload = { date, column, id: invId };
  return await callApi(apiBase, token, "PowerStationMonitor/GetInverterDataByColumn", payload);
}

module.exports = {
  initialToken,
  crosslogin,
  callApi,
  getInverterDataByColumn
};
