# Inventto — Descrição de Telas v1.0

*Companheiro da Especificação de Produto v1.0, do UX v0.1, do Mapa de Telas, da Matriz de Estados, da Microcopy, das Variações por Papel e do Design System. Alimenta o desenho visual/navegável.*

## Como usar este documento

Cada tela é **descrita** em nível de especificação — propósito, anatomia, inventário de UI, conteúdo literal, interações, estados, recortes por papel, acessibilidade e fronteiras —, para que o **desenho visual seja feito nas ferramentas próprias**. Aqui não se desenha; descreve-se o suficiente para desenhar bem.

Nada é inventado: cada tela costura os artefatos que já existem — **Mapa de Telas** (identidade, rota, papéis), **Matriz de Estados** (estados), **Variações por Papel** (recortes), **Microcopy** (textos) e **Design System** (componentes e tokens), citando a especificação (RF/RN).

A organização segue **a ordem do Mapa de Telas**: superfícies (Acesso & Shell → App interno → Vitrine pública), módulos dentro do App interno, e telas dentro de cada módulo.

## Template por tela

- **Superfície e contexto** — onde a tela vive e o que a envolve.
- **Propósito** — o que a tela faz no produto.
- **Acesso** — papéis com acesso.
- **Anatomia** — estrutura vertical no mobile, com mudanças no `lg`+.
- **Inventário de UI** — elementos visuais com referência ao DS.
- **Conteúdo e textos** — microcopy literal, com citação às chaves da Biblioteca.
- **Interações** — ações do usuário e o que acontece.
- **Estados (Matriz)** — vazio, carregando, erro, específicos.
- **Recorte por papel** — diferenças entre Owner, Manager e Sales.
- **Acessibilidade & responsividade** — pontos críticos.
- **Fora do escopo** — o que não entra nesta tela.
- **Refs** — RF/RN da spec, chaves da Microcopy, componentes do DS.

## Cobertura

### Superfície 1 — Acesso & Shell

| Módulo | Tela / padrão | Rota |
|---|---|---|
| 1.0. Auth Shell | Casca compartilhada das telas de acesso | — |
| 1.0.1. Padrão compartilhado | Step de Verificação por código (OTP) | — |
| 1.1. Acesso | Cadastro de conta (3 passos) | `/cadastro` |
| 1.1. Acesso | Login (com step 2 condicional) | `/login` |
| 1.1. Acesso | Recuperar senha | `/recuperar-senha` |
| 1.1. Acesso | Redefinir senha | `/redefinir-senha` |
| 1.1. Acesso | Primeiro acesso (2 passos) | `/primeiro-acesso` |
| 1.2. App Shell | Casca compartilhada do app autenticado | — |
| 1.3. Shell | Seletor / troca de organização + Dialog criar org | (menu do shell) |
| 1.4. Shell | Conta e perfil (nota de evolução) + Dialog: Alterar avatar + Dialog: Alterar senha | (dialogs sobre o shell) |

### Superfície 2 — App interno

| Módulo | Tela | Rota |
|---|---|---|
| 2.1. Organização | Configuração da organização | `/configuracoes` |
| 2.1. Organização | Modal: Desativar organização | (modal sobre `/configuracoes`) |
| 2.1. Organização | Modal: Excluir organização | (modal sobre `/configuracoes`) |
| 2.2. Equipe | Lista de membros | `/equipe` |
| 2.2. Equipe | Sheet: Adicionar / replicar membro | (sheet sobre `/equipe`) |
| 2.3. Produtos | Lista / busca de produtos | `/produtos` |
| 2.3. Produtos | Cadastro de produto (wizard 4 passos) | `/produtos/novo` |
| 2.3. Produtos | Edição de produto | `/produtos/:id` |
| 2.3. Produtos | Modal: Inativar produto | (modal sobre `/produtos` ou `/produtos/:id`) |
| 2.3. Produtos | Categorias | `/produtos/categorias` |
| 2.3. Produtos | Importar produtos | `/produtos/importar` |
| 2.4. Movimentações | Histórico de movimentações | `/movimentacoes` |
| 2.4. Movimentações | Sheet: Registrar movimentação | (sheet sobre `/movimentacoes` ou `/produtos`) |
| 2.5. Catálogos | Lista de catálogos | `/catalogos` |
| 2.5. Catálogos | Configurar catálogo | `/catalogos/:id` |
| 2.5. Catálogos | Curadoria de itens | `/catalogos/:id/itens` |
| 2.5. Catálogos | Modal: Remover catálogo | (modal sobre `/catalogos`) |
| 2.6. PDV | Nova venda no balcão | `/pdv` |
| 2.6. PDV | Consulta de vendas | `/pdv/vendas` |
| 2.7. Storefront | Vitrine pública | `inventto.app/{slug}` |
| 2.7. Storefront | Detalhe do produto | `inventto.app/{slug}/produto/:id` |
| 2.7. Storefront | Detalhe da variação | `inventto.app/{slug}/produto/:id/variacao/:variantId` |
| 2.7. Storefront | Carrinho | (sheet/drawer sobre a vitrine) |
| 2.7. Storefront | Checkout | `inventto.app/{slug}/pedido` |
| 2.7. Storefront | Confirmação de pedido | `inventto.app/{slug}/pedido/confirmado` |
| 2.8. Pedidos | Painel de pedidos | `/pedidos` |
| 2.8. Pedidos | Atendimento do pedido | `/pedidos/:id` |
| 2.8. Pedidos | Modal: Cancelar pedido | (modal sobre `/pedidos/:id`) |
| 2.9. Dashboard | Dashboard | `/` |

---

# Superfície 1 — Acesso & Shell

## 1.0. Auth Shell · casca compartilhada das telas de acesso

**Propósito.** Casca pré-autenticada que envolve todas as telas da seção 1.1. Garante consistência de marca, isolamento de escopo e reaproveitamento estrutural — sem sidebar, sem toggle de tema, sem sino de notificações.

**Aplica-se a.** Todas as telas listadas em 1.1.

**Anatomia (split-screen).**
- *Grid principal:* `grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full`.
- *Mobile (`< lg`):* painel esquerdo oculto (`hidden lg:flex`); painel direito ocupa tela inteira.
- *Desktop (`lg`+):* duas colunas iguais ocupam a viewport inteira.

**Painel esquerdo — Marca & Proposta de valor.**
- *Fundo:* token `--primary` (verde-pinho profundo).
- *Textura visual:* pattern SVG sutil (pontilhado ou malha geométrica de baixa opacidade) — profundidade sem poluir a leitura.
- *Logo do Inventto:* fixada no topo esquerdo (`absolute top-8 left-8`).
- *Bloco central (vertical stack, centralizado):*
  - `h1` **Philosopher 700**, `text-4xl` ou `text-5xl`, `text-primary-foreground`: **"Sua loja inteira em um só lugar."**
  - `p` **Montserrat 400**, `text-base`, `text-primary-foreground/80`, `leading-relaxed`: **"Estoque auditável, catálogos com preço e uma vitrine online que recebe pedidos direto no seu painel. Sem planilha, sem perder venda no WhatsApp."**
- *Rodapé do painel — lista de diferenciais* (`space-y-3`, ícone `CheckCircle2` em tom claro):
  - **"Controle de estoque que não mente"**
  - **"Vitrine pronta para vender pelo link"**
  - **"Equipe com permissões por papel"**

**Painel direito — Área de formulário.**
- *Fundo:* `--background`.
- *Container:* `flex items-center justify-center p-6 sm:p-12`.
- *Caixa de afunilamento:* `w-full max-w-md`.
- *Conteúdo interno:* varia por tela (definido em cada 1.1.x).

**Tokens e estilo.**
- Primária: `--primary`; foreground: `--primary-foreground`.
- Tipografia: Philosopher para `h1`/`h2`, Montserrat para corpo e UI.
- Raio: `--radius` (0.625rem) como `rounded-lg`.
- Foco: `focus-visible:ring-2 focus-visible:ring-primary`.

**Fora do escopo.** App Shell (descrita em 1.2); toggle de tema, sino, `UserNav` — só após login.

**Refs.** Spec: contexto pré-autenticação dos RFs 001–005. DS: tokens `--primary`, `--background`, `--ring`, `--radius`; fontes Philosopher e Montserrat; ícone `CheckCircle2`.

---

## 1.0.1. Padrão compartilhado · Step de Verificação por código (OTP)

**Propósito.** Padrão de UI reutilizado em três fluxos — Passo 3 do Cadastro, Passo 2 condicional do Login e Passo 2 do Primeiro Acesso. Não é tela própria nem rota — é um step embutido nas telas que o requerem.

**Anatomia do step.**
- *Ícone:* `MailOpen`, `size-12`, `text-primary`, em círculo `bg-primary/10 rounded-full p-4 mb-6 mx-auto w-fit`.
- *Cabeçalho centralizado:* `h2` Philosopher + `p` Montserrat `text-muted-foreground text-sm text-center mb-8`. Conteúdo varia por fluxo.
- *Slot OTP:* `InputOTP` com 6 slots numéricos, `max-w-xs mx-auto flex justify-center gap-2`, `autoFocus`.
- *CTA primária:* `Button` default `w-full size="lg" mt-6`. Rótulo varia por fluxo. Loading: `Loader2`.
- *Ação contextual:* `Button` ghost `w-full text-sm text-muted-foreground` — **"Não recebeu? Reenviar código"** com cooldown de 45s.

**Inventário de UI.** `InputOTP` (6 slots) · `Button` (default + ghost) · `Loader2` · ícone `MailOpen`.

**Interações.**
- Foco automático no primeiro slot ao montar.
- Avanço automático entre slots; backspace volta um slot.
- Submit automático ao preencher 6 dígitos.
- Paste: aceita colar o código completo.
- Reenviar: nova chamada, reinicia contador de 45s; toast **"Novo código enviado."**

**Estados.**
- *Vazio inicial:* slots em branco, foco no primeiro.
- *Erro — código incorreto/expirado:* bordas `--destructive` + texto **"Código inválido ou expirado. Tente novamente."** + entrada limpa.
- *Enviando:* CTA com `Loader2`; slots `disabled`.
- *Reenvio em cooldown:* botão `disabled` com contador no rótulo.

**Acessibilidade.** `aria-label` por slot; suporte a paste e leitores de tela; foco visível.

**Refs.** **RF003**, **RN003**. Microcopy: §1. **A adicionar:** `auth.otp.invalid_or_expired`, `auth.otp.resent`. DS: `InputOTP`, `Button`, `Loader2`, ícone `MailOpen`.

---

## 1.1. Telas de Acesso

### 1.1.1. Cadastro de conta · `/cadastro` (fluxo em 3 passos)

**Superfície e contexto.** Acesso & Shell — pré-autenticação, envolvida pelo Auth Shell (1.0).

**Propósito.** Criar a conta e a organização inicial. Quem se cadastra nasce Owner. Fluxo em 3 passos: negócio → dados pessoais/credenciais → verificação OTP.

**Acesso.** Público.

**Anatomia (mobile, ~390px).** Cartão `w-full max-w-md` no painel direito do Auth Shell.
- *Topo:* indicador de passo `"Passo X de 3"` em `text-xs text-muted-foreground`.
- *Cabeçalho:* `h2` Philosopher + `p` Montserrat — varia por passo.
- *Corpo:* formulário (Passos 1 e 2) ou Step OTP (Passo 3).
- *Ações:* CTA primária `Button` default `w-full size="lg"` + botão secundário "Voltar" (Passos 2 e 3) + rodapé contextual (Passo 1).

**Passo 1 — Informações da organização.**
- **Nome fantasia** (`Input`) · placeholder *"Ex: Loja Inventto Matriz"*.
- **Documento (CPF ou CNPJ)** (`Input`) · placeholder *"000.000.000-00 ou 00.000.000/0000-00"* · máscara dinâmica.
- **Área de atuação** (`Select`) · opções: Vestuário & Moda · Petshop · Alimentação & Bebidas · Eletrônicos · Prestação de Serviços · Outros.
- CTA: **"Avançar"**.
- Rodapé: **"Já tenho conta. Entrar"** (link `/login`).

**Passo 2 — Dados de acesso.**
- **Nome completo** (`Input`) · placeholder *"Ex: Joana Ribeiro"*.
- **E-mail** (`Input type="email"`) · placeholder *"voce@email.com"*.
- **Senha** (`Input type="password"` + `Eye`/`EyeOff`) · helper: *"Mínimo de 8 caracteres, contendo letra maiúscula, minúscula, número e caractere especial."*
- **Confirmar senha** (`Input type="password"` + ícone) · placeholder *"Digite a senha novamente"*.
- **Checkbox** Termos de Uso e Política de Privacidade.
- CTA: **"Continuar"** (loading: **"Enviando código…"**).
- Microcopy auxiliar: *"Em seguida, enviaremos um código de verificação para o seu e-mail."*
- Botão secundário: **"Voltar para a etapa anterior"**.

**Passo 3 — Verificação por código.** Usa Step OTP (1.0.1).
- Cabeçalho: **"Verifique seu e-mail"** + **"Enviamos um código de 6 dígitos para [e-mail mascarado]. Digite-o abaixo para ativar sua conta."**
- CTA: **"Ativar minha conta"** (loading: **"Ativando…"**).
- Botão secundário: **"Voltar para a etapa anterior"**.

**Inventário de UI.** Indicador de passo · 2× `Input` + `Select` (Passo 1) · 3× `Input` + wrappers de senha + `Checkbox` (Passo 2) · Step OTP completo (Passo 3) · `Button` primário · `Button` ghost (voltar) · link para `/login`.

**Interações.**
- *Passo 1 → 2:* valida localmente + transição horizontal suave.
- *Passo 2 → 3:* valida + cria conta pendente (RN003) + envia código. Se e-mail já cadastrado (RN007): resposta idêntica visualmente.
- *Passo 3 → sucesso:* valida OTP → ativa conta → navega para `/`.
- *Voltar:* preserva valores; ao voltar do Passo 3, conta pendente descartada.

**Estados (Matriz).**
- *Passo 1:* validação inline de documento (§7) e campos obrigatórios.
- *Passo 2:* senha fraca, senhas divergentes, termos não aceitos. Enviando: CTA com `Loader2`.
- *Passo 3:* estados do Step OTP (1.0.1). Sucesso: navega para `/` com toast **"E-mail verificado. Bem-vindo ao Inventto!"**

**Recorte por papel.** — (pré-autenticação).

**Acessibilidade & responsividade.** `htmlFor` em todos os inputs · `aria-describedby` nos helpers · foco move para o primeiro campo/slot ao transicionar entre passos · indicador de passo lido por leitores de tela.

**Fora do escopo.** Login social · slug da vitrine (definido em Storefront) · configurações avançadas da org (em `/configuracoes`) · captcha.

**Refs.** **RF001**, **RF003**, **RN003**, **RN006**, **RN007**, **RN009**, **RN018**. Microcopy: §7. DS: Auth Shell, Step OTP (1.0.1), `Input`, `Select`, `Checkbox`, `Button`, `Loader2`, ícones `Eye`/`EyeOff`.

---

### 1.1.2. Login · `/login` (com step 2 condicional)

**Superfície e contexto.** Acesso & Shell — pré-autenticação, Auth Shell (1.0).

**Propósito.** Autenticar usuário cadastrado. Se o e-mail estiver pendente de verificação, completa a verificação via Step OTP condicional — em vez de bloquear com erro.

**Acesso.** Público.

