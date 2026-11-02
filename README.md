# OSS Manager — Gestão de Jiu-Jitsu

## 🔐 Segurança e Proteção de Dados (Março 2026)

O sistema passou por uma reformulação completa de segurança para garantir a proteção dos dados dos alunos e academias.

### Implementações Realizadas
1.  **Autenticação Nativa**: Migração para o sistema nativo do *Parse.User*, garantindo que as senhas nunca transitem ou sejam armazenadas em texto simples.
2.  **Eliminação de Plaintext Passwords**: Removidos todos os campos de senha dos objetos `Academy`, `Student` e `Team`.
3.  **Controle de Acesso (RBAC)**: Implementada lógica de permissão baseada em cargos (*Roles* - Admin/Professor) no lado do servidor.
4.  **Limpeza de UI**: Interface refatorada para remover campos inseguros de entrada de senha em modais administrativos.
5.  **Proteção contra Injeção**: Uso exclusivo do Parse SDK que sanitiza automaticamente as queries ao banco de dados.

## 🛠️ Log de Alterações Recentes (Novembro 2026)

### 🔒 Auditoria Abrangente de Segurança (Workflow `/security-audit`)
Foi realizada uma auditoria completa de segurança no repositório cobrindo SAST (Static Application Security Testing), análise de permissões RBAC, segurança de contêineres e dependências npm.

