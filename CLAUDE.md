# CLAUDE.md — Contexto para Claude Code

## O que e este projeto

**SaudeComparador Web** e o frontend SPA de uma plataforma de comparacao de planos de saude. Consome dados publicos da ANS via API REST (FastAPI backend separado). O usuario pode buscar planos, comparar lado a lado, ver rankings de qualidade, historico de reajustes e conversar com um assistente IA.

## Stack e tooling

- **React 19** + **TypeScript 5.7** + **Vite 6**
- **Tailwind CSS 4** via `@tailwindcss/vite` (nao usa PostCSS, tema definido em `src/index.css` com `@theme`)
- **React Router 7** (`createBrowserRouter`, SPA client-side)
- **Recharts 2** para graficos
- **Lucide React** para icones
- **Playwright** para testes E2E (3 viewports: desktop, tablet, mobile)
- **ESLint 9** + typescript-eslint

## Comandos essenciais

```bash
npm run dev          # Dev server na porta 3000 (proxy /api -> localhost:8000)
npm run build        # tsc + vite build -> dist/
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npx playwright test  # Testes E2E (requer chromium instalado)
```

## Estrutura de arquivos

```
src/
  main.tsx          # Entry: React 19 StrictMode + HelmetProvider + RouterProvider
  app.tsx           # Layout raiz: navbar sticky, mobile menu, footer (oculto em /assistente)
  router.tsx        # Todas as 14 rotas definidas aqui
  index.css         # Tailwind imports + tema customizado (@theme)
  pages/            # Uma page por rota (home, planos, comparar, ranking, etc.)
  components/       # Componentes reutilizaveis (plan-card, share-button, lead-form, etc.)
  hooks/            # Custom hooks (use-lead, use-user-uf, use-analytics, etc.)
  lib/              # api-client.ts (fetcher + endpoints), utils.ts, analytics.ts
  types/index.ts    # Tipos do dominio
e2e/
  helpers.ts        # Utilitarios compartilhados para testes
  *.spec.ts         # 16 arquivos de spec (474 execucoes total)
```

## Rotas (router.tsx)

| Rota | Page component | Notas |
|------|---------------|-------|
| `/` | Home | Hero search, stats cards, featured plans |
| `/planos` | Planos | Filtros no sidebar (desktop) ou slide-over (mobile), infinite scroll |
| `/planos/:id` | PlanoDetalhe | Metricas, cobertura, tabela VCM, IDSS detalhado |
| `/comparar` | Comparar | `?ids=1,2,3` ate 4 planos, tabela com highlights |
| `/operadoras` | Operadoras | Toggle cards/tabela, paginacao |
| `/operadoras/:registro` | OperadoraDetalhe | Graficos IDSS + reajustes (Recharts), IGR |
| `/ranking` | Ranking | Tabela IDSS sortable, paginacao com numeros |
| `/reajustes` | ReajustesPage | Autocomplete operadora -> grafico + tabela |
| `/assistente` | Assistente | Lead gate -> AiChat (max 15 msgs), footer hidden |
| `/cotacao` | Cotacao | LeadForm completo, sucesso mostra resumo |
| `/blog` | Blog | Grid de cards, paginacao |
| `/blog/:slug` | BlogPost | Artigo renderizado |
| `/termos` | Termos | Pagina estatica |
| `/privacidade` | Privacidade | Pagina estatica |

## Padroes importantes

### Lead gating (use-lead.ts)
- `localStorage` keys: `saude_lead_id`, `saude_lead_nome`, `saude_lead_uf`, `saude_lead_faixa`, `saude_lead_tipo`
- Sem lead: precos aparecem como faixas ($$, $$$) com botao "Ver real"
- Com lead: precos VCM reais visiveis, chat IA desbloqueado
- Hook usa `useSyncExternalStore` para manter todos os componentes sincronizados

### API (lib/api-client.ts)
- Base URL via `VITE_API_URL` (vazio = mesmo dominio)
- Fetcher generico com `ApiError` class
- Todos os endpoints em `/api/v1/`
- Proxy no dev: `/api` -> `http://localhost:8000`

### Estilizacao
- Tailwind 4 com `@theme` (nao `tailwind.config.js`)
- Cores: `primary` (#0066FF), `primary-dark`, `primary-light`, `success`, `warning`, `danger`
- Utility classes: `skeleton` (loading placeholder), `animate-fade-in`
- Breakpoints: `sm` (640), `md` (768), `lg` (1024), `xl` (1280)
- Mobile-first: `hidden lg:flex` para desktop nav, `lg:hidden` para hamburger

### Navbar (app.tsx)
- NAV_LINKS: Planos, Ranking, Reajustes, Operadoras, Assistente IA (badge "NOVO")
- Mobile menu: fullscreen overlay com backdrop, fecha em route change
- Footer: oculto em `/assistente` (pagina fullscreen de chat)

### Componentes compartilhados
- `PlanCard` — usado em home, planos, operadora-detalhe
- `ShareButton` — dropdown com WhatsApp, Facebook, LinkedIn, copiar link
- `LeadForm` — formulario completo (cotacao + assistente pre-chat)
- `LeadCaptureModal` — modal simplificado (nome + celular) para price gate
- `ReajusteChart` — grafico recharts reutilizado em reajustes e operadora-detalhe

## Testes E2E (Playwright)

### Configuracao (playwright.config.ts)
- 3 projetos: desktop (1280x800), tablet (768x1024), mobile (375x812 + isMobile)
- Base URL: `BASE_URL` env ou `https://saudecomparador.com.br`
- Timeout global: 60s. Goto: 45s. Elementos: 30s
- Retries: 2 em CI, 0 local

### Convencoes de teste
- Cada spec faz `beforeAll` para descobrir dados reais (URLs de plano, operadora, etc.)
- `try/catch` + `test.skip()` quando a API nao retorna dados
- `isMobile(page)` / `isDesktop(page)` para pular testes viewport-especificos
- Sem escrita em producao: formularios validam client-side, lead via `localStorage`
- Seletores: priorizar `:has-text()`, `a[href^="..."]`, texto visivel

### Executar testes
```bash
npx playwright install chromium   # primeira vez
npx playwright test               # todos (474 execucoes)
npx playwright test --project=desktop
npx playwright test e2e/home.spec.ts
npx playwright test --list        # listar sem executar
npx playwright show-report        # relatorio HTML
```

## Gotchas

- O tema Tailwind 4 usa `@theme` em CSS, nao `tailwind.config.js`. Novas cores devem ser adicionadas em `src/index.css`.
- O path alias `@/` resolve para `./src/` (configurado em `tsconfig.json` e `vite.config.ts`).
- O footer e **condicionalmente oculto** em `/assistente` (verificacao `isAssistente` em app.tsx).
- O dev server proxia `/api` para `localhost:8000`. Em producao, frontend e API estao no mesmo dominio.
- O `LeadCaptureModal` e o `LeadForm` ambos integram Cloudflare Turnstile para anti-bot.
- Filtros de `/planos` sao persistidos em `localStorage` e restaurados ao revisitar a pagina.
- A faixa etaria selecionada persiste em `localStorage` entre `/planos` e `/comparar`.
