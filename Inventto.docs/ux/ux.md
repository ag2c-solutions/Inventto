# Inventto — Documento de UX v0.1

**Status:** Draft
**Documento companheiro de:** Inventto — Documento de Produto v1.0
**Versão do documento:** 0.1
**Data:** [a definir]
**Autor:** [a definir]

## Como usar este documento

Este documento descreve a **camada de experiência** do Inventto: como o usuário navega, interage, recebe retorno e percorre cada jornada. Ele é o complemento do Documento de Produto, que define *o que* o sistema faz e *por quê*; aqui o foco é *como* o usuário vivencia esse comportamento na interface.

A divisão de responsabilidades é:

- **Documento de Produto** — visão, escopo, regras de negócio (RNs), requisitos funcionais (RFs) e decisões estruturantes. É a fonte de verdade sobre comportamento e regras.
- **Documento de UX (este)** — modelo de navegação, padrões de interação, fluxos de tela, estados, feedback e adaptação por papel. Não redefine regra de negócio; quando uma decisão de UX depende de uma regra, referencia o RF/RN correspondente.
- **Notas de implementação** — detalhes técnicos (stack, RLS, RPCs, providers), mantidos fora destes dois documentos.

As referências entre parênteses (ex.: *ref. RF016*, *ref. RN032*) apontam para o Documento de Produto, para manter os dois textos linkáveis.

Este documento ainda é um ponto de partida para a fase de UX/UI: ele consolida as decisões de experiência já implícitas na especificação e lista, ao final, o que está deliberadamente em aberto para protótipo.

---

# Parte I — Princípios e fundamentos de UX

## 1. Princípios transversais

Diretrizes de experiência para todo o produto. A maioria rege o app interno (Stores), onde a equipe opera; quando uma também vale para a vitrine pública — ou é específica dela —, isso vem indicado, pois a audiência externa tem necessidades próprias.

**Mobile-first e responsivo.** A operação acontece parcialmente no chão da loja, e a vitrine pública é acessada majoritariamente por celular. Toda tela do app deve ser funcional e usável em telas pequenas, não apenas adaptada — o mobile é o caso base do design, não a exceção (ref. RNF001).

**Adaptação por papel (UI guards).** A interface mostra a cada usuário apenas o que seu papel permite. Elementos não autorizados são ocultados ou desabilitados proativamente, em três níveis: navegação (itens de menu), ações (botões e atalhos) e acesso a rotas. Um Sales, por exemplo, não vê "Novo Produto", o menu de Equipe nem as Configurações da organização. Essa proteção é de experiência (uma interface limpa e sem becos sem saída), complementar à segurança do backend (ref. RF015, RN091).

**Feedback e estados de tela.** Toda tela que carrega dados ou executa ação precisa comunicar seu estado: carregando, vazio (sem dados ainda), sucesso e erro. Ações que dependem de rede devem dar retorno de progresso e tolerar conexões instáveis — especialmente uploads no mobile (ref. RNF003).

**Mensagens neutras nos fluxos sensíveis.** Em autenticação e recuperação de conta, as mensagens nunca revelam se um e-mail está cadastrado. O retorno é genérico ("credenciais inválidas"; "se este e-mail estiver cadastrado, um link foi enviado"). É uma escolha de segurança que molda a microcopy desses fluxos (ref. RN002, RN019, RN007).

**Confirmação proporcional ao risco.** Ações reversíveis acontecem direto. Ações que afetam terceiros ou são difíceis de desfazer pedem confirmação que descreve as consequências. Ações irreversíveis usam confirmação reforçada — digitação de um valor para liberar o botão (ref. RF010, RF011, RN029).

**Microcopy orientativa.** Quando o sistema bloqueia uma ação, a mensagem diz o que falta para destravá-la, não apenas que falhou. Ex.: tentar publicar uma vitrine sem WhatsApp ou horário configurado mostra exatamente o que precisa ser preenchido antes (ref. RN075).

**Eficiência: o menor número de interações.** Cada tarefa deve ser concluída no menor número de passos possível — menos cliques, menos campos, menos telas no caminho. Vale para o caminho rotineiro e reversível; o atrito deliberado fica reservado às ações perigosas ou irreversíveis (ver "Confirmação proporcional ao risco"). A venda no balcão é o caso extremo: tem de ser rápida e não travar o atendimento (ref. RF026, RN068).

