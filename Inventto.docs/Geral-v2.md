# Documento de Análise de Requisitos - Gestor de Estoques (Fase 1)

## 1. Introdução

**Propósito**: Centralizar e automatizar o controle de inventário para pequenas e médias empresas (PMEs), com foco especial em vestuário (varejo e atacado). O sistema substituirá controles manuais, permitindo um gerenciamento preciso de produtos com variações (grades), monitoramento de estoque em tempo real e rastreabilidade total das movimentações.

O objetivo desta Fase 1 é entregar uma ferramenta robusta para **Cadastrar** e **Movimentar** o estoque, criando a base operacional necessária para futuras integrações e vendas B2B.

## 2. Descrição Geral do Sistema

**Visão geral**: O **Gestor de Estoques** é a fonte da verdade sobre a quantidade física dos ativos da empresa.

O núcleo do sistema na Fase 1 é composto por três pilares:
1.  **Gestão de Catálogo**: Cadastro detalhado de produtos com suporte avançado a **variações** (grades de cor e tamanho).
2.  **Controle de Movimentações**: Registro auditável e imutável de toda alteração no estoque (Entradas, Saídas, Ajustes).
3.  **Segurança e Acesso**: Controle de acesso seguro para proteção dos dados operacionais.

## 3. Premissas e Dependências

### **Dependências Técnicas (Stack)**:
- **Frontend**: React 19 + Vite (SPA).
- **Backend & Banco de Dados**: Supabase (PostgreSQL + Auth + Edge Functions).
- **Armazenamento de Imagens**: Cloudinary.
- **UI & Estilização**: Tailwind CSS + shadcn/ui.
- **Infraestrutura**: Vercel (Frontend) e Supabase Cloud (Backend).

### **Requisitos Não Funcionais**:
- **RNF001**: Interface responsiva (Mobile-First) para operação ágil em chão de loja/estoque via tablets ou smartphones.
- **RNF002**: Alta disponibilidade (SaaS operando 24/7).
- **RNF003**: Logs de auditoria imutáveis para todas as movimentações de estoque.
- **RNF004**: Performance otimizada para listagens com centenas de SKUs (suporte a virtualização ou paginação eficiente).

## 4. Requisitos Funcionais

### 4.1 - Autenticação e Acesso

**RF001: Login e Acesso**
- O sistema deve permitir acesso seguro via e-mail e senha.
- O gerenciamento de sessão e recuperação de senha será realizado via Supabase Auth.

### 4.2 - Gestão de Catálogo (Categorias)

**RF002: Criar e Listar Categorias**
- **Descrição**: Permitir a criação rápida de categorias para organização dos produtos.
- **Regras de Negócio**:
    - A funcionalidade de **Edição** e **Exclusão** de categorias não estará disponível nesta fase para garantir a integridade histórica dos dados vinculados.
    - O nome da categoria deve ser único no sistema.
    - A criação de categorias pode ser feita diretamente no fluxo de cadastro de produtos (inline) para agilizar a operação.

### 4.3 - Gestão de Produtos

**RF003: Cadastrar Novo Produto (Fluxo Multi-Step)**
- **Descrição**: Cadastro de produtos simples ou com múltiplas variações (grade).
- **Passo 1 (Informações Básicas)**: Definição de Nome, SKU Base, Categoria, Descrição e upload de imagens gerais.
- **Passo 2 (Atributos)**: Definição dinâmica de atributos (ex: Cor, Tamanho, Tecido).
- **Passo 3 (Variantes)**: Geração automática das combinações (Produto Cartesiano). Configuração individual de **SKU da variação** e **Estoque Mínimo**. Associação de imagens específicas para cada variação (ex: foto da camisa vermelha vinculada à variante "Vermelho").
- **Passo 4 (Resumo)**: Revisão e confirmação dos dados.
- **Regras de Negócio**:
    - **Estoque Inicial Zero**: Todo produto nasce com estoque físico 0. A entrada inicial deve ser realizada obrigatoriamente via funcionalidade de Movimentação, garantindo que exista um registro de auditoria (quem criou, quando e origem).
    - **Escopo de Dados**: Campos financeiros (Preço de Venda, Custo) **não** fazem parte do cadastro físico nesta fase.

**RF004: Listar e Filtrar Produtos**
- **Descrição**: Exibição paginada do catálogo.
- **Funcionalidades**:
    - Busca textual por Nome ou SKU.
    - Filtro por Categorias.
    - Expansão de linhas (Nested Table) para visualizar detalhes das variações sem sair da listagem principal.

**RF005: Editar e Inativar Produto**
- **Descrição**: Permite alterar dados cadastrais descritivos.
- **Regras de Negócio**:
    - **Imutabilidade Crítica**: SKUs que já possuem histórico de movimentação não devem ser alterados livremente.
    - **Exclusão Lógica**: Produtos com histórico não podem ser excluídos permanentemente, apenas "Inativados" (soft delete) para manter a integridade do banco de dados.

### 4.4 - Gestão de Movimentações de Estoque

**RF006: Registrar Movimentação Manual**
- **Descrição**: Tela dedicada para dar entrada ou saída em itens do estoque.
- **Tipos de Movimentação**:
    1.  **Entrada**: Compras, Devoluções, Produção.
    2.  **Saída**: Vendas, Perdas, Bonificações, Uso Interno.
    3.  **Ajuste**: Correção de Inventário (Balanço).
- **Dados Obrigatórios**: SKU (seleção do produto/variação), Quantidade (sempre positiva), Tipo da Operação e Motivo/Observação.
- **Regras de Negócio**:
    - O sistema deve impedir movimentações de saída que deixem o estoque negativo (configurável futuramente, mas bloqueado por padrão na Fase 1).
    - Toda movimentação gera um registro indelével no banco de dados.

**RF007: Histórico de Movimentações (Audit Trail)**
- **Descrição**: Visualização cronológica de todas as operações realizadas.
- **Dados Exibidos**: Data/Hora, Usuário, Produto, Tipo, Quantidade Anterior, Quantidade Movimentada, Quantidade Nova.

**RF008: Indicadores de Estoque**
- **Descrição**: Feedback visual na listagem de produtos para itens que atingiram o nível de alerta.
- **Lógica**: Se `Estoque Atual` <= `Estoque Mínimo`, exibir indicador de alerta (ícone ou cor diferenciada).

---

### Próximos Passos (Roadmap Estratégico)

*Estas funcionalidades não compõem a Fase 1, mas guiam as decisões de arquitetura atuais.*

* **Fase 1.5 (Integração):** Importador de Vendas (CSV/Excel) para processamento em lote de movimentações vindas de PDVs externos.
* **Fase 2 (Expansão B2B):** Catálogo Digital Online para revendedores, com visualização de estoque em tempo real e solicitação de pedidos.