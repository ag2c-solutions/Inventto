# Data Flow

A aplicação utiliza um fluxo previsível de dados baseado em:

- Feature-Based Architecture
- 3-Tier Architecture
- CQRS pragmático

O objetivo é manter:

- UI desacoplada
- domínio protegido
- integração previsível
- código fácil de manter

Esta doc trata apenas da **sequência** de chamadas entre camadas. Para a
responsabilidade de cada camada (o que `data/api`, `domain/services`,
`presentation/hooks` etc. fazem), ver `references/architecture/layers/features.md`.

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

`use-mutations.ts` controla o feedback via `meta.successMessage`,
`meta.errorMessage` e `meta.suppressErrorToast` (ver
`references/architecture/layers/features.md`).

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

## Component acessando dados diretamente

❌

```ts
supabase.from(...).select(...)
fetch(...)
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

## Hook chamando supabase diretamente

❌

```ts
supabase.from(...).select(...)
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
