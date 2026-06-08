const Router = {
  current: null,

  routes: {
    login:        () => Pages.Login.render(),
    register:     () => Pages.Register.render(),
    dashboard:    () => Pages.Dashboard.render(),
    alunos:       () => Pages.Alunos.render(),
    professores:  () => Pages.Professores.render(),
    cursos:       () => Pages.Cursos.render(),
    mensalidades: () => Pages.Mensalidades.render(),
    reposicoes:   () => Pages.Reposicoes.render(),
    materiais:    () => Pages.Materiais.render(),
    configuracoes:() => Pages.Configuracoes.render()
  },

  go(page) {
    Router.current = page;
    const app = document.getElementById('app');
    const route = Router.routes[page];
    if (route) {
      app.innerHTML = route();
      Router.afterRender(page);
    }
  },

  afterRender(page) {
    const publicPages = ['login', 'register'];
    if (!publicPages.includes(page)) Layout.bindSidebar(page);
    if (page === 'login')         Pages.Login.bind();
    if (page === 'register')      Pages.Register.bind();
    if (page === 'dashboard')     Pages.Dashboard.bind();
    if (page === 'alunos')        Pages.Alunos.bind();
    if (page === 'professores')   Pages.Professores.bind();
    if (page === 'cursos')        Pages.Cursos.bind();
    if (page === 'mensalidades')  Pages.Mensalidades.bind();
    if (page === 'reposicoes')    Pages.Reposicoes.bind();
    if (page === 'materiais')     Pages.Materiais.bind();
    if (page === 'configuracoes') Pages.Configuracoes.bind();
  }
};

const Layout = {
  wrap(page, content) {
    const darkMode = localStorage.getItem('flow_darkmode') === '1';
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');

    const nav = [
      { id: 'dashboard',    label: 'Inicio',        icon: 'home' },
      { id: 'alunos',       label: 'Alunos',        icon: 'users' },
      { id: 'professores',  label: 'Professores',   icon: 'graduation' },
      { id: 'cursos',       label: 'Cursos',        icon: 'book' },
      { id: 'mensalidades', label: 'Mensalidades',  icon: 'dollar' },
      { id: 'reposicoes',   label: 'Frequencia',    icon: 'calendar' },
      { id: 'materiais',    label: 'Materiais',     icon: 'package' },
      { id: 'configuracoes',label: 'Configuracoes', icon: 'settings' }
    ];

    const navHTML = nav.map(n => `
      <button class="nav-item ${page === n.id ? 'active' : ''}" data-nav="${n.id}">
        ${Utils.svgIcon(n.icon, 17)}
        ${n.label}
      </button>
    `).join('');

    return `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <div class="app-layout">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header">
            <span class="brand-sm">Flow</span>
          </div>
          <nav class="sidebar-nav">${navHTML}</nav>
          <div class="sidebar-footer">
            <button class="nav-item" id="darkToggleBtn">
              ${Utils.svgIcon('moon', 17)}
              Modo Noturno
            </button>
            <button class="nav-item" id="logoutBtn">
              ${Utils.svgIcon('logout', 17)}
              Sair
            </button>
          </div>
        </aside>
        <div class="main-content">
          <div class="topbar">
            <button class="hamburger" id="hamburger">${Utils.svgIcon('menu', 20)}</button>
            <div class="search-bar" id="globalSearchWrap">
              ${Utils.svgIcon('search', 15)}
              <input type="text" placeholder="Pesquise por nome de Aluno ou CPF" id="globalSearch" autocomplete="off" />
              <div class="search-dropdown" id="searchDropdown"></div>
            </div>
          </div>
          <main class="page-content">${content}</main>
        </div>
      </div>
    `;
  },

  bindSidebar(page) {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!Auth.require()) return;
        Router.go(btn.dataset.nav);
        Layout.closeSidebar();
      });
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());

    const darkBtn = document.getElementById('darkToggleBtn');
    if (darkBtn) {
      const isDark = localStorage.getItem('flow_darkmode') === '1';
      darkBtn.innerHTML = `${Utils.svgIcon(isDark ? 'sun' : 'moon', 17)} ${isDark ? 'Modo Claro' : 'Modo Noturno'}`;
      darkBtn.addEventListener('click', () => {
        const nowDark = localStorage.getItem('flow_darkmode') === '1';
        localStorage.setItem('flow_darkmode', nowDark ? '0' : '1');
        Router.go(Router.current);
      });
    }

    const hamburger = document.getElementById('hamburger');
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebarOverlay');
    if (hamburger) hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    if (overlay) overlay.addEventListener('click', () => Layout.closeSidebar());

    Layout.bindGlobalSearch();
  },

  bindGlobalSearch() {
    const input    = document.getElementById('globalSearch');
    const dropdown = document.getElementById('searchDropdown');
    if (!input || !dropdown) return;

    const cursos = Store.cursos.getAll();

    const showDropdown = (results) => {
      if (!results.length) {
        dropdown.innerHTML = `<div class="search-dd-empty">Nenhum aluno encontrado.</div>`;
        dropdown.classList.add('open');
        return;
      }
      dropdown.innerHTML = results.map(a => {
        const c     = cursos.find(x => String(x.id) === String(a.curso));
        const color = Utils.avatarColor(a.nome);
        const badge = a.status === 'ativo' ? 'badge-green' : a.status === 'trancado' ? 'badge-yellow' : 'badge-gray';
        return `
          <div class="search-dd-item" data-id="${a.id}">
            <div class="avatar" style="background:${color};color:#fff;font-size:11px;width:30px;height:30px;flex-shrink:0">${Utils.initials(a.nome)}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.nome}</div>
              <div style="font-size:11px;color:var(--text-muted)">${a.cpf || 'Sem CPF'} &bull; ${c ? c.nome : 'Sem curso'}</div>
            </div>
            <span class="badge ${badge}" style="font-size:10px">${a.status}</span>
          </div>`;
      }).join('');
      dropdown.classList.add('open');
    };

    const hideDropdown = () => { dropdown.classList.remove('open'); dropdown.innerHTML = ''; };

    input.addEventListener('input', () => {
      const q        = input.value.trim().toLowerCase();
      if (!q) { hideDropdown(); return; }
      const cpfClean = q.replace(/\D/g, '');
      const results  = Store.alunos.getAll().filter(a => {
        const nomeMatch = a.nome.toLowerCase().includes(q);
        const cpfMatch  = cpfClean && a.cpf && a.cpf.replace(/\D/g,'').includes(cpfClean);
        return nomeMatch || cpfMatch;
      }).slice(0, 8);
      showDropdown(results);
    });

    dropdown.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.search-dd-item');
      if (!item) return;
      e.preventDefault();
      const id = parseInt(item.dataset.id);
      hideDropdown();
      input.value = '';
      Pages.Alunos.tabAtual = 'todos';
      Pages.Alunos.filter   = '';
      Router.go('alunos');
      setTimeout(() => Pages.Alunos.openEdit(id), 80);
    });

    input.addEventListener('blur',    () => setTimeout(hideDropdown, 150));
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hideDropdown(); input.value = ''; } });
  },

  closeSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    if (s) s.classList.remove('open');
    if (o) o.classList.remove('open');
  }
};
