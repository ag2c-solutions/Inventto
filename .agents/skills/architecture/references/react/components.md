# Níveis de Componentes

## Hierarquia

```text
shared/components/ui
    ↓
shared/components/common
    ↓
features/.../presentation/components
```

---

# 1. UI Components (`shared/components/ui/`)

Componentes primitivos do **shadcn/ui**.

Instalados via CLI diretamente em:

```text
shared/components/ui/
```

São baseados em:

- Radix UI
- Tailwind CSS

---

## Adicionando novo componente

Sempre usar o CLI do shadcn.

Nunca criar manualmente componentes primitivos se já existir equivalente.

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add data-table
```

---

## Uso

```tsx
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
```

---

## Regras

- sem regra de negócio
- apenas props
- apenas callbacks
- sem hooks de dados
- sem API
- sem domínio

---

# 2. Shared Components (`shared/components/common/`)

Componentes reutilizáveis que combinam primitivos UI com lógica visual reutilizável.

---

## Regras

Podem ter:

- estado local
- paginação
- ordenação
- filtros visuais
- lógica de apresentação reutilizável

---

## Não podem

❌ acessar API

❌ acessar feature services

❌ importar features

---

## Exemplo

- Datatable
- FilePicker
- Wizard

```tsx
import {
  Table
} from '@/shared/components/ui/table'

import {
  Button
} from '@/shared/components/ui/button'

export function Datatable({
  data,
  onRowClick
}) {
  return (
    <Table>
      {data.map((row) => (
        <button
          key={row.id}
          onClick={() =>
            onRowClick(row)
          }
        >
          {row.name}
        </button>
      ))}
    </Table>
  )
}
```

---

# Componentes Comuns Existentes

Lista de todos os componentes já implementados em `shared/components/common/`.

> ⚠️ Sempre que um novo componente comum for criado, **esta lista deve ser
> atualizada** com o nome, o caminho e o caso de uso.

| Componente | Caminho | Caso de uso |
|---|---|---|
| `ColorBadge` | `color-badge/` | Badge exibindo cor (bolinha + nome) a partir de um valor de cor |
| `DataTable` | `data-table/` | Tabela completa com paginação, ordenação, filtros de coluna e visibilidade de colunas |
| `FilePicker` | `file-picker/` | Upload de arquivos com drag-and-drop, preview e validação |
| `GlobalStateScreen` | `global-state-screen/` | Tela de estado global (bloqueio, erro) com ícone, texto e call-to-action |
| `ImageCard` | `image-card/` | Exibição de imagem com skeleton de carregamento e fallback de erro |
| `PlaceholderPage` | `placeholder-page/` | Placeholder para páginas/funcionalidades ainda em desenvolvimento |
| `SimpleDataTable` | `simple-data-table/` | Tabela simples (sem paginação/filtros) baseada em TanStack Table |
| `SubmittingButton` | `submitting-button/` | Botão de submit com estado de loading (spinner + label alternativo) |
| `Wizard` | `wizard/` | Fluxo multi-step (stepper) com controles de navegação |

---

# 3. Feature Components (`presentation/components/`)

Vivem em:

```text
features/<feature>/presentation/components/
```

São específicos do domínio da feature.

---

## Estrutura

```text
presentation/components/
├── operator-list/
│   └── index.tsx
├── operator-card/
│   └── index.tsx
│
└── operator-form/
    ├── schema/
    │   └── operator-form-schema.ts
    ├── hooks/
    │   └── use-operator-form.ts
    ├── pieces/
    │   └── operator-form-fields/
    │       └── index.tsx
    ├── types/
    │   └── operator-form.types.ts
    ├── utils/
    │   └── format-operator-payload.ts
    ├── index.tsx
    └── index.test.tsx
