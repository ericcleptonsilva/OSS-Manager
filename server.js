const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Log para debug no Cloud Logging
console.log("Iniciando servidor...");

// Caminho absoluto para a pasta dist
const distPath = path.join(__dirname, 'dist');
console.log("Servindo arquivos de:", distPath);

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// IMPORTANTE: Escutar em 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aplicação online na porta ${PORT}`);
});
