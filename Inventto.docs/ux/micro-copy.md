# Inventto — Biblioteca de Microcopy v0.1

*Companheiro do UX v0.1, do Mapa de Telas v0.1 e da Matriz de Estados v0.1.*

## Como usar este documento

Reúne num lugar só as **mensagens-chave** da v1 — as que carregam decisão e precisam ser consistentes: erros neutros, bloqueios orientativos, confirmações, estados vazios e o texto da vitrine pública. É a materialização de três princípios do UX: *microcopy orientativa* (quando o sistema bloqueia, diga o que falta), *mensagens neutras nos fluxos sensíveis* e *estados vazios que conduzem*.

É uma biblioteca-semente: cobre o que tem peso de produto, não cada rótulo de botão. Cresce na fase de protótipo. Convenção: `{variável}` marca conteúdo dinâmico; **[Botão]** marca ação; *texto em itálico* é auxiliar (helper). Referências (`RNxxx`) apontam para o Documento de Produto.

---

## Voz e tom

**App interno (Stores).** Claro, direto, sem jargão. Verbos no imperativo, foco na ação, frases curtas. Quem opera quer resolver rápido (princípio da eficiência).

**Vitrine pública (Loja).** Mais calorosa e conversacional — fala com um cliente, não com um operador. Zero termo técnico interno ("catálogo", "reserva", "SKU" não aparecem para o cliente).

**Transversal.** Sentence case (só a primeira letra maiúscula) em títulos e mensagens; botões sem ponto final; erros sempre dizem *o que aconteceu + o que fazer*; em segurança, nunca confirmar nem negar a existência de um dado ou recurso.

---

## 1. Mensagens neutras — acesso e segurança

Nunca revelam se um e-mail tem conta ou se um recurso existe (RN002, RN007).

| Contexto | Texto | Regra |
|---|---|---|
| Falha no login | "E-mail ou senha incorretos." | Não diz qual dos dois (RN002) |
| Recuperação de senha | "Se houver uma conta com esse e-mail, enviamos as instruções." | Mesmo texto exista ou não (RN002) |
| Cadastro com e-mail já em uso | "Enviamos um e-mail para {email}. Confirme para ativar sua conta." | Caminho idêntico ao de e-mail novo; não revela duplicidade (RN007) |
| Muitas tentativas de login | "Muitas tentativas. Aguarde alguns minutos e tente de novo." | Anti-força-bruta (RN005) |
| E-mail ainda não verificado | "Confirme seu e-mail para entrar." **[Reenviar link]** | RN003 |
| Primeiro acesso (definir senha) | "Defina uma senha para ativar seu acesso." | RN015 |
| Acesso direto sem permissão | *(sem texto — redireciona em silêncio)* | Ver Matriz, "Sem permissão" (RN002) |

---

## 2. Bloqueios orientativos

Quando a ação é barrada, o texto diz o que falta para destravá-la — nunca só "não permitido".

| Contexto | Texto | Regra |
|---|---|---|
| Publicar vitrine incompleta | "Para publicar, ainda falta: {WhatsApp, catálogo, horário}." Cada item com seu atalho. | RN075 |
| Vender no balcão sem catálogo | "Vincule um catálogo ao PDV para começar a vender." **[Escolher catálogo]** | RN065 |
| Remover catálogo em uso | "Este catálogo está em uso por {n} canal(is). Desvincule antes de remover." *(lista os canais)* | RN061 |
| Saída maior que o saldo | "Estoque insuficiente — há {saldo} disponível." *(ação desabilitada)* | RN055 |
| SKU duplicado | "Já existe um produto com este SKU." | RN038 |
| Slug em uso | "Este endereço já está em uso. Tente outro." | RN072 |
| Slug com formato inválido | "Use só letras minúsculas, números e hífen, de 3 a 50 caracteres." | RN072 |
| Item sem preço na curadoria | "Defina um preço para incluir este item." | RN063 |
| Movimentação sem motivo | "Selecione um motivo." | RN053 |
| Motivo "Outro" sem descrição | "Descreva o motivo." | RN053 |
| Assumir pedido já assumido por outro | "Este pedido já foi assumido." *(a lista é atualizada)* | RN082 |

---

## 3. Confirmações e desfazer

Para o reversível, *desfazer* em vez de modal. Para o irreversível, confirmação reforçada.

| Contexto | Texto | Regra |
|---|---|---|
| Ação reversível (remover item de lista) | "{item} removido. **Desfazer**" *(toast, sem modal)* | Princípio "desfazer no lugar de confirmar" |
| Inativar produto | "Inativar {produto}? Ele sai das listagens, mas o histórico é mantido." **[Inativar]** | RN045 |
| Desativar organização | "Desativar {org}? Os pedidos pendentes serão cancelados e suas vitrines sairão do ar. Você pode reativar depois." **[Desativar]** | RN027, RN028 |
| Excluir organização | "Esta ação é definitiva. Digite **{nomeFantasia}** para confirmar." **[Excluir]** *(botão travado até bater)* | RN029 |
| Cancelar pedido | "Cancelar este pedido? A reserva de estoque será liberada." **[Cancelar pedido]** | RN086 |

