# Padrões de Teste

## Ferramentas

- **Vitest** → test runner e assertions (`globals: true`, ambiente `jsdom`)
- **React Testing Library** → testes de componentes e hooks
- **Testing Library User Event** → interações do usuário
- **Fishery** → factories para gerar dados de teste estruturados
- **@faker-js/faker** → geração de dados aleatórios e não-viciados
- **MSW (Mock Service Worker)** → padrão pretendido para interceptar integrações HTTP de `infra/` (Cloudinary, ViaCEP, e-mail). **Ainda não adotado**: hoje esses testes stubam `global.fetch` diretamente (`vi.stubGlobal('fetch', vi.fn())` + `vi.mocked(fetch).mockResolvedValue(...)`) — ver `infra/viacep/service/index.test.ts`. Migrar para MSW quando possível.

> **Setup global:** `src/infra/test/setup.ts` (registrado em `vite.config.ts` via `setupFiles`).
> Mocks globais de browser (`ResizeObserver`, `IntersectionObserver`, `matchMedia`, `scrollIntoView`) já vivem lá — não repetir por teste.
>
> `fishery`, `@faker-js/faker` e `msw` já estão instalados como `devDependencies`.
> Para testes usamos `msw/node` (`setupServer`) — não é necessário rodar `msw init`.
>
> **Importante:** a camada de dados das features usa o **cliente Supabase**
> (`supabase.from(...)`), não um `httpClient` HTTP genérico. Isso muda onde cada teste
> mocka — ver a seção [Onde mockar](#onde-mockar--supabase-vs-http).

---

# Estrutura de Arquivos

Arquivos de teste ficam **colocalizados** ao arquivo testado (mesma pasta):

```text
components/operator-list/index.tsx
components/operator-list/index.test.tsx

domain/services/index.ts
domain/services/index.test.ts

data/mappers/index.ts
data/mappers/index.test.ts
```

A **configuração de mocks** (factories e MSW) fica isolada na pasta `tests/` da própria feature:

```text
features/<feature>/
├── tests/
│   ├── factories/        # Factories de Domain e DTO (Fishery + Faker)
│   └── mocks/            # Handlers/server do MSW (só para integrações HTTP de infra/)
├── data/
├── domain/
└── presentation/
```

- Teste de lógica/função pura → `.test.ts`
- Teste de React → `.test.tsx`

---

# O que testar

| Camada | O que testar | Prioridade |
|---|---|---|
| `data/mappers` | Conversão DTO ⇄ Domain | Alta |
| `domain/services` | Regras de negócio e validações | Alta |
| `domain/validators` | Regras de validação | Alta |
| `shared/utils` e `domain/utils` | Funções puras | Alta |
| `presentation/hooks` | Integração com React Query (mock da classe de Data API) | Média |
| `presentation/components` | Interações e renderização | Média |
| `data/api` | Apenas se houver lógica além do client | Baixa |

---

# Proibição — Mocks viciados (hardcoded)

Nunca defina objetos hardcoded no teste nem espalhe mocks em variáveis estáticas.

Dados de teste devem vir **sempre** de factories em `tests/factories/`.

❌ **Errado — dado viciado e frágil:**

```ts
const operator = { id: '1', name: 'João', isActive: true }; // hardcoded
```

✅ **Certo — factory:**

```ts
const operator = operatorFactory.build();
```

Por quê:

- factories geram dados válidos e variados a cada execução
- expõem acoplamento a valores mágicos
- evitam repetição de objetos gigantes em cada `it`
- deixam explícito só o campo relevante ao caso (`build({ status: 'active' })`)

---

# Factories — Fishery + Faker

Ficam em `tests/factories/`. Crie uma factory para o **Domain** e uma para o **DTO**
sempre que for testar mapper, hook ou componente que consuma dados.

```ts
// features/operators/tests/factories/operator.factory.ts
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { OperatorDTO } from '../../data/dtos';
import type { Operator } from '../../domain/entities';

export const operatorFactory = Factory.define<Operator>(() => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  isActive: faker.datatype.boolean()
}));

export const operatorDTOFactory = Factory.define<OperatorDTO>(() => ({
  id: faker.string.uuid(),
  full_name: faker.person.fullName(),
  status: 'active'
}));

// Extensões de estado por composição:
export const activeOperatorFactory = operatorFactory.params({ isActive: true });
```

Uso: `operatorFactory.build()`, `operatorFactory.build({ isActive: false })`,
`operatorFactory.buildList(5)`.

---

# Onde mockar — Supabase vs HTTP

A camada de dados das features usa o **cliente Supabase** (`supabase.from(...)`), então
o boundary de mock **não** é uma borda HTTP genérica. Onde cada teste mocka:

| O que está sendo testado | Onde mockar |
|---|---|
| Service de domínio | classe de **Data API** da feature (`vi.mock('../../data/api')`) |
| Hook de query/mutation da feature | classe de **Data API** da feature |
| Integração HTTP de `infra/` (Cloudinary, ViaCEP, e-mail) | **MSW** na borda HTTP (pretendido) ou stub de `fetch` (usado hoje) |

Para features (Supabase), o boundary é a **classe de Data API estática** — mockar o
cliente Supabase diretamente seria frágil e acoplado ao encadeamento do query builder.
Para as integrações HTTP reais de `infra/`, o padrão pretendido é MSW; hoje elas ainda
são testadas stubando `global.fetch` diretamente.

## Mock da classe de Data API (features Supabase)

Mocke a classe estática da feature e controle o retorno com factories:

```ts
import { vi } from 'vitest';

import { OperatorApi } from '../../data/api';
import { operatorFactory } from '../../tests/factories/operator.factory';

vi.mock('../../data/api');

vi.mocked(OperatorApi.getAll).mockResolvedValue(operatorFactory.buildList(3));
```

## MSW — integrações HTTP de `infra/` (padrão pretendido, ainda não adotado)

Para o que realmente faz HTTP (ex: ViaCEP), a intenção é interceptar na borda com
MSW, com handlers e server em `tests/mocks/`. **Hoje isso ainda não existe no
projeto** — o teste real de `infra/viacep/service/index.test.ts` stuba
`global.fetch` diretamente. O exemplo abaixo é o alvo para quando a migração
para MSW acontecer:

```ts
// infra/viacep/tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const viacepHandlers = [
  http.get('https://viacep.com.br/ws/:cep/json', () => {
    return HttpResponse.json({ cep: '01001-000', logradouro: 'Praça da Sé' });
  })
];
```

```ts
// infra/viacep/tests/mocks/server.ts
import { setupServer } from 'msw/node';

import { viacepHandlers } from './handlers';

export const server = setupServer(...viacepHandlers);
```

Ativar por arquivo de teste:

```ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Para sobrescrever a resposta em um caso específico, use `server.use(...)` com um handler local.

## Padrão usado hoje: stub de `fetch`

Enquanto a migração para MSW não acontece, integrações HTTP de `infra/` são
testadas stubando `global.fetch`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ViaCEPService } from './index';

describe('ViaCEPService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retorna os dados quando a API responde com sucesso', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ cep: '01310-100', logradouro: 'Av. Paulista' })
    } as never);

    const result = await ViaCEPService.lookup('01310100');

    expect(result?.logradouro).toBe('Av. Paulista');
  });
});
```

---

# Testando Mappers

Use a factory de DTO para converter para Domain, e a de Domain para converter para DTO.

```ts
// data/mappers/index.test.ts
import { describe, expect, it } from 'vitest';

import {
  operatorDTOFactory,
  operatorFactory
} from '../../tests/factories/operator.factory';

import { OperatorMapper } from '.';

describe('OperatorMapper', () => {
  it('should map DTO to domain correctly', () => {
    const dto = operatorDTOFactory.build({ status: 'active' });

    const model = OperatorMapper.toDomain(dto);

    expect(model.id).toBe(dto.id);
    expect(model.name).toBe(dto.full_name);
    expect(model.isActive).toBe(true);
  });

  it('should map domain to DTO correctly', () => {
    const dto = OperatorMapper.toDTO(operatorFactory.build({ isActive: false }));

    expect(dto.status).toBe('inactive');
  });
});
```

---

# Testando Services

Services devem ser testados quando possuem validação, regra de negócio, decisão
condicional ou lançamento de erro. Mockar a **classe de Data API** da feature.

```ts
import { describe, expect, it, vi } from 'vitest';

import { OrderAPI } from '../../data/api';
import { orderFactory } from '../../tests/factories/order.factory';

import { OrderService } from '.';

vi.mock('../../data/api');

describe('OrderService', () => {
  it('should reject approval of a cancelled order', async () => {
    const order = orderFactory.build({ status: 'cancelled' });

    await expect(OrderService.approve(order)).rejects.toThrow(
      'Pedido cancelado não pode ser aprovado.'
    );
  });
});
```

---

# Testando Validators

Validators são funções puras — testar entrada → saída/erro, usando factories.

```ts
describe('OrderValidator', () => {
  it('should throw for an order with no items', () => {
    const order = orderFactory.build({ items: [] });

    expect(() => OrderValidator.validate(order)).toThrow();
  });
});
```

---

# Testando Hooks

Testar integração com React Query: retorno de dados, estados de loading/erro,
invalidação de cache. Como as features usam Supabase, mocke a **classe de Data API**
da feature (não o cliente Supabase). Dados de retorno vêm de factories.

Hooks precisam de um `QueryClientProvider` como wrapper. Se o hook depende de contexto
(ex: organização atual via `useUser`), mocke também esse hook.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OperatorApi } from '../../data/api';
import { operatorFactory } from '../../tests/factories/operator.factory';

