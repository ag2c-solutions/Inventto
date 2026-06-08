# Regras de Imports e Dependências

## Alias de Importação

Sempre usar `@/` para imports absolutos a partir de `src/`.

```ts
import { supabase } from '@/infra/supabase'
import { Button } from '@/shared/components/ui/button';
```

Dentro da própria feature, prefira imports relativos.

```ts
import { OperatorService } from '../../domain/services/operator-service';
import { OperatorAPI } from '../../data/api/operator-api';
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
import { ProductService } from '@/features/products/domain/services/product-service';
import { useProductsQuery } from '@/features/products/presentation/hooks/use-queries';
import { ProductAPI } from '@/features/products/data/api/product-api';
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

Ordem padrão do projeto:

1. Bibliotecas externas
2. Imports absolutos internos
3. Imports relativos da própria feature
4. Imports de tipos

```ts
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/infra/supabase'
import { Button } from '@/shared/components/ui/button';

import { OperatorAPI } from '../../data/api/operator-api';
import { OperatorMapper } from '../../data/mapper/operator-mapper';

import type { Operator } from '../../domain/entities/operator.model';
```

---

# Regras para imports relativos dentro da feature

Dentro da própria feature, use imports relativos entre camadas.

Exemplo em `presentation/hooks/use-mutations.ts`:

```ts
import { OperatorService } from '../../domain/services/operator-service';
```

Exemplo em `domain/services/operator-service.ts`:

```ts
import { OperatorAPI } from '../../data/api/operator-api';
```

Exemplo em `data/api/operator-api.ts`:

```ts
import { OperatorMapper } from '../mapper/operator-mapper';
import { handleOperatorError } from '../handlers/operator-error-handler';
```

---

# Regra do Balcão

Uma feature nunca deve consumir detalhes internos de outra feature.

Errado:

```ts
import { AuthService } from '@/features/auth/domain/services/auth-service';
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
import { ProductMapper } from '@/features/products/data/mapper/product-mapper';
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
import { AuthService } from '@/features/auth/domain/services/auth-service';
```

---

# Regra principal

Imports devem preservar isolamento.

Dentro da feature: imports relativos.

Entre features: apenas via `index.ts`.

Código compartilhado: somente em `shared`.

Clientes externos: somente em `infra`.