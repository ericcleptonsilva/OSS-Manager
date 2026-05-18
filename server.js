import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 8080;

// --- SECURITY HEADERS ---
app.use((req, res, next) => {
  // Previne clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Previne MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Força HTTPS por 1 ano
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Limita referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restringe permissões do browser
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // unsafe-inline necessário para Vite bundled JS
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://parseapi.back4app.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'"
  ].join('; '));
  next();
});

console.log(`Iniciando servidor na porta ${PORT}...`);
console.log(`Procurando arquivos em: ${distPath}`);

// Verifica se o build funcionou
if (fs.existsSync(distPath)) {
    console.log("SUCESSO: Pasta dist encontrada.");
    app.use(express.static(distPath));
    // Express 5 requires regex for catch-all routes instead of string '*'
    app.get(/.*/, (req, res) => {
        res.sendFile(join(distPath, 'index.html'));
    });
} else {
    // SE O BUILD FALHOU, O SERVER SOBE COM UMA MENSAGEM DE ERRO
    // Isso evita o crash do Cloud Run e permite você ler o erro na tela.
    console.error("ERRO CRÍTICO: Pasta dist não existe!");
    // Express 5 requires regex for catch-all routes instead of string '*'
    app.get(/.*/, (req, res) => {
        res.status(500).send(`
            <h1>Erro de Build</h1>
            <p>O servidor subiu, mas a pasta <b>dist</b> não foi encontrada.</p>
            <p>Verifique se o comando 'npm run build' rodou corretamente no Dockerfile.</p>
        `);
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ouvindo em 0.0.0.0:${PORT}`);
});