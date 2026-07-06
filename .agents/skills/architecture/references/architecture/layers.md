# Camadas e Responsabilidades

## Visão Geral

A aplicação segue:

- Feature-Based Architecture
- 3-Tier Architecture
- CQRS pragmático

O fluxo de dados entre as camadas internas de uma feature (query e mutation,
incluindo tratamento de erro) está descrito em
`references/architecture/data-flow.md`.

---

# Mapa das Camadas Macro

O sistema é dividido em 4 camadas macro:

| Camada | Responsabilidade | Detalhes |
|---|---|---|
| `app/` | Composição da aplicação: roteamento, providers globais, layouts, tema, marca. É o shell que envolve as features — não contém regra de negócio | `references/architecture/layers/app.md` |
| `features/` | Domínio de negócio da aplicação. Cada feature é autocontida e se divide internamente em Presentation, Domain e Data | `references/architecture/layers/features.md` |
| `shared/` | Código reutilizável entre features: componentes, hooks e utils genéricos, sem conhecimento de nenhuma feature específica | `references/architecture/layers/shared.md` |
| `infra/` | Integrações externas à aplicação — não só backend, também APIs de browser. Camada mais externa, sem dependência de nenhuma outra | `references/architecture/layers/infra.md` |

---

# Comunicação entre Camadas Macro

| De | Pode importar | Não pode importar |
|---|---|---|
| `app/` | `features/` (via `index.ts`), `shared/` | `infra/` diretamente |
| `features/` | `shared/`, `infra/` | outra feature além de `index.ts` |
| `shared/` | `infra/` | `features/`, `app/` |
| `infra/` | — (é folha) | `features/`, `shared/`, `app/` |

---

# Regra principal

Cada camada possui uma única responsabilidade clara.

Se uma camada começar a absorver responsabilidade da outra:

a arquitetura começou a degradar.