**Clareza visual e baixa densidade.** Visual limpo e moderno: cada tela mostra o essencial e evita competir por atenção. Excesso de informação não é completude — atrapalha a decisão. Prioriza-se o que é acionável e relega-se o resto a um segundo nível (detalhe, expandir, outra tela). O Dashboard é o teste: poucos indicadores acionáveis em vez de despejar tudo (ref. RF036).

**Informação no ponto da decisão.** Em vez de "mostrar tudo" ou "esconder tudo", mostra-se exatamente o que se precisa para agir, ali onde a ação acontece: status de estoque ao lado do produto na venda, saldo no momento da baixa, preço de referência junto do campo de desconto. É o que concilia eficiência e baixa densidade — e, com a adaptação por papel, o Sales sequer vê custo (ref. RN057, RN069).

**Defaults inteligentes.** Não pedir o que o sistema já sabe ou pode presumir: a organização ativa já no contexto, o catálogo do canal já selecionado, a data de hoje na movimentação, os motivos mais comuns no topo da lista, o CEP autopreenchendo o endereço. Cada default é um campo ou um clique a menos (ref. RN010, RN084).

**Impedir o inválido antes de tratar o erro.** Evitar o erro vale mais que explicá-lo: desabilitar a ação que violaria uma regra, validar formato em tempo real (o slug já faz — RN072) e não deixar registrar uma saída que romperia o saldo não-negativo (RN055) já na interface, antes de o backend recusar (ref. RN055, RN072).

**Desfazer no lugar de confirmar.** Para ações reversíveis com efeito visível, executar na hora e oferecer "desfazer" — em vez de interpor mais um modal. Reforça a eficiência sem abrir mão da rede de segurança. Complementa a "Confirmação proporcional ao risco", que segue valendo para o que é irreversível.

**Estados vazios que conduzem.** O vazio não diz só "nada aqui": ensina o próximo passo com um CTA claro ("Cadastrar primeiro produto", "Publicar sua vitrine"). Como toda organização nasce do zero — estoque inicial zerado (RN039), nenhuma vitrine publicada (RN075) —, o estado vazio é momento de ativação, não um beco (ref. RN039, RN075).

**Clareza e confiança na vitrine (superfície externa).** Princípio próprio da vitrine pública, de audiência distinta do app interno: um visitante desconhecido, no celular, sem login, que decide em segundos. Disponibilidade e preço (ou contato) óbvios, chamadas inequívocas (Pedir / WhatsApp), zero jargão interno e carregamento leve em aparelho modesto. O "limpo e eficiente" precisa servir também a quem compra, não só a quem opera (ref. RF029, RF030, RN079).

## 2. Modelo de navegação

**Sidebar e contexto da organização.** A navegação principal vive numa sidebar. No topo dela, um combobox de organização exibe o nome da organização ativa e o papel do usuário nela. Ao abrir, mostra: campo de busca, a lista das organizações do usuário (com indicador da ativa) e, apenas para o Owner, a opção "Criar Organização".

**Troca de contexto sem recarregar.** Ao escolher outra organização no combobox, o conteúdo do app passa a refletir a nova organização sem recarregar a página — a transição é instantânea e mantém o usuário no fluxo. A última organização ativa é lembrada no dispositivo e restaurada no próximo login (ref. RF008, RN010).

**Tela inicial pós-login.** Após o login, o usuário cai no Dashboard — a visão operacional de entrada no sistema (ver jornada 9).

**Redirecionamento contextual.** Se o usuário tentou acessar uma rota protegida sem estar logado, após autenticar ele é levado de volta àquela rota, não a uma tela genérica (ref. RF002, RN011).

**Seletor de aplicações (visão futura).** A navegação evolui para um seletor de apps no topo (Admin, Stores, Marketing, Revendedores). A v1 é o app Stores; o seletor é um espaço a reservar no layout, ainda que com um único app ativo.

## 3. Padrões de componentes e interação

Padrões recorrentes que aparecem em vários módulos. Documentá-los uma vez evita reinventar a interação a cada tela.

