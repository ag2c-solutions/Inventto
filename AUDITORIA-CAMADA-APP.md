# Auditoria da camada `app/`

Revisão do código real de `apps/stores/src/app/` contra
`.agents/skills/architecture/references/architecture/layers/app.md`, como parte
da revisão pós-refatoração das skills de arquitetura. Ordem adotada:
`app → features → shared → infra` (mais interna/específica → mais
externa/fundação).

---

## Achados

### 1. `QueryCache` replica o mesmo mecanismo de toast do `MutationCache` — não documentado

`app/libs/react-query/index.tsx` aplica `meta.successMessage` /
`meta.errorMessage` / `meta.suppressErrorToast` tanto no `MutationCache` quanto
no `QueryCache`. A documentação (`error-handling.md`, `data-flow.md`,
`layers/features.md`) e a memória do projeto descreviam esse mecanismo como
exclusivo de mutations.

**Consequência real**: nenhuma query do projeto define `meta` hoje, então
**toda falha de query já dispara toast automaticamente**, com mensagem
genérica de fallback (`Erro na operação: ${backendMessage}`) — comportamento
ativo e não documentado.

**Status**: documentado (ver `layers/app.md` e `error-handling.md`
atualizados). **Não decidido**: se o comportamento padrão (toast automático em
toda falha de query, mesmo sem `meta`) é o desejado — queries rodam em
background/refetch com muito mais frequência que mutations, que são ações
explícitas do usuário. Ressalva registrada, sem mudança de comportamento.

### 2. `meta.successMessage` pode ser uma função `(data) => string`

Uso real em `features/products/presentation/hooks/use-mutations.ts:69`, para
mensagem dinâmica (ex: "N produto(s) importado(s)."). Não estava documentado
em lugar nenhum.

**Status**: documentado.

### 3. `app/index.tsx` (composition root) não estava listado na doc

O arquivo `app.tsx` (agora `app/index.tsx`) monta `AppProviders` + `AppRouters`
+ `Toaster`, mas `layers/app.md` listava só `providers/routers/layouts/theme/
brand/libs`, sem mencionar o próprio composition root.

**Status**: corrigido — arquivo renomeado `app.tsx` → `index.tsx` (padrão
`nome-do-artefato/index.ts(x)` aplicado também na raiz de `app/`) e
`src/main.tsx` ajustado (`import App from './app'`). Doc atualizada.

### 4. Inconsistência de estrutura dentro de `app/` (regra `index.tsx` não era aplicada em toda `app/`)

- `brand/logo/index.tsx` já seguia pasta + `index.tsx`.
- `theme/theme-provider.tsx` e `theme/toggle-theme.tsx` eram arquivos soltos.
- `layouts/auth/auth-layout.tsx` e `layouts/system/system-layout.tsx` tinham
  nome de pasta diferente do nome do artefato (`auth` ≠ `auth-layout`,
  `system` ≠ `system-layout`).

**Status**: corrigido.
- `theme/theme-provider.tsx` → `theme/theme-provider/index.tsx`
- `theme/toggle-theme.tsx` + `.test.tsx` → `theme/toggle-theme/index.tsx` +
  `index.test.tsx`
- `layouts/auth/` → `layouts/auth-layout/` (arquivo vira `index.tsx`)
- `layouts/system/` → `layouts/system-layout/` (arquivo vira `index.tsx`,
  subpastas `components/constants/types/utils` preservadas dentro da pasta
  renomeada)

Imports relativos/absolutos ajustados (`main.tsx`, `providers/index.tsx`
continuou igual pois resolve por pasta, `routers/index.tsx`,
`brand/logo/index.tsx`). `pnpm lint`, `tsc -b` e a suíte de testes (149
arquivos / 1051 testes) validados após o move — tudo verde.

### 5. `src/assets/` era uma pasta solta, fora de qualquer camada documentada

Não é pré-requisito do Vite que fique em `src/` — a diferença real é: tudo em
`public/` é servido como está (sem hash, sem passar pelo bundler, referenciado
por caminho absoluto); tudo em `src/` pode ser importado e o Vite
processa/hasheia. Como o único consumidor (`app/brand/logo`) já importava via
`@/assets/icon.svg`, mover para `public/` seria regressão (perderia
import/hash). Único uso confirmado via grep.

**Status**: corrigido — `src/assets/icon.svg` → `src/app/assets/icon.svg`
(único consumidor é `app/brand/logo`). Import ajustado para
`@/app/assets/icon.svg`. Pasta `src/assets/` removida.

### 6. `app/routers/guards/auth-loader.ts` orquestra com services de feature (padrão real, não documentado)

Os guards (`protectedLoader`, `firstAccessLoader`, `publicLoader`) chamam
`AuthService.getSession()` e `UserService.getProfile()` e decidem redirect com
base em `profile.mustChangePassword`. Isso **não** é regra de negócio nova
sendo criada em `app/` (a flag já vem computada da entidade `User`) — é
orquestração de navegação equivalente ao que uma Page já pode fazer
(`references/react/pages.md`), só que no nível de guard de rota.

**Status**: documentado como padrão válido em `layers/app.md` (guards podem
chamar services de feature para decidir navegação, desde que não reimplementem
a regra em si).

### 7. Código morto cosmético

`app/index.tsx` (ex `app.tsx`) tinha um import comentado morto
(`//import { ReactQueryDevtools } ...`).

**Status**: removido.

---

## Regra reforçada nesta rodada

> A convenção `nome-do-artefato/index.ts(x)` (um artefato por pasta, nomeada
> igual ao artefato) deve ser respeitada em **todas** as camadas da aplicação
> — não só em `features/presentation/components`. Isso inclui `app/`,
> `shared/` e qualquer outra camada com componentes/artefatos nomeados.

Aplicada nesta auditoria; falta ainda revisar `shared/` e `features/` sob a
mesma lente (próximas etapas).

---

## Próximos passos

- Revisar `features/` (a maior camada, 9 features) contra
  `layers/features.md`.
- Revisar `shared/` contra `layers/shared.md`.
- Revisar `infra/` contra `layers/infra.md`.
- Decidir o comportamento padrão do `QueryCache` (achado #1) — pendente,
  decisão de produto.
