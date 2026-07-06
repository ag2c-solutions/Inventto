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

## ❌ Acesso a dados direto no componente

```tsx
// PROIBIDO
export function OperatorList() {
  useEffect(() => {
    supabase.from('operators').select().then(...);
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

Componentes não acessam dados diretamente.

---

## ❌ Acesso a dados direto no hook

```ts
// PROIBIDO
export function useOperatorsQuery() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: () => supabase.from('operators').select()
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

Hooks nunca chamam o cliente `supabase` diretamente.

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

DTO pertence à camada `data/dtos`.

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
import { ProductService } from '@/features/products/domain/services';
import { useProductsQuery } from '@/features/products/presentation/hooks/use-queries';
import { ProductAPI } from '@/features/products/data/api';
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
presentation/components/buy-simulation-form/hooks/use-buy-simulation.ts
// ...e outro componente importa esse hook de dentro do form
```

```text
// CORRETO
presentation/hooks/use-buy-simulation.ts
presentation/components/buy-simulation-form/hooks/use-buy-simulation-form.ts
```

---

## ❌ Hook exclusivo de um componente colocado em `presentation/hooks/`

Hooks usados por apenas um componente devem ficar junto ao componente, dentro de `hooks/`.

```text
// PROIBIDO
presentation/hooks/use-operator-form.ts
```

```text
// CORRETO
presentation/components/operator-form/hooks/use-operator-form.ts
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

## ❌ Acesso a dados fora de `data/api`

```ts
// PROIBIDO — service falando com o supabase direto
export class OperatorService {
  static async create(model: Operator): Promise<Operator> {
    const { data } = await supabase.from('operators').insert(model);

    return data;
  }
}
```

```ts
// CORRETO — acesso a dados na camada data/api
export class OperatorAPI {
  static async create(model: Operator): Promise<Operator> {
    const payload = OperatorMapper.toDTO(model);

    const { data } = await supabase
      .from('operators')
      .insert(payload)
      .select()
      .single()
      .overrideTypes<OperatorDTO, { merge: false }>();

    return OperatorMapper.toDomain(data);
  }
}
```

Acesso ao `supabase` pertence à camada `data/api`.

---

## ❌ API sem tratamento de erro externo

Toda API deve normalizar erros externos usando `data/handlers`.

```ts
// PROIBIDO — erro do Postgres/Supabase sobe bruto
export class OperatorAPI {
  static async create(model: Operator): Promise<Operator> {
    const payload = OperatorMapper.toDTO(model);

    const { data } = await supabase
      .from('operators')
      .insert(payload)
      .select()
      .single();

    return OperatorMapper.toDomain(data);
  }
}
```

```ts
// CORRETO — erro tratado e relançado pelo handler
export class OperatorAPI {
  static async create(model: Operator): Promise<Operator> {
    try {
      const payload = OperatorMapper.toDTO(model);

      const { data, error } = await supabase
        .from('operators')
        .insert(payload)
        .select()
        .single()
        .overrideTypes<OperatorDTO, { merge: false }>();

      if (error) throw error;

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

## ❌ Múltiplos componentes no mesmo arquivo

Cada componente vive na própria pasta no padrão `nome-do-componente/index.tsx`.

Não aglomerar vários componentes num único arquivo.

```tsx
// PROIBIDO — dois componentes no mesmo arquivo
// components/operator-list.tsx
export function OperatorItem() { ... }
export function OperatorList() { ... }
```

```tsx
// CORRETO — um componente por pasta, cada um em seu index.tsx
// components/operator-list/index.tsx
import { OperatorItem } from '../operator-item';

export function OperatorList() { ... }
```

```tsx
// components/operator-item/index.tsx
export function OperatorItem() { ... }
```

---

## ❌ Importar store/feature diretamente na camada `infra/`

A infra não conhece stores nem features.

O cliente `supabase` depende apenas de `env`/`constants`. Dependências que precisam de estado de feature são injetadas via parâmetro em `app/providers`.

```ts
// PROIBIDO — infra acoplada a uma store de feature
import { createClient } from '@supabase/supabase-js';

import { useAuthStore } from '@/features/auth/presentation/stores/auth-store';

const token = useAuthStore.getState().token; // ← infra conhecendo feature

export const supabase = createClient(SUPABASE_URL, token);
```

```ts
// CORRETO — infra depende apenas de env/constants
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
const { data } = (await supabase.from('operators').select()) as any;
```

```ts
// CORRETO — tipar o retorno com o DTO via overrideTypes
const { data } = await supabase
  .from('operators')
  .select()
  .overrideTypes<Array<OperatorDTO>, { merge: false }>();

return (data ?? []).map(OperatorMapper.toDomain);
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

## ❌ Recriar util que já existe

Antes de criar qualquer utilitário (máscara, formatação de data, debounce, parse, etc.), busque no projeto (grep) por uma função de mesmo propósito.

Reutilize se já existir em `shared/utils/` ou `features/<feature>/*/utils/`. Só crie se não existir.

```ts
// PROIBIDO — recriar sem checar o que já existe
function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
```

```ts
// CORRETO — reutilizar o utilitário existente
import { formatCurrency } from '@/shared/utils/formatters/format-currency';
```

---

# Regra final

- Componentes não acessam dados diretamente.
- Hooks não chamam o cliente `supabase`.
- Queries simples usam `data/api`.
- Mutations usam `domain/services`.
- Services são classes estáticas.
- APIs acessam o `supabase`, mapper e handler.
- DTOs não chegam na UI.
- Features só se comunicam via `index.ts`.
- Feedback visual de mutations passa pelo `MutationCache`.
- Um componente por arquivo, no padrão `nome-do-componente/index.tsx`.
- Buscar (grep) e reutilizar utils existentes antes de criar novos.