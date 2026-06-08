# Inventto — Documento de Produto v1.0

**Status:** Draft
**Versão do documento:** 1.0
**Data:** [a definir]
**Autor:** [a definir]
**Aprovado por:** [a definir]

## Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | [data] | [autor] | Versão inicial. Substitui Geral-v1, Geral-v2 e Geral-v3 (arquivados). |

---

# Parte I — Visão de Produto e Decisões

## 1. Visão Geral

### 1.1. O que é o Inventto

O **Inventto** é uma plataforma SaaS de gestão de inventário e vendas digitais voltada a pequenas e médias empresas com presença comercial mista (loja física + canais digitais informais como WhatsApp e redes sociais). A v1 centraliza o cadastro de produtos, o controle auditável de estoque, a gestão de uma equipe com permissões hierárquicas e a publicação de catálogos online que recebem pedidos diretamente no painel da loja.

O sistema é multi-organização: cada usuário pode pertencer a uma ou mais organizações independentes, e cada organização representa uma loja ou unidade isolada com seus próprios produtos, equipe, estoque, catálogos e configurações.

### 1.2. Problema que o produto resolve

Pequenas e médias empresas com presença comercial mista enfrentam dois problemas operacionais combinados que limitam o crescimento digital:

primeiro, **controle de estoque em planilhas**, com risco de inconsistência entre o que está disponível na loja física e o que é prometido no atendimento digital, ausência de auditoria de quem alterou o quê, e dificuldade de operação por equipes com múltiplos vendedores.

segundo, **atendimento digital manual via WhatsApp**, sem vitrine online estruturada, com fotos e informações repassadas individualmente a cada cliente, sem registro persistente dos pedidos, e dependente da memória ou organização pessoal do vendedor.

O Inventto resolve os dois problemas em um único sistema integrado: o estoque vira fonte única de verdade auditável, e o atendimento digital ganha vitrines online estruturadas que capturam pedidos diretamente no painel da loja.

### 1.3. Personas

**Joana — dona de loja de roupas femininas.** Possui uma loja física bem localizada, e usa WhatsApp, Instagram e Facebook para divulgação e atendimento. Hoje atende pedidos digitais manualmente, envia fotos de produtos individualmente a cada cliente interessado, e controla estoque em planilha. Tem duas vendedoras na loja. Precisa de um catálogo digital com fotos profissionais por variação de produto (cor, tamanho), controle de estoque que reflita vendas tanto físicas quanto digitais, e uma forma de receber pedidos online sem perder o atendimento personalizado.

**Carlos — dono de uma pequena rede de petshops.** Possui três lojas físicas em pontos distintos da cidade, vendendo rações, medicamentos e brinquedos. Atende pelo WhatsApp mas não possui catálogo digital. Hoje cada loja opera de forma independente, sem visão consolidada de estoque. Precisa de um sistema simples por unidade, com vitrine online por loja e captação de pedidos pelo digital. A v1 trata as três lojas como organizações independentes — visão consolidada entre lojas (multi-store) está fora do escopo.

### 1.4. Promessa de valor da v1

A v1 do Inventto entrega à Joana e ao Carlos a substituição de duas ferramentas precárias por uma plataforma única: a planilha de estoque deixa de existir, e o atendimento manual no WhatsApp ganha vitrines online que capturam pedidos diretamente no painel da loja. O contato com o cliente continua acontecendo pelo WhatsApp, mas a partir de um pedido já estruturado, com produtos selecionados, dados de contato e referência única — o vendedor sabe o que o cliente quer antes da primeira mensagem.

---

## 2. Escopo da v1

### 2.1. Jornadas críticas (o que entra)

A v1 cobre as jornadas críticas sem as quais o produto não cumpre sua promessa de valor:

cadastro de produtos com suporte a variações em grade (cor, tamanho, peso, etc.);

controle auditável de estoque, com registro de entrada e saída qualificadas por motivo, e histórico imutável;

catálogos de produtos com preços, reutilizáveis entre canais de venda — usados tanto no balcão (PDV) quanto nas vitrines online;

vitrine online (storefront) personalizável por organização, com identidade visual e indicadores de estoque público;

captação de pedidos a partir da vitrine online, com formulário de contato e reserva temporária de estoque;

atendimento via WhatsApp, partindo do painel da loja ou do checkout (link `wa.me` com mensagem pré-preenchida);

registro de vendas no balcão, com baixa simplificada de estoque vinculada à venda;

auditoria de movimentações de estoque, com histórico cronológico e filtrável;

operação multi-organização, onde um mesmo usuário (especialmente o Carlos) alterna entre organizações que representam unidades isoladas.

### 2.2. Limites da v1

A v1 do Inventto **não inclui**, por decisão consciente: importação em lote de produtos por arquivo (CSV, planilha); ponto de venda completo com processamento de pagamento, recibos e fechamento de caixa; painel B2B para revendedores com tabelas de preço diferenciadas; controle financeiro avançado (fluxo de caixa, conciliação, contas a pagar/receber); múltiplas lojas físicas sob a mesma organização (multi-store) — cada loja na v1 é uma organização independente; integrações com WhatsApp além do link `wa.me` (sem inbox, sem WhatsApp Business API, sem automação); cadastro próprio de clientes finais com login (clientes que pedem pelo catálogo são identificados pelos dados informados no momento do pedido — nome, telefone, endereço e forma de pagamento pretendida); pagamento online — a v1 captura pedidos como leads qualificados, sem processar transação financeira; e controle de validade, lote ou número de série de produtos (ver nota de evolução de Estoque Avançado no módulo 5).

Esses itens compõem o roadmap pós-v1 e podem retornar como funcionalidades futuras, mas estão deliberadamente fora do escopo atual.

### 2.3. Decisões estruturantes

Decisões transversais tomadas na concepção da v1 e que afetam múltiplos módulos:

**Multi-organização isolada.** Cada loja ou unidade do cliente é uma organização independente no sistema. Não há conceito de "rede com múltiplas lojas" no modelo de dados — se um cliente possui três lojas físicas (como o Carlos), ele opera três organizações isoladas, cada uma com seu próprio catálogo, equipe, estoque e configurações. A consolidação entre organizações fica fora da v1.

**Tenant e organização.** O tenant é o contratante da plataforma — o usuário que faz o signup e é o Owner da operação. As organizações são as unidades que compõem o negócio do tenant. Na v1, o tenant é um conceito (não uma entidade dedicada no banco): é entendido como o usuário que é Owner de uma ou mais organizações. A promoção de tenant a entidade explícita é evolução conhecida, prevista para quando surgirem funcionalidades cross-organização (cobrança agregada, dashboard de rede, multi-store).

**Pedidos digitais como captura direta no painel.** A vitrine online (storefront) oferece dois caminhos no checkout: **"Realizar pedido"**, em que o cliente preenche um formulário com nome, telefone, endereço estruturado (com preenchimento automático via ViaCEP) e forma de pagamento pretendida (cartão, dinheiro ou pix), e o sistema registra o pedido com reserva temporária de estoque, notifica a equipe e o exibe no painel de pendentes; e **"Chamar no WhatsApp"**, em que o cliente abre conversa direta com o vendedor para tirar dúvidas, sem criar pedido formal. A forma de pagamento é apenas a intenção do cliente — a v1 não processa pagamento online; a transação acontece offline. O vendedor também pode iniciar contato com o cliente via WhatsApp a partir do painel.

**Atendimento WhatsApp grau 1.** A integração com WhatsApp limita-se a abrir conversas a partir de links `wa.me` com mensagens pré-preenchidas, sem integração via API oficial, inbox dentro do sistema ou automação.

**Ecossistema multi-aplicação (visão futura).** O Inventto evolui para um ecossistema de aplicações sob um mesmo tenant, navegáveis por um seletor no topo: **Admin** (gestão administrativa, incluindo a listagem e criação completa de organizações), **Stores** (a aplicação da v1), **Marketing** (gestão de campanhas) e **Revendedores** (B2B, ainda em concepção). A v1 é o app Stores.

---

## 3. Stack e Infraestrutura

### 3.1. Tecnologias

| Camada | Tecnologia | Função |
|--------|------------|--------|
| Frontend | React 19 + Vite + TypeScript | Aplicação web (SPA) |
| UI | Tailwind CSS + shadcn/ui | Sistema de design |
| Hospedagem do frontend | Vercel | Build, deploy e CDN |
| Banco de dados e API | Supabase (PostgreSQL + PostgREST) | Persistência e API REST |
| Autenticação | Supabase Auth | Login, sessão, recuperação de senha |
| Tempo real | Supabase Realtime | Notificações no painel |
| Funções serverless | Supabase Edge Functions | Lógica server-side específica |
| Armazenamento de imagens | Cloudinary | Upload e entrega otimizada |
| E-mail transacional | Resend | Verificação, recuperação de senha e alertas de pedido |
| Consulta de CEP | ViaCEP (API pública) | Preenchimento automático de endereço no checkout |
| Domínio próprio | [a definir] | Pré-requisito para entrega de e-mail confiável e hospedagem dos catálogos |

### 3.2. Estratégia de custo

A v1 opera com custo recorrente próximo de zero. O único custo fixo previsto é o registro do domínio (~R$ 40-60/ano). Todos os demais serviços utilizam o free tier de seus provedores, dimensionado para suportar com folga a operação de dois clientes beta. Limites de free tier são monitorados; o Cloudinary é o primeiro a apresentar pressão conforme o catálogo cresce em volume de imagens e tráfego.

---

## 4. Requisitos Não Funcionais Bloqueadores

Os requisitos abaixo são bloqueadores: a v1 não pode entrar em uso com cliente real sem que estejam atendidos.

**RNF001 — Interface responsiva e mobile-first.** A aplicação deve ser funcional e usável em dispositivos móveis, considerando que a operação ocorre parcialmente no chão da loja e que a vitrine online é acessada majoritariamente por celulares.

**RNF002 — Isolamento estrito entre organizações.** As políticas de Row Level Security (RLS) do Supabase devem garantir que dados de uma organização nunca sejam acessíveis por usuários de outra organização sob nenhuma hipótese. Esse isolamento deve ser validado por testes automatizados.

**RNF003 — Upload de imagem confiável.** O processo de upload de imagens de produto deve ter tratamento adequado de erro, feedback de progresso e tolerância a conexões instáveis (especialmente em mobile).

**RNF004 — Sessão persistente com rolling de 24 horas.** A sessão se mantém ativa por refresh silencioso enquanto há atividade. Expira somente após 24 horas de inatividade, redirecionando o usuário para o login.

**RNF005 — Resolução determinística de concorrência de estoque.** Quando dois ou mais atores tentam reduzir o estoque do mesmo item simultaneamente, o sistema deve resolver de forma previsível e auditável — a regra exata é definida no módulo de Movimentações de Estoque.

---

## 5. Glossário

**Tenant.** O contratante da plataforma — o usuário que faz o signup e é o Owner da operação. Na v1 é um conceito, não uma entidade dedicada: corresponde ao usuário que é Owner de uma ou mais organizações.

**Organização.** Unidade autônoma do sistema. Representa uma loja, ponto de venda ou unidade do negócio do tenant. Cada organização tem seus próprios produtos, equipe, estoque, catálogos e configurações.

**Papel (Role).** Nível de acesso do usuário dentro de uma organização. A v1 define três papéis: Owner, Manager e Sales.

