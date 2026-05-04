# Estrutura Global do Projeto

## Árvore Completa

```text
src/
├── app/
│   ├── layouts/        # Estruturas de página
│   ├── providers/      # Providers globais da aplicação
│   └── routers/        # Definição de rotas e guards
│
├── infra/
│   ├── api/            # Clientes HTTP base e interceptores
│   ├── env/            # Validação e acesso às variáveis de ambiente
│   └── realtime/       # Clientes SSE, SignalR e integrações em tempo real
│
├── shared/
│   ├── components/
│   │   ├── ui/         # Primitivos visuais
│   │   └── common/     # Componentes reutilizáveis com lógica de UI
│   ├── hooks/          # Hooks globais reutilizáveis e agnósticos ao domínio
│   ├── utils/          # Funções utilitárias globais
│   ├── constants/      # Constantes globais
│   └── types/          # Tipos compartilhados e agnósticos ao domínio
│
└── features/           # Módulos de domínio autocontidos
    ├── auth/
    ├── users/
    ├── products/
    └── <nova-feature>/
```

---

# Estrutura Interna de uma Feature

```text
features/<feature-name>/
│
├── presentation/
│   ├── components/     # Componentes específicos da feature
│   ├── hooks/          # Queries, mutations e hooks compartilhados da feature
│   ├── stores/         # Estado global de UI da feature
│   └── pages/          # Páginas da feature
│
├── domain/
│   ├── entities/       # Modelos puros da aplicação
│   ├── services/       # Casos de uso e regras de negócio
│   └── validators/     # Validações de domínio
│
├── data/
│   ├── api/            # Chamadas HTTP e fronteira externa da feature
│   ├── dto/            # Contratos exatos do backend
│   ├── mapper/         # Conversão DTO ⇄ Domain Model
│   └── handlers/       # Tratamento de erros externos da feature
│
└── index.ts            # API pública da feature
```

---

# Onde Colocar Cada Coisa

| O que criar | Onde colocar |
|---|---|
| Página específica de uma feature | `features/<n>/presentation/pages/` |
| Componente específico de uma feature | `features/<n>/presentation/components/` |
| Hook local de um componente | `features/<n>/presentation/components/<component>/use-<component>.ts` |
| Query TanStack Query da feature | `features/<n>/presentation/hooks/use-queries.ts` |
| Mutation TanStack Query da feature | `features/<n>/presentation/hooks/use-mutations.ts` |
| Hook compartilhado por múltiplos componentes da feature | `features/<n>/presentation/hooks/use-<context>.ts` |
| Store Zustand da feature | `features/<n>/presentation/stores/` |
| Entidade/modelo de domínio | `features/<n>/domain/entities/` |
| Service/caso de uso da feature | `features/<n>/domain/services/` |
| Validador de domínio | `features/<n>/domain/validators/` |
| Chamada HTTP da feature | `features/<n>/data/api/` |
| DTO/contrato da API | `features/<n>/data/dto/` |
| Mapper DTO ⇄ Domain | `features/<n>/data/mapper/` |
| Handler de erro da feature | `features/<n>/data/handlers/` |
| Componente usado em várias features | `shared/components/common/` |
| Componente visual sem lógica | `shared/components/ui/` |
| Hook reutilizável global | `shared/hooks/` |
| Utilitário global | `shared/utils/` |
| Constante global | `shared/constants/` |
| Tipo global agnóstico ao domínio | `shared/types/` |
| Cliente HTTP base | `infra/api/` |
| Variável de ambiente validada | `infra/env/` |
| Cliente SSE/SignalR | `infra/realtime/` |