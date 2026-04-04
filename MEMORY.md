# OSS-Manager: Development Memory

## Current State & Technical Notes
- **App**: OSS-Manager (Jiu-Jitsu Management App)
- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS, Recharts
- **Database**: Back4App (Parse SDK)
- **Deployment**: Google Cloud Run

## Core Rules
- Save project changes, ideas, and system progress in this file to reduce token usage and act as persistent memory across interactions.
- Always document the step-by-step resolution inside `README.md`.
- Prioritize using specific tools like `view_file` over bash scripts for viewing code.

### 2026-04-03
*   **UI/UX (Modernização Premium)**
    *   **Ação**: Refatoração de `AcademyCard`, `StudentCard` e `TrainingCard`.
    *   **Estilo**: Implementado Glassmorphism inicial em componentes principais.
    *   **Correção**: Tamanho do ícone de lixeira em `StudentFinancialCard.tsx`.

### 2026-04-04
*   **Design System: Liquid Glass (Glassmorphism 2.0)**
    *   **Ação**: Refatorado `StudentFinancialCard.tsx` com novo design de camadas e estatísticas.
    *   **Ação**: Refatorado `Modal.tsx` para suporte nativo a `backdrop-blur-2xl` e tema dinâmico.
    *   **Correção**: Corrigido imports de ícones (`IconWallet`, `IconPlus`, `IconBack`) que causavam erro de lint.
*   **Próximos Passos (Planejado)**
    *   **Layout Global**: Refatorar o Header e Main layout em `App.tsx` para alinhar com o design Liquid Glass.
    *   **Vercel**: Criar `vercel.json` e documentar CI/CD no `README.md`.
    *   **Auth**: Auxiliar o usuário com reset de senha via Back4App Dashboard.
