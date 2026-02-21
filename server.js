import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 8080;

// Security Headers Middleware
app.use((req, res, next) => {
    // Prevent Clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME Type Sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Control Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Enable XSS Filtering (Legacy Browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Enforce HTTPS (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

console.log(`Iniciando servidor na porta ${PORT}...`);
console.log(`Procurando arquivos em: ${distPath}`);

// Verifica se o build funcionou
if (fs.existsSync(distPath)) {
    console.log("SUCESSO: Pasta dist encontrada.");
    app.use(express.static(distPath));
    // SPA Fallback (Express 5 regex for catch-all)
    app.get(/.*/, (req, res) => {
        res.sendFile(join(distPath, 'index.html'));
    });
} else {
    // SE O BUILD FALHOU, O SERVER SOBE COM UMA MENSAGEM DE ERRO
    // Isso evita o crash do Cloud Run e permite você ler o erro na tela.
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