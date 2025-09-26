const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

function parseColumnTimeseries(respJson, columnName) {
  if (!respJson || typeof respJson !== "object") return [];

  let items = [];
  const dataObj = respJson.data;

  if (dataObj && typeof dataObj === "object") {
    for (const key of ["column1", "column2", "column3", "items", "list", "datas", "result"]) {
      if (Array.isArray(dataObj[key])) {
        items = dataObj[key];
        break;
      }
    }
  }

  if (!items.length) {
    for (const key of ["data", "items", "list", "result", "datas"]) {
      if (Array.isArray(respJson[key])) {
        items = respJson[key];
        break;
      }
    }
  }

  if (!items.length) return [];

  const out = [];

  for (const it of items) {
    if (!it || typeof it !== "object") continue;

    const t = it.time || it.date || it.collectTime || it.cTime || it.tm || (it.k ?? null);
    let v = null;
    if (columnName && (columnName in it)) v = it[columnName];
    else v = it.value ?? it.v ?? it.val ?? it.column ?? null;

    if (t == null || v == null) continue;

    let d = dayjs(t);
    if (!d.isValid()) d = dayjs(t, "DD/MM/YYYY HH:mm:ss", true);
    if (!d.isValid()) d = dayjs(t, "MM/DD/YYYY HH:mm:ss", true);
    if (!d.isValid()) continue;

    const num = Number(String(v).replace(",", "."));
    if (Number.isNaN(num)) continue;

    out.push({ time: d.toISOString(), value: num });
  }

  return out;
}

// Agregados: energy_kwh, peak_kw e horário do pico
function summarize(series, other = {}) {
  if (!Array.isArray(series) || !series.length) {
    return { energy_kwh: 0, peak_kw: 0, peak_time: null, ...other };
  }

  const values = series.map((p) => p.value);
  const peak_kw = Math.max(...values);
  const peak_idx = values.indexOf(peak_kw);
  const peak_time = series[peak_idx]?.time ?? null;
  const energy_kwh = other.column === "Eday" ? series.at(-1).value : null;

  return { energy_kwh, peak_kw, peak_time, ...other };
}

module.exports = { 
  parseColumnTimeseries, 
  summarize 
};
