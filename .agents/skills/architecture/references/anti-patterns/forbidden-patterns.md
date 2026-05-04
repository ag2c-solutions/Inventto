# Padrões Proibidos

Consulte este arquivo antes de gerar qualquer código. Estes padrões **nunca** devem aparecer.

---

## ❌ useState + useEffect para dados da API

```ts
// PROIBIDO
const [operators, setOperators] = useState([]);

useEffect(() => {
  OperatorAPI.getAll().then(setOperators);
}, []);
```

```ts
// CORRETO
const { data: operators } = useOperatorsQuery();
```

Dados vindos da API devem ser gerenciados com **TanStack Query**.

---

## ❌ Chamada HTTP direta no componente

```tsx
// PROIBIDO
export function OperatorList() {
  useEffect(() => {
    httpClient.get('/operators').then(...);
  }, []);

  return null;
}
```

```tsx
// CORRETO — delegar para hook
export function OperatorList() {
  const { data } = useOperatorsQuery();

  return null;
}
```

Componentes não chamam HTTP.

---

## ❌ Chamada HTTP direta no hook

```ts
// PROIBIDO
export function useOperatorsQuery() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: () => httpClient.get('/operators')
  });
}
```

```ts
// CORRETO — query simples usa API da feature
export function useOperatorsQuery() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: OperatorAPI.getAll
  });
}
```

Hooks nunca chamam `httpClient` diretamente.

---

## ❌ Consumir DTO diretamente na UI

```tsx
// PROIBIDO — componente recebe DTO
export function OperatorCard({ operator }: { operator: OperatorDTO }) {
  return <div>{operator.full_name}</div>;
}
```

```tsx
// CORRETO — componente recebe entidade/modelo de domínio
export function OperatorCard({ operator }: { operator: Operator }) {
  return <div>{operator.name}</div>;
}
```

DTO pertence à camada `data/dto`.

UI consome domínio.

---

## ❌ Lógica de negócio no componente

```tsx
// PROIBIDO
export function OperatorList() {
  const { data } = useOperatorsQuery();

  const activeOperators = data?.filter(
    (operator) => operator.status === 'active'
  );

  return <ul>{activeOperators?.map(...)}</ul>;
}
```

```ts
// CORRETO — regra/derivação fica em hook compartilhado ou service
export function useActiveOperators() {
  const { data, ...rest } = useOperatorsQuery();

  const activeOperators = data?.filter(
    (operator) => operator.isActive
  );

  return {
    data: activeOperators,
    ...rest
  };
}
```

Componentes apenas renderizam e disparam ações.

---

## ❌ Importar internals de outra feature

```ts
// PROIBIDO
import { ProductService } from '@/features/products/domain/services/product-service';
import { useProductsQuery } from '@/features/products/presentation/hooks/use-queries';
import { ProductAPI } from '@/features/products/data/api/product-api';
```

```ts
// CORRETO — consumir apenas a API pública da feature
import { getProducts } from '@/features/products';
```

Features não acessam `presentation`, `domain` ou `data` de outra feature.

Toda comunicação entre features deve passar pelo `index.ts`.

---

## ❌ Side-effects de dados no componente

```tsx
// PROIBIDO
export function CreateOperatorButton() {
  const handleClick = async () => {
    await OperatorAPI.create(data);
  };

  return <button onClick={handleClick}>Criar</button>;
}
```

```tsx
// CORRETO — usar mutation do hook
export function CreateOperatorButton() {
  const { mutate } = useCreateOperatorMutation();

  const handleClick = () => {
    mutate(data);
  };

  return <button onClick={handleClick}>Criar</button>;
}
```

---

## ❌ Hook compartilhado colocado junto ao componente pai

Quando um hook é consumido por dois ou mais componentes, ele deve ir para `presentation/hooks/`, não ficar junto a um componente.

```text
// PROIBIDO
presentation/components/buy-simulation-form/use-buy-simulation.ts
// ...e outro componente importa esse hook de dentro do form
```

```text
// CORRETO
presentation/hooks/use-buy-simulation.ts
presentation/components/buy-simulation-form/use-buy-simulation-form.ts
```

---

## ❌ Hook exclusivo de um componente colocado em `presentation/hooks/`

Hooks usados por apenas um componente devem ficar junto ao componente.

```text
// PROIBIDO
presentation/hooks/use-operator-form.ts
```

```text
// CORRETO
presentation/components/operator-form/use-operator-form.ts
```

---

## ❌ Service como função solta

Services devem ser classes com métodos estáticos.

```ts
// PROIBIDO
export async function createOperator(model: Operator): Promise<Operator> {
  return OperatorAPI.create(model);
}
```

```ts
// CORRETO
export class OperatorService {
  static async create(model: Operator): Promise<Operator> {
    return OperatorAPI.create(model);
  }
}
```

Nome obrigatório:

```text
<FeatureName>Service
```

---

## ❌ Service sem validação quando há regra de negócio

Se a mutation possui regra de negócio, o service deve validar antes de chamar a API.

```ts
// PROIBIDO
export class OrderService {
  static async approve(order: Order): Promise<Order> {
    return OrderAPI.approve(order);
  }
}
```

