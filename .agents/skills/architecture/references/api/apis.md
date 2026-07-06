# Data API

APIs vivem em:

```text
features/<feature>/data/api/
```

Responsáveis por:

- chamadas HTTP
- integração externa
- mapper
- handlers

---

# Estrutura

APIs devem ser classes com métodos estáticos.

```ts
import { supabase } from '@/infra/supabase';

import { ProductMapper } from '../mappers';
import { handleProductError } from '../handlers/error-handler';
import type { Product } from '../../domain/entities';

export class ProductAPI {
  static async create(product: Product): Promise<Product> {
    try {
      const payload = ProductMapper.toDTO(product);

      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return ProductMapper.toDomain(data);
    } catch (error) {
      return handleProductError(error, 'createProduct');
    }
  }
}
```

---

# API pode usar

- cliente supabase (@/infra/supabase)
- DTO
- mapper
- handlers

---

# API NÃO pode usar

❌ React  
❌ React Query  
❌ Zustand  
❌ regra de negócio  
❌ componentes

---

# Cliente de Dados Base

```text
infra/supabase/
```

---

# Fluxo

```text
API
↓
Mapper
↓
Handler
↓
Backend
```

---

# Regra principal

API é a fronteira externa da feature.