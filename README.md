# OSS Manager — Gestão de Jiu-Jitsu

Sistema de gerenciamento para academias de jiu-jitsu com integração ao **Back4App** (Parse) e hospedagem no **Google Cloud Run**.

---

## ⚙️ Configuração do Ambiente Local

### 1. Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
VITE_PARSE_APP_ID=SEU_APP_ID
VITE_PARSE_JS_KEY=SEU_JS_KEY
GEMINI_API_KEY=SUA_CHAVE_GEMINI
```

> As credenciais do Back4App estão disponíveis em:
> **Back4App Dashboard → Seu App → App Settings → Security & Keys**

### 2. Instalar dependências e rodar localmente

```bash
npm install
npm run dev
```

Acesse em: `http://localhost:3000`

---

## ☁️ Deploy no Google Cloud (Cloud Run)

O projeto usa **Cloud Build + Cloud Run**. As variáveis `VITE_` são injetadas como `--build-arg` durante a build Docker, pois o Vite as inclui no bundle em tempo de compilação.

### Configurar as Substitution Variables no Cloud Build

1. Acesse: **Google Cloud Console → Cloud Build → Triggers**
2. Clique em **Edit** no seu Trigger
3. Em **Substitution Variables**, configure:

| Variável | Valor |
|---|---|
| `_VITE_PARSE_APP_ID` | App ID do Back4App |
| `_VITE_PARSE_JS_KEY` | JavaScript Key do Back4App |
| `_GEMINI_API_KEY` | Chave da API Gemini |
| `_AR_HOSTNAME` | Host do Artifact Registry (ex: `southamerica-east1-docker.pkg.dev`) |
| `_AR_REPOSITORY` | Nome do repositório no Artifact Registry |
| `_SERVICE_NAME` | Nome do serviço no Cloud Run |
| `_DEPLOY_REGION` | Região do deploy (ex: `southamerica-east1`) |

> ⚠️ **Nunca** commite o arquivo `.env` com credenciais reais. Ele já está no `.gitignore`.

---

## 🔐 Permissões no Back4App (Class Level Permissions)

Para que os dados carregem corretamente, as CLPs das classes devem estar configuradas:

| Classe | Get | Find |
|---|---|---|
| `Team` | ✅ Public | ✅ Public |
| `Academy` | ✅ Public | ✅ Public |
| `Student` | 🔒 Auth | 🔒 Auth |
| `TrainingSession` | 🔒 Auth | 🔒 Auth |
| `FinancialTransaction` | 🔒 Auth | 🔒 Auth |

Acesse: **Back4App Dashboard → Database → [Classe] → Class Level Permissions**

---

## 📝 Log de Alterações Recentes

### Administração e Segurança
- **Correção de Credenciais**: O email `admin@oss.com` foi consolidado como o único acesso administrativo global. Removidas referências a emails de teste anteriores.
- **Gestão de Professores**: Adicionada nova seção no modal de **Configurações da Equipe** para listar e gerenciar o acesso de professores de todas as academias em um só lugar.
- **Botão Novo Professor**: Implementado atalho direto para cadastrar novos instrutores vinculados a unidades.

### Interface (UI/UX)
- **Barra de Abas (Tabs)**: Substituída a rolagem horizontal por um layout em grade (`grid-cols-3`) para melhor navegação em dispositivos móveis e desktop.
- **Botões Compactos**: Redimensionados os botões "Nova Academia" e "Matricular Aluno" para uma estética mais premium e equilibrada.
- **Dark Mode**: Ajustes de contraste e cores para melhor legibilidade no tema escuro.

### Evolução do Aluno
- **Ponto de Mérito**: Adicionados botões de `+0.5` e `-0.5` estrelas no perfil do aluno para permitir ajustes manuais de progresso pelo instrutor.
- **Feedback Visual**: Barra de progresso agora reflete pontuações decimais com suavidade.

---

## 📦 Tecnologias

- React + TypeScript + Vite
- Parse SDK (Back4App)
- Tailwind CSS + Recharts
- Docker + Google Cloud Run + Cloud Build
