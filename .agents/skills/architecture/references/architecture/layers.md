# Camadas e Responsabilidades

## Visão Geral

A aplicação segue:

- Feature-Sliced Design
- 3-Tier Architecture
- CQRS pragmático

---

## Fluxo de Query

```text
React Components
      ↓
Presentation Hooks (use-queries)
      ↓
Data API
      ↓
Data Mapper
      ↓
Infra Layer
      ↓
Backend
```

Handlers podem participar quando houver erro técnico:

```text
Data API
↓
Data Handler
↓
throw Error
```

---

## Fluxo de Mutation

```text
React Components
      ↓
Presentation Hooks (use-mutations)
      ↓
Domain Services
      ↓
Data API
      ↓
Data Mapper
      ↓
Infra Layer
      ↓
Backend
```

Services podem lançar erros de domínio:

```text
Domain Service
↓
throw Error
```

---

# Responsabilidades por Camada

---

## Presentation Components

Responsáveis por:

- renderizar UI
- capturar interação
- submit
- clique
- modal
- navegação visual

Recebem dados exclusivamente via hooks.

---

### Components NÃO podem:

❌ fazer HTTP

❌ usar DTO

❌ conter regra de negócio

❌ acessar API diretamente

---

# Presentation Hooks

Responsáveis por:

- TanStack Query
- queries
- mutations
- cache
- invalidation
- loading state
- optimistic updates
- integração com MutationCache

Também podem acessar:

- Zustand
- contexto visual

---

### Hooks podem chamar:

### Queries

```text
Data API
```

---

### Mutations

```text
Domain Service
```

---

### Hooks NÃO podem:

❌ chamar `httpClient`

❌ conter regra de negócio

❌ fazer mapper manual

---

# Domain Services

Vivem em:

```text
domain/services
```

Responsáveis por:

- regras de negócio
- validações
- orquestração
- decisões de domínio
- erros de negócio

---

## Services podem:

- chamar APIs da própria feature
- lançar erros
- coordenar múltiplas chamadas

---

## Services NÃO podem:

❌ usar React

❌ usar React Query

❌ fazer HTTP direto

❌ acessar components

---

# Domain Validators

Vivem em:

```text
domain/validators
```

Responsáveis por validações reutilizáveis de domínio.

---

# Data API

Vivem em:

```text
data/api
```

Responsáveis por:

- chamadas HTTP
- integração externa
- uso de mapper
- uso de handlers

---

## APIs NÃO podem:

❌ conter regra de negócio

❌ usar React

❌ acessar hooks

---

# Data Mapper

Vivem em:

```text
data/mapper
```

Responsáveis por:

- DTO → Domain
- Domain → DTO

Sem side-effects.

---

# Data Handlers

Vivem em:

```text
data/handlers
```

Responsáveis por:

- normalizar erros externos
- traduzir status HTTP
- relançar erros previsíveis

---

# Infra (`infra/api`, `infra/realtime`)

Responsável por:

- clientes HTTP base
- interceptors
- SSE
- SignalR
- websocket
- integrações técnicas globais

Clientes realtime podem atualizar diretamente:

```text
React Query Cache
```

---

## Infra NÃO pode:

❌ importar hooks

❌ importar components

❌ importar services

❌ importar stores

---

Dependências como:

- `getToken`
- `onUnauthorized`

devem ser injetadas via:

```text
app/bootstrap
```

---

# Regras de Comunicação entre Camadas

| De | Pode chamar | Não pode chamar |
|---|---|---|
| Component | Hook | Service, API, httpClient |
| Hook (query) | Data API | httpClient |
| Hook (mutation) | Domain Service | httpClient |
| Domain Service | Data API | Hook, Component |
| Data API | Mapper, Handler, Infra | Hook, Component |
| Mapper | — | qualquer outra camada |
| Handler | — | qualquer outra camada |
| Infra | Backend externo | Hooks, Components, Stores |

---

# Regra principal

Cada camada possui uma única responsabilidade clara.

Se uma camada começar a absorver responsabilidade da outra:

a arquitetura começou a degradar.