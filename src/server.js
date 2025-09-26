// Import do arquivo 'app.js'.
const app = require("./app");

// Porta do servidor definida no .env
const PORT = process.env.PORT || 4000;

// Iniciando o servidor e fazendo ele ficar aguardando requisições
app.listen(PORT, () => {
console.log(`Servidor rodando na porta ${PORT}`);
});