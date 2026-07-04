# Feature Creation Workflow

Ao criar uma nova feature, siga este fluxo.

Nunca comece pela interface.

A ordem existe para evitar:

- UI acoplada ao backend
- regras espalhadas
- duplicação
- refactors desnecessários

---

# Passo 0 — Verifique se a feature realmente precisa existir

Antes de criar uma nova feature, valide:

- isso é realmente um novo domínio?
- já existe uma feature parecida?
- isso deveria ficar em `shared`?
- isso é apenas uma extensão de uma feature existente?

---

## Vai para `shared` apenas se:

- for genérico
- reutilizável
- agnóstico ao domínio

Exemplo:

```text
shared/components/common/datatable
shared/utils/currency
```

---

## Deve virar feature se:

- possuir regra de negócio própria
- possuir fluxo próprio
- possuir integração própria
- representar um domínio real

Exemplo:

- users
- products
- permissions
- operations

---

# Passo 1 — Criar a estrutura base

```text
features/<feature-name>/
│
├── presentation/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   └── pages/
│
├── domain/
│   ├── entities/
│   ├── services/
│   └── validators/
│
├── data/
│   ├── api/
│   ├── dtos/
│   ├── mappers/
│   └── handlers/
│
├── tests/
│   ├── factories/
│   └── mocks/
│
└── index.ts
```

---

# Passo 2 — Criar contratos externos (`data/dtos`)

Defina os contratos exatos do backend.

```text
data/
└── dtos/
    └── index.ts
```

Exemplo — os contratos ficam num único `index.ts`:

```ts
export interface ProductDTO { ... }
export interface CreateProductDTO { ... }
export interface UpdateProductDTO { ... }
```

DTO representa exatamente o formato da API.

---

# Passo 3 — Criar entidades do domínio (`domain/entities`)

Crie os modelos internos da aplicação.

```text
domain/
└── entities/
    └── index.ts
```

Exemplo — as entidades ficam num único `index.ts`:

```ts
export interface Product { ... }
```

Esses modelos representam o formato ideal da aplicação.

---

# Passo 4 — Criar mappers (`data/mappers`)

Responsável por traduzir:

```text
DTO → Domain Model
Domain Model → DTO
```

```text
data/
└── mappers/
    └── index.ts
```

Mappers devem ser classes com métodos estáticos.

Exemplo:

```text
ProductMapper
```

Sem mapper, DTO nunca deve chegar na UI.

---

# Passo 5 — Criar handlers (`data/handlers`)

Responsável por tratar erros técnicos externos.

```text
data/
└── handlers/
```

Exemplo:

- normalização de erros HTTP
- tratamento de mensagens
- fallback handlers
- tradução de erros externos para mensagens previsíveis

Handlers sempre relançam erro com:

```ts
throw new Error(message)
```

---

# Passo 6 — Criar camada de API (`data/api`)

Implemente comunicação externa.

```text
data/
└── api/
```

APIs devem ser classes com métodos estáticos.

Exemplo:

```text
ProductAPI
```

A API pode usar:

- cliente `supabase` (`@/infra/supabase`)
- DTOs
- mappers
- handlers
- tipos de domínio necessários para entrada e saída

Exemplo de métodos:

```ts
ProductAPI.getAll()
ProductAPI.getById(id)
ProductAPI.create(product)
ProductAPI.update(product)
ProductAPI.delete(id)
```

Essa camada fala com:

- backend
- gateways
- serviços externos

---

# Passo 7 — Criar regras de negócio (`domain/services`)

Crie services quando existir regra real.

```text
domain/
└── services/
```

Services devem ser classes com métodos estáticos.

O nome deve seguir o padrão:

```text
<FeatureName>Service
```

Exemplo:

```text
ProductService
OrderService
AuthService
```

Use principalmente para:

- mutations
- validações complexas
- orquestrações de negócio
- decisões de domínio
- erros de regra de negócio

Services podem chamar a API da própria feature.

---

# Passo 8 — Criar validações (`domain/validators`)

Quando houver regras reutilizáveis:

```text
domain/
└── validators/
```

Exemplo:

- validação de permissões
- validação de status
- validação de regras de transição

---

# Passo 9 — Criar hooks (`presentation/hooks`)

Hooks fazem a ponte entre UI e arquitetura.

```text
presentation/
└── hooks/
```

A feature deve manter:

```text
presentation/hooks/use-queries.ts
presentation/hooks/use-mutations.ts
```

---

## Queries

Todas as queries da feature ficam em:

```text
presentation/hooks/use-queries.ts
```

Fluxo:

```text
Data API → Hook → Component
```

A API já retorna modelos de domínio após passar pelo mapper internamente.

---

## Mutations

Todas as mutations da feature ficam em:

```text
presentation/hooks/use-mutations.ts
```

Fluxo:

```text
Component → Hook → Domain Service → Data API
```

Use `meta` para feedback global via `MutationCache`:

```ts
meta: {
  successMessage: 'Produto criado com sucesso!',
  errorMessage: 'Não foi possível criar o produto.'
}
```

---

## Hooks compartilhados da feature

Hooks usados por dois ou mais componentes ficam em:

```text
presentation/hooks/use-<context>.ts
```

Exemplo:

```text
presentation/hooks/use-buy-simulation.ts
```

---

# Passo 10 — Criar UI (`presentation/components` e `presentation/pages`)

Agora sim criar interface.

```text
presentation/
├── components/
└── pages/
```

Componentes:

- tabelas
- forms
- modais
- cards

Pages:

- listagem
- detalhes
- criação
- edição

---

## Hooks locais de componente

Hooks usados por apenas um componente ficam junto ao componente, dentro de `hooks/`.

Exemplo:

```text
presentation/components/product-form/
├── hooks/
│   └── use-product-form.ts
└── index.tsx
```

Use esse padrão para:

- React Hook Form
- Context local
- estado local complexo
- lógica exclusiva daquele componente

---

# Passo 11 — Criar stores (`presentation/stores`)

Apenas se necessário.

Usar Zustand para:

- filtros
- estados temporários
- preferências de UI
- estado visual compartilhado na feature

---

# Passo 12 — Expor API pública (`index.ts`)

Toda feature deve expor apenas o necessário.

```ts
export { ProductsListPage } from './presentation/pages/products-list'
export type { Product } from './domain/entities'
```

Outras features só podem consumir recursos expostos pelo `index.ts`.

---

# Passo 13 — Registrar rotas e sidebar

Se a feature possuir páginas:

```text
app/routers
```

Registrar rotas protegidas/públicas quando necessário.

Se a página for acessada via menu lateral, registrar também em `navGroups`
(`app/layouts/system/constants/navlinks-sidebar.tsx`). Ver
`references/react/pages.md`.

---

# Passo 14 — Validar antes do PR

Executar:

```bash
pnpm lint
pnpm test
pnpm build
```

---

# Anti-patterns proibidos

❌ Criar UI antes de definir domínio

❌ Fazer chamadas HTTP dentro de components

❌ Fazer chamadas HTTP diretamente nos hooks

❌ DTO chegando na UI

❌ Importar internals de outra feature

❌ Colocar regra de negócio em componentes

❌ Colocar regra de negócio em mapper

❌ Criar service como função solta

❌ Criar API como função solta

❌ Mover algo para shared sem necessidade

---

# Regra principal

A feature deve nascer organizada.

Se você precisar reorganizar a feature logo após criá-la, você começou errado.