**Anatomia (mobile, ~390px).** Cartão no painel direito. Em situação normal: um passo. Quando e-mail pendente: transiciona para Passo 2 no mesmo cartão.

**Passo 1 — sempre presente.**
- **E-mail cadastrado** (`Input`) · placeholder *"voce@email.com"*.
- **Senha de acesso** (`Input type="password"` + `Eye`/`EyeOff`) · label com link **"Esqueceu a senha?"** à direita → `/recuperar-senha`.
- CTA: **"Entrar no sistema"** (loading: **"Entrando…"**).
- Rodapé: **"Não tem uma conta? Cadastre-se"** (link `/cadastro`).

**Passo 2 — condicional (e-mail pendente).** Usa Step OTP (1.0.1).
- Cabeçalho: **"Confirme seu e-mail"** + **"Você precisa confirmar seu e-mail para acessar. Enviamos um código de 6 dígitos para [e-mail mascarado]."**
- CTA: **"Confirmar e entrar"** (loading: **"Verificando…"**).
- Botão secundário: **"Voltar para o e-mail"**.

**Inventário de UI.** `Input` (e-mail) · wrapper de senha · link "Esqueceu a senha?" · `Button` primário · link `/cadastro` · Step OTP (Passo 2 condicional).

**Interações.**
- *Submit Passo 1:* credenciais inválidas → erro neutro; credenciais válidas + e-mail verificado → navega para `/`; credenciais válidas + e-mail pendente → envia código + transiciona para Passo 2.
- *Submit Passo 2:* valida OTP → ativa e-mail → navega para `/`.

**Estados (Matriz).**
- *Erro neutro (RN002):* **"E-mail ou senha incorretos."** — nunca revela qual falhou.
- *Anti-força-bruta (RN005):* mensagem genérica + bloqueio temporário após N tentativas.
- *Passo 2:* estados do Step OTP (1.0.1).

**Recorte por papel.** — (pré-autenticação).

**Acessibilidade & responsividade.** `htmlFor` em inputs · erro associado via `aria-describedby` · Enter como submit · foco move para o primeiro slot do OTP ao transicionar.

**Fora do escopo.** Login social · "Lembrar de mim" · 2FA.

**Refs.** **RF002**, **RF003**, **RN002**, **RN003**, **RN004**, **RN005**. Microcopy: §1. DS: Auth Shell, Step OTP (1.0.1), `Input`, `Button`, `Loader2`, ícones `Eye`/`EyeOff`.

---

### 1.1.3. Recuperar senha · `/recuperar-senha`

**Superfície e contexto.** Acesso & Shell — pré-autenticação, Auth Shell (1.0).

**Propósito.** Recuperação autônoma de credenciais. O usuário informa o e-mail; o sistema responde de forma neutra, sem confirmar nem negar a existência da conta.

**Acesso.** Público.

**Anatomia (mobile, ~390px).** Cartão de objetivo único.
- *Cabeçalho:* `h2` Philosopher **"Recuperar senha"** + `p` Montserrat *"Digite seu e-mail de cadastro e enviaremos as instruções para você redefinir sua senha de acesso."*
- *Campo:* **"E-mail cadastrado"** (`Input`) · placeholder *"voce@email.com"*.
- *CTA:* **"Enviar instruções de redefinição"** (loading: **"Enviando…"**).
- *Link:* **"Voltar para o Login"** (`Button` link).

**Inventário de UI.** `Input` + `Label` · `Button` primário · `Button` link · feedback pós-submit (Card ou Toast neutro).

**Conteúdo e textos.** Feedback unificado pós-submit (RN002): **"Se houver uma conta associada a este endereço de e-mail, as instruções de redefinição foram enviadas."**

**Interações.** Submit: valida formato → chama API → exibe feedback unificado substituindo o formulário — mesmo resultado visual para e-mail existente e inexistente.

**Estados (Matriz).** Vazio inicial · validação inline (e-mail inválido/vazio) · enviando (`Loader2`) · sucesso unificado.

**Recorte por papel.** — (pré-autenticação).

**Fora do escopo.** Recuperação por SMS · pergunta secreta.

**Refs.** **RF004**, **RN002**. Microcopy: §1. DS: Auth Shell, `Input`, `Button`, `Loader2`.

---

### 1.1.4. Redefinir senha · `/redefinir-senha`

**Superfície e contexto.** Acesso & Shell — pré-autenticação, Auth Shell (1.0). Acesso por token de uso único recebido por e-mail.

**Propósito.** Permitir ao usuário definir uma nova senha ao chegar pelo link de redefinição.

**Acesso.** Por token (URL recebida por e-mail).

**Anatomia (mobile, ~390px).** Cartão centrado.
- *Cabeçalho:* `h2` **"Defina sua nova senha"** + `p` *"Crie uma senha forte para proteger sua conta."*
- **Nova senha** (`Input type="password"` + `Eye`/`EyeOff`) · helper de regra.
- **Confirmar nova senha** (`Input type="password"` + ícone).
- CTA: **"Redefinir senha"** (loading: **"Salvando…"**).
- Link: **"Voltar para o Login"**.

**Inventário de UI.** 2× wrapper de senha · `Button` primário · `Button` link.

**Interações.** Submit: valida regra + equivalência → troca senha → navega para `/login` com toast **"Senha redefinida. Faça login com suas novas credenciais."**

**Estados (Matriz).** Vazio inicial · validação inline (senha fraca, senhas divergentes) · token inválido/expirado: estado de erro com **"Link expirado ou inválido. Solicite uma nova redefinição."** + botão **[Recuperar senha de novo]** — formulário não é exibido · enviando (`Loader2`) · sucesso: navega para `/login`.

**Recorte por papel.** — (pré-autenticação).

**Acessibilidade & responsividade.** Token validado no carregamento; se inválido, tela inteira muda para estado de erro.

**Fora do escopo.** Histórico de senhas / não-repetição.

**Refs.** **RF004**, **RN001**, **RN012**, **RN013**. Microcopy: §1. DS: Auth Shell, `Input`, `Button`, `Loader2`, ícones `Eye`/`EyeOff`.

---

### 1.1.5. Primeiro acesso · `/primeiro-acesso` (fluxo em 2 passos)

**Superfície e contexto.** Acesso & Shell — sessão temporária do membro convidado, Auth Shell (1.0).

**Propósito.** Tela bloqueante para membros recém-adicionados (estado "convidado") definirem senha e confirmarem e-mail. Acesso ao app interno bloqueado até completar os dois passos.

**Acesso.** Apenas usuário em estado "convidado" (criado por Owner via RF012).

**Anatomia (mobile, ~390px).** Cartão no painel direito. Indicador de passo no topo.

**Passo 1 — Definir senha.**
- Cabeçalho: **"Defina sua senha"** + **"Sua organização te convidou para o Inventto. Crie sua senha para ativar o acesso."**
- 2× wrapper de senha (Nova senha + Confirmar) com `Eye`/`EyeOff` e helper de regra.
- CTA: **"Continuar"** (loading: **"Salvando…"**).

**Passo 2 — Verificação por código.** Usa Step OTP (1.0.1).
- Cabeçalho: **"Confirme seu e-mail"** + **"Enviamos um código de 6 dígitos para [e-mail mascarado]. Digite-o abaixo para ativar seu acesso."**
- CTA: **"Ativar meu acesso"** (loading: **"Ativando…"**).
- Botão secundário opcional: **"Voltar para a senha"**.

**Sucesso final.** Toast **"Acesso ativado. Bem-vindo!"** + navega para `/`.

**Inventário de UI.** Indicador de passo · 2× wrapper de senha (Passo 1) · Step OTP completo (Passo 2) · `Button` primário.

**Interações.**
- *Passo 1:* valida senhas → atualiza senha → envia código → transiciona para Passo 2.
- *Passo 2:* valida OTP → ativa membro (convidado → ativo) → navega para `/`.
- *Sem opção de sair:* enquanto convidado, bloqueia qualquer rota interna.

**Estados (Matriz).** Passo 1: validação inline (senha fraca, divergentes) · enviando. Passo 2: estados do Step OTP (1.0.1). Sucesso: navega para `/`.

**Recorte por papel.** Apenas membros em estado "convidado". Membro replicado (RN037) não passa por esta tela — entra ativo.

**Acessibilidade & responsividade.** Labels e helpers associados · indicador de passo lido por leitores de tela.

**Fora do escopo.** Definição/edição de papel aqui · recuperação se perder o link (coberto por `/recuperar-senha` quando ativo).

**Refs.** **RF005**, **RF003**, **RN001**, **RN003**, **RN015**. Microcopy: §1. DS: Auth Shell, Step OTP (1.0.1), `Input`, `Button`, `Loader2`, ícones `Eye`/`EyeOff`.

---

## 1.2. App Shell · casca compartilhada do app autenticado

**Propósito.** Casco persistente que envolve todas as rotas internas (Superfície 2). Provê navegação adaptada ao papel, troca de contexto organizacional, notificações in-app e acesso ao perfil.

**Aplica-se a.** Todas as rotas da Superfície 2.

**Anatomia (mobile, ~390px).**
- *Layout raiz:* `flex flex-col min-h-screen`.
- *Mobile (`< lg`):* TopBar (`h-14`) + área de conteúdo `flex-1 overflow-auto`. Navegação como drawer lateral ou menu bottom.
- *Desktop (`lg`+):* Sidebar fixa à esquerda (`w-64`, fundo `--sidebar-background`) + área de conteúdo `flex-1 overflow-auto` à direita.

**TopBar.**
- *Fundo:* `--background` com `border-b border-border`.
- *Esquerda (mobile):* botão `Menu`/`X` para abrir/fechar drawer.
- *Direita:* `Bell` com badge de contagem de notificações + `UserNav` (avatar/iniciais + dropdown com "Conta e perfil" e "Sair").

**Sidebar (desktop) / Drawer (mobile).**
- *Topo:* Org Switcher (1.3).
- *Corpo:* itens de navegação filtrados por papel (RF015) — o que não pertence ao papel não aparece.
- *Item ativo:* destaque com `--sidebar-accent`; `aria-current="page"`.

**Itens de navegação por papel.**

| Item | Rota | Sales | Manager | Owner |
|---|---|---|---|---|
| Dashboard | `/` | ✓ | ✓ | ✓ |
| Produtos | `/produtos` | ✓ (leitura) | ✓ | ✓ |
| Movimentações | `/movimentacoes` | ✓ (leitura) | ✓ | ✓ |
| Catálogos | `/catalogos` | ✓ (leitura) | ✓ | ✓ |
| Pedidos | `/pedidos` | ✓ | ✓ | ✓ |
| PDV | `/pdv` | ✓ | ✓ | ✓ |
| Equipe | `/equipe` | — | — | ✓ |
| Configurações | `/configuracoes` | — | — | ✓ |

**Central de notificações (painel do `Bell`).**
- `Sheet` ou `Popover` ao clicar no sino.
- Alerta de novo pedido: **"Novo pedido recebido."** + timestamp + **[Ver pedido]**.
- Alerta de estoque crítico/zerado: **"Estoque baixo em {n} produto(s)."** + **[Ver produtos]**.
- Estado vazio: **"Sem novidades."**

**Estados (Matriz).**
- *Sessão expirada (RN004):* qualquer rota redireciona para `/login` preservando destino.
- *Rota sem permissão:* redirect silencioso para `/` (RF015, RN002).
- *Rota 404:* mensagem de não-encontrado + botão de retorno ao Dashboard.
- *Falha ao carregar dados do shell:* skeleton nos itens afetados + "Tentar de novo".

**Acessibilidade & responsividade.** Sidebar/drawer navegável por teclado · `aria-current="page"` no item ativo · `Bell` com `aria-label="Notificações"` e badge acessível · `focus-visible:ring-2`.

**Fora do escopo.** Auth Shell (pré-login) · toggle de tema escuro (pós-v1) · busca global (pós-v1).

**Refs.** **RF015**, **RF008**, **RF035**, **RN002**, **RN004**, **RN010**, **RN011**, **RN091**. DS: tokens `--sidebar-*`, `--background`, `--border`; `Button`, `Sheet`, `Badge`; ícones `Bell`, `Menu`, `X`, `User`; `UserNav` [a construir].

---

## 1.3. Seletor / troca de organização · (menu do shell)

**Superfície e contexto.** Acesso & Shell — componente do App Shell, encaixado no topo da sidebar/drawer. Não é rota autônoma.

**Propósito.** Visualizar a organização ativa e alternar entre organizações sem recarregar a página (RF008). Owner vê também a opção de criar organização.

**Acesso.** Qualquer papel autenticado. Owner vê item "Criar organização"; Manager e Sales não.

**Anatomia (sidebar, ~240px).**
- *Trigger:* `Button` combobox `w-full`. Mostra: ícone/inicial da org + nome em `font-medium text-sm` + papel em `text-xs text-muted-foreground` + `ChevronsUpDown` à direita.
- *Popover/Command aberto:*
  - `Input` com `Search` — filtra a lista em tempo real.
  - Lista de organizações: nome + papel + `Check` na ativa.
  - `Separator`.
  - Item **"Criar organização"** com ícone `Plus` — **Owner only** → abre Dialog de criação.

**Estado com uma única org (Manager/Sales).** Trigger estático, sem chevron, sem popover.

**Interações.**
- *Selecionar org diferente:* invalida queries com `organization_id` → carrega dados da nova org sem recarregar → persiste localmente (RN010) → fecha popover.
- *Selecionar org já ativa:* fecha sem ação.
- *"Criar organização" (Owner):* abre Dialog de criação (abaixo).

**Estados (Matriz).**
- *Uma única org (Manager/Sales):* trigger estático.
- *Falha ao trocar:* toast **"Não foi possível trocar de organização. Tente de novo."**
- *Carregando após troca:* skeleton nas áreas da nova org.

---

#### Dialog: Criar organização *(abre sobre o Org Switcher — sem rota própria)*

**Propósito.** Permitir que o Owner crie uma nova organização sem sair do contexto atual (RF006 + RF009).

**Anatomia.** `Dialog` centralizado, `max-w-md`.
- *Título:* **"Nova organização"**
- *Campos:*
  - **Nome fantasia** (`Input` + `Label`) — obrigatório. Placeholder: *"Ex: Loja Shopping Norte"*.
  - **Documento (CPF/CNPJ)** (`Input` + `Label`, máscara dinâmica).
- *Seção opcional "Copiar configurações"* (aparece se Owner tem ≥ 1 outra org):
  - `Switch` **"Copiar configurações de outra unidade"** — desligado por default.
  - Quando ligado: `Select`/`Command` **"Organização de origem"** + 3× `Checkbox`: **"Categorias e atributos"** · **"Configurações operacionais"** · **"Configurações visuais de catálogo"** (todas marcadas por default).
  - Helper: *"Estoque, produtos, equipe e pedidos nunca são copiados."*
- *Rodapé:*
  - `Button` outline: **"Cancelar"**.
  - `Button` default: **"Criar organização"** (loading: **"Criando…"**).

**Interações.** Submit: cria → (se replicação) copia grupos → troca contexto para nova org → navega para `/configuracoes` → fecha Dialog. Cancelar: fecha sem persistir.

**Estados.** Criando: `Loader2` · Sucesso: toast **"Organização criada."** + redirect · Erro de validação: inline por campo · Erro ao criar: toast de erro.

**Refs.** **RF006**, **RF008**, **RF009**, **RN010**, **RN020**, **RN025**, **RN029**. DS: `Dialog`, `Input`, `Switch`, `Select`/`Command`, `Checkbox`, `Button`, `Loader2`.

