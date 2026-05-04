# Organização Interna de uma Feature

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

---

# Estrutura de Pastas

```text
features/buy-simulation/
│
├── presentation/
│   ├── components/
│   │   ├── buy-simulation-form/
│   │   │   ├── buy-simulation-form.tsx
│   │   │   └── use-buy-simulation-form.ts
│   │   │
│   │   └── buy-simulation-content.tsx
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
│   ├── dto/
│   ├── mapper/
│   └── handlers/
│
└── index.ts
```

---

# Responsabilidade de Cada Camada

---

## `presentation/`

Responsável por tudo relacionado à UI.

### `presentation/components/`

Componentes específicos da feature.

Consomem hooks.

---

### `presentation/components/<component>/use-<component>.ts`

Hook exclusivo de um único componente.

Exemplo:

- formulário
- modal
- wizard
- lógica local

```text
presentation/components/buy-simulation-form/
├── buy-simulation-form.tsx
└── use-buy-simulation-form.ts
```

---

### `presentation/hooks/use-queries.ts`

Centraliza todas as queries da feature.

Único ponto de uso de `useQuery`.

---

### `presentation/hooks/use-mutations.ts`

Centraliza todas as mutations da feature.

Único ponto de uso de `useMutation`.

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

### `presentation/stores/`

Stores de UI da feature.

Exemplo:

- filtros
- estado visual
- preferência local

---

### `presentation/pages/`

Páginas específicas da feature.

---

# `domain/`

Núcleo da regra de negócio.

---

## `domain/entities/`

Modelos puros da aplicação.

---

## `domain/services/`

Casos de uso.

Devem ser classes com métodos estáticos.

Exemplo:

```text
BuySimulationService
```

Responsáveis por:

- regras de negócio
- validação
- orquestração
- lançamento de erros de domínio

---

## `domain/validators/`

Validações específicas do domínio.

---

# `data/`

Fronteira externa da feature.

---

## `data/api/`

Chamadas HTTP.

Classes estáticas.

Exemplo:

```text
BuySimulationAPI
```

---

## `data/dto/`

Contratos da API.

---

## `data/mapper/`

Conversão:

```text
DTO ⇄ Domain
```

---

## `data/handlers/`

Normalização de erros técnicos.

---

# `index.ts`

API pública da feature.

Único ponto permitido para consumo externo por outras features.

---

# Onde colocar cada hook

A decisão depende de quantos componentes consomem o hook.

| Situação | Onde colocar |
|---|---|
| Hook usado por apenas um componente | `presentation/components/<n>/use-<n>.ts` |
| Hook compartilhado por múltiplos componentes | `presentation/hooks/use-<context>.ts` |
| Queries TanStack Query | `presentation/hooks/use-queries.ts` |
| Mutations TanStack Query | `presentation/hooks/use-mutations.ts` |

---

# Exemplo

```text
presentation/hooks/use-buy-simulation.ts
```

Compartilhado entre:

- form
- content
- card

```text
presentation/components/buy-simulation-form/use-buy-simulation-form.ts
```

Exclusivo do formulário.

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
- Hooks não chamam `httpClient`
- Services não usam React
- API não contém regra de negócio