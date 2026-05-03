# Convenções de Nomenclatura

## Arquivos e Pastas

| Tipo | Padrão | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `use-queries.ts` |
| Pastas | kebab-case | `features/operator-groups/` |
| Componentes | kebab-case | `operator-list.tsx` |
| Hooks locais | kebab-case | `use-operator-form.ts` |
| APIs | kebab-case | `operator-api.ts` |
| Services | kebab-case | `operator-service.ts` |
| Mappers | kebab-case | `operator-mapper.ts` |
| Handlers | kebab-case | `operator-error-handler.ts` |

---

# Estrutura da feature

Exemplo:

```text
features/operators/
├── presentation/
├── domain/
├── data/
└── index.ts
```

---

# Exports de Componentes

Componentes sempre exportados como `PascalCase`.

```ts
// operator-list.tsx
export function OperatorList() {}
```

---

# Classes

Classes devem usar `PascalCase`.

---

## Services

```ts
export class OperatorService {}
```

---

## APIs

```ts
export class OperatorAPI {}
```

---

## Mappers

```ts
export class OperatorMapper {}
```

---

# Sufixos Obrigatórios

| Sufixo | Quando usar | Exemplo |
|---|---|---|
| `*.dto.ts` | contrato da API | `operator.dto.ts` |
| `*.model.ts` | entidade de domínio | `operator.model.ts` |
| `*-service.ts` | domain services | `operator-service.ts` |
| `*-api.ts` | data api | `operator-api.ts` |
| `*-mapper.ts` | conversão DTO ⇄ Domain | `operator-mapper.ts` |
| `*-error-handler.ts` | handlers | `operator-error-handler.ts` |
| `*.test.ts` | testes | `operator.test.ts` |
| `use-*.ts` | hooks | `use-queries.ts` |

---

# Hooks

Hooks sempre usam prefixo:

```text
use-
```

---

## Queries

Nome fixo:

```text
use-queries.ts
```

Centraliza todas as queries da feature.

---

## Mutations

Nome fixo:

```text
use-mutations.ts
```

Centraliza todas as mutations da feature.

---

## Hooks compartilhados da feature

```text
use-<context>.ts
```

Exemplo:

```text
use-buy-simulation.ts
```

---

## Hooks locais de componente

```text
use-<component>.ts
```

Exemplo:

```text
use-operator-form.ts
```

---

# DTOs

DTO deve manter o naming do backend.

Exemplo:

```ts
full_name
created_at
```

Não normalize naming dentro do DTO.

O mapper faz isso.

---

# Domain Entities

Entidades devem ter nomes claros de domínio.

```ts
Operator
Product
Order
User
```

---

# Query Keys (TanStack Query)

Usar arrays hierárquicos.

```ts
['operators']
['operators', id]
['operators', 'detail', id]
```

Sempre começar pelo nome da feature.

---

# Index público da feature

Toda feature expõe apenas o necessário via:

```text
index.ts
```

Exemplo:

```ts
export { OperatorsPage } from './presentation/pages/operators-page'
export type { Operator } from './domain/entities/operator.model'
```

---

# O que evitar

❌ nomes genéricos:

```text
helpers.ts
utils.ts
service.ts
api.ts
mapper.ts
```

---

❌ nomes sem contexto:

```text
data.ts
types.ts
hook.ts
```

---

# Regra principal

O nome do arquivo deve deixar explícita sua responsabilidade sem precisar abrir o código.