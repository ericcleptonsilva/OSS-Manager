FROM node:20-slim

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
RUN npm install

# Copia o restante e faz o build
COPY . .
RUN npm run build

# Instala o express explicitamente
RUN npm install express

# Define a porta como variável (boas práticas)
ENV PORT=8080
EXPOSE 8080

# Executa o servidor
CMD ["node", "server.js"]