**Produto.** Item do inventário da organização. Pode ser simples (sem variações) ou possuir variantes em grade.

**Variante.** Combinação específica de atributos de um produto (ex: "vestido vermelho tamanho M"). Cada variante tem seu próprio SKU e estoque independente.

**Atributo.** Eixo de variação de um produto (ex: cor, tamanho, peso, sabor).

**SKU.** Código identificador de um produto ou variante, único dentro da organização.

**Grade.** Conjunto de variantes geradas pela combinação dos atributos de um produto.

**Movimentação.** Registro auditável e imutável de alteração do estoque, de entrada ou saída, sempre qualificado por um motivo.

**Catálogo.** Seleção de produtos com preços, independente de canal. Pode ser usada por qualquer canal de venda — o balcão (PDV) e as vitrines online (storefronts) —, inclusive por vários ao mesmo tempo. O preço pertence ao item de catálogo, e o mesmo produto pode ter preços diferentes em catálogos diferentes.

**Slug.** Identificador de um storefront na URL (`inventto.app/{slug}`), único em todo o sistema.

**Storefront.** Canal de venda online: vitrine pública, acessível por URL própria, que apresenta um catálogo e onde o cliente final navega produtos e realiza pedidos. Define a própria identidade visual, contato e regras de exibição.

**Pedido.** Captura estruturada de intenção de compra. Online, nasce pendente com reserva de estoque; no balcão, nasce confirmado. Contém itens, dados de contato do cliente (nome, telefone, endereço estruturado) e forma de pagamento pretendida.

**Reserva.** Bloqueio temporário de uma quantidade de estoque associada a um pedido pendente, com prazo de expiração.

**Template de área de atuação.** Conjunto de configurações iniciais (categorias, atributos, valores comuns) aplicado uma única vez no momento do signup, conforme a área escolhida, para reduzir a fricção do setup inicial.

---

## 6. Mapa de Módulos

A v1 é composta por dez módulos. Cada um é detalhado na Parte II.

| # | Módulo | Objetivo | Status |
|---|--------|----------|--------|
| 1 | Autenticação | Login, signup, recuperação de senha, primeiro acesso | Parcial |
| 2 | Organizações | Criação, configurações e troca de contexto entre organizações | Implementado |
| 3 | Equipe & Permissões (RBAC) | Três papéis, matriz de permissões, gestão de membros | Implementado |
| 4 | Produtos | Cadastro e inventário de produtos com variações em grade | Implementado |
| 5 | Movimentações de Estoque | Entrada e saída auditáveis, histórico imutável, saldo | Implementado |
| 6 | Catálogos | Seleções de produtos com preços, reutilizáveis entre canais | Parcial |
| 7 | Vendas no Balcão (PDV) | Registro de venda presencial com baixa de estoque | A fazer |
| 8 | Storefront | Canal de venda online: vitrine que apresenta um catálogo | Parcial |
| 9 | Pedidos Online | Captura, reserva, painel e ciclo de vida do pedido | Parcial |
| 10 | Dashboard | Painel operacional com alertas, resumo e atividade | A fazer |

---

## 7. Pré-requisitos Pré-Beta

Antes do primeiro cliente real usar o sistema em produção, os itens abaixo — transversais a vários módulos e bloqueadores de lançamento — devem estar completos:

**Domínio próprio registrado e configurado.** Necessário para entrega confiável de e-mail transacional e para hospedar os storefronts. Registros DNS de verificação no Resend propagados e validados.

**Política de Privacidade e Termos de Uso publicados.** Linkados no rodapé e referenciados no signup, com checkbox de aceite explícito. Esses documentos esclarecem também o tratamento de solicitações de exportação e exclusão de dados (LGPD), atendidas reativamente na v1.

**Ambiente de produção provisionado e testado.** Projeto Supabase de produção separado, Vercel no domínio, Resend com domínio verificado, Cloudinary configurado, variáveis de ambiente revisadas.

**Validação automatizada de isolamento entre organizações (RLS).** Suíte de testes que garanta, antes de cada release, que usuários de uma organização não acessam dados de outra.

---

# Parte II — Módulos do Sistema

## Módulo 1 — Autenticação

**Objetivo:** Controlar o acesso ao sistema, garantindo que apenas usuários cadastrados, verificados e ativos consigam entrar, com mecanismos de recuperação e proteção da sessão.

**Atores que interagem com este módulo:**

- **Usuário não autenticado** — visitante que ainda não possui conta.
- **Owner, Manager, Sales** — usuários autenticados, cuja diferença de papel não afeta a autenticação em si.
- **Membro recém-convidado** — usuário criado por um Owner que ainda não realizou seu primeiro acesso.

### 1.1. Regras transversais do módulo

**RN001 — Política de senha.** Toda senha definida pelo usuário (cadastro, troca de primeiro acesso ou redefinição) deve ter no mínimo 8 e no máximo 32 caracteres, contendo ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial. Espaços e caracteres Unicode são permitidos. A interface apresenta um medidor visual de força (informativo, baseado em zxcvbn), que não bloqueia o envio mas orienta contra senhas previsíveis.

**RN002 — Mensagens de erro neutras na autenticação.** Falhas em login, redefinição de senha e demais fluxos não revelam se um e-mail está cadastrado. Mensagens são genéricas (ex: "credenciais inválidas").

**RN003 — Verificação obrigatória de e-mail.** Conta recém-criada permanece "não verificada" até o usuário informar o código OTP enviado por e-mail. Quando um login é tentado com conta não verificada, o sistema reenvia o código e transiciona o usuário para o step de verificação dentro do próprio fluxo, em vez de bloquear com erro. O código tem validade de 1 hora, com opção de reenvio.

**RN004 — Sessão com rolling de 24 horas.** Enquanto há atividade, a sessão é renovada silenciosamente. Após 24 horas de inatividade, expira; na próxima requisição autenticada, o usuário é redirecionado ao login com toast informativo.

**RN005 — Proteção contra força bruta.** A v1 não implementa CAPTCHA, bloqueio temporário de conta nem rate limit aplicacional próprio. Confia-se no rate limit nativo do provedor de autenticação.

**RN006 — Aceite explícito de Termos e Política de Privacidade.** O cadastro exige aceite ativo dos Termos de Uso e da Política de Privacidade, com links acessíveis. `[pré-beta]`

### 1.2. RF001 — Cadastro de nova conta

**Como** usuário não autenticado, **eu quero** criar uma conta no Inventto **para** começar a operar minha loja no sistema.

**Comportamento esperado:** O usuário acessa o cadastro a partir da tela de login e preenche: dados pessoais (nome completo e e-mail), nome fantasia e documento (CPF ou CNPJ; razão social quando CNPJ) da organização, seleção da área de atuação, senha, e aceite de Termos e Política de Privacidade. Ao submeter, o sistema cria a conta (como Owner), a organização correspondente, e aplica o template de configuração inicial da área de atuação. Em seguida dispara e-mail com link de verificação e leva o usuário a uma tela orientando a verificar o e-mail antes do primeiro login

O cadastro não solicita slug — a identidade pública (slug, vitrine) é definida depois, ao criar um storefront (módulo de Storefront).

**Regras aplicáveis:** RN001 (senha), RN003 (verificação), RN006 (aceite), RN018 e RN019 (documento).

**Regras específicas:**

**RN007 — Unicidade de e-mail.** Não é permitido cadastrar duas contas com o mesmo e-mail. Tentativa com e-mail já em uso é tratada de forma neutra (orienta a recuperar a senha sem revelar a existência).

**RN008 — Template aplicado apenas no cadastro.** A escolha da área de atuação é one-shot, exclusiva do cadastro. A organização não permite reaplicar template depois.

**RN009 — Conta criada como Owner.** Quem cadastra uma nova conta é automaticamente o Owner (tenant) da organização criada.

### 1.3. RF002 — Acesso ao sistema (login, sessão e logout)

**Como** usuário verificado, **eu quero** entrar com e-mail e senha **para** acessar minha organização e executar minhas tarefas.

**Comportamento esperado:** O usuário informa e-mail e senha. Com múltiplas organizações, o sistema seleciona automaticamente a última utilizada (registrada localmente); sem registro, a primeira da lista. Após autenticar, é redirecionado: se tentou acessar uma URL protegida antes do login, retorna a ela; caso contrário, vai à tela inicial padrão. O logout encerra a sessão e leva ao login.

**Regras aplicáveis:** RN002, RN003, RN004, RN005.

**Regras específicas:**

**RN010 — Persistência da última organização ativa.** O sistema registra localmente, no dispositivo, a última organização utilizada, para restaurá-la em logins subsequentes.

**RN011 — Redirect contextual pós-login.** Rota protegida acessada sem sessão preserva o caminho original; após autenticar, o usuário é levado a ele.

**Critérios de aceitação:** login válido redireciona corretamente; login inválido exibe mensagem neutra; conta não verificada é bloqueada com orientação; logout impede acesso a rotas protegidas; sessão expirada após 24h redireciona ao login.

### 1.4. RF003 — Verificação de e-mail

**Como** usuário recém-cadastrado, **eu quero** confirmar meu e-mail **para** ativar minha conta.

**Comportamento esperado:** Após o cadastro, o usuário recebe e-mail com código OTP de 6 dígitos. A verificação acontece como step embutido no próprio fluxo de origem — passo final do cadastro, passo 2 condicional do login (quando uma tentativa de acesso detecta conta não verificada) e passo 2 do primeiro acesso. O código tem validade de 1 hora, com opção de reenvio. Não há rota dedicada de verificação: a conta é confirmada ao validar o código no contexto do fluxo atual.

**Regras aplicáveis:** RN002, RN003.

### 1.5. RF004 — Recuperação de senha

**Como** usuário cadastrado, **eu quero** redefinir minha senha quando esquecê-la **para** voltar a acessar o sistema.

**Comportamento esperado:** Em "esqueci minha senha", o usuário informa o e-mail e recebe sempre a mesma resposta neutra. Para e-mails cadastrados, o sistema envia link único com token descartável; o usuário define a nova senha e é redirecionado ao login.

**Regras aplicáveis:** RN001, RN002.

**Regras específicas:**

**RN012 — Validade do link de redefinição.** Válido por 1 hora; depois é invalidado e exige nova solicitação.

**RN013 — Uso descartável do token.** Invalidado após o uso bem-sucedido; reutilização é rejeitada mesmo dentro da validade.

**RN014 — Independência entre solicitações.** Cada nova solicitação invalida tokens anteriores ativos do mesmo usuário.

### 1.6. RF005 — Primeiro acesso para membro convidado

**Como** membro recém-criado por um Owner, **eu quero** acessar o sistema pela primeira vez **para** iniciar minha operação.

**Comportamento esperado:** Ao criar um membro, o Owner define uma senha provisória, informada externamente. No primeiro login com ela, o sistema reconhece o estado de primeiro acesso e exige a definição de uma nova senha pessoal antes de liberar o painel.

**Regras aplicáveis:** RN001, RN002.

**Regras específicas:**

**RN015 — Bloqueio até troca de senha.** O membro em primeiro acesso não acessa nenhuma rota protegida (exceto a própria troca de senha) até concluí-la.

**Nota de evolução:** O fluxo de senha provisória definida pelo Owner é a abordagem da v1. Em iteração futura, considera-se substituí-lo por convite via e-mail com link de definição de senha pelo próprio membro (o Owner nunca conheceria a senha).

### 1.7. Limites do módulo na v1