---

## 1.4. Conta e perfil · *(nota de evolução — v1 parcial)*

> **Status da v1.** A tela `/conta` como rota autônoma não faz parte do escopo da v1. As ações disponíveis para o usuário sobre a própria conta são acessadas diretamente pelo `UserNav` no Top Header, via Dialog. Quando a tela completa for implementada (pós-v1), deverá incorporar também edição de nome, e-mail e preferências de notificação.

**O que existe na v1 — dois Dialogs acessados pelo `UserNav`:**

---

#### Dialog: Alterar avatar *(abre sobre qualquer rota autenticada)*

**Propósito.** Permitir ao usuário fazer upload de uma foto de perfil com recorte livre, garantindo que o resultado seja adequado ao formato circular do avatar.

O Dialog opera em **dois estados sequenciais** — seleção e recorte — dentro do mesmo overlay, sem fechar entre eles.

---

**Estado 1 — Seleção.** (`max-w-sm`)
- *Cabeçalho:* título **"Alterar Foto de Perfil"** + descrição *"Faça o upload de uma nova imagem para seu perfil."*
- Preview circular do avatar atual centralizado (`size-24`) — foto se disponível, iniciais como fallback.
- `Button` outline centralizado com ícone `Upload`: **"Carregar foto"** — abre seletor de arquivo. Aceita JPG, PNG e WEBP até 5MB.
- Helper abaixo do botão: *"Suporta JPG, PNG e WEBP até 5MB."* em `text-xs text-muted-foreground`.
- *Rodapé:* `Button` outline **"Cancelar"** — fecha o Dialog sem ação. Sem botão de confirmar neste estado.

---

**Estado 2 — Recorte.** (`max-w-lg` — Dialog expande ao entrar neste estado)
- *Cabeçalho:* título **"Alterar Foto de Perfil"** + descrição *"Faça o upload de uma nova imagem para seu perfil."* (mantidos).
- Área de recorte (`crop area`): imagem selecionada exibida em largura total com máscara circular sobreposta indicando o recorte resultante. O usuário pode arrastar a imagem para reposicioná-la dentro da máscara.
- `Slider` de zoom abaixo da área de recorte: ícone `ZoomOut` à esquerda + `Slider` + ícone `ZoomIn` à direita. Controla o nível de aproximação da imagem.
- Helper abaixo do slider: *"Arraste e zoom para ajustar a miniatura do perfil."* em `text-xs text-muted-foreground`.
- *Rodapé:* `Button` outline **"Trocar Imagem"** (volta ao Estado 1 sem fechar o Dialog) + `Button` default **"Salvar Avatar"** (loading: **"Salvando…"**).

---

**Inventário de UI.** `Dialog` (expande de `max-w-sm` para `max-w-lg` ao transicionar) · preview circular · `Button` outline (carregar foto) · crop area com máscara circular [componente a construir ou biblioteca — ex: `react-easy-crop`] · `Slider` · `Button` outline (trocar imagem) + `Button` default (salvar avatar) · `Loader2`.

**Conteúdo e textos.**
- Título: **"Alterar Foto de Perfil"**.
- Descrição: *"Faça o upload de uma nova imagem para seu perfil."*
- Botão upload: **"Carregar foto"**.
- Helper formato: *"Suporta JPG, PNG e WEBP até 5MB."*
- Helper recorte: *"Arraste e zoom para ajustar a miniatura do perfil."*
- CTA salvar: **"Salvar Avatar"** / loading: **"Salvando…"**
- Sucesso: toast **"Avatar atualizado."** (§5).
- Erro: toast **"Não foi possível salvar. Tente de novo."** (§5).

**Interações.**
- *"Carregar foto":* abre seletor de arquivo → ao selecionar: Dialog expande + imagem carregada na área de recorte (Estado 2).
- *Arrastar imagem:* reposiciona dentro da máscara circular.
- *`Slider` de zoom:* aproxima ou afasta a imagem na área de recorte.
- *"Trocar Imagem":* volta ao Estado 1 (Dialog retrai para `max-w-sm`) sem fechar o overlay.
- *"Salvar Avatar":* gera o recorte final → faz upload para Cloudinary (RN026) → fecha Dialog → avatar no `UserNav` atualiza em tempo real → toast de sucesso.
- *"Cancelar" (Estado 1):* fecha sem ação.

**Estados.**
- *Estado 1 inicial (sem foto):* preview com iniciais + botão "Carregar foto".
- *Estado 1 com foto existente:* preview com a foto atual + botão "Carregar foto".
- *Estado 2 (recorte):* imagem na área de recorte + slider de zoom.
- *Salvando:* "Salvar Avatar" com `Loader2`, área de recorte bloqueada.
- *Arquivo inválido (formato/tamanho):* toast **"Use JPG, PNG ou WEBP até 5MB."** — permanece no Estado 1.
- *Sucesso:* fecha + toast + avatar atualizado.
- *Erro ao salvar:* toast de erro + Dialog permanece no Estado 2.

**Fora do escopo.** Remoção de foto (pós-v1 — na v1 o usuário substitui por uma nova) · filtros ou ajustes de imagem · formatos além de JPG/PNG/WEBP.

**Refs.** RN026 (Cloudinary). Microcopy: §5. DS: `Dialog`, `Button`, `Slider`, `Loader2`; crop area [a construir — `react-easy-crop` ou equivalente]; ícones `Upload`, `ZoomIn`, `ZoomOut`.

---

#### Dialog: Alterar senha *(abre sobre qualquer rota autenticada)*

**Propósito.** Permitir ao usuário autenticado alterar sua senha sem passar pelo fluxo de recuperação.

**Anatomia.** `Dialog` centralizado, `max-w-sm`.
- **Senha atual** (`Input type="password"` + `Eye`/`EyeOff`) + `Label`.
- **Nova senha** (`Input type="password"` + `Eye`/`EyeOff`) + `Label` + helper: *"Mínimo de 8 caracteres, contendo letra maiúscula, minúscula, número e caractere especial."*
- **Confirmar nova senha** (`Input type="password"` + ícone) + `Label`.
- *Rodapé:* `Button` outline **"Cancelar"** + `Button` default **"Salvar senha"** (loading: **"Salvando…"**).

**Interações.** "Salvar senha": valida regra de senha + equivalência entre nova e confirmação + valida senha atual → atualiza → fecha Dialog → toast **"Senha alterada."**

**Estados.** Senha atual incorreta: erro inline **"Senha atual incorreta."** · Nova senha fraca: erro inline (§7) · Senhas divergentes: **"As senhas não coincidem."** · Salvando: CTA com `Loader2` · Sucesso: fecha + toast · Erro inesperado: toast de erro.

**Refs.** **RN001** (política de senha). Microcopy: §5, §7. DS: `Dialog`, `Input`, `Label`, `Button`, `Loader2`; ícones `Eye`, `EyeOff`, `Lock`.

---

# Superfície 2 — App interno

## Layout da aplicação interna · casca estrutural

Esta seção descreve a estrutura visual e de navegação que envolve todos os módulos da Superfície 2. Não é uma tela — é o esqueleto persistente dentro do qual cada módulo é renderizado.

---

### L.1. Root Wrapper · `SidebarProvider`

Provedor de estado global que encapsula toda a aplicação interna.

- Define o estado expandido/colapsado da sidebar.
- **Fundo global:** `bg-zinc-50` (modo claro) / token equivalente (modo escuro) — cria contraste sutil com a área de conteúdo branca do `SidebarInset`.

---

### L.2. Barra lateral · `Sidebar`

Componente de navegação fixo à esquerda, `w-64`, `h-screen`.

**Logo do sistema.**
- Contêiner `flex items-center gap-2 p-2`.
- Ícone do Inventto + tipografia da marca.

**Seletor de contexto — Org Switcher.**
- Componente: `DropdownMenu` acionado por botão trigger.
- *Trigger:* avatar quadrado `rounded-md` + nome da organização com `truncate` + papel do usuário `text-xs text-muted-foreground` + ícone `ChevronsUpDown`.
- *Conteúdo do dropdown:*
  - `Input` de busca: placeholder *"Buscar organização…"*
  - Label **"Minhas Organizações"** `text-xs font-medium text-muted-foreground`.
  - Lista de organizações como `DropdownMenuItem`. A org ativa recebe ícone `Check`.
  - `DropdownMenuSeparator`.
  - Item **"Criar Organização"** com ícone `Plus` — **Owner only** (RF006, RF009). Clique abre Dialog de criação em overlay (sem navegar de rota — ver 1.3).

**Conteúdo da sidebar · `SidebarContent`.**

Navegação dividida em grupos (`SidebarGroup`) com rótulos (`SidebarGroupLabel`). Itens usam `SidebarMenuButton`. Item da rota atual recebe `isActive` — fundo de destaque + `font-medium`.

Itens visíveis variam por papel (RF015 — o que não pertence ao papel não aparece no DOM).

| Grupo | Item | Ícone | Sales | Manager | Owner |
|---|---|---|---|---|---|
| **OPERAÇÃO** | Dashboard | `LayoutDashboard` | ✓ | ✓ | ✓ |
| | Pedidos | `ClipboardList` | ✓ | ✓ | ✓ |
| | Venda no balcão | `ShoppingCart` | ✓ | ✓ | ✓ |
| **INVENTÁRIO** | Produtos | `Package` | ✓ | ✓ | ✓ |
| | Movimentações | `ArrowRightLeft` | ✓ | ✓ | ✓ |
| | Catálogos | `Layers` | ✓ | ✓ | ✓ |
| | Vitrines | `Store` | — | ✓ | ✓ |
| **ADMINISTRAÇÃO** | Equipe | `Users` | — | — | ✓ |
| | Organização | `Settings` | — | — | ✓ |

---

### L.3. Área de conteúdo principal · `SidebarInset`

Palco principal onde os módulos são renderizados. Cria efeito de "cartão flutuante" sobre o fundo do `SidebarProvider`.

**Estilização.**
- Fundo branco `bg-background`.
- Afastamento da sidebar e das bordas via `m-2` — cria respiro visual.
- Bordas arredondadas `rounded-xl` ou `rounded-2xl`.
- Borda sutil `border border-border` + sombra leve `shadow-sm`.

*Mobile:* margens e arredondamentos removidos — 100% da tela. Sidebar transforma-se em `Sheet` (drawer) acessível via botão hambúrguer.

**Cabeçalho superior (Top Header).**
Fixado no topo do `SidebarInset`: `h-16 flex items-center justify-between px-4 border-b`.

- *Lado esquerdo:*
  - `SidebarTrigger` — botão abrir/fechar sidebar (ícone de menu).
  - `Separator` vertical fino.
  - `Breadcrumb` (shadcn/ui nativo) — caminho atual. Ex.: *Início › Equipe*.
- *Lado direito* (`flex items-center gap-3`):
  - **Notificações:** `Button` ghost com ícone `Bell`. Badge laranja `absolute top-1 right-1` quando há notificações não lidas.
  - **`UserNav`:** `DropdownMenu` acionado por trigger horizontal composto:
    - Avatar circular `rounded-full` — exibe a foto de perfil do usuário se disponível; exibe as iniciais do nome sobre fundo verde suave como fallback quando não há foto.
    - Bloco de texto ao lado: nome completo em `font-medium text-sm` + nome da organização ativa em `text-xs text-muted-foreground` abaixo.
    - *Dropdown expandido:*
      - Header não-clicável: nome completo + e-mail em `text-xs text-muted-foreground`.
      - `DropdownMenuSeparator`.
      - Item **"Alterar avatar"** (ícone `ImageIcon`) → abre Dialog de upload de avatar.
      - Item **"Alterar senha"** (ícone `Lock`) → abre Dialog de alteração de senha.
      - `DropdownMenuSeparator`.
      - Item **"Sair do sistema"** (ícone `LogOut`, `text-destructive`) → encerra sessão → redireciona para `/login`. Ação direta, sem confirmação modal.

**Área de renderização · `main`.**
- `flex-1` — ocupa o restante da altura útil.
- Padding interno padronizado: `p-6` ou `p-8`.
- Controle de largura máxima para telas ultra-largas quando necessário.

---

**Refs.** **RF015** (guards de navegação por papel), **RF008** (Org Switcher), **RF035** (notificações), **RN002**, **RN010**, **RN091**. DS: `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenuButton`, `SidebarInset`, `SidebarTrigger`; `DropdownMenu`, `Breadcrumb`, `Separator`, `Sheet`, `Dialog`; ícones `LayoutDashboard`, `ClipboardList`, `ShoppingCart`, `Package`, `ArrowRightLeft`, `Layers`, `Store`, `Users`, `Settings`, `ChevronsUpDown`, `Check`, `Plus`, `Bell`, `ImageIcon`, `Lock`, `LogOut`.

---

## 2.1. Módulo: Organização

### 2.1.1. Configuração da organização · `/configuracoes`

**Superfície e contexto.** App interno — dentro do App Shell.

**Propósito.** Permitir ao Owner visualizar e manter os dados da organização ativa: identidade, endereço, configurações operacionais, horários e ações de ciclo de vida (RF007).

**Acesso.** Exclusivo do **Owner** (RF007, RN020).

**Anatomia (mobile, ~390px).**
- *Cabeçalho:* `h1` Philosopher **"Configurações"** + nome da org em `text-sm text-muted-foreground`.
- *Tabs:* **Loja · Operacional · Horários · Danger Zone**.
- *Barra de ações:* **"Salvar alterações"** (default) + **"Descartar"** (outline) — visíveis apenas com alterações pendentes.

No `lg`+: coluna centralizada `max-w-2xl`.

**Tab: Loja.**
- *Logo:* área de upload (preview circular + **"Trocar logo"**) — PNG/JPG/WEBP, Cloudinary em background (RN026).
- *Nome fantasia* (`Input`) — editável.
- *Identidade fiscal (somente leitura — RN018):* bloco `bg-muted rounded-lg p-4` com Documento e Razão social. Helper: *"Para alterar a identidade fiscal, crie uma nova organização."*
- *Endereço (RN028):* CEP com autopreenchimento ViaCEP (`onBlur`) + Logradouro, Número, Complemento, Bairro, Cidade, Estado. CEP inválido: toast **"CEP não encontrado. Preencha o endereço manualmente."** (§6).

**Tab: Operacional.**
- **Timezone** (`Select`) — default `America/Sao_Paulo`.
- **Aceitar pedidos com a loja fechada** (`Switch`) — helper: *"Quando ativado, a vitrine aceita pedidos mesmo fora do horário de funcionamento, com aviso ao cliente."*

**Tab: Horários.**
- Grade de 7 linhas (Seg–Dom): `Switch` de ativação do dia + dois `Input type="time"` (abertura e fechamento) quando ativado.
- Helper: *"Os horários controlam o status da vitrine para os clientes."*

**Tab: Danger Zone.**
- Bloco `border border-destructive rounded-lg p-6`.
- `h2` **"Zona de risco"** em `text-destructive`.
- *Desativar organização:* descrição + `Button` outline destructive **"Desativar"** → Modal 2.1.2.
- *Excluir organização:* descrição + `Button` destructive **"Excluir"** → Modal 2.1.3.

**Inventário de UI.** `Tabs` (4 items) · `Input`, `Label`, helpers · área de upload de logo [a construir] · bloco somente leitura · `Switch` · `Select` · grade de horários · `Button` salvar + descartar · Danger Zone com 2 ações. Ícones: `Upload`, `Clock`, `TriangleAlert`.

