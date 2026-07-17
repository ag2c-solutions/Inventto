# ⚛️ Inventto – Gestor de Estoque (Frontend)

**Sistema web moderno para gestão de inventário e controle de estoque, focado em pequenas e médias empresas (PMEs). O objetivo é fornecer uma ferramenta visual, rápida e inteligente para substituir o controle manual em planilhas, dando ao gestor total visibilidade sobre seu capital de inventário.**

Este projeto foi desenhado para escalar. A arquitetura combina os princípios de **Feature-Based** e **Clean Arch** com uma **Arquitetura de 3 Camadas (3-Tier)** adaptada para o Front-end, garantindo forte tipagem, isolamento estrito entre Interface Visual, Regras de Domínio e Infraestrutura.

---

## 📌 Visão Geral da Arquitetura

O sistema divide-se em duas grandes zonas:

1. **Ecossistema Global (`app`, `infra`, `shared`)**
   O "chassi" da aplicação. Orquestra o arranque, fornece ferramentas genéricas e gere a comunicação com o mundo exterior.

2. **Domínios de Negócio (`features`)**
   O coração do sistema. Módulos completamente isolados que contêm as regras de negócio e as interfaces específicas da aplicação.

---

## 🚀 Stack Tecnológica

### Core

- React 19
- React Router 7
- Vite (SWC)
- TypeScript

### Gestão de Estado

| Tipo de estado | Tecnologia | Localização |
|---------------|------------|-------------|
| Server State | TanStack Query | `features/*/presentation/hooks` |
| Global UI State | Zustand | `features/*/presentation/stores` |
| Local State | React Hooks | `features/*/presentation/components` |

### UI & Formulários

- Tailwind CSS
- Radix UI / Shadcn/ui
- Lucide Icons
- React Hook Form
- Zod

### Tempo real & Testes

- Supabase Realtime
- Vitest
- React Testing Library


---

## 📂 Estrutura Global do Projeto

```text
src
├── app/
│   ├── layouts/
│   ├── providers/
│   └── routers/
│
├── infra/
│   ├── supabase/
│   ├── cloudinary/
│   ├── env/
│   └── realtime/
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   └── common/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── types/
│
└── features/
    ├── auth/
    ├── products/
    ├── inventory/
    ├── dashboard/
    └── [nova-feature]/
```

---

## 🧩 Estrutura Interna de uma Feature

Cada feature deve ser completamente isolada e auto-contida.

```text
features/nome-da-feature
│
├── presentation/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   └── pages/
│
├── domain/
│   ├── entities/
│   ├── services/
│   ├── validators/
│   └── mapper/
│
├── data/
│   ├── api/
│   ├── dto/
│   └── handlers/
│
└── index.ts
```

---

## 🏛️ Responsabilidades por Camada

### `presentation/`

Responsável por tudo relacionado ao React:

- Componentes
- Páginas
- Hooks de UI
- Stores de interface
- Interações do usuário

> Essa camada **não pode conter regra de negócio**.

---

### `domain/`

Responsável por:

- Regras de negócio
- Entidades
- Validações
- Serviços de domínio

> Essa camada deve ser completamente desacoplada de React, Zustand, Axios e qualquer framework.

---

### `data/`

Responsável por:

- Comunicação com API
- Mappers
- DTOs
- Tratamento de erros externos
- Integrações

> Essa camada atua como uma **Alfândega bidirecional**. Ela recebe o que vem do mundo externo e traduz para a linguagem do domínio (Leituras), e recebe as intenções do domínio, empacotando-as no formato que o servidor exige (Escritas).

---

### `index.ts`

É a **API pública da feature**.

Outras features só podem consumir recursos expostos por esse arquivo.

---

## 🔄 DTO vs Model

A UI nunca deve consumir DTO diretamente.

**Fluxo de Leitura:**

```text
API DTO
  ↓
Mapper
  ↓
Domain Model
  ↓
Presentation
```

**Fluxo de Escrita:**

