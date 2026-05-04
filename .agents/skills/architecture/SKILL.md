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
- `references/api/api.md`
- `references/api/error-handling.md`

---

# Quando a tarefa envolver query

Consulte obrigatoriamente:

- `references/api/api.md`
- `references/react/hooks.md`

---

# Quando a tarefa envolver nova feature

Consulte obrigatoriamente:

- `references/architecture/feature-structure.md`
- `references/workflow/feature-creation.md`
- `references/architecture/data-flow.md`

---

# Mapa de Navegação

| Situação | Arquivo |
|---|---|
| Entender como as camadas se comunicam | `references/architecture/layer.md` |
| Criar ou organizar uma nova feature | `references/architecture/feature-structure.md` |
| Entender fluxo de query/mutation | `references/architecture/data-flow.md` |
| Criar uma feature do zero | `references/workflow/feature-creation.md` |

---

| Situação | Arquivo |
|---|---|
| Criar services de domínio | `references/domain/services.md` |
| Criar APIs HTTP | `references/api/api.md` |
| Criar mappers | `references/api/mappers.md` |
| Tratar erros | `references/api/error-handling.md` |

---

| Situação | Arquivo |
|---|---|
| Criar componentes | `references/react/components.md` |
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
2. `feature-structure.md`
3. `data-flow.md`
4. `services.md`
5. `api.md`
6. `mappers.md`
7. `error-handling.md`
8. `hooks.md`
9. `components.md`
10. `testing.md`

---

# Regra principal

Se existir dúvida sobre onde algo pertence:

- consulte `layer.md`
- consulte `forbidden-patterns.md`

Se ainda estiver em dúvida:

provavelmente você está misturando responsabilidades entre camadas.