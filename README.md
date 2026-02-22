# SaudeComparador Web

Plataforma de comparacao de planos de saude baseada em dados publicos da ANS (Agencia Nacional de Saude Suplementar). Permite buscar, filtrar, comparar planos lado a lado, consultar rankings de qualidade (IDSS), historico de reajustes, perfis de operadoras e conversar com um assistente IA.

**Producao:** [saudecomparador.com.br](https://saudecomparador.com.br)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 + TypeScript 5.7 |
| Roteamento | React Router 7 (SPA, `createBrowserRouter`) |
| Estilo | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Graficos | Recharts 2 |
| Icones | Lucide React |
| Build | Vite 6 |
| Testes E2E | Playwright (Chromium, 3 viewports) |
| Lint | ESLint 9 + typescript-eslint |
| SEO | react-helmet-async |
| Anti-bot | Cloudflare Turnstile |

## Requisitos

- Node.js >= 18
- npm >= 9

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

O dev server faz proxy de `/api` para `http://localhost:8000` (backend Python/FastAPI).

## Scripts

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia o Vite dev server na porta 3000 |
| `npm run build` | Type-check + build de producao em `dist/` |
| `npm run preview` | Serve o build de producao localmente |
| `npm run lint` | Executa ESLint em todo o projeto |
| `npm run typecheck` | Verifica tipos sem emitir arquivos |

## Variaveis de ambiente

| Variavel | Default | Descricao |
|----------|---------|-----------|
| `VITE_API_URL` | `""` (mesmo dominio) | URL base da API |
| `VITE_TURNSTILE_SITE_KEY` | Test key | Chave do Cloudflare Turnstile |
| `BASE_URL` | `https://saudecomparador.com.br` | URL base para testes Playwright |

## Estrutura do projeto

```
src/
  main.tsx              # Entry point (React 19 + HelmetProvider + RouterProvider)
  app.tsx               # Layout raiz: navbar, mobile menu, footer, <Outlet>
  router.tsx            # Definicao de todas as rotas
  index.css             # Tailwind + tema customizado (cores, animacoes)
  pages/
    home.tsx            # /           — Hero, search, stats, planos destaque, CTA IA
    planos.tsx          # /planos     — Busca com filtros, infinite scroll, compare bar
    plano-detalhe.tsx   # /planos/:id — Detalhes do plano, cobertura, VCM, IDSS
    comparar.tsx        # /comparar   — Tabela comparativa lado a lado (ate 4 planos)
    operadoras.tsx      # /operadoras — Lista com busca, filtros UF/modalidade, cards/tabela
    operadora-detalhe.tsx # /operadoras/:registro — Perfil, graficos IDSS, reajustes, IGR
    ranking.tsx         # /ranking    — Tabela IDSS com sort, filtros UF/ano, paginacao
    reajustes.tsx       # /reajustes  — Autocomplete operadora, grafico, tabela
    assistente.tsx      # /assistente — Chat IA com lead gate
    cotacao.tsx         # /cotacao    — Formulario de captacao de lead
    blog.tsx            # /blog       — Listagem de artigos
    blog-post.tsx       # /blog/:slug — Artigo completo
    termos.tsx          # /termos     — Termos de uso
    privacidade.tsx     # /privacidade — Politica de privacidade
  components/
    ai-chat.tsx         # Interface de chat com IA (streaming)
    lead-form.tsx       # Formulario de lead completo (cotacao + assistente)
    lead-capture-modal.tsx # Modal simplificado de captura (nome + celular)
    plan-card.tsx       # Card de plano (usado em listagem e home)
    share-button.tsx    # Dropdown de compartilhamento social
    search-box.tsx      # Busca do hero da home
    ranking-table.tsx   # Tabela do ranking IDSS com sort
    reajuste-chart.tsx  # Grafico de reajustes (Recharts)
    municipio-autocomplete.tsx # Autocomplete de municipios
    price-level-badge.tsx # Badge de faixa de preco ($$, $$$)
    seo.tsx             # Wrapper de <Helmet> para meta tags
    tooltip.tsx         # Tooltip + MetricLabel
  hooks/
    use-lead.ts         # Estado de lead via localStorage + useSyncExternalStore
    use-user-uf.ts      # Deteccao e persistencia do UF do usuario
    use-analytics.ts    # Tracking de page views
    use-precos.ts       # Hook de precos VCM
    use-faixas-preco.ts # Faixas de preco por plano
    use-qualidade.ts    # Dados de qualidade
  lib/
    api-client.ts       # Fetcher generico + todas as chamadas de API
    utils.ts            # Formatadores, constantes (UF_LIST, FAIXAS_ETARIAS, etc)
    analytics.ts        # trackEvent wrapper
  types/
    index.ts            # Tipos TypeScript do dominio
```

## Rotas

| Rota | Pagina | Descricao |
|------|--------|-----------|
| `/` | Home | Hero com busca, stats, planos destaque, CTA assistente |
| `/planos` | Planos | Busca com filtros (UF, tipo, segmentacao, abrangencia, faixa etaria, municipio), sort, compare |
| `/planos/:id` | Plano Detalhe | Info completa do plano, cobertura, precos VCM, IDSS, compartilhamento |
| `/comparar` | Comparar | Tabela comparativa de ate 4 planos (via `?ids=1,2,3`) |
| `/operadoras` | Operadoras | Lista com busca, filtros UF/modalidade, toggle cards/tabela |
| `/operadoras/:registro` | Operadora Detalhe | Perfil, graficos IDSS/reajustes, IGR, planos associados |
| `/ranking` | Ranking IDSS | Tabela com sort por sub-indices, filtros UF/ano, paginacao |
| `/reajustes` | Reajustes | Autocomplete de operadora, grafico e tabela de historico |
| `/assistente` | Assistente IA | Lead gate + chat com IA (max 15 mensagens) |
| `/cotacao` | Cotacao | Formulario completo de captacao de lead |
| `/blog` | Blog | Listagem de artigos com paginacao |
| `/blog/:slug` | Blog Post | Artigo completo |
| `/termos` | Termos de Uso | Pagina estatica legal |
| `/privacidade` | Privacidade | Pagina estatica legal |

## Lead gating

O sistema usa **lead gating** para precos reais. Sem lead no `localStorage`, os precos VCM sao exibidos como faixas ($$, $$$). Apos captura do lead (via modal ou formulario completo), precos reais aparecem.

Chaves do `localStorage`:
- `saude_lead_id` — ID do lead na API
- `saude_lead_nome` — Nome
- `saude_lead_uf` — Estado
- `saude_lead_faixa` — Faixa etaria
- `saude_lead_tipo` — Tipo de contratacao

## API

O frontend consome uma API REST (FastAPI) em `/api/v1/`. Endpoints principais:

- `GET /api/v1/stats` — Estatisticas gerais
- `GET /api/v1/planos` — Busca paginada de planos
- `GET /api/v1/planos/:id` — Detalhe de plano
- `GET /api/v1/planos/comparar` — Comparacao de planos
- `GET /api/v1/operadoras` — Busca paginada de operadoras
- `GET /api/v1/operadoras/:registro` — Detalhe de operadora
- `GET /api/v1/ranking` — Ranking IDSS
- `GET /api/v1/reajustes/:registro` — Reajustes de operadora
- `GET /api/v1/precos/:id_plano_ans` — Precos VCM por faixa
- `POST /api/v1/leads` — Criacao de lead
- `POST /api/v1/chat` — Chat com IA (streaming)
- `GET /api/v1/blog` — Listagem de posts
- `GET /api/v1/blog/:slug` — Post completo
- `GET /api/v1/municipios` — Autocomplete de municipios

## Testes E2E

O projeto usa **Playwright** com 3 viewports (desktop 1280px, tablet 768px, mobile 375px).

```bash
# Instalar browsers (primeira vez)
npx playwright install chromium

# Rodar todos os testes
npx playwright test

# Apenas um viewport
npx playwright test --project=desktop
npx playwright test --project=tablet
npx playwright test --project=mobile

# Arquivo especifico
npx playwright test e2e/navigation.spec.ts

# Listar testes sem executar
npx playwright test --list

# Relatorio HTML
npx playwright show-report
```

### Arquivos de teste

| Arquivo | Testes | Foco |
|---------|--------|------|
| `e2e/helpers.ts` | — | Utilitarios compartilhados (timeouts, viewport, lead, URL discovery) |
| `e2e/navigation.spec.ts` | 12 | Navbar, hamburger menu, footer, links |
| `e2e/home.spec.ts` | 14 | Hero, search, stat cards, planos destaque, CTAs |
| `e2e/planos.spec.ts` | 18 | Filtros, busca, sort, cards, infinite scroll |
| `e2e/planos-comparacao.spec.ts` | 7 | Selecao de planos para comparacao |
| `e2e/comparar.spec.ts` | 10 | Tabela comparativa, highlights, add/remove |
| `e2e/operadoras.spec.ts` | 12 | Lista, busca, filtros, toggle cards/tabela |
| `e2e/operadora-detalhe.spec.ts` | 10 | Info, metricas, graficos, planos associados |
| `e2e/ranking.spec.ts` | 10 | Tabela IDSS, sort, filtros UF/ano, paginacao |
| `e2e/reajustes.spec.ts` | 8 | Autocomplete, grafico, tabela |
| `e2e/cotacao.spec.ts` | 8 | Validacao client-side do formulario lead |
| `e2e/assistente.spec.ts` | 6 | Pre-chat, lead gate, footer oculto |
| `e2e/lead-gating.spec.ts` | 6 | Precos ocultos vs visiveis, modal, localStorage |
| `e2e/blog.spec.ts` | 8 | Listagem, cards, navegacao, paginacao |
| `e2e/static-pages.spec.ts` | 6 | /termos e /privacidade, no overflow |
| `e2e/share-button.spec.ts` | 5 | Dropdown social, copiar link |
| `e2e/plano-detalhe.spec.ts` | 13 | Responsividade do detalhe do plano |

**Total: 153 testes x 3 viewports = 474 execucoes**

### Convencoes de teste

- `waitUntil: "networkidle"` com timeout de 45s para navegacao
- `test.skip()` quando dados da API nao estao disponiveis
- Cada spec descobre dados reais via `beforeAll` (independencia)
- Sem escrita em producao: validacao client-side apenas, lead injetado via `localStorage`
- Seletores robustos: `:has-text()`, `a[href^="..."]`, texto visivel

## Deploy

O build de producao (`npm run build`) gera arquivos estaticos em `dist/`. O deploy usa qualquer CDN/servidor estatico (Cloudflare Pages, Vercel, Nginx, etc.) com fallback para `index.html` (SPA).

## Licenca

Projeto proprietario — Goworks Tecnologia.
