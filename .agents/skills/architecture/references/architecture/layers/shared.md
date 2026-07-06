# Camada Shared

Código reutilizável entre features. Nunca contém regra de negócio, estado de
feature ou DTO.

Vive em:

```text
shared/components
shared/hooks
shared/utils
```

---

## `shared/components/`

Hierarquia completa (níveis `ui/` e `common/`, regras de composição, lista de
componentes comuns existentes) documentada em `references/react/components.md`.

---

## `shared/hooks/`

Hooks genéricos, sem conhecimento de nenhuma feature específica.

Critério de promoção: se um hook não depende de nada de uma feature e é útil
em mais de um lugar, ele vai para cá (ex: `use-debounced-value`,
`use-dropzone`, `use-is-mobile`).

Podem acessar `infra/` diretamente **apenas quando forem o ponto único de
contato** dessa infra (ex: um `use-local-storage` que centraliza acesso a
`infra/local-storage` — ver `references/architecture/layers/features.md`,
seção "Infra técnica de browser"). Hooks de feature não replicam esse acesso;
consomem o hook compartilhado.

---

## `shared/utils/`

Funções puras auxiliares reutilizadas por múltiplas features (ex:
`formatters/`, `objects/`, `parses/`, `validators/`).

Critério de promoção: a mesma lógica usada em duas ou mais features vira
`shared/utils/`. Regra de pureza detalhada em `references/quality/testing.md`.

Exceção: um wrapper fino de infra de serviço externo (ex: `shared/utils/cloudinary`
sobre `infra/cloudinary`) pode viver aqui em vez de `shared/hooks/` quando o
consumo acontece fora de componentes/hooks (ex: adapters, funções chamadas
dentro de `.map()` de renderização) — hooks só podem ser chamados no corpo de
componentes/hooks. Mesmo critério de "ponto único de contato" dos hooks de
infra se aplica: feature-presentation nunca importa `infra/` diretamente,
sempre passa pelo wrapper de `shared/`.

---

## Regras

- `shared/` nunca importa `features/` nem `app/`
- `shared/` pode importar `infra/`
- `shared/` não contém regra de negócio nem DTO
