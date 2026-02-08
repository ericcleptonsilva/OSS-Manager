import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// O Cloud Run sempre injeta a porta 8080 na variável PORT
const PORT = process.env.PORT || 8080;

// Log para você ver no console se o servidor realmente iniciou
console.log(`Iniciando servidor... PORT: ${PORT}`);

// Serve os arquivos da pasta 'dist' gerada pelo Vite
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback para SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

// AQUI ESTÁ O SEGREDO: Use '0.0.0.0' explicitamente
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escutando em http://0.0.0.0:${PORT}`);
});