# 🚀 Onboarding — {{Empresa / projeto}}

Bem-vindo(a) à {{Nome da Empresa/ Projeto}} 👋

Este documento existe para te integrar a equipe o mais rápido possível.

O objetivo aqui é simples:

- rodar o projeto
- entender onde cada coisa fica
- saber como contribuir sem quebrar os padrões do time

Para detalhes completos sobre arquitetura, consulte o `README.md`.

---

# 1. Bem-vindo

Este template foi criado para evitar que cada novo projeto comece do zero.

Ele já possui:

- arquitetura padronizada
- stack definida
- componentes reutilizáveis
- padrões de desenvolvimento
- fluxo de entrega previsível

Nosso foco é acelerar entrega sem transformar o projeto em caos técnico após alguns meses.

---

# 2. Setup em 5 minutos

## Clonar projeto

```bash
git clone <repository-url>
```

---

## Instalar dependências

Utilizamos exclusivamente `pnpm`.

```bash
pnpm install
```

---

## Configurar variáveis de ambiente

Copie:

```bash
cp .env.example .env.local
```

Configure:

```env
VITE_EXAMPLE_ENV=
```

---

## Rodar aplicação

```bash
pnpm dev
```

Aplicação disponível em:

```bash
http://localhost:5173
```

---

## Validar se está tudo certo

Confirme:

- login carregando corretamente
- chamadas de API funcionando
- nenhuma variável faltando
- sem erros no terminal

---

# 3. Estrutura rápida do projeto

```text
src
├── app/
├── infra/
├── shared/
└── features/
```

---

## `app/`

Responsável por:

- providers
- layouts
- rotas
- configuração global

---

## `infra/`

Responsável por:

- clientes HTTP
- variáveis de ambiente
- integrações externas
- realtime

---

## `shared/`

Código reutilizável e agnóstico ao domínio.

Exemplo:

- componentes base
- hooks genéricos
- utils
- constants
- types compartilhados

---

## `features/`

Onde você vai passar a maior parte do tempo.

Cada feature segue:

```text
feature/
├── presentation/
├── domain/
├── data/
└── index.ts
```

Para detalhes completos da arquitetura interna consulte o README.

---

# 4. Fluxo de desenvolvimento

Ao receber uma nova demanda:

---

## 1. Entenda o domínio

Antes de codar:

- qual problema resolver?
- qual feature será alterada?
- existe feature parecida?

---

## 2. Verifique se algo já existe

Antes de criar:

- componente
- hook
- service
- utilitário

Verifique:

```text
shared/
features/
```

Evite duplicação.

---

## 3. Desenvolva seguindo o padrão

Respeite:

- isolamento entre features
- DTO → Mapper → Model
- separação presentation/domain/data

---

## 4. Teste localmente

Antes de subir:

```bash
pnpm lint
pnpm test
pnpm build
```

---

## 5. Abra seu PR

Suba apenas código validado.

---

# 5. Checklist antes do PR

Antes de abrir PR confirme:

- [ ] código segue arquitetura do projeto
- [ ] sem imports proibidos entre features
- [ ] DTO não chega na UI
- [ ] sem duplicação desnecessária
- [ ] lint funcionando
- [ ] testes passando
- [ ] build funcionando
- [ ] variáveis sensíveis não commitadas

---

# 6. Links úteis

## Arquitetura completa

Consulte:

```text
README.md
```

---

## Exemplos internos

Analise features já existentes:

```text
features/auth
features/dashboard
features/products
```

---

## Stack oficial

- React
- React Router
- TanStack Query
- Zustand
- Tailwind
- Radix UI
- Zod
- Vitest

---

Bom código 🚀