```

Um componente por pasta, no padrão `nome-do-componente/index.tsx`.

---

## Agrupamento por tipo (`forms/` e `actions/`)

Quando a feature tiver múltiplos formulários e/ou componentes de ação
(dialogs, sheets, botões, switchers que disparam mutation ou abrem um form),
agrupe-os por tipo dentro de `presentation/components/`:

```text
presentation/components/
├── forms/
│   ├── create-organization/
│   │   ├── hooks/
│   │   │   └── use-create-organization-form.ts
│   │   └── index.tsx
│   └── organization-settings/
│       ├── tabs/
│       ├── hooks/
│       └── index.tsx
│
├── actions/
│   ├── create-organization/        # dialog + trigger, consome forms/create-organization
│   ├── delete-organization/
│   └── logo-change/
│
└── org-avatar/                     # sem semântica de form/action, fica solto
```

- `forms/<nome>/` — formulário puro (React Hook Form). Recebe `onSuccess`/`onCancel`
  via props; não decide como/quando aparecer na tela.
- `actions/<nome>/` — dispara a ação (dialog, sheet, botão, switcher). Controla
  abertura/fechamento e compõe o form quando houver um.
- Componente sem essa semântica (lista, tabela, card, avatar) continua solto em
  `presentation/components/<nome>/`, como no exemplo acima.

Use esse agrupamento em toda feature nova; ao dar manutenção numa feature
existente, migre para esse padrão.

---

# Estrutura interna de um componente

Nem toda pasta abaixo existe em todo componente — só crie a que o componente
realmente precisar. `index.tsx` é a única obrigatória.

| Pasta/arquivo | Responsabilidade |
|---|---|
| `schema/` | Schemas de validação (Zod) do componente |
| `hooks/` | Toda a lógica do componente. `use-<component>.ts` é o hook principal, mesmo quando é o único — sempre dentro de `hooks/`, nunca solto ao lado do `index.tsx`. Hooks auxiliares (ex: `use-<component>-fields.ts`) também vivem aqui |
| `pieces/` | Sub-componentes, quando o componente precisar ser quebrado em pedaços menores (ex: skeleton, card de lista, trigger customizado). Sempre `pieces/<nome>/index.tsx` — nunca um arquivo solto ao lado do `index.tsx` do componente pai. Cada piece pode ter sua própria estrutura interna completa (`hooks/`, `types/` etc.) quando for complexo o suficiente |
| `types/` | Interfaces/props do componente e dos seus pieces |
| `utils/` | Funções puras auxiliares específicas do componente (formatação, transformação local) |
| `constants/` | Opções fixas, labels, valores default — só quando o componente tiver esse tipo de dado |
| `index.tsx` | O componente em si. Deve ser "burro": apenas JSX + chamadas aos hooks. Lógica só vive aqui quando for **impossível** separá-la de forma razoável para `hooks/` |
| `index.test.tsx` | Teste colocalizado do componente |

---

# Hooks locais de componente

Quando o hook é usado por apenas um componente, fica em `hooks/` dentro da
pasta do próprio componente:

```text
presentation/components/<component>/hooks/use-<component>.ts
```

Exemplo:

```text
operator-form/hooks/use-operator-form.ts
```

Usado para:

- React Hook Form
- lógica de modal
- stepper local
- estado complexo local
- orchestration exclusiva do componente

---

# Feature Components podem consumir

- `presentation/hooks/use-queries.ts`
- `presentation/hooks/use-mutations.ts`
- hooks compartilhados da feature
- hooks locais do próprio componente
- `shared/components/ui`
- `shared/components/common`

---

## Exemplo correto

```tsx
import { Button } from '@/shared/components/ui/button'
import { Datatable } from '@/shared/components/common/datatable'

import {
  useOperatorsQuery
} from '../hooks/use-queries'

export function OperatorList() {
  const {
    data,
    isLoading
  } = useOperatorsQuery()

  return (
    <Datatable
      data={data}
      isLoading={isLoading}
    />
  )
}
```

---

# Exemplo correto com mutation

```tsx
import {
  useCreateOperatorMutation
} from '../hooks/use-mutations'

export function CreateOperatorButton() {
  const { mutate } =
    useCreateOperatorMutation()

  return (
    <button
      onClick={() =>
        mutate(data)
      }
    >
      Criar
    </button>
  )
}
```

---

# O que feature components NÃO podem fazer

❌ HTTP direto

❌ chamar API diretamente

❌ chamar service diretamente

❌ usar DTO

❌ importar internals de outra feature

❌ regra de negócio

---

## Errado

```tsx
export function OperatorList() {
  const [data, setData] =
    useState([])

  useEffect(() => {
    supabase
      .from('operators')
      .select()
      .then((res) =>
        setData(res.data)
      )
  }, [])
}
```

---

## Errado

```tsx
import {
  ProductService
} from '@/features/products/domain/services'
```

---

## Correto

Consumir outra feature apenas via:

```text
index.ts
```

---

# Regra principal

Quanto mais genérico:

```text
shared/
```

Quanto mais específico de domínio:

```text
feature/presentation/components
```

Componentes nunca devem absorver responsabilidades de dados ou domínio.