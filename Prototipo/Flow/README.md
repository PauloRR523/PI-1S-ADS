# Flow - Sistema de Gestao Escolar

Aplicacao web para gestao escolar com suporte a mobile.

## Funcionalidades

- Login e registro de usuarios
- Dashboard com indicadores, alertas e aniversariantes do mes
- Cadastro de alunos com matricula e controle de status
- Cadastro de professores
- Gestao de cursos com visualizacao de turmas
- Controle de mensalidades com calculo automatico de juros por atraso
- Controle de materiais por semestre
- Exportacao de dados em JSON
- Totalmente responsivo para mobile

## Deploy no Netlify

1. Faca upload da pasta `flow` ou conecte o repositorio GitHub
2. O arquivo `netlify.toml` ja esta configurado para SPA
3. Nao e necessario build step - e HTML/CSS/JS puro

## Estrutura

```
flow/
  index.html
  favicon.svg
  netlify.toml
  .gitignore
  css/
    main.css
  js/
    app.js
    auth.js
    db.js
    router.js
    utils.js
    components/
      modal.js
    pages/
      login.js
      register.js
      dashboard.js
      alunos.js
      professores.js
      cursos.js
      mensalidades.js
      materiais.js
      configuracoes.js
```

## Dados

Os dados sao armazenados no `localStorage` do navegador. Use a funcao de exportacao em Configuracoes para fazer backup em JSON.
