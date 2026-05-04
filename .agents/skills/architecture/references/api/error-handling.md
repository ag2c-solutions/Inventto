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

Esses handlers interceptam erros técnicos externos, mapeiam status HTTP para mensagens legíveis e **sempre relançam** usando:

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
import { AxiosError } from 'axios'

export function handleOperatorError(
  error: Error | unknown,
  action: string
): never {
  let message = 'Ocorreu um erro inesperado na operação.'

  if (error instanceof AxiosError) {
    const status = error.response?.status
    const apiMessage = error.response?.data?.message

    switch (status) {
      case 400:
        message =
          apiMessage ||
          'Dados inválidos para esta operação.'
        break

      case 403:
        message =
          'Você não tem permissão para realizar esta ação.'
        break

      case 404:
        message =
          apiMessage ||
          'Recurso não encontrado.'
        break

      case 409:
        message =
          apiMessage ||
          'Conflito: o registro já existe.'
        break

      case 500:
        message =
          'Erro interno no servidor. Tente novamente mais tarde.'
        break
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  throw new Error(message)
}
```

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

      const { data } =
        await httpClient.post(
          '/operators',
          payload
        )

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
        error instanceof AxiosError &&
        error.response?.status === 401
      ) {
        return
      }

      if (
        mutation.meta?.suppressErrorToast
      ) {
        return
      }

      const customMessage =
        mutation.meta?.errorMessage

      const backendMessage =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido'

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

## 5. Infraestrutura — Interceptors via Bootstrap

O erro `401` continua sendo tratado na infraestrutura.

A infra não pode importar stores diretamente.

```ts
setupHttpClientInterceptors(
  getToken,
  () => {
    const isLoggingOut =
      useAuthStore.getState().status ===
      'unauthenticated'

    if (!isLoggingOut) {
      window.dispatchEvent(
        new CustomEvent(
          'on-session-expired'
        )
      )

      useAuthStore
        .getState()
        .logout()
    }
  }
)
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
| Erro técnico externo | `data/handlers/*-error-handler.ts` |
| Exibição de toast | `MutationCache` global |
| Mensagem customizada | `meta.errorMessage` |
| Toast de sucesso | `meta.successMessage` |
| Supressão de toast | `meta.suppressErrorToast` |
| HTTP 401 | Interceptor em `infra/api` |

---

# Feedback ao Usuário

Todo erro visível ao usuário deve ser exibido via `MutationCache`.

Nunca usar:

- `alert()`
- `console.error()`
- `toast.error()` direto em feature
- `onError` duplicando toast