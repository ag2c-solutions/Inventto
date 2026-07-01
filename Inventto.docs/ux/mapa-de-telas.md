# Inventto — Mapa de Telas v0.1

*Companheiro da Especificação de Produto v1.0 e do Documento de UX v0.1.*

## Como usar este documento

Este é o **inventário de telas** da v1: a ponte entre a narrativa de jornada (UX, Parte II) e a especificação de tela detalhada que virá na fase de wireframe. O objetivo é enumerar e rastrear — *quais* telas existem, *onde*, para *quem*, e *qual* parte da especificação cada uma realiza —, não descrever cada tela em prosa.

O mapa é organizado por **superfície** (a divisão de mais alto nível) e, dentro do app interno, por **módulo** (espelhando a especificação, para rastreabilidade). Varrendo a coluna *Realiza*, confirma-se que todos os 38 RFs aparecem em alguma tela (cobertura ao final). As referências (`RFxxx`, `RNxxx`) apontam para o Documento de Produto.

**Convenção de granularidade.** "Tela" = uma rota navegável (um wizard multi-step conta como uma tela). Modal, painel lateral, toast e estados (carregando, vazio, sucesso, erro) **não** são telas próprias — são anotados na coluna *Notas* e detalhados depois na matriz de estados. Linhas iniciadas por "—" são esses itens **não-tela**, listados para deixar a regra explícita.

**Legenda das colunas.** *Tela* · *Rota* · *Acesso* (papéis) · *Realiza* (RF · RN) · *Notas*. (As decisões que antes ficavam marcadas com **⚑** já foram fechadas — ver Parte III do UX; o mapa não traz mais marcações pendentes.)

---

# Superfície 1 — Transversal: Acesso & Shell

Telas de entrada (pré-shell, públicas ou por token) e o casco que envolve todo o app interno. Não pertencem a um módulo de negócio.

## 1.1. Acesso (Autenticação)

> **Nota.** O **RF003** (verificação de e-mail) **não tem rota dedicada**: é realizado como *step embutido* em três fluxos — Passo 3 do Cadastro, Passo 2 condicional do Login (quando o e-mail está pendente, caso de cadastro abandonado) e Passo 2 do Primeiro acesso. A descrição visual do step compartilhado fica em `descricao-telas-v1.md`, seção 1.0.1.

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Cadastro de conta (3 passos) | `/cadastro` | Público | RF001, RF003 · RN003, RN006, RN007, RN009 | Org → credenciais → verificação por código (OTP no Passo 3) |
| Login (1 ou 2 passos) | `/login` | Público | RF002, RF003 · RN002, RN003, RN004, RN005 | Step 2 condicional (OTP) só se e-mail pendente; erro neutro; sessão rolling 24h |
| Recuperar senha | `/recuperar-senha` | Público | RF004 · RN002 | Mensagem não revela se o e-mail existe |
| Redefinir senha | `/redefinir-senha` | Token | RF004 · RN001, RN012, RN013 | Política de senha; link com validade e uso único |
| Primeiro acesso (2 passos) | `/primeiro-acesso` | Convidado | RF005, RF003 · RN003, RN015 | Senha → verificação (OTP no Passo 2); bloqueia até concluir |

## 1.2. Shell do app (casco autenticado)

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Shell + navegação por papel | envolve as rotas internas | Owner/Manager/Sales | RF015 · RN032, RN091 | Não é tela; oculta/desabilita itens por papel |
| Seletor / troca de organização | menu do shell | Owner/Manager/Sales | RF008 · RN010, RN011 | Troca sem recarregar; lembra a última ativa |
| — central de notificações | painel do shell | Owner/Manager/Sales | RF035 · RN089 | Não é tela; alertas in-app em tempo real |
| Conta e perfil | `/conta` | Owner/Manager/Sales | RF002 | Dados pessoais, logout |
| — página de erro / sem acesso | qualquer rota inválida | Todos | — | Estado global (404 / 403) |