**Fluxo multi-step (wizard).** Usado em tarefas longas que se beneficiam de divisão em etapas com um resumo final de confirmação. Caso principal: cadastro/edição de produto (básico → imagens → atributos e grade → resumo) (ref. RF016).

**Tabs de configuração.** Agrupam conjuntos de configuração de um mesmo objeto. Caso principal: Configurações da organização (Loja, Operacional, Horários, Danger Zone) (ref. RF007).

**Modais de confirmação.** Dois níveis:
- *Confirmação descritiva* — para ações de impacto reversível ou amplo; o modal lista as consequências antes de confirmar (ex.: desativar organização).
- *Confirmação destrutiva por digitação* — para ações irreversíveis; além de descrever consequências, exige que o usuário digite um valor exato (o nome fantasia) para liberar o botão, protegendo contra cliques acidentais (ref. RN029).

**Formulário de endereço com autopreenchimento por CEP.** Ao informar um CEP válido, logradouro, bairro, cidade e estado são preenchidos automaticamente, restando número e complemento. CEP inválido nunca bloqueia o preenchimento manual. Padrão usado em Configurações da organização e no checkout (ref. RN024, RN084).

**Upload de imagem.** Aceita upload direto com feedback de progresso, tratamento de erro e tolerância a conexão instável. O envio acontece em segundo plano, sem travar o restante do formulário. Usado em logo da organização, imagens de produto e capa da vitrine (ref. RNF003, RN023).

**Validação em tempo real.** Campos com regra de unicidade ou formato validam enquanto o usuário digita. Caso principal: slug do storefront, cuja disponibilidade e formato são checados em tempo real (ref. RN072).

**Controles de estado e seleção.** Toggles para regras liga/desliga (ex.: "Aceitar pedidos com a loja fechada", status de cada dia na grade de horários); button group para escolha única visível (ex.: área de atuação no signup); medidor visual de força de senha, informativo, que orienta sem bloquear o envio (ref. RN001).

**Notificações.** Dois canais com propósitos distintos:
- *In-app, em tempo real* — para o fluxo do dia a dia, com indicador de contagem (ex.: pedidos novos no painel). Não dispara e-mail, para não saturar a equipe.
- *E-mail* — reservado ao que exige resgate ou está fora do app (ex.: pedido prestes a expirar sem resposta; verificação de conta; recuperação de senha) (ref. RF035, RN089).

**Toasts.** Retorno efêmero para eventos do sistema (ex.: sessão expirada redirecionando ao login) (ref. RN004).

**Listas filtráveis e paginadas.** Padrão das telas de consulta: paginação, filtros e busca. A visibilidade de colunas/campos pode variar por papel (ex.: histórico de movimentações esconde custos do Sales) (ref. RF017, RF023, RN057).

**Badges de estado.** Indicadores visuais curtos de status, usados na vitrine (Disponível / Últimas Peças / Esgotado; Aberto agora / Fechado) e em listas de pedidos (pendente, confirmado, cancelado, expirado) (ref. RF030).

---

# Parte II — UX por jornada

Para cada módulo, apenas a camada de experiência: telas, fluxos, estados, interações e adaptação por papel. As regras de negócio completas estão no Documento de Produto.

## 1. Autenticação e primeiro acesso

**Cadastro.** A partir da tela de login, o usuário acessa o cadastro e preenche, em fluxo único: dados pessoais (nome, e-mail), nome fantasia da organização, seleção da área de atuação (button group, com opção "Outro"), senha (com medidor de força) e aceite de Termos e Política de Privacidade (checkbox sem pré-marcação, com links acessíveis). Ao submeter, o usuário é levado a uma tela que orienta a verificar o e-mail antes do primeiro login. O cadastro não pede slug — a identidade pública é definida depois, ao criar um storefront (ref. RF001, RN006).

**Verificação de e-mail.** O reenvio do link de verificação fica disponível em dois pontos: na tela pós-cadastro e na tela de login, quando uma tentativa detecta conta ainda não verificada (ref. RF003).

