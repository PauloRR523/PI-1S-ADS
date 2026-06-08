Pages.Configuracoes = {
  render() {
    if (!Auth.require()) return '';
    const user = Auth.current();
    return Layout.wrap('configuracoes', `
      <div class="page-header"><h1>Configuracoes</h1><p>Preferencias e dados do sistema</p></div>
      <div style="max-width:540px;display:flex;flex-direction:column;gap:18px">
        <div class="card">
          <h2 style="font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;margin-bottom:16px;color:var(--text-primary)">Perfil do Usuario</h2>
          <div class="form-row">
            <div class="form-group"><label>Nome</label><input id="cfgNome" value="${user ? user.name : ''}" /></div>
            <div class="form-group"><label>E-mail</label><input id="cfgEmail" value="${user ? user.email : ''}" disabled /></div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Pages.Configuracoes.salvarPerfil()">Salvar Perfil</button>
        </div>
        <div class="card">
          <h2 style="font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;margin-bottom:4px;color:var(--text-primary)">Aparencia</h2>
          <p style="color:var(--text-muted);font-size:12px;margin-bottom:14px">Alterne entre o tema claro e o tema escuro.</p>
          <button class="btn btn-ghost btn-sm" onclick="Pages.Configuracoes.toggleDark()" id="darkBtn">
            ${localStorage.getItem('flow_darkmode') === '1' ? Utils.svgIcon('sun',14) + ' Mudar para Modo Claro' : Utils.svgIcon('moon',14) + ' Mudar para Modo Noturno'}
          </button>
        </div>
        <div class="card">
          <h2 style="font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;margin-bottom:4px;color:var(--text-primary)">Dados</h2>
          <p style="color:var(--text-muted);font-size:12px;margin-bottom:14px">Exporte os dados ou limpe o sistema. Estas acoes nao podem ser desfeitas.</p>
          <div class="actions-row" style="flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="Pages.Configuracoes.exportar()">${Utils.svgIcon('package',14)} Exportar JSON</button>
            <button class="btn btn-danger btn-sm" onclick="Pages.Configuracoes.limpar()">${Utils.svgIcon('trash',14)} Limpar Todos os Dados</button>
          </div>
        </div>
        <div class="card" style="background:var(--accent-soft);border-color:rgba(91,141,238,0.2)">
          <p style="font-size:12px;color:var(--accent);font-weight:600">${Utils.svgIcon('info',14)} Flow &mdash; Sistema de Gestao Escolar. Dados armazenados localmente no navegador.</p>
        </div>
      </div>
    `);
  },

  bind() {},

  salvarPerfil() {
    const nome = document.getElementById('cfgNome').value.trim();
    if (!nome) { Utils.toast('O nome nao pode ser vazio.', 'error'); return; }
    const session = Auth.current();
    if (session) {
      session.name = nome;
      sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(session));
      Store.users.save(Store.users.getAll().map(u => u.id === session.id ? { ...u, name: nome } : u));
    }
    Utils.toast('Perfil atualizado com sucesso.');
  },

  toggleDark() {
    const nowDark = localStorage.getItem('flow_darkmode') === '1';
    localStorage.setItem('flow_darkmode', nowDark ? '0' : '1');
    Router.go('configuracoes');
  },

  exportar() {
    const data = {
      exportadoEm:  new Date().toLocaleString('pt-BR'),
      alunos:       Store.alunos.getAll(),
      professores:  Store.professores.getAll(),
      cursos:       Store.cursos.getAll(),
      mensalidades: Store.mensalidades.getAll(),
      materiais:    Store.materiais.getAll(),
      reposicoes:   Store.reposicoes.getAll(),
      faltas:       DB.get('faltas')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `flow-backup-${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.json`;
    a.click();
    Utils.toast('Dados exportados com sucesso.');
  },

  limpar() {
    if (!confirm('Tem certeza? Todos os dados serao removidos permanentemente.')) return;
    ['alunos','professores','cursos','mensalidades','materiais','reposicoes','faltas'].forEach(k => DB.set(k, []));
    Utils.toast('Todos os dados foram removidos.', 'error');
    Router.go('dashboard');
  }
};
