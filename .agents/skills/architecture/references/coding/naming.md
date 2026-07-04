# Convenções de Nomenclatura

## Arquivos e Pastas

| Tipo | Padrão | Exemplo |
|---|---|---|
| Pastas | kebab-case | `features/operator-groups/` |
| Arquivo de entrada da camada | `index.ts` na pasta da camada | `data/mappers/index.ts` |
| Componentes | pasta kebab-case + `index.tsx` | `components/operator-list/index.tsx` |
| Hooks de query/mutation | nome fixo | `use-queries.ts`, `use-mutations.ts` |
| Hooks locais/de contexto | `use-<nome>.ts` | `use-operator-form.ts` |
| Handler de erro | `error-handler.ts` | `data/handlers/error-handler.ts` |
| Factory de teste | `<nome>.factory.ts` | `tests/factories/operator.factory.ts` |
| Teste | `*.test.ts(x)` colocado | `index.test.ts` |
| Barrel público da feature | `index.ts` na **raiz** da feature | `features/operators/index.ts` |

> As camadas `data/api`, `data/dtos`, `data/mappers`, `domain/entities`,
> `domain/services` e `domain/validators` contêm o artefato **direto** num
> `index.ts` (arquivo de entrada da camada — a classe/interface fica ali, não é
> re-export). Isso permite `import { OperatorMapper } from '../mappers'`. Não usar
> arquivos nomeados como `operator-mapper.ts`. Exceção: handlers usam `error-handler.ts`.
>
> O **barrel** (re-export da superfície pública) existe **apenas** na raiz da
> feature (`features/<nome>/index.ts`). É o único ponto de consumo por outras
> features. As camadas internas **não** têm barrel de re-export.

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

# Onde cada artefato mora

Cada artefato de camada vive no `index.ts` da sua pasta e é identificado pelo
**nome do export**, não por sufixo de arquivo.

| Artefato | Local | Export |
|---|---|---|
| DTO | `data/dtos/index.ts` | `export interface OperatorDTO` |
| Entidade de domínio | `domain/entities/index.ts` | `export interface Operator` |
| Domain service | `domain/services/index.ts` | `export class OperatorService` |
| Data API | `data/api/index.ts` | `export class OperatorAPI` |
| Mapper | `data/mappers/index.ts` | `export class OperatorMapper` |
| Handler de erro | `data/handlers/error-handler.ts` | `export function handleOperatorError` |
| Hook | `presentation/hooks/use-*.ts` | `export function useOperatorsQuery` |
| Teste | `*.test.ts(x)` colocado | — |

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

Sempre dentro de `hooks/`, ao lado do `index.tsx` do componente — nunca solto
na raiz da pasta do componente.

Exemplo:

```text
operator-form/hooks/use-operator-form.ts
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
export { OperatorsPage } from './presentation/pages/operators-list'
export type { Operator } from './domain/entities'
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