FROM node:20

WORKDIR /app

# 1. Instala dependências
COPY package*.json ./
RUN npm install

# 2. Copia o código e faz o build (Gera a pasta 'dist')
# We need ARGs to receive the values from Cloud Build
ARG VITE_PARSE_APP_ID
ARG VITE_PARSE_JS_KEY
ARG GEMINI_API_KEY

# Set them as ENV vars so Vite can embed them during build
ENV VITE_PARSE_APP_ID=$VITE_PARSE_APP_ID
ENV VITE_PARSE_JS_KEY=$VITE_PARSE_JS_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

COPY . .
RUN npm run build

# 3. Expõe a porta 8080 (Padrão do Google)
EXPOSE 8080

# 4. Inicia o servidor customizado com Node
CMD ["node", "server.js"]