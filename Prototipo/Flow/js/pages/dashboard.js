Pages.Dashboard = {
  render() {
    if (!Auth.require()) return '';

    const alunos       = Store.alunos.getAll();
    const ativos       = alunos.filter(a => a.status === 'ativo');
    const pausados     = alunos.filter(a => a.status === 'trancado');
    const cursos       = Store.cursos.getAll();
    const mensalidades = Store.mensalidades.getAll();
    const reposicoes   = Store.reposicoes.getAll();
    const hoje         = new Date();
    const mesAtual     = hoje.getMonth() + 1;
    const anoAtual     = hoje.getFullYear();

    const pendentes = mensalidades.filter(m => m.status !== 'pago' && m.status !== 'parcial');
    const aVencer   = mensalidades.filter(m => {
      if (m.status === 'pago') return false;
      const d = Utils.parseDate(m.vencimento);
      return d && d.getUTCMonth() === mesAtual - 1 && d.getUTCFullYear() === anoAtual;
    });

    const receitaMes = mensalidades
      .filter(m => m.status === 'pago' && m.dataPagamento)
      .filter(m => {
        const d = Utils.parseDate(m.dataPagamento);
        return d && d.getUTCMonth() === mesAtual - 1 && d.getUTCFullYear() === anoAtual;
      })
      .reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);

    const reposicoesPendentes = reposicoes.filter(r => r.status === 'pendente' && !r.gratis).length;

    const ultimosAlunos = [...alunos].sort((a, b) => b.id - a.id).slice(0, 5);

    const alunosPorCurso = cursos.map(c => ({
      nome:  c.nome,
      total: ativos.filter(a => String(a.curso) === String(c.id)).length
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    const maxCurso = Math.max(...alunosPorCurso.map(c => c.total), 1);

    const aniversariantes = ativos
      .filter(a => a.dataNasc && Utils.isBirthdayThisMonth(a.dataNasc))
      .sort((a, b) => Utils.getBirthdayDay(a.dataNasc) - Utils.getBirthdayDay(b.dataNasc));

    const anivGroups = {};
    aniversariantes.forEach(a => {
      const d = Utils.parseDate(a.dataNasc);
      if (!d) return;
      const key = `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;
      if (!anivGroups[key]) anivGroups[key] = [];
      anivGroups[key].push(a.nome);
    });

    const meses = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    return Layout.wrap('dashboard', `
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Visao geral do sistema Flow</p>
      </div>

      <div class="dashboard-grid">
        <div>
          <div class="alerts-row">
            ${pendentes.length ? `
              <div class="alert-card danger">
                <h3>${Utils.svgIcon('alert',14)} Pendencias Financeiras</h3>
                <p>${pendentes.length} mensalidade(s) em aberto</p>
                <a href="#" data-nav="mensalidades" style="display:inline-block;margin-top:6px">Ver Lista</a>
              </div>` : `
              <div class="alert-card" style="background:#f0fdf4;border:1px solid rgba(39,174,96,0.2)">
                <h3 style="color:var(--green)">${Utils.svgIcon('check',14)} Financeiro em dia</h3>
                <p>Sem pendencias no momento</p>
              </div>`}

            ${aVencer.length ? `
              <div class="alert-card warning">
                <h3>${Utils.svgIcon('calendar',14)} Contratos a Vencer</h3>
                <p>${aVencer.length} vencimento(s) este mes</p>
                <a href="#" data-nav="mensalidades" style="display:inline-block;margin-top:6px">Ver Lista</a>
              </div>` : `
              <div class="alert-card" style="background:#f8f9fc;border:1px solid var(--border)">
                <h3 style="color:var(--text-secondary)">${Utils.svgIcon('calendar',14)} Sem vencimentos</h3>
                <p>Nenhum vencimento critico este mes</p>
              </div>`}
          </div>

          <div class="cards-grid">
            <div class="stat-card">
              <div class="stat-label">${Utils.svgIcon('users',14)} Alunos Ativos</div>
              <div class="stat-value">${ativos.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">${Utils.svgIcon('user',14)} Alunos Pausados</div>
              <div class="stat-value">${pausados.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">${Utils.svgIcon('calendar',14)} Reposicoes Pendentes</div>
              <div class="stat-value" style="color:${reposicoesPendentes > 0 ? 'var(--yellow)' : 'var(--text-primary)'}">
                ${reposicoesPendentes}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">${Utils.svgIcon('dollar',14)} Receita do Mes</div>
              <div class="stat-value" style="font-size:1.15rem">${Utils.formatCurrency(receitaMes)}</div>
            </div>
          </div>

          ${reposicoesPendentes > 0 ? `
          <div class="alert-card warning" style="margin-bottom:16px;cursor:pointer" onclick="Router.go('reposicoes')">
            <h3>${Utils.svgIcon('calendar',14)} Reposicoes Aguardando Confirmacao</h3>
            <p>${reposicoesPendentes} reposicao(oes) paga(s) ainda nao confirmada(s) como cumprida(s)</p>
            <span style="font-size:13px;font-weight:600;color:var(--yellow);display:inline-block;margin-top:6px">Ir para Frequencia</span>
          </div>` : ''}

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="card">
              <div class="section-hdr"><h2>Ultimos Alunos</h2></div>
              ${ultimosAlunos.length ? ultimosAlunos.map(a => {
                const c = cursos.find(x => String(x.id) === String(a.curso));
                return `<div class="student-row">
                  <div class="avatar" style="background:${Utils.avatarColor(a.nome)};color:#fff">${Utils.initials(a.nome)}</div>
                  <div class="info">
                    <strong>${a.nome}</strong>
                    <span>${c ? c.nome : 'Sem curso'}</span>
                  </div>
                  <span class="badge ${a.status === 'ativo' ? 'badge-green' : a.status === 'trancado' ? 'badge-yellow' : 'badge-gray'}">${a.status}</span>
                </div>`;
              }).join('') : '<p style="color:var(--text-muted);font-size:13px;padding:8px 0">Nenhum aluno cadastrado.</p>'}
            </div>

            <div class="card">
              <div class="section-hdr"><h2>Alunos por Curso</h2></div>
              ${alunosPorCurso.length ? alunosPorCurso.map(c => `
                <div class="course-bar-item">
                  <div class="course-bar-label"><span>${c.nome}</span><span>${c.total} aluno(s)</span></div>
                  <div class="bar-bg"><div class="bar-fill" style="width:${Math.round(c.total/maxCurso*100)}%"></div></div>
                </div>`).join('') : '<p style="color:var(--text-muted);font-size:13px;padding:8px 0">Nenhum dado disponivel.</p>'}
            </div>
          </div>
        </div>

        <div class="card birthday-section" style="align-self:start">
          <h3>${Utils.svgIcon('cake',16)} Aniversariantes de ${meses[mesAtual-1]}</h3>
          ${Object.keys(anivGroups).length
            ? Object.entries(anivGroups).map(([date, names]) => `
                <div class="birthday-group">
                  <div class="birthday-date">${date}</div>
                  ${names.map(n => `<div class="birthday-name">${n}</div>`).join('')}
                </div>`).join('')
            : `<p style="color:var(--text-muted);font-size:13px">Nenhum aniversariante este mes.</p>`}
        </div>
      </div>
    `);
  },

  bind() {
    document.querySelectorAll('[data-nav]').forEach(a => {
      a.addEventListener('click', (e) => { e.preventDefault(); Router.go(a.dataset.nav); });
    });
  }
};
