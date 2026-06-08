# Inventto — Design System v0.1

*Companheiro da Especificação de Produto v1.0, do UX v0.1 e dos artefatos de tela. Fonte do vocabulário visual que as descrições de tela referenciam.*

## Como usar este documento

Este design system **não foi inventado** — ele consolida o que já existe no código (`Inventto.ui`: shadcn/ui *new-york*, base *zinc*, tokens OKLCH em `src/index.css`, Philosopher + Montserrat, ícones lucide) e resolve as inconsistências que o código acumulou, sobretudo em cores de status. Cada componente e padrão é marcado:

- **[existe]** — já implementado no projeto, documentado aqui como contrato.
- **[estende]** — existe, mas muda nesta versão (ex.: status de estoque de 3 para 4 níveis).
- **[a construir]** — padrão que as telas vão exigir e ainda não está no código.

**Escopo de tema.** A v1 de produto entrega o **tema claro**. Os tokens de tema escuro já existem no código e estão documentados aqui, mas o tema escuro é tratado como **pós-v1** — não é requisito de QA agora (ver Pendências).

---

## 1. Fundamentos

### 1.1. Cor — tokens base (semânticos do shadcn)

Toda cor segue a convenção `nome` / `nome-foreground` (fundo / texto-ícone sobre o fundo). Valores em OKLCH, como no `index.css`. **Nunca** se usa cor crua do Tailwind (`bg-blue-500`) — só estes tokens.

| Token | Papel | Claro (OKLCH) |
|---|---|---|
| `--background` / `--foreground` | Fundo da página / texto padrão | `99.1% 0 271` / `0.141 0.005 286` |
| `--card` / `--card-foreground` | Superfície de card | `1 0 0` / `0.141 0.005 286` |
| `--primary` / `--primary-foreground` | Ação primária | `oklab(0.27 -0.06 0.03)` (verde-pinho ≈ `#032F17`) / `0.985 0 0` |
| `--secondary` / `--secondary-foreground` | Ação secundária | `0.967 0.001 286` / `0.21 0.006 286` |
| `--muted` / `--muted-foreground` | Desabilitado, texto auxiliar | `0.967 0.001 286` / `0.552 0.016 286` |
| `--accent` / `--accent-foreground` | Hover, realce sutil | `0.967 0.001 286` / `0.21 0.006 286` |
| `--destructive` | Erro, ação destrutiva | `0.577 0.245 27.3` (≈ vermelho) |
| `--border` / `--input` | Bordas / bordas de campo | `0.92 0.004 286` |
| `--ring` | Anel de foco | `0.705 0.015 286` |
| `--chart-1`…`--chart-5` | Visualização de dados | laranja, teal, azul, âmbar, dourado |
| `--sidebar-*` | Cores da navegação lateral | tom verde muito claro |

A primária é o coração da marca: um **verde-pinho profundo**, quase preto-esverdeado, sobre fundo quase branco. Ela carrega a identidade; o resto da paleta é neutro (zinc) para não competir.

> **Atenção ao tema escuro.** No `.dark`, a `--primary` atual **não** é o verde — vira um cinza claro (`0.92 0.004 286`), padrão herdado do preset zinc. Ou seja, o tema escuro hoje **perde o verde da marca**. O app já tem um `ToggleTheme` no header, então o `.dark` é alcançável em produção — a v1 de **produto** entrega o claro como padrão, mas o caminho técnico está aberto; quando o escuro virar requisito formal, isso precisa ser revisto para preservar a identidade da marca (ver Pendências).

### 1.2. Cor — tokens de status (novos, semânticos)

Hoje o código pinta status com Tailwind cru e espalhado (`text-red-600`, `bg-emerald-50`, `text-green-600`, `bg-green-200`…), inclusive divergindo entre telas (membro-ativo em *emerald*, estoque-saudável em *green*). Esta versão consolida tudo em **tokens semânticos**: cada status tem uma cor forte (ícone, texto, borda) e uma *soft* (preenchimento de badge); o texto do badge usa o tom forte.

