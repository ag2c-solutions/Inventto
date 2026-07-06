# Páginas

## O que é uma página

Uma página é o **componente de entrada de uma rota**. Ela compõe os componentes da
feature numa view completa e é o ponto onde a orquestração de dados da tela acontece.

Páginas vivem em:

```text
features/<feature>/presentation/pages/
```

Duas formas aceitas:

```text
presentation/pages/movements-list/index.tsx   # pasta-por-página (quando há teste colocado)
presentation/pages/settings.tsx                # arquivo único (páginas simples)
```

Prefira **pasta-por-página com `index.tsx`** quando houver teste colocado
(`index.test.tsx`) ou arquivos auxiliares.

---

## Convenções

- **Export nomeado** — nunca `export default`.
- Nome no padrão `<Contexto>Page`: `MovementsListPage`, `SettingsPage`, `CreateProductPage`,
  `ProductDetailsPage`.
- Exportada pelo **barrel da feature** (`features/<feature>/index.ts`) — o router importa
  de `@/features/<feature>`, nunca de caminho interno.

---

## Responsabilidades

Diferente de um componente comum, a página **pode orquestrar dados**:

- chamar hooks de query da feature (`use-queries`)
- ler parâmetros de rota (`useParams`, `useSearchParams`)
- tratar `isLoading` / estados de topo (ex: renderizar skeleton)
- compor os componentes da feature e passar dados por props

```tsx
export function MovementsListPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || undefined;

  const { data, isLoading } = useMovementsQuery(
    productId ? { productId } : undefined
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-1.5 px-1 md:px-6 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Movimentações</h1>
        <p className="text-sm text-muted-foreground">
          Histórico cronológico e auditável de entradas e saídas de estoque.
        </p>
      </div>

      <div className="px-1 md:px-6 pb-6 flex-1 flex flex-col">
        <MovementsListTable data={data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
```

Página simples que só delega para um componente:

```tsx
export function SettingsPage() {
  const { isLoading } = useOrganizationQuery();

  if (isLoading) return <OrganizationSettingsFormSkeleton />;

  return <OrganizationSettingsForm />;
}
```

---

## Onde a página NÃO vive

O **shell** (sidebar, header de topo, container de padding) é responsabilidade do
layout, não da página. `SystemLayout` já provê:

- `SystemLayoutSidebar` e `SystemLayoutHeader`
- o container `flex flex-1 flex-col p-4 lg:p-6` que envolve o `<Outlet />`
- `SystemErrorBoundary`

A página renderiza **dentro** desse container. Não recriar sidebar/header por página.

---

## Registro no router

Páginas são **lazy-loaded** em `app/routers/index.tsx` e protegidas por permissão
via `CanNavigate`:

```tsx
{
  path: 'movements',
  element: <CanNavigate required="movement:view" />,
  children: [
    {
      index: true,
      lazy: async () => {
        const { MovementsListPage } = await import('@/features/movements');
        return { Component: MovementsListPage };
      }
    }
  ]
}
```

---

## Registro na sidebar

Páginas acessadas via menu lateral precisam **também** ser registradas em
`navGroups`, em `app/layouts/system/constants/navlinks-sidebar.tsx`:

```tsx
{
  group: 'INVENTÁRIO',
  items: [
    {
      label: 'Movimentações',
      href: '/movements',
      icon: ArrowRightLeft,
      permission: 'movement:view',
      enabled: true
    }
  ]
}
```

Campos de `NavItem`:

| Campo | Responsabilidade |
|---|---|
| `label` | Texto exibido no menu |
| `href` | Rota (deve bater com o `path` registrado no router) |
| `icon` | Ícone (`lucide-react`) |
| `permission` | Mesma permissão usada no `CanNavigate` da rota |
| `enabled` | `false` enquanto a rota do módulo não existir no router — item aparece desabilitado/oculto |

Registro no router e em `navGroups` são independentes: uma rota pode existir
sem aparecer na sidebar (ex: página de detalhe acessada só por navegação
interna), mas uma página do menu lateral sempre precisa das duas.

---

## Regras

- Export nomeado, nome `<Contexto>Page`
- Exposta pelo barrel `index.ts` da feature
- Pode orquestrar dados (query hooks, params de rota, loading de topo)
- Página acessada via sidebar → registrar também em `navGroups`
- Regra de negócio continua no `domain/services`; a página só orquestra e compõe
- Não recriar o shell (sidebar/header/container) — isso é do layout
- Registrada no router com lazy import + `CanNavigate` quando exigir permissão
