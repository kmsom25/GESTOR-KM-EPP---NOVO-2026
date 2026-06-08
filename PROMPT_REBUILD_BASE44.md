# MASTER PROMPT: RECONSTRUÇÃO GESTOR FINANCEIRO EPP (KM GESTOR) - BASE 44PX (Touch Targets)

Use este prompt em qualquer LLM (como Gemini, Claude ou ChatGPT) para reconstruir ou replicar com 100% de exatidão o aplicativo de gestão de eventos móvel e desktop, garantindo responsividade impecável, design refinado e conformidade estrita com as diretrizes de toque móvel de 44px (Base 44).

---

## 📋 INSTRUÇÕES DE SISTEMA & REGRAS DE DESIGN (BASE 44PX)

Você é um Engenheiro de Software Sênior especialista em React, TypeScript e Tailwind CSS. Sua missão é reconstruir o sistema **Gestor de Eventos EPP 2026** seguindo os padrões descritos abaixo:

1. **Acessibilidade Móvel (Base 44px)**: 
   - Todos os elementos clicáveis (botões, inputs, abas, links e seletores de checkbox) devem ter uma área de toque ("touch target") mínima de **44px por 44px** em dispositivos móveis.
   - Inputs de texto, botões de ação rápidos e ícones interativos devem ser revestidos com padding adequado (`p-3`, `h-11`, `h-12`) para nunca infringir esta regra.
   - Espaçamento entre botões e ações adjacentes deve ser de no mínimo `gap-2` (8px) para evitar cliques acidentais.

2. **Responsividade Fluida (Desktop-First Precision & Mobile-First Code)**:
   - O aplicativo deve ser 100% responsivo, adaptando-se perfeitamente desde telas pequenas de smartphones (iPhone SE, etc.) até telas ultra-wide.
   - Utilize a técnica Bento Grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) para painéis e estatísticas de modo que o preenchimento seja natural.
   - Menus de navegação e abas devem se adaptar a uma barra inferior interativa ou lista simplificada em telas menores, mantendo tamanho adequado para o polegar.

3. **Arquitetura de Dados Resiliente (Supabase + LocalStorage Fallback)**:
   - O app roda de forma híbrida. Se as chaves do Supabase estiverem ausentes ou ocorrer um erro de rede ("Failed to fetch"), o sistema deve avisar o usuário graciosamente e oferecer um **Modo Local (Offline)**. 
   - No Modo Local, os dados devem ser guardados no `LocalStorage`, garantindo que o usuário possa usar todas as funções normalmente e exportar/re-conectar mais tarde de forma transparente.

4. **Identidade Visual Temática (Cosmic Dark / Slate Light)**:
   - Paleta de cores moderna: Fundo escuro Obsidian (`#060608` ou `#0a0a0c`), acentos dourados (`#EAB308` para botões principais), cinza ardósia para painéis interativos (`#18181b` com bordas sutis).
   - Tipografia limpa utilizando fontes modernas sem serifa ("Inter" ou "Outfit") e tipografia mono ("JetBrains Mono" ou "Fira Code") para números, fórmulas e relatórios financeiros.

---

## 🛠️ ESPECIFICAÇÕES TÉCNICAS E DE DADOS

### 1. Banco de Dados (Estrutura Equivalente a SQL e MySQL)
As tabelas no Supabase ou MySQL local devem seguir rigorosamente esta estrutura relacional:

```sql
-- Tabela de Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  event_date DATE,
  event_time TIME,
  revenue DECIMAL(12, 2) DEFAULT 0,
  divider DECIMAL(12, 2) DEFAULT 2,
  invoice_tax_percentage DECIMAL(5, 2) DEFAULT 6,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Despesas/Reembolsos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  value DECIMAL(12, 2) DEFAULT 0,
  paid_km BOOLEAN DEFAULT FALSE, -- Pago por Kleber Marcio (KM)
  paid_ms BOOLEAN DEFAULT FALSE  -- Pago por Marcone Silva (MS)
);

-- Tabela de Configurações Globais
CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1,
  default_tax_percentage DECIMAL(5, 2) DEFAULT 6,
  default_divider DECIMAL(12, 2) DEFAULT 2,
  business_name VARCHAR(255) DEFAULT 'SOM GESTOR EPP',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);
```

### 2. Regras de Cálculo Financeiro (Lógica de Divisão EPP)
- **Despesas de Juros/Maquininha**: Despesas cujo rótulo contenha as palavras "juros", "taxa" ou "maquininha" são despesas técnicas. Elas NÃO devem reduzir o lucro que entra no rateio da divisão de Marcone e outros sócios. Em vez disso, são reembolsadas integralmente para Kleber (quem arca com a estrutura de antecipação financeira).
- **Imposto de Nota Fiscal**: Calculado como `Faturamento Bruto * Alíquota Fiscal (%) / 100`. Este valor é reservado para amortização fiscal de Kleber.
- **Lucro Líquido a Ratear**: `Faturamento Bruto - (Todas as Despesas Não-Juros) - Valor do Imposto`.
- **Cálculo da Cota Base**: `Lucro Líquido a Ratear / Divisor (2 ou 3)`.
- **Ganhos Finais de Cada Integrante**:
  - **Kleber Marcio**: `Cota Base + Valor do Imposto + Reembolsos pagos do próprio bolso (paidKM) + Despesas de Juros/Maquininha`.
  - **Marcone Souza**: `Cota Base + Reembolsos do próprio bolso (paidMS)`.
  - **Marcelo Lavra** *(se divisor for 3)*: `Cota Base` (sem adicionais).