**Conteúdo e textos.** Salvo: **"Alterações salvas."** (§5) · Erro: **"Não foi possível salvar. Tente de novo."** (§5) · CEP: **"CEP não encontrado. Preencha o endereço manualmente."** (§6).

**Interações.** Qualquer edição: habilita botões · Salvar: persiste todas as tabs · Descartar: reverte sem confirmação · Upload de logo: preview atualiza imediatamente, sobe em background, URL inserida no estado pendente · CEP: spinner durante chamada ViaCEP.

**Estados (Matriz).** Carregando: skeleton · Sem alterações: botões ocultos/desabilitados · Salvando: CTA com `Loader2` · Upload em andamento: "Salvar" desabilitado até concluir.

**Recorte por papel.** Exclusivo do Owner.

**Acessibilidade & responsividade.** Labels em todos os inputs · bloco somente leitura com `aria-readonly="true"` · Danger Zone com `role="region" aria-label="Zona de risco"` · tabs navegáveis por teclado.

**Fora do escopo.** Transferência de propriedade (pós-v1) · slug e WhatsApp (módulo Catálogos).

**Refs.** **RF007**, **RF010**, **RF011**, **RN018**, **RN019**, **RN020**, **RN026**, **RN028**. Microcopy: §5, §6. DS: `Tabs`, `Input`, `Switch`, `Select`, `Button`, `Loader2`; ícones `Upload`, `Clock`, `TriangleAlert`; tokens `--destructive`, `--muted`.

---

### 2.1.2. Modal: Desativar organização *(sobre `/configuracoes`, tab Danger Zone)*

**Propósito.** Confirmar a desativação temporária da organização (RF010).

**Anatomia.** `Dialog` `max-w-md`.
- `TriangleAlert` em `text-destructive` centralizado.
- Título: **"Desativar {nome fantasia}?"**
- Consequências: catálogos saem do ar · Manager e Sales perdem acesso · pedidos pendentes cancelados e estoque liberado · **"Você pode reativar quando quiser."** (em `text-muted-foreground`).
- Rodapé: `Button` outline **"Cancelar"** + `Button` destructive **"Desativar"**.

**Interações.** "Desativar": executa → toast **"Organização desativada."** (§5). "Cancelar" ou clique fora: fecha sem ação.

**Estados.** Executando: `Loader2` · Erro: toast + Dialog permanece aberto.

**Refs.** **RF010**, **RN020**, **RN030**, **RN031**. Microcopy: §3, §5.

---

### 2.1.3. Modal: Excluir organização *(sobre `/configuracoes`, tab Danger Zone)*

**Propósito.** Confirmação destrutiva antes de encerrar permanentemente a organização (RF011). Exige digitação do nome fantasia para liberar o botão (RN032).

**Anatomia.** `Dialog` `max-w-md`.
- `CircleX` em `text-destructive` centralizado.
- Título: **"Excluir {nome fantasia}?"**
- Aviso: **"Esta ação encerra permanentemente esta unidade. Os catálogos saem do ar e a organização some do seu painel."**
- Checkbox opcional: **"Também excluir permanentemente todos os dados desta organização."** + helper LGPD.
- Campo de confirmação: helper *"Para confirmar, digite **{nome fantasia}** abaixo."* + `Input`.
- Rodapé: `Button` outline **"Cancelar"** + `Button` destructive **"Excluir organização"** (desabilitado até campo bater exatamente).

**Interações.** Digitação: compara em tempo real; ao bater exato, habilita botão. "Excluir": executa → toast **"Organização excluída."** → redirect.

**Estados.** Campo vazio/divergente: botão desabilitado · Campo exato: botão habilitado · Executando: `Loader2` · Erro: toast + Dialog aberto.

**Refs.** **RF011**, **RN020**, **RN032**, **RN033**. Microcopy: §3. DS: `Dialog`, `Checkbox`, `Input`, `Button`, `Loader2`; ícones `TriangleAlert`, `CircleX`.

---

## 2.2. Módulo: Equipe & Permissões

### 2.2.1. Lista de membros · `/equipe`

**Superfície e contexto.** App interno — dentro do App Shell.

**Propósito.** Dar ao Owner visibilidade sobre a equipe da organização ativa e permitir gerenciar papel e estado de cada membro diretamente na tabela (RF014).

**Acesso.** Exclusivo do **Owner** (RF015).

**Anatomia (mobile, ~390px).**
- *Cabeçalho:* `h1` **"Gerenciar equipe"** + `p` *"Gerencie de forma centralizada os membros da sua equipe."* + `Button` default **"+ Adicionar Membro"** → abre Sheet (2.2.2).
- *Barra de filtros:* `Input` busca *"Buscar membros por nome ou e-mail"* + `Select` **"Todas as funções"** + `Select` **"Todos os status"**.
- *Tabela* (`Table`).
- *Rodapé:* paginação padrão.

**Colunas da tabela.**

| Coluna | Conteúdo |
|---|---|
| **Membro** | Avatar + nome em `font-medium` + e-mail em `text-xs text-muted-foreground`. Label *"(Você)"* ao lado do nome do Owner logado. |
| **Função** | `Badge` com papel atual (valor salvo) + `Select` de função + `Button` **"Alterar Função"** |
| **Status** | `Badge` com estado atual (valor salvo) + `Select` de status + `Button` **"Alterar Status"** |

**Lógica dos controles inline.**
- *Estado inicial:* `Select` exibe o valor atual; botão desabilitado (texto fantasma).
- *Ao selecionar valor diferente:* botão ativa (fundo `--primary`).
- *Badge à esquerda:* mostra sempre o **valor salvo** enquanto o select exibe a seleção pendente.
- *Ao clicar no botão ativo:* persiste → botão volta a desabilitado → badge atualiza → toast **"Alterações salvas."** (§5).
- *Ao reverter o select ao valor original:* botão volta a desabilitado.

**Restrições (RN039).**
- Owner logado: sem `Select` nem botão — apenas badge **"Dono"** e **"Ativo"**.

**Opções dos Selects.**
- *Função:* **Gerente · Vendedor** (Dono não é opção — RN039).
- *Status:* **Ativo · Inativo** (Convidado é estado de sistema, não selecionável).

**Inventário de UI.** `h1` + `p` + `Button` · `Input` busca + 2× `Select` filtro · `Table` · por linha editável: `Badge` + `Select` + `Button` (×2) · paginação. Ícones: `UserPlus`, `Search`, `ShieldCheck`, `ShieldHalf`, `User`.

**Conteúdo e textos.** Título: **"Gerenciar equipe"** · Busca sem resultado: **"Nenhum membro encontrado para '{termo}'."** · Salvo: toast **"Alterações salvas."** · Erro: toast **"Não foi possível salvar. Tente de novo."**

**Estados (Matriz).** Carregando: skeleton · Busca sem resultado: mensagem inline · Alteração pendente: badge mostra salvo, select mostra pendente, botão ativo · Salvando: `Loader2` + select bloqueado · Sucesso: badge atualiza + botão desabilitado + toast · Erro: toast + select reverte.

**Recorte por papel.** Exclusivo do Owner.

**Acessibilidade & responsividade.** `scope="col"` nos cabeçalhos · badges com texto · `Select` com `aria-label="Alterar função de {nome}"` · botão desabilitado com `aria-disabled="true"`.

**Fora do escopo.** Histórico de alterações (pós-v1) · exclusão definitiva (apenas inativação).

**Refs.** **RF014**, **RF015**, **RN020**, **RN038**, **RN039**. Microcopy: §5, §8. DS: `Table`, `Badge`, `Select`, `Button`, `Input`, `Loader2`.

---

### 2.2.2. Sheet: Adicionar membro *(sobre `/equipe`)*

**Propósito.** Adicionar novo membro ou replicar membro de outra org do tenant (RF012 + RF013).

**Acesso.** Exclusivo do **Owner**.

**Anatomia.** `Sheet` da direita, `max-w-md`.
- *Cabeçalho:* **"Adicionar membro"** + *"Preencha os dados do novo integrante da equipe."*
- **Nome completo** (`Input`) — com autosugestão (ver comportamento).
- **E-mail** (`Input type="email"`) — readonly se replicação.
- **Função** (`Select`) — **Gerente · Vendedor** (Owner não atribuível — RN039).
- **Senha provisória** (`Input type="password"` + `Eye`/`EyeOff`) — presente e obrigatório apenas no fluxo de novo membro; desabilitado e suprimido no fluxo de replicação.
- *Rodapé:* `Button` ghost **"Cancelar"** + `Button` default **"Enviar convite"** / **"Replicar membro"**.

**Comportamento de autosugestão no campo Nome.**
- Ao digitar: busca em background nos membros das outras orgs do tenant que **não pertencem à org ativa**.
- *Sugestão encontrada:* `Popover` com nome + e-mail em `text-xs`. Ao selecionar:
  - Nome e E-mail ficam `readonly` (com botão `X` para limpar).
  - Senha provisória desabilitada + helper *"Senha não necessária — este usuário já tem acesso ativo."*
  - CTA muda para **"Replicar membro"**.
  - Descrição do cabeçalho: *"Este usuário já pertence a outra unidade do seu negócio."*
- *Sem correspondência:* nada acontece; fluxo de novo membro prossegue normalmente.
- *Clicar no `X` do Nome:* limpa todos os campos e retorna ao estado inicial.

**Inventário de UI.** `SheetHeader` · `Input` Nome com Popover · `Input` E-mail · `Select` Função · `Input` Senha (condicional) · `SheetFooter` com 2× `Button`. Ícones: `Eye`, `EyeOff`, `X`, `UserCheck`.

**Conteúdo e textos.** Sucesso: toast **"Membro adicionado à organização."** (§5) · E-mail de outro tenant: **"Este e-mail pertence a outro negócio."** · Helper senha desabilitada: *"Senha não necessária — este usuário já tem acesso ativo."*

**Interações.** Submit novo: cria usuário "convidado" + dispara e-mail de first-access → fecha + toast. Submit replicação: cria vínculo na org + notifica → fecha + toast. Cancelar: fecha sem ação.

**Estados (Matriz).** Inicial: todos os campos editáveis, CTA "Enviar convite" · Com sugestão selecionada: Nome/E-mail readonly, Senha desabilitada, CTA "Replicar membro" · Enviando: `Loader2` · Sucesso: fecha + toast · Erro de validação: inline · E-mail outro tenant: erro inline.

**Acessibilidade & responsividade.** Popover navegável por teclado · campos readonly com `aria-readonly="true"` · `SheetHeader` com `aria-labelledby`.

**Fora do escopo.** Convite por link (pós-v1) · definição de papel Owner (proibido — RN039).

**Refs.** **RF012**, **RF013**, **RN020**, **RN036**, **RN037**, **RN039**, **RN001**. Microcopy: §5. DS: `Sheet`, `Input`, `Select`, `Button`, `Popover`, `Loader2`; ícones `Eye`, `EyeOff`, `X`, `UserCheck`.

---

## 2.3. Módulo: Produtos

### 2.3.1. Lista / busca de produtos · `/produtos`

**Superfície e contexto.** App interno — dentro do App Shell. Tela inicial pós-login enquanto o Dashboard não está implementado (RN091).

**Propósito.** Localizar produtos rapidamente, consultar estado do estoque, abrir a ficha de um produto (2.3.3) e, para Manager/Owner, acessar ações de gestão (RF017).

**Acesso.** Owner e Manager (leitura + ações). Sales (leitura — sem custo, sem ações; pode abrir a ficha de detalhe).

---

**Versão mobile (< lg).**

*Cabeçalho:* `h1` **"Produtos"** + `Button` icon-only `Plus` à direita (`aria-label="Cadastrar produto"`) — **Manager e Owner**.

*Filtros — empilhados verticalmente:*
- `Input` `Search` *"Buscar por nome ou SKU"*.
- `Select` **"Todas as categorias"**.
- `Select` **"Todos os status"** — Todos · Saudável · Atenção · Crítico · Zerado · Inativo.

*Lista de cards:* cada produto como `Card` com `rounded-xl overflow-hidden`. Tocar no card (fora do `MoreVertical` e do `ChevronDown`/`Up`) navega para o Detalhe (2.3.3) — disponível a **todos os papéis, inclusive Sales**.

**Card — produto simples:**
- Imagem de destaque (largura total, proporção `4:3`).
- Botão `MoreVertical` sobreposto no canto superior direito — **Manager e Owner**.
- Corpo `p-3 gap-2`: nome `font-semibold` + SKU `text-xs text-muted-foreground` + N× `Badge` neutro de categorias.
- Rodapé: ícone de status + saldo *"45uni"* à esquerda + *"mín 10"* `text-xs text-muted-foreground` à direita.

**Card — produto com variações:**
- Imagem + `MoreVertical` (igual ao simples).
- Corpo: nome + SKU + badges de categorias.
- Resumo de estoque: ícones compactos por estado (ex.: `⊗ 1  △ 2`) na cor semântica correspondente + `ChevronDown`/`Up` para expandir sub-lista.
- *Sub-lista de variantes* (colapsada por default): linhas dentro do card — SKU da variante `font-mono text-xs` + ícone de status + saldo à direita.

*Rodapé da lista:* paginação padrão.

---

**Versão desktop (lg+).**

*Cabeçalho:* `h1` **"Produtos"** + `Button` default **"+ Cadastrar produto"** — **Manager e Owner**.

*Filtros em linha:* `Input` busca + `Select` categorias + `Select` status.

*Tabela* com colunas:

| Coluna | Conteúdo |
|---|---|
| **Produto** | Thumbnail (~40px) + nome `font-medium` + SKU `text-xs` + indicador "N variações" se aplicável + `ChevronDown`/`Up` para sub-row. Clicar na célula (fora do `ChevronDown`/`Up`) navega para o Detalhe (2.3.3) — todos os papéis, inclusive Sales. |
| **Categorias** | N× `Badge` neutro com `flex-wrap`. |
| **Estoque** | Ícone de status interativo com `Tooltip`/`Popover` ao hover. |
| **Status** | `Badge` semântico. |
| **Ações** | `DropdownMenu` `MoreVertical` — **Manager e Owner**. |

*Coluna Custo médio: não exibida na tabela — consultado na edição/detalhe.*

**Tooltip/Popover de estoque (desktop).**

*Produto simples:* badge de status + **"Estoque atual: N"** + **"Estoque mínimo: N"**.

*Produto com variações:* título **"Resumo da grade"** + linhas por estado (badge + contagem, estados com 0 omitidos) + **"Total físico: N un."** `text-xs text-muted-foreground`.

**Sub-row de variantes (desktop).** Tabela aninhada com: thumbnail (~32px) ou swatch · SKU `font-mono text-sm` · atributos como chips (label `text-xs uppercase` + valor, bolinha de cor se tipo Cor) · ícone de status com tooltip individual. Variante zerada: fundo `bg-muted/40`.

**Ícones de status de estoque.**

| Estado | Ícone | Token |
|---|---|---|
| Saudável | `CircleCheck` | `text-healthy` |
| Atenção | `TriangleAlert` | `text-warning` |
| Crítico | `CircleX` | `text-critical` |
| Zerado | `CircleX` | `text-zeroed` |

**Ações por produto — DropdownMenu (Manager e Owner).** *(Ver detalhes não está no menu — abre pelo clique no card/linha, disponível a todos os papéis.)*

