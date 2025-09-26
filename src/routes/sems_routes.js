// src/routes/sems_routes.js
const express = require("express");
const router = express.Router();
const {
  getDetailedConsumption,
} = require("../services/sems_service");


// GET /api/sems/consumption?column=Eday&date=YYYY-MM-DD
router.get("/generation", async (req, res) => {
  try {
    const { column, date } = req.query;
    const dados = await getDetailedConsumption(column || "Eday", date);
    res.json(dados);
  } catch (err) {
    console.error("consumption error:", err);
    res.status(500).json({
      error: "Falha ao obter consumo",
      detail: String(err?.message || err),
    });
  }
});

module.exports = router;