import { useOperatorsQuery } from './use-queries';

vi.mock('../../data/api');

describe('useOperatorsQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return the operators from the API', async () => {
    const operators = operatorFactory.buildList(3);
    vi.mocked(OperatorApi.getAll).mockResolvedValue(operators);

    const { result } = renderHook(() => useOperatorsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(operators);
  });
});
```

---

# Testando Components

Testar renderização condicional, interação do usuário e estados visuais.

- Componente que **recebe dados por props** → montar props com factories.
- Componente que **consome hooks de dados** → mockar a classe de Data API (`vi.mock`) e
  envolver com o `QueryClientProvider`, deixando o hook real rodar. Alternativamente,
  mockar o hook da feature quando o foco do teste for só a renderização.

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { operatorFactory } from '../../tests/factories/operator.factory';

import { OperatorRow } from '.';

describe('OperatorRow', () => {
  it('should render the operator name', () => {
    const operator = operatorFactory.build({ name: 'João Silva' });

    render(<OperatorRow operator={operator} />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });
});
```

---

# Convenções

- Teste comportamento, não implementação
- Dados de teste sempre via factory — nunca hardcoded
- Mock no boundary certo: a **classe de Data API** da feature para services e hooks (Supabase); **MSW** só para integrações HTTP de `infra/`
- Nunca mockar o cliente Supabase diretamente — mocke a classe de Data API da feature
- Não testar bibliotecas externas
- Descreva o comportamento esperado no nome do teste: `'should show error when login fails'`

---

# O que evitar testar

- implementação interna do React Query
- bibliotecas externas
- getters/setters triviais
- componentes extremamente simples sem lógica

---

# Regra principal

Teste as regras críticas primeiro, nesta ordem:

1. regras de negócio (`domain/services`, `domain/validators`)
2. mapeamento de dados (`data/mappers`)
3. validações
4. fluxos de UI

O objetivo é proteger o domínio e os fluxos críticos da aplicação.