| Ação | Ícone | Comportamento |
|---|---|---|
| **Editar** | `Pencil` | Navega para `/produtos/:id/editar` |
| **Histórico de movimentações** | `History` | Navega para `/movimentacoes?produto=:id` |
| **Registrar movimentação** | `ArrowLeftRight` | Abre Sheet de movimentação (2.4.2) pré-preenchido |
| `Separator` | — | — |
| **Inativar** | `EyeOff` | Abre Modal de inativação (2.3.5) |

**Inventário de UI.** `h1` + `Button` (icon-only mobile / com label desktop) · mobile: 3× filtros empilhados · desktop: filtros em linha + `Table` com sub-row + `Tooltip`/`Popover` · `Badge` neutro (categorias) + `Badge` semântico (status) · `DropdownMenu` · paginação. Ícones: `Plus`, `Search`, `MoreVertical`, `ChevronDown`, `ChevronUp`, `CircleCheck`, `TriangleAlert`, `CircleX`, `Pencil`, `History`, `ArrowLeftRight`, `EyeOff`.

**Conteúdo e textos.** Vazio: **"Comece cadastrando seu primeiro produto."** + CTA (§4) · Filtro sem resultado: **"Nada encontrado para '{termo}'."** (§4) · Badges: **Saudável · Atenção · Crítico · Zerado · Inativo** (§8).

**Estados (Matriz).** Carregando: skeleton · Vazio: ilustração + microcopy + CTA · Filtro sem resultado: mensagem inline · Sub-lista/sub-row expandida: variantes visíveis · Tooltip aberto: fecha ao mover cursor/tap fora.

**Recorte por papel.** Sales: sem botão `+`, sem `MoreVertical`, sem ações de gestão — mas pode tocar/clicar em qualquer produto para abrir o Detalhe (2.3.3). Manager/Owner: acesso pleno.

**Acessibilidade & responsividade.** `aria-label="Cadastrar produto"` no botão icon-only · `ChevronDown`/`Up` com `aria-expanded` + `aria-controls` · badges com texto · thumbnail com `alt` · swatch com `aria-label="Cor: {valor}"` · tooltip acessível por foco.

**Fora do escopo.** Edição em massa (pós-v1) · custo médio na listagem · CSV (pós-v1).

**Refs.** **RF017**, **RF019**, RF039 (acesso ao Detalhe), **RN041**, **RN046**, **RN057**, **RN091**. Microcopy: §4, §8. DS: `Card`, `Table`, `Badge`, `Input`, `Select`, `Button`, `DropdownMenu`, `Tooltip`, `Popover`; tokens semânticos.

---

### 2.3.2. Cadastro de produto (wizard 4 passos) · `/produtos/novo`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Guiar Manager ou Owner pelo cadastro completo de um produto — simples ou com variações (RF016).

**Acesso.** Manager e Owner.

**Anatomia.** `h1` **"Novo produto"** + indicador *"Passo X de 4"* + `Progress` + formulário do passo ativo + barra de ações fixa: `Button` outline **"Voltar"** + `Button` default **"Continuar"** (Passos 1–3) ou **"Salvar produto"** (Passo 4). No `lg`+: stepper horizontal + coluna `max-w-2xl`.

**Passo 1 — Informações básicas.**
- **Nome** (obrigatório) · **SKU** (obrigatório, único por org — RN041, validação em tempo real) · **Descrição** (opcional) · **Categorias** (`Combobox` com criação inline — RF020) · **Estoque mínimo** (opcional, helper: *"Abaixo deste saldo, o produto entra em estado Crítico."*).
- *Custo não é campo aqui — entra pela primeira movimentação (RN043).*

**Passo 2 — Imagens.**
- Drag-and-drop ou seletor de arquivo; upload múltiplo para Cloudinary em background.
- Grid de thumbnails com botão `X` por imagem. Primeira = destaque (reordenável por drag).
- Helper: *"A primeira imagem é usada como destaque na lista e na vitrine."*
- "Continuar" desabilitado até todos os uploads concluírem.

**Passo 3 — Atributos e variações.**
- `Switch` **"Este produto tem variações"** (desligado por default).
- *Se desligado:* mensagem *"Produto sem variações. Avance para o resumo."*
- *Se ligado:* N× atributos (nome + tipo `Select`: Texto · Cor · Número · Seleção — RN045 + valores como tags/chips, `Enter` para adicionar — RN044) + botão **"+ Adicionar atributo"**. Grade de variantes gerada automaticamente: rótulo + SKU da variante (obrigatório) + célula de imagens (descrita abaixo).

Célula de imagens da variante (Passo 3).
Exibe em linha os cards das imagens já associadas à variante, seguidos do botão gatilho para associar novas.
Cards de imagens associadas. Cada imagem associada é representada por um button aspect-square rounded-md overflow-hidden:

Card neutro (imagem não-principal): exibe a imagem em tela cheia. Ao hover/focus, sobrepõe dois controles no canto superior:

Star (outline, aria-label="Tornar imagem principal") — define esta imagem como destaque da variante. Ao clicar, o card passa para o estado de imagem principal.
X (aria-label="Desassociar imagem") — remove o vínculo entre a imagem e a variante. O card some da célula; a imagem retorna ao pool disponível no modal.


Card de imagem principal: identificado pelo ícone Star preenchido (fill-warning text-warning) fixo no canto superior esquerdo, visível sem precisar de hover. Não exibe o botão X em hover — a imagem principal não pode ser desassociada diretamente; o usuário deve primeiro promover outra imagem e depois remover esta.

Botão "Associar imagens". Após os cards, sempre como último elemento da célula: button aspect-square rounded-md border-2 border-dashed com ícone ImagePlus centralizado (aria-label="Associar imagens"). Visível somente enquanto houver imagens do produto ainda não associadas a esta variante. Ao clicar, abre o Modal 2.3.5.

**Passo 4 — Resumo e confirmação.**
- Visão somente leitura de tudo preenchido.
- Aviso fixo: *"O produto nasce com estoque zero. Para adicionar estoque, registre uma entrada em Movimentações."* (RN042).
- CTA: **"Salvar produto"** (loading: **"Salvando…"**).

**Inventário de UI.** `Progress` + indicador · `Input`, `Textarea`, `Label` · `Combobox` com criação inline · upload drag-and-drop + grid · `Switch` · tags/chips de atributos · tabela de variantes · 2× `Button` por passo. Ícones: `Plus`, `X`, `GripVertical`, `ImagePlus`.

**Conteúdo e textos.** SKU duplicado: **"Já existe um produto com este SKU."** (§2) · Aviso estoque zero (Passo 4) · Salvo: toast **"Produto criado."** (§5).

**Estados (Matriz).** Validação inline por passo ao tentar avançar · SKU duplicado em tempo real · Upload em andamento: "Continuar" desabilitado · Salvando: `Loader2` · Sucesso: toast + navegação.

**Recorte por papel.** Manager e Owner — sem diferença.

**Acessibilidade & responsividade.** `aria-current="step"` no passo ativo · `aria-required="true"` nos obrigatórios · reordenação de imagens com alternativa por botões.

**Fora do escopo.** Estoque inicial (entra por Movimentações — RN042) · preço (pertence ao Catálogo — RN043) · CSV (pós-v1).

**Refs.** **RF016**, **RF020**, **RN041**, **RN042**, **RN043**, **RN044**, **RN045**. Microcopy: §2, §7. DS: `Progress`, `Input`, `Textarea`, `Combobox`, `Switch`, `Button`, `Loader2`; upload [a construir].

---

### 2.3.3. Detalhe de produto (leitura) · `/produtos/:id`

**Superfície e contexto.** App interno — App Shell. Acessada a partir da Lista (2.3.1), pelo na opção 'ver detalhes' no menu de ações.

**Propósito.** Consultar a ficha completa de um produto — identificação, imagens, estoque e variantes — sem exigir permissão de edição. É a única tela de produto que o Sales acessa além da Lista; Manager e Owner a usam como ponto de partida para editar, inativar ou registrar movimentação (RF039).

**Acesso.** Owner, Manager e Sales — leitura. Ações de gestão (Editar, Inativar, Registrar movimentação) restritas a Manager e Owner.

---

**Versão mobile (< lg).**

*Cabeçalho:* `← Produtos` (volta para a Lista).

*Galeria:* carrossel de imagens, largura total. Em produto com variações, reflete as imagens da variante selecionada (fallback para as do produto).

*Identificação:* nome `text-2xl font-bold` + `Badge` de status (Ativo/Inativo, §8) + N× `Badge` neutro de categorias + SKU `font-mono text-sm` (da variante selecionada, se houver) + descrição, quando houver.

*Seletor de variante* (produto com variações): chips/`Select` por atributo (cor, tamanho etc.), mesmo padrão do Passo 3 do cadastro. A variante selecionada define SKU, imagens e o bloco de estoque exibidos. Primeira variante ativa pré-selecionada por default.

`Card` **"Estoque"**: ícone de status de estoque (RN050, mesma tabela de ícones de 2.3.1) + saldo atual `font-bold text-lg` + estoque mínimo `text-sm text-muted-foreground`. Para Manager/Owner: linha adicional de **custo médio ponderado** (RN057) — ausente para o Sales.

Produto com variações: bloco **"Resumo da grade"** abaixo do card de estoque, reaproveitando o conteúdo do Popover de 2.3.1 — contagem por estado (badge + número, estados com 0 omitidos) + total físico.

*Barra de ações (Manager/Owner apenas):* `Button` outline **"Editar produto"** → `/produtos/:id/editar` (2.3.4) · `Button` ghost **"Registrar movimentação"** → Sheet de movimentação (2.4.2) pré-preenchido · `Button` ghost destructive **"Inativar"** (se ativo) → Modal (2.3.5).

---

**Versão desktop (lg+).** Mesmo conteúdo em duas colunas: galeria à esquerda (`max-w-md`), identificação + seletor de variante + card de estoque + resumo da grade à direita. Barra de ações fixa no topo da coluna direita, ao lado do nome (Manager/Owner).

**Inventário de UI.** `Carousel`/galeria · `Badge` (status + categorias) · `Select`/chips (seletor de variante) · `Card` (estoque) · bloco "Resumo da grade" (reaproveitado de 2.3.1) · `Button` (ações, condicionais por papel). Ícones: os de status de estoque (2.3.1) + `Pencil`, `ArrowLeftRight`, `EyeOff`.

**Conteúdo e textos.** Sem descrição: seção omitida, sem placeholder vazio. Badges de status: §8.

**Estados (Matriz).** Carregando: skeleton (galeria + blocos de texto) · Produto não encontrado: 404 amigável com retorno para `/produtos` · Variante sem seleção (grade nova): primeira variante ativa pré-selecionada.

**Recorte por papel.** Sales: sem barra de ações (nenhum botão de Editar, Registrar movimentação ou Inativar) e sem a linha de custo médio. Manager/Owner: ficha completa + ações.

**Acessibilidade & responsividade.** Seletor de variante com `aria-label` por atributo · imagens da galeria com `alt` descritivo · ícone de status com texto acessível (não depende só de cor).

**Fora do escopo.** Edição inline dos dados (fica em 2.3.4) · histórico de movimentações do item (fica em 2.4.1, acessível pela ação "Histórico de movimentações" do menu da Lista).

**Refs.** **RF039**, RF018 (edição), RN017, RN043, RN050, RN057. Microcopy: §8. DS: `Card`, `Badge`, `Button`, `Select`; tokens semânticos de estoque.

---

### 2.3.4. Edição de produto · `/produtos/:id/editar`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Atualizar dados de um produto existente. Reutiliza a estrutura do wizard de cadastro (RF018).

**Acesso.** Manager e Owner.

**Anatomia.** Idêntica ao Cadastro (2.3.2). Diferenças:
- Cabeçalho: `h1` **"Editar produto"** + nome do produto em `text-sm text-muted-foreground`.
- SKU com histórico de movimentações: campo readonly + helper *"SKU não pode ser alterado pois há movimentações registradas para este item."*
- Botão final: **"Salvar alterações"**.
- Botão **"Inativar produto"** no cabeçalho ou rodapé → abre Modal (2.3.5).

**Conteúdo e textos.** Salvo: toast **"Alterações salvas."** (§5).

**Estados (Matriz).** Carregando: skeleton · SKU com histórico: readonly + helper · Salvando: `Loader2` · Sucesso: toast · Produto não encontrado: 404 com retorno para `/produtos`.

**Refs.** **RF018**, **RF019**, **RN041**, **RN043**, **RN044**, **RN046**. Microcopy: §5.

---

### 2.3.5. Modal: Inativar produto *(sobre `/produtos`, `/produtos/:id` ou `/produtos/:id/editar`)*

**Propósito.** Confirmar a inativação (soft delete) de um produto (RF019, RN046).

**Anatomia.** `Dialog` `max-w-sm`. `EyeOff` `text-muted-foreground`. Título: **"Inativar {nome}?"** Corpo: **"Ele sai das listagens e dos catálogos, mas o histórico é mantido."** (§3). Rodapé: `Button` outline **"Cancelar"** + `Button` destructive **"Inativar"**.

**Interações.** "Inativar": soft delete → toast **"Produto inativado."** → se aberto de `/produtos/:id` ou `/produtos/:id/editar`, redireciona para `/produtos`. "Cancelar": fecha.

**Estados.** Executando: `Loader2` · Erro: toast + Dialog aberto.

**Refs.** **RF019**, **RN046**. Microcopy: §3. DS: `Dialog`, `Button`, `Loader2`; ícone `EyeOff`.

---

### 2.3.6. Categorias · `/produtos/categorias`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Visualizar, criar e renomear categorias da organização (RF020). Sem exclusão na v1 (RN047).

**Acesso.** Manager e Owner.

**Anatomia.** `h1` **"Categorias"** + `Button` **"+ Nova categoria"**. Lista: cada item com nome `font-medium` + contador de produtos `text-xs text-muted-foreground` + botão `Pencil`. Edição inline: nome vira `Input` + `Check` (confirmar) + `X` (cancelar).

**Estados (Matriz).** Vazio: *"Crie a primeira categoria para organizar seus produtos."* + CTA · Edição inline ativa · Salvando: `Loader2` no confirmar · Sucesso: nome atualizado + toast.

**Fora do escopo.** Exclusão (RN047) · hierarquia (pós-v1).

**Refs.** **RF020**, **RN047**. Microcopy: §4, §5. DS: `Input`, `Button`, `Loader2`; ícones `Pencil`, `Check`, `X`, `Plus`.

---

### 2.3.7. Importar produtos · `/produtos/importar`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Copiar configuração de produtos de outra org do tenant para a org ativa (RF021).

**Acesso.** Manager e Owner.

**Anatomia.** `h1` **"Importar produtos"** + `p` *"Copie produtos de outra unidade do seu negócio."* + `Select`/`Command` **"Organização de origem"** → lista de produtos com `Checkbox` por item + badge **"Já importado"** (checkbox desabilitada — RN049). Rodapé: label **"N produto(s) selecionado(s)"** + `Button` **"Importar selecionados"**.

**Conteúdo e textos.** Sem outras orgs: **"Você precisa de mais de uma organização para importar produtos."** · Sem produtos disponíveis: **"Nenhum produto disponível para importar nesta organização."** · Sucesso: toast **"N produto(s) importado(s)."** + aviso *"Os produtos importados nascem com estoque zero."* (RN042, RN048).