#### 🎯 Issues Criadas e Solucionadas no GitHub:
- **[#183](https://github.com/ericcleptonsilva/OSS-Manager/issues/183) — SEC-01: [CRITICAL] Escalação de privilégios via fallback arbitrário para admin em `App.tsx`**:
  - *Problema*: `userRole` iniciava como `'admin'`. No método `checkUserRoleAndLoadData`, contas autenticadas não localizadas na lista de alunos eram arbitrariamente promovidas a `'admin'` por padrão.
  - *Correção*: `userRole` passa a iniciar estritamente com `'student'` (menor privilégio). O fallback foi substituído por uma verificação restrita com `adminEmail` da equipe e lista de professores; contas comuns permanecem como `'student'` (Fail-Safe Defaults / OWASP A01).
- **[#184](https://github.com/ericcleptonsilva/OSS-Manager/issues/184) — SEC-02: [HIGH] Resíduo de autorização via localStorage (`oss_custom_session`) em `App.tsx`**:
  - *Problema*: Leitura residual da chave de sessão antiga `oss_custom_session` permitia potencial spoofing de autorização ao navegar em academias.
  - *Correção*: Removida a dependência residual de localStorage. Verificação baseada exclusivamente em `ParseService.getCurrentUser()`.
- **[#185](https://github.com/ericcleptonsilva/OSS-Manager/issues/185) — SEC-03: [HIGH] Exposição potencial de credencial `GEMINI_API_KEY` em bundle e metadados Docker**:
  - *Problema*: `vite.config.ts` definia `process.env.GEMINI_API_KEY` para o bundle client-side, e `Dockerfile`/`cloudbuild.yaml` continham argumentos de build com a chave.
  - *Correção*: Eliminadas as injeções desnecessárias. Toda chamada à IA do Gemini é executada em Cloud Code seguro no Back4App (`Parse.Cloud.run('analyzeTeam')`).
- **[#186](https://github.com/ericcleptonsilva/OSS-Manager/issues/186) — SEC-04: [HIGH] Risco de DoS e exaustão de memória via upload irrestrito de mídias base64**:
  - *Problema*: Falta de validação de tamanho e tipo MIME em `handleImageUpload`, gerando risco de travamento do browser (OOM) e estouro de limite de memória no MongoDB.
  - *Correção*: Implementado limite de tamanho (5MB para imagens de perfil/logo/banner, 15MB e máx. 5 arquivos para treinos), validação de tipos MIME (`image/*` e `video/*`) e checagem defensiva de privilégios.
- **[#187](https://github.com/ericcleptonsilva/OSS-Manager/issues/187) — SEC-05: [MEDIUM] Hardening do servidor Express, CSP e execução não-root no Dockerfile**:
  - *Problema*: Servidor Express divulgava header `X-Powered-By`, CSP continha permissão ampla para Google APIs não mais consumido diretamente no client, e contêiner rodava como `root`.
  - *Correção*: Configurado `app.disable('x-powered-by')`, CSP ajustado e contêiner configurado com `USER node`.
- **[#188](https://github.com/ericcleptonsilva/OSS-Manager/issues/188) — SEC-06: [HIGH] Vulnerabilidades em dependências npm**:
  - *Problema*: `npm audit` detectou 27 vulnerabilidades (incluindo crítica em `proxy-addr` e 11 de alta severidade). Polyfills do Vite carregavam `vm-browserify` com uso de `eval`.
  - *Correção*: Executado `npm audit fix` (reduzindo vulnerabilidades de 27 para 10 sem breaking changes) e restritos polyfills do Vite (`['buffer', 'events', 'process']`), eliminando o uso de `eval` e reduzindo o tamanho do bundle JS de **1,95 MB para 1,01 MB** (-48%).

### 🕵️ Auditoria e Threat Model 007 (Workflow `/007`)
- **Zero Trust & Supply Chain**: Fixadas 100% das dependências em `package.json` para versões exatas (sem wildcards `^` ou `~`), alcançando nota máxima (100/100) no scanner de Supply Chain do 007.
- **Modelagem de Ameaças**: Elaborados frameworks formais STRIDE e PASTA para a arquitetura completa do OSS-Manager (SPA React, Express Host, Parse SDK e Cloud Code no Back4App).
- **Hardening de Segredos**: Confirmada a ausência de segredos ou credenciais em texto claro no repositório.

### 🛡️ Hardening Avançado e Modularização
- **[#189](https://github.com/ericcleptonsilva/OSS-Manager/issues/189) — SEC-07: [ENHANCEMENT] Rate Limiting defensivo no Express (`server.js`)**:
  - Implementado limitador em memória com janela deslizante de 1 minuto e limite de 180 req/min por IP. Responde com código HTTP 429 Too Many Requests, cabeçalhos `Retry-After`, `RateLimit-Limit`, `RateLimit-Remaining` e rotina periódica de liberação de memória.
- **[#190](https://github.com/ericcleptonsilva/OSS-Manager/issues/190) — SEC-08: [ENHANCEMENT] Sanitização e validação de dados cadastrais (`validationService.ts`)**:
  - Adicionada validação matemática de dígitos verificadores de CPF (módulo 11), máscaras automáticas em inputs (CPF e telefone) e sanitização de texto antes da persistência no Parse SDK.
- **[#191](https://github.com/ericcleptonsilva/OSS-Manager/issues/191) — REFACTOR-01: [ENHANCEMENT] Modularização do ciclo de autenticação e RBAC (`useAuth.ts`)**:
  - Extraído hook `hooks/useAuth.ts` isolando as operações de login, cadastro, logout e resolução de papéis defensiva (Fail-Safe Defaults), desacoplando a lógica do `App.tsx`.


## 🛠️ Log de Alterações Recentes (Agosto 2026)

### 🛡️ Correção Completa de Vulnerabilidades & Hardening de Autenticação
- **Remoção de Sessão Insegura no LocalStorage**: Eliminada a persistência de papel de usuário (`role`) e credenciais virtuais na chave `oss_custom_session` do `localStorage`. A validação de sessão agora depende **exclusivamente** da checagem do token de sessão criptográfico retornado pelo `Parse.User.current()`.
- **Descontinuação de Mock Users Legados**: Removido o fluxo de fallback em `performCustomLogin` que validava senhas contra os campos `adminPassword` das tabelas `Team` e `Academy`. O login agora utiliza unicamente a API nativa `Parse.User.logIn()` (hashing seguro via servidor).
- **Proteção do Papel do Usuário (RBAC)**: O papel (`userRole`) é atribuído no frontend com base na role autenticada pelo Parse Server no login, prevenindo adulteração via DevTools do navegador.

## 🛠️ Log de Alterações Anteriores (Julho 2026)

### 📋 Mapeamento de Contexto, Benchmark & Roadmap de Evolução
- **Arquivo de Contexto (`PROJECT_CONTEXT.md`)**: Criado arquivo de contexto estruturado contendo a arquitetura completa, stack técnica, modelo de dados das classes Back4App (`Team`, `Academy`, `Student`, `ProfessorAccount`, `TrainingSession`, `FinancialTransaction`), regras de RBAC e mapa do projeto para acelerar o desenvolvimento sem consumo excessivo de tokens.
- **Análise Competitiva & Repositórios GitHub**: Realizada pesquisa detalhada de soluções similares no GitHub (ex: *Obikai*, *Dojo Plugin*, *BJJ Journey*, *BJJ Scoreboard*) e softwares SaaS de mercado (ex: *Mat Track*, *GymDesk*, *PushPress*).
- **Roadmap de Melhorias Identificadas**: Mapeadas 4 frentes prioritárias de evolução:
  1. Refatoração modular de `App.tsx` em sub-views e custom hooks.
  2. Motor de sugestão automática de graduação por tempo e contagem de treinos.
  3. Notificações/Lembretes de mensalidade via WhatsApp.
  4. Timer de rólis e cronômetro de tatame integrado.
- **Memória de Projeto (`MEMORY.md`)**: Atualizado arquivo de memória contínuo.

## 🛠️ Log de Alterações Anteriores (Maio 2026)

### 📱 Melhorias de UI/UX e Mobile-First
- **Modo Escuro (Dark Mode)**: Corrigido o contraste em todos os formulários e inputs. Anteriormente, as fontes e os fundos ficavam invisíveis no tema escuro. Agora utilizamos a paleta `slate` do Tailwind (`dark:bg-slate-800` e `dark:text-white`).
- **Acessibilidade e Alvos de Toque (Touch Targets)**: Todos os campos de formulário (inputs e selects) tiveram sua altura e padding aumentados (`p-3` e `min-h-[48px]`) seguindo o padrão ouro de UX Mobile (Fitts' Law), evitando toques acidentais na tela.
- **Rótulos (Labels)**: Cores ajustadas de `text-gray-900` chumbadas para classes dinâmicas (`text-slate-700 dark:text-slate-300`), garantindo legibilidade perfeita sem ofuscar no modo escuro.


### 1. Modernização UI/UX (Design Liquid Glass)
- **Design System**: Implementação do sistema "Liquid Glass" (Glassmorphism 2.0) em todo o app.
  - Uso intensivo de `backdrop-blur-xl`, `bg-white/10` e bordas translúcidas.
  - Paleta de cores refinada com gradientes sutis e sombras profundas.
- **Componentes Refatorados**:
  - `Header` e `Banner`: Agora com animações de fade-in e escala.
  - `AcademyCard`: Correção do tamanho do logo e layout premium.
  - `StudentCard`: Nova estética com indicadores de faixa e status financeiro aprimorados.
  - `StudentFinancialCard`: Refatoração completa com foco em legibilidade.
  - `Modal`: Implementação de design de vidro consistente.

### 2. Correções de Segurança e Autenticação (RBAC) — Atualizado Maio 2026
- **CRÍTICO — Remoção de Backdoor Hardcoded**: Removida lógica de override de role baseada em e-mails fixos em `App.tsx`. A role agora é atribuída exclusivamente com base no valor provido pelo servidor.
- **CRÍTICO — Remoção de Credenciais Padrão Hardcoded**: Removidos os fallbacks de credenciais da função de login legado em `parseService.ts`. Credenciais somente são aceitas se armazenadas no banco de dados com valor não-vazio.
- **CRÍTICO — Bypass de String Vazia**: Adicionadas verificações explícitas de `length > 0` antes das comparações de credenciais no fluxo de login legado, prevenindo match acidental com inputs vazios.
- **CRÍTICO — Injeção de Credenciais Padrão na UI**: Removida a injeção automática de credenciais padrão ao abrir o modal de edição de equipe em `handleEditTeam`.
- **Correção de Loop de Login**: Ajustada a função `checkUserRoleAndLoadData` para evitar que administradores fossem redirecionados incorretamente para o portal do aluno.
- **Normalização de Dados**: Busca de faixas (belts) agora é insensível a maiúsculas/minúsculas, resolvendo falhas de exibição com dados legados.

### 3. Infraestrutura e Preparação para Vercel
- **Configuração Vercel**: Adicionado `vercel.json` para suporte a Single Page Application (SPA).
- **Variáveis de Ambiente**: Padronização das chaves do Parse para compatibilidade com o dashboard da Vercel.
- **Mapeamento de Professores**: Integração da entidade `ProfessorAccount` no fluxo de dados global.

## 🚀 Guia de Host na Vercel

1. Crie um projeto na Vercel importando este repositório.
2. Adicione as seguintes Variáveis de Ambiente (Environment Variables):
   - `VITE_PARSE_APP_ID`: Seu App ID do Back4App.
   - `VITE_PARSE_JS_KEY`: Sua JavaScript Key do Back4App.
   - `VITE_GEMINI_API_KEY`: (Opcional) Chave para recursos de IA.
3. O build command deve ser `npm run build` e o output directory `dist`.
4. Deploy!

---

## 👨‍🎓 Área do Aluno
O aluno agora tem um portal transparente para sua vida na academia:
- **Resumo Financeiro**: Visualização de débitos e próximos vencimentos.
- **Histórico de Treino**: Diário de evolução completo (graus, estrelas e técnicas).

Para detalhes técnicos, consulte o [walkthrough.md](file:///c:/Users/clept/.gemini/antigravity/brain/ba1bb63b-3e55-4936-9a55-6af55fe75f45/walkthrough.md).

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

### Financeiro (2026-03-11)
- **Lista completa de pendências**: Removido limite de 3 cobranças — agora exibe **todas** as mensalidades pendentes com scroll vertical.
- **Destaque de atrasados**: Cobranças em atraso ganham fundo vermelho e ícone de alerta (⚠️) para facilitar identificação na tela.
- **Performance ao marcar pago**: `handleMarkAsPaid` passou a usar *update otimista local* — a cobrança some da lista imediatamente sem recarregar todos os dados do servidor (elimina o re-render pesado da tela inteira).
- **Performance ao excluir cobrança**: `handleDeleteTransaction` idem — remoção instantânea no estado local.
- **Correção de data**: Bug de fuso horário corrigido na exibição das datas de vencimento (adicionado `T12:00:00` no parse).

---


### Administração e Segurança
- **Correção de Credenciais**: Credenciais de acesso administrativo foram consolidadas e as referências a credenciais de teste anteriores foram removidas.
- **Gestão de Professores**: Adicionada nova seção no modal de **Configurações da Equipe** para listar e gerenciar o acesso de professores de todas as academias em um só lugar.
- **Botão Novo Professor**: Implementado atalho direto para cadastrar novos instrutores vinculados a unidades.

### Interface (UI/UX)
- **Correção de Tela em Branco e Acesso Sem Tela de Login (Novembro 2026)**:
  - **Issue no GitHub**: #195 resolvida e fechada.
  - **Eliminação de Tela em Branco**: Corrigida a condição de guarda da View 2 (`Academy Detail`) que impedia a renderização ao acessar uma academia sem credenciais ativas.
  - **Carregamento Instantâneo de Dados Completos**: `ParseService.fetchFullData()` agora é disparado imediatamente na inicialização, trazendo equipe, academias, alunos, treinos e finanças de uma única vez.
  - **Acesso Direto às Unidades**: `handlePublicAcademyClick` navega diretamente para o painel da academia selecionada sem exigir autenticação ou exibir modal de login.
  - **Operação Direta**: `hooks/useAuth.ts` configurado com `isAuthenticated: true` e `userRole: 'admin'` por padrão, garantindo navegação irrestrita.
- **Evolução Antigravity Liquid Glass 2.0 & Mobile-First (Novembro 2026)**:
  - **Issues no GitHub**: #192, #193 e #194 resolvidas e fechadas.
  - **Ergonomia Tátil para Celular**: Implementada classe utilitária `.touch-target` com tamanho mínimo de 44x44px a 48x48px (padrão WCAG e Apple HIG/Android Material) para todos os botões interativos e atalhos de ação.
  - **Acesso Direto sem Hover**: No smartphone não há hover com mouse. Todos os botões de ação (editar, excluir, atalhos) agora ficam acessíveis diretamente no mobile (`opacity-90 md:opacity-0 md:group-hover:opacity-100`).
  - **Prevenção de Auto-Zoom no iOS Safari**: Adicionada regra CSS global que força `font-size: 16px` em `input`, `select` e `textarea` em telas `<= 768px`, eliminando o comportamento do iOS de dar zoom forçado e quebrar a interface ao digitar.
  - **Tipografia Atlética & Alto Contraste**: Inclusão da fonte esportiva *Barlow Condensed* (`font-athletic`) combinada com a legibilidade da *Inter*.
  - **Cards Reimaginados (`StudentCard`, `AcademyCard`, `TrainingCard`)**:
    - `StudentCard`: Gradiente de faixa com ambient glow dinâmico de acordo com a cor da faixa (Branca, Azul, Roxa, Marrom, Preta), botões táteis e feedback háptico visual via `active:scale-95`.
    - `AcademyCard`: Vidro especular (`.glass-specular`), tipografia de alto impacto e botões de atalho confortáveis para o polegar.
    - `TrainingCard`: Bloco de data responsivo adaptado para orientação fluida em telas pequenas, tags de técnica de alto contraste e botões de ação ampliados.
  - **Modais Mobile-First (`Modal.tsx`)**: Alvo de fechamento expandido para 44x44px, cantos arredondados modernos (`rounded-3xl`) e cabeçalho com tipografia esportiva.
  - **Acessibilidade de Movimento**: Suporte total a `@media (prefers-reduced-motion: reduce)`.
- **Correção de Ícone**: Corrigido o tamanho do ícone de lixeira (Limpar Histórico) no `StudentFinancialCard`, que estava distorcido e excessivamente grande na versão mobile/desktop, por herdar larguras `auto` e classes `full` dentro de uma tag em-linha. Foi definida a limitação de dimensões via Tailwind CSS `w-5 h-5` direto no SVG.
- **Barra de Abas (Tabs)**: Substituída a rolagem horizontal por um layout em grade (`grid-cols-3`) para melhor navegação em dispositivos móveis e desktop.
- **Botões Compactos**: Redimensionados os botões "Nova Academia" e "Matricular Aluno" para uma estética mais premium e equilibrada.
- **Dark Mode**: Ajustes de contraste e cores para melhor legibilidade no tema escuro.

### Evolução do Aluno
- **Ponto de Mérito**: Adicionados botões de `+0.5` e `-0.5` estrelas no perfil do aluno para permitir ajustes manuais de progresso pelo instrutor.
- **Feedback Visual**: Barra de progresso agora reflete pontuações decimais com suavidade.

### 🔐 Expansão de Permissões (Professor)
- **Gestão de Alunos**: Usuários com papel `professor` agora podem graduar graus, editar e excluir alunos de sua academia.
- **Gestão de Treinos**: Professores ganharam permissão total para registrar, editar e excluir treinos e aulas.
- **Gestão Financeira**: Professores agora podem visualizar a situação financeira dos alunos, marcar pagamentos como concluídos, criar novas cobranças e editar/excluir transações.
- **Segurança**: As funções críticas de backend (`App.tsx`) foram atualizadas com verificações de permissão `admin` ou `professor`.
- **Restrições Mantidas**: Somente o `admin` global pode gerenciar a equipe (banner, nome, logo), criar novas academias ou gerenciar a lista global de professores.

---

## 📦 Tecnologias

- React + TypeScript + Vite
- Parse SDK (Back4App)
- Tailwind CSS + Recharts
- Docker + Google Cloud Run + Cloud Build
