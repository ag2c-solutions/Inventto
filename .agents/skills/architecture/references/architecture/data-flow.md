# Data Flow

A aplicação utiliza um fluxo previsível de dados baseado em:

- Feature-Sliced Design
- 3-Tier Architecture
- CQRS pragmático

O objetivo é manter:

- UI desacoplada
- domínio protegido
- integração previsível
- código fácil de manter

---

# Fluxo de Leitura (Queries)

Leituras simples normalmente não precisam passar pelo domínio.

Exemplo:

- listagens
- detalhes
- consultas
- filtros
- dashboards

Fluxo oficial:

```text
Data/API
↓
Presentation/Hooks/use-queries
↓
Presentation/Component
```

O `mapper` continua existindo, mas ele é responsabilidade interna da API.

```text
API
↓
Mapper
↓
Hook
↓
Component
```

Handlers também podem participar quando houver erro técnico:

```text
API
↓
Handler
↓
throw Error
```

---

# Responsabilidade de cada camada

---

## `data/api`

Responsável por:

- chamadas HTTP
- integração externa
- comunicação com backend
- uso de mapper
- uso de handlers

Exemplo:

```ts
ProductAPI.getAll()
UserAPI.getById()
OrderAPI.getDashboard()
```

---

## `data/mapper`

Responsável por converter:

```text
DTO → Domain Entity
Domain Entity → DTO
```

A UI nunca deve consumir DTO diretamente.

O mapper é usado internamente pela API.

---

## `data/handlers`

Responsável por:

- normalizar erros externos
- mapear status HTTP
- relançar erros previsíveis

---

## `presentation/hooks/use-queries.ts`

Responsável por:

- TanStack Query
- cache
- loading state
- retry
- refetch
- orchestration de leitura

---

## `presentation/components`

Responsável apenas por renderizar os dados.

---

# Exemplo de Query

```text
Backend
↓
ProductDTO
↓
ProductAPI
  ↓
  ProductMapper
↓
useProductsQuery
↓
ProductsTable
```

---

# Fluxo de Escrita (Mutations)

Toda alteração de estado de negócio deve passar pelo domínio.

Exemplo:

- criar
- editar
- deletar
- aprovar
- cancelar
- finalizar

Fluxo oficial:

```text
Presentation/Component
↓
Presentation/Hooks/use-mutations
↓
Domain/Service
↓
Data/API
```

O mapper continua sendo responsabilidade interna da API.

```text
Domain Service
↓
API
  ↓
  Mapper
↓
Backend
```

Handlers também participam quando houver erro técnico:

```text
API
↓
Handler
↓
throw Error
```

---

# Responsabilidade de cada camada

---

## `presentation/components`

Captura interação:

- clique
- submit
- confirmação

---

## `presentation/hooks/use-mutations.ts`

Executa mutation com:

- React Query
- optimistic updates
- cache invalidation
- loading states
- `meta.successMessage`
- `meta.errorMessage`
- `meta.suppressErrorToast`

---

## `domain/services`

Responsável por:

- regras de negócio
- validações
- orquestração de mutações
- erros de domínio

Exemplo:

- approveProduct()
- cancelOrder()
- createUser()

Services podem lançar erros quando houver:

- regra inválida
- estado inválido
- validação de domínio

---

## `data/api`

Responsável por:

- enviar dados
- receber respostas
- usar mapper
- usar handlers

---

# Exemplo de Mutation

```text
CreateProductForm
↓
useCreateProductMutation
↓
ProductService.create()
↓
ProductAPI.create()
↓
ProductMapper
↓
Backend
```

---

# Fluxo de erro em mutation

```text
Erro técnico
↓
data/handlers
↓
throw Error
↓
MutationCache
↓
toast
```

ou

```text
Erro de negócio
↓
domain/service
↓
throw Error
↓
MutationCache
↓
toast
```

---

# Quando query pode usar service?

Por padrão:

**não usa**

Query simples deve permanecer:

```text
API → Hook → UI
```

---

## Exceção

Use service em leitura apenas quando existir:

- agregação complexa
- múltiplas APIs
- regra de autorização
- transformação pesada
- regra de negócio real

---

# Fluxos proibidos

---

## Component chamando API diretamente

❌

```ts
axios.get(...)
fetch(...)
api.get(...)
```

---

## Hook contendo regra de negócio

❌

```ts
if (user.role === 'admin') {
 ...
}
```

---

## DTO chegando na UI

❌

```tsx
component.props.productDto
```

---

## Service chamando React hooks

❌

```ts
useState()
useQuery()
```

---

## Hook chamando httpClient diretamente

❌

```ts
httpClient.get(...)
```

---

# Regra principal

## Query simples → fluxo curto

```text
API → Hook → UI
```

A API encapsula:

- mapper
- handlers

---

## Mutation → fluxo completo

```text
UI → Hook → Domain → API
```

A API encapsula:

- mapper
- handlers

Esse é o fluxo oficial do template.