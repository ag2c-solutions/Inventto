# Domain Services

Services vivem em:

```text
features/<feature>/domain/services/
```

Responsáveis por:

- regras de negócio
- validações
- orquestração
- decisões de domínio
- erros de negócio

---

# Quando criar um service?

Crie quando houver:

- mutation
- validação
- regra de negócio
- orquestração
- múltiplas chamadas

---

# Quando NÃO criar um service?

Queries simples:

```text
API → Hook → UI
```

---

# Estrutura

Services devem ser classes com métodos estáticos.

```ts
export class ProductService {
  static async create(product: Product) {
    if (!product.name.trim()) {
      throw new Error('Nome obrigatório')
    }

    return ProductAPI.create(product)
  }
}
```

---

# Services podem lançar erros

```ts
throw new Error(...)
```

---

# Services NÃO podem

❌ fazer HTTP direto  
❌ usar React  
❌ usar React Query  
❌ manipular DTO  
❌ fazer mapper manualmente

---

# Fluxo de mutation

```text
UI
↓
Hook
↓
Service
↓
API
```

---

# Regra principal

Service protege o domínio.