# Camadas internas de uma Feature

Cada feature vive em:

```text
features/<nome>/
```

Cada feature é **autocontida** e encapsula um domínio específico do negócio.

Uma feature não pode acessar internals de outra feature.

A comunicação entre features deve acontecer apenas via:

```text
index.ts
```

Para o fluxo de dados entre as camadas (query/mutation), ver
`references/architecture/data-flow.md`.

---

# Estrutura de Pastas

```text
features/buy-simulation/
│
├── presentation/
│   ├── components/
│   │   ├── buy-simulation-form/
│   │   │   ├── hooks/
│   │   │   │   └── use-buy-simulation-form.ts
│   │   │   └── index.tsx
│   │   │
│   │   └── buy-simulation-content/
│   │       └── index.tsx
│   │
│   ├── hooks/
│   │   ├── use-queries.ts
│   │   ├── use-mutations.ts
│   │   └── use-buy-simulation.ts
│   │
│   ├── stores/
│   │
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

> As pastas auxiliares `constants/` e `utils/` **não têm posição fixa**: podem
> existir dentro de qualquer camada (`presentation/`, `domain/`, `data/`), conforme
> a necessidade do artefato. Ex: `data/utils/`, `domain/utils/`,
> `presentation/constants/`. Coloque-as na camada que efetivamente as usa.

---

# Presentation

Tudo relacionado à interface e à interação do usuário. Nunca contém regra de
negócio nem acessa dados diretamente.

---

## `presentation/components/`

Componentes específicos da feature. Recebem dados exclusivamente via hooks.

Responsáveis por:

- renderizar UI
- capturar interação
- submit
- clique
- modal
- navegação visual

### Components NÃO podem:

❌ fazer HTTP

❌ usar DTO

❌ conter regra de negócio

❌ acessar API diretamente

---

### `presentation/components/<component>/hooks/use-<component>.ts`

Hook exclusivo de um único componente. Fica sempre dentro de `hooks/`, mesmo
quando é o único hook do componente. Ver `references/react/components.md`
para a estrutura interna completa de um componente (`schema/`, `hooks/`,
`pieces/`, `types/`, `utils/`).

Exemplo:

- formulário
- modal
- wizard
- lógica local

```text
presentation/components/buy-simulation-form/
├── hooks/
│   └── use-buy-simulation-form.ts
└── index.tsx
```

---

## `presentation/hooks/`

Responsáveis por:

- TanStack Query
- queries
- mutations
- cache
- invalidation
- loading state
- optimistic updates
- integração com MutationCache

Também podem acessar:

- Zustand
- contexto visual

### Hooks podem chamar:

### Queries

```text
Data API
```

### Mutations

```text
Domain Service
```

### Hooks NÃO podem:

❌ chamar o cliente `supabase`

❌ conter regra de negócio

❌ fazer mapper manual

❌ importar infra de browser diretamente (`LocalStorageService` etc.)

---

### Infra técnica de browser (localStorage, sessionStorage, etc.)

Assim como `use-queries.ts`/`use-mutations.ts` são o único ponto de contato
com TanStack Query, o acesso a infra de browser deve passar por **um hook
compartilhado dedicado** (ex: `shared/hooks/use-local-storage`).

Hooks de feature ou de componente nunca importam `infra/local-storage`
diretamente — sempre consomem o hook compartilhado. Ver
`references/architecture/layers/shared.md`.

---

### `presentation/hooks/use-queries.ts`

Centraliza todas as queries da feature. Único ponto de uso de `useQuery`.

---

### `presentation/hooks/use-mutations.ts`

Centraliza todas as mutations da feature. Único ponto de uso de `useMutation`.

---

### `presentation/hooks/use-<context>.ts`

Hooks compartilhados por dois ou mais componentes da feature.

Exemplo:

```text
presentation/hooks/use-buy-simulation.ts
```

Usado por:

- form
- content
- card
- modal

---

### Onde colocar cada hook

A decisão depende de quantos componentes consomem o hook.

| Situação | Onde colocar |
|---|---|
| Hook usado por apenas um componente | `presentation/components/<n>/hooks/use-<n>.ts` |
| Hook compartilhado por múltiplos componentes | `presentation/hooks/use-<context>.ts` |
| Queries TanStack Query | `presentation/hooks/use-queries.ts` |
| Mutations TanStack Query | `presentation/hooks/use-mutations.ts` |

Exemplo:

```text
presentation/hooks/use-buy-simulation.ts
```

Compartilhado entre form, content e card.

```text
presentation/components/buy-simulation-form/hooks/use-buy-simulation-form.ts
```

Exclusivo do formulário.

---

## `presentation/stores/`

Stores de UI da feature.

Exemplo:

- filtros
- estado visual
- preferência local

---

## `presentation/pages/`

Vivem em:

```text
presentation/pages
```

Componente de entrada de uma rota. Compõe os componentes da feature e é o
ponto onde a orquestração de dados da tela acontece.

Podem:

- chamar hooks de query
- ler parâmetros de rota (`useParams`, `useSearchParams`)
- tratar loading de topo (skeleton)
- compor componentes e passar dados por props

Detalhes e regras em `references/react/pages.md`.

---

# Domain

Núcleo da regra de negócio da feature. Não conhece HTTP, DTO, nem React.

---

## `domain/services/`

Casos de uso. Devem ser classes com métodos estáticos.

Exemplo:

```text
BuySimulationService
```

Responsáveis por:

- regras de negócio
- validações
- orquestração
- decisões de domínio
- erros de negócio

### Services podem:

- chamar APIs da própria feature
- lançar erros
- coordenar múltiplas chamadas

### Services NÃO podem:

❌ usar React

❌ usar React Query

❌ fazer HTTP direto

❌ acessar components

---

## `domain/validators/`

Responsáveis por validações reutilizáveis de domínio.

---

## `domain/entities/`

Modelos puros do domínio — o formato que a aplicação consome internamente,
livre dos contratos externos da API.

São **apenas tipos/interfaces**. Não contêm lógica, não importam outras
camadas.

O mapper converte `DTO → Entity`; toda a UI e os services trabalham sobre
Entities, nunca sobre DTOs.

---

# Data

A ACL (Anti-Corruption Layer) da feature: fronteira externa que isola o resto
da aplicação do formato bruto que vem do backend, convertendo DTO ⇄ Entity e
normalizando erros técnicos. É a única camada autorizada a conhecer o formato
de dados externos (backend, integrações) — `domain/` nunca deve tocá-los.

---

## `data/api/`

Chamadas HTTP. Classes estáticas.

Exemplo:

```text
BuySimulationAPI
```

Responsáveis por:

- chamadas HTTP
- integração externa
- uso de mapper
- uso de handlers

### APIs NÃO podem:

❌ conter regra de negócio

❌ usar React

❌ acessar hooks

---

## `data/dtos/`

Contratos literais do que a API externa envia e recebe — o formato "sujo" do
mundo externo.

São **apenas tipos/interfaces**. Ficam confinados à camada `data`: nunca vazam
para `domain` ou `presentation`. Só o mapper os traduz para Entities.

---

## `data/mappers/`

Conversão:

```text
DTO ⇄ Domain
```

Sem side-effects.

---

## `data/handlers/`

Responsáveis por:

- normalizar erros externos
- traduzir status HTTP
- relançar erros previsíveis

---

# `tests/`

Configuração de mocks da feature, isolada do código de produção.

## `tests/factories/`

Factories de Domain e DTO (Fishery + Faker). Fonte única de dados de teste —
nunca usar objetos hardcoded nos testes.

## `tests/mocks/`

Handlers e server do MSW — padrão pretendido para integrações HTTP de `infra/`
(Cloudinary, ViaCEP, e-mail); features Supabase mockam a classe de Data API.
**Ainda não adotado**: hoje essas integrações são testadas stubando
`global.fetch` diretamente. Ver `references/quality/testing.md`.

Os arquivos de teste em si (`*.test.ts`/`*.test.tsx`) ficam **colocalizados**
ao arquivo testado, não em `tests/`. Ver `references/quality/testing.md`.

---

# `index.ts`

API pública da feature. Único ponto permitido para consumo externo por outras
features.

---

# Regras de Comunicação entre Camadas

| De | Pode chamar | Não pode chamar |
|---|---|---|
| Page | Hook, Component | Domain Service direto, API, supabase |
| Component | Hook | Service, API, supabase |
| Hook (query) | Data API | supabase, infra de browser direto |
| Hook (mutation) | Domain Service | supabase, infra de browser direto |
| Hook (infra de browser) | hook compartilhado dedicado (`use-local-storage`) | `infra/local-storage` direto |
| Domain Service | Data API | Hook, Component |
| Domain Entity | — | qualquer outra camada (é só tipo) |
| Data API | Mapper, Handler, Infra | Hook, Component |
| Data DTO | — | qualquer outra camada (é só tipo) |
| Mapper | DTO, Entity | Hook, Component, Infra, Service |
| Handler | — | qualquer outra camada |

---

# Regras

- Features não importam internals de outras features
- Features podem importar `shared/`
- Features podem importar `infra/`
- Comunicação entre features ocorre apenas via `index.ts`
- Toda nova feature segue essa estrutura
- `use-queries.ts` e `use-mutations.ts` são os únicos pontos de contato com React Query
- Hook usado por um único componente → fica no componente
- Hook usado por múltiplos componentes → vai para `presentation/hooks`
- Componentes não fazem HTTP
- Hooks não chamam o cliente `supabase`
- Services não usam React
- API não contém regra de negócio

---

# Regra principal

Cada camada possui uma única responsabilidade clara.

Se uma camada começar a absorver responsabilidade da outra:

a arquitetura começou a degradar.
