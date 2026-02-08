const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Serve os arquivos da pasta 'dist' (padrão do Vite)
app.use(express.static(path.join(__dirname, 'dist')));

// Redireciona todas as rotas para o index.html (essencial para SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