**Login.** Com múltiplas organizações, o sistema entra automaticamente na última utilizada (ou na primeira da lista, se não houver registro). Mensagens de falha são neutras. Conta não verificada é bloqueada com orientação para verificar. Sessão expirada após 24h de inatividade redireciona ao login com um toast informativo (ref. RF002, RN004).

**Recuperação de senha.** O usuário informa o e-mail e recebe sempre a mesma resposta neutra, independentemente de o e-mail existir. Quem tem conota válida segue por link para definir nova senha e volta ao login (ref. RF004).

**Primeiro acesso de membro convidado.** No primeiro login com a senha provisória, o sistema reconhece o estado de primeiro acesso e exige a definição de uma nova senha pessoal antes de liberar qualquer área protegida (ref. RF005, RN015).

**Estados e microcopy a cuidar:** sucesso/erro de login; conta não verificada (com CTA de reenvio); link expirado; sessão expirada (toast); medidor de força; bloqueio de primeiro acesso.

## 2. Configuração e troca de organização

**Criação rápida de organização.** Acionada pela opção "Criar Organização" no combobox da sidebar (visível só ao Owner). Abre um diálogo enxuto que pede apenas o nome fantasia. Ao confirmar, o contexto já troca para a nova organização e o usuário cai na tela de Configurações. Quando o Owner já tem outra organização, o diálogo oferece, de forma opcional, replicar configurações de uma organização existente (ref. RF006).

**Replicação de configurações.** Dentro do diálogo de criação, uma seção opcional permite escolher a organização de origem (com caixa de pesquisa) e marcar os grupos a copiar (categorias e atributos, configurações operacionais, configurações visuais da vitrine). Fica claro na interface que produtos, estoque, pedidos e membros não são copiados (ref. RF009).

**Tela de Configurações (tabs).** Quatro abas:
- *Loja* — identidade (nome fantasia, logo via upload direto) e identidade fiscal em somente leitura (documento, razão social), mais o endereço estruturado com autopreenchimento por CEP.
- *Operacional* — timezone e o toggle "Aceitar pedidos com a loja fechada".
- *Horários* — grade por dia da semana, com toggle de status e faixa única de abertura–fechamento.
- *Danger Zone* — desativação e exclusão.

As alterações ficam pendentes até "Salvar Alterações"; "Descartar" reverte. Campos somente leitura precisam ser visualmente distintos dos editáveis (ref. RF007, RN018).

**Desativação.** Abre confirmação descritiva: explica que os storefronts saem do ar, que Manager e Sales perdem acesso (o Owner mantém), e que pedidos pendentes são cancelados com liberação de estoque. Reativável a qualquer momento (ref. RF010).

**Exclusão.** Modal destrutivo com: aviso de consequências; uma checkbox opcional, em seção destacada, para também apagar todos os dados (irreversível); e um campo onde o Owner digita o nome fantasia exato para liberar o botão. A interface deixa explícita a diferença entre excluir (preservando dados) e excluir apagando tudo (ref. RF011, RN029).

## 3. Produtos

**Cadastro (multi-step).** Etapas: informações básicas → imagens → definição de atributos e geração da grade de variantes (quando aplicável) → resumo para confirmação. Cada variante gerada tem imagens próprias. O estoque não é digitado no cadastro — entra depois por movimentação; o campo de estoque inicial editável deve sair da tela (ref. RF016, RN042).

**Entrada de atributos por tipo.** O input se adapta ao tipo do atributo: cor abre seletor de cor; seleção apresenta lista de opções; texto e número usam entrada simples. Sugestões partem de um dicionário comum para acelerar o preenchimento (ref. RN045, RN044).

**Listagem e busca.** Lista paginada e filtrável, com imagem de destaque por produto e busca flexível por nome ou SKU. Para produtos com variação, a lista mostra a soma do estoque das variantes (ref. RF017).

**Edição.** Reaproveita o fluxo do cadastro. SKU de variante que já tem movimentações fica não editável, e a interface deve comunicar o porquê (ref. RF018).

**Categorias inline.** Podem ser criadas durante o cadastro do produto, sem sair do fluxo, e renomeadas. Não há exclusão na v1 (ref. RF020, RN047).

**Adaptação por papel.** Sales visualiza produtos e detalhes, mas não vê ações de criar/editar/inativar nem gestão de categorias (ref. matriz RBAC).

