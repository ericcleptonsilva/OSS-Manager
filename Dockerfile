FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera os arquivos estáticos do Vite
RUN npm run build

# Instala o express para servir o build
RUN npm install express

EXPOSE 8080

# Roda o servidor que criamos no passo 1
CMD ["node", "server.js"]
