# Documento de Análise de Requisitos - Gestor de Estoques (Fase 1)

## 1. Introdução

**Propósito**: Centralizar e automatizar o controle de inventário para pequenas e médias empresas (PMEs), substituindo planilhas manuais e processos propensos a erros. O sistema permitirá um gerenciamento preciso de produtos, incluindo suas variações e composições (kits), o monitoramento em tempo real dos níveis de estoque e a geração de alertas automáticos para evitar rupturas (*stockouts*).

O objetivo é oferecer uma ferramenta web intuitiva onde gestores possam cadastrar seu catálogo, registrar todas as movimentações de entrada e saída, e obter insights valiosos através de um dashboard e relatórios. Com isso, o **Gestor de Estoques** visa otimizar o processo de compra, reduzir perdas e fornecer dados estratégicos para uma tomada de decisão mais inteligente e eficaz.

## 2. Descrição Geral do Sistema

**Visão geral do sistema**: O **Gestor de Estoques** é uma plataforma web para o controle completo do inventário de uma empresa. A solução foi desenhada para ser o ponto central de verdade sobre o que a empresa tem em estoque, quanto vale e como esses ativos se movimentam.

O núcleo do sistema na Fase 1 é composto por quatro pilares:
1.  **Gestão de Catálogo**: Permite o cadastro detalhado de produtos, com suporte a **variações** (como cor e tamanho).
2.  **Controle de Movimentações**: Cada alteração no estoque é registrada em um **histórico (Audit Trail)**, garantindo total rastreabilidade sobre entradas, saídas, vendas e ajustes manuais.
3.  **Inteligência de Estoque**: O sistema monitora os níveis de estoque e envia **alertas automáticos de estoque mínimo**, além de apresentar um **dashboard** com os principais indicadores (KPIs) e relatórios básicos sobre o desempenho dos produtos.
4.  **Gestão de Acessos**: Um sistema seguro de autenticação e gerenciamento de usuários com diferentes níveis de permissão.

A interface do sistema será responsiva, garantindo uma experiência de uso fluida tanto em desktops quanto em dispositivos móveis, permitindo que o gestor controle seu estoque de qualquer lugar.

## 3. Premissas e Dependências

### **Premissas**:
- O sistema será acessado por usuários com dispositivos móveis e desktop, sendo essencial que a interface seja responsiva.
- O estabelecimento deverá ter uma conexão de internet estável para garantir o funcionamento contínuo do sistema.
- O sistema operará 24/7, exigindo alta disponibilidade da infraestrutura e monitoramento contínuo.

### **Dependências Técnicas**:
- **Backend**: O sistema utilizará Node.js com o framework NestJS.
- **Frontend**: O frontend será construído com o framework Angular.
- **Banco de Dados**: O sistema dependerá de PostgreSQL para persistência dos dados.
- **Infraestrutura**: A infraestrutura sugerida é AWS (ex: RDS para o banco de dados) e Vercel para o deploy do frontend.
- **Segurança**: O sistema adotará JWT para autenticação e autorização de usuários.

### **Requisitos Não Funcionais**:
- **RNF001**: O sistema deve ser capaz de suportar um número X de usuários simultâneos sem degradação perceptível de desempenho.
- **RNF002**: O tempo de resposta para as operações críticas (ex: registro de movimentação) não pode exceder 3 segundos em 95% das interações.
- **RNF003**: O sistema deverá ser capaz de escalar horizontalmente para suportar o crescimento no volume de dados e usuários.
- **RNF004**: O sistema deverá garantir 99,9% de disponibilidade durante o ano.
- **RNF005**: A interface do usuário será intuitiva e responsiva, com foco na experiência do usuário (UX).
- **RNF008**: Logs de auditoria serão gerados para todas as ações críticas do sistema (criação/edição de produtos, ajustes de estoque), permitindo rastreamento de atividades.

## 4. Fluxo geral do sistema e requisitos funcionais

### 4.1 - Registro da Empresa e Usuário Administrador

#### **RF001: Registro da Empresa**
- **Descrição**: O sistema deve permitir que o representante de uma nova empresa se registre, fornecendo dados da empresa e credenciais de acesso. O registro cria a conta da empresa e o primeiro usuário administrador.
- **Processo**:
    - O usuário acessa a página de registro do sistema.
    - O usuário preenche os campos obrigatórios: Nome completo do responsável, Nome Fantasia da Empresa, e-mail, senha, e um documento (CPF ou CNPJ).
    - Se o documento informado for um CNPJ, o campo Razão Social se torna obrigatório.
    - O sistema valida os dados: e-mail e documento devem ser únicos, e a senha deve atender aos critérios de segurança.
    - Se os dados forem válidos, o sistema registra a empresa e o usuário principal, enviando um e-mail de confirmação para o endereço fornecido.
    - Após a confirmação, o usuário pode acessar o painel de controle.