| Token | Papel | Cor forte | Soft (badge) | Ícone lucide |
|---|---|---|---|---|
| `--status-zeroed` | Estoque zerado / esgotado | neutro `0.552 0.016 286` (≈ zinc-500) | `0.967 0.001 286` (≈ zinc-100) | `Ban` / `CircleSlash` |
| `--status-critical` | Crítico (saldo ≤ mínimo, > 0) | `0.577 0.245 27.3` (≈ red-600) | `0.936 0.032 18` (≈ red-100) | `CircleX` |
| `--status-warning` | Atenção (zona de buffer) | `0.667 0.163 58` (≈ amber-600) | `0.962 0.058 95` (≈ amber-100) | `TriangleAlert` |
| `--status-healthy` | Saudável | `0.596 0.145 163` (≈ emerald-600) | `0.95 0.052 163` (≈ emerald-100) | `SquareCheck` |

A escolha do **zerado em neutro** (não em vermelho) é deliberada: "esgotado" lê como *indisponível/apagado*, e libera o vermelho para a urgência real de reposição (crítico). A severidade visual cresce assim: neutro (zerado, sem ação de venda possível) → vermelho (crítico, repor já) → âmbar (atenção) → verde (saudável).

Os mesmos tokens servem aos outros domínios de status, por reuso semântico:

| Domínio | Estado → token |
|---|---|
| **Pedido** | Pendente → `warning` · Confirmado → `healthy` · Expirado → `zeroed` (neutro, decaiu) · Cancelado → `destructive` |
| **Membro** | Ativo → `healthy` · Pendente (convidado) → `warning` · Inativo → `zeroed` (neutro) |
| **Storefront** | No ar → `healthy` · Despublicado → `zeroed` (neutro) |

> Isto **consolida** o que o código fazia à mão: o "inativo" do membro, hoje em vermelho, passa a neutro — desativado é estado dormente, não erro; o vermelho fica reservado a ações e estados destrutivos. E o "saudável" do estoque, hoje em `green-600`, passa a usar o mesmo verde de sucesso (`emerald`) do membro-ativo, unificando o "positivo" num só tom.

### 1.3. Tipografia

Duas famílias, ambas via Google Fonts (já importadas no `index.css`):

- **Philosopher** — display. Títulos de tela, números de destaque, momentos de marca. Pesos 400 e 700. Token `--font-philosopher`.
- **Montserrat** — corpo e interface. Texto, rótulos, tabelas, botões. Pesos 400–700.

Escala sugerida (mobile-first; `rem` sobre base 16px):

| Uso | Família | Tamanho / peso |
|---|---|---|
| Título de tela (H1) | Philosopher | 1.5rem / 700 |
| Seção (H2) | Philosopher | 1.25rem / 700 |
| Subtítulo (H3) | Montserrat | 1.0rem / 600 |
| Corpo | Montserrat | 0.875rem / 400 |
| Auxiliar / legenda | Montserrat | 0.75rem / 400, `muted-foreground` |
| Rótulo de botão | Montserrat | 0.875rem / 600 |

### 1.4. Espaçamento e layout

Base de **4px** (escala Tailwind: `1` = 4px, `2` = 8px, `4` = 16px…). Espaçamento entre elementos sempre por **`gap-*`** em flex/grid — nunca `space-x-*`/`space-y-*` (convenção do projeto). Densidade baixa por princípio de UX: respiro generoso, agrupamento claro, uma ação primária por tela.

### 1.5. Raio de borda

`--radius: 0.625rem`, com a escala derivada (já no `@theme`): `sm = radius − 4px`, `md = radius − 2px`, `lg = radius`, `xl = radius + 4px`. Cards e botões usam `lg`; chips e badges, `md` ou `sm`.

### 1.6. Elevação **[convenção]**

O projeto usa sombra mínima — a `SidebarInset` no variant `inset` recebe `shadow-sm`, e os overlays do shadcn (`Sheet`, `Dialog`) já trazem a própria. Convenção contida, a manter: `shadow-sm` para cards e popovers em repouso, `shadow-md` para overlays. Sem sombras dramáticas — a hierarquia vem de espaço e borda, coerente com a baixa densidade.

### 1.7. Ícones

Biblioteca única: **lucide** (`lucide-react`). Tamanhos: `size-4` (16px) inline e em badges; `size-6` (24px) em destaques e estados de status na tabela. Ícone sempre acompanha rótulo, exceto em tabela densa, onde o ícone de status fica sozinho **com tooltip** (ver 4.2).

### 1.8. Breakpoints (mobile-first)

Escala padrão do Tailwind: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. O app interno é desenhado **a partir do mobile** e ganha colunas em telas maiores (ex.: Dashboard empilha no mobile, dois blocos lado a lado no `lg`+).

---

## 2. Componentes

### 2.1. Primitivos shadcn **[existe]**

