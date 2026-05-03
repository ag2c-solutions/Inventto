# Lint e Formatação

## Ferramentas

- **ESLint** → análise estática
- **Prettier** → formatação
- **TypeScript (`tsc`)** → validação de tipos
- **Husky** → automação de pre-commit
- **lint-staged** → valida apenas arquivos alterados
- **Vitest** → valida testes relacionados no pre-commit

---

# Scripts

```bash
pnpm lint
```

Verifica regras de lint.

---

```bash
pnpm lint --fix
```

Corrige automaticamente o que for possível.

---

```bash
pnpm type-check
```

Executa validação completa de tipagem.

Exemplo:

```bash
tsc --noEmit
```

---

```bash
pnpm test
```

Executa a suíte completa de testes.

---

# Pre-commit

O projeto utiliza `husky` + `lint-staged`.

Arquivos alterados executam:

```bash
pnpm lint --fix
pnpm vitest related --run --passWithNoTests
```

---

## Validação de tipos no pre-commit

Lint não detecta vários erros de TypeScript.

Exemplo real:

- incompatibilidade de generics
- erro de resolver do React Hook Form
- erros de contracts
- problemas de inferência

Por isso pode ser necessário adicionar:

```bash
tsc-files --noEmit
```

Exemplo:

```json
{
  "src/**/*.{ts,tsx}": [
    "tsc-files --noEmit",
    "pnpm lint --fix",
    "pnpm vitest related --run --passWithNoTests"
  ]
}
```

Isso evita que erros de tipagem cheguem no CI/CD.

---

# ESLint Arquitetural

O ESLint também protege regras da arquitetura.

Exemplo:

### Feature não pode importar internals de outra feature

```ts
// PROIBIDO
import { ProductService } from '@/features/products/domain/services/product-service'
```

---

### Correto

```ts
import { getProducts } from '@/features/products'
```

---

### Camadas devem respeitar boundaries

Exemplo proibido:

```ts
// presentation chamando http client
import { httpClient } from '@/infra/api'
```

```ts
// domain importando React
import { useState } from 'react'
```

```ts
// data importando store
import { useAuthStore } from '../presentation/stores'
```

---

# Convenções TypeScript

---

## Props de componentes

Sempre tipar props explicitamente.

```ts
interface OperatorProps {
  id: string
  onSelect: (id: string) => void
}
```

---

## `type` vs `interface`

Use:

- `type` → unions/intersections
- `interface` → contratos de objetos simples

---

## Evite `any`

```ts
// PROIBIDO
const handleSelect = (data: any) => {}
```

```ts
// CORRETO
const handleSelect = (data: unknown) => {}
```

---

## Imports de tipos

Sempre usar:

```ts
import type { Operator } from '../../domain/entities/operator'
```

---

# Convenções para Componentes

---

## Componentes exportados

Usar function declaration:

```tsx
export function OperatorList() {
  return null
}
```

---

## Callbacks internos

Usar arrow functions:

```ts
const handleClick = () => {}
```

---

# Convenções para Services

Services devem ser classes estáticas.

```ts
export class OperatorService {
  static async create() {}
}
```

---

# Convenções para API

APIs devem ser classes estáticas.

```ts
export class OperatorAPI {
  static async getAll() {}
}
```

---

# Convenções para Mapper

Mappers devem ser classes estáticas.

```ts
export class OperatorMapper {
  static toDomain() {}
}
```

---

# Formatação (Prettier)

Configuração padrão:

- aspas simples (`'`)
- sem ponto e vírgula
- largura máxima: `100`
- trailing comma: `es5`

---

# Regra principal

Código precisa passar por:

- lint
- type check
- testes relacionados
- boundaries arquiteturais

antes de qualquer PR.