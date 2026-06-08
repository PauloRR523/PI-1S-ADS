# Dicionário de Dados — Flow
Versão referencial 1.1.0 | Persistência: `localStorage` do navegador (chave prefixo `flow_`)

---

## Sumário

1. [Visão Geral da Arquitetura de Dados](#1-visão-geral-da-arquitetura-de-dados)
2. [Entidades](#2-entidades)
   - [users](#21-users--usuários-do-sistema)
   - [alunos](#22-alunos)
   - [professores](#23-professores)
   - [cursos](#24-cursos)
   - [mensalidades](#25-mensalidades)
   - [materiais](#26-materiais)
3. [Relacionamentos](#3-relacionamentos)
4. [Regras de Negócio](#4-regras-de-negócio)
5. [Controle de Sessão](#5-controle-de-sessão)
6. [Configurações Globais](#6-configurações-globais)

---

## 1. Visão Geral da Arquitetura de Dados

Esse protótipo do Flow é uma SPA (*Single Page Application*) sem backend dedicado. Todos os dados são armazenados no `localStorage` do navegador em formato JSON, acessados pela camada `DB` e expostos pela camada `Store`.

> **Convenção de ID:** Cada entidade usa um campo `id` inteiro gerado incrementalmente utilizando `Math.max(...ids) + 1`. Não há utilização de UUID.
>
> **Convenção de data:** Todas as datas de negócio são armazenadas como string no formato `dd/mm/aa`. Datas de auditoria (`createdAt`) usam o padrão ISO 8601.

---

## 2. Entidades

### 2.1 `users` — Usuários do Sistema

* **Chave no storage:** `flow_users`
* **Acesso via:** `Store.users`

**Observações:**
* O e-mail é único; tentativa de cadastro com e-mail existente retorna erro.
* A senha não é criptografada com hash seguro — o Base64 é apenas ofuscação. Em produção com backend real, use `bcrypt` ou `argon2`.
* O campo `createdAt` não é gerado para usuários (apenas para as demais entidades).

---

### 2.2 `alunos`

* **Chave no storage:** `flow_alunos`
* **Acesso via:** `Store.alunos`

**Observações:**
* `curso` armazena o `id` do curso como string para compatibilidade com comparações via `String()`.
* Ao alterar o `status` para `trancado` ou `ex-aluno`, as mensalidades pendentes vinculadas recebem a flag `suspensa: true`.
* A exclusão de um aluno remove em cascata todos os registros de `mensalidades` com o mesmo `alunoId`.

---

### 2.3 `professores`

* **Chave no storage:** `flow_professores`
* **Acesso via:** `Store.professores`

**Observações:**
* O campo `curso` em professores é texto livre (nome do curso), diferente de `alunos.curso` que é uma FK numérica. Essa diferença é intencional — o professor pode lecionar em mais de um curso ou em turmas não cadastradas formalmente.
* Não há exclusão em cascata de professores para outras entidades.

---

### 2.4 `cursos`

* **Chave no storage:** `flow_cursos`
* **Acesso via:** `Store.cursos`

**Observações:**
* O `valor` do curso é apenas uma referência de preenchimento automático; o valor real cobrado fica em `alunos.valorMensalidade`.
* A exclusão de um curso não remove os alunos vinculados; o campo `alunos.curso` passa a referenciar um ID inexistente, exibido como "Sem curso" na interface.

---

### 2.5 `mensalidades`

* **Chave no storage:** `flow_mensalidades`
* **Acesso via:** `Store.mensalidades`

**Observações:**
* `alunoNome` é desnormalizado: duplica o nome do aluno para evitar consultas encadeadas na exibição da tabela. Se o nome do aluno for alterado, registros anteriores mantêm o nome original do lançamento.
* Os juros são calculados em tempo de exibição pela função `Utils.calcJuros()` e somente persistidos (`jurosAplicados`) no momento do registro do pagamento.
* A geração automática de mensalidades ocorre ao matricular um aluno e na abertura da aba Mensalidades, garantindo que todos os alunos ativos tenham registro do mês corrente.

---

### 2.6 `materiais`

* **Chave no storage:** `flow_materiais`
* **Acesso via:** `Store.materiais`

**Observações:**
* Materiais são exibidos apenas como "em aberto" — não há fluxo de baixa ou pagamento de material na versão atual.
* O campo `curso` é texto livre, o que permite registrar materiais de cursos já excluídos sem quebrar a exibição.

---

## 3. Relacionamentos

* **Tipo de relacionamento:** Todos são 1:N (um para muitos).
* **Integridade referencial:** Não é garantida pelo storage (sem FK real). A consistência é mantida estritamente pela lógica da aplicação:
  * A exclusão de um aluno remove suas mensalidades;
  * A exclusão de um curso não atualiza alunos vinculados (ficando exibido como "Sem curso").

---

## 4. Regras de Negócio

### 4.1 Cálculo de Juros por Atraso
Os juros são recalculados dinamicamente a cada exibição utilizando a lógica:

$$\text{juros} = \text{valor} \times \left(\frac{\text{taxaMensal}}{100}\right) \times \text{mesesAtraso}$$

O valor persistido (`jurosAplicados`) é gravado no banco de dados local apenas no momento exato do registro do pagamento.

### 4.2 Geração Automática de Mensalidades
Ao abrir a aba Mensalidades, o sistema verifica todos os alunos com `status = "ativo"` e `valorMensalidade > 0`. Para cada aluno que não possua registro de mensalidade do tipo `"mensalidade"` no mês e ano correntes, um novo registro é criado automaticamente com `status = "pendente"`.

---

## 5. Controle de Sessão

* **Chave no storage:** `flow_session` (salvo no `sessionStorage` — expira automaticamente ao fechar o navegador)

A sessão é criada no login bem-sucedido e destruída no logout. O campo `password` nunca é incluído no objeto de sessão por motivos de segurança.

---

## 6. Configurações Globais

Armazenadas diretamente no `localStorage` como valores primitivos.

---

*Documento gerado para o projeto Flow.* *Arquitetura: SPA HTML/CSS/JS puro, sem dependências externas, deploy via Netlify.*