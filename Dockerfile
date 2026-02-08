FROM node:22

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o resto e gera o build do Vite
COPY . .
RUN npm run build

# Garante que o express esteja instalado para o server.js
RUN npm install express

EXPOSE 8080

# Comando para rodar o servidor que criamos acima
CMD ["node", "server.js"]
