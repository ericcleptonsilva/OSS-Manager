FROM node:20

WORKDIR /app

# 1. Instala dependências
COPY package*.json ./
RUN npm install

# 2. Copia o código e faz o build (Gera a pasta 'dist')
COPY . .
RUN npm run build

# 3. Instala o servidor estático profissional 'serve'
RUN npm install -g serve

# 4. Expõe a porta 8080 (Padrão do Google)
EXPOSE 8080

# 5. Inicia o servidor apontando para a pasta 'dist' na porta 8080
# O flag '-s' garante que rotas do React (SPA) funcionem sem erro 404
CMD ["serve", "-s", "dist", "-l", "8080"]