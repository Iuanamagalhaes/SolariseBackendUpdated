const express = require("express");
const router = express.Router();
const {
  getDetailedGeneration,
  getPowerflowData,
  getPlantsList,
  getInvertersDetails,
  getPlantDetails,
  getStatMonth,
  getWarnings
} = require("../services/sems_service");
const { getDashboardData } = require("../services/dashboard_service");

// ✅ Geração detalhada
router.get("/generation", async (req, res) => {
  try {
    const { column } = req.query;
    const dados = await getDetailedGeneration(column || "Eday");
    res.json(dados);
  } catch (err) {
    console.error("generation error:", err);
    res.status(500).json({ error: "Falha ao obter geração", detail: String(err) });
  }
});

// ✅ Fluxo de energia
router.get("/powerflow", async (req, res) => {
  try {
    const data = await getPowerflowData();
    res.json(data);
  } catch (err) {
    console.error("powerflow error:", err);
    res.status(500).json({ error: "Falha ao obter fluxo de energia", detail: String(err) });
  }
});

// ✅ Lista de plantas
router.get("/plants", async (req, res) => {
  try {
    const data = await getPlantsList();
    res.json(data);
  } catch (err) {
    console.error("plants error:", err);
    res.status(500).json({ error: "Falha ao obter lista de plantas", detail: String(err) });
  }
});

// ✅ Detalhes dos inversores
router.get("/inverters", async (req, res) => {
  try {
    const data = await getInvertersDetails();
    res.json(data);
  } catch (err) {
    console.error("inverters error:", err);
    res.status(500).json({ error: "Falha ao obter detalhes dos inversores", detail: String(err) });
  }
});

// ✅ Detalhes da planta
router.get("/plant-details", async (req, res) => {
  try {
    const data = await getPlantDetails();
    res.json(data);
  } catch (err) {
    console.error("plant details error:", err);
    res.status(500).json({ error: "Falha ao obter detalhes da planta", detail: String(err) });
  }
});

// ✅ Estatísticas mensais
router.get("/stat-month", async (req, res) => {
  try {
    const data = await getStatMonth();
    res.json(data);
  } catch (err) {
    console.error("stat month error:", err);
    res.status(500).json({ error: "Falha ao obter estatísticas mensais", detail: String(err) });
  }
});

// ✅ Alertas / Warnings
router.get("/warnings", async (req, res) => {
  try {
    const data = await getWarnings();
    res.json(data);
  } catch (err) {
    console.error("warnings error:", err);
    res.status(500).json({ error: "Falha ao obter alertas", detail: String(err) });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const dados = await getDashboardData();
    res.json(dados);
  } catch (err) {
    console.error("dashboard error:", err);
    res.status(500).json({ error: "Falha ao montar dashboard", detail: String(err) });
  }
});

module.exports = router;
