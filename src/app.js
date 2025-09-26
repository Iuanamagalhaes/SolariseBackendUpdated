require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");

// Importações de rotas e serviços
const semsRoutes = require("./routes/sems_routes");

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Parser JSON com suporte a rawBody (necessário para Alexa)
app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      req.rawBody = buf;
    },
    limit: "1mb",
  })
);

// Middlewares globais
app.use(helmet());
app.use(express.json());

// Configuração CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/sems", semsRoutes);

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

app.get("/test", (_req, res) => {
  res.status(200).send("API está funcionando!");
});

// Limitador de requisições (60 req/min)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
});
app.use("/api/", limiter);

module.exports = app;
