# Tratamento de Erros

## Três Níveis de Tratamento

---

## 1. Validação — Zod

Erros de formulário antes de chegar no domínio ou na API.

```ts
import { z } from 'zod'

export const operatorSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
})

export type OperatorFormData = z.infer<typeof operatorSchema>
```

Integração com React Hook Form:

```tsx
const {
  register,
  handleSubmit,
  formState: { errors }
} = useForm<OperatorFormData>({
  resolver: zodResolver(operatorSchema),
})
```

---

## 2. Erros Técnicos Externos — `data/handlers`

Cada feature possui handlers em:

```text
features/<feature>/data/handlers/
```

Esses handlers interceptam erros técnicos externos, mapeiam erros do Postgres/Supabase para mensagens legíveis e **sempre relançam** usando:

```ts
throw new Error(message)
```

Nunca retornam string.

O tipo de retorno deve ser:

```ts
never
```

Porque obrigatoriamente lançam exceção.

```ts
import type { PostgrestError } from '@supabase/supabase-js'

import { isPostgrestError } from '@/infra/supabase/guards/is-postgres-error'

export function handleOperatorError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  let message = 'Ocorreu um erro inesperado na operação.'

  if (isPostgrestError(error)) {
    switch (error.code) {
      case '23505': // unique_violation
        message = 'Já existe um registro com estes dados.'
        break

      case '23503': // foreign_key_violation
        message =
          'Operação inválida: registro relacionado não encontrado.'
        break

      case '23502': // not_null_violation
        message = 'Dados obrigatórios ausentes.'
        break
    }

    if (error.message.toLowerCase().includes('network')) {
      message = 'Erro de conexão. Verifique sua internet.'
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  throw new Error(message)
}
```

O guard `isPostgrestError` (em `infra/supabase/guards/`) identifica erros do
Postgres/Supabase; os códigos são os do Postgres (`23505` = duplicado,
`23503` = FK, `23502` = campo obrigatório).

---

## Uso na API

O handler deve ser usado na camada `data/api`.

```ts
export class OperatorAPI {
  static async create(
    model: Operator
  ): Promise<Operator> {
    try {
      const payload =
        OperatorMapper.toDTO(model)

      const { data, error } = await supabase
        .from('operators')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      return OperatorMapper.toDomain(data)
    } catch (error) {
      handleOperatorError(
        error,
        'createOperator'
      )
    }
  }
}
```

---

## 3. Erros de Domínio — `domain/services`

Services também podem lançar erros.

Isso acontece quando houver:

- validação de domínio
- regra de negócio
- operação inválida
- inconsistência de estado

```ts
export class OrderService {
  static async approve(
    order: Order
  ): Promise<Order> {
    if (order.status === 'cancelled') {
      throw new Error(
        'Pedido cancelado não pode ser aprovado.'
      )
    }

    if (!order.items.length) {
      throw new Error(
        'Pedido sem itens não pode ser aprovado.'
      )
    }

    return OrderAPI.approve(order)
  }
}
```

Esse erro também sobe para o `MutationCache`.

---

## 4. Mutations — `MutationCache` Global

O erro relançado pelo handler ou pelo service é capturado automaticamente pelo `MutationCache`.

```ts
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (
      error,
      _variables,
      _context,
      mutation
    ) => {
      if (
        mutation.meta?.suppressErrorToast
      ) {
        return
      }

      const customMessage =
        mutation.meta?.errorMessage

      const backendMessage =
        error.message ?? 'Erro desconhecido'

      toast.error(
        customMessage ||
          `Erro na operação: ${backendMessage}`
      )
    },

    onSuccess: (
      _data,
      _variables,
      _context,
      mutation
    ) => {
      if (
        mutation.meta?.successMessage
      ) {
        toast.success(
          mutation.meta.successMessage
        )
      }
    }
  }),

  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
})
```

---

## Customizando feedback via `meta`

```ts
return useMutation({
  mutationFn: OperatorService.create,

  meta: {
    successMessage:
      'Operador criado com sucesso!'
    // errorMessage
    // suppressErrorToast
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['operators']
    })
  }
})
```

| Campo `meta` | Efeito |
|---|---|
| `successMessage` | Toast de sucesso |
| `errorMessage` | Sobrescreve erro padrão |
| `suppressErrorToast` | Suprime toast |

---

## 5. Sessão — `onAuthStateChange` do Supabase

Expiração de sessão e mudanças de auth **não** passam por interceptor HTTP. O
Supabase gerencia a sessão (refresh automático) e notifica via `onAuthStateChange`.

A feature `auth` encapsula essa assinatura e expõe um `subscribe` para o app reagir
(ex: logout, redirecionar para login):

```ts
static async subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return () => {
    subscription.unsubscribe()
  }
}
```

---

# Fluxo Completo de Erro

```text
API error
→ data/handlers
→ throw Error

ou

domain/service
→ throw Error

→ hook
→ MutationCache
→ toast
```

---

# Regra de Responsabilidade

| Tipo de erro | Onde tratar |
|---|---|
| Campo inválido no formulário | Zod schema |
| Validação de domínio | `domain/services` ou `domain/validators` |
| Violação de regra de negócio | `domain/services` |
| Erro técnico externo | `data/handlers/error-handler.ts` |
| Exibição de toast | `MutationCache` global |
| Mensagem customizada | `meta.errorMessage` |
| Toast de sucesso | `meta.successMessage` |
| Supressão de toast | `meta.suppressErrorToast` |
| Sessão expirada / mudança de auth | `supabase.auth.onAuthStateChange` (feature `auth`) |

---

# Feedback ao Usuário

Todo erro visível ao usuário deve ser exibido via `MutationCache`.

Nunca usar:

- `alert()`
- `console.error()`
- `toast.error()` direto em feature
- `onError` duplicando toast