Vivem em `shared/components/ui/`. Confirmados em uso no projeto: **Button**, **Badge**, **Tooltip**, **Select**, **Input**, **Skeleton**, **Separator**, **Sheet** (usado pela sidebar no mobile), **Table** (estrutural), e a família **Sidebar** completa — `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarInset`, `SidebarHeader/Content/Footer`, `SidebarMenu*` (item, button, sub, badge, skeleton), `SidebarRail`, hook `useSidebar`. Spinner `Loader2` do lucide. Demais primitivos (Dialog, Card, Tabs, Form, Checkbox, Switch…) entram do shadcn conforme a necessidade, sempre via tokens — sem cor crua, sem `className` para cor/tipografia (só layout).

### 2.2. Componentes compostos do produto

Vivem em `shared/components/common/` (compartilhados), `app/layouts/` (estrutura) e `features/permissions/` (gating).

| Componente | Estado | Onde | Descrição |
|---|---|---|---|
| **AppShell** = `SystemLayout` + `SystemLayoutHeader` + `SystemLayoutSidebar` | [existe] | `app/layouts/system/` | Casca da aplicação. Header fixo com `SidebarTrigger`, `ToggleTheme`, sino de notificações e `UserNav`; sidebar lateral baseada na família `Sidebar` do shadcn. **No mobile, a sidebar colapsa para um `Sheet`** acionado pelo `SidebarTrigger` — não há bottom-nav. Itens da sidebar são suprimidos por papel (RF015), via gating. |
| `PageHeader` | [existe] | `shared/components/common/page-header/` | Cabeçalho dentro da tela (sob o header da AppShell): `SidebarTrigger` + título (`h1`). |
| `DataTable` (família) | [existe] | `shared/components/common/data-table/` | Composto rico sobre TanStack Table. Exporta: `DataTable` (wrapper com `tableOptions`, `renderSubRow`, `emptyMessage`), `DataTableContent`, filtros `DataTableTextFilter` / `DataTableSelectFilter` / `DataTableDateRangeFilter`, `DataTableDropdownColumnsVisibility`, `DataTableHeaderSortableColumn`, `NestedDataTable` (linhas expandidas, ex.: variantes), `PaginationControllers`, hook `useDataTable`. **Estado vazio integrado** via prop `emptyMessage`. |
| `SimpleDataTable` | [existe] | `shared/components/common/simple-data-table/` | Versão mínima sem filtros nem paginação. Vazio default ("Nenhum registro disponível.") ou via `emptyMessage`. |
| `ActionButton` | [existe] | `features/permissions/` | Botão envolvido por gating de permissão — implementação real do RF015 (a ação **some** para o papel sem permissão, em vez de só desabilitar). Usado em CTAs de cabeçalho e ações por linha. |
| `Skeleton` (primitivo) | [existe] | `shared/components/ui/skeleton.tsx` | Bloco animado de carregamento. Cada feature compõe seu skeleton específico (ex.: `MembersTableSkeleton`) — convenção, não componente único compartilhado. |
| `STOCK_STATUS_CONFIG` + badge de estoque | [estende] | `features/products/.../status-config.tsx` | Indicador de status de estoque. Hoje com 3 níveis (crítico/atenção/saudável) em cores Tailwind cruas; **estende para 4** incluindo `zeroed` (ícone `Ban`/`CircleSlash`, token `--status-zeroed`), e **migra das cores cruas para os tokens `--status-*`**. Em tabela: ícone + tooltip com saldo e mínimo. Em produto com variantes: pior caso vence (zerado > crítico > atenção > saudável). Deriva de RN050. |
| Badge de status (membro, pedido, storefront) | [estende] | múltiplos | Hoje há um `getStatusConfig` por feature (no membro, com emerald/red/amber crus). **Consolida** num `StatusBadge` genérico alimentado pelos tokens semânticos `--status-*`, com bolinha + rótulo (Microcopy §8). |
| `ToggleTheme` | [existe] | `app/theme/` | Alterna entre tema claro e escuro a partir do header. |
| `UserNav` | [existe] | `app/layouts/system/components/user-nav/` | Dropdown do usuário logado no header (perfil, troca de organização, sair). |
| `EmptyState` autônomo | [a construir] | a definir | Para vazios fora de tabela (dashboard de loja nova, grade vazia, etc.). Ícone, frase, **uma** CTA. (Para tabelas, o `emptyMessage` do `DataTable`/`SimpleDataTable` já resolve.) |
| `OnboardingStepper` | [a construir] | a definir | Trilha dos primeiros passos no Dashboard de loja nova (cadastrar produto → registrar estoque → criar catálogo → publicar vitrine), com itens que se marcam ao concluir. |
| Card de produto da vitrine | [a construir] | `features/storefront/.../` | Card mobile-first com imagem em foco, preço (ou "Consultar"), badge de destaque e badge de disponibilidade — usado na grade da vitrine pública. |

