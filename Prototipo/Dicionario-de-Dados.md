# Dicionario de Dados — Flow
Versao referencial 1.1.0 | Persistencia: `localStorage` do navegador (chave prefixo `flow_`)

---

## Sumario

1. [Visao Geral da Arquitetura de Dados](#1-visao-geral-da-arquitetura-de-dados)
2. [Entidades](#2-entidades)
   - [users](#21-users--usuarios-do-sistema)
   - [alunos](#22-alunos)
   - [professores](#23-professores)
   - [cursos](#24-cursos)
   - [mensalidades](#25-mensalidades)
   - [materiais](#26-materiais)
3. [Relacionamentos](#3-relacionamentos)
4. [Regras de Negocio](#4-regras-de-negocio)
5. [Controle de Sessao](#5-controle-de-sessao)
6. [Configuracoes Globais](#6-configuracoes-globais)

---

## 1. Visao Geral da Arquitetura de Dados

Esse prototipo do Flow e uma SPA (Single Page Application) sem backend dedicado. Todos os dados sao armazenados no `localStorage` do navegador em formato JSON, acessados pela camada `DB` e expostos pela camada `Store`.

```

**Convencao de ID:** cada entidade usa um campo `id` inteiro gerado incrementalmente (`Math.max(...ids) + 1`). Nao ha UUID.

**Convencao de data:** todas as datas de negocio sao armazenadas como string no formato `dd/mm/aa`. Datas de auditoria (`createdAt`) usam ISO 8601.

---

## 2. Entidades

### 2.1 `users` — Usuarios do Sistema

Chave no storage: `flow_users`
Acesso via: `Store.users`            |

**Observacoes:**
- O e-mail e unico; tentativa de cadastro com e-mail existente retorna erro.
- A senha nao e criptografada com hash seguro — o Base64 e apenas ofuscacao. Em producao com backend real, usar bcrypt ou argon2.
- O campo `createdAt` nao e gerado para usuarios (apenas para as demais entidades).

---

### 2.2 `alunos`

Chave no storage: `flow_alunos`
Acesso via: `Store.alunos`

**Observacoes:**
- `curso` armazena o `id` do curso como string para compatibilidade com comparacoes via `String()`.
- Ao alterar `status` para `trancado` ou `ex-aluno`, mensalidades pendentes vinculadas recebem o flag `suspensa: true`.
- A exclusao de um aluno remove em cascata todos os registros de `mensalidades` com o mesmo `alunoId`.

---

### 2.3 `professores`

Chave no storage: `flow_professores`
Acesso via: `Store.professores`

**Observacoes:**
- O campo `curso` em professores e texto livre (nome do curso), diferente de `alunos.curso` que e FK numerica. Essa diferenca e intencional — o professor pode lecionar em mais de um curso ou em turmas nao cadastradas formalmente.
- Nao ha exclusao em cascata de professores para outras entidades.

---

### 2.4 `cursos`

Chave no storage: `flow_cursos`
Acesso via: `Store.cursos`

**Observacoes:**
- O `valor` do curso e apenas uma referencia de preenchimento automatico; o valor real cobrado fica em `alunos.valorMensalidade`.
- A exclusao de um curso nao remove os alunos vinculados; o campo `alunos.curso` passa a referenciar um ID inexistente, exibido como "Sem curso" na interface.

---

### 2.5 `mensalidades`

Chave no storage: `flow_mensalidades`
Acesso via: `Store.mensalidades`                     |

**Observacoes:**
- `alunoNome` e desnormalizado: duplica o nome do aluno para evitar consultas encadeadas na exibicao da tabela. Se o nome do aluno for alterado, registros anteriores mantem o nome original do lancamento.
- Juros sao calculados em tempo de exibicao pela funcao `Utils.calcJuros()` e somente persistidos (`jurosAplicados`) no momento do registro do pagamento.
- A geracao automatica de mensalidades ocorre ao matricular um aluno e na abertura da aba Mensalidades, garantindo que todos os alunos ativos tenham registro do mes corrente.

---

### 2.6 `materiais`

Chave no storage: `flow_materiais`
Acesso via: `Store.materiais`

**Observacoes:**
- Materiais sao exibidos apenas como "em aberto" — nao ha fluxo de baixa ou pagamento de material na versao atual.
- O campo `curso` e texto livre, o que permite registrar materiais de cursos ja excluidos sem quebrar a exibicao.

---

## 3. Relacionamentos

**Tipo de relacionamento:** todos sao 1:N (um para muitos).
**Integridade referencial:** nao e garantida pelo storage (sem FK real). A consistencia e mantida pela logica da aplicacao:
- exclusao de aluno remove suas mensalidades;
- exclusao de curso nao atualiza alunos vinculados (fica sem curso exibido).

---

## 4. Regras de Negocio

### 4.1 Calculo de Juros por Atraso:

juros = valor × (taxaMensal / 100) × mesesAtraso

Os juros sao recalculados dinamicamente a cada exibicao. O valor persistido (`jurosAplicados`) e gravado apenas no momento do registro do pagamento.

### 4.2 Geracao Automatica de Mensalidades

Ao abrir a aba Mensalidades, o sistema verifica todos os alunos com `status = "ativo"` e `valorMensalidade > 0`. Para cada aluno que nao possua registro de mensalidade do tipo `"mensalidade"` no mes e ano correntes, um novo registro e criado automaticamente com `status = "pendente"`.

---

## 5. Controle de Sessao

Chave no storage: `flow_session` (sessionStorage — expira ao fechar o navegador)

A sessao e criada no login bem-sucedido e destruida no logout. O campo `password` nunca e incluido no objeto de sessao.

---

## 6. Configuracoes Globais

Armazenadas diretamente no `localStorage` como valores primitivos.

---

*Documento gerado para o projeto Flow.*
*Arquitetura: SPA HTML/CSS/JS puro, sem dependencias externas, deploy via Netlify.*