- **Entradas**:
    - `Document`: Documento (CNPJ ou CPF).
    - `CorporateName`: Razão Social (obrigatório se `Document` for CNPJ).
    - `FullName`: Nome completo do responsável.
    - `CompanyName`: Nome fantasia da empresa.
    - `Email`: E-mail de acesso.
    - `Password`: Senha da conta.
- **Saídas**:
    - E-mail de confirmação do registro.
    - Criação da conta da empresa e do usuário administrador.
- **Regras de Negócio**:
    - **RN001**: O e-mail e o documento devem ser únicos no sistema.
    - **RN002**: A senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.

### 4.2 - Autenticação

#### **RF002: Confirmação de Cadastro**
- **Descrição**: Após o registro da empresa, a conta do usuário administrador deve ser ativada através de um link de confirmação enviado para o e-mail cadastrado.
- **Regras de Negócio**:
    - **RN003**: O link de confirmação deve expirar após um período determinado (ex: 24 horas).

#### **RF003: Login de Usuário**
- **Descrição**: O sistema deve permitir que usuários com contas ativas acessem o painel de controle fornecendo seu e-mail e senha.
- **Regras de Negócio**:
    - **RN004**: O sistema deve verificar a correspondência exata de e-mail e senha com um registro ativo no banco de dados.

#### **RF004: Solicitação de Recuperação de Senha**
- **Descrição**: O sistema deve fornecer um mecanismo para que usuários que esqueceram sua senha possam iniciar o processo de redefinição.
- **Regras de Negócio**:
    - **RN005**: O token de redefinição de senha deve ser único, de uso único e ter um tempo de expiração curto (ex: 1 hora).

#### **RF005: Redefinição de Senha**
- **Descrição**: O sistema deve permitir que o usuário defina uma nova senha de acesso através do link seguro recebido por e-mail.
- **Regras de Negócio**:
    - **RN006**: O sistema deve validar o token (válido, não expirado, correspondente ao usuário).
    - **RN007**: A nova senha deve seguir os mesmos critérios de segurança da senha de cadastro (RN002).
    - **RN008**: O token deve ser invalidado imediatamente após a redefinição.

### 4.3 - Gestão de Catálogo

#### **RF006: Criar Categoria de Produtos**
- **Descrição**: O sistema deve permitir que um usuário autorizado crie novas categorias para agrupar produtos.
- **Regras de Negócio**:
    - **RN009**: Apenas usuários autorizados podem criar categorias.
    - **RN010**: O nome da categoria deve ser único no sistema.
    - **RN011**: O nome da categoria deve ter entre 3 e 50 caracteres.

#### **RF007: Listar Categorias de Produtos**
- **Descrição**: O sistema deve exibir uma lista de todas as categorias de produtos cadastradas.
- **Regras de Negócio**:
    - **RN012**: A lista deve refletir em tempo real o estado atual das categorias.

#### **RF008: Atualizar Categoria de Produtos**
- **Descrição**: O sistema deve permitir que um usuário autorizado edite o nome de uma categoria existente.
- **Regras de Negócio**:
    - **RN013**: Apenas usuários autorizados podem editar categorias.
    - **RN014**: O sistema deve confirmar que a categoria com o ID informado existe.
    - **RN015**: A regra de nome único (RN010) também se aplica na atualização.

#### **RF009: Excluir Categoria de Produtos**
- **Descrição**: O sistema deve permitir que um usuário autorizado remova uma categoria, desde que ela não esteja sendo utilizada por nenhum produto.
- **Regras de Negócio**:
    - **RN016**: Apenas usuários autorizados podem excluir categorias.
    - **RN017**: A exclusão é permitida apenas se nenhum produto estiver associado à categoria.

### 4.4 - Gestão de Produtos

#### **RF010: Cadastrar Novo Produto**
- **Descrição**: O sistema deve prover um fluxo multi-step para o cadastro de produtos, suportando produtos simples ou com múltiplas variações. O fluxo permite o upload e associação de imagens na mesma jornada de criação.
- **Processo (Multi-Step)**:
    - **Passo 1: Informações Básicas e Imagens**
        - **Objetivo**: Definir a identidade principal do produto e fazer o upload de todos os arquivos de imagem necessários.
        - **Ações**: O usuário preenche os campos (`Nome`, `SKU`, `Descrição`, `Custo`, `Categoria`), ativa o toggle `"Possui Variações?"` para `ON` e faz o upload de todas as imagens do produto.
        - **Lógica**: Como o produto terá variações, o ícone para marcar uma imagem como "principal" neste passo fica oculto.
    - **Passo 2: Atributos da Variação**
        - **Objetivo**: Definir as regras de como o produto varia.
        - **Ações**: Em uma interface de "cartões", o usuário define os atributos e seus valores (ex: Atributo `Cor` com valores `Azul, Branco, Preto`; Atributo `Tamanho` com valores `P, M, G`).
    - **Passo 3: Detalhes das Variações**
        - **Objetivo**: Gerenciar os detalhes específicos de cada variação gerada.
        - **Ações**: O sistema exibe uma tabela com todas as combinações. O usuário preenche as colunas (`SKU Específico`, `Preço`, `Custo`, `Qtd. Estoque`, `Estoque Mínimo`). Para a coluna `Imagem`, o usuário clica em um ícone que abre um modal, onde ele seleciona as imagens para aquela variação, define a principal e pode replicar a seleção para outras variações similares (ex: aplicar as imagens da cor "Azul" para todos os tamanhos).
    - **Passo 4: Resumo e Confirmação**
        - **Objetivo**: Permitir uma revisão final de todos os dados inseridos.
        - **Ações**: O usuário visualiza um resumo não editável de tudo que foi configurado e clica em `Salvar Produto`.