---

## 3. Padrões de uso

### 3.1. Estados de tela

Os estados seguem os padrões globais da **Matriz de Estados** (`matriz-estados-v1.md`): *Carregando* = skeleton; *Vazio* = `EmptyState` com CTA; *Erro* = mensagem inline **e** toast, neutra; *Sem permissão* = redirect silencioso (recurso indistinguível de inexistente). O design system fornece os componentes; a Matriz diz onde cada estado aparece.

### 3.2. Exibição de status

Duas formas, conforme densidade:
- **Ícone só, com tooltip** — em tabelas densas (coluna de estoque). O tooltip traz o rótulo e os números (saldo, mínimo). Acessibilidade por `aria-label`.
- **Badge com bolinha + rótulo** — em telas de detalhe, cabeçalhos e listas arejadas (status de pedido, de membro, de storefront).

Em ambos, cor e ícone vêm sempre do token de status — nunca de cor crua.

### 3.3. Densidade e clareza

Princípio de UX aplicado ao visual: baixa densidade, hierarquia por espaço e tipografia (Philosopher para ancorar, Montserrat para ler), uma ação primária por tela em `--primary`. Ações secundárias em `outline`/`ghost`; destrutivas em `destructive`, sempre com confirmação proporcional ao risco.

### 3.4. Voz e microcopy

Os textos seguem a **Biblioteca de Microcopy** (`microcopy-v1.md`): mensagens neutras, bloqueios orientativos (dizem o que falta), validação inline junto ao campo, confirmação por digitação só em ações irreversíveis. O design system define os recipientes (badge, toast, campo); a Microcopy define o conteúdo.

### 3.5. Responsividade

Mobile-first em todo o app interno. O `AppShell` mantém o mesmo padrão de navegação em todos os tamanhos — header fixo com `SidebarTrigger` e a **sidebar colapsível**: no mobile ela abre como `Sheet` em overlay sobre o conteúdo, e no `lg`+ fica fixada à esquerda. Listas ganham colunas e filtros mais ricos em telas largas; o Dashboard empilha no mobile e abre duas colunas no `lg`+. A vitrine pública é mobile-first por natureza — é onde o cliente final chega.

---

## 4. Pendências e decisões registradas

**Decisões fechadas nesta versão:**
1. **Zerado em neutro** (opção semântica), com ícone próprio — não em vermelho.
2. **Status viram tokens semânticos** (`--status-*`), consolidando as cores cruas espalhadas; pedido, membro e storefront reusam o mesmo conjunto.
3. **Tema escuro documentado, mas pós-v1 do produto.** O código já tem `ToggleTheme` ativo e os tokens escuros — a v1 de produto/QA entrega o claro como padrão, e o escuro fica como evolução formal (quando entrar, abre as pendências da primária e dos pares escuros dos novos tokens, abaixo).
4. **Escopo inclui padrões "a construir"** — `OnboardingStepper`, `EmptyState` autônomo, e o card de produto da vitrine — marcados como tais, para servir de contrato à fase de telas.

**A resolver quando o tema escuro entrar em pauta:**
- A `--primary` do `.dark` hoje perde o verde da marca (vira cinza claro). Definir a primária escura preservando a identidade.
- Gerar os pares escuros dos tokens de status novos (`--status-*` no `.dark`): tom forte mais claro, soft mais escuro.

**Dívida técnica que este DS endereça (lado do código):**
- Estender `STOCK_STATUS_CONFIG` e `ProductStockStatus` para incluir `zeroed` (alinhado à mudança já prevista em `get-stock-status.ts`).
- Substituir as cores cruas de status (em `status-config.tsx`, nos badges de membro e em colunas de tabela) pelos tokens `--status-*`.
- Generalizar o badge de status num `StatusBadge` reutilizável — hoje há um `getStatusConfig` por feature; com pedido e storefront precisando dos mesmos rótulos, faz sentido consolidar.

---

*Fim do documento. Design System v0.1 — companheiro da Especificação de Produto v1.0 e do UX v0.1.*
