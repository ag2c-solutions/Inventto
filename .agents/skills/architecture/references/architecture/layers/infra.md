# Camada Infra

Tudo que é externo à aplicação — não só chamadas a backend, mas também APIs do
browser.

Vive em:

```text
infra/supabase
infra/real-time
infra/cloudinary
infra/viacep
infra/email
infra/env
infra/local-storage
```

Responsável por:

- cliente `supabase` base (SDK)
- Supabase Realtime
- integrações HTTP externas (Cloudinary, ViaCEP, e-mail)
- validação de variáveis de ambiente (`env`)
- APIs do browser (`localStorage`, e equivalentes)
- integrações técnicas globais

Clientes realtime podem atualizar diretamente:

```text
React Query Cache
```

---

## Infra NÃO pode:

❌ importar hooks

❌ importar components

❌ importar services

❌ importar stores

❌ importar features

---

Dependências que precisam de estado de feature devem ser injetadas via:

```text
app/providers
```

O cliente `supabase` depende apenas de `env`/`constants`. Sessão/auth são
gerenciadas pelo próprio Supabase (`onAuthStateChange`), não por interceptors.

---

# Quem pode consumir Infra

`features/` e `shared/` podem importar `infra/` diretamente (respeitando as
regras de acesso via hook único descritas em
`references/architecture/layers/features.md` e
`references/architecture/layers/shared.md`).

`app/` nunca importa `infra/` diretamente — sempre através de `features/`.