- **Regras de Negócio**:
    - **RN018**: Apenas usuários autorizados podem cadastrar produtos.
    - **RN019**: Campos como `Nome`, `SKU`, `Preço` e `Categoria` são obrigatórios.
    - **RN020**: Cada `SKU` (seja de produto simples ou variação) deve ser único.
    - **RN021**: Preços, custos e quantidades devem ser valores numéricos positivos.
    - **RN022**: A categoria selecionada deve existir.

#### **RF011: Listar Produtos**
- **Descrição**: O sistema deve exibir uma lista paginada e filtrável de todos os produtos cadastrados, incluindo a imagem de destaque.
- **Regras de Negócio**:
    - **RN025**: O sistema deve aplicar uma paginação padrão.
    - **RN026**: Para produtos com variações, o estoque exibido na lista principal pode ser a soma de todas as variações.
    - **RN027**: A busca deve ser flexível (ex: por nome ou SKU).

#### **RF012: Atualizar Produto**
- **Descrição**: O sistema deve permitir a edição de todas as informações de um produto existente, seguindo um fluxo similar ao de criação.
- **Regras de Negócio**:
    - **RN029**: Apenas usuários autorizados podem editar produtos.
    - **RN030**: O SKU de uma variação, uma vez criado e com movimentações, não deve ser editável para manter a integridade do histórico.
    - **RN031**: Todas as validações do cadastro se aplicam à atualização.

#### **RF013: Excluir Produto**
- **Descrição**: O sistema deve permitir que um usuário remova um produto do catálogo. Se o produto tiver histórico de movimentação, a ação permitida será "Inativar" em vez de "Excluir".
- **Regras de Negócio**:
    - **RN032**: Apenas usuários autorizados podem excluir/inativar produtos.
    - **RN033**: Um produto com movimentações de estoque registradas não pode ser excluído permanentemente.

### 4.5 - Gestão de Movimentações de Estoque

#### **RF014: Registrar Movimentação Manual de Estoque**
- **Descrição**: Permitir o registro manual de `Entrada`, `Saída` ou `Ajuste` no estoque de um SKU específico, sempre com um motivo para fins de auditoria.
- **Regras de Negócio**:
    - **RN034**: Apenas usuários autorizados podem registrar movimentações.
    - **RN035**: A quantidade deve ser um número inteiro e positivo.
    - **RN036**: A lógica de cálculo (`soma`, `subtração`, `substituição`) varia conforme o tipo de movimentação.
    - **RN037**: O campo `Motivo` é obrigatório para `Saída` e `Ajuste`.

#### **RF015: Visualizar Histórico de Movimentações (Audit Trail)**
- **Descrição**: Apresentar um histórico cronológico, detalhado e filtrável de todas as movimentações de estoque.
- **Regras de Negócio**:
    - **RN038**: Um registro no histórico é **imutável**. Não pode ser editado ou excluído.

#### **RF016: Notificação de Estoque Mínimo**
- **Descrição**: O sistema deve monitorar e notificar proativamente os usuários quando o estoque de um item atingir seu nível mínimo.
- **Regras de Negócio**:
    - **RN039**: O sistema deve gerar apenas um alerta por item, evitando duplicidade enquanto o estoque não for reabastecido.
    - **RN040**: O usuário deve poder gerenciar (marcar como lido/resolvido) os alertas.

### 4.6 - Dashboard e Relatórios

#### **RF017: Visualização do Dashboard Principal**
- **Descrição**: Apresentar um painel de controle como tela inicial após o login, com os principais KPIs e informações do inventário.
- **Componentes**:
    - Card de Resumo do Inventário (Valor total a custo, SKUs totais, itens em baixo estoque).
    - Widget de Alertas Recentes.
    - Widget de Últimas Movimentações.
    - Widget "Top 5 Produtos por Valor em Estoque".
- **Regras de Negócio**:
    - **RN041**: O dashboard deve ser a página padrão após o login.
    - **RN042**: Os dados devem ser precisos e refletir o estado atual do inventário.

#### **RF018: Gerar Relatório de Posição de Estoque**
- **Descrição**: Permitir a geração e exportação (CSV/Excel) de um relatório detalhado com a "fotografia" do estoque em tempo real.
- **Regras de Negócio**:
    - **RN043**: A exportação deve refletir todos os dados que correspondem aos filtros aplicados.
