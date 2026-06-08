Pages.Alunos = {
  filter:  '',
  tabAtual: 'todos',

  render() {
    if (!Auth.require()) return '';
    const alunos = Store.alunos.getAll();
    const cursos = Store.cursos.getAll();
    const tab    = Pages.Alunos.tabAtual;

    const cursoTabs = [{ id: 'todos', label: 'Todos' }, { id: 'ex-aluno', label: 'Ex-alunos' }]
      .concat(cursos.map(c => ({ id: 'curso_' + c.id, label: c.nome })));

    const tabsHTML = cursoTabs.map(t =>
      `<button class="tab ${tab === t.id ? 'active' : ''}" onclick="Pages.Alunos.setTab('${t.id}')">${t.label}</button>`
    ).join('');

    const filteredByTab = Pages.Alunos._applyTab(alunos, tab, cursos);
    const filtered      = Pages.Alunos._applyFilter(filteredByTab);

    return Layout.wrap('alunos', `
      <div class="page-header">
        <h1>Alunos</h1>
        <p>Gerenciamento de alunos matriculados</p>
      </div>
      <div class="section-hdr" style="margin-bottom:10px">
        <input type="text" id="searchAlunos" placeholder="Buscar por nome ou CPF..." style="max-width:260px" value="${Pages.Alunos.filter}" />
        <button class="btn btn-primary" id="novoAlunoBtn">${Utils.svgIcon('plus',14)} Novo Aluno</button>
      </div>
      <div class="tabs" style="margin-bottom:0">${tabsHTML}</div>
      <div class="table-wrap" style="border-top:none;border-radius:0 0 var(--radius) var(--radius)">
        <table>
          <thead><tr>
            <th>Aluno</th><th>Curso</th><th>Tipo</th><th>Modalidade</th><th>Celular</th><th>Status</th><th>Acoes</th>
          </tr></thead>
          <tbody id="alunosBody">${Pages.Alunos._buildRows(filtered, cursos)}</tbody>
        </table>
      </div>
    `);
  },

  setTab(tab) {
    Pages.Alunos.tabAtual = tab;
    Pages.Alunos.filter   = '';
    Router.go('alunos');
  },

  _applyTab(alunos, tab, cursos) {
    if (tab === 'todos')    return alunos.filter(a => a.status !== 'ex-aluno');
    if (tab === 'ex-aluno') return alunos.filter(a => a.status === 'ex-aluno');
    if (tab.startsWith('curso_')) {
      const cursoId = tab.replace('curso_', '');
      return alunos.filter(a => String(a.curso) === cursoId && a.status !== 'ex-aluno');
    }
    return alunos;
  },

  _applyFilter(alunos) {
    const q = Pages.Alunos.filter.toLowerCase().trim();
    if (!q) return alunos;
    const cpfQ = q.replace(/\D/g, '');
    return alunos.filter(a => {
      const nomeMatch = a.nome.toLowerCase().includes(q);
      const cpfMatch  = cpfQ && a.cpf && a.cpf.replace(/\D/g,'').includes(cpfQ);
      return nomeMatch || cpfMatch;
    });
  },

  _buildRows(filtered, cursos) {
    cursos = cursos || Store.cursos.getAll();
    if (!filtered.length) return `<tr><td colspan="7"><div class="empty-state">${Utils.svgIcon('users',32)}<br>Nenhum aluno encontrado.</div></td></tr>`;
    return filtered.map(a => {
      const c = cursos.find(x => String(x.id) === String(a.curso));
      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar" style="background:${Utils.avatarColor(a.nome)};color:#fff;font-size:12px">${Utils.initials(a.nome)}</div>
            <div>
              <div style="font-weight:600">${a.nome}</div>
              <div style="color:var(--text-muted);font-size:12px">${a.cpf || ''}</div>
            </div>
          </div>
        </td>
        <td>${c ? c.nome : '<span style="color:var(--text-muted)">-</span>'}</td>
        <td>${a.tipo || '-'}</td>
        <td>${a.estilo || '-'}</td>
        <td>${a.celular || '-'}</td>
        <td><span class="badge ${a.status === 'ativo' ? 'badge-green' : a.status === 'trancado' ? 'badge-yellow' : 'badge-gray'}">${a.status || 'ativo'}</span></td>
        <td>
          <div class="actions-row">
            <button class="btn btn-icon btn-sm" onclick="Pages.Alunos.openEdit(${a.id})" title="Editar">${Utils.svgIcon('edit',14)}</button>
            <button class="btn btn-icon btn-sm" onclick="Pages.Alunos.changeStatus(${a.id})" title="Alterar status">${Utils.svgIcon('check',14)}</button>
            <button class="btn btn-danger btn-sm" onclick="Pages.Alunos.remove(${a.id})" title="Remover">${Utils.svgIcon('trash',14)}</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  bind() {
    document.getElementById('novoAlunoBtn').addEventListener('click', () => Pages.Alunos.openForm());
    const si = document.getElementById('searchAlunos');
    if (si) si.addEventListener('input', e => {
      Pages.Alunos.filter = e.target.value;
      const all      = Store.alunos.getAll();
      const cursos   = Store.cursos.getAll();
      const byTab    = Pages.Alunos._applyTab(all, Pages.Alunos.tabAtual, cursos);
      const filtered = Pages.Alunos._applyFilter(byTab);
      document.getElementById('alunosBody').innerHTML = Pages.Alunos._buildRows(filtered, cursos);
    });
  },

  openForm(aluno) {
    const cursos    = Store.cursos.getAll();
    const cursoOpts = cursos.map(c =>
      `<option value="${c.id}" ${aluno && String(aluno.curso) === String(c.id) ? 'selected':''}>${c.nome}</option>`
    ).join('');

    Modal.show(`
      <div class="modal-header">
        <h2>${aluno ? 'Editar Aluno' : 'Matricular Aluno'}</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label>Nome completo *</label><input id="fNome" value="${aluno ? aluno.nome : ''}" placeholder="Nome do aluno" /></div>
          <div class="form-group"><label>CPF</label><input id="fCpf" value="${aluno ? aluno.cpf||'' : ''}" placeholder="000.000.000-00" maxlength="14" inputmode="numeric" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Data de Nascimento (dd/mm/aa)</label><input id="fNasc" value="${aluno ? aluno.dataNasc||'' : ''}" placeholder="dd/mm/aa" maxlength="8" inputmode="numeric" /></div>
          <div class="form-group"><label>E-mail</label><input id="fEmail" type="email" value="${aluno ? aluno.email||'' : ''}" placeholder="email@exemplo.com" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Celular</label><input id="fCelular" value="${aluno ? aluno.celular||'' : ''}" placeholder="(11) 90000-0000" maxlength="15" inputmode="numeric" /></div>
          <div class="form-group"><label>Endereco</label><input id="fEndereco" value="${aluno ? aluno.endereco||'' : ''}" placeholder="Rua, Numero" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Curso</label><select id="fCurso"><option value="">Selecione...</option>${cursoOpts}</select></div>
          <div class="form-group"><label>Tipo</label><select id="fTipo">
            <option value="VIP"   ${aluno && aluno.tipo === 'VIP'   ? 'selected':''}>VIP</option>
            <option value="Grupo" ${aluno && aluno.tipo === 'Grupo' ? 'selected':''}>Grupo</option>
          </select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Modalidade</label><select id="fEstilo">
            <option value="Presencial" ${!aluno || aluno.estilo === 'Presencial' ? 'selected':''}>Presencial</option>
            <option value="Online"     ${aluno && aluno.estilo === 'Online'     ? 'selected':''}>Online</option>
          </select></div>
          <div class="form-group"><label>Forma de Pagamento</label><select id="fPagamento">
            ${['Pix','Boleto','Cartao de Credito','Dinheiro'].map(p =>
              `<option value="${p}" ${aluno && aluno.pagamento === p ? 'selected':''}>${p}</option>`
            ).join('')}
          </select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Valor Mensalidade (R$)</label><input id="fValor" type="number" step="0.01" value="${aluno ? aluno.valorMensalidade||'' : ''}" placeholder="0,00" /></div>
          <div class="form-group"><label>Dia de Vencimento</label><input id="fVenc" type="number" min="1" max="31" value="${aluno ? aluno.diaVencimento||'' : ''}" placeholder="Ex: 10" /></div>
        </div>
        <div class="form-group"><label>Observacoes</label><textarea id="fObs" rows="2" placeholder="Notas adicionais...">${aluno ? aluno.obs||'' : ''}</textarea></div>
        <div id="alunoFormMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Alunos.save(${aluno ? aluno.id : 'null'})">${aluno ? 'Salvar alteracoes' : 'Matricular'}</button>
      </div>
    `);
    Utils.applyMask(document.getElementById('fCpf'),    'cpf');
    Utils.applyMask(document.getElementById('fCelular'),'phone');
    Utils.applyMask(document.getElementById('fNasc'),   'date');
  },

  openEdit(id) {
    const a = Store.alunos.find(id);
    if (a) Pages.Alunos.openForm(a);
  },

  save(id) {
    const nome = document.getElementById('fNome').value.trim();
    if (!nome) { document.getElementById('alunoFormMsg').innerHTML = `<div class="error-msg">O nome e obrigatorio.</div>`; return; }
    const data = {
      nome,
      cpf:              document.getElementById('fCpf').value.trim(),
      dataNasc:         Utils.parseDateFromMask(document.getElementById('fNasc').value.trim()),
      email:            document.getElementById('fEmail').value.trim(),
      celular:          document.getElementById('fCelular').value.trim(),
      endereco:         document.getElementById('fEndereco').value.trim(),
      curso:            document.getElementById('fCurso').value,
      tipo:             document.getElementById('fTipo').value,
      estilo:           document.getElementById('fEstilo').value,
      pagamento:        document.getElementById('fPagamento').value,
      valorMensalidade: parseFloat(document.getElementById('fValor').value) || 0,
      diaVencimento:    parseInt(document.getElementById('fVenc').value) || 10,
      obs:              document.getElementById('fObs').value.trim(),
    };
    if (id) {
      const aluno = Store.alunos.find(id);
      Object.assign(aluno, data);
      aluno.status = aluno.status || 'ativo';
      Store.alunos.update(aluno);
      Utils.toast('Aluno atualizado com sucesso.');
    } else {
      data.status = 'ativo';
      const novo  = Store.alunos.add(data);
      Pages.Mensalidades.gerarParaAluno(novo);
      Utils.toast('Aluno matriculado com sucesso.');
    }
    Modal.close();
    Pages.Alunos.filter = '';
    Router.go('alunos');
  },

  changeStatus(id) {
    const aluno = Store.alunos.find(id);
    if (!aluno) return;
    const opts = [
      { val:'ativo',    label:'Ativo',    badge:'badge-green',  desc:'Reativar matricula' },
      { val:'trancado', label:'Trancado', badge:'badge-yellow', desc:'Trancar matricula' },
      { val:'ex-aluno', label:'Ex-aluno', badge:'badge-gray',   desc:'Encerrar como ex-aluno' },
    ].filter(s => s.val !== aluno.status);

    Modal.show(`
      <div class="modal-header">
        <h2>Alterar Status</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:4px">Aluno: <strong>${aluno.nome}</strong></p>
        <p style="color:var(--text-muted);font-size:12px;margin-bottom:18px">
          Status atual: <span class="badge ${aluno.status==='ativo'?'badge-green':aluno.status==='trancado'?'badge-yellow':'badge-gray'}">${aluno.status}</span>
        </p>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${opts.map(s => `
            <button class="btn btn-ghost" style="justify-content:flex-start;gap:10px" onclick="Pages.Alunos.setStatus(${id},'${s.val}')">
              <span class="badge ${s.badge}">${s.label}</span> ${s.desc}
            </button>`).join('')}
        </div>
      </div>
    `);
  },

  setStatus(id, status) {
    const aluno = Store.alunos.find(id);
    if (!aluno) return;
    aluno.status = status;
    Store.alunos.update(aluno);
    if (status === 'trancado' || status === 'ex-aluno') {
      Store.mensalidades.getAll()
        .filter(m => m.alunoId === id && m.status !== 'pago')
        .forEach(m => { m.suspensa = true; Store.mensalidades.update(m); });
    }
    Utils.toast(`Status alterado para "${status}".`);
    Modal.close();
    Router.go('alunos');
  },

  remove(id) {
    if (!confirm('Remover este aluno permanentemente?')) return;
    Store.alunos.remove(id);
    Store.mensalidades.save(Store.mensalidades.getAll().filter(m => m.alunoId !== id));
    Utils.toast('Aluno removido.', 'error');
    Router.go('alunos');
  }
};
