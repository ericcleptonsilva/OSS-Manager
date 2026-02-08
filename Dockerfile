FROM node:20-slim

WORKDIR /app

# Instala dependências primeiro para usar cache do Docker
COPY package*.json ./
RUN npm install

# Copia tudo e gera o build
COPY . .
RUN npm run build


EXPOSE 8080

# Comando de inicialização
CMD ["node", "server.js"]