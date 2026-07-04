# Hooks

## Convenção de Arquivos

| Arquivo | Conteúdo |
|----------|-----------|
| `presentation/hooks/use-queries.ts` | Todas as queries da feature (TanStack Query) |
| `presentation/hooks/use-mutations.ts` | Todas as mutations da feature (TanStack Query) |
| `presentation/components/<n>/hooks/use-<n>.ts` | Hook local do componente (React Hook Form, contextos, lógica de UI) |

---

# `presentation/hooks/use-queries.ts`

Todas as queries da feature em um único arquivo, exportadas individualmente.

Queries simples podem consumir diretamente a camada `data/api`, pois não possuem regra de negócio.

```ts
import { useQuery } from '@tanstack/react-query'

import { OperatorAPI } from '../../data/api'

export function useOperatorsQuery() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: OperatorAPI.getAll
  })
}

export function useOperatorQuery(id: string) {
  return useQuery({
    queryKey: ['operators', id],
    queryFn: () => OperatorAPI.getById(id),
    enabled: !!id
  })
}
```

---

# Fluxo de Queries

```text
Data API
↓
Hook
↓
Component
```

A API já retorna modelos de domínio após usar mapper internamente.

---

# `presentation/hooks/use-mutations.ts`

Todas as mutations da feature em um único arquivo.

Mutations devem obrigatoriamente passar pelo `domain/services`.

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OperatorService } from '../../domain/services'

export function useCreateOperatorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: OperatorService.create,

    meta: {
      successMessage: 'Operador criado com sucesso!'
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['operators']
      })
    }
  })
}

export function useUpdateOperatorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: OperatorService.update,

    meta: {
      successMessage: 'Operador atualizado com sucesso!'
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['operators']
      })
    }
  })
}
```

---

# Fluxo de Mutations

```text
Component
↓
Hook
↓
Domain Service
↓
API
```

Services podem:

- validar domínio
- aplicar regras de negócio
- lançar erros

---

# Mutation com mensagens customizadas via `meta`

O `MutationCache` global lê `mutation.meta`.

| Campo `meta` | Efeito |
|--------------|----------|
| `successMessage` | Toast de sucesso |
| `errorMessage` | Substitui mensagem padrão |
| `suppressErrorToast` | Suprime toast |

---

# Hooks de Componente

Componentes com lógica própria continuam mantendo hooks locais junto ao componente, sempre dentro de `hooks/`.

```text
presentation/components/operator-form/
├── hooks/
│   └── use-operator-form.ts
└── index.tsx
```

Esses hooks podem usar:

- React Hook Form
- Context API
- useState
- useReducer
- hooks da própria feature

---

# Onde colocar cada hook

| Situação | Onde colocar |
|----------|----------------|
| Hook usado por apenas um componente | `presentation/components/<n>/hooks/use-<n>.ts` |
| Hook compartilhado por múltiplos componentes | `presentation/hooks/use-<context>.ts` |
| Queries TanStack Query | `presentation/hooks/use-queries.ts` |
| Mutations TanStack Query | `presentation/hooks/use-mutations.ts` |

---

# Regras

- `use-queries.ts` e `use-mutations.ts` são os únicos pontos de contato com TanStack Query
- Nunca usar `onError` nos hooks para toast global
- Hook usado por apenas um componente → fica no componente
- Hook compartilhado → vai para `presentation/hooks`
- Query keys devem seguir hierarquia previsível
- Hooks nunca chamam o cliente `supabase` diretamente
- Queries simples chamam `data/api`
- Mutations chamam `domain/services`
- Hooks não fazem regra de negócio