**Estados (Matriz).** Carregando lista: skeleton · Sem outras orgs: estado orientativo · Sem produtos: mensagem inline · Importando: `Loader2` + checkboxes bloqueadas · Sucesso: toast + produtos marcados como importados · Erro: toast.

**Fora do escopo.** CSV (pós-v1) · reimportação (bloqueada — RN049) · estoque/preço/histórico (nunca copiados — RN048).

**Refs.** **RF021**, **RN017**, **RN041**, **RN042**, **RN048**, **RN049**. Microcopy: §5. DS: `Select`/`Command`, `Checkbox`, `Button`, `Badge`, `Loader2`; ícones `Download`, `Package`.

---

## 2.4. Módulo: Movimentações de Estoque

### 2.4.1. Histórico de movimentações · `/movimentacoes`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Visão auditável e cronológica de entradas e saídas. Registros imutáveis (RN051). Chega pré-filtrada quando acessada via atalho de produto (RF023).

**Acesso.** Owner, Manager e Sales (leitura). Manager/Owner veem custo; Sales não (RN057).

---

**Versão mobile (< lg).**

*Cabeçalho:* `h1` **"Movimentações"** + `Button` icon-only `Plus` → abre Sheet (2.4.2) — **Manager e Owner**.

*Filtros empilhados:* `Input` busca · `Select` **"Tipo"** (Todos · Entrada · Saída) · `Select` **"Motivo"** · `DateRangePicker` · `Select` **"Responsável"** (Manager/Owner only).

*Lista de cards:* `Badge` tipo (Entrada `healthy` / Saída `critical`) + motivo `font-medium` + timestamp à direita · nome + SKU da variante · **"+N un."** / **"−N un."** `font-semibold` + custo unitário `text-xs` (oculto para Sales) · ícone `User` + nome do responsável.

---

**Versão desktop (lg+).**

*Cabeçalho:* `h1` **"Movimentações"** + `Button` **"+ Registrar movimentação"** — **Manager e Owner**.

*Filtros em linha.* Iguais ao mobile.

*Tabela* sem coluna de ações (movimentações são imutáveis — RN051):

| Coluna | Conteúdo |
|---|---|
| **Data/hora** | Timestamp `DD/MM/YYYY HH:mm` |
| **Tipo** | `Badge` Entrada (`healthy`) / Saída (`critical`) |
| **Motivo** | Texto + descrição `text-xs` se motivo "Outro" |
| **Produto / Variante** | Nome + SKU |
| **Quantidade** | **"+N"** (verde) / **"−N"** (vermelho) `font-semibold` |
| **Custo unit.** | Manager/Owner only. Saídas: **"—"** |
| **Custo médio pós** | Manager/Owner only (RN054) |
| **Responsável** | Nome ou **"Sistema"** se automática |

---

**Nota sobre pré-filtro por produto.** URL `/movimentacoes?produto=:id` preenche automaticamente o campo de busca com o produto. Badge de filtro ativo com botão `X` para limpar.

**Inventário de UI.** `h1` + `Button` · filtros · mobile: `Card` · desktop: `Table` sem ações · `Badge` tipo · paginação. Ícones: `Plus`, `Search`, `User`, `ArrowUp`, `ArrowDown`.

**Conteúdo e textos.** Vazio: **"Nenhuma movimentação ainda. Entradas e saídas aparecem aqui."** + CTA **[Registrar entrada]** (§4) · Filtro sem resultado: **"Nada encontrado para '{termo}'."** (§4) · Responsável automático: **"Sistema"** · Custo em saídas: **"—"**

**Estados (Matriz).** Carregando: skeleton · Vazio: microcopy + CTA · Filtro sem resultado: mensagem inline · Pré-filtrado: campo preenchido + badge de filtro ativo.

**Recorte por papel.** Sales: sem botão de registrar, sem filtro por responsável, sem colunas de custo.

**Fora do escopo.** Edição ou estorno (não existe — RN051) · exportação CSV (pós-v1).

**Refs.** **RF023**, **RN051**, **RN054**, **RN057**. Microcopy: §4, §8. DS: `Table`, `Card`, `Badge`, `Input`, `Select`, `DateRangePicker`, `Button`.

---

### 2.4.2. Sheet: Registrar movimentação *(sobre `/movimentacoes` ou `/produtos`)*

**Propósito.** Registrar manualmente entrada ou saída de estoque (RF022). Chega pré-preenchido com o produto quando aberto via atalho.

**Acesso.** Manager e Owner (RN056).

**Anatomia.** `Sheet` da direita, `max-w-md`.

- *Cabeçalho:* **"Registrar movimentação"** + *"Registre uma entrada ou saída de estoque."*
- **Tipo** — toggle `SegmentedControl` **Entrada · Saída**.
- **Produto** — `Command`/`Select` com busca. Pré-preenchido e readonly se aberto via atalho.
- **Variante** — `Select` (aparece se produto tem variações, obrigatório).
- **Quantidade** — `Input type="number"`. Em saídas: helper *"Disponível: N un."*. Se exceder saldo: borda `destructive` + **"Estoque insuficiente — há {saldo} disponível."** (§2) + submit desabilitado (RN055).
- **Motivo** — `Select` obrigatório. Entrada: Compra · Devolução de cliente · Ajuste de inventário (+) · Outro. Saída: Perda/Avaria · Devolução a fornecedor · Uso interno · Ajuste de inventário (−) · Outro.
- **Descrição** — `Textarea` obrigatório somente quando motivo = "Outro" (RN053).
- **Custo unitário** — `Input` com prefixo `R$`, obrigatório em Entrada (RN054). Helper: *"Usado para calcular o custo médio do item."*
- **Documento de referência** — `Input` opcional.
- *Rodapé:* `Button` ghost **"Cancelar"** + `Button` default **"Registrar"** (loading: **"Registrando…"**).

**Inventário de UI.** `SheetHeader` · toggle tipo · `Command`/`Select` produto · `Select` variante · `Input` quantidade + helper · `Select` motivo · `Textarea` descrição (condicional) · `Input` custo (condicional) · `Input` referência · `SheetFooter` 2× `Button`. Ícones: `ArrowUp`, `ArrowDown`, `X`.

**Conteúdo e textos.** Estoque insuficiente: **"Estoque insuficiente — há {saldo} disponível."** (§2) · Sem motivo: **"Selecione um motivo."** (§2) · "Outro" sem descrição: **"Descreva o motivo."** (§2) · Sucesso: toast **"Movimentação registrada."**

**Interações.** Tipo: recarrega motivos + exibe/oculta custo · Produto: carrega variantes + saldo · Quantidade (saída): valida em tempo real · Motivo "Outro": exibe Textarea · Submit: persiste → fecha + toast.

**Estados (Matriz).** Inicial · Pré-preenchido (via atalho) · Saída válida: helper verde · Saída inválida: erro inline + submit desabilitado · Motivo "Outro": Textarea obrigatória · Registrando: `Loader2` · Sucesso: fecha + toast · Erro: toast + Sheet aberto.

**Fora do escopo.** Movimentação em lote (pós-v1) · tipo "ajuste" (não existe — RN052) · edição/estorno (não existe — RN051).

**Refs.** **RF022**, **RN051**, **RN052**, **RN053**, **RN054**, **RN055**, **RN056**. Microcopy: §2, §8. DS: `Sheet`, `Input`, `Select`, `Command`, `Textarea`, `Button`, `Loader2`; ícones `ArrowUp`, `ArrowDown`, `X`.

---

## 2.5. Módulo: Catálogos

### 2.5.1. Lista de catálogos · `/catalogos`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Visibilidade sobre todos os catálogos (PDV e públicos) e gestão de ciclo de vida (RF024).

**Acesso.** Owner e Manager (leitura + ações). Sales (leitura).

---

**Versão mobile (< lg).** `h1` **"Catálogos"** + `Button` icon-only `Plus` — Manager e Owner. Lista de cards: ícone de tipo + nome `font-semibold` + `Badge` tipo + slug `text-xs` (público) + `Badge` estado (público) + contador de itens + `MoreVertical`.

**Versão desktop (lg+).** `h1` + `Button` **"+ Criar catálogo"**. Tabela: Nome (ícone + nome + slug) · Tipo (`Badge` neutro) · Estado (`Badge` semântico — público only) · Produtos (contador) · Ações (`DropdownMenu`). Paginação.

---

**Ações por catálogo — DropdownMenu (Manager e Owner).**

| Ação | Condição | Comportamento |
|---|---|---|
| **Configurar** | Todos | Navega para `/catalogos/:id` |
| **Curadoria** | Todos | Navega para `/catalogos/:id/itens` |
| **Publicar vitrine** | Público + Despublicado | Verifica pré-requisitos (RN066); se ok: publica; se não: Dialog orientativo |
| **Despublicar vitrine** | Público + No ar | Executa → toast **"Vitrine despublicada."** |
| **Copiar link da vitrine** | Público + No ar | Copia `inventto.app/{slug}` → toast **"Link copiado."** |
| `Separator` | — | — |
| **Remover catálogo** | Todos | Abre Modal (2.5.4) |

**Dialog de pré-requisitos de publicação (RN066).** Se falta WhatsApp ou timezone/horários: lista o que falta com atalhos para completar. **"Para publicar, ainda falta: {itens}."** (§2).

**Inventário de UI.** `h1` + `Button` · `Card` (mobile) + `Table` (desktop) · `Badge` tipo + estado · `DropdownMenu` · `Dialog` pré-requisitos · paginação. Ícones: `Plus`, `ShoppingCart`, `Globe`, `Link`, `MoreVertical`, `Settings`, `LayoutList`, `Radio`, `RadioOff`, `Copy`, `Trash2`.

**Conteúdo e textos.** Vazio: **"Crie um catálogo para definir o que você vende e por quanto."** + CTA (§4) · Badges: **"PDV" · "Online" · "No ar" · "Despublicado"** (§8).

**Estados (Matriz).** Carregando: skeleton · Vazio: microcopy + CTA · Publicando com pendências: Dialog orientativo · Despublicando: ação direta + toast.

**Recorte por papel.** Sales: sem botão criar, sem dropdown. Manager/Owner: acesso pleno.

**Fora do escopo.** Múltiplos catálogos PDV (pós-v1 — RN060) · agendamento de publicação (pós-v1).

**Refs.** **RF024**, **RN058–RN064**, **RN066**. Microcopy: §2, §4, §5, §8. DS: `Card`, `Table`, `Badge`, `Button`, `DropdownMenu`, `Dialog`.

---

### 2.5.2. Configurar catálogo · `/catalogos/:id`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Configurar dados e comportamentos de um catálogo (PDV ou público) — RF024 + RF026.

**Acesso.** Manager e Owner (edição). Sales (visualização).

**Anatomia.** `h1` nome do catálogo + `Badge` tipo + breadcrumb. `Tabs` variando por tipo. Barra de ações (salvar + descartar) visível apenas com alterações pendentes.

**Tabs — catálogo PDV.** Geral (nome) · Curadoria (atalho para `/catalogos/:id/itens`).

**Tabs — catálogo público.** Geral · Vitrine · Curadoria.

**Tab Geral — PDV.** Nome (`Input`).

**Tab Geral — público.**
- Nome + Slug (`Input` com prefixo `inventto.app/` + validação assíncrona: `CheckCircle` verde / erro inline — §2 — RN062) + WhatsApp (`Input` com máscara, helper: *"Usado para receber pedidos e contatos da vitrine."*) + Redes sociais (Instagram, Facebook, site — opcionais).

**Tab Vitrine — público (RF026).**
- *Identidade visual:* 4× `ColorPicker` (primária, fundo, secundária, texto) + logo + imagem de capa.
- *Layout:* `SegmentedControl` **Grade · Lista** + `Select` estilo de card.
- *Comportamento:* `Switch` **"Mostrar preços"** (helper: *"Quando desativado, o cliente vê 'Consultar' e é direcionado ao WhatsApp."* — RN067) + `Switch` **"Mostrar produtos esgotados"** (helper: *"Produtos zerados aparecem como 'Esgotado' na vitrine."*) + `Textarea` mensagem WhatsApp pré-preenchida (opcional).
- *Preview ao vivo* (desktop): frame lateral somente leitura, atualiza em tempo real.

**Inventário de UI.** `Tabs` · `Input`, `Label`, helpers · validação slug assíncrona · `ColorPicker` [a construir] · 2× upload (logo + capa) · `SegmentedControl`/`RadioGroup` · 2× `Switch` · `Textarea` · preview ao vivo (desktop) · `Button` salvar + descartar. Ícones: `CheckCircle`, `XCircle`, `Loader2`, `Instagram`, `Facebook`, `Globe`.

**Conteúdo e textos.** Slug disponível: `CheckCircle` verde · Slug indisponível: **"Este endereço já está em uso. Tente outro."** (§2) · Slug inválido: **"Use só letras minúsculas, números e hífen, de 3 a 50 caracteres."** (§2) · Salvo: toast **"Alterações salvas."** (§5).

**Estados (Matriz).** Carregando: skeleton · Slug validando: spinner · Com alterações: botões visíveis · Salvando: `Loader2` · Sucesso: toast.

**Recorte por papel.** Sales: campos readonly, sem botões. Manager/Owner: edição plena.

**Fora do escopo.** Domínio próprio (pós-v1) · agendamento (pós-v1) · histórico de preços (pós-v1).

**Refs.** **RF024**, **RF026**, **RN059**, **RN061**, **RN062**, **RN063**, **RN066**, **RN067**. Microcopy: §2, §5. DS: `Tabs`, `Input`, `Switch`, `Textarea`, `Button`, `Loader2`; `ColorPicker` [a construir]; upload [a construir].

---

### 2.5.3. Curadoria de itens · `/catalogos/:id/itens`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Gerenciar quais produtos compõem o catálogo e a que preço, com destaque e promoção (RF025).

**Acesso.** Manager e Owner (edição). Sales (visualização).

**Anatomia.** `h1` **"Curadoria"** + breadcrumb + `Button` **"+ Adicionar produtos"** — Manager e Owner. Barra de filtros: busca + `Select` categorias + `Select` destaque. Lista de itens com auto-save de preço.

**Item curado.** Thumbnail + nome + SKU + `Input` **Preço de venda** (obrigatório — RN065, erro inline se vazio: **"Defina um preço para incluir este item."** §2) + `Input` **Preço original** (opcional, riscado na vitrine) + toggle `Star`/`StarOff` (destaque) + `Button` `Trash2` (remove com toast reversível — §3).

**Sheet: Adicionar produtos.** `Sheet` `max-w-lg`. Busca + lista de produtos disponíveis com `Checkbox`. Produtos já no catálogo: badge **"Já adicionado"** + checkbox desabilitada. Rodapé: contador + `Button` **"Adicionar ao catálogo"**. Ao confirmar: itens adicionados com campo de preço destacado com borda `warning` até preenchimento.

**Inventário de UI.** `h1` + breadcrumb + `Button` · filtros · N× item com `Input` × 2 + `Star` toggle + `Trash2` · `Sheet` com `Checkbox` por produto. Ícones: `Plus`, `Search`, `Star`, `StarOff`, `Trash2`.

**Conteúdo e textos.** Vazio: **"Adicione produtos a este catálogo."** + CTA (§4) · Preço obrigatório: **"Defina um preço para incluir este item."** (§2) · Remoção reversível: **"{produto} removido. Desfazer"** (§3).

**Estados (Matriz).** Carregando: skeleton · Vazio: microcopy + CTA · Item sem preço: borda `warning` + erro inline · Salvando preço: auto-save com spinner discreto · Remoção: toast com desfazer 5s.

