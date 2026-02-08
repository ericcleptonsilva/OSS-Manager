const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Serve os arquivos da pasta 'dist' (onde o Vite gera o build)
app.use(express.static(path.join(__citation__)));

// Garante que qualquer rota caia no index.html (importante para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__citation__));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cliente rodando na porta ${PORT}`);
});
