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
pnpm test
```

Executa a suíte completa de testes.

> Não existe script `pnpm type-check` no projeto. A validação de tipos
> completa (`tsc -b --noEmit`) roda no **pre-push**, não como script avulso.

---

# Pre-commit

O projeto utiliza `husky` + `lint-staged`.

Arquivos alterados executam:

```bash
pnpm lint --fix
pnpm vitest related --run --passWithNoTests
```

Lint não detecta vários erros de TypeScript (incompatibilidade de generics,
erro de resolver do React Hook Form, problemas de inferência) — mas o
pre-commit **não** roda type-check hoje. Essa validação acontece no pre-push
(ver abaixo). Se um erro de tipo precisar ser barrado mais cedo, adicionar
`tsc-files --noEmit` ao `lint-staged` é uma opção, mas não é o que o projeto
faz atualmente.

---

# Pre-push

O hook `.husky/pre-push` faz duas coisas antes de permitir o push:

```bash
#!/usr/bin/env sh
branch_name=$(git rev-parse --abbrev-ref HEAD)

if [ "$branch_name" = "main" ]; then
  echo "❌ Erro: Commits diretos na branch main não são permitidos!"
  exit 1
fi

cd apps/stores
pnpm tsc -b --noEmit
```

- Bloqueia push direto para `main`
- Roda a validação completa de tipos (`tsc -b --noEmit`) — é aqui, não no
  pre-commit, que erros de tipagem são barrados antes do CI/CD

---

# ESLint Arquitetural

O ESLint também protege regras da arquitetura.

Exemplo:

### Feature não pode importar internals de outra feature

```ts
// PROIBIDO
import { ProductService } from '@/features/products/domain/services'
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
// presentation acessando o cliente de dados direto
import { supabase } from '@/infra/supabase'
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