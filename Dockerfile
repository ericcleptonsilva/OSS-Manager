FROM node:20

WORKDIR /app

# 1. Instala dependências
COPY package*.json ./
RUN npm install

# 2. Copia o código e faz o build (Gera a pasta 'dist')
COPY . .
RUN npm run build

# 3. Limpeza de dependências (opcional, mas bom pra imagem final)
# Se quisermos ser mais eficientes, poderíamos remover devDependencies, mas vamos manter simples por agora.

# 4. Expõe a porta 8080 (Padrão do Google)
EXPOSE 8080

# 5. Inicia o servidor customizado com Express (mais seguro que 'serve')
CMD ["node", "server.js"]
