FROM node:20

WORKDIR /app

# 1. Instala dependências
COPY package*.json ./
RUN npm install

# 2. Copia o código e faz o build (Gera a pasta 'dist')
COPY . .
RUN npm run build

# 3. Expõe a porta 8080 (Padrão do Google)
EXPOSE 8080

# 4. Inicia o servidor seguro customizado (server.js)
CMD ["node", "server.js"]
