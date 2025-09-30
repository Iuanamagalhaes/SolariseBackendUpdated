const axios = require("axios");
const { getDetailedConsumption } = require("./sems_service");

const SOLARISE_BASE = "https://solarise-backend.onrender.com/v1/solarise";
const TARIFA_R_KWH = 0.85; 

async function getDashboardData() {
  // 1. Geração solar
  const generation = await getDetailedConsumption("Eday");
  const geradoHoje = generation?.resumo?.energy_kwh || 0;

  // 2. Consumo diário
  const consumoResp = await axios.get(`${SOLARISE_BASE}/consumoDiario`);
  const consumoHoje = consumoResp.data.consumo.find(c =>
    new Date(c.dia).toDateString() === new Date().toDateString()
  )?.consumo_kwh || 0;

  // 3. Dispositivos
  const dispositivosResp = await axios.get(`${SOLARISE_BASE}/dispositivos`);
  const dispositivos = dispositivosResp.data.dispositivo || [];

  // 4. Ranking dispositivos ligados
  const ranking = dispositivos
    .filter(d => d.status === 1)
    .map(d => ({
      id: d.id,
      nome: d.nome,
      potencia: d.potencia_watts,
      foto: d.foto_url,
    }))
    .sort((a, b) => b.potencia - a.potencia);

  // 5. Cálculos
  const saldo = geradoHoje - consumoHoje;
  const economiaReais = saldo * TARIFA_R_KWH;

  return {
    resumo: {
      geradoHoje: geradoHoje.toFixed(2),
      consumidoHoje: consumoHoje.toFixed(2),
      saldo: saldo.toFixed(2),
      economiaReais: economiaReais.toFixed(2),
    },
    rankingDispositivos: ranking,
    seriesGeracao: generation.series,
    seriesConsumo: consumoResp.data.consumo,
  };
}

module.exports = { getDashboardData };