A v1 **não inclui**: autenticação multifator (2FA), login social, magic link, SSO, notificação de novo login, histórico de senhas, expiração programada de senha, checagem contra bases de senhas vazadas, e troca de e-mail vinculado à conta.

### 1.8. Dependências

Política de Privacidade e Termos publicados (pré-beta); serviço de mensageria transacional (e-mails de verificação e recuperação); catálogo de áreas de atuação (compartilhado com Organizações e Produtos).

---

## Módulo 2 — Organizações

**Objetivo:** Definir como as unidades operacionais do tenant são criadas, configuradas, mantidas e encerradas, garantindo o isolamento estrito de dados entre elas e a coerência da troca de contexto.

**Atores que interagem com este módulo:**

- **Owner** — único papel autorizado a operar configurações e ciclo de vida das organizações que possui.
- **Manager e Sales** — atuam no contexto da organização ativa, sem gerenciar a organização em si.
- **Cliente final** — afetado indiretamente (storefronts, pedidos pendentes) quando a organização é desativada ou excluída.

### 2.1. Regras transversais do módulo

**RN016 — Tenant como conceito.** O sistema entende "tenant" como o usuário que é Owner de uma ou mais organizações. Não há entidade `tenants` na v1. A promoção a entidade explícita é evolução conhecida (cobrança agregada, dashboard de rede, multi-store).

**RN017 — Isolamento estrito entre organizações.** Toda operação sobre dados de uma organização é vinculada ao `organization_id` e validada por RLS. Dados de uma organização nunca são acessíveis por usuários de outra, independentemente da relação entre tenants. No frontend, queries carregam o `organization_id` como parte da chave, garantindo invalidação na troca de contexto.

**RN018 — Identidade fiscal obrigatória e editável.** Documento (CPF ou CNPJ) e razão social são obrigatórios no cadastro e podem ser corrigidos a qualquer momento. Quando o documento é CNPJ, a razão social é obrigatória; o documento é validado por formato (dígito verificador). Na v1, sem módulo fiscal, são dados cadastrais sem função fiscal ou de cobrança — a imutabilidade da identidade fiscal passa a valer apenas quando existir vínculo fiscal/cobrança (evolução).

**RN019 — Documento pode repetir entre organizações.** Um mesmo CPF ou CNPJ pode estar vinculado a várias organizações — refletindo redes que operam sob um único CNPJ ou unidades sem CNPJ próprio. A v1 não aplica unicidade de documento.

**RN020 — Apenas Owner gerencia a organização.** Edição de configurações, replicação, desativação e exclusão são restritas ao Owner da organização. Criar uma nova organização também é prerrogativa do Owner/tenant (RN025).

**RN021 — Owner único por organização.** Cada organização tem exatamente um Owner, invariante garantido no banco. Transferência de propriedade fica fora da v1.

### 2.2. RF006 — Criação rápida de organização adicional

**Como** Owner, **eu quero** criar uma nova organização durante o uso **para** representar uma nova unidade do meu negócio sem refazer o cadastro inicial.

**Comportamento esperado:** O Owner cria uma nova organização informando o mínimo necessário: nome fantasia e documento (CPF ou CNPJ; razão social quando CNPJ). Ao confirmar, o sistema cria a organização, vincula o Owner a ela e a torna o contexto ativo. Quando o Owner já possui outra organização, pode opcionalmente replicar para a nova as configurações de uma delas (RF009).

A criação rápida não aplica o template de área de atuação (exclusivo do signup) — é a criação enxuta, com dados mínimos, em contraste com a criação completa, prevista para o futuro app Admin.

**Regras aplicáveis:** RN018, RN019, RN020.

**Regras específicas:**

**RN022 — Apenas o Owner cria novas organizações.** Criar uma nova unidade é prerrogativa do tenant/Owner, que se torna Owner também da nova organização. Manager e Sales não criam organizações. Quem não tem negócio próprio e deseja um faz novo signup com e-mail distinto (RN007), tornando-se tenant de uma nova operação.

### 2.3. RF007 — Edição da configuração da organização

**Como** Owner, **eu quero** editar os dados e as configurações da minha organização para mantê-los atualizados e ajustar as regras operacionais.

**Comportamento esperado:** O Owner edita a configuração da organização, que reúne: a identidade (nome fantasia e logo), a identidade fiscal (documento e razão social, editáveis conforme RN018), o endereço estruturado, o timezone (default `America/Sao_Paulo`), o horário de funcionamento (definido por dia da semana — cada dia com uma única faixa de abertura e fechamento, ou marcado como fechado) e a regra operacional de aceitar pedidos com a loja fechada. As ações destrutivas — desativação e exclusão — são tratadas separadamente (RF010 e RF011).

**Regras aplicáveis:** RN017, RN018, RN020.

**Regras específicas:**

**RN023 — Logo via upload.** O logo da organização é fornecido por upload de imagem, com armazenamento no serviço de banco de imagens.

**RN024 — Endereço estruturado.** O endereço é estruturado (CEP, logradouro, número, bairro, cidade, estado, complemento). Ao informar um CEP válido, a api de consulta de CEPs preenche logradouro, bairro, cidade e estado; restam número e complemento. CEP inválido não bloqueia o preenchimento manual.

**RN025 — Edição confirmada explicitamente.** As alterações na configuração da organização só são persistidas após confirmação explícita do Owner. Enquanto não confirmadas, permanecem pendentes e podem ser descartadas, sem efeito sobre os dados vigentes — a edição não é salva automaticamente a cada campo.

### 2.4. RF008 — Troca de contexto entre organizações

**Como** usuário com múltiplas organizações, **eu quero** alternar entre os contextos **para** trabalhar com a unidade correta.

**Comportamento esperado:**  O usuário vinculado a mais de uma organização pode escolher qual delas é o contexto ativo, dentre aquelas às quais pertence. A organização ativa e o papel do usuário nela são sempre identificáveis. Ao trocar de contexto, toda a operação passa a refletir a organização selecionada — tanto os dados exibidos quanto as permissões correspondentes ao papel do usuário naquela organização, que pode diferir entre organizações (RN031) — de forma imediata, sem novo login. A última organização ativa é lembrada para o próximo acesso (RN010).

**Regras aplicáveis:** RN017 (isolamento), RN010 (persistência da última organização ativa), RN031 (papel por organização).

### 2.5. RF009 — Replicação de configurações entre organizações

**Como** Owner com múltiplas organizações, **eu quero** copiar configurações de uma organização para outra recém-criada **para** reduzir a fricção de configurar uma nova unidade similar.

**Comportamento esperado:** Ao criar uma nova organização (RF006), quando o Owner já possui ao menos uma outra, ele pode optar por replicar configurações de uma delas para a nova: escolhe a organização de origem e os grupos a replicar — categorias, atributos e seus valores, e configurações operacionais. A replicação **não copia** produtos, estoque, movimentações, pedidos nem membros — apenas a configuração que dá forma à nova unidade.

**Regras aplicáveis:** RN020.

**Regras específicas:**

**RN026 — Replicação ocorre na criação.** A replicação acontece exclusivamente no momento da criação da organização. Como a criação é única, a replicação é naturalmente única por organização — não há estado a rastrear nem reaplicação posterior. Quem não replica no ato configura manualmente.

### 2.6. RF010 — Desativação de organização

**Como** Owner, **eu quero** desativar minha organização temporariamente **para** pausar a operação de vendas sem perder os dados históricos.

**Comportamento esperado:** A solicitação de desativação suspende imediatamente a operação comercial e o acesso operacional da unidade. O sistema deve garantir que usuários com os papéis de Manager e Sales percam o acesso à organização, enquanto o Owner mantém acesso restrito para fins de consulta ou reativação futura. Em relação ao ambiente externo, os storefronts da organização deixam de ser acessíveis para clientes finais. O sistema deve varrer e cancelar os pedidos pendentes desta organização, desfazendo as reservas ativas de estoque. A organização pode ter seu status revertido (reativada) pelo Owner a qualquer momento.

**Regras aplicáveis:** RN017, RN020.

**Regras específicas:**

**RN027 — Cancelamento automático de pedidos pendentes.** No momento da desativação, todos os pedidos com status `pendente` devem ter a reserva de estoque liberada e o status alterado para `cancelado`. Caso exista e-mail válido vinculado ao cliente do pedido, o sistema deve enfileirar uma notificação de cancelamento.

**RN028 — Storefronts de organização desativada.** Os storefronts de uma organização desativada ficam inoperantes (inacessíveis ao cliente final). Seus slugs permanecem reservados para o tenant enquanto a organização puder ser reativada, respeitando as regras de quarentena do módulo de Storefront caso a desativação se torne prolongada.

### 2.7. RF011 — Exclusão de organização

**Como** Owner, **eu quero** encerrar permanentemente uma organização **para** registrar o fim de uma unidade de negócio ou exercer o direito ao esquecimento.

**Comportamento esperado:** A exclusão de uma organização é uma ação unidirecional (não reativável). A plataforma deve oferecer ao usuário duas modalidades de encerramento:

1. **Retenção Histórica (Padrão):** A organização é inativada comercial e operacionalmente e tem seus storefronts suspensos, mas os dados transacionais são preservados no sistema para compor relatórios consolidados futuros (cenário multi-store).

2. **Exclusão Definitiva (Direito ao Esquecimento - LGPD):** Mediante solicitação explícita durante o fluxo de exclusão, todos os dados sistêmicos vinculados exclusivamente a esta organização devem ser expurgados de forma permanente e irreversível.

Em ambas as modalidades, o isolamento do tenant é respeitado (outras organizações do mesmo Owner não sofrem impacto) e os pedidos pendentes recebem o tratamento padrão de cancelamento.

**Regras aplicáveis:** RN017, RN020, RN027.

**Regras específicas:**

**RN029 — Confirmação destrutiva por digitação.** Para liberar a exclusão, o Owner digita o nome fantasia exato — padrão consagrado contra cliques acidentais.

**RN030 — Slug de organização excluída.** Os slugs dos storefronts da organização excluída entram em quarentena de 30 dias e depois são liberados, conforme regra do módulo de Storefront.

### 2.8. Limites do módulo na v1

A v1 **não inclui**: gestão centralizada de múltiplas organizações; governança avançada de titularidade com transferência de propriedade; múltiplos administradores (Owners) por organização; operação em rede com visão consolidada (multi-store); hierarquia administrativa agregada para o tenant; dashboard consolidado do negócio; exportação automatizada de dados em auto-serviço (atendida reativamente na v1); e auditoria detalhada de eventos do ciclo de vida.

### 2.9. Dependências

Política de Privacidade (pré-beta); serviço de armazenamento de imagens (logo); serviço de mensageria transacional (notificações); Equipe & Permissões (validação de acesso por papel); Produtos (categorias/atributos para replicação); Catálogos (slug, WhatsApp, configurações visuais e pré-requisitos de publicação); e Pedidos Online (cancelamento na desativação).

---

## Módulo 3 — Equipe & Permissões (RBAC)

**Objetivo:** Definir os papéis de acesso dentro de uma organização, o que cada papel pode fazer, e como o Owner gerencia os membros da equipe — incluindo o reaproveitamento de membros entre organizações do mesmo tenant.

**Atores que interagem com este módulo:**

- **Owner** — gerencia toda a equipe: adiciona, altera papéis, revoga e reativa acessos.
- **Manager e Sales** — sujeitos às permissões do seu papel; não gerenciam equipe.