## 4. Movimentações de estoque

**Registro de movimentação.** Formulário de entrada ou saída onde o usuário informa itens, quantidades e o motivo (obrigatório); em entradas, também o custo unitário. Documento de referência é opcional. A lista de motivos disponíveis por tipo é um ponto a definir na fase de UX (ver Parte III) (ref. RF022, RN054).

**Histórico.** Lista cronológica e filtrável por produto, tipo, motivo, período e responsável. Cada registro responde: o que mudou, quanto, por quê, quando e por quem (ref. RF023).

**Visibilidade por papel.** Manager e Owner veem custos e valores; o Sales vê o histórico de quantidades e motivos, sem nenhuma informação de custo. A mesma tela renderiza conjuntos de campos diferentes conforme o papel (ref. RN057).

## 5. Catálogos

**Gestão de catálogos.** O catálogo é uma seleção de produtos com preços, independente de canal — não tem mais "tipo" (interno/público). Ao criar, o usuário informa apenas um nome e monta a curadoria de itens; é cada canal de venda (o PDV ou um storefront) que, na própria configuração, escolhe qual catálogo usar, e um mesmo catálogo pode servir a vários canais. A remoção é bloqueada, com aviso orientativo, enquanto houver canais vinculados — a interface indica que é preciso desvincular antes (ref. RF024, RN059, RN060, RN061).

**Curadoria de itens.** Dentro do catálogo, o usuário adiciona produtos/variantes e define o preço de cada um naquele catálogo, podendo informar um preço original além do atual para sinalizar promoção "de/por". O destaque visual e o que aparece na vitrine não se definem aqui — pertencem ao storefront (ref. RF025, RN063).

## 6. Vendas no balcão (PDV)

**Registro de venda.** O vendedor monta a venda selecionando produtos/variantes do catálogo vinculado ao PDV e suas quantidades. O preço vem desse catálogo, e o vendedor pode aplicar desconto sobre ele. Identificação do cliente (nome e telefone) é sempre opcional — a venda pode ser anônima e não deve ter fricção. O fluxo é pensado para ser ágil, sem travar o atendimento presencial (ref. RF026, RN065, RN069).

**Desconto visível.** Quando há desconto, a interface mostra preço de referência, desconto aplicado e preço final — todos registrados para auditoria (ref. RN069).

**Consulta de vendas.** Lista das vendas presenciais com data, vendedor, itens, valor de referência, desconto e valor final. O Sales vê as próprias vendas; Manager e Owner veem todas (ref. RF027).

## 7. Storefront (vitrine pública)

Esta é a face do produto para o cliente final — público externo, sem login, majoritariamente no celular. A experiência precisa ser limpa e direta. O storefront é também onde o lojista configura a vitrine: qual catálogo ela apresenta, identidade visual, contato e regras de exibição.

**Criação e configuração do storefront.** Manager ou Owner cria um storefront e define:
- *Catálogo* — qual catálogo a vitrine apresenta (os produtos e preços vêm dele).
- *Slug* — o endereço da URL pública (`inventto.app/{slug}`).
- *Identidade visual* — cores (primária, fundo, secundária, texto), logo e imagem de capa, layout em grade ou lista, estilo de card.
- *Comportamento* — mostrar/ocultar preços; mostrar/ocultar produtos esgotados; marcação de itens em destaque; mensagem pré-preenchida do WhatsApp.
- *Contato e redes* — número de WhatsApp e links para Instagram, Facebook e site.

Uma organização pode ter vários storefronts, apontando para o mesmo catálogo ou para catálogos diferentes. Essas escolhas determinam diretamente como a vitrine renderiza (ref. RF028, RN070, RN076, RN077).

**Slug em tempo real.** O campo de slug valida formato e disponibilidade enquanto o usuário digita, com retorno imediato de "disponível/indisponível" (ref. RN072).

**Bloqueio orientativo de publicação.** Tentar publicar um storefront sem catálogo vinculado, sem WhatsApp, ou sem timezone/horário da organização é bloqueado com mensagem indicando exatamente o que falta preencher (ref. RN075).

