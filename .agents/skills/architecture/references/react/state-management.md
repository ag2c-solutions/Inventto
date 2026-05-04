# Gestão de Estado

## Regra de Decisão

```text
Dado vem da API?
→ TanStack Query

Dado é estado compartilhado de UI?
→ Zustand

Dado pertence apenas a um componente?
→ React local state / hook local
```

---

# 1. Server State — TanStack Query

Para qualquer dado que vem do backend.

Hooks de server state vivem em:

```text
presentation/hooks/use-queries.ts
presentation/hooks/use-mutations.ts
```

---

## Queries

```ts
const {
  data,
  isLoading,
  error
} = useOperatorsQuery()
```

Responsável por:

- cache
- loading
- retry
- refetch
- stale state
- sincronização com backend

---

## Mutations

```ts
const { mutate } =
  useCreateOperatorMutation()
```

Responsável por:

- create
- update
- delete
- cache invalidation
- optimistic updates

---

## Feedback de mutations

Erros e sucesso são tratados pelo:

```text
MutationCache
```

via:

- `meta.successMessage`
- `meta.errorMessage`
- `meta.suppressErrorToast`

---

## Regras

Nunca usar:

```ts
useState + useEffect
```

para dados da API.

---

## Errado

```ts
const [operators, setOperators] =
  useState([])

useEffect(() => {
  getOperators().then(
    setOperators
  )
}, [])
```

---

## Correto

```ts
const {
  data: operators
} = useOperatorsQuery()
```

---

# 2. Estado Global de UI — Zustand

Para estado compartilhado de UI.

---

## Onde fica

Estados globais da feature:

```text
features/<feature>/presentation/stores/
```

Estados globais transversais:

```text
shared/
```

ou feature específica como `auth`.

---

## Exemplo

```ts
interface AuthStore {
  token: string | null
  setToken: (
    token: string
  ) => void
  clearToken: () => void
}

export const useAuthStore =
  create<AuthStore>((set) => ({
    token: null,

    setToken: (token) =>
      set({ token }),

    clearToken: () =>
      set({ token: null })
  }))
```

---

## Casos de uso

- auth token
- tema
- menu lateral
- filtros persistidos
- preferências
- estado visual compartilhado

---

## Zustand NÃO deve armazenar

❌ dados da API

❌ listas do backend

❌ detalhes carregados por query

Isso pertence ao React Query.

---

# 3. Estado Local — React Hooks

Para estado exclusivo do componente.

---

## Exemplos simples

```ts
const [isOpen, setIsOpen] =
  useState(false)

const [
  selectedId,
  setSelectedId
] = useState<string | null>(
  null
)
```

---

## Exemplos complexos

Use:

- `useReducer`
- hook local do componente

---

# Hooks locais de componente

Quando a lógica pertence apenas a um componente:

```text
presentation/components/<component>/use-<component>.ts
```

Exemplo:

```text
presentation/components/operator-form/
├── operator-form.tsx
└── use-operator-form.ts
```

---

## Casos de uso

- React Hook Form
- modal flow
- wizard
- multi-step form
- UI orchestration local

---

# 4. Estado compartilhado entre múltiplos componentes da feature

Quando múltiplos componentes precisam compartilhar comportamento mas não é estado global da aplicação.

Use:

```text
presentation/hooks/use-<context>.ts
```

Exemplo:

```text
presentation/hooks/use-buy-simulation.ts
```

Usado por:

- form
- card
- modal
- summary

---

# Realtime State

Clientes de:

- SSE
- SignalR
- WebSocket

podem atualizar diretamente:

```text
React Query Cache
```

Exemplo:

```ts
queryClient.setQueryData(...)
```

---

# Anti-patterns

---

## useState para API

❌

```ts
const [users, setUsers] =
  useState([])
```

---

## Zustand para dados do backend

❌

```ts
const users =
  useUserStore()
```

---

## Hook local compartilhado entre múltiplos componentes

❌

```text
components/form/use-form.ts
```

sendo usado por vários componentes.

Nesse caso deve ir para:

```text
presentation/hooks/
```

---

# Regra principal

Server state:

```text
TanStack Query
```

UI global:

```text
Zustand
```

UI local:

```text
React hooks
```

Essa separação evita duplicação de estado e inconsistência.