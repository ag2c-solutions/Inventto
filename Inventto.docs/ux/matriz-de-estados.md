# Inventto — Matriz de Estados por Tela v0.1

*Companheiro do Mapa de Telas v0.1, da Especificação de Produto v1.0 e do UX v0.1.*

## Como usar este documento

Para cada tela do Mapa de Telas, este documento especifica os estados que costumam ser esquecidos no desenho — sobretudo **vazio** e **erro** — além dos **estados específicos** de cada tela (modos, transições, conflitos). É a aplicação direta de dois princípios do UX: *"Feedback e estados de tela"* (toda tela comunica seu estado) e *"Estados vazios que conduzem"* (o vazio ensina o próximo passo, não só informa a ausência).

Para não repetir o óbvio em 34 telas, os comportamentos comuns ficam definidos uma vez em **Padrões globais** — toda tela os herda. A **matriz por tela** documenta só o que varia: o CTA do estado vazio, os erros próprios daquela tela (além dos globais) e os estados específicos. O estado de **sucesso** (tela carregada e funcionando) é o que o Mapa e as jornadas já descrevem, e não é repetido aqui.

Estrutura igual à do Mapa: por superfície e, no app interno, por módulo. Referências (`RNxxx`) apontam para o Documento de Produto. (As decisões da Parte III foram fechadas — o documento não traz mais marcações de ⚑.)

---

## Padrões globais de estado

Toda tela herda estes comportamentos, salvo quando a matriz indicar exceção.

- **Carregando.** *Skeleton* que espelha o layout final (não um spinner genérico em tela cheia); ações ficam desabilitadas até os dados chegarem. Em listas, algumas linhas de *skeleton* (ref. RNF003).
- **Sucesso / com dados.** O estado normal, descrito no Mapa e nas jornadas; só aparece na matriz quando há variação relevante.
- **Erro ao carregar (rede).** Mensagem curta e um botão "Tentar de novo"; preserva o que já estava em tela quando possível.
- **Enviando / salvando.** Em formulários e ações: botão em progresso, desabilitado e idempotente ao duplo clique. Sucesso e falha encerram com *toast*; na falha, os erros de campo também aparecem *inline* e o que foi preenchido é preservado.
- **Sem permissão.** Não deve ocorrer pela navegação, graças aos *guards* de interface (RF015). No acesso direto a uma rota não autorizada, o usuário é redirecionado silenciosamente ao seu ponto inicial (o Dashboard), sem mensagem de erro: o recurso não é revelado a quem não tem acesso, ficando indistinguível de inexistente — extensão da política de mensagens neutras (RN002) à autorização.
- **Não encontrado (404).** Recurso inexistente ou removido (por id); oferece retorno à listagem correspondente.
- **Sessão expirada.** Qualquer rota autenticada, ao expirar a sessão (RN004), redireciona ao login preservando o destino pretendido.

---

# Superfície 1 — Acesso & Shell

## 1.1. Acesso (Autenticação)

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Cadastro de conta | n/a (formulário) | Senha fraca (RN001); Termos não aceitos (RN006); e-mail já em uso → mensagem neutra (RN007) | Enviando → tela de verificação de e-mail |
| Login | n/a | Credencial inválida (neutra, RN002); conta temporariamente bloqueada (RN005); e-mail não verificado (RN003) | Enviando; "lembrar" / sessão rolling |
| Verificação de e-mail | n/a | Token inválido ou expirado → reenviar | Verificando → redirect contextual |
| Recuperar senha | n/a | — (sempre confirmação neutra, não revela e-mail) | Enviado: confirmação neutra |
| Redefinir senha | n/a | Link expirado ou já usado (RN012, RN013); senha fraca (RN001) | Salvando → login |
| Primeiro acesso | n/a | Senha fraca (RN001) | Bloqueado até trocar a senha (RN015) |

## 1.2. Shell

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Shell + navegação | — | — | Itens ocultos/desabilitados por papel (RF015); sessão expirada → login |
| Seletor / troca de organização | Só uma organização → sem seletor, atalho "Criar organização" | Falha ao trocar de contexto | Troca sem recarregar; lembra a última ativa (RN010, RN011) |
| — central de notificações | "Sem novidades" | — | Alerta de novo pedido em tempo real (RN089); não guarda histórico longo na v1 |
| Conta e perfil | n/a | Falha ao salvar dados pessoais | Salvando; logout |

---

# Superfície 2 — App interno (Stores)

## 2.1. Organização

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Configuração da organização | n/a (sempre tem dados) | CEP não encontrado → preenchimento manual (RN024); identidade fiscal inválida (RN018) | Salvando; alterações pendentes até confirmar (RN025) |
| — modal: criar organização | n/a | Validação de campos | Dialog sem rota; abre do Org Switcher; replicação opcional (RN029) |
| — modal: desativar | — | Falha na ação | Confirmando; descreve consequências (RN027, RN028) |
| — modal: excluir | — | Nome fantasia digitado não confere (RN029) | Botão travado até digitar o nome exato; opção de apagar dados |

## 2.2. Equipe & Permissões

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Lista de membros | Praticamente nunca vazia (há o Owner); CTA "Convidar membro" em destaque | Rede | Estados do membro: ativo / convidado / inativo (RN036) |
| Convidar / adicionar membro | n/a | E-mail já existe no tenant → replicação (RN034, RN035) | Enviando convite |
| — gestão do membro | — | Tentativa de violar invariante do Owner (RN037) | Confirmando alteração de papel/estado |

