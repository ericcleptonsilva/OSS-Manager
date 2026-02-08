import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 8080;

// Log de diagnóstico para o Cloud Logging
console.log(`Verificando pasta dist em: ${distPath}`);
if (fs.existsSync(distPath)) {
  console.log("Pasta dist encontrada com sucesso!");
} else {
  console.error("ERRO: Pasta dist NÃO encontrada. O build do Vite pode ter falhado ou o caminho está errado.");
}

app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Arquivo index.html não encontrado na pasta dist.");
  }
});

// ESCUTAR EM 0.0.0.0 É OBRIGATÓRIO
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ouvindo na porta ${PORT} no host 0.0.0.0`);
});