---

## 4. Estados vazios — onboarding

O vazio ensina o próximo passo; juntos, formam o arco de primeiro uso.

| Tela | Texto | Ação |
|---|---|---|
| Produtos | "Comece cadastrando seu primeiro produto." | **[Cadastrar produto]** |
| Catálogos | "Crie um catálogo para definir o que você vende e por quanto." | **[Criar catálogo]** |
| Curadoria de catálogo | "Adicione produtos a este catálogo." | **[Adicionar produtos]** |
| Storefronts | "Monte sua vitrine online e venda pelo link." | **[Criar vitrine]** |
| Movimentações | "Nenhuma movimentação ainda. Entradas e saídas aparecem aqui." | **[Registrar entrada]** |
| Vendas do balcão (período) | "Nenhuma venda neste período." | — |
| Painel de pedidos | "Nenhum pedido pendente. Os novos chegam aqui em tempo real." | — |
| Busca sem resultado | "Nada encontrado para '{termo}'." | — |
| Dashboard (1º uso) | "Vamos preparar sua loja." *(cards: cadastrar produto → criar catálogo → publicar vitrine)* | **[Começar]** |

---

## 5. Toasts — sucesso e falha

| Contexto | Texto |
|---|---|
| Salvo (genérico) | "Alterações salvas." |
| Criado (genérico) | "{item} criado." |
| Falha ao salvar | "Não foi possível salvar. Tente de novo." |
| Sem conexão | "Sem conexão. Verifique sua internet e tente de novo." |
| Venda registrada | "Venda registrada." |
| Vitrine publicada | "Vitrine no ar." |
| Pedido confirmado | "Pedido confirmado e estoque baixado." |
| Vitrine despublicada | "Vitrine despublicada." |
| Membro adicionado | "Membro adicionado à organização." |
| Organização desativada | "Organização desativada." |

---

## 6. Vitrine pública (cliente final)

Tom mais caloroso, sem jargão. O cliente nunca vê "reserva", "catálogo" ou "SKU".

| Contexto | Texto | Regra |
|---|---|---|
| Loja fechada (aceita pedido) | "Estamos fechados agora ({horário}). Você pode pedir e confirmamos na reabertura." | RN078 |
| Loja fechada (sem pedido) | "Voltamos {próxima abertura}. Fale com a gente no WhatsApp." | RN078 |
| Últimas peças | "Últimas peças!" | — |
| Esgotado | "Esgotado" *(badge)* — "Fale conosco no WhatsApp" | Sem "avise-me" na v1 |
| Preço oculto | "Consultar" / *"Pergunte o preço no WhatsApp."* | RN076 |
| Loja indisponível | "Esta loja não está disponível no momento." | RN074 |
| CEP não encontrado | "Não encontramos esse CEP. Preencha o endereço manualmente." | RN084 |
| Item saiu de estoque no checkout | "Um item esgotou enquanto você finalizava. Revise seu pedido." | RN086 |
| Pedido enviado | "Pedido enviado! A loja confirma com você pelo WhatsApp." | — |
| Ação: fazer pedido | **[Fazer pedido]** | RN079 |
| Ação: falar no WhatsApp | **[Falar no WhatsApp]** | RN079 |
| Helper do WhatsApp no checkout | *"Usamos seu WhatsApp para confirmar o pedido."* | RN083 |

---

## 7. Validação inline de formulário

Erros de campo aparecem junto ao campo (no *blur* ou no *submit*); dizem o que corrigir, sem culpar.

| Contexto | Texto | Regra |
|---|---|---|
| Campo obrigatório vazio | "Campo obrigatório." | — |
| Documento (CPF/CNPJ) inválido | "Documento inválido. Verifique os números." | RN018 |
| Telefone inválido | "Telefone inválido. Inclua DDD e número." | RN083 |
| Termos não aceitos | "Aceite os Termos e a Política de Privacidade para continuar." | RN006 |

---

## 8. Rótulos de estado (badges e status)

| Domínio | Rótulos |
|---|---|
| Estoque (vitrine, cliente) | Disponível · Últimas peças · Esgotado |
| Estoque (app interno) | Saudável · Atenção · Crítico · Zerado |
| Pedido | Pendente · Confirmado · Expirado · Cancelado |
| Membro | Ativo · Convidado · Inativo |
| Storefront | No ar · Despublicado |
| Motivos de entrada | Compra · Devolução de cliente · Ajuste de inventário (+) · Outro |
| Motivos de saída | Perda/Avaria · Devolução a fornecedor · Uso interno · Ajuste de inventário (−) · Outro |

---

## Pendências e próximos passos

As decisões da Parte III foram fechadas: os rótulos dos **motivos de movimentação** e dos **status de estoque** (vitrine e app interno) estão na seção 8. Os textos atrelados ao layout fino — proporções do card da vitrine e dos blocos do Dashboard — ainda podem ajustar extensão e tom quando o visual fechar no protótipo.

Próximo artefato: **variações por papel** (o que muda entre Owner, Manager e Sales por tela) e, então, o **protótipo navegável**.

---

*Fim do documento. Biblioteca de Microcopy v0.1.*