## 2.3. Produtos

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Lista / busca de produtos | "Cadastrar primeiro produto" (onboarding) | Busca sem resultado ("nada para '…'", ≠ vazio inicial) | Indicador de status de estoque por item (zerado/crítico/atenção/saudável — RN050); custos ocultos para Sales (RN057) |
| Cadastro de produto | n/a | SKU duplicado (RN038); validação por passo | Wizard; salvando; estoque inicial sempre zero (RN039) |
| Edição de produto | n/a | — | SKU travado com explicação quando há histórico (RN044); salvando |
| — modal: inativar produto | — | Falha na ação | Confirma soft delete (RN045); sai das listagens ativas, preserva histórico |
| Categorias | "Crie a primeira categoria" | Remover categoria em uso → retenção da estrutura (RN046) | Edição inline; salvando |
| Importar produtos | Nenhuma organização de origem / nada a importar | Itens já importados são pulados (RN048) | Seleção; importando (progresso); isolamento comercial (RN047) |

## 2.4. Movimentações de estoque

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Histórico de movimentações | "Nenhuma movimentação ainda" | Rede | Imutável (sem editar/excluir — RN051); custo por papel (RN057) |
| Registrar movimentação | n/a | Saída que zera abaixo de zero → ação desabilitada com motivo (RN055); motivo obrigatório (RN053) | Entrada/saída; salvando |

## 2.5. Catálogos

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Lista de catálogos | "Criar primeiro catálogo" | Rede | Leitura para Sales |
| Criar / editar catálogo | n/a | Validação | Salvando; sem campo "tipo" |
| Curadoria de itens | "Nenhum item — adicione produtos" | Item sem preço (RN063) | Busca de produtos; salvando |
| — modal: remoção bloqueada | — | Lista os canais vinculados que impedem (RN061) | Bloqueado até desvincular |

## 2.6. Vendas no balcão (PDV)

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Nova venda no balcão | Catálogo do PDV vazio ou não vinculado → bloqueio orientativo (RN065) | Saldo insuficiente na confirmação (RN055, RN066) | Adicionando itens; desconto aplicado; cliente opcional; confirmando venda |
| Consulta de vendas | "Nenhuma venda no período" | Rede | Sales vê só as próprias |

## 2.7. Storefront (configuração)

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Lista de storefronts | "Criar sua primeira vitrine" | Rede | Estado por storefront: publicado / inativo (RN074) |
| Configurar storefront | n/a | Slug em uso ou inválido → *inline* (RN072); publicação bloqueada → microcopy do que falta (RN075) | Rascunho / publicado / despublicado; salvando |

## 2.8. Pedidos online (painel)

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Painel de pedidos | "Nenhum pedido pendente" (pool vazio) | Rede | Novo pedido chega em tempo real; item expira enquanto visível; "meus" × "pool" (RN082, RN085) |
| Atendimento do pedido | n/a | Pedido já assumido por outro (RN082); pedido expirado/cancelado; 404 | Confirmando → vira saída (RN087) / cancelando → libera reserva (RN086) |

## 2.9. Dashboard

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Dashboard | Primeira vez (tudo zerado): cards conduzem ao onboarding — cadastrar produto, criar catálogo, publicar vitrine | Cada bloco degrada isolado (um card falha sem derrubar a tela) | Adaptado por papel (RN091); tela inicial pós-login (RN092) |

---

# Superfície 3 — Vitrine pública (Loja)

Audiência externa, no celular — mensagens amigáveis, sem jargão interno.

| Tela | Vazio | Erros próprios | Estados específicos |
|---|---|---|---|
| Vitrine (home da loja) | Catálogo sem itens → "Loja sem produtos no momento" | Falha de carregamento (mensagem amigável ao cliente) | Loja aberta / fechada (RN078); preço exibido ou oculto (RN076) |
| Detalhe de produto | n/a | Produto inexistente ou removido → 404 amigável | Disponível / últimas peças / esgotado; esgotado muda o CTA para contato |
| Checkout | n/a | Validação dos 4 campos (RN083, RN084); CEP não encontrado → manual; item indisponível durante o checkout (RN086); loja fechada com pedidos desativados (RN078) | Enviando pedido → confirmação com reserva |
| Loja indisponível | — | — | É um estado, não fluxo: storefront inativo ou organização desativada (RN074) |
| — saída WhatsApp | — | App externo indisponível (raro) | Sempre disponível, mesmo com a loja fechada (RN079); abre conversa, não cria pedido |

---

# Notas e próximos artefatos

**Sobre modais e ações.** Modais herdam os padrões de *enviando / erro* e o estado de confirmação; os destrutivos (excluir organização) só liberam o botão após a digitação exigida (RN029). Ações que abrem apps externos (WhatsApp) não têm estado de carregamento próprio.

**Estados vazios são onboarding.** As listas de produtos, catálogos, storefronts e o Dashboard compartilham um mesmo arco de primeiro uso: cada vazio aponta o próximo passo, encadeando o caminho cadastrar produto → criar catálogo → configurar e publicar vitrine.

**Pendências (⚑).** Resolvidas. As quatro decisões que estavam abertas — lista de motivos de movimentação, status de estoque e limiar de "Últimas peças", arranjo do Dashboard e layout/card da vitrine — foram fechadas e descritas na Parte III do UX. Não há mais ⚑ na matriz.

A partir daqui, os próximos artefatos da fase de UX são a **biblioteca de microcopy** (consolidando as mensagens-chave: erros neutros, bloqueios orientativos, confirmações, vazios), as **variações por papel** (o que muda entre Owner, Manager e Sales por tela) e, então, o **protótipo navegável**.

---

*Fim do documento. Matriz de Estados por Tela v0.1.*