**Recorte por papel.** Sales: campos readonly, sem ações. Manager/Owner: edição plena.

**Fora do escopo.** Ordenação manual (pós-v1) · regras de preço por quantidade (pós-v1).

**Refs.** **RF025**, **RN058**, **RN061**, **RN065**. Microcopy: §2, §3, §4. DS: `Card`, `Input`, `Button`, `Sheet`, `Checkbox`, `Badge`; ícones `Star`, `StarOff`, `Trash2`, `Search`, `Plus`.

---

### 2.5.4. Modal: Remover catálogo *(sobre `/catalogos`)*

**Propósito.** Confirmar remoção definitiva de um catálogo. Slug do catálogo público entra em quarentena por 30 dias (RN063).

**Anatomia.** `Dialog` `max-w-sm`. `Trash2` `text-destructive`. Título: **"Remover {nome}?"** Corpo: **"Esta ação não pode ser desfeita."** Para catálogos públicos: **"O endereço `inventto.app/{slug}` ficará reservado por 30 dias."** Rodapé: `Button` outline **"Cancelar"** + `Button` destructive **"Remover"**.

**Interações.** "Remover": executa → toast **"Catálogo removido."** → retorna para `/catalogos`. "Cancelar": fecha.

**Estados.** Executando: `Loader2` · Erro: toast + Dialog aberto.

**Refs.** **RF024**, **RN063**, **RN064**. Microcopy: §3. DS: `Dialog`, `Button`, `Loader2`; ícone `Trash2`.

---

## 2.6. Módulo: Vendas no Balcão (PDV)

### 2.6.1. Nova venda no balcão · `/pdv`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Registrar venda presencial de forma ágil — montar carrinho, aplicar desconto opcional e confirmar (RF027). Venda nasce como pedido `pos` confirmado (RN068).

**Acesso.** Sales, Manager e Owner (RN071).

**Pré-requisito.** Catálogo de PDV configurado com ao menos um produto (RN069). Sem catálogo: bloqueio orientativo.

---

**Versão mobile (< lg).** Layout de duas áreas empilhadas.

*Área superior — busca:* `Input` `Search` *"Buscar produto ou SKU no catálogo…"* + lista de resultados com thumbnail + nome + variante + preço + `Button` `Plus`.

*Área inferior — carrinho:* barra fixa no rodapé: `ShoppingCart` + contador + total + `Button` **"Ver carrinho"** → abre Sheet com lista de itens + desconto + cliente + CTA.

**Versão desktop (lg+).** Split-screen: catálogo à esquerda (`flex-1`) + painel do carrinho fixo à direita (`w-96`).

*Painel esquerdo:* `Input` busca + `Select` categorias + grade/lista de produtos do catálogo. Clique no item → adiciona ao carrinho.

*Painel direito — carrinho:* título **"Venda atual"** + lista de itens + seção de desconto + seção de cliente + resumo + CTA.

---

**Anatomia do carrinho.**

*Lista de itens:* thumbnail + nome + variante + controles de quantidade (`−` / `+` ou `Input type="number"`) + preço unitário + subtotal + `Button` `Trash2`. Se quantidade exceder saldo: borda `warning` + *"Apenas N disponíveis."* + submit desabilitado (RN055/RN070).

*Desconto (opcional — RN073):* `Switch` **"Aplicar desconto"** + quando ligado: `Input` + toggle **R$** / **%** + exibição de referência, desconto e preço final.

*Cliente (opcional — RN072):* `Input type="tel"` **"Telefone do cliente"** + helper *"Opcional — para registrar no histórico do cliente."* Ao preencher: busca no CRM; se encontrado exibe nome; se não, campo **"Nome"** aparece.

*Resumo:* subtotal + desconto `text-destructive` + **Total** `font-bold text-lg`.

*CTA:* `Button` default `w-full` **"Confirmar venda"** (loading: **"Registrando…"**). Desabilitado se: carrinho vazio · item com estoque insuficiente · desconto negativo.

**Inventário de UI.** `Input` busca + `Select` categoria · grade/lista produtos · controles de quantidade · `Switch` + `Input` desconto + toggle R$/% · `Input type="tel"` cliente · resumo · `Button` confirmação · mobile: barra fixa + `Sheet`. Ícones: `Search`, `Plus`, `Minus`, `Trash2`, `ShoppingCart`, `User`, `Tag`.

**Conteúdo e textos.** Placeholder: *"Buscar produto ou SKU no catálogo…"* · Carrinho vazio: *"Adicione produtos para iniciar a venda."* · Estoque insuficiente: *"Apenas N disponíveis."* · Sucesso: toast **"Venda registrada."** (§5) + carrinho limpo + foco retorna ao campo de busca.

**Interações.** Adicionar produto: entra com quantidade 1; se já existe, incrementa · Editar quantidade: recalcula em tempo real · Aplicar desconto: recalcula total, registra referência + desconto + final (RN073) · Confirmar: cria pedido `pos` → gera saída (motivo "Venda") → vincula/cria cliente → toast → limpa carrinho.

**Estados (Matriz).** Sem catálogo PDV: **"Vincule um catálogo ao PDV para começar a vender."** + **[Escolher catálogo]** (§2) · Carrinho vazio: microcopy orientativo · Item estoque insuficiente: highlight + CTA desabilitado · Registrando: `Loader2` · Sucesso: toast + limpo · Erro: toast + carrinho preservado.

**Recorte por papel.** Acesso idêntico para todos os papéis.

**Fora do escopo.** Processamento de pagamento (pós-v1) · emissão de recibo (pós-v1) · estorno/cancelamento pela UI (pós-v1) · limite de desconto por papel (pós-v1 — RN073).

**Refs.** **RF027**, **RN068–RN073**, **RN055**. Microcopy: §2, §5. DS: `Input`, `Select`, `Switch`, `Button`, `Sheet` (mobile), `Loader2`; ícones listados acima.

---

### 2.6.2. Consulta de vendas do balcão · `/pdv/vendas`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Consultar vendas de balcão registradas (RF028). Sales vê as próprias; Manager e Owner veem todas.

**Acesso.** Sales (próprias), Manager e Owner (todas).

---

**Versão mobile (< lg).** `h1` **"Vendas no balcão"**. Filtros empilhados: `DateRangePicker` (default: hoje) + `Select` **"Vendedor"** (Manager/Owner only). Cards: data/hora + total `font-bold` · vendedor + badge **"PDV"** neutro · *"N item(ns)"* `text-sm` + `ChevronDown` para expandir itens · se desconto: *"Desconto: −R$ X,XX"* `text-xs text-destructive`. Paginação.

**Versão desktop (lg+).** Filtros em linha. Tabela: Data/hora · Vendedor · Itens (contador + `ChevronDown` para sub-row) · Subtotal · Desconto (**"—"** se nenhum) · Total · Cliente (nome ou **"Anônimo"** `text-muted-foreground`). Sem coluna de ações — imutável na v1. Sub-row expansível com itens da venda. Paginação.

**Conteúdo e textos.** Vazio: **"Nenhuma venda neste período."** (§4) · Anônimo: **"Anônimo"**.

**Recorte por papel.** Sales: sem filtro de vendedor, vê apenas as próprias. Manager/Owner: filtro visível, vê todas.

**Fora do escopo.** Estorno (pós-v1) · exportação (pós-v1).

**Refs.** **RF028**, **RN017**, **RN073**. Microcopy: §4. DS: `Table`, `Card`, `Button`, `DateRangePicker`, `Select`.

---

# Superfície 3 — Vitrine pública (cliente final)

> Telas acessíveis publicamente via `inventto.app/{slug}`, sem login. O cliente final não interage com o App Shell. O tema visual é definido pelo catálogo público — não pelo design system do app interno.

## 2.7. Módulo: Storefront

### 2.7.1. Vitrine pública · `inventto.app/{slug}`

**Superfície e contexto.** Pública — sem autenticação, sem App Shell.

**Propósito.** Renderizar a vitrine de um catálogo público, permitindo ao cliente navegar produtos, ver disponibilidade e status de funcionamento, montar carrinho e partir para pedido ou WhatsApp (RF029, RF030, RF031).

**Acesso.** Qualquer pessoa com o link.

**Tema visual.** Cores, logo, imagem de capa, layout e estilo de card são lidos do catálogo público (RN075). A vitrine usa os tokens do tema do catálogo, não do design system interno.

---

**Anatomia (mobile-first).**

*Header:* imagem de capa (largura total) + logo sobreposta + nome da organização `font-bold` + links de redes sociais (ícones inline, se configurados) + **Badge de status de funcionamento:**
- **"Aberto agora"** (bolinha verde) — dentro do horário.
- **"Fechado · Abre {dia} às {hora}"** (bolinha cinza) — fora do horário (RN077).

*Busca e filtros* (condicional, catálogo > 12 itens): `Input` busca + chips de categorias com scroll horizontal.

*Grade ou lista de produtos* (conforme configuração do catálogo — RF029):

**Card de produto (grade):**
- Imagem (quadrada ou `4:3`) + badge de disponibilidade sobreposto (**"Últimas peças!"** `warning` · **"Esgotado"** `zeroed`) + badge de destaque (`Star`).
- Nome + preço (ou **"Consultar"** se oculto — RN067) + preço original riscado se promoção.

**Card de produto (lista):** thumbnail à esquerda + nome + preço + badge à direita.

*Botão flutuante de carrinho* (aparece ao adicionar primeiro item): `Button` fixo no rodapé com `ShoppingCart` + contador + total.

*Rodapé da vitrine:*
- `Button` primário `w-full` **"Fazer pedido"** → checkout (2.7.3). Desabilitado se loja fechada + sem aceitar pedidos fora do horário (RN077).
- `Button` secondary `w-full` **"Chamar no WhatsApp"** → `wa.me/{numero}`. Sempre disponível (RN078).

No `lg`+: sidebar de filtros à esquerda + grade à direita.

**Inventário de UI.** Header com capa + logo + nome + redes + badge status · busca + chips categoria (condicional) · grade/lista de cards · detalhe do produto (ver 2.7.2) · botão flutuante de carrinho · rodapé com 2× CTA. Ícones: `ShoppingCart`, `Star`, `Instagram`, `Facebook`, `Globe`, `Phone`.

**Conteúdo e textos** (tom do cliente — §6). Status: **"Aberto agora"** / **"Fechado · Abre {dia} às {hora}"** · Disponibilidade: **"Últimas peças!"** · **"Esgotado"** · Preço oculto: **"Consultar"** · CTA pedido: **"Fazer pedido"** · CTA WhatsApp: **"Chamar no WhatsApp"** · Loja fechada sem pedidos: **"Voltamos {próxima abertura}. Fale com a gente no WhatsApp."**

**Estados (Matriz).** Catálogo indisponível (RN076): **"Esta loja não está disponível no momento."** · Loja aberta: ambos os CTAs ativos · Loja fechada + aceita pedidos: banner informativo + CTA pedido ativo · Loja fechada + não aceita: CTA pedido desabilitado/oculto · Carrinho com itens: botão flutuante visível · Carregando: skeleton de cards.

**Fora do escopo.** Login (pós-v1) · carrinho persistente (pós-v1) · pagamento online (pós-v1) · domínio próprio (pós-v1).

**Refs.** **RF029–RF031**, **RN067**, **RN074–RN078**. Microcopy: §6. DS: tema do catálogo; `Sheet`/`Modal`; `Button`; badges de disponibilidade.

---

### 2.7.2. Detalhe do produto · `inventto.app/{slug}/produto/:id`

**Superfície e contexto.** Pública — tela dedicada dentro da vitrine.

**Propósito.** Exibir todas as informações de um produto, permitir seleção de variante e adição ao carrinho.

**Anatomia.**
- Botão **"Voltar"** (`ChevronLeft`) → retorna para a vitrine.
- Galeria de imagens (swipe mobile / thumbnails clicáveis desktop).
- Nome + descrição + preço (ou **"Consultar"** — RN067).
- Preço original riscado se promoção.
- Badge de disponibilidade (**Disponível · Últimas peças! · Esgotado**).
- **Seletor de variante** (se produto tem variações): atributos como chips/swatches. Chip de texto (ex.: P/M/G). Swatch de cor (bolinha). Variante esgotada: opacidade reduzida + riscado.
- `Input` de quantidade (inteiro, mínimo 1) — desabilitado se variante esgotada.
- `Button` primário `w-full` **"Adicionar ao pedido"** — desabilitado se variante obrigatória não selecionada ou item esgotado.
- Se item completamente esgotado: botão muda para **"Falar no WhatsApp"** → `wa.me/{numero}`.

**Interações.** Ao trocar de variante no seletor: URL atualiza via `history.replaceState` para `/produto/:id/variacao/:variantId` (sem recarregar). Galeria exibe imagens da variante selecionada; fallback para imagens do produto.

**Refs.** **RF029**, **RN067**, **RN075**. DS: tema do catálogo; `Button`; swatches de cor; `ChevronLeft`.

---

### 2.7.3. Detalhe da variação · `inventto.app/{slug}/produto/:id/variacao/:variantId`

**Superfície e contexto.** Pública — rota própria para cada variante.

**Propósito.** Rota própria para cada variante — permite compartilhamento direto do link de uma variação específica.

**Anatomia.** Idêntica ao Detalhe do produto (2.7.2). Variante correspondente pré-selecionada no seletor ao carregar. Galeria exibe imagens da variante; fallback para as do produto.

**Refs.** **RF029**, **RN075**. DS: tema do catálogo.

---

### 2.7.4. Carrinho · *(sheet/drawer sobre a vitrine)*

**Superfície e contexto.** Pública — overlay sem rota própria.

**Propósito.** Permitir ao cliente revisar itens, ajustar quantidades e partir para o checkout.

**Anatomia.** `Sheet`/`Drawer` da direita (desktop) ou de baixo (mobile).
- *Cabeçalho:* **"Seu carrinho"** + contador.
- *Lista de itens:* thumbnail + nome + variante + preço unitário + controles `−` / `+` + `Trash2`.
- *Resumo:* total `font-bold text-xl`.
- *Rodapé:* `Button` primário `w-full` **"Ir para o pedido"** → checkout (2.7.5) + `Button` ghost `w-full` **"Continuar comprando"** → fecha.

**Estados.** Vazio: **"Seu carrinho está vazio."** + **"Ver produtos"** → fecha · Item esgotado no carrinho (RN085): badge **"Esgotado"** + *"Este item saiu de estoque. Remova para continuar."* + "Ir para o pedido" desabilitado.

**Refs.** **RF029**, **RN085**. Microcopy: §3, §6. DS: `Sheet`/`Drawer`, `Button`; tema do catálogo.

---

### 2.7.5. Checkout · `inventto.app/{slug}/pedido`

**Superfície e contexto.** Pública — rota dentro da vitrine.

**Propósito.** Capturar dados do cliente e criar o pedido com reserva de estoque (RF032).

**Acesso.** Cliente final — sem login.

**Anatomia (mobile-first).** Formulário de página única.

*Resumo do pedido* (colapsável mobile, sidebar desktop): itens + total.

*"Seus dados" (RN082):*
- **Nome completo** (`Input`) — obrigatório.
- **Telefone (WhatsApp)** (`Input type="tel"` com máscara) — obrigatório. Helper: *"Usamos seu WhatsApp para confirmar o pedido."*

