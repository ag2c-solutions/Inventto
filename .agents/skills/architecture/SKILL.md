---
name: architecture
description: >
  Guia arquitetural completo para projetos React.
  Use esta skill em QUALQUER tarefa de código — criar features, componentes,
  hooks, services, APIs, mappers, handlers, tipos, rotas ou qualquer outro
  arquivo.

  Sempre consulte esta skill antes de gerar, editar ou revisar código para
  garantir conformidade com:

  - Feature-Based Architecture
  - 3-Tier Architecture
  - Clean Architecture
  - separação de responsabilidades
  - boundaries entre camadas
compatibility: Designed for Claude Code or similar agentic coding tools with filesystem access.
metadata:
  author: rafael-conceicao
  version: "2.0"
---
# Smart Tech Innovate – Índice de Skills

Este arquivo é o ponto de entrada da arquitetura.

Consulte os arquivos em `references/` conforme a tarefa.

---

# Skills Externas do Projeto

Este projeto utiliza a skill oficial do **shadcn/ui** instalada separadamente.

Ela fornece conhecimento sobre:

- componentes disponíveis
- CLI
- composição
- boas práticas

```bash
pnpm dlx skills add shadcn/ui
```

Ao trabalhar com componentes primitivos:

consulte a skill do shadcn/ui junto com:

```text
references/react/components.md
```

---

# Regra Geral

Antes de gerar qualquer código:

### Sempre consulte

1. `references/anti-patterns/forbidden-patterns.md`
2. O arquivo específico da tarefa

---

# Quando a tarefa envolver mutation

Consulte obrigatoriamente:

- `references/domain/services.md`
- `references/api/apis.md`
- `references/api/error-handling.md`

---

# Quando a tarefa envolver query

Consulte obrigatoriamente:

- `references/api/apis.md`
- `references/react/hooks.md`

---

# Quando a tarefa envolver nova feature

Consulte obrigatoriamente:

- `references/architecture/layers/features.md`
- `references/workflow/feature-creation.md`
- `references/architecture/data-flow.md`

---

# Mapa de Navegação

| Situação | Arquivo |
|---|---|
| Entender o mapa macro das camadas (app/features/shared/infra) | `references/architecture/layers.md` |
| Detalhar camadas internas e organizar pastas de uma feature (presentation/domain/data) | `references/architecture/layers/features.md` |
| Detalhar camada `app/` (providers, routers, layouts, tema) | `references/architecture/layers/app.md` |
| Detalhar camada `shared/` (hooks/utils genéricos) | `references/architecture/layers/shared.md` |
| Detalhar camada `infra/` | `references/architecture/layers/infra.md` |
| Entender fluxo de query/mutation | `references/architecture/data-flow.md` |
| Criar uma feature do zero | `references/workflow/feature-creation.md` |

---

| Situação | Arquivo |
|---|---|
| Criar services de domínio | `references/domain/services.md` |
| Criar APIs HTTP | `references/api/apis.md` |
| Criar mappers | `references/api/mappers.md` |
| Tratar erros | `references/api/error-handling.md` |

---

| Situação | Arquivo |
|---|---|
| Criar componentes | `references/react/components.md` |
| Criar páginas (rota) | `references/react/pages.md` |
| Criar hooks | `references/react/hooks.md` |
| Gerenciar estado | `references/react/state-management.md` |

---

| Situação | Arquivo |
|---|---|
| Naming | `references/coding/naming.md` |
| Estrutura global | `references/coding/file-structure.md` |
| Imports | `references/coding/imports.md` |

---

| Situação | Arquivo |
|---|---|
| Testes | `references/quality/testing.md` |
| Lint | `references/quality/linting.md` |

---

| Situação | Arquivo |
|---|---|
| Verificar padrões proibidos | `references/anti-patterns/forbidden-patterns.md` |

---

# Ordem recomendada para tarefas grandes

Se estiver criando uma feature completa:

1. `feature-creation.md`
2. `layers/features.md`
3. `data-flow.md`
4. `services.md`
5. `apis.md`
6. `mappers.md`
7. `error-handling.md`
8. `hooks.md`
9. `components.md`
10. `pages.md`
11. `state-management.md`
12. `testing.md`

---

# Regra principal

Se existir dúvida sobre onde algo pertence:

- consulte `layers.md` (mapa macro) e `layers/*.md` (detalhe de cada camada)
- consulte `forbidden-patterns.md`

Se ainda estiver em dúvida:

provavelmente você está misturando responsabilidades entre camadas.