```text
Presentation
  ↓
Domain Model
  ↓
Mapper
  ↓
DTO
  ↓
API
```

Isso protege o frontend contra mudanças inesperadas no backend.

---

## 🔁 Fluxo de Leitura e Escrita (CQRS pragmático)

### Queries (Leitura)

Fluxo simplificado:

```text
Data → Mapper → Hook → Component
```

> Leituras simples podem pular o service de domínio.

---

### Mutations (Escrita)

Fluxo obrigatório:

```text
Component → Hook → Domain Service → Mapper → API
```

> Toda escrita precisa passar por validação de negócio.

---

## 🚨 Regras Arquiteturais Obrigatórias

### 1. Shared nunca depende de features

❌ Errado:

```ts
import { UserRole } from '@/features/users/types';
```

Dentro de `shared` isso é proibido.

---

### 2. Features não acessam internals de outras features

❌ Errado:

```ts
import { ProductService } from '@/features/products/domain/services/product-service';
```

✅ Correto:

```ts
import { getProducts } from '@/features/products';
```

---

### 3. Domain não conhece framework

O domínio não pode importar:

- React
- Zustand
- Axios
- React Query

---

### 4. Components não fazem regra de negócio

Componentes apenas disparam ações.

❌ Errado:

```ts
if (user.role === 'admin') {
   ...
}
```

Essa decisão pertence ao domínio.

---

## 🔐 Isolamento entre Módulos

Cada feature é tratada como um mini sistema independente.

Ela possui:

- UI própria
- Regras próprias
- Contratos próprios
- Dados próprios

Isso reduz acoplamento e facilita escalabilidade.

---

## 🧪 Estratégia de Testes

Nossa estratégia se baseia em co-localização (*colocation*) para testes unitários e de integração.

- **Testes Unitários / Integração (Vitest + RTL):** Os arquivos de teste (ex: `ProductList.test.tsx`) ficam dentro da pasta da feature, ao lado do componente que estão testando. Isso facilita a manutenção e garante que os testes sejam parte integrante do desenvolvimento da feature.

- **Testes End-to-End (Cypress/Playwright):** Ficam na pasta `/cypress` na raiz do projeto, pois testam a aplicação como um todo.

---

## ⚙️ Configuração de Ambiente

```bash
pnpm install
cp .env.example .env.local
```

Variáveis obrigatórias:

- `VITE_API_URL`

---

## ▶️ Rodando o Projeto

```bash
pnpm dev
```

---

## 🧪 Scripts

| Script | Descrição |
|----------|------------|
| `pnpm dev` | Ambiente local |
| `pnpm build` | Build + type check |
| `pnpm preview` | Preview produção |
| `pnpm lint` | ESLint |
| `pnpm test` | Testes unitários |
| `pnpm test:coverage` | Coverage |

---

## 🤝 Como Criar uma Nova Feature

1. Criar pasta em `features/nome-da-feature`
2. Separar em:
   - `presentation/`
   - `domain/`
   - `data/`
3. Criar DTOs em `data/dto/`
4. Criar entities em `domain/entities/`
5. Criar mappers em `domain/mapper/`
6. Criar services em `domain/services/`
7. Criar hooks e components em `presentation/`
8. Exportar apenas o necessário no `index.ts`

---

## 🎯 Funcionalidades da Fase 1

- Gestão de Produtos com Variações (Grades)
- Controle de Movimentações de Estoque (Entrada, Saída, Ajuste)
- Histórico de Movimentações (Audit Trail)
- Alertas de Estoque Mínimo
- Dashboard com KPIs e Relatórios

---

## 🎯 Objetivo dessa Arquitetura

Essa arquitetura existe para evitar que o projeto vire:

- Spaghetti code
- Acoplamento entre módulos
- Regras espalhadas
- Dificuldade de manutenção
- Dificuldade de onboarding

O objetivo é manter velocidade de entrega **sem sacrificar escalabilidade**.

---

## Licença

Este projeto é licenciado sob a Licença MIT.