---

# Superfície 2 — App interno (Stores)

A experiência autenticada da equipe, dentro do shell, por módulo.

## 2.1. Módulo: Organização

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Configuração da organização | `/organizacao` | Owner | RF007 · RN018, RN024, RN025 | Identidade fiscal, endereço (CEP), logo; edição confirmada |
| Criar organização adicional | `/organizacao/nova` | Owner | RF006, RF009 · RN022, RN026 | Wizard; replicação de config só na criação |
| — modal: desativar organização | (modal) | Owner | RF010 · RN027, RN028 | Não é tela; cancela pendentes; storefronts off |
| — modal: excluir organização | (modal destrutivo) | Owner | RF011 · RN029, RN030 | Não é tela; digitar nome fantasia; slug em quarentena |

## 2.2. Módulo: Equipe & Permissões

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Lista de membros | `/equipe` | Owner | RF014 · RN031, RN036 | Estados do membro; gestão de equipe é exclusiva do Owner |
| Convidar / adicionar membro | `/equipe/novo` | Owner | RF012, RF013 · RN032, RN034, RN035 | E-mail já existente → replicação |
| — gestão do membro (papel/estado) | (painel) | Owner | RF014 · RN037 | Não é tela; invariantes do Owner |

## 2.3. Módulo: Produtos

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Lista / busca de produtos | `/produtos` | Owner, Manager (Sales: leitura) | RF017 · RN057 | Custos ocultos do Sales; vazio conduz |
| Cadastro de produto (wizard) | `/produtos/novo` | Owner, Manager | RF016 · RN038, RN039, RN041 | Multi-step; SKU único; estoque inicial zero |
| Detalhe de produto (leitura) | `/produtos/:id` | Owner, Manager, Sales | RF017 · RN017 | Ficha somente-leitura; única tela de produto acessível ao Sales; ponte para registrar movimentação |
| Edição de produto | `/produtos/:id/editar` | Owner, Manager | RF018 · RN044 | SKU imutável quando há histórico |
| — modal: inativar produto | (modal) | Owner, Manager | RF019 · RN045 | Não é tela; soft delete |
| Categorias | `/produtos/categorias` | Owner, Manager | RF020 · RN046 | Inline; retenção de estrutura |
| Importar produtos (entre orgs) | `/produtos/importar` | Owner, Manager | RF021 · RN047, RN048 | Isolamento comercial; sem duplicar |

## 2.4. Módulo: Movimentações de estoque

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Histórico de movimentações | `/movimentacoes` | Owner, Manager (Sales: leitura sem custo) | RF023 · RN051, RN057 | Livro imutável; custo por papel |
| Registrar movimentação | `/movimentacoes/nova` | Owner, Manager | RF022 · RN052, RN053, RN055 | Página dedicada; multi-item (N produtos/variantes); motivo obrigatório; saldo ≥ 0 |

## 2.5. Módulo: Catálogos

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Lista de catálogos | `/catalogos` | Owner, Manager (Sales: leitura) | RF024 · RN062 | Vazio conduz: "Criar primeiro catálogo" |
| Criar / editar catálogo | `/catalogos/novo` · `/catalogos/:id` | Owner, Manager | RF024 · RN059, RN060 | Sem campo "tipo" — catálogo é canal-agnóstico |
| Curadoria de itens | `/catalogos/:id/itens` | Owner, Manager | RF025 · RN063 | Destaque **não** aqui (vai no storefront) |
| — modal: remoção bloqueada | (modal) | Owner, Manager | RN061 | Não é tela; canais vinculados impedem excluir |

## 2.6. Módulo: Vendas no balcão (PDV)

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Nova venda no balcão | `/pdv` | Sales, Manager, Owner | RF026 · RN064, RN065, RN068, RN069 | Caso extremo de eficiência; cliente opcional; preço do catálogo vinculado |
| Consulta de vendas | `/pdv/vendas` | Manager, Owner (Sales: as próprias) | RF027 · RN069 | Auditoria de valor e desconto |

