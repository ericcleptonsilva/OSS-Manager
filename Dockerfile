FROM node:20

WORKDIR /app

# 1. Instala dependencias
COPY package*.json ./
RUN npm install

# 2. Copia o codigo e faz o build (Gera a pasta 'dist')
ARG VITE_PARSE_APP_ID
ARG VITE_PARSE_JS_KEY

ENV VITE_PARSE_APP_ID=$VITE_PARSE_APP_ID
ENV VITE_PARSE_JS_KEY=$VITE_PARSE_JS_KEY

COPY . .
RUN npm run build

# 3. Hardening de seguranca: Execucao com usuario nao-privilegiado (non-root)
RUN chown -R node:node /app
USER node

# 4. Expoe a porta 8080 (Padrao do Cloud Run)
EXPOSE 8080

# 5. Inicia o servidor com Node
CMD ["node", "server.js"]
