# Regras de Imports e Dependências

## Alias de Importação

Sempre usar `@/` para imports absolutos a partir de `src/`.

```ts
import { supabase } from '@/infra/supabase'
import { Button } from '@/shared/components/ui/button';
```

Dentro da própria feature, prefira imports relativos.

```ts
import { OperatorService } from '../../domain/services';
import { OperatorAPI } from '../../data/api';
import { useOperatorsQuery } from '../hooks/use-queries';
```

---

# Limites de Dependência

## Features

Features podem importar:

- `shared/`
- `infra/`
- arquivos internos da própria feature via import relativo
- API pública de outra feature via `index.ts`

---

## Permitido

```ts
import { Datatable } from '@/shared/components/common/datatable';
import { supabase } from '@/infra/supabase'
import { getProducts } from '@/features/products';
```

---

## Proibido

Nunca importar arquivos internos de outra feature.

```ts
import { ProductService } from '@/features/products/domain/services';
import { useProductsQuery } from '@/features/products/presentation/hooks/use-queries';
import { ProductAPI } from '@/features/products/data/api';
```

Comunicação entre features deve acontecer apenas pelo `index.ts` da feature consumida.

---

# Shared

`shared` pode importar:

- bibliotecas externas
- `infra/`

`shared` não pode importar:

- `features/`
- `app/`

---

# Infra

`infra` deve ser independente.

`infra` não deve importar:

- `features/`
- `shared/components`
- `app/`

A camada `infra` deve conter clientes e integrações genéricas.

---

# Ordem de Imports

Ordem aplicada automaticamente via `simple-import-sort` (`eslint.config.js`):

1. `react`/`react-dom`/`react-router` e demais bibliotecas externas
2. `@/infra/*`
3. `@/shared/*`
4. `@/features/*`
5. `@/app/*`
6. Imports relativos de camadas acima (`../`)
7. Imports relativos do mesmo diretório (`./`)
8. `*.css`

Os grupos de alias vão da camada macro mais externa/fundação (`infra`, sem
dependência de nada) até a mais interna/específica desta aplicação (`app`, que
depende de tudo) — mesma direção de dependência documentada em
`references/architecture/layers.md`.

Não existe um grupo separado de "imports de tipos" — o projeto usa
`fixStyle: 'inline-type-imports'`: o modificador `type` fica **dentro** do
import, na posição em que ele naturalmente cairia (não é puxado para o fim do
arquivo).

```ts
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/infra/supabase';
import { Button } from '@/shared/components/ui/button';

import { OperatorAPI } from '../../data/api';
import { OperatorMapper } from '../../data/mappers';
import type { Operator } from '../../domain/entities';
```

---

# Regras para imports relativos dentro da feature

Dentro da própria feature, use imports relativos entre camadas.

Exemplo em `presentation/hooks/use-mutations.ts`:

```ts
import { OperatorService } from '../../domain/services';
```

Exemplo em `domain/services/index.ts`:

```ts
import { OperatorAPI } from '../../data/api';
```

Exemplo em `data/api/index.ts`:

```ts
import { OperatorMapper } from '../mappers';
import { handleOperatorError } from '../handlers/error-handler';
```

---

# Regra do Balcão

Uma feature nunca deve consumir detalhes internos de outra feature.

Errado:

```ts
import { AuthService } from '@/features/auth/domain/services';
```

Correto:

```ts
import { getCurrentUser } from '@/features/auth';
```

O `index.ts` é o único ponto autorizado para comunicação entre features.

---

# Anti-patterns

## Import profundo entre features

❌

```ts
import { ProductMapper } from '@/features/products/data/mappers';
```

---

## Shared dependendo de feature

❌

```ts
import { UserRole } from '@/features/users/domain/entities/user-role';
```

---

## Infra dependendo de feature

❌

```ts
import { AuthService } from '@/features/auth/domain/services';
```

---

# Regra principal

Imports devem preservar isolamento.

Dentro da feature: imports relativos.

Entre features: apenas via `index.ts`.

Código compartilhado: somente em `shared`.

Clientes externos: somente em `infra`.