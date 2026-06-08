<<<<<<< HEAD
# Gestor Financeiro EPP 2026 ── KM Gestor

Este é um sistema Web completo e altamente refinado para o gerenciamento financeiro de eventos, projetado sob medida com componentes interativos e responsivos de alta fidelidade para uso móvel e desktop (Base 44px de área de toque para acessibilidade impecável).

O projeto é integrado nativamente com o **Supabase** para sincronização na nuvem e conta com um sistema inteligente de **Autenticação de Senha Mestra**, além de **mecanismos de cache robustos e modo local (offline)** para garantir o funcionamento estável mesmo sem conexão à rede.

---

## 🎯 Principais Funcionalidades

- **Regras Financeiras Personalizadas (Divisão EPP)**:
  - Separação automatizada de impostos sobre nota fiscal.
  - Abatimento inteligente de despesas com juros e maquininha no faturamento bruto, sem reduzir a cota-base de sócios.
  - Rateio parametrizável (Divisão para 2 ou 3 participantes).
- **Interface Otimizada de Toque (Base 44)**:
  - Botões, inputs, checklists de despesa e modais dimensionados para toque de polegar sem fadiga em dispositivos portáteis.
  - Painéis informativos em Bento Grid.
- **Histórico Completo & Exportação**:
  - Filtros e listagem cronológica estruturada.
  - **Relatórios Automatizados em 1 Clique**: Gera resumos organizados prontos para compartilhamento via WhatsApp.
  - Edição dinâmica e controle de exclusão seguro exigindo validação de PIN de segurança.
- **Estatísticas e Dashboards Financeiros**:
  - Painéis analíticos construídos com `recharts` mostrando faturamento total, lucro líquido real acumulado, distribuição de custos e evolução cronológica.
- **Híbrido e Resiliente (Conexão Garantida)**:
  - Ativação inteligente de **Modo Local (Offline)** com salvamento persistente no `LocalStorage` se o banco remoto inicial falhar ou estiver ausente.

---

## ⚙️ Configuração Rápidas

### 1. Variáveis de Ambiente (.env)
Copie o arquivo `.env.example` para `.env` e preencha as configurações de rede do seu projeto no Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 2. Estrutura de Banco de Dados (Supabase / MySQL)
Você pode executar o script fornecido no arquivo `supabase.sql` diretamente no editor SQL do seu painel Supabase para criar e estruturar as tabelas necessárias:

*   **Tabela `events`**: Armazena os lançamentos de faturamentos, divisores e impostos.
*   **Tabela `expenses`**: Grava os custos vinculados, com flags de reembolso para os administradores.
*   **Tabela `settings`**: Configuração global dos padrões corporativos.

---

## 🚀 Como Executar o Projeto Localmente

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Gere a versão de produção (Build)**:
   ```bash
   npm run build
   ```

---

## 🔒 Credenciais Padrão do Sistema
- **Acesso ao Painel**: Senha Mestra: `EVENTOS 2026`
- **Exclusão de Registros (PIN)**: PIN de Segurança: `EVENTOS 2026`

---

*Desenvolvido com foco em alta eficiência operacional, estética visual impecável e segurança de dados.*
=======
# GESTOR-KM-EPP---NOVO-2026
GESTOR KM EPP - NOVO 2026
>>>>>>> 64b81e0d6bfeefc3cc47f0a548106d914bf5ab6a
