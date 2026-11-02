import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 8080;

// Oculta cabeçalho de tecnologia do Express (Evita Information Disclosure / Fingerprinting)
app.disable('x-powered-by');

// --- RATE LIMITING DEFENSIVO (Sliding Window In-Memory) ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 180; // Limite de 180 requisições por minuto por IP
const ipRequestMap = new Map();

// Limpeza periódica para prevenir vazamento de memória (executa a cada 5 minutos)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestMap.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW_MS) {
      ipRequestMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);
cleanupInterval.unref(); // Não impede o término do processo se necessário

const rateLimiter = (req, res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let record = ipRequestMap.get(clientIp);
  if (!record || (now - record.resetTime > RATE_LIMIT_WINDOW_MS)) {
    record = { count: 1, resetTime: now };
    ipRequestMap.set(clientIp, record);
  } else {
    record.count++;
  }

  res.setHeader('RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count));

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime + RATE_LIMIT_WINDOW_MS - now) / 1000));
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="utf-8"><title>429 - Limite Excedido</title></head>
      <body style="font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:50px;background:#0f172a;color:#f8fafc;">
        <h2>429 — Muitas Requisições</h2>
        <p>Limite defensivo de requisições atingido para este IP.</p>
        <p>Por favor, aguarde <b>${retryAfterSeconds} segundos</b> antes de recarregar.</p>
      </body>
      </html>
    `);
  }
  next();
};

app.use(rateLimiter);

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
  // Content Security Policy restrito
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // necessário para Vite bundled JS
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://parseapi.back4app.com",
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
    console.error("ERRO CRÍTICO: Pasta dist não existe!");
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
