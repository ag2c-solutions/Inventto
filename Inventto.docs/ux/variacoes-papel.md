# Inventto — Variações por Papel v0.1

*Companheiro da Especificação de Produto v1.0, do UX v0.1, do Mapa de Telas v0.1, da Matriz de Estados v0.1 e da Biblioteca de Microcopy v0.1.*

## Como usar este documento

É o último artefato antes do protótipo navegável. Consolida, tela a tela, **o que muda entre Owner, Manager e Sales** — a camada que atravessa todas as outras: o Mapa diz *quais* telas existem, a Matriz *em que estados* vivem, a Microcopy *o que* falam; aqui está *quem vê o quê*.

Não inventa regra: consolida a matriz de RBAC (Especificação, 3.1), as notas por papel do Mapa de Telas e as regras de papel espalhadas pela especificação (RN057, RN082, RN088, RN091, entre outras). A vitrine pública (Superfície 3) não entra — é externa e sem papel.

**Convenção.** O **Owner é a linha de base** (vê e faz tudo); Manager e Sales são descritos pela *diferença*. Na coluna de cada papel: **✓** = acesso pleno · **leitura** = somente visualização · **—** = não acessa · texto curto = acesso parcial (o que muda).

---

## Modelo mental

Três papéis cumulativos e encaixados — Sales ⊂ Manager ⊂ Owner (RN031, permissões cumulativas):

- **Owner** — é o tenant. Faz tudo: gere a equipe, a identidade e o ciclo de vida da organização, o financeiro consolidado, e toda a operação. Papel fixo e exclusivo (RN031, RN037).
- **Manager** — opera a loja por inteiro: produtos, estoque, catálogos, storefronts, todos os pedidos e vendas, e os custos operacionais. **Não toca** em: equipe, configuração/identidade da organização, criação ou desativação de organização. Vê o faturamento do período, mas não o financeiro consolidado sensível (margem, valor de inventário a custo), que fica com o Owner.
- **Sales** — operador de ponta. Vende no balcão, atende pedidos (pool + os que assumiu) e *consulta* (leitura) produtos e catálogos para vender. Não gerencia nada, não vê custos, e vê apenas as próprias vendas.

---

## Padrões transversais

Valem em todas as telas; as tabelas seguintes só registram exceções e recortes.

- **Recurso fora do papel = rota suprimida.** Não existe tela de "acesso negado". O item some da navegação (RF015) e a rota responde como inexistente — redirect silencioso, a mesma postura da Matriz de Estados e de RN002. O usuário não distingue "não existe" de "não tenho acesso".
- **Navegação adapta, não desabilita.** O shell monta o menu do papel: o que é inacessível não aparece, em vez de aparecer esmaecido.
- **Custo é de gestor.** Custo unitário, custo médio e valor a custo aparecem apenas para Manager e Owner (RN057). Nas telas que o Sales também vê, as colunas e campos de custo **somem** — não ficam zerados nem bloqueados.
- **Preço de venda ≠ custo.** O Sales vê preços de venda (precisa deles para operar) — nunca custos.

---

## Variações por tela

### Acesso & Shell

Telas de acesso são pré-autenticação, sem papel — idênticas para todos (o cadastro nasce Owner). O shell é que adapta.

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Cadastro / Login / Verificação / Recuperar e redefinir senha | igual | igual | igual |
| Primeiro acesso (troca de senha) | só se "convidado" | só se "convidado" | n/a (Owner nasce do cadastro) |
| Shell + navegação | menu reduzido ao papel | menu operacional | menu completo |
| Seletor de organização | ✓ (se multi-org) | ✓ (se multi-org) | ✓ |
| Notificações in-app | ✓ | ✓ | ✓ |
| E-mail de pedido perto de expirar | — | ✓ | ✓ |
| Conta e perfil | ✓ | ✓ | ✓ |

*O e-mail de resgate de pedido do pool é dirigido a Owner e Managers (RN089); o Sales acompanha pelo painel em tempo real.*

### Organização

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Configuração da organização | — | — | ✓ |
| — modal: criar organização | — | — | ✓ |
| — modal: desativar organização | — | — | ✓ |
| — modal: excluir organização | — | — | ✓ |

