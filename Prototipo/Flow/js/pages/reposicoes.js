Pages.Reposicoes = {
  tabAtual: 'reposicoes',
  VALOR_REPOSICAO: parseFloat(localStorage.getItem('flow_valorReposicao')) || 50,
  REPOSICOES_GRATIS_POR_SEMESTRE: parseInt(localStorage.getItem('flow_reposicoesGratis')) || 1,

  render() {
    if (!Auth.require()) return '';
    const tab    = Pages.Reposicoes.tabAtual;
    const faltas = DB.get('faltas');
    const repos  = Store.reposicoes.getAll();
    const alunos = Store.alunos.getAll();
    const cursos = Store.cursos.getAll();
    const hoje   = new Date();

    const totalFaltas    = faltas.length;
    const pendentes      = repos.filter(r => r.status === 'pendente' && !r.gratis);
    const totalPendentes = pendentes.length;
    const totalPagas     = repos.filter(r => r.status === 'pago' && !r.gratis).length;
    const totalGratis    = repos.filter(r => r.gratis).length;

    let content = '';

    if (tab === 'reposicoes') {
      const rows = repos.map(r => {
        const aluno = alunos.find(a => a.id === r.alunoId);
        const curso = aluno ? cursos.find(c => String(c.id) === String(aluno.curso)) : null;
        const isPendente = r.status === 'pendente' && !r.gratis;
        const badgeStatus = r.status === 'pago' || r.gratis ? 'badge-green' : 'badge-yellow';
        const labelStatus = r.gratis ? 'Gratuita' : r.status === 'pago' ? 'Concluida' : 'Pendente';
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:9px">
              <div class="avatar" style="background:${aluno ? Utils.avatarColor(aluno.nome) : '#aaa'};color:#fff;font-size:11px;width:30px;height:30px">${aluno ? Utils.initials(aluno.nome) : '?'}</div>
              <div>
                <div style="font-weight:600">${r.alunoNome}</div>
                <div style="font-size:11px;color:var(--text-muted)">${curso ? curso.nome : ''}</div>
              </div>
            </div>
          </td>
          <td>${r.dataReposicao || '-'}</td>
          <td>${r.semestre || '-'}</td>
          <td>
            ${r.gratis
              ? `<span class="badge badge-blue">Gratuita</span>`
              : `<span style="font-weight:600">${Utils.formatCurrency(r.valor)}</span>`}
          </td>
          <td><span class="badge ${badgeStatus}">${labelStatus}</span></td>
          <td>
            <div class="actions-row">
              ${isPendente ? `
                <button class="btn btn-primary btn-sm" onclick="Pages.Reposicoes.abrirConfirmacaoConclusao(${r.id})">
                  ${Utils.svgIcon('check',13)} Confirmar Conclusao
                </button>` : ''}
              <button class="btn btn-danger btn-sm" onclick="Pages.Reposicoes.removeReposicao(${r.id})">${Utils.svgIcon('trash',13)}</button>
            </div>
          </td>
        </tr>`;
      }).join('');

      content = `
        <div class="section-hdr" style="margin-bottom:10px">
          <h2>Reposicoes Agendadas</h2>
          <button class="btn btn-primary" id="novaReposicaoBtn">${Utils.svgIcon('plus',14)} Nova Reposicao</button>
        </div>

        ${totalPendentes > 0 ? `
        <div class="alert-card warning" style="margin-bottom:14px">
          <h3>${Utils.svgIcon('alert',14)} ${totalPendentes} reposicao(oes) pendente(s)</h3>
          <p>Confirme a conclusao apos a aula ser realizada para quitar o debito automaticamente.</p>
        </div>` : ''}

        <div class="card" style="margin-bottom:14px;padding:11px 16px;background:var(--accent-soft);border-color:rgba(91,141,238,0.2)">
          <p style="font-size:12px;color:var(--accent);font-weight:600">
            ${Utils.svgIcon('info',13)}
            A <strong>1a reposicao por semestre</strong> e gratuita.
            A partir da 2a, gera debito de <strong>${Utils.formatCurrency(Pages.Reposicoes.VALOR_REPOSICAO)}</strong>.
            Ao confirmar a conclusao, o debito em Mensalidades e quitado automaticamente.
          </p>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Aluno</th><th>Data</th><th>Semestre</th><th>Valor</th><th>Status</th><th>Acoes</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="6"><div class="empty-state">${Utils.svgIcon('calendar',32)}<br>Nenhuma reposicao registrada.</div></td></tr>`}</tbody>
          </table>
        </div>`;
    }

    if (tab === 'faltas') {
      const rows = faltas.map(f => {
        const aluno = alunos.find(a => a.id === f.alunoId);
        const curso = aluno ? cursos.find(c => String(c.id) === String(aluno.curso)) : null;
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:9px">
              <div class="avatar" style="background:${aluno ? Utils.avatarColor(aluno.nome) : '#aaa'};color:#fff;font-size:11px;width:30px;height:30px">${aluno ? Utils.initials(aluno.nome) : '?'}</div>
              <div>
                <div style="font-weight:600">${aluno ? aluno.nome : f.alunoNome || 'Aluno removido'}</div>
                <div style="font-size:11px;color:var(--text-muted)">${curso ? curso.nome : ''}</div>
              </div>
            </div>
          </td>
          <td>${f.data || '-'}</td>
          <td>${f.descricao || '-'}</td>
          <td><span class="badge ${f.justificada ? 'badge-blue' : 'badge-red'}">${f.justificada ? 'Justificada' : 'Injustificada'}</span></td>
          <td>
            <div class="actions-row">
              <button class="btn btn-ghost btn-sm" onclick="Pages.Reposicoes.agendarReposicao(${f.id})">
                ${Utils.svgIcon('calendar',13)} Agendar Reposicao
              </button>
              <button class="btn btn-danger btn-sm" onclick="Pages.Reposicoes.removeFalta(${f.id})">${Utils.svgIcon('trash',13)}</button>
            </div>
          </td>
        </tr>`;
      }).join('');

      content = `
        <div class="section-hdr" style="margin-bottom:14px">
          <h2>Registro de Faltas</h2>
          <button class="btn btn-primary" id="novaFaltaBtn">${Utils.svgIcon('plus',14)} Registrar Falta</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Aluno</th><th>Data</th><th>Descricao</th><th>Tipo</th><th>Acoes</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="5"><div class="empty-state">${Utils.svgIcon('users',32)}<br>Nenhuma falta registrada.</div></td></tr>`}</tbody>
          </table>
        </div>`;
    }

    if (tab === 'config') {
      content = `
        <div class="card" style="max-width:440px">
          <h2 style="font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;margin-bottom:16px">Configuracoes de Frequencia</h2>
          <div class="form-group">
            <label>Valor cobrado por reposicao extra (R$)</label>
            <input id="cfgValorRep" type="number" step="0.01" min="0" value="${Pages.Reposicoes.VALOR_REPOSICAO}" style="max-width:200px" />
          </div>
          <div class="form-group">
            <label>Reposicoes gratuitas por semestre</label>
            <input id="cfgGratis" type="number" min="0" value="${Pages.Reposicoes.REPOSICOES_GRATIS_POR_SEMESTRE}" style="max-width:120px" />
          </div>
          <button class="btn btn-primary btn-sm" onclick="Pages.Reposicoes.salvarConfig()">Salvar</button>
        </div>`;
    }

    return Layout.wrap('reposicoes', `
      <div class="page-header">
        <h1>Frequencia</h1>
        <p>Controle de faltas, reposicoes e carencia por semestre</p>
      </div>

      <div class="cards-grid" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-label">${Utils.svgIcon('users',14)} Faltas em Aberto</div>
          <div class="stat-value">${totalFaltas}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">${Utils.svgIcon('calendar',14)} Reposicoes Pendentes</div>
          <div class="stat-value" style="color:${totalPendentes > 0 ? 'var(--yellow)' : 'var(--text-primary)'}">${totalPendentes}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">${Utils.svgIcon('check',14)} Concluidas (pagas)</div>
          <div class="stat-value" style="color:var(--green)">${totalPagas}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">${Utils.svgIcon('info',14)} Gratuitas</div>
          <div class="stat-value" style="color:var(--accent)">${totalGratis}</div>
        </div>
      </div>

      <div class="tabs" style="margin-bottom:0">
        <button class="tab ${tab==='reposicoes'?'active':''}" onclick="Pages.Reposicoes.setTab('reposicoes')">Reposicoes</button>
        <button class="tab ${tab==='faltas'?'active':''}" onclick="Pages.Reposicoes.setTab('faltas')">Faltas</button>
        <button class="tab ${tab==='config'?'active':''}" onclick="Pages.Reposicoes.setTab('config')">Configuracoes</button>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-top:none;border-radius:0 0 var(--radius) var(--radius);padding:20px">
        ${content}
      </div>
    `);
  },

  bind() {
    const novaFaltaBtn = document.getElementById('novaFaltaBtn');
    if (novaFaltaBtn) novaFaltaBtn.addEventListener('click', () => Pages.Reposicoes.abrirFalta());
    const novaRepBtn = document.getElementById('novaReposicaoBtn');
    if (novaRepBtn) novaRepBtn.addEventListener('click', () => Pages.Reposicoes.abrirNovaReposicao());
  },

  setTab(tab) { Pages.Reposicoes.tabAtual = tab; Router.go('reposicoes'); },

  _contarReposicoesNoSemestre(alunoId, semestre) {
    return Store.reposicoes.getAll().filter(r => r.alunoId === alunoId && r.semestre === semestre).length;
  },

  _semAtual() {
    const h = new Date();
    return `${h.getMonth() < 6 ? 1 : 2}/${h.getFullYear()}`;
  },

  _hojeStr() {
    const h = new Date();
    return `${String(h.getDate()).padStart(2,'0')}/${String(h.getMonth()+1).padStart(2,'0')}/${String(h.getFullYear()).slice(2)}`;
  },

  abrirFalta() {
    const ativos = Store.alunos.getAll().filter(a => a.status === 'ativo');
    Modal.show(`
      <div class="modal-header">
        <h2>Registrar Falta</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Aluno *</label>
          <select id="fAlunoId">
            <option value="">Selecione...</option>
            ${ativos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data da Falta (dd/mm/aa)</label>
            <input id="fDataFalta" value="${Pages.Reposicoes._hojeStr()}" placeholder="dd/mm/aa" maxlength="8" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label>Tipo</label>
            <select id="fJustificada">
              <option value="0">Injustificada</option>
              <option value="1">Justificada</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Descricao / Motivo</label>
          <input id="fDescFalta" placeholder="Opcional..." />
        </div>
        <div id="faltaMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Reposicoes.salvarFalta()">Registrar Falta</button>
      </div>
    `);
    Utils.applyMask(document.getElementById('fDataFalta'), 'date');
  },

  salvarFalta() {
    const alunoId = parseInt(document.getElementById('fAlunoId').value);
    if (!alunoId) {
      document.getElementById('faltaMsg').innerHTML = `<div class="error-msg">Selecione um aluno.</div>`; return;
    }
    const aluno   = Store.alunos.find(alunoId);
    const dataRaw = document.getElementById('fDataFalta').value.trim();
    const list    = DB.get('faltas');
    const newId   = list.length ? Math.max(...list.map(f => f.id || 0)) + 1 : 1;
    list.push({
      id: newId, alunoId,
      alunoNome:  aluno ? aluno.nome : '',
      data:       Utils.parseDateFromMask(dataRaw) || dataRaw,
      justificada: document.getElementById('fJustificada').value === '1',
      descricao:  document.getElementById('fDescFalta').value.trim(),
      createdAt:  new Date().toISOString()
    });
    DB.set('faltas', list);
    Utils.toast('Falta registrada.');
    Modal.close();
    Router.go('reposicoes');
  },

  agendarReposicao(faltaId) {
    const faltas  = DB.get('faltas');
    const falta   = faltas.find(f => f.id === faltaId);
    if (!falta) return;
    const sem    = Pages.Reposicoes._semAtual();
    const qtdRep = Pages.Reposicoes._contarReposicoesNoSemestre(falta.alunoId, sem);
    const gratis = qtdRep < Pages.Reposicoes.REPOSICOES_GRATIS_POR_SEMESTRE;

    Modal.show(`
      <div class="modal-header">
        <h2>Agendar Reposicao</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:10px">Aluno: <strong>${falta.alunoNome}</strong></p>
        <div style="background:${gratis?'var(--green-soft)':'var(--yellow-soft)'};border:1px solid ${gratis?'rgba(39,174,96,0.3)':'rgba(245,158,11,0.3)'};border-radius:9px;padding:10px 14px;margin-bottom:14px">
          <p style="font-size:13px;color:${gratis?'var(--green)':'var(--yellow)'};font-weight:600">
            ${gratis
              ? `${Utils.svgIcon('check',13)} Reposicao gratuita — ${sem} (${qtdRep} usada(s) de ${Pages.Reposicoes.REPOSICOES_GRATIS_POR_SEMESTRE})`
              : `${Utils.svgIcon('alert',13)} Reposicao cobrada: ${Utils.formatCurrency(Pages.Reposicoes.VALOR_REPOSICAO)} — ${qtdRep} ja realizadas no semestre`}
          </p>
        </div>
        <div class="form-group">
          <label>Data da Reposicao (dd/mm/aa)</label>
          <input id="rDataRep" value="${Pages.Reposicoes._hojeStr()}" placeholder="dd/mm/aa" maxlength="8" inputmode="numeric" />
        </div>
        <div id="repMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Reposicoes.confirmarAgendamento(${faltaId},${gratis?1:0},'${sem}')">Confirmar</button>
      </div>
    `);
    Utils.applyMask(document.getElementById('rDataRep'), 'date');
  },

  confirmarAgendamento(faltaId, isGratis, semestre) {
    const faltas = DB.get('faltas');
    const falta  = faltas.find(f => f.id === faltaId);
    if (!falta) return;
    const dataRaw = document.getElementById('rDataRep').value.trim();
    const aluno   = Store.alunos.find(falta.alunoId);
    const valor   = Pages.Reposicoes.VALOR_REPOSICAO;

    const rep = Store.reposicoes.add({
      alunoId:       falta.alunoId,
      alunoNome:     falta.alunoNome,
      faltaId,
      dataReposicao: Utils.parseDateFromMask(dataRaw) || dataRaw,
      semestre,
      gratis:        !!isGratis,
      valor:         isGratis ? 0 : valor,
      status:        isGratis ? 'pago' : 'pendente'
    });

    if (!isGratis) {
      const hoje = new Date();
      const dia  = aluno ? (aluno.diaVencimento || 10) : 10;
      const mes  = hoje.getMonth() + 1;
      const ano  = hoje.getFullYear();
      Store.mensalidades.add({
        alunoId:   falta.alunoId,
        alunoNome: falta.alunoNome,
        valor,
        vencimento:`${String(dia).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${String(ano).slice(2)}`,
        mes, ano,
        status:    'pendente',
        tipo:      'reposicao',
        descricao: `Reposicao agendada: ${Utils.parseDateFromMask(dataRaw) || dataRaw}`,
        reposicaoId: rep.id
      });
      Utils.toast(`Reposicao agendada. Debito de ${Utils.formatCurrency(valor)} gerado em Mensalidades.`);
    } else {
      Utils.toast('Reposicao gratuita agendada.');
    }

    DB.set('faltas', faltas.filter(f => f.id !== faltaId));
    Modal.close();
    Router.go('reposicoes');
  },

  abrirNovaReposicao() {
    const ativos  = Store.alunos.getAll().filter(a => a.status === 'ativo');
    const sem     = Pages.Reposicoes._semAtual();
    Modal.show(`
      <div class="modal-header">
        <h2>Nova Reposicao</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Aluno *</label>
          <select id="nrAluno">
            <option value="">Selecione...</option>
            ${ativos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data da Reposicao (dd/mm/aa)</label>
            <input id="nrData" value="${Pages.Reposicoes._hojeStr()}" placeholder="dd/mm/aa" maxlength="8" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label>Semestre</label>
            <input id="nrSemestre" value="${sem}" placeholder="Ex: 1/2025" />
          </div>
        </div>
        <div id="nrMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Reposicoes.salvarNovaReposicao()">Agendar</button>
      </div>
    `);
    Utils.applyMask(document.getElementById('nrData'), 'date');
  },

  salvarNovaReposicao() {
    const alunoId = parseInt(document.getElementById('nrAluno').value);
    if (!alunoId) {
      document.getElementById('nrMsg').innerHTML = `<div class="error-msg">Selecione um aluno.</div>`; return;
    }
    const aluno    = Store.alunos.find(alunoId);
    const semestre = document.getElementById('nrSemestre').value.trim() || Pages.Reposicoes._semAtual();
    const qtdRep   = Pages.Reposicoes._contarReposicoesNoSemestre(alunoId, semestre);
    const gratis   = qtdRep < Pages.Reposicoes.REPOSICOES_GRATIS_POR_SEMESTRE;
    const valor    = Pages.Reposicoes.VALOR_REPOSICAO;
    const dataRaw  = document.getElementById('nrData').value.trim();

    const rep = Store.reposicoes.add({
      alunoId,
      alunoNome:     aluno ? aluno.nome : '',
      dataReposicao: Utils.parseDateFromMask(dataRaw) || dataRaw,
      semestre,
      gratis,
      valor:  gratis ? 0 : valor,
      status: gratis ? 'pago' : 'pendente'
    });

    if (!gratis) {
      const hoje = new Date();
      const dia  = aluno ? (aluno.diaVencimento || 10) : 10;
      const mes  = hoje.getMonth() + 1;
      const ano  = hoje.getFullYear();
      Store.mensalidades.add({
        alunoId, alunoNome: aluno ? aluno.nome : '',
        valor,
        vencimento: `${String(dia).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${String(ano).slice(2)}`,
        mes, ano,
        status:     'pendente',
        tipo:       'reposicao',
        descricao:  `Reposicao: ${Utils.parseDateFromMask(dataRaw) || dataRaw}`,
        reposicaoId: rep.id
      });
      Utils.toast(`Reposicao agendada. Debito de ${Utils.formatCurrency(valor)} gerado.`);
    } else {
      Utils.toast('Reposicao gratuita agendada.');
    }
    Modal.close();
    Router.go('reposicoes');
  },

  abrirConfirmacaoConclusao(id) {
    const r = Store.reposicoes.find(id);
    if (!r) return;
    Modal.show(`
      <div class="modal-header">
        <h2>Confirmar Conclusao</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:6px">Aluno: <strong>${r.alunoNome}</strong></p>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">
          Data agendada: ${r.dataReposicao} &bull; Valor: ${Utils.formatCurrency(r.valor)}
        </p>
        <div style="background:var(--green-soft);border:1px solid rgba(39,174,96,0.25);border-radius:9px;padding:12px 14px;margin-bottom:4px">
          <p style="color:var(--green);font-size:13px;font-weight:600">
            ${Utils.svgIcon('check',14)}
            Ao confirmar, a reposicao sera marcada como concluida e o debito correspondente em Mensalidades sera quitado automaticamente.
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Reposicoes.confirmarConclusao(${id})">Confirmar como Concluida</button>
      </div>
    `);
  },

  confirmarConclusao(id) {
    const r = Store.reposicoes.find(id);
    if (!r) return;

    r.status         = 'pago';
    r.dataConclusao  = Pages.Reposicoes._hojeStr();
    Store.reposicoes.update(r);

    const mens = Store.mensalidades.getAll().find(
      m => m.reposicaoId === id && m.status !== 'pago'
    ) || Store.mensalidades.getAll().find(
      m => m.alunoId === r.alunoId && m.tipo === 'reposicao' && m.status !== 'pago'
    );

    if (mens) {
      mens.status        = 'pago';
      mens.dataPagamento = Pages.Reposicoes._hojeStr();
      mens.formaPagamento= 'Reposicao concluida';
      Store.mensalidades.update(mens);
    }

    Utils.toast('Reposicao confirmada como concluida e debito quitado.');
    Modal.close();
    Router.go('reposicoes');
  },

  removeFalta(id) {
    if (!confirm('Remover este registro de falta?')) return;
    DB.set('faltas', DB.get('faltas').filter(f => f.id !== id));
    Utils.toast('Falta removida.', 'error');
    Router.go('reposicoes');
  },

  removeReposicao(id) {
    if (!confirm('Remover esta reposicao?')) return;
    Store.reposicoes.remove(id);
    Utils.toast('Reposicao removida.', 'error');
    Router.go('reposicoes');
  },

  salvarConfig() {
    const valor  = parseFloat(document.getElementById('cfgValorRep').value) || 50;
    const gratis = parseInt(document.getElementById('cfgGratis').value) || 1;
    localStorage.setItem('flow_valorReposicao', valor);
    localStorage.setItem('flow_reposicoesGratis', gratis);
    Pages.Reposicoes.VALOR_REPOSICAO = valor;
    Pages.Reposicoes.REPOSICOES_GRATIS_POR_SEMESTRE = gratis;
    Utils.toast('Configuracoes salvas.');
    Router.go('reposicoes');
  }
};