*"Endereço de entrega" (RN083):*
- **CEP** (`Input`) — autopreenchimento ViaCEP ao `onBlur`. CEP inválido: toast **"Não encontramos esse CEP. Preencha o endereço manualmente."** (§6) + campos liberados.
- Logradouro, Número, Complemento (opcional), Bairro, Cidade, Estado.

*"Como prefere pagar?":*
- `RadioGroup`: **Cartão · Dinheiro · Pix** (RN080 — intenção apenas).

*CTA:* `Button` primário `w-full` **"Fazer pedido"** (loading: **"Enviando…"**).

No `lg`+: formulário à esquerda + resumo fixo à direita (`w-80`).

**Inventário de UI.** Resumo colapsável + `Input` nome + `Input type="tel"` + `Input` CEP com ViaCEP + campos endereço + `RadioGroup` + `Button` primário. Ícones: `MapPin`, `Phone`, `CreditCard`.

**Interações.** CEP `onBlur`: chama ViaCEP → preenche campos. Submit: cria pedido `catalog_store` pendente → reserva estoque → calcula TTL (RN084) → vincula/cria cliente por telefone → notifica equipe in-app → redireciona para confirmação (2.7.6).

**Estados (Matriz).** Enviando: `Loader2` + form bloqueado · Validação inline: campos obrigatórios · CEP consultando: spinner · Race condition de estoque (RN085): toast **"Um item esgotou enquanto você finalizava. Revise seu pedido."** (§6) + retorno ao carrinho · Sucesso: redirect para 2.7.6.

**Fora do escopo.** Processamento de pagamento (pós-v1 — RN080) · cálculo de frete (pós-v1) · login do cliente (pós-v1).

**Refs.** **RF032**, **RN079–RN085**. Microcopy: §6. DS: tema do catálogo; `Input`, `RadioGroup`, `Button`, `Loader2`.

---

### 2.7.6. Confirmação de pedido · `inventto.app/{slug}/pedido/confirmado`

**Superfície e contexto.** Pública — página final do fluxo de checkout.

**Propósito.** Confirmar ao cliente que o pedido foi recebido e orientar o próximo passo.

**Anatomia.** Página centralizada `max-w-md`. `CheckCircle` grande na cor primária do catálogo + título **"Pedido enviado!"** + corpo **"A loja confirma com você pelo WhatsApp."** + resumo compacto do pedido. `Button` primário **"Chamar no WhatsApp agora"** → `wa.me/{numero}` + `Button` ghost **"Voltar para a loja"** → `inventto.app/{slug}`.

**Fora do escopo.** E-mail de confirmação ao cliente (pós-v1 — RN088) · acompanhamento do pedido (pós-v1).

**Refs.** **RF032**, **RN088**. Microcopy: §6 (`"Pedido enviado! A loja confirma com você pelo WhatsApp."`). DS: tema do catálogo; `Button`; ícone `CheckCircle`.

---

## 2.8. Módulo: Pedidos Online (painel interno)

### 2.8.1. Painel de pedidos · `/pedidos`

**Superfície e contexto.** App interno — App Shell.

**Propósito.** Visibilidade em tempo real sobre pedidos do storefront e gestão pelo pool (RF034, RF035).

**Acesso.** Sales (pool + os que assumiu — RN081). Manager e Owner (todos).

---

**Versão mobile (< lg) — Tabs.**

`h1` **"Pedidos"** + badge de contagem em tempo real (Supabase Realtime).

*5 tabs:* **Pool · Em atendimento · Confirmados · Cancelados · Expirados**.

*Card de pedido:* ID `font-mono font-bold` + `Badge` status + timer de expiração `text-xs text-destructive` (Pool e Em atendimento) · nome do cliente + `Phone` como link `wa.me` · *"N item(ns) · R$ {total}"* `text-sm` · forma de pagamento `text-xs text-muted-foreground` · `Button` **"Assumir"** (se Pool) ou **"Ver pedido"** (se Em atendimento e é do usuário).

---

**Versão desktop (lg+) — Kanban.**

Layout de 5 colunas com scroll horizontal.

| Coluna | Cor cabeçalho |
|---|---|
| **Pool** | neutro |
| **Em atendimento** | `warning` |
| **Confirmados** | `healthy` |
| **Cancelados** | `zeroed` |
| **Expirados** | `zeroed` |

Cada coluna: cabeçalho com nome + contador + cards empilhados (`overflow-y-auto`).

**Card do pedido (Kanban):** ID `font-mono font-bold` + timer `text-xs text-destructive` (Pool e Em atendimento) · nome do cliente · *"Há {N} min"* `text-xs text-muted-foreground` · total `font-semibold` · badge urgência (`warning`) se TTL < 30 min (RN084) · `Button` **"Assumir"** (Pool).

Clique no card → abre `Sheet` de atendimento sobre o Kanban. A rota `/pedidos/:id` é a visualização de página completa usada no mobile.

---

**Badges de status.**

| Status | Token | Texto |
|---|---|---|
| Pendente | `warning` | **Pendente** |
| Em andamento | `healthy` | **Em andamento** |
| Confirmado | `healthy` | **Confirmado** |
| Cancelado | `zeroed` | **Cancelado** |
| Expirado | `zeroed` | **Expirado** |

**Atualização em tempo real (RF035).** Novo pedido: card/linha aparece na tab/coluna Pool com animação + badge de contagem incrementa. Timer de expiração: countdown ao vivo. Ao expirar: badge muda + card migra automaticamente para Expirados.

**Inventário de UI.** `h1` + `Badge` contagem (Realtime) · mobile: `Tabs` + lista de cards · desktop: Kanban com colunas + cards · `Badge` status semântico · countdown timer · link `wa.me` · `Button` de ação inline. Ícones: `Phone`, `ChevronDown`, `Clock`, `UserCheck`, `CheckCircle`, `XCircle`.

**Conteúdo e textos.** Pool vazio: **"Nenhum pedido pendente. Os novos chegam aqui em tempo real."** (§4) · Encerrados sem resultado: **"Nenhum pedido encerrado neste período."** · Race condition: **"Este pedido já foi assumido."** (§2).

**Estados (Matriz).** Carregando: skeleton · Pool vazio: microcopy · Novo pedido (Realtime): animação + contagem · Expirando (< 15 min): timer pulsando · Expirado: migração automática · Race condition: toast + lista atualizada.

**Recorte por papel.** Sales: vê pool + os próprios, pode assumir e ver os próprios. Manager/Owner: vê e age em todos.

**Fora do escopo.** Distribuição automática (pós-v1) · notificação ao cliente (pós-v1 — RN088).

**Refs.** **RF034**, **RF035**, **RN079**, **RN081**, **RN084**, **RN085**, **RN086**, **RN087**, **RN088**. Microcopy: §2, §4. DS: `Tabs`, `Card`, `Badge`, `Button`; tokens semânticos.

---

### 2.8.2. Atendimento do pedido · `/pedidos/:id`

**Superfície e contexto.** App interno — App Shell. Página completa no mobile; `Sheet` lateral sobre o Kanban no desktop.

**Propósito.** Visualizar detalhes de um pedido, contatar o cliente via WhatsApp e executar confirmação ou cancelamento (RF034).

**Acesso.** Sales (pedidos do pool e os que assumiu — RN087). Manager e Owner (qualquer pedido).

**Anatomia (mobile, ~390px).** Breadcrumb + `Badge` status + timer. `Card` cliente: nome + telefone + `Button` **"Chamar no WhatsApp"**. `Card` itens: tabela/lista com total + forma de pagamento. `Card` entrega: endereço completo (snapshot — RN083). `Card` metadados: data/hora + vendedor + origem + expira em. Área de ações fixa no rodapé.

No `lg`+: duas colunas — dados à esquerda + painel de ações e metadados à direita (`w-80`).

**Ações por situação.**

| Situação | Ações |
|---|---|
| Pendente no pool | `Button` default **"Assumir pedido"** |
| Em andamento (responsável = usuário ou Manager+Owner) | `Button` default **"Confirmar pedido"** + `Button` outline destructive **"Cancelar pedido"** |
| Confirmado / Cancelado / Expirado | Sem ações — apenas leitura |

**Conteúdo e textos.** CTA WhatsApp: **"Chamar no WhatsApp"** · CTA assumir: **"Assumir pedido"** · CTA confirmar: **"Confirmar pedido"** (loading: **"Confirmando…"**) · CTA cancelar: **"Cancelar pedido"** → Modal (2.8.3) · Sucesso confirmação: toast **"Pedido confirmado e estoque baixado."** (§5) · Vendedor sem atribuição: **"Pool"** · Origem: **"Vitrine online · {nome do catálogo}"**.

**Interações.** "Assumir": atribui `seller_id` → badge muda para Em andamento → ações mudam. "Confirmar": converte reserva em saída definitiva (RN086) → toast → redirect para `/pedidos`. "Cancelar": abre Modal (2.8.3). Pedido expirado enquanto na tela: Realtime atualiza badge + ações desaparecem.

**Estados (Matriz).** Carregando: skeleton · Não encontrado/sem permissão: 404 + retorno para `/pedidos` · Confirmando: `Loader2` + ações bloqueadas · Race condition (RN081): toast **"Este pedido já foi assumido."** + página atualiza · Expirado enquanto visualizado: Realtime atualiza badge.

**Recorte por papel.** Sales: apenas pedidos do pool e próprios. Manager/Owner: qualquer pedido.

**Fora do escopo.** Edição de itens (pós-v1) · histórico de eventos (pós-v1).

**Refs.** **RF034**, **RN079**, **RN081**, **RN083**, **RN086**, **RN087**. Microcopy: §2, §5. DS: `Card`, `Button`, `Badge`, `Loader2`; ícones `Phone`, `MapPin`, `Package`, `Clock`, `User`, `CheckCircle`, `XCircle`.

---

### 2.8.3. Modal: Cancelar pedido *(sobre `/pedidos/:id`)*

**Propósito.** Confirmar cancelamento do pedido — reserva de estoque é liberada (RF034, RN086).

**Anatomia.** `Dialog` `max-w-sm`. `XCircle` `text-destructive`. Título: **"Cancelar pedido #{id}?"** Corpo: **"A reserva de estoque será liberada."** (§3). Rodapé: `Button` outline **"Voltar"** + `Button` destructive **"Cancelar pedido"**.

**Interações.** "Cancelar pedido": libera reserva → status Cancelado → toast **"Pedido cancelado."** + redirect para `/pedidos`. "Voltar": fecha.

**Estados.** Executando: `Loader2` · Erro: toast + Dialog aberto.

**Refs.** **RF034**, **RN086**. Microcopy: §3. DS: `Dialog`, `Button`, `Loader2`; ícone `XCircle`.

---

## 2.9. Dashboard · `/`

**Superfície e contexto.** App interno — App Shell. Tela inicial pós-login quando disponível (RN091 — enquanto não implementado, tela inicial é `/produtos`).

**Propósito.** Visão operacional rápida: atenção imediata, resumo de vendas e atividade recente com atalhos (RF036, RF037, RF038).

**Acesso.** Sales, Manager e Owner — conteúdo adaptado por papel (RN090).

**Anatomia (mobile).** Coluna única: Atenção → Vendas → Atividade e atalhos. No `lg`+: grid 2 colunas — Atenção e Atividade à esquerda, Vendas (com gráfico) à direita.

---

**Bloco 1 — Atenção imediata (RF036).**

*Sales:* card **"Pedidos perto de expirar"** (pool/próprios, TTL < 30 min) → `/pedidos`.

*Manager e Owner:* card **"Pedidos pendentes"** (badge `warning` se > 0) → `/pedidos` · card **"Estoque crítico ou zerado"** (badge `critical`/`zeroed`) → `/produtos` filtrado · card **"Expirando em breve"** (TTL < 30 min, badge `warning`) → `/pedidos`.

Cada card: ícone + número `text-3xl font-bold` + label + `ChevronRight`. Valor **"0"**: `text-muted-foreground`.

---

**Bloco 2 — Resumo de vendas (RF037).**

*Sales:* contador **"Suas vendas hoje"** com nº de vendas + valor total. Sem gráfico.

*Manager e Owner:* `SegmentedControl` **Hoje · 7 dias · 30 dias** + **Faturamento total** `text-2xl font-bold` + **Nº de vendas** + `LineChart` com faturamento por dia.

*Owner exclusivo:* **Valor de inventário a custo** + **Margem média** (RN090) — separados por `Separator`.

---

**Bloco 3 — Atividade recente e atalhos (RF038).**

*Sales:* mini-lista últimas 3–5 vendas próprias + `Button` **"+ Nova venda"** → `/pdv`.

*Manager e Owner:* mini-lista movimentações recentes (3–5) + mini-lista últimos pedidos (3–5, com badge status) + atalhos em linha: **"+ Nova venda"** · **"+ Entrada de estoque"** · **"+ Produto"**.

---

**Estado de primeiro uso (onboarding — RN091).** Substitui os blocos operacionais se a org não tem produtos, catálogos nem vendas. Título: **"Vamos preparar sua loja."** (§4). 3 cards sequenciais com `CheckCircle` ao concluir cada critério: 1. **"Cadastre seu primeiro produto"** → `/produtos/novo` · 2. **"Crie um catálogo"** → `/catalogos` · 3. **"Publique sua vitrine"** → `/catalogos`.

**Inventário de UI.** 2–3× `Card` atenção + `ChevronRight` · `SegmentedControl` período (Manager/Owner) · métricas `text-2xl`/`text-3xl` · `LineChart` (Manager/Owner) · mini-listas · `Button` atalhos · cards onboarding com `CheckCircle`. Ícones: `Package`, `ShoppingBag`, `TriangleAlert`, `Clock`, `TrendingUp`, `LayoutList`, `Globe`, `Plus`, `ChevronRight`.

**Conteúdo e textos.** Cards de atenção: **"Pedidos pendentes"** · **"Estoque crítico ou zerado"** · **"Expirando em breve"** · **"Suas vendas hoje"** · Atalhos: **"+ Nova venda"** · **"+ Entrada de estoque"** · **"+ Produto"** · Onboarding: **"Vamos preparar sua loja."** (§4).

**Estados (Matriz).** Carregando: skeleton por bloco — degrada isolado (RN089) · Erro em bloco isolado: **"Não foi possível carregar."** + "Tentar de novo" sem derrubar os demais · Primeiro uso: cards de onboarding · Dados zerados: valores **"0"** sem urgência.

**Recorte por papel.**

| Bloco | Sales | Manager | Owner |
|---|---|---|---|
| Atenção | Pedidos próprios/pool expirando | Pendentes + estoque + expirando | Igual ao Manager |
| Vendas | Próprias hoje, sem gráfico | Faturamento + gráfico | Idem + margem + inventário a custo |
| Atividade | Últimas vendas próprias + atalho PDV | Movimentações + pedidos + 3 atalhos | Igual ao Manager |

**Fora do escopo.** Gráficos de tendência (pós-v1) · relatórios exportáveis (pós-v1) · rankings (pós-v1) · dashboard multi-org (pós-v1) · personalização de widgets (pós-v1).

**Refs.** **RF036**, **RF037**, **RF038**, **RN089**, **RN090**, **RN091**. Microcopy: §4. DS: `Card`, `SegmentedControl`, `LineChart`, `Button`, `Badge`; tokens semânticos.

---

*Fim do documento. Descrição de Telas v1.0 — Inventto. Companheiro da Especificação de Produto v1.0, UX v0.1, Mapa de Telas, Matriz de Estados, Microcopy, Variações por Papel e Design System.*