### Equipe & Permissões

Gestão de equipe é **exclusiva do Owner** (matriz 3.1; atores do Módulo 3: "Manager e Sales não gerenciam equipe").

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Lista de membros | — | — | ✓ |
| Adicionar / replicar membro | — | — | ✓ |
| Gestão do membro (papel / estado) | — | — | ✓ |

### Produtos

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Lista / busca de produtos | leitura (sem custo) | ✓ | ✓ |
| Cadastro de produto | — | ✓ | ✓ |
| Edição de produto | — | ✓ | ✓ |
| Inativar produto | — | ✓ | ✓ |
| Categorias | — | ✓ | ✓ |
| Importar produtos entre unidades | — | ✓ | ✓ |

### Movimentações de estoque

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Histórico de movimentações | leitura, **sem colunas de custo** (RN057) | ✓ com custo | ✓ com custo |
| Registrar movimentação manual | — | ✓ | ✓ |

*O Sales não força saída manual; seu impacto no estoque é só indireto, pela venda confirmada (RN056).*

### Catálogos

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Lista de catálogos | leitura | ✓ | ✓ |
| Criar / editar catálogo | — | ✓ | ✓ |
| Curadoria de itens | — | ✓ | ✓ |

### Vendas no balcão (PDV)

O PDV é o território do Sales — todos os papéis vendem.

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Nova venda no balcão | ✓ | ✓ | ✓ |
| Consulta de vendas | **as próprias** (RF027) | todas | todas |

### Storefront (configuração)

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Lista de storefronts | — | ✓ | ✓ |
| Configurar storefront | — | ✓ | ✓ |

### Pedidos online (painel)

| Tela | Sales | Manager | Owner |
|---|---|---|---|
| Painel de pedidos | **pool + os que assumiu** (RN082) | todos | todos |
| Atendimento do pedido | assume, confirma e cancela os do pool e os próprios (RN088) | qualquer pedido | qualquer pedido |

### Dashboard

Uma tela, três blocos, adaptada por papel (RN091).

| Bloco | Sales | Manager | Owner |
|---|---|---|---|
| **Atenção imediata** | pedidos do pool/próprios perto de expirar | pedidos pendentes · estoque crítico/zerado · perto de expirar | igual ao Manager |
| **Resumo de vendas** | as próprias vendas do dia (indicador menor), sem total da loja | faturamento + nº de vendas (gráfico 7/30/90 d) | faturamento + nº de vendas (gráfico 7/30/90 d) |
| **Atividade e atalhos** | próprias últimas vendas · atalho *Nova venda* | movimentações recentes · atalhos *Registrar movimentação*, *Cadastrar produto*, *Nova venda* | igual ao Manager |

*O faturamento do período é de Manager e Owner; ao Owner ficam reservados apenas margem e valor de inventário a custo (RN091). Para o Sales, a atenção imediata cobre só pedidos acionáveis por ele — alertas de estoque, que ele não repõe, ficam fora.*

---

## Decisões fechadas nesta revisão

Os três pontos que estavam abertos foram resolvidos e propagados:

1. **Faturamento para o Manager.** O resumo de vendas (faturamento + nº de vendas) é visível a Manager e Owner; ao Owner ficam reservados apenas margem e valor de inventário a custo. RN091 e a matriz de RBAC foram ajustadas.
2. **Sales sem alertas de estoque.** No Dashboard do Sales, a atenção imediata mostra só os pedidos acionáveis por ele (perto de expirar); alertas de estoque, que ele não repõe, ficam de fora (RN091).
3. **Equipe é do Owner.** A gestão de equipe é exclusiva do Owner; o Mapa de Telas foi alinhado a essa leitura.

---

## Próximo passo

Fechados esses três pontos, este conjunto de cinco artefatos (Espec. + Mapa + Matriz + Microcopy + Variações por papel) sustenta o **protótipo navegável** — onde as telas, estados, textos e recortes por papel ganham forma visual e interativa.

---

*Fim do documento. Variações por Papel v0.1 — companheiro da Especificação de Produto v1.0 e do UX v0.1.*