### 3.1. Matriz de permissões

A v1 define três papéis hierárquicos e pré-definidos: **Owner**, **Manager** e **Sales**, com permissões cumulativas (Manager inclui Sales; Owner inclui Manager).

| Capacidade | Sales | Manager | Owner |
|------------|:-----:|:-------:|:-----:|
| Visualizar produtos e detalhes | ✓ | ✓ | ✓ |
| Visualizar movimentações | ✓ | ✓ | ✓ |
| Registrar baixa de estoque por venda | ✓ | ✓ | ✓ |
| Visualizar pedidos próprios | ✓ | ✓ | ✓ |
| Visualizar catálogos | ✓ | ✓ | ✓ |
| Visualizar clientes | ✓ | ✓ | ✓ |
| Criar, editar e inativar produtos | | ✓ | ✓ |
| Importar produtos de outra unidade | | ✓ | ✓ |
| Criar categorias | | ✓ | ✓ |
| Registrar movimentação manual (entrada/saída) | | ✓ | ✓ |
| Visualizar detalhes de movimentação | | ✓ | ✓ |
| Visualizar custos operacionais e faturamento do período | | ✓ | ✓ |
| Visualizar todos os pedidos | | ✓ | ✓ |
| Gerenciar todos os pedidos | | ✓ | ✓ |
| Gerenciar catálogos | | ✓ | ✓ |
| Gerenciar equipe | | | ✓ |
| Gerenciar clientes | | | ✓ |
| Editar configurações da organização | | | ✓ |
| Desativar/excluir organização | | | ✓ |
| Visualizar financeiro consolidado (margem, valor de inventário a custo) | | | ✓ |

Criar novas organizações não consta da matriz porque é ação de nível de tenant, não de organização — prerrogativa do Owner, exercida a partir de qualquer organização que ele possua (RN025).

**RN031 — Papéis e o Owner.** O Owner é o tenant e tem papel de Owner fixo em todas as organizações do seu negócio — não varia, pois é o dono de todas. Os demais membros (Manager e Sales) podem ter papéis distintos entre as organizações do mesmo tenant às quais pertencem (ex: Sales numa unidade, Manager em outra). As permissões aplicadas correspondem ao papel na organização ativa. O papel de Owner é exclusivo do tenant; nenhum membro pode assumi-lo.

**RN032 — Papéis pré-definidos e não customizáveis.** A v1 não permite criar papéis personalizados nem editar as permissões de cada papel.

**RN033 — Um login, um tenant.** Cada login (conta de usuário) pertence a um único tenant. Uma mesma pessoa que opere negócios distintos como tenants separados usa logins (e-mails) distintos — não há um login que transite entre tenants. O compartilhamento de uma pessoa entre organizações ocorre apenas dentro de um mesmo tenant, via replicação de membro (RF013).

### 3.2. RF012 — Adição de novo membro à equipe

**Como** Owner, **eu quero** adicionar uma pessoa à minha equipe **para** que ela opere na organização com o papel adequado.

**Comportamento esperado:** O Owner informa e-mail, nome e papel (Manager ou Sales) e define uma senha provisória. O sistema cria o vínculo no estado "convidado" e dispara e-mail informando a inclusão e a necessidade de definir nova senha no primeiro acesso (fluxo de first-access em RF005). No primeiro login, o membro troca a senha e passa a "ativo".

**Regras aplicáveis:** RN001 (senha), RN007 (e-mail único), RN015 (bloqueio até troca), RN031 (papel por organização).

**Regras específicas:**

**RN034 — E-mail já existente direciona para replicação.** Se o e-mail já pertence a um usuário que é membro de outra organização do mesmo tenant, o fluxo correto é a replicação (RF013). Se pertence a usuário de outro tenant, a adição é rejeitada (RN007).

### 3.3. RF013 — Replicação de membro entre organizações do mesmo tenant

**Como** Owner com múltiplas organizações, **eu quero** adicionar à organização atual alguém que já é membro de outra organização minha **para** evitar recadastrá-lo.

**Comportamento esperado:** Ao adicionar membro, o Owner pode "replicar de outra unidade" em vez de cadastrar novo. O sistema apresenta os membros das outras organizações do tenant (candidatos); o Owner seleciona a pessoa e define o papel nesta organização (que pode diferir do papel de origem). O vínculo é criado já "ativo" (o usuário já tem senha), e o membro é notificado por e-mail.

**Regras aplicáveis:** RN031.

**Regras específicas:**

**RN035 — Replicação compartilha identidade, não duplica.** A replicação cria apenas um novo vínculo entre o usuário existente e a organização destino, com o papel definido. Dados pessoais não são copiados (são do mesmo usuário). Não há aceite pelo membro, pois o vínculo é criado pelo Owner que ele já conhece.

### 3.4. RF014 — Gestão do ciclo de vida do membro

**Como** Owner, **eu quero** alterar papel, revogar ou reativar o acesso de um membro **para** manter minha equipe alinhada.

**Comportamento esperado:** O Owner vê a lista de membros com papéis e estados; pode promover Sales a Manager ou rebaixar Manager a Sales, inativar (revogando acesso, preservando dados históricos) e reativar. Membros inativados perdem acesso mas permanecem vinculados, preservando a rastreabilidade de movimentações e pedidos que registraram.

**Regras aplicáveis:** RN020 (apenas Owner), RN021 (Owner único), RN031.

**Regras específicas:**

**RN036 — Estados do membro.** Convidado (criado, sem primeiro acesso), ativo (operando) ou inativo (acesso revogado, dados preservados). Não há exclusão definitiva de membro na v1 — apenas inativação.

**RN037 — Invariantes do Owner.** O Owner não pode rebaixar-se, inativar-se nem transferir a propriedade (decorre de RN021). Nenhum membro pode ser promovido a Owner. A única forma de o Owner deixar de operar uma organização é desativando-a ou excluindo-a.

### 3.5. RF015 — Proteção de interface por permissão

**Como** usuário de qualquer papel, **eu quero** que meu ambiente de trabalho reflita estritamente as minhas permissões **para** garantir foco nas minhas atribuições operacionais e evitar interações não autorizadas.

**Comportamento esperado:** O sistema deve adaptar a disponibilidade das funcionalidades, módulos e ferramentas de acordo com a matriz de permissões do papel que o usuário exerce na organização ativa. Qualquer recurso para o qual o usuário não possua autorização explícita de acesso ou execução deve ser suprimido da sua jornada de trabalho. Este controle de acesso deve ser garantido de forma intransponível pelo sistema, independentemente da via de acesso do usuário.

**Regras aplicáveis:** Matriz de Permissões (3.1), RN017.

### 3.6. Nota de evolução — Permissões dinâmicas e roles customizáveis

Na v1, os papéis e permissões são fixos, como constantes no código (RN032), sem dívida técnica relevante — a camada de verificação abstrai a fonte das permissões. A evolução, atrelada ao app Admin, prevê dois graus: **Grau 1 — permissões dinâmicas**, com as permissões migrando para o banco, ativáveis e desativáveis por tenant (os três papéis permanecem); e **Grau 2 — roles customizadas** (em estudo), permitindo ao tenant criar papéis próprios. A arquitetura atual (catálogo de ações tipadas + mapa papel→permissões isolado) torna o Grau 1 de baixo atrito.

### 3.7. Limites do módulo na v1

A v1 **não inclui**: papéis customizados ou edição da matriz; permissões granulares por recurso individual; exclusão definitiva de membros; transferência de propriedade; múltiplos Owners por organização; fluxo de aceite/convite pelo membro; auditoria detalhada de eventos de equipe; e notificações configuráveis (a de adição é fixa).

### 3.8. Dependências

Autenticação (first-access, política de senha, e-mail único); Organizações (Owner único, apenas Owner gerencia, relação entre organizações do tenant); Pedidos Online (critério de "pedido próprio" — resolvido em RN082/RN088); Movimentações (tipos e relação com a permissão de registro); Provedor de e-mail (notificações).

---

## Módulo 4 — Produtos

**Objetivo:** Gerir o cadastro de produtos da organização — itens simples ou com variações em grade —, mantendo a identidade, os atributos e o custo de cada item, e servindo de base para o controle de estoque e para os catálogos.

**Atores que interagem com este módulo:**

- **Manager e Owner** — cadastram, editam, inativam produtos e gerenciam categorias.
- **Sales** — visualiza produtos e detalhes; não cadastra nem edita.

### 4.1. Regras transversais do módulo

**RN038 — SKU único por organização.** O SKU de um produto ou variante é único dentro da organização, não globalmente. Organizações distintas podem usar os mesmos códigos sem conflito.

**RN039 — Estoque inicial sempre zero.** Um produto recém-cadastrado nasce com estoque zero. Qualquer quantidade em estoque entra exclusivamente por uma movimentação de entrada (módulo de Movimentações), preservando a auditoria — não há "estoque inicial" digitado no cadastro.

**RN040 — Custo derivado das entradas; preço no catálogo.** O cadastro do produto não guarda preço de venda nem custo. O preço de venda pertence ao item de catálogo (módulo de Catálogos), permitindo que o mesmo produto tenha preços diferentes por canal. O custo é determinado pelas entradas de estoque — cada entrada registra o custo unitário da compra correspondente —, e o custo de referência do produto é o custo médio ponderado derivado dessas entradas (RN052), não um valor informado no cadastro.

**RN050 — Status do estoque derivado do saldo e do mínimo.** Cada item (produto ou variante) possui um campo de **estoque mínimo** (informado no cadastro; valor padrão 0). A partir do saldo atual e desse mínimo, o sistema deriva quatro status: **zerado** (saldo ≤ 0), **crítico** (saldo > 0 e ≤ mínimo), **atenção** (saldo > mínimo e ≤ mínimo × 1,25 — faixa de buffer) e **saudável** (saldo > mínimo × 1,25). Quando o estoque mínimo está em zero, valem apenas zerado (saldo ≤ 0) e saudável (saldo > 0). Para um produto com variantes, o status do produto é o pior caso entre as variantes (zerado > crítico > atenção > saudável). Esse status alimenta os indicadores operacionais (Dashboard e listagem de produtos) e, no storefront, é traduzido para o vocabulário do cliente final (RF030).

### 4.2. RF016 — Cadastro de produto

**Como** Manager ou Owner, **eu quero** cadastrar um produto, com ou sem variações estruturadas **para** disponibilizá-lo no inventário e torná-lo elegível para composição de catálogos.

**Comportamento esperado:** O sistema deve registrar a criação de novos itens no inventário através da coleta de dados estruturados (identificação, descritivo, categorização, imagens e parâmetros de reposição — entre eles, o **estoque mínimo** do item, base do cálculo de status conforme RN050). Para itens complexos, o sistema deve processar a definição de eixos de variação (atributos) e gerar automaticamente a matriz combinatória de SKUs (grade). Cada variante gerada atua operacionalmente como um item único, exigindo a atribuição de um identificador (SKU) exclusivo. Todo novo produto ou variante ingressa obrigatoriamente no sistema sem saldo de estoque.

**Regras aplicáveis:** RN038 (SKU único por org), RN039 (estoque zero), RN040, RN050 (status de estoque).

**Regras específicas:**

**RN041 — Desacoplamento de Atributos.** O sistema deve prover um repositório base de atributos para agilizar a padronização do catálogo. No entanto, ao associar um atributo a um produto, o vínculo deve ser consolidado de forma estática; alterações posteriores no repositório global não devem afetar ou sobrescrever os atributos de produtos previamente cadastrados.

