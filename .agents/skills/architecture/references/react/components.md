# Níveis de Componentes

## Hierarquia

```text
shared/components/ui
    ↓
shared/components/common
    ↓
features/.../presentation/components
```

---

# 1. UI Components (`shared/components/ui/`)

Componentes primitivos do **shadcn/ui**.

Instalados via CLI diretamente em:

```text
shared/components/ui/
```

São baseados em:

- Radix UI
- Tailwind CSS

---

## Adicionando novo componente

Sempre usar o CLI do shadcn.

Nunca criar manualmente componentes primitivos se já existir equivalente.

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add data-table
```

---

## Uso

```tsx
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
```

---

## Regras

- sem regra de negócio
- apenas props
- apenas callbacks
- sem hooks de dados
- sem API
- sem domínio

---

# 2. Shared Components (`shared/components/common/`)

Componentes reutilizáveis que combinam primitivos UI com lógica visual reutilizável.

---

## Regras

Podem ter:

- estado local
- paginação
- ordenação
- filtros visuais
- lógica de apresentação reutilizável

---

## Não podem

❌ acessar API

❌ acessar feature services

❌ importar features

---

## Exemplo

- Datatable
- FilePicker
- Wizard

```tsx
import {
  Table
} from '@/shared/components/ui/table'

import {
  Button
} from '@/shared/components/ui/button'

export function Datatable({
  data,
  onRowClick
}) {
  return (
    <Table>
      {data.map((row) => (
        <button
          key={row.id}
          onClick={() =>
            onRowClick(row)
          }
        >
          {row.name}
        </button>
      ))}
    </Table>
  )
}
```

---

# 3. Feature Components (`presentation/components/`)

Vivem em:

```text
features/<feature>/presentation/components/
```

São específicos do domínio da feature.

---

## Estrutura

```text
presentation/components/
├── operator-list.tsx
├── operator-card.tsx
│
└── operator-form/
    ├── operator-form.tsx
    └── use-operator-form.ts
```

---

# Hooks locais de componente

Quando o hook é usado por apenas um componente:

```text
presentation/components/<component>/use-<component>.ts
```

Exemplo:

```text
use-operator-form.ts
```

Usado para:

- React Hook Form
- lógica de modal
- stepper local
- estado complexo local
- orchestration exclusiva do componente

---

# Feature Components podem consumir

- `presentation/hooks/use-queries.ts`
- `presentation/hooks/use-mutations.ts`
- hooks compartilhados da feature
- hooks locais do próprio componente
- `shared/components/ui`
- `shared/components/common`

---

## Exemplo correto

```tsx
import { Button } from '@/shared/components/ui/button'
import { Datatable } from '@/shared/components/common/datatable'

import {
  useOperatorsQuery
} from '../hooks/use-queries'

export function OperatorList() {
  const {
    data,
    isLoading
  } = useOperatorsQuery()

  return (
    <Datatable
      data={data}
      isLoading={isLoading}
    />
  )
}
```

---

# Exemplo correto com mutation

```tsx
import {
  useCreateOperatorMutation
} from '../hooks/use-mutations'

export function CreateOperatorButton() {
  const { mutate } =
    useCreateOperatorMutation()

  return (
    <button
      onClick={() =>
        mutate(data)
      }
    >
      Criar
    </button>
  )
}
```

---

# O que feature components NÃO podem fazer

❌ HTTP direto

❌ chamar API diretamente

❌ chamar service diretamente

❌ usar DTO

❌ importar internals de outra feature

❌ regra de negócio

---

## Errado

```tsx
export function OperatorList() {
  const [data, setData] =
    useState([])

  useEffect(() => {
    httpClient
      .get('/operators')
      .then((res) =>
        setData(res.data)
      )
  }, [])
}
```

---

## Errado

```tsx
import {
  ProductService
} from '@/features/products/domain/services/product-service'
```

---

## Correto

Consumir outra feature apenas via:

```text
index.ts
```

---

# Regra principal

Quanto mais genérico:

```text
shared/
```

Quanto mais específico de domínio:

```text
feature/presentation/components
```

Componentes nunca devem absorver responsabilidades de dados ou domínio.