**Navegação da vitrine.** O cliente acessa pela URL pública e vê os produtos renderizados conforme o tema configurado (grade ou lista, cores e branding da loja, destaques com proeminência). Pode abrir o detalhe de um produto (imagens, descrição, variantes) e escolher a variante. Em promoção, o preço original aparece riscado ao lado do atual. Preços aparecem ou não conforme a configuração do storefront. O cliente monta uma seleção de itens (carrinho) para pedir de uma vez (ref. RF029, RN076).

**Indicadores de disponibilidade.** Cada produto exibe um badge derivado do estoque: Disponível, Últimas Peças (perto do limiar mínimo) ou Esgotado. Produtos esgotados aparecem com o indicador ou são ocultados, conforme a configuração (ref. RF030).

**Status de funcionamento.** A vitrine mostra Aberto agora ou Fechado, calculado a partir do horário e timezone da loja no momento do acesso (ref. RF030, RN078).

**Dois caminhos de saída.** A vitrine oferece dois botões independentes:
- *Realizar Pedido* — leva ao checkout (ver jornada 8). Pode ficar indisponível com a loja fechada, conforme a configuração de aceitar pedidos fora do horário.
- *Chamar no WhatsApp* — abre conversa direta com mensagem pré-preenchida, sem criar pedido. Permanece sempre disponível, pois conversar não depende de horário.

Quando "Realizar Pedido" está indisponível (loja fechada e sem aceitar pedidos), o caminho do WhatsApp continua como alternativa visível (ref. RF031, RN079, RN078).

**Loja indisponível.** Se o slug aponta para um storefront inativo/removido ou para uma organização desativada/excluída, a URL mostra uma página informativa de loja indisponível, em vez da vitrine (ref. RN074).

## 8. Pedidos online (checkout e painel)

**Checkout (cliente final).** Ao acionar "Realizar Pedido", o cliente preenche um formulário com nome, telefone, endereço estruturado (com autopreenchimento por CEP) e forma de pagamento pretendida (cartão, dinheiro ou pix). Todos os quatro campos são obrigatórios para finalizar o pedido; se a busca por CEP falhar, o preenchimento manual do endereço continua liberado. A forma de pagamento é só a intenção do cliente — não há cobrança online, e a interface não deve sugerir que um pagamento está sendo processado (ref. RF032, RN081, RN083, RN084).

**Painel de pedidos (equipe).** Lista os pedidos conforme a visibilidade do papel: o Sales vê o pool (pedidos sem dono) e os que assumiu; Manager e Owner veem todos. As ações principais são assumir um pedido do pool, contatar o cliente via WhatsApp (mensagem pré-preenchida, a partir do painel), confirmar (concretiza a venda) ou cancelar. Assumir um pedido encerra a contagem de expiração — a partir daí ele só sai por confirmação ou cancelamento. Os estados do pedido — pendente, confirmado, cancelado, expirado — são comunicados por badge (ref. RF034, RN082, RN085).

**Notificações de pedido.** Pedidos novos aparecem no painel em tempo real, com indicador de contagem, sem disparar e-mail. O e-mail é reservado à urgência: um pedido do pool que se aproxima do prazo sem ter sido assumido gera alerta por e-mail para Owner e Managers, para que alguém o assuma antes que expire. Pedidos já assumidos não expiram por tempo e não geram esse alerta. Não há notificação automática ao cliente final na v1 (ref. RF035, RN089).

## 9. Dashboard

Visão operacional de entrada no sistema e tela inicial pós-login. É o módulo mais dependente da fase de UX/UI: os requisitos definem o conteúdo, mas o arranjo visual será desenhado em protótipo (ver Parte III).

**Atenção imediata.** No topo, indicadores acionáveis: quantidade de pedidos pendentes (atalho para o painel de pedidos) e quantidade de produtos com estoque baixo/esgotado (atalho para a lista filtrada). Cada indicador leva, em um clique, à tela onde se age (ref. RF036).

**Resumo de vendas.** Resumo por período selecionável (hoje, semana, mês), somando balcão e pedidos online confirmados. O Owner vê valores financeiros; o Sales vê as próprias vendas; o Manager vê o desempenho operacional conforme sua permissão (ref. RF037, RN091).

