# Camada App

Ponto de composição da aplicação: monta o shell (roteamento, providers globais,
layouts, tema, marca) que envolve as features. Não contém regra de negócio.

Vive em:

```text
app/providers
app/routers
app/layouts
app/theme
app/brand
app/libs
```

---

## `app/providers/`

`AppProviders` compõe os providers globais da aplicação (React Query, tema,
autenticação, usuário) em volta de `children`.

Responsável por:

- ordem de composição dos providers globais
- injetar dependências de estado de feature em providers técnicos (ex:
  `QueryClientProvider` envolvendo `AuthProvider`/`UserProvider`)

Pode importar `features/` (via `index.ts`) e `shared/`.

É o ponto real de "bootstrap" da aplicação — não existe pasta `app/bootstrap`.

---

## `app/routers/`

Define as rotas da aplicação e os guards de acesso (`guards/auth-loader`).

Responsável por:

- registro de rotas (lazy-loaded)
- proteção de rota por permissão/sessão

Detalhes de como uma página se conecta ao router em `references/react/pages.md`.

---

## `app/layouts/`

Shells visuais que envolvem as páginas (ex: `auth-layout`, `system-layout`).

Podem ter sua própria estrutura interna (`components/`, `constants/`, `types/`,
`utils/`) — um layout complexo se organiza como um componente complexo (ver
`references/react/components.md`).

---

## `app/theme/`

`ThemeProvider` e o toggle de tema. Configuração de tema visual da aplicação.

---

## `app/brand/`

Identidade visual da aplicação (ex: `Logo`). Fica em `app/` e não em
`shared/components/common/` porque é específico da marca/shell do app, não um
componente de UI reutilizável de forma independente do app.

---

## `app/libs/`

Configuração de bibliotecas de terceiros usadas globalmente pelo app (ex:
client do TanStack Query). Diferente de `infra/`: `infra/` cobre integrações
com o mundo externo (backend, APIs de browser); `app/libs/` cobre configuração
de bibliotecas client-side usadas dentro do próprio app React.

---

## Regras

- `app/` pode importar `features/` (apenas via `index.ts`) e `shared/`
- `app/` nunca importa `infra/` diretamente — sempre através de `features/`
- `app/` não contém regra de negócio
