# 🥋 OSS Manager — Contexto e Arquitetura do Projeto

> **Documento de Contexto Técnico & Mapa de Evolução**
> *Criado em: Julho 2026 | Última atualização: 2026-07-24*

---

## 📌 1. Visão Geral do Sistema

O **OSS Manager** é uma plataforma SaaS (Software as a Service) focada na gestão integral de equipes e academias de **Jiu-Jitsu (BJJ)**. O sistema foi projetado especificamente para atender às particularidades do tatame, integrando gestão administrativa, evolução de faixas/graus, controle de treinos/diário de técnicas, gestão financeira por mensalidades e um portal interativo transparente para o aluno.

### 🧱 Arquitetura e Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (Design System *Liquid Glass* 2.0).
- **Backend / Database**: Back4App (Parse SDK Serverless em Nuvem).
- **Inteligência Artificial**: Google Gemini API (`@google/genai` / `GeminiService`) para análise estratégica da equipe e insights de retenção.
- **Servidor de Produção**: Express (`server.js`) configurado com Security Headers (CSP, HSTS, X-Frame-Options, Referrer-Policy).
- **Infraestrutura & Deploy**: Docker + Google Cloud Run (via Cloud Build) e suporte a Vercel (SPA fallback).

---

## 🗄️ 2. Modelo de Dados (Classes Back4App / Parse)

| Classe | Descrição | Permissão / Acesso (RBAC) |
|---|---|---|
| `Team` | Registro global da equipe/redes de academias (nome, banner, logo, admins) | Leitura Pública / Escrita Admin |
| `Academy` | Unidades físicas da academia (endereço, instrutor responsável, horários) | Leitura Pública / Escrita Admin |
| `Student` | Perfis dos alunos (faixa, graus, estrelas de mérito, responsável legal, contato) | Leitura/Escrita Autenticado (Admin, Prof, Aluno) |
| `ProfessorAccount` | Contas de instrutores/professores vinculados às unidades da academia | Leitura/Escrita Admin |
| `TrainingSession` | Registro de treinos, técnicas ministradas, presença e mídias de aula | Leitura/Escrita Autenticado |
| `FinancialTransaction` | Cobranças, mensalidades, tipo (único/recorrente), vencimentos e status | Leitura/Escrita Autenticado |

---

## 👥 3. Cargos e Níveis de Acesso (RBAC)

1. **Admin (Dono da Equipe/Academia)**
   - Acesso irrestrito a todas as academias da equipe.
   - Gestão de equipe, criação de novas academias, gerenciamento global de professores.
   - Acesso aos relatórios financeiros e diagnósticos de IA.

2. **Professor (Instrutor de Unidade)**
   - Vinculado a uma ou mais unidades da academia.
   - Pode matricular, editar e graduar alunos (faixas e graus).
   - Pode registrar treinos, presenças e mídias de aula.
   - Pode marcar mensalidades como pagas e visualizar a saúde financeira da sua unidade.

3. **Student (Aluno / Responsável)**
   - Portal dedicado com acesso ao resumo financeiro (pendências e comprovantes).
   - Diário de treino pessoal com acompanhamento de progresso (graus, estrelas e histórico de técnicas).

---

## 🌐 4. Benchmark de Mercado & Análise Competitiva (GitHub / Open-Source vs. SaaS Commercial)

### 📊 SaaS Comerciais de Destaque (2026)
1. **Mat Track**: Referência em retenção de alunos e detecção preventiva de *churn* (abandono de treino).
2. **GymDesk**: Foco em simplicidade de precificação e portal do aluno.
3. **Spark Membership**: CRM avançado para conversão de matrículas e funis de vendas.
4. **PushPress**: Gestão de contratos digitais e mensalidades familiares.

### 🐙 Projetos Semelhantes no GitHub (Open-Source)
- **[Obikai](https://github.com/jagduvi1/obikai)**: Plataforma SaaS "dojo-native" open-source (AGPLv3) com suporte a motor de graduação configurável e cobranças.
- **[Dojo Plugin](https://github.com/dojosource/dojo)**: Sistema de gestão de dojos via WordPress com painel de contratos.
- **[BJJ Journey](https://github.com/topics/bjj)**: Web app para registro pessoal de treinos, vídeos e evolução de faixas.
- **[BJJ-Scoreboard](https://github.com/grunch/BJJ-Scoreboard)** & **[Openroll](https://github.com/craigmac/openroll)**: Placar de lutas e cronômetro de rólis via WebSockets/Rust.

---

## 🔍 5. Análise do Estado Atual & Oportunidades de Melhoria

### 💡 Pontos Fortes
- Design moderno Liquid Glass com alto nível de acabamento visual e suporte nativo a Dark Mode.
- Autenticação e RBAC robustos (correções de segurança aplicadas em Maio 2026).
- Resposta rápida em operações financeiras através de atualizações otimistas na UI.

### ⚠️ Oportunidades & Débitos Técnicos
1. **Modularização do `App.tsx`**:
   - `App.tsx` possui ~3.500 linhas concentrando estado global, modais e roteamento interno.
   - *Solução recomendada*: Dividir em views modulares (`DashboardView`, `StudentsView`, `TrainingsView`, `FinancialView`) e custom hooks (`useAuth`, `useAcademyData`, `useFinancials`).
2. **Graduação Automática por Critérios**:
   - Atualmente a promoção de graus/faixa é manual.
   - *Solução recomendada*: Criar motor de sugestão de graduação automático (ex: mínimo de 40 treinos + 6 meses na faixa para sugerir 1º grau).
3. **Placar & Cronômetro de Tatame (Scoreboard)**:
   - Recurso diferencial de engajamento para treinos e rólis internos.
4. **Exportação & Lembretes de Mensalidade (WhatsApp)**:
   - Gerar links diretos de cobrança/lembrete via WhatsApp para alunos inadimplentes.
5. **Modo Offline / PWA para Chamada**:
   - Permitir chamada de presença no tatame mesmo com conexão fraca na academia.

---

## 🚀 6. Roadmap Sugerido de Próximas Features

- [ ] **Fase 1**: Refatoração estrutural de sub-componentes de `App.tsx` e melhoria nos custom hooks.
- [ ] **Fase 2**: Módulo de Alertas de Retenção & Graduação Automática.
- [ ] **Fase 3**: Integração com mensagens instantâneas (WhatsApp Web Share / Cobrança).
- [ ] **Fase 4**: Cronômetro de Lutas / Timer de Roli integrado no painel do instrutor.
