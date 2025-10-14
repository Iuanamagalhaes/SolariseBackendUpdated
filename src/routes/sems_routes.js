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

// Geração detalhada
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

// Fluxo de energia (erro)
router.get("/powerflow", async (req, res) => {
  try {
    const { plantId } = req.query;
    const data = await getPowerflowData(plantId);
    res.json(data);
  } catch (err) {
    console.error("powerflow error:", err);
    res.status(500).json({ error: "Falha ao obter fluxo de energia", detail: String(err) });
  }
});

// Lista de plantas (funciona) 
router.get("/plants", async (req, res) => {
  try {
    const data = await getPlantsList();
    res.json(data);
  } catch (err) {
    console.error("plants error:", err);
    res.status(500).json({ error: "Falha ao obter lista de plantas", detail: String(err) });
  }
});

// Detalhes dos inversores (erro)
router.get("/inverters", async (req, res) => {
  try {
    const { plantId } = req.query;
    const data = await getInvertersDetails(plantId);
    res.json(data);
  } catch (err) {
    console.error("inverters error:", err);
    res.status(500).json({ error: "Falha ao obter inversores", detail: String(err) });
  }
});

// Detalhes da planta (erro)
router.get("/plant-details", async (req, res) => {
  try {
    const { plantId } = req.query;
    const data = await getPlantDetails(plantId);
    res.json(data);
  } catch (err) {
    console.error("plant details error:", err);
    res.status(500).json({ error: "Falha ao obter detalhes da planta", detail: String(err) });
  }
});

// Estatísticas mensais (funciona)
router.get("/stat-month", async (req, res) => {
  try {
    const { plantId } = req.query;
    const data = await getStatMonth(plantId);
    res.json(data);
  } catch (err) {
    console.error("stat month error:", err);
    res.status(500).json({ error: "Falha ao obter estatísticas mensais", detail: String(err) });
  }
});

// Alertas (funcioona, mas não retorna nada)
router.get("/warnings", async (req, res) => {
  try {
    const { plantId } = req.query;
    const data = await getWarnings(plantId);
    res.json(data);
  } catch (err) {
    console.error("warnings error:", err);
    res.status(500).json({ error: "Falha ao obter alertas", detail: String(err) });
  }
});

// Dashboard consolidado
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