---

## 🖥️ TELAS, ABAS E INTERFACES EXIGIDAS (MODELO 100% IGUAL)

Gere uma aplicação SPA contendo os seguintes módulos visualmente idênticos e integrados em uma única interface enxuta com navegação de Abas:

### Tela de Autenticação (Login)
- **Design de Entrada**: Centralizado com fundo Obsidian profundo, logo estilizada do app em vetor harmônico, com input de senha centralizado.
- **Validação de Acesso**: A senha mestra para entrada é **`EVENTOS 2026`** (comportamento insensível a maiúsculas/minúsculas e sem espaços adicionais no final). Uma vez digitada com sucesso, concede acesso imediato ao app.

### Painel de Configurações Resilientes (Aviso de Conexão)
- Se a URL ou Key do Supabase falharem ou estiverem ausentes no ambiente, o sistema exibe um painel de diagnóstico com alternativas:
  1. Cadastro em tempo real das credenciais de conexão armazenadas de forma segura no `LocalStorage` do navegador.
  2. Botão de ativação em um clique do **"Modo Local (Offline)"**, liberando o uso imediato do sistema salvando os eventos localmente.

### Aba 1: Novo Evento (Calculadora de Custos & Lançamento)
- Campo para Nome do Evento, Data, Hora, Faturamento Bruto (formatado em real brasileiro `R$` em tempo real) e Seleção do Divisor (2 Sócios ou 3 Sócios).
- **Seção de Despesas Dinâmica**:
  - Campo de adição rápida (Nome da despespa + Valor R$).
  - Grid mostrando despesas listadas. Cada despesa deve possuir dois checkboxes claramente distintos, com **tamanho mínimo de touch target de 44px**:
    1. `KM` (checkbox que seta `paidKM` como true quando selecionado).
    2. `MS` (checkbox que seta `paidMS` como true quando selecionado).
  - Botão de exclusão da despesa na lateral (Ícone Trash com tamanho de toque de 44px).
- **Preview de Resultados**: Caixa de somatório computando dinamicamente os valores de rateio que serão salvos em tempo real enquanto o usuário digita.

### Aba 2: Histórico de Eventos salvos
- Lista ordenada por data crescente/decrescente dos eventos cadastrados no banco de dados.
- Cartões com visual limpo e refinado de cada evento exibindo:
  - Faturamento Bruto, Data e Identificação visual de divisão de lucros.
  - Demonstração resumida do lucro real final de cada participante.
- **Ações Rápidas por Evento (alinhadas à Base 44 de toque)**:
  - **Copiar Resumo**: Gera um relatório formatado em texto para WhatsApp que o usuário copia com 1 clique.
  - **Editar**: Reabre o formulário preenchido em janela modal de tamanho grande com espaçamento responsivo apropriado para alteração de quaisquer dados.
  - **Excluir**: Exclui o evento do banco. Para evitar exclusões acidentais, exibe modal de segurança exigindo confirmação de PIN (**`EVENTOS 2026`**).

### Aba 3: Estatísticas e Dashboards Financeiro
- Painel focado em análises usando componentes `recharts`.
- Bento Grid com 5 métricas essenciais:
  1. Faturamento Total Acumulado.
  2. Lucro Líquido Real Geral.
  3. Total de Despesas Registradas.
  4. Total de Imposto Acumulado.
  5. Gráfico de Pizza detalhando qual parcela das despesas correspondem a custos normais versus taxas de juros/maquininha.
- Gráficos Interativos:
  - **Gráfico de Barras**: Faturamento mensal e evolução cronológica.
  - **Gráfico de Linha**: Proporção de crescimento dos lucros entre Kleber e Marcone mês a mês.

### Aba 4: Configurações Gerais
- Formulários para definir e calibrar valores padrão do sistema operacional (Taxa padrão de Nota Fiscal, Divisor Base preferido, Nome corporativo exibido nos relatórios).
- Opção para redefinir o banco de dados online ou deletar o armazenamento local seguro.

---

## 🎯 GARANTIAS DE INTEGRIDADE DE CÓDIGO
- O código TypeScript deve possuir tratamento de erros (`try/catch`) em todas as operações assíncronas do banco de dados.
- Devem ser usadas animações do Framer Motion (`motion` ou `@framer-motion`) para abertura de modais e transição estilosa de abas (fadings suaves e deslizamentos).
- Sem dependência de bibliotecas externas de ícones que não sejam `lucide-react`.
- O código gerado deve ser modular, limpo, bem documentado e 100% pronto para compilação em ambiente de produção (rodando na porta `3000`).