## 2.7. Módulo: Storefront (configuração)

Configuração do canal online, feita de dentro do app interno. (A vitrine em si é a Superfície 3.)

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Lista de storefronts | `/storefronts` | Owner, Manager | RF028 · RN070 | Vários por organização |
| Configurar storefront | `/storefronts/:id` | Owner, Manager | RF028 · RN072, RN075, RN076, RN077 | Catálogo vinculado, slug, tema, contato, destaque, exibição de preço; bloqueio orientativo de publicação |

## 2.8. Módulo: Pedidos online (painel)

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Painel de pedidos (pool + meus) | `/pedidos` | Owner, Manager, Sales | RF034 · RN082, RN085 | Assumir; a contagem para ao assumir; tempo real |
| Atendimento do pedido | `/pedidos/:id` | Owner, Manager, Sales | RF034 · RN087, RN088 | Confirmar (vira saída) / cancelar (libera reserva) |
| — reserva e expiração | (backend, sem tela) | — | RF033 · RN086 | Lógica de reserva; reflete no painel |

## 2.9. Módulo: Dashboard

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Dashboard | `/` (home pós-login) | Owner, Manager, Sales | RF036, RF037, RF038 · RN090, RN091, RN092 | Tela inicial; três blocos verticais — atenção imediata (pedidos pendentes + estoque crítico/zerado + perto de expirar), resumo de vendas (gráfico 7/30/90d, Owner/Manager), atividade e atalhos; adaptada por papel |

---

# Superfície 3 — Vitrine pública (Loja)

O canal online visto pelo cliente final: externo, no celular, sem login.

| Tela | Rota | Acesso | Realiza | Notas |
|---|---|---|---|---|
| Vitrine (home da loja) | `/:slug` | Público | RF029, RF030 · RN070, RN071, RN076, RN078 | Mobile-first; status aberto/fechado; preço pode ser ocultado |
| Detalhe de produto | `/:slug/p/:produto` | Público | RF029 · RN077 | Variantes, destaque, indicador de estoque |
| Checkout | `/:slug/checkout` | Público | RF032 · RN083, RN084 | Quatro campos obrigatórios; CEP autopreenche |
| Loja indisponível | `/:slug` (estado) | Público | RF030 · RN074 | Estado: storefront inativo ou organização desativada |
| — saída WhatsApp | (ação) | Público | RF031 · RN079 | Não é tela; abre conversa, não cria pedido |

---

# Cobertura e pendências

## Cobertura dos RFs

Os 38 RFs aparecem em pelo menos uma tela. Distribuição por superfície/módulo:

- **Acesso & Shell:** RF001–RF005 (acesso), RF008, RF015, RF035, RF002 (shell).
- **App interno:** RF006, RF007, RF009, RF010, RF011 (Organização); RF012, RF013, RF014 (Equipe); RF016–RF021 (Produtos); RF022, RF023 (Movimentações); RF024, RF025 (Catálogos); RF026, RF027 (PDV); RF028 (Storefront/config); RF033, RF034 (Pedidos/painel); RF036, RF037, RF038 (Dashboard).
- **Vitrine pública:** RF029, RF030, RF031, RF032.

## Pendências sinalizadas (⚑)

Resolvidas — não há mais ⚑ no mapa. As decisões que travavam telas no protótipo foram fechadas: a lista de motivos de movimentação (RN053), o status de estoque com derivação do indicador da vitrine (RN050, RF030), o arranjo dos três blocos do Dashboard (RF036–RF038) e a escolha de um único layout curado para a vitrine na v1.

## Próximos artefatos (fase de UX)

A partir deste mapa: matriz de estados por tela (carregando/vazio/sucesso/erro), biblioteca de microcopy, variações por papel e, então, o protótipo navegável.

---

*Fim do documento. Mapa de Telas v0.1 — companheiro da Especificação de Produto v1.0 e do UX v0.1.*