**RN042 — Domínio de Dados de Atributo.** O motor de cadastro deve suportar a parametrização de atributos restritos aos seguintes domínios de dados: formato textual livre, numérico, seleção fechada (lista) e identificador visual de cor.

### 4.3. RF017 — Listagem e busca de produtos

**Como** membro da organização, **eu quero** listar e buscar produtos **para** localizar itens do inventário de forma rápida e eficiente.

**Comportamento esperado:** O sistema deve fornecer uma interface de consulta ao inventário que retorne exclusivamente os produtos pertencentes à organização ativa do usuário. O usuário deve ser capaz de refinar a listagem através de critérios de filtragem e de um mecanismo de busca flexível, capaz de localizar itens correspondentes tanto pela nomenclatura parcial ou exata (nome do produto) quanto pelo seu identificador único (SKU).

**Regras aplicáveis:** RN017 (isolamento).

**RN043 — Consolidação de saldo para itens em grade.** Ao apresentar a visão sumarizada (nível de produto) de um item que possui variações estruturadas, o sistema deve calcular e exibir em tempo real o estoque total, correspondente à soma exata dos saldos individuais de todas as suas variantes ativas.

### 4.4. RF018 — Edição de produto

**Como** Manager ou Owner, **eu quero** alterar as informações de um produto existente **para** manter o catálogo e os parâmetros de inventário atualizados em relação à realidade comercial.

**Comportamento esperado:** O sistema deve permitir a edição dos dados estruturados de um produto ou de suas variantes. Todas as políticas de obrigatoriedade, formatação e validação aplicadas no momento da criação do item permanecem vigentes durante o processo de atualização. Para garantir a confiabilidade do histórico, identificadores vitais são bloqueados para edição caso possuam vínculo com a operação em andamento.

**Regras aplicáveis:** RN038, RN040.

**Regras específicas:**

**RN044 — Imutabilidade de SKU atrelado a histórico.** O sistema deve bloquear qualquer tentativa de alteração do identificador único (SKU) de um produto ou variante que já possua registros prévios no módulo de Movimentações de Estoque. Esta restrição é absoluta e visa preservar a integridade referencial da auditoria e do cálculo de custo médio.

### 4.5. RF019 — Inativação de produto

**Como** Manager ou Owner, **eu quero** descontinuar um produto do inventário **para** impedir sua comercialização futura sem corromper os registros operacionais passados.

**Comportamento esperado:** A ação de remoção de um produto encerra o seu ciclo de vida comercial. O item descontinuado torna-se imediatamente inelegível para seleção em novas operações de balcão e é suprimido de todos os catálogos e listagens operacionais ativas. No entanto, o registro do item atua como uma âncora histórica e permanece acessível para consulta referencial.

**Regras aplicáveis:** RN017.

**Regras específicas:**

**RN045 — Soft delete de produto.** O sistema é impedido de expurgar o registro de qualquer produto que possua vínculo com movimentações de estoque ou histórico de pedidos. A descontinuação garante a imutabilidade do livro razão, preservando a rastreabilidade exata de toda a operação já realizada com o item.

### 4.6. RF020 — Gestão de categorias

**Como** Manager ou Owner, **eu quero** organizar produtos em categorias estruturadas **para** facilitar a localização no inventário e orientar a navegação nos catálogos de venda.

**Comportamento esperado:** O sistema deve prover um mecanismo para agrupar produtos através de categorias nomenclaturais. A criação e a vinculação de categorias devem ocorrer de forma fluida, podendo ser realizadas de forma autônoma ou de maneira simultânea ao fluxo de cadastro de um novo produto, sem interrupção da jornada do usuário. O sistema deve permitir a alteração da nomenclatura das categorias já existentes para correções.

**Regras aplicáveis:** RN020 (Gestão restrita a papéis gerenciais).

**Regras específicas:**

**RN046 — Retenção de Estrutura Categórica.** O sistema não deve permitir a exclusão definitiva de categorias previamente criadas. Esta restrição é imutável e visa garantir a consistência de relatórios de desempenho e a integridade da taxonomia de produtos já cadastrados ao longo do tempo.

### 4.7. RF021 — Importação de produtos entre organizações do tenant

**Como** Owner ou Manager com múltiplas organizações, **eu quero** importar a base de um produto de outra organização do meu domínio **para** agilizar a composição do inventário de uma unidade similar sem esforço de recadastramento.

**Comportamento esperado:** O sistema deve prover um mecanismo de transposição de dados de produtos entre organizações pertencentes ao mesmo tenant. Esta ação pode ser acionada a qualquer momento no ciclo de vida da organização de destino. Ao realizar a importação, o sistema gera uma nova entidade no inventário de destino utilizando os dados mestres da origem, exigindo que o usuário posteriormente configure o contexto comercial local (precificação em catálogos) para habilitar sua venda.

**Regras aplicáveis:** RN017 (isolamento — só entre organizações do mesmo tenant), RN038, RN039.

**Regras específicas:**

**RN047 — Isolamento de Contexto Comercial e Transacional.** O escopo da importação restringe-se exclusivamente aos dados estruturais, metadados e mídia do produto. Sob nenhuma hipótese o sistema deve transpor dados de contexto local da origem, tais como saldo de estoque, histórico de movimentações ou preços vinculados a catálogos. O produto importado nasce com estoque nulo.

**RN048 — Prevenção de Duplicidade de Importação** O sistema deve bloquear a reimportação de um mesmo produto de origem para uma mesma organização de destino, impedindo a poluição do inventário com clones desnecessários.

### 4.8. Limites do módulo na v1

Por decisão estratégica, a v1 **não inclui**: importação massiva de dados de inventário estruturado (via arquivos); controle de rastreabilidade avançada (validade, lote ou número de série - conforme RN047); expurgo definitivo de produtos ou categorias com histórico; hierarquia complexa de taxonomia (subcategorias); estruturação de produtos compostos ou kits; e suporte nativo à automação por leitura de códigos de barras.

**RN049 — Fungibilidade e Rastreabilidade Base.** A v1 não provê suporte lógico para o rastreamento individualizado de validade, lote ou número de série. O produto e suas variantes são tratados estritamente como itens fungíveis, possuindo um saldo único consolidado. A rastreabilidade avançada compõe a evolução estrutural do motor de estoque.

### 4.9. Dependências

Módulo de Movimentações (motor de entrada de estoque, cálculo de custo médio ponderado e validação de integridade referencial do SKU em relação ao histórico); Módulo de Catálogos (motor de precificação e curadoria de seleção para visibilidade comercial); Módulo de Organizações (estruturas de isolamento de tenant e repositório global de categorias e atributos para replicação); e Serviços de Infraestrutura (integração com serviço externo para armazenamento e otimização de imagens de produtos).

---

## Módulo 5 — Movimentações de Estoque

**Objetivo:** Registrar de forma auditável e imutável toda alteração de estoque — entradas e saídas qualificadas por motivo —, calcular o custo médio e manter o saldo confiável de cada item, servindo de motor de estoque para vendas e pedidos.

**Atores que interagem com este módulo:**

- **Manager e Owner** — registram movimentações manuais (entrada e saída) e visualizam o histórico completo, com custos.
- **Sales** — não registra movimentação manual; reduz estoque apenas por venda (balcão ou confirmação de pedido). Visualiza o histórico sem informações de custo.
- **Sistema** — gera movimentações automaticamente a partir de vendas e confirmações de pedido.

### 5.1. Regras transversais do módulo

**RN051 — Livro razão imutável.** Movimentações são registros imutáveis: uma vez gravadas, nunca são editadas nem apagadas. Correções são feitas exclusivamente por novas movimentações compensatórias. A integridade do histórico é absoluta — o livro razão apenas cresce.

**RN052 — Apenas dois tipos: entrada e saída.** A movimentação é de entrada (acréscimo) ou saída (decréscimo). Não existe um tipo "ajuste" próprio: correções de inventário e perdas são entradas ou saídas qualificadas pelo **motivo** (ex.: "Ajuste de Inventário", "Perda/Avaria").

**RN053 — Motivo obrigatório, com lista definida.** Toda movimentação exige um motivo, para fins de auditoria. A lista é fixa por tipo: **entradas** — Compra, Devolução de cliente, Ajuste de inventário (+) e Outro; **saídas** — Perda/Avaria, Devolução a fornecedor, Uso interno, Ajuste de inventário (−) e Outro. A escolha de "Outro" exige um texto descritivo obrigatório. O motivo **Venda** é gerado automaticamente pelo PDV e pela confirmação de pedidos online (RN066, RN087) e não aparece na lista de seleção manual.

### 5.2. RF022 — Registro de movimentação manual

**Como** Manager ou Owner, **eu quero** registrar entradas e saídas avulsas de estoque **para** manter a paridade entre o saldo do sistema e a realidade física da loja, de forma estritamente auditável.

**Comportamento esperado:** O sistema deve fornecer um meio para a inclusão manual de registros de alteração de inventário. O fluxo deve coletar obrigatoriamente a classificação da operação (entrada ou saída), o volume (quantidades), a justificativa (motivo da movimentação) e os itens afetados. Exclusivamente para operações de entrada, o sistema deve exigir o custo unitário da operação. Todo registro finalizado deve compor o livro razão do sistema, gerando um evento histórico imutável.

**Regras aplicáveis:** RN051 (imutável), RN052 (tipos), RN053 (motivo).

**Regras específicas:**

**RN054 — Impacto em custo médio ponderado.** As operações de entrada devem engatilhar o recálculo do custo médio ponderado do item afetado, impactando diretamente o valor contábil do inventário e a visão futura de margem. Operações de saída de estoque não devem provocar recálculo de custo.

**RN055 — Invariante de saldo não-negativo.** O sistema deve impedir de forma absoluta a conclusão de qualquer registro de saída cujo volume seja superior ao saldo disponível no momento da execução, impossibilitando a existência de estoque negativo. É também a base da resolução determinística de concorrência (RNF005): operações concorrentes sobre o mesmo item são resolvidas de forma previsível, e a que ultrapassaria o saldo falha.

**RN056 — Controle de acesso operacional.** O registro manual de movimentações (ajustes, perdas, entradas manuais) é uma ação gerencial restrita aos papéis Manager e Owner. O papel Sales não possui autorização para forçar saídas diretas, sendo seu impacto no estoque gerado de forma sistêmica e indireta (através do registro de uma venda confirmada).

### 5.3. RF023 — Consulta do histórico de movimentações

**Como** membro da organização, **eu quero** consultar o histórico de movimentações **para** auditar e entender a evolução do estoque.

**Comportamento esperado:** O sistema deve disponibilizar a consulta ao livro razão da organização, ordenada cronologicamente e refinável por critérios como produto, tipo, motivo, período e responsável. Cada registro deve expor a natureza da alteração: o que mudou, em que volume, por qual motivo, quando e por iniciativa de quem. A abrangência da informação exibida é condicionada ao papel do usuário (RN057).

**Regras aplicáveis:** RN017 (isolamento), RN051.

**Regras específicas:**

**RN057 — Visibilidade de custo por papel.** Informações de custo (custo unitário, custo médio, valor a custo) são visíveis apenas a Manager e Owner. O Sales acessa o histórico de quantidades e motivos, sem custos.

