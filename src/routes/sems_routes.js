const express = require("express");
const router = express.Router();
const { getDetailedConsumption } = require("../services/sems_service");
const { getDashboardData } = require("../services/dashboard_service");

// Endpoint original
router.get("/generation", async (req, res) => {
  try {
    const { column } = req.query;
    const dados = await getDetailedConsumption(column || "Eday");
    res.json(dados);
  } catch (err) {
    console.error("consumption error:", err);
    res.status(500).json({ error: "Falha ao obter consumo", detail: String(err) });
  }
});

// Novo endpoint de dashboard consolidado
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