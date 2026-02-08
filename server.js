import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve os arquivos da pasta 'dist' gerada pelo comando 'vite build'
app.use(express.static(join(__dirname, 'dist')));

// Redireciona rotas para o index.html (essencial para React Router)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ESCUTAR EM 0.0.0.0 É OBRIGATÓRIO PARA O CLOUD RUN
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});