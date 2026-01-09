# Documento de Análise de Requisitos - Inventto.ui (Versão 3.3)

## 1. Introdução

**Propósito**: O **Inventto** evolui de um simples gestor de estoque para um **Ecossistema de Vendas Híbrido e Colaborativo**. O sistema centraliza o controle de inventário para PMEs de vestuário e, simultaneamente, habilita um canal de vendas digitais com fricção mínima via WhatsApp.

O objetivo deste ciclo de desenvolvimento é transformar a plataforma de "Single-Player" (uso individual) para "Multi-Player" (times com permissões), criando a governança necessária para suportar a **Fase 3 (Storefront Público)** com segurança.

## 2. Descrição Geral do Sistema

**Visão geral**: O sistema opera agora sob um modelo de **Isolamento de Contexto**, separando rigorosamente a gestão interna da visualização pública.

Os pilares do sistema foram expandidos para:

1. **Gestão de Estoque Core**: Cadastro de produtos com variações e controle auditável de movimentações (Legado Fase 1).
2. **Segurança e Governança (RBAC)**: Controle hierárquico de acesso para donos, gerentes e vendedores.
3. **Vendas Digitais (Storefront)**: Catálogos públicos com persistência de pedidos ("Shadow Orders") e reservas de estoque inteligentes.

## 3. Premissas e Dependências

### **Dependências Técnicas (Stack)**:

* **Frontend**: React 19 + Vite (SPA).
* **Backend & Banco de Dados**: Supabase (PostgreSQL + Auth + Edge Functions).
* **Armazenamento de Imagens**: Cloudinary.
* **UI & Estilização**: Tailwind CSS + shadcn/ui.
* **Infraestrutura**: Vercel (Frontend) e Supabase Cloud (Backend).

### **Requisitos Não Funcionais**:

* **RNF001**: Interface responsiva (Mobile-First) crítica para vendedores e clientes finais.
* **RNF002**: Alta disponibilidade (SaaS operando 24/7).
* **RNF003**: Logs de auditoria imutáveis para todas as movimentações de estoque.
* **RNF004**: Isolamento de dados públicos via RPC (Remote Procedure Call) para segurança do Storefront.
* **RNF005**: Suporte mandatório a Timezones brasileiros para cálculo de expiração de reservas.

## 4. Requisitos Funcionais

### 4.1 - Autenticação e Acesso (Core)

**RF001: Login e Acesso**

* O sistema deve permitir acesso seguro via e-mail e senha.
* O gerenciamento de sessão será realizado via Supabase Auth.

### 4.2 - Gestão de Catálogo e Produtos (Core)

**RF002 a RF005 (Módulo de Produtos)**

* *Funcionalidades mantidas da Fase 1*: Criação de Categorias, Cadastro de Produtos Multi-Step (Variações/Grade), Listagem Filtrável e Edição/Inativação de SKUs.

### 4.3 - Gestão de Movimentações (Core)

**RF006 a RF008 (Módulo de Estoque)**

* *Funcionalidades mantidas da Fase 1*: Registro de Entrada/Saída/Ajuste, Histórico de Auditoria e Indicadores visuais de Estoque Mínimo no painel administrativo.

### 4.4 - Gestão de Usuários e Segurança (Fase 2 - Prioridade Atual)

**RF009: Definição de Papéis (RBAC)**

* **Descrição**: O sistema deve implementar três níveis hierárquicos de acesso imutáveis.
* **Roles Definidas**:
1. **OWNER (Dono)**: Acesso total. Único capaz de gerenciar membros e visualizar dados financeiros sensíveis.
2. **MANAGER (Gerente)**: Foco operacional. Pode criar produtos, ajustar estoque e configurar catálogos. Não gerencia usuários.
3. **SALES (Vendedor)**: Foco em atendimento. Acesso somente leitura aos produtos. Pode processar pedidos e baixar estoque via venda, mas **não** pode editar cadastros ou realizar ajustes manuais.

**RF010: Gestão de Membros da Equipe**

* **Descrição**: Interface para o OWNER administrar o time.
* **Funcionalidades**: Convidar membros por e-mail, alterar cargo (promoção/rebaixamento) e revogar acesso (inativar).

**RF011: Proteção de Interface (UI Guards)**

* **Descrição**: O Frontend deve ocultar proativamente elementos não autorizados para o usuário logado (ex: Vendedor não vê botão "Novo Produto").

### 4.5 - Catálogo Digital e Storefront (Fase 3)

**RF012: Configuração da Loja (Store Settings)**

* **Descrição**: Configurações da vitrine pública.
* **Dados**: Nome, Slug (URL amigável), WhatsApp de Destino.
* **Horário de Funcionamento (Crítico)**: Definição de hora de abertura/fechamento e, obrigatoriamente, o **Fuso Horário (Timezone)** da loja (ex: `America/Sao_Paulo`, `America/Manaus`), essencial para a regra de reservas.

**RF013: Gestão de Itens do Catálogo**

* **Descrição**: Seleção de quais produtos/variantes aparecem na vitrine.
* **Regra**: O preço de venda é definido no catálogo, desacoplado do produto físico.

**RF014: Experiência da Vitrine (Público)**

* **Indicador de Estoque**: Para segurança e estratégia comercial, a quantidade exata **nunca** é exibida. O sistema deve mostrar apenas:
1. **"Disponível"**: (Estoque confortável).
2. **"Últimas Peças"**: (Estoque baixo).
3. **"Esgotado"**: (Estoque zero).


**RF015: Fluxo "Shadow Order" (Pedido Rascunho)**

* **Gatilho**: Clique em "Finalizar no WhatsApp".
* **Processo**:
1. Sistema cria um pedido com status `PENDING` no banco.
2. Sistema realiza uma **Reserva Imediata (Soft Lock)** do estoque.
3. Sistema redireciona o cliente para o WhatsApp com o ID do pedido.

**RF016: Regra de Expiração de Reservas (TTL Dinâmico)**

* **Objetivo**: Evitar travamento de estoque por pedidos não pagos.
* **Lógica**:
* Se pedido feito durante horário comercial: Expira em **2 horas**.
* Se pedido feito com loja fechada: Expira em **2 horas após a abertura** do próximo dia útil (baseado no Timezone configurado no RF012).

**RF017: Notificação de Expiração de Pedido**

* **Descrição**: Envio automático de notificação via WhatsApp quando um pedido expirar.
* **Processo**:
1. Sistema verifica a expiração de pedidos pendentes.
2. Se um pedido estiver prestes a expirar (menos de 30 minutos), envia uma notificação via WhatsApp.

---

### Próximos Passos (Roadmap Estratégico)

* **Fase 2 (Imediata):** Implementação completa do módulo `Users`, migração de banco para Roles e atualização das políticas RLS.
* **Fase 3 (Sequência):** Desenvolvimento das tabelas de `Catalogs` e `Orders`, seguido pela construção do Storefront público.
* **Fase 4 (Futuro):** Painel do Revendedor B2B (Login para clientes externos e tabelas de preço diferenciadas).