**Atividade recente e atalhos.** Mini-listas de últimas movimentações e últimos pedidos com status, e atalhos para ações frequentes (nova venda no balcão, novo produto, nova entrada de estoque), respeitando as permissões do papel (ref. RF038).

**Adaptação por papel.** Informações financeiras sensíveis (faturamento, valor de inventário a custo, margem) são exclusivas do Owner. Sales e Manager veem os blocos operacionais; o Sales vê suas próprias vendas no lugar do total da loja (ref. RN091).

---

# Parte III — Decisões fechadas e próximos artefatos

Quatro decisões de experiência que estavam deliberadamente em aberto na v0.1 foram resolvidas em revisão posterior. Cada uma aponta para onde a regra acabou pousando na especificação. Ao final, o estado dos artefatos da fase de UX.

## Decisões fechadas

**Lista de motivos de movimentação.** Definida e fixa por tipo: entradas — Compra, Devolução de cliente, Ajuste de inventário (+) e Outro; saídas — Perda/Avaria, Devolução a fornecedor, Uso interno, Ajuste de inventário (−) e Outro. A escolha de "Outro" exige texto descritivo obrigatório. "Venda" é gerada automaticamente pelo PDV e pela confirmação de pedidos online, e não aparece na lista de seleção manual (ref. RN053).

**Status de estoque e limiar de "Últimas Peças".** Definidos a partir do campo `estoque mínimo` (informado por produto/variante no cadastro) e do saldo atual, em quatro status internos — zerado, crítico, atenção, saudável — com a faixa de buffer em saldo > mínimo e saldo ≤ mínimo × 1,25. Na vitrine, os quatro internos colapsam em três visíveis ao cliente: zerado → Esgotado; crítico → Últimas peças; atenção e saudável → Disponível. "Últimas peças" sinaliza escassez real, não a zona de buffer operacional do lojista — distinção que preserva a credibilidade do indicador (ref. RN050, RF030).

**Arranjo do Dashboard.** Três blocos verticais. No topo, *Atenção imediata*: pedidos pendentes, produtos zerados ou em status crítico e pedidos do pool perto de expirar ainda não assumidos — cada um com acesso direto à listagem correspondente. No meio, *Resumo de vendas*: gráfico interativo com seletor de período (7/30/90 dias, padrão 30), faturamento como métrica principal e número de vendas como secundária — visível para Owner e Manager. Na base, *Atividade recente e atalhos*: para Owner e Manager, últimas movimentações de estoque e atalhos para registrar movimentação, cadastrar produto e nova venda no balcão; para Sales, próprias últimas vendas e atalho para nova venda. No mobile, os blocos empilham na ordem; em telas maiores, os dois primeiros podem ocupar duas colunas (ref. RF036, RF037, RF038, RN091).

**Layouts e estilo de card da vitrine.** A v1 entrega um **único layout curado** — grade responsiva, card flat com foco na imagem, preço em destaque ou substituído por "Consultar" quando oculto, badge de destaque para itens marcados. A oferta de múltiplos layouts ou estilos é deliberadamente deixada de fora da v1, registrada como tal nos Limites do Módulo 8. A definição visual fina entra no protótipo (ref. RF028).

## Inventários produzidos na fase de UX

**Mapa de Telas v0.1.** Inventário das 34 telas e itens não-tela, organizado por superfície (Acesso & Shell, App interno por módulo, Vitrine pública), com rota, papéis e referências às regras. Em `mapa-telas-v1.md`.

**Matriz de Estados por Tela v0.1.** Padrões globais de estado (carregando, sucesso, erro, sem permissão, sessão expirada) mais estados específicos por tela — com foco em vazios que conduzem, erros próprios e modos. Em `matriz-estados-v1.md`.

**Biblioteca de Microcopy v0.1.** Mensagens neutras, bloqueios orientativos, confirmações, vazios, toasts, validação inline e rótulos de estado, com voz e tom. Em `microcopy-v1.md`.

**Variações por papel.** Próximo artefato — consolidar tela a tela o que muda entre Owner, Manager e Sales, para que o protótipo cubra os três pontos de vista de forma sistemática. Em seguida vem o protótipo navegável.

---

*Fim do documento. UX v0.1 — companheiro da Especificação de Produto v1.0.*