import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 8080;

// Security: Disable x-powered-by header
app.disable('x-powered-by');

// Security: Add HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

console.log(`Iniciando servidor na porta ${PORT}...`);
console.log(`Procurando arquivos em: ${distPath}`);

// Verifica se o build funcionou
if (fs.existsSync(distPath)) {
    console.log("SUCESSO: Pasta dist encontrada.");
    app.use(express.static(distPath));
    // SPA catch-all handler (Express 5 regex replacement for '*')
    app.get(/.*/, (req, res) => {
        res.sendFile(join(distPath, 'index.html'));
    });
} else {
    // SE O BUILD FALHOU, O SERVER SOBE COM UMA MENSAGEM DE ERRO
    // Isso evita o crash do Cloud Run e permite você ler o erro na tela.
    console.error("ERRO CRÍTICO: Pasta dist não existe!");
    // SPA catch-all handler (Express 5 regex replacement for '*')
    app.get(/.*/, (req, res) => {
        // Generic error message for production security
        res.status(503).send('Service Unavailable');
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ouvindo em 0.0.0.0:${PORT}`);
});
