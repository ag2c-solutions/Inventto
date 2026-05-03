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
export class ProductAPI {
  static async create(product: Product) {
    try {
      const payload = ProductMapper.toDTO(product)

      const { data } = await httpClient.post(
        '/products',
        payload
      )

      return ProductMapper.toDomain(data)
    } catch (error) {
      handleProductError(error, 'createProduct')
    }
  }
}
```

---

# API pode usar

- httpClient
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

# Cliente HTTP Base

```text
infra/api/
```

---

# Interceptors

Configurados no bootstrap:

```text
app/bootstrap.ts
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