```ts
// CORRETO
export class OrderService {
  static async approve(order: Order): Promise<Order> {
    if (order.status === 'cancelled') {
      throw new Error('Pedido cancelado não pode ser aprovado.');
    }

    return OrderAPI.approve(order);
  }
}
```

Services podem lançar erros de validação ou regra de negócio.

---

## ❌ Chamada HTTP fora de `data/api`

```ts
// PROIBIDO
export class OperatorService {
  static async create(model: Operator): Promise<Operator> {
    const { data } = await httpClient.post('/operators', model);

    return data;
  }
}
```

```ts
// CORRETO
export class OperatorAPI {
  static async create(model: Operator): Promise<Operator> {
    const payload = OperatorMapper.toDTO(model);

    const { data } = await httpClient.post<OperatorDTO>(
      '/operators',
      payload
    );

    return OperatorMapper.toDomain(data);
  }
}
```

Chamadas HTTP pertencem à camada `data/api`.

---

## ❌ API sem tratamento de erro externo

Toda API deve normalizar erros externos usando `data/handlers`.

```ts
// PROIBIDO
export class OperatorAPI {
  static async create(model: Operator): Promise<Operator> {
    const payload = OperatorMapper.toDTO(model);
    const { data } = await httpClient.post<OperatorDTO>('/operators', payload);

    return OperatorMapper.toDomain(data);
  }
}
```

```ts
// CORRETO
export class OperatorAPI {
  static async create(model: Operator): Promise<Operator> {
    try {
      const payload = OperatorMapper.toDTO(model);

      const { data } = await httpClient.post<OperatorDTO>(
        '/operators',
        payload
      );

      return OperatorMapper.toDomain(data);
    } catch (error) {
      handleOperatorError(error, 'createOperator');
    }
  }
}
```

---

## ❌ Criar componentes primitivos manualmente em vez de usar shadcn/ui

Antes de criar qualquer componente em `shared/components/ui/`, verificar se existe equivalente no shadcn/ui e instalá-lo via CLI.

```tsx
// PROIBIDO
export function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}
```

```bash
# CORRETO
pnpm dlx shadcn@latest add button
```

```ts
import { Button } from '@/shared/components/ui/button';
```

---

## ❌ Importar store diretamente na camada `infra/`

A infra não conhece stores.

Dependências como token e callbacks de auth são injetadas via parâmetro pelo bootstrap em `app/`.

```ts
// PROIBIDO
import { useAuthStore } from '@/features/auth/presentation/stores/auth-store';

export const httpClient = axios.create({
  baseURL: env.VITE_GATEWAY_API
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

```ts
// CORRETO
export const setupHttpClientInterceptors = (
  getToken: () => string | null,
  onUnauthorized: () => void
) => {
  httpClient.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
};
```

---

## ❌ `onError` em hooks de mutation para toast global

O `MutationCache` global já trata todos os erros e exibe toasts.

Adicionar `onError` apenas para exibir toast duplica o tratamento.

```ts
// PROIBIDO
useMutation({
  mutationFn: OperatorService.create,
  onError: () => {
    toast.error('Erro ao criar operador');
  }
});
```

```ts
// CORRETO — usar meta para customizar a mensagem
useMutation({
  mutationFn: OperatorService.create,
  meta: {
    errorMessage: 'Não foi possível criar o operador.'
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['operators']
    });
  }
});
```

`onError` local só deve ser usado quando houver ação local específica e sem duplicar toast.

---

## ❌ alert() ou console.error() como feedback de UI

```ts
// PROIBIDO
catch (error) {
  alert('Erro ao salvar');
  console.error(error);
}
```

```ts
// CORRETO
useMutation({
  mutationFn: OperatorService.create,
  meta: {
    errorMessage: 'Erro ao salvar operador.'
  }
});
```

Feedback visual de mutation deve passar pelo `MutationCache`.

---

## ❌ Tipos `any` para dados da API

```ts
// PROIBIDO
const { data } = await httpClient.get('/operators') as any;
```

```ts
// CORRETO
const { data } = await httpClient.get<OperatorDTO[]>('/operators');

return data.map(OperatorMapper.toDomain);
```

---

## ❌ Mapper com regra de negócio

```ts
// PROIBIDO
export class OperatorMapper {
  static toDomain(dto: OperatorDTO): Operator {
    if (dto.role === 'admin') {
      throw new Error('Operador admin não permitido.');
    }

    return {
      id: dto.id,
      name: dto.full_name
    };
  }
}
```

```ts
// CORRETO
export class OperatorMapper {
  static toDomain(dto: OperatorDTO): Operator {
    return {
      id: dto.id,
      name: dto.full_name
    };
  }
}
```

Regra de negócio pertence a `domain/services` ou `domain/validators`.

---

## ❌ Shared importando feature

```ts
// PROIBIDO
import { UserRole } from '@/features/users/domain/entities/user-role';
```

```ts
// CORRETO
// mover tipo genérico para shared/types apenas se for realmente agnóstico ao domínio
```

---

# Regra final

- Componentes não fazem HTTP.
- Hooks não chamam `httpClient`.
- Queries simples usam `data/api`.
- Mutations usam `domain/services`.
- Services são classes estáticas.
- APIs fazem HTTP, mapper e handler.
- DTOs não chegam na UI.
- Features só se comunicam via `index.ts`.
- Feedback visual de mutations passa pelo `MutationCache`.