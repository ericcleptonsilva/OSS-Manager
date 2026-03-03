import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');

const app = express();

// Security: Disable x-powered-by header to not expose Express
app.disable('x-powered-by');

// Security: Enforce essential security headers via middleware
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

const PORT = process.env.PORT || 8080;

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
    // Isso evita o crash do Cloud Run.
    console.error("ERRO CRÍTICO: Pasta dist não existe!");
    // Express 5 requires regex for catch-all routes instead of string '*'
    app.get(/.*/, (req, res) => {
        // Security: Send a generic 500 error message without exposing build paths or Dockerfile details
        res.status(500).send(`
            <h1>Internal Server Error</h1>
            <p>The application encountered an error and could not be loaded.</p>
        `);
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ouvindo em 0.0.0.0:${PORT}`);
});