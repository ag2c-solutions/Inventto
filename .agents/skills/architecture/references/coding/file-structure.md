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
│   ├── supabase/       # Cliente Supabase (SDK), constants e fronteira de dados
│   ├── cloudinary/     # Upload de imagens
│   ├── viacep/         # Consulta de CEP
│   ├── email/          # Envio de e-mail
│   ├── env/            # Validação e acesso às variáveis de ambiente
│   ├── local-storage/  # Acesso a localStorage do browser
│   └── real-time/      # Wrapper sobre o Supabase Realtime
│
├── shared/
│   ├── components/
│   │   ├── ui/         # Primitivos visuais
│   │   └── common/     # Componentes reutilizáveis com lógica de UI
│   ├── hooks/          # Hooks globais reutilizáveis e agnósticos ao domínio
│   ├── utils/          # Funções utilitárias globais
│   ├── constants/      # Constantes globais (ainda não usada — criar quando necessário)
│   └── types/          # Tipos compartilhados agnósticos ao domínio (ainda não usada — criar quando necessário)
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
│   ├── dtos/           # Contratos exatos do backend
│   ├── mappers/        # Conversão DTO ⇄ Domain Model
│   └── handlers/       # Tratamento de erros externos da feature
│
├── tests/
│   ├── factories/      # Factories de Domain e DTO (Fishery + Faker)
│   └── mocks/          # Handlers/server do MSW (integrações HTTP de infra/)
│
└── index.ts            # API pública da feature
```

---

# Onde Colocar Cada Coisa

| O que criar | Onde colocar |
|---|---|
| Página específica de uma feature | `features/<n>/presentation/pages/` |
| Componente específico de uma feature | `features/<n>/presentation/components/` |
| Hook local de um componente | `features/<n>/presentation/components/<component>/hooks/use-<component>.ts` |
| Query TanStack Query da feature | `features/<n>/presentation/hooks/use-queries.ts` |
| Mutation TanStack Query da feature | `features/<n>/presentation/hooks/use-mutations.ts` |
| Hook compartilhado por múltiplos componentes da feature | `features/<n>/presentation/hooks/use-<context>.ts` |
| Store Zustand da feature | `features/<n>/presentation/stores/` |
| Entidade/modelo de domínio | `features/<n>/domain/entities/` |
| Service/caso de uso da feature | `features/<n>/domain/services/` |
| Validador de domínio | `features/<n>/domain/validators/` |
| Chamada HTTP da feature | `features/<n>/data/api/` |
| DTO/contrato da API | `features/<n>/data/dtos/` |
| Mapper DTO ⇄ Domain | `features/<n>/data/mappers/` |
| Handler de erro da feature | `features/<n>/data/handlers/` |
| Factory/mock de teste da feature | `features/<n>/tests/` |
| Componente usado em várias features | `shared/components/common/` |
| Componente visual sem lógica | `shared/components/ui/` |
| Hook reutilizável global | `shared/hooks/` |
| Utilitário global | `shared/utils/` |
| Constante global | `shared/constants/` |
| Tipo global agnóstico ao domínio | `shared/types/` |
| Cliente Supabase (SDK) base | `infra/supabase/` |
| Upload de imagens | `infra/cloudinary/` |
| Consulta de CEP | `infra/viacep/` |
| Envio de e-mail | `infra/email/` |
| Variável de ambiente validada | `infra/env/` |
| Acesso a localStorage do browser | `infra/local-storage/` |
| Wrapper de tempo real (Supabase RT) | `infra/real-time/` |