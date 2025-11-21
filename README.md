# ⚡ Painel de Administração Powershare

> Plataforma administrativa interna para gerenciamento de produtores e operações de crédito de energia distribuída da Powershare.

---

## 📖 Sobre o Projeto

Este projeto é a plataforma de administração central (back-office) da Powershare. Ele foi desenvolvido para fornecer ao time interno as ferramentas necessárias para gerenciar o ecossistema de produtores de energia distribuída.

O objetivo principal é controlar o fluxo de cadastro e validação de novos produtores (**onboarding**), garantindo a conformidade (compliance) e a qualidade dos parceiros na plataforma. A partir deste painel, a equipe de operações pode aprovar, rejeitar e auditar a documentação enviada, mantendo a integridade do marketplace de créditos de energia.

## ✨ Funcionalidades Principais

* [x] **Dashboard de Visão Geral:** Métricas principais, estatísticas de produtores e atalhos para cadastros pendentes.
* [x] **Gestão de Produtores:** Lista completa de produtores cadastrados, com status (Pendente, Aprovado, Rejeitado).
* [x] **Fluxo de Aprovação:** Interface dedicada para analisar novos cadastros, visualizar documentos e tomar ações (Aprovar/Rejeitar).
* [x] **Visualizador de Documentos:** Acesso seguro à documentação enviada por cada produtor (ex: Contratos, Faturas de Energia, Documentos Pessoais).
* [x] **Autenticação Segura:** Sistema de login e logout exclusivo para a equipe interna da Powershare.


## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

* **Core:** [React](https://reactjs.org/), [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Estilização:** CSS

## 🚀 Como Executar o Projeto Localmente

Siga estas instruções para configurar e rodar o projeto em sua máquina local para desenvolvimento e testes.

### Pré-requisitos

* [Node.js](https://nodejs.org/pt-br) (v18.x ou superior)
* [npm](https://www.npmjs.com/) (ou [Yarn](https://yarnpkg.com/))

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/FrnNardes/area-adm.git
    ```

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd area-adm
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    * Este projeto precisa de variáveis de ambiente para conectar-se à API e outros serviços.
    * Crie um arquivo `.env` na raiz do projeto, copiando o exemplo `.env.example` (se houver).
    * Preencha as variáveis necessárias:
        ```.env
        # Exemplo de URL da API de desenvolvimento
        VITE_API_BASE_URL=[https://api-dev.powershare.com/v1](https://api-dev.powershare.com/v1)
        ```

5.  **Execute o projeto em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```

6.  **Abra seu navegador e acesse:**
    * `http://localhost:5173` (ou a porta que o Vite indicar no seu terminal)

## 📄 Licença

Este projeto é de propriedade da Powershare. Todos os direitos reservados.

---
© 2025 Powershare.


