# Camada App

Ponto de composição da aplicação: monta o shell (roteamento, providers globais,
layouts, tema, marca) que envolve as features. Não contém regra de negócio.

Vive em:

```text
app/index.tsx
app/providers
app/routers
app/layouts
app/theme
app/brand
app/assets
app/libs
```

---

## `app/index.tsx`

Composition root da aplicação. Monta `AppProviders` + `AppRouters` + `Toaster`
em volta da árvore. É o único arquivo importado por `src/main.tsx`
(`import App from './app'`).

Segue a mesma convenção `nome-do-artefato/index.ts(x)` das outras camadas —
aqui o "artefato" é a própria pasta `app/`.

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

### Guards podem orquestrar com services de feature

Guards (`app/routers/guards/`) podem chamar services de feature (ex:
`AuthService.getSession()`, `UserService.getProfile()`) e decidir navegação
(redirect) com base no estado retornado — mesmo papel de orquestração que uma
Page já tem, só que no nível de rota.

Isso não é regra de negócio nova sendo criada em `app/`: o guard só lê uma
flag/estado já resolvido pela feature (ex: `profile.mustChangePassword`) e
decide para onde navegar. Reimplementar a regra em si (o cálculo da flag)
continua proibido em `app/`.

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

## `app/assets/`

Assets estáticos importados via bundler (ex: ícones/imagens da marca). Ficam
em `app/` — e não em `public/` — porque são referenciados via `import` (para
ganhar hash/otimização do Vite), não como caminho absoluto servido cru. Hoje
só existe `app/assets/icon.svg`, usado por `app/brand/logo`.

`public/` (fora de `src/`) é o lugar certo apenas para arquivos que precisam
ser servidos exatamente como estão, sem passar pelo bundler.

---

## `app/libs/`

Configuração de bibliotecas de terceiros usadas globalmente pelo app (ex:
client do TanStack Query). Diferente de `infra/`: `infra/` cobre integrações
com o mundo externo (backend, APIs de browser); `app/libs/` cobre configuração
de bibliotecas client-side usadas dentro do próprio app React.

### `app/libs/react-query/` — feedback também no `QueryCache`

O `queryClient` aplica o mesmo mecanismo de feedback (`meta.successMessage`,
`meta.errorMessage`, `meta.suppressErrorToast`) tanto no `MutationCache`
quanto no `QueryCache` — não é exclusivo de mutations. `successMessage`
também aceita uma função `(data) => string` para mensagem dinâmica (ver
`references/api/error-handling.md`).

Como nenhuma query hoje define `meta`, **toda falha de query já dispara toast
automaticamente** com a mensagem genérica de fallback. Isso ainda não foi uma
decisão de produto explícita — só o comportamento real do código.

---

## Regras

- `app/` pode importar `features/` (apenas via `index.ts`) e `shared/`
- `app/` nunca importa `infra/` diretamente — sempre através de `features/`
- `app/` não contém regra de negócio
- Todo artefato nomeado (componente, provider, layout) segue
  `nome-do-artefato/index.ts(x)` — mesma convenção de `features/`, aplicada
  também em `app/`