### 5.4. Nota de evolução — Estoque Avançado (Movimentações × Inventário)

A v1 trata o estoque como um livro razão de saldo único por item — suficiente para o varejo de roupas e petshop das personas. A evolução prevê a separação entre dois conceitos hoje unidos: **Movimentações** (o diário de lançamentos imutável, que permanece) e **Inventário** (a gestão de lotes, validade, número de série e a lógica FEFO — first-expired, first-out). Quando o Inventário existir, a entrada passa a registrar lote/validade, e a saída (venda, pedido) passa a decidir de qual lote consumir. Essa separação é também onde a Venda no Balcão (módulo 7) evolui para PDV completo. O rastreamento por lote/validade/série (RN049) pertence a essa fase.

### 5.5. Limites do módulo na v1

A v1 **não inclui**: tipo "ajuste" como categoria própria (é motivo de entrada/saída); lote, validade e número de série; FEFO/FIFO/LIFO; transferência de estoque entre organizações como movimentação dedicada; inventário cíclico ou contagem assistida; e custo por outro método além do médio ponderado.

### 5.6. Dependências

Produtos (itens, custo, integridade do SKU com histórico); Vendas no Balcão (saída por venda); Pedidos Online (reserva e saída na confirmação); Equipe & Permissões (papéis e visibilidade de custo); Dashboard (estoque baixo, valor de inventário).

---

## Módulo 6 — Catálogos

**Objetivo:** Definir catálogos — seleções de produtos com seus preços de venda — de forma independente de canal, de modo que um mesmo catálogo possa ser usado por qualquer canal de venda (o balcão e as vitrines online). Concentra a curadoria comercial (o que se vende e por quanto) num conceito reutilizável.

**Atores que interagem com este módulo:**

- **Manager e Owner** — criam, curam e gerenciam catálogos.
- **Sales** — visualiza catálogos (consulta), sem gerenciá-los.
- **Canais de venda** — o PDV (módulo 7) e os storefronts (módulo 8) consomem catálogos; não os definem.

### 6.1. Regras transversais do módulo

**RN058 — Catálogo como seleção de produtos com preços.** Um catálogo é uma seleção de produtos (e variantes) da organização, cada um com um preço de venda. O mesmo produto pode estar em vários catálogos com preços diferentes — o preço pertence ao item do catálogo, não ao produto (que não guarda preço de venda, conforme RN040).

**RN059 — Catálogo independente de canal.** O catálogo não tem tipo nem canal próprio: é apenas a seleção e a precificação. São os canais de venda que escolhem qual catálogo usar. Um mesmo catálogo pode ser usado por vários canais ao mesmo tempo — por exemplo, servir de base de preços do balcão e, simultaneamente, de uma ou mais vitrines online —, eliminando a necessidade de recriar a mesma seleção para cada canal.

**RN060 — Vínculo único de canal a catálogo.** Cada canal de venda (o PDV ou cada storefront) referencia exatamente um catálogo por vez. Um catálogo, por sua vez, pode ser referenciado por vários canais. Para praticar preços diferentes entre canais, usam-se catálogos diferentes; para praticar os mesmos, apontam-se os canais ao mesmo catálogo.

**RN061 — Remoção protegida por vínculo.** Um catálogo não pode ser removido enquanto houver canais de venda vinculados a ele; é preciso primeiro desvincular esses canais (apontando-os para outro catálogo ou removendo-os). Pedidos que referenciam um catálogo preservam o histórico independentemente da remoção.

**RN062 — Permissão de gestão.** Criar, editar, curar e remover catálogos é restrito a Manager e Owner. Todos os papéis podem visualizar catálogos para consulta.

### 6.2. RF024 — Gestão de catálogos

**Como** Manager ou Owner, **eu quero** criar e gerenciar os catálogos da minha organização **para** definir o que vendo e por quanto, de forma reutilizável entre os canais.

**Comportamento esperado:** O sistema deve permitir criar e manter catálogos, cada um identificado por um nome e composto pela curadoria de itens (RF025). Um catálogo não declara canal nem tipo na criação — é um canal de venda (PDV ou storefront) que, na sua própria configuração, escolhe qual catálogo usar. Catálogos podem ser editados a qualquer momento, refletindo nos canais que os utilizam. A remoção é bloqueada enquanto houver canais vinculados (RN061); pedidos que referenciam o catálogo preservam o histórico mesmo após a remoção (a referência é desfeita sem apagar o pedido).

**Regras aplicáveis:** RN058, RN059, RN060, RN061, RN062.

### 6.3. RF025 — Curadoria de produtos no catálogo

**Como** Manager ou Owner, **eu quero** selecionar quais produtos compõem um catálogo e a que preço **para** controlar a oferta e a precificação.

**Comportamento esperado:** O sistema deve permitir compor o catálogo selecionando produtos ou variantes da organização e definindo, para cada um, o preço de venda naquele catálogo. Cada item pode registrar um preço original além do preço vigente, para sinalizar promoção. A remoção de um item do catálogo não afeta o produto no inventário. A forma como cada canal apresenta esses itens — inclusive o destaque visual — é definida na configuração do próprio canal (ver Storefront, módulo 8).

**Regras aplicáveis:** RN058, RN060, RN062, RN017.

**Regras específicas:**

**RN063 — Preço obrigatório por item; promoção opcional.** Todo item adicionado a um catálogo exige um preço de venda. O preço original (para sinalizar desconto) é opcional. O preço definido aqui é o que vale na venda em qualquer canal que use o catálogo — no balcão (com desconto aplicável conforme módulo 7) e nas vitrines online.

### 6.4. Limites do módulo na v1

A v1 **não inclui**: regras de preço avançadas (faixas por quantidade, preço de atacado, tabelas progressivas); preço por canal sobre um mesmo catálogo (para preços distintos, usam-se catálogos distintos); versionamento ou histórico de alterações de preço; catálogos privados ou protegidos por senha; e agendamento de mudanças de catálogo.

### 6.5. Dependências

Produtos (produtos e variantes; o catálogo referencia o produto e define o preço de venda do item — o produto em si não guarda preço nem custo, conforme RN040); Vendas no Balcão e Storefront (canais que consomem catálogos); Pedidos Online (o pedido referencia o catálogo de origem).

---

## Módulo 7 — Vendas no Balcão (PDV)

**Objetivo:** Permitir o registro ágil de vendas presenciais, dando baixa no estoque de forma vinculada à venda, com preço vindo do catálogo vinculado ao PDV e desconto aplicável pelo vendedor — sem a fricção de identificação obrigatória do cliente.

**Atores que interagem com este módulo:**

- **Sales, Manager e Owner** — registram vendas no balcão.
- **Cliente final (presencial)** — não interage com o sistema; opcionalmente fornece nome e telefone, a critério dele.

### 7.1. Regras transversais do módulo

**RN064 — Venda de balcão é um pedido de canal presencial, imediato.** A venda de balcão é registrada como um pedido de canal presencial, que nasce diretamente no estado confirmado — sem passar por reserva ou pendência, pois o cliente está presente e leva o produto na hora. Isso a distingue do pedido online, que passa por reserva e confirmação (módulo de Pedidos Online).

**RN065 — Preço vem do catálogo vinculado ao PDV.** O PDV referencia um catálogo (escolhido na sua configuração), do qual vêm os preços praticados no balcão. Ter um catálogo vinculado ao PDV, com os produtos e seus preços, é pré-requisito para vender presencialmente — produtos ausentes desse catálogo não são vendáveis no balcão até serem adicionados a ele.

**RN066 — Baixa de estoque vinculada à venda.** Toda venda de balcão gera uma movimentação de saída (motivo "Venda") sobre os itens vendidos, consumindo o motor do módulo de Movimentações. A baixa respeita o bloqueio de estoque negativo (RN055).

**RN067 — Permissão de venda.** Registrar venda no balcão é permitido a Sales, Manager e Owner. Esta é a única forma pela qual o Sales reduz estoque (ele não registra movimentação manual, conforme RN056).

### 7.2. RF026 — Registro de venda no balcão

**Como** vendedor (Sales, Manager ou Owner), **eu quero** registrar uma venda presencial **para** dar baixa no estoque e registrar a saída de forma rápida, sem travar o atendimento.

**Comportamento esperado:** O sistema deve permitir registrar uma venda presencial compondo-a a partir dos itens do catálogo vinculado ao PDV e suas quantidades. O preço de cada item provém desse catálogo, admitindo a aplicação de desconto pelo vendedor. A identificação do cliente (nome e telefone) é opcional — a venda pode ser anônima. Ao ser confirmada, a venda nasce como um pedido presencial confirmado, gera a movimentação de saída correspondente (motivo "Venda") e, quando o telefone do cliente é informado, vincula ou cria o cliente e atualiza seu perfil na loja (total gasto, última compra).

**Regras aplicáveis:** RN064, RN065, RN066, RN067, RN055.

**Regras específicas:**

**RN068 — Cliente opcional, sem gargalo.** A identificação do cliente na venda de balcão é sempre opcional. Sem telefone, a venda é registrada sem cliente vinculado (consumidor final anônimo). Com telefone, o cliente é vinculado ou criado pelo telefone (CRM leve), e seu histórico de compras na loja é atualizado.

**RN069 — Desconto livre, integralmente registrado.** O vendedor pode aplicar desconto livre sobre o preço do catálogo, sem limite na v1. O preço de referência (do catálogo), o desconto aplicado e o preço final praticado são todos registrados, para auditoria do Owner. Limite de desconto por papel fica como evolução.

### 7.3. RF027 — Consulta de vendas do balcão

**Como** Manager ou Owner, **eu quero** consultar as vendas de balcão registradas **para** acompanhar o movimento presencial e auditar valores e descontos praticados.

**Comportamento esperado:** O sistema deve permitir consultar as vendas presenciais da organização, exibindo data, vendedor responsável, itens, valor de referência, desconto aplicado e valor final. O Sales visualiza as próprias vendas; Manager e Owner visualizam todas.

**Regras aplicáveis:** RN017, RN069.

### 7.4. Nota de evolução — PDV completo

A venda de balcão da v1 é deliberadamente simples: registra a venda e dá baixa no estoque, sem processar pagamento. A evolução prevista transforma este módulo num PDV completo, incorporando forma e processamento de pagamento, emissão de comprovante ou recibo, fechamento de caixa (abertura, sangria, conferência), e integração fiscal quando aplicável. Essa evolução acompanha a maturação do estoque (Movimentações → Inventário) descrita no Estoque Avançado: à medida que o estoque passa a rastrear lotes, a venda de balcão ganha a lógica de decidir de qual lote a saída ocorre (FEFO).

### 7.5. Limites do módulo na v1

A v1 **não inclui**: processamento de pagamento (a venda registra a saída, não a transação financeira); emissão de recibo ou comprovante; fechamento e conferência de caixa; estorno ou cancelamento de venda pela interface (correções via movimentação manual de ajuste por Manager ou Owner); limite de desconto por papel; e venda a prazo ou parcelamento.

### 7.6. Dependências

Catálogos (o catálogo vinculado ao PDV é a fonte de preço; pré-requisito para vender); Movimentações (saída por venda; bloqueio de estoque negativo); Produtos (itens do inventário); Pedidos Online (estrutura de pedido compartilhada; critério de "pedido próprio"); CRM (vínculo opcional por telefone).

---

## Módulo 8 — Storefront

**Objetivo:** Oferecer o canal de venda online: uma vitrine pública, acessível por URL própria, que apresenta um catálogo escolhido e permite ao cliente final navegar produtos, ver disponibilidade e status de funcionamento da loja, e iniciar um pedido ou um contato via WhatsApp — sem necessidade de login. O storefront define a própria identidade visual, contato e regras de exibição, e referencia o catálogo cujos produtos e preços apresenta.

**Atores que interagem com este módulo:**

- **Cliente final** — público externo, sem cadastro nem login, que acessa a vitrine pela URL pública, navega e decide pedir ou conversar.
- **Manager e Owner** — criam e configuram storefronts: identidade visual, contato, exibição, catálogo vinculado e publicação.

### 8.1. Regras transversais do módulo

**RN070 — Storefront como canal de venda online, vinculado a um catálogo.** O storefront é um canal de venda online. Cada storefront referencia exatamente um catálogo (RN060), do qual exibe produtos e preços, e define a própria apresentação. Uma organização pode ter múltiplos storefronts — para coleções, campanhas ou públicos distintos —, apontando para o mesmo catálogo ou para catálogos diferentes. O storefront não define conteúdo comercial; apenas apresenta o catálogo que referencia.

**RN071 — Acesso público via slug, sem login.** O storefront é acessível publicamente pela URL `inventto.app/{slug}`, sem autenticação. O cliente final não possui conta. O conteúdo exibido corresponde ao storefront identificado pelo slug e ao catálogo que ele referencia.

**RN072 — Slug: formação e unicidade global.** O slug é o identificador do storefront na URL (`inventto.app/{slug}`). Deve ser único em todo o sistema, conter apenas letras minúsculas, números e hífen, ter entre 3 e 50 caracteres, não começar nem terminar com hífen, e não corresponder a palavras reservadas do sistema. (Regra migrada do módulo de Organizações.)

**RN073 — Quarentena de slug.** Slug que deixa de ser usado por um storefront (alteração de slug ou remoção do storefront) permanece reservado por 30 dias antes de ser liberado para uso por outros tenants.

**RN074 — Estados do storefront.** Um storefront pode estar ativo (no ar, acessível pelo slug), inativo (despublicado — o acesso público exibe uma página de loja indisponível, e o storefront é preservado para republicação) ou removido (excluído, slug em quarentena). Storefronts de organização desativada ou excluída também ficam indisponíveis. Despublicar um storefront é o mecanismo da "pausa temporária de loja" descrita no ciclo de vida da organização.

### 8.2. RF028 — Configuração do storefront

**Como** Manager ou Owner, **eu quero** criar e configurar um storefront **para** ter uma vitrine online com a identidade da minha loja, apresentando o catálogo que eu escolher.

**Comportamento esperado:** O sistema deve permitir criar e manter storefronts. Cada storefront define: o catálogo que apresenta (RN070); o slug da URL; a identidade visual (paleta de cores, logotipo, imagem de capa e a forma de apresentação dos produtos); o comportamento de exibição (mostrar ou ocultar preços e produtos esgotados; marcação de itens em destaque); os canais de contato (WhatsApp de atendimento com mensagem pré-definida e links para redes sociais); e o estado de publicação. Essas definições determinam como a vitrine é apresentada ao cliente final.

**Regras aplicáveis:** RN070, RN071, RN072, RN073, RN074.

**Regras específicas:**

**RN075 — Pré-requisitos para publicação.** Para publicar um storefront, ele precisa ter um catálogo vinculado e um número de WhatsApp definido, e a organização precisa ter timezone e horário de funcionamento configurados (estes últimos exibidos na vitrine e usados no cálculo de expiração de reservas). A publicação é impedida enquanto esses dados não estiverem completos.

**RN076 — Exibição de preço configurável.** O storefront pode ser configurado para mostrar ou ocultar os preços dos produtos. Quando ocultos, o cliente é levado a iniciar contato (via pedido ou WhatsApp) para conhecer o valor — útil para lojistas que preferem negociar o preço no atendimento.

**RN077 — Destaque definido no storefront.** A marcação de produtos em destaque (maior proeminência na vitrine) pertence ao storefront, não ao catálogo. Storefronts diferentes que usam o mesmo catálogo podem destacar produtos diferentes.

### 8.3. RF029 — Navegação da vitrine pública

**Como** cliente final, **eu quero** navegar pelos produtos da loja **para** conhecer a oferta e decidir o que quero comprar.

**Comportamento esperado:** O cliente acessa a vitrine pela URL pública e navega pelos produtos do catálogo vinculado, apresentados conforme o tema configurado no storefront, com os itens marcados em destaque (RN077) recebendo maior proeminência. Pode consultar os detalhes de um produto (imagens, descrição e variantes) e selecionar a variante desejada. Havendo promoção, o preço original é apresentado junto ao preço vigente. Os preços são exibidos ou ocultados conforme a configuração do storefront (RN076). O cliente pode reunir uma seleção de itens para pedir de uma só vez.

**Regras aplicáveis:** RN070, RN071, RN076, RN077.

### 8.4. RF030 — Indicadores de disponibilidade e funcionamento

**Como** cliente final, **eu quero** saber se um produto está disponível e se a loja está atendendo **para** ter expectativa realista sobre o pedido.

**Comportamento esperado:** Cada produto exibe um indicador de disponibilidade, derivado do status de estoque (RN050) e traduzido para o vocabulário do cliente final: itens **zerados** aparecem como **esgotado**; itens em **crítico** (saldo > 0, no limiar do mínimo) aparecem como **últimas peças**; itens em **atenção** ou **saudável** aparecem como **disponível**. "Últimas peças" sinaliza escassez real ao cliente, não a zona de buffer operacional do lojista — distinção que preserva a credibilidade do indicador. Produtos esgotados são exibidos com o indicador ou ocultados, conforme a configuração do storefront. A vitrine também apresenta o status de funcionamento da loja — **aberto** ou **fechado** —, derivado do horário de funcionamento e do timezone da organização confrontados com o momento do acesso.

**Regras aplicáveis:** RN050 (status de estoque), RN070, dependência do estoque (módulo de Movimentações) e do horário/timezone (módulo de Organizações).

**Regras específicas:**

**RN078 — Status de funcionamento e comportamento fora do horário.** Quando a loja está fora do horário, o status é "fechado". A possibilidade de realizar pedido nesse estado depende da configuração "aceitar pedidos com a loja fechada" (Organizações): se habilitada, o cliente pode pedir mesmo fechada, e a reserva expira conforme o módulo de Pedidos; se desabilitada, a opção de realizar pedido fica indisponível enquanto fechada, restando o contato via WhatsApp.

### 8.5. RF031 — Iniciação de pedido e contato via WhatsApp

**Como** cliente final, **eu quero** poder fazer um pedido ou tirar dúvidas com a loja **para** concluir a compra do jeito mais conveniente.

**Comportamento esperado:** A vitrine oferece dois caminhos. Um conduz ao checkout, iniciando a captura de pedido detalhada no módulo de Pedidos Online (contato, endereço e forma de pagamento; reserva; notificação à equipe). O outro abre conversa direta de WhatsApp com o contato do storefront, com mensagem pré-definida, sem criar pedido formal — voltado a dúvidas e atendimento.

**Regras aplicáveis:** RN078, módulo de Pedidos Online.

**Regras específicas:**

**RN079 — Dois caminhos independentes de saída.** O caminho de pedido e o de conversa por WhatsApp são independentes. Ambos estão disponíveis com a loja aberta; o de pedido pode ficar indisponível com a loja fechada (RN078), enquanto o de conversa permanece, pois conversar não depende de horário. O contato por WhatsApp não gera pedido nem reserva.

### 8.6. Limites do módulo na v1

A v1 **não inclui**: login ou área do cliente; carrinho persistente entre sessões; avaliações ou comentários de produtos; busca avançada com filtros sofisticados; pagamento online na vitrine; domínio próprio (a URL é sempre `inventto.app/{slug}`); agendamento de publicação; múltiplos idiomas ou moedas; múltiplos layouts ou estilos de card da vitrine (a v1 entrega um único layout curado, com a identidade da loja personalizada via logo, paleta e capa); e recomendações ou personalização por cliente.

### 8.7. Dependências

Catálogos (o catálogo vinculado fornece os produtos e preços apresentados); Organizações (horário, timezone e regra de loja fechada; o ciclo de vida da organização afeta os storefronts); Produtos e Movimentações (estoque para os indicadores); Pedidos Online (recebe o caminho de "Realizar Pedido").

---

## Módulo 9 — Pedidos Online

**Objetivo:** Capturar pedidos originados no storefront público, reservando estoque temporariamente, notificando a equipe, e permitindo que os vendedores assumam, confirmem ou cancelem pedidos — convertendo a confirmação em saída de estoque auditável.

**Atores que interagem com este módulo:**

- **Cliente final** — preenche o checkout no storefront e cria o pedido, sem login.
- **Sales** — assume pedidos do pool, atende o cliente e confirma ou cancela os pedidos que assumiu.
- **Manager e Owner** — visualizam e gerenciam todos os pedidos da organização.
- **Sistema** — reserva estoque, calcula expiração, libera reservas vencidas, dispara notificações.

### 9.1. Regras transversais do módulo

**RN080 — Pedido online é um pedido de canal online, com reserva.** O pedido feito pela vitrine é registrado como um pedido de canal online, nascendo no estado pendente com uma reserva de estoque associada. Distingue-se da venda de balcão (canal presencial, imediata e já confirmada).

**RN081 — Pagamento não é processado.** A forma de pagamento informada (cartão, dinheiro ou pix) é apenas a intenção do cliente, para orientar o atendimento. A v1 não processa transação financeira; o pagamento acontece offline.

**RN082 — Pool comum e pedido próprio.** Pedidos do storefront nascem sem vendedor atribuído, num pool visível a todos os vendedores da organização. Quando um vendedor assume um pedido, torna-se o responsável, e o pedido passa a ser "próprio" dele. Manager e Owner veem e gerenciam todos os pedidos; o Sales vê os do pool e os que assumiu.

### 9.2. RF032 — Captura de pedido pelo storefront

**Como** cliente final, **eu quero** finalizar meu pedido informando meus dados **para** que a loja o receba e me atenda.

**Comportamento esperado:** Ao optar por realizar o pedido na vitrine (módulo 8), o cliente informa nome, telefone, endereço estruturado e forma de pagamento pretendida. No endereço, ao informar o código postal, o sistema preenche automaticamente logradouro, bairro, cidade e estado, restando número e complemento. Ao confirmar, o sistema cria o pedido (online, pendente) com seus itens e os preços do catálogo do storefront, reserva imediatamente o estoque, calcula o prazo de expiração, vincula ou cria o cliente pelo telefone (CRM leve) e disponibiliza o pedido no pool, com notificação à equipe em tempo real.

**Regras aplicáveis:** RN080, RN081, RN082.

**Regras específicas:**

**RN083 — Dados obrigatórios do checkout.** Nome, telefone, endereço e forma de pagamento são todos obrigatórios para finalizar o pedido. O telefone é a chave de vínculo e o canal de contato — cria ou vincula o cliente e atualiza seu perfil na loja. O endereço é necessário para viabilizar a entrega. A forma de pagamento é uma escolha obrigatória entre as opções disponíveis, ainda que a transação não seja processada e o pagamento ocorra offline (RN081).

**RN084 — Endereço estruturado.** O endereço é estruturado (CEP, logradouro, número, bairro, cidade, estado, complemento) e gravado junto ao pedido como registro do momento. A consulta por código postal preenche os campos; código postal inválido não bloqueia o preenchimento manual.

### 9.3. RF033 — Reserva de estoque e expiração

**Como** sistema, **eu preciso** reservar o estoque do pedido e liberá-lo se não for concluído **para** não travar inventário indefinidamente nem vender o que está comprometido.

**Comportamento esperado:** Na criação do pedido, o estoque dos itens é reservado — passa a contar como indisponível para outras vendas. Enquanto o pedido permanece no pool sem ser assumido, corre um prazo de expiração: pedidos criados em horário de funcionamento expiram em 2 horas; pedidos criados com a loja fechada expiram 2 horas após a próxima abertura, calculada pelo horário e timezone da organização. Um pedido que atinge o prazo sem ter sido assumido tem a reserva liberada automaticamente e o status alterado para expirado. Assumir o pedido encerra de vez essa contagem: o pedido assumido não expira mais por tempo, encerrando-se apenas por confirmação (vira saída) ou cancelamento (libera a reserva).

**Regras aplicáveis:** RN080, dependência do horário/timezone (Organizações) e da regra "aceitar pedidos com a loja fechada".

**Regras específicas:**

**RN085 — Prazo de expiração até ser assumido.** A expiração só se aplica a pedidos pendentes ainda não assumidos: o prazo corre a partir da criação e, se nenhum vendedor assumir o pedido dentro dele, a reserva é liberada e o pedido é marcado como expirado. Assumir o pedido interrompe a contagem em definitivo — a partir daí o pedido não expira mais por tempo, dependendo de confirmação ou cancelamento. Valores fixos na v1: 2 horas em horário de funcionamento; 2 horas após a próxima abertura quando o pedido é criado com a loja fechada. Prazo configurável fica como evolução.

**RN086 — Estoque reservado é indisponível.** Estoque sob reserva ativa não está disponível para outras vendas e é considerado nos indicadores de disponibilidade do storefront. A liberação ocorre na expiração, no cancelamento, ou na conversão em saída pela confirmação.

### 9.4. RF034 — Gestão de pedidos no painel

**Como** vendedor ou gestor, **eu quero** assumir, atender e concluir pedidos **para** transformar a intenção de compra em venda.

**Comportamento esperado:** O painel apresenta os pedidos conforme a visibilidade do papel — o Sales vê o pool e os pedidos que assumiu; Manager e Owner veem todos. Um vendedor assume um pedido do pool, tornando-se seu responsável, e pode contatar o cliente por WhatsApp a partir do painel, com mensagem pré-definida. Ao concluir a venda, confirma o pedido: a reserva é convertida em saída definitiva — gerando a movimentação de saída (motivo "Venda", vinculada ao pedido) e levando o pedido ao estado confirmado. Não se concretizando, o pedido é cancelado, liberando a reserva.

**Regras aplicáveis:** RN082, RN066, matriz de permissões.

**Regras específicas:**

**RN087 — Confirmação converte reserva em saída.** A confirmação consome a reserva e gera a movimentação de saída (motivo "Venda", vinculada ao pedido), de forma atômica. O cancelamento ou a expiração liberam a reserva sem gerar saída.

**RN088 — Gestão de pedido por papel.** O Sales pode assumir, confirmar e cancelar pedidos do pool e os que assumiu — a confirmação é a sua "baixa por venda" (coerente com RN056). Manager e Owner gerenciam qualquer pedido, inclusive os assumidos por outros. (Refina a linha "gerenciar pedidos" da matriz do RBAC: o Sales gerencia os próprios; Manager e Owner, todos.)

### 9.5. RF035 — Notificações de pedido

**Como** equipe da loja, **eu quero** ser avisada de pedidos novos e, principalmente, dos que estão prestes a expirar sem resposta **para** não perder vendas.

**Comportamento esperado:** Pedidos novos aparecem no painel em tempo real, com indicador de contagem — sem disparar e-mail, para não saturar a equipe no fluxo normal. O e-mail é reservado ao que exige resgate: um pedido que se aproxima do prazo sem ter sido assumido dispara um e-mail de alerta para o Owner e os Managers, para que alguém o assuma antes que a reserva seja liberada. Pedidos já assumidos não geram esse alerta — uma vez assumidos, não expiram por tempo.

**Regras aplicáveis:** RN082, dependência dos serviços de e-mail e de notificação em tempo real.

**Regras específicas:**

**RN089 — In-app para o fluxo, e-mail para a urgência.** Pedidos novos notificam apenas em tempo real, no app. E-mail é disparado exclusivamente para pedidos do pool que se aproximam do prazo sem terem sido assumidos, dirigido ao Owner e aos Managers. Não há e-mail por pedido novo, nem notificação automática ao cliente final na v1.

### 9.6. Nota de evolução — Distribuição automática e notificação ao cliente

Dois caminhos de evolução ficam registrados. O primeiro é a **distribuição automática de pedidos** entre vendedores, que substituiria o pool comum por atribuição automática — viável quando o sistema incorporar o conceito de disponibilidade do vendedor (turno, presença) e a lógica de redistribuição em caso de não-resposta, evitando pedidos "com dono ausente". O segundo é a **notificação automática ao cliente final** (confirmação, expiração, atualizações), que depende de um canal confiável — e-mail garantido ou integração com WhatsApp via API —, ambos fora da v1.

### 9.7. Limites do módulo na v1

A v1 **não inclui**: processamento de pagamento online; distribuição automática de pedidos; notificação automática ao cliente final; edição de itens do pedido pelo cliente após o envio; acompanhamento de status pelo cliente; prazo de reserva configurável; gestão de entrega/frete; expiração automática de pedidos já assumidos (uma vez assumido, o pedido depende de confirmação ou cancelamento manual); e devolução ou troca estruturada pós-venda.

### 9.8. Dependências

Storefront (origina o pedido); Catálogos (produtos e preços do catálogo do storefront); Movimentações (saída na confirmação; reserva sobre o saldo); Organizações (horário/timezone e regra de loja fechada para a expiração); Equipe & Permissões (visibilidade e gestão por papel); CRM (cliente por telefone); serviços de e-mail e de notificação em tempo real.

---

## Módulo 10 — Dashboard

**Objetivo:** Oferecer uma visão operacional rápida do estado da organização ao entrar no sistema — destacando o que precisa de atenção imediata, resumindo as vendas do período e mostrando a atividade recente — com atalhos para as ações mais frequentes.

**Atores que interagem com este módulo:**

- **Sales, Manager e Owner** — cada um vê o dashboard adaptado às suas permissões.

### 10.1. Regras transversais do módulo

**RN090 — Dashboard operacional, no escopo da organização ativa.** O dashboard prioriza informação acionável do dia a dia (o que precisa de atenção, atalhos para agir) em vez de análise histórica. Todos os dados referem-se à organização ativa; não há visão consolidada entre organizações na v1.

**RN091 — Conteúdo adaptado ao papel.** O dashboard exibe a cada usuário apenas o que sua permissão permite. O faturamento do período é visível a Manager e Owner — coerente com a visibilidade de custo operacional (RN057), já que o Manager toca a operação inteira. Permanecem exclusivas do Owner as informações financeiras consolidadas e sensíveis: margem e valor de inventário a custo. O Sales não vê o desempenho da loja — vê apenas as próprias vendas; e, na atenção imediata, só os alertas que pode acionar (pedidos), não os de estoque, que não tem permissão para resolver.

**RN092 — Tela inicial pós-login.** O dashboard é a tela inicial após o login, oferecendo a visão operacional de entrada no sistema.

### 10.2. RF036 — Visão de atenção imediata

**Como** membro da organização, **eu quero** ver imediatamente o que exige minha ação **para** não deixar vendas escaparem nem o estoque faltar.

**Comportamento esperado:** O sistema deve destacar três indicadores acionáveis: a quantidade de **pedidos pendentes** aguardando atendimento, com acesso direto ao painel de pedidos; a quantidade de **produtos zerados ou em status crítico** (ver RN050), com acesso direto à listagem filtrada; e a quantidade de **pedidos do pool perto de expirar ainda não assumidos** — recorte dos pendentes aproximando-se do prazo (RN085), com acesso direto à listagem ordenada por urgência. Cada indicador conduz diretamente ao ponto onde a ação é executada.

**Regras aplicáveis:** RN050 (status de estoque), RN085 (prazo de expiração), RN090, RN091, dependência de Pedidos Online e de Produtos/Movimentações.

### 10.3. RF037 — Resumo de vendas do período

**Como** membro da organização, **eu quero** ver um resumo das vendas recentes **para** acompanhar o desempenho da loja.

**Comportamento esperado:** O sistema apresenta o resumo de vendas em um gráfico interativo com seletor de período — últimos 7, 30 ou 90 dias (padrão 30) —, somando vendas de balcão e pedidos online confirmados. A métrica principal é o **faturamento** ao longo do período; uma métrica secundária mostra a **quantidade de vendas**. Este bloco é destinado a Owner e Manager (visão consolidada da operação); o Sales não vê o desempenho da loja — quando aplicável, recebe um indicador menor das próprias vendas do dia.

**Regras aplicáveis:** RN091, dependência de Vendas no Balcão e Pedidos Online.

### 10.4. RF038 — Atividade recente e atalhos

**Como** membro da organização, **eu quero** ver a atividade recente e acessar rapidamente as ações frequentes **para** manter o pulso da operação e agir sem navegar muito.

**Comportamento esperado:** O sistema apresenta uma lista compacta da atividade recente, adaptada ao papel. Para **Owner e Manager**, as últimas movimentações de estoque (data, produto, tipo, quantidade, motivo) com link para o histórico completo, e atalhos para *Registrar movimentação*, *Cadastrar produto* e *Nova venda no balcão*. Para **Sales**, as próprias últimas vendas e o atalho para *Nova venda no balcão*. O conteúdo do bloco reflete o que cada papel pode acionar.

**Regras aplicáveis:** RN090, RN091, dependência de Movimentações, Pedidos, Vendas no Balcão e Produtos.

### 10.5. Nota sobre a fase de UX/UI

Os três blocos descritos (atenção imediata, resumo de vendas, atividade e atalhos) compõem a v1 do Dashboard. O arranjo definido é **vertical em três níveis**, do topo (atenção) para a base (atividade), com adaptação responsiva: no mobile, os blocos empilham na ordem; em telas maiores, os dois primeiros podem ocupar duas colunas e o terceiro permanece em largura total. O detalhamento visual (proporções de cada card, tipografia, ícones) fica para o wireframe/protótipo.

### 10.6. Limites do módulo na v1

A v1 **não inclui**: gráficos de tendência, projeções ou comparativos entre períodos; relatórios exportáveis; rankings (produtos mais vendidos, desempenho por vendedor); dashboard consolidado entre organizações (depende do multi-store); métricas de margem e lucratividade avançadas; e personalização ou reordenação de widgets. Esses compõem o "dashboard analítico" previsto para evolução.

### 10.7. Dependências

Pedidos Online (pendentes e últimos pedidos); Produtos e Movimentações (estoque baixo/esgotado e últimas movimentações); Vendas no Balcão e Pedidos Online (resumo de vendas); Equipe & Permissões (adaptação por papel).

---

*Fim do documento. Especificação v1.0 — dez módulos, RF001–